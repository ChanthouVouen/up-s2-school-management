import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { getOrCreateRole } from '../utils/roles';
import { ApplicationStatus, StudentStatus, PaymentStatus, PaymentTxnStatus } from '../types/enums';
import { BASE_TUITION_FEE } from '../constants/fees';

function applicationCode(id: number, createdAt: Date) {
  return `APP-${createdAt.getFullYear()}-${String(id).padStart(4, '0')}`;
}

// Once an application reaches one of these, the decision is final and can't be changed via updateApplicationStatus.
const TERMINAL_APPLICATION_STATUSES: string[] = [
  ApplicationStatus.SCHOOL_APPROVED,
  ApplicationStatus.APPROVED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.ENROLLED,
];

function generateTempPassword() {
  return crypto.randomBytes(6).toString('base64url');
}

export const getApplications: RequestHandler = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const searchText = typeof search === 'string' ? search.trim() : '';
  const where: any = {};

  if (searchText) {
    where.OR = [
      { applicantName: { contains: searchText } },
      { email: { contains: searchText } },
      { program: { contains: searchText } },
    ];
  }
  if (status && Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
    where.status = status;
  }

  const applications = await prisma.application.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      student: { select: { id: true, studentCode: true, name: true, email: true } },
      partnerSchool: { select: { id: true, name: true, city: true } },
      responsibleStaff: { select: { id: true, name: true, email: true } },
    },
  });

  res.json({
    data: applications.map((application) => ({
      ...application,
      applicationCode: applicationCode(application.id, application.createdAt),
    })),
  });
});

export const getApplicationById: RequestHandler = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid application ID' });
    return;
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      student: true,
      partnerSchool: true,
      responsibleStaff: { select: { id: true, name: true, email: true } },
    },
  });
  if (!application) {
    res.status(404).json({ message: 'Application not found' });
    return;
  }

  res.json({ ...application, applicationCode: applicationCode(application.id, application.createdAt) });
});

export const createApplication: RequestHandler = asyncHandler(async (req, res) => {
  const { applicantName, email, program, studentId, partnerSchoolId, responsibleStaffId,
    scholarshipRequested, scholarshipDetails, notes, applicationDate } = req.body;
  if (!applicantName?.trim() || !email?.trim() || !program?.trim()) {
    res.status(400).json({ message: 'Applicant name, email, and program are required' });
    return;
  }

  // Strict Rule: One student can apply for only one scholarship
  if (Boolean(scholarshipRequested)) {
    if (studentId) {
      const existingStudent = await prisma.student.findUnique({
        where: { id: Number(studentId) },
        include: { histories: { where: { action: 'SCHOLARSHIP_AWARDED' } } },
      });
      if (existingStudent && (existingStudent.partnerSchoolId || existingStudent.histories.length > 0)) {
        res.status(400).json({
          message: 'This student already has an active scholarship. Only one scholarship per student is permitted.',
        });
        return;
      }
    }

    const existingAppWithScholarship = await prisma.application.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        scholarshipRequested: true,
      },
    });
    if (existingAppWithScholarship) {
      res.status(400).json({
        message: 'An application with a scholarship has already been submitted for this applicant. Each applicant can apply for only one scholarship.',
      });
      return;
    }
  }

  const application = await prisma.application.create({
    data: {
      applicantName: applicantName.trim(),
      email: email.trim(),
      program: program.trim(),
      studentId: studentId ? Number(studentId) : null,
      partnerSchoolId: partnerSchoolId ? Number(partnerSchoolId) : null,
      responsibleStaffId: responsibleStaffId || req.user?.id || null,
      scholarshipRequested: Boolean(scholarshipRequested),
      scholarshipDetails: scholarshipDetails?.trim() || null,
      notes: notes?.trim() || null,
      applicationDate: applicationDate ? new Date(applicationDate) : undefined,
    },
  });

  await prisma.activityLog.create({
    data: {
      title: 'New Application Received',
      description: `${application.applicantName} submitted an application for ${application.program}.`,
      type: 'APPLICATION',
    },
  });

  res.status(201).json({ ...application, applicationCode: applicationCode(application.id, application.createdAt) });
});

// POST /applications/public - Guest self-service admission application (no auth).
// Immediately provisions a STUDENT-role portal account so the applicant can
// log in, track status, submit documents, and pay fees while under review.
export const applyPublic: RequestHandler = asyncHandler(async (req, res) => {
  const { applicantName, email, phone, dob, program, partnerSchoolId, scholarshipRequested, scholarshipDetails, notes } = req.body;
  if (!applicantName?.trim() || !email?.trim() || !program?.trim()) {
    res.status(400).json({ message: 'Full name, email, and desired program are required' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    res.status(409).json({ message: 'An account with this email already exists. Please log in to your student portal instead.' });
    return;
  }

  // Strict Rule: One student can apply for only one scholarship
  if (Boolean(scholarshipRequested)) {
    const existingAppWithScholarship = await prisma.application.findFirst({
      where: {
        email: normalizedEmail,
        scholarshipRequested: true,
      },
    });
    if (existingAppWithScholarship) {
      res.status(400).json({
        message: 'An application with a scholarship has already been submitted for this email. Each student can apply for only one scholarship.',
      });
      return;
    }
  }

  const year = new Date().getFullYear();
  const studentCount = await prisma.student.count();
  const studentCode = `STU-${year}-${(studentCount + 1).toString().padStart(3, '0')}`;

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);
  const studentRole = await getOrCreateRole('STUDENT');

  const user = await prisma.user.create({
    data: { name: applicantName.trim(), email: normalizedEmail, password: hashedPassword, roleId: studentRole.id },
  });

  const resolvedPartnerSchoolId = partnerSchoolId ? Number(partnerSchoolId) : null;

  const student = await prisma.student.create({
    data: {
      studentCode,
      name: applicantName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      dob: dob ? new Date(dob) : null,
      status: StudentStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      userId: user.id,
      partnerSchoolId: resolvedPartnerSchoolId,
      histories: {
        create: {
          action: 'APPLICATION_SUBMITTED',
          description: `Applied online for the ${program.trim()} program.`,
          performedBy: 'Self (online application)',
        },
      },
    },
  });

  const application = await prisma.application.create({
    data: {
      applicantName: applicantName.trim(),
      email: normalizedEmail,
      program: program.trim(),
      studentId: student.id,
      partnerSchoolId: resolvedPartnerSchoolId,
      status: ApplicationStatus.APPLICATION_SUBMITTED,
      scholarshipRequested: Boolean(scholarshipRequested),
      scholarshipDetails: scholarshipDetails?.trim() || null,
      notes: notes?.trim() || null,
    },
  });

  await prisma.activityLog.create({
    data: {
      title: 'New Application Received',
      description: `${application.applicantName} applied online for ${application.program}.`,
      type: 'APPLICATION',
    },
  });

  res.status(201).json({
    applicationCode: applicationCode(application.id, application.createdAt),
    studentCode: student.studentCode,
    credentials: { email: normalizedEmail, tempPassword },
  });
});

export const updateApplicationStatus: RequestHandler = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { status, approvalResult } = req.body;
  if (!Number.isInteger(id) || !Object.values(ApplicationStatus).includes(status)) {
    res.status(400).json({ message: 'A valid application ID and status are required' });
    return;
  }

  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ message: 'Application not found' });
    return;
  }
  if (TERMINAL_APPLICATION_STATUSES.includes(existing.status)) {
    res.status(400).json({ message: 'This application already has a final decision recorded and cannot be changed here.' });
    return;
  }

  const isApproval = status === ApplicationStatus.SCHOOL_APPROVED || status === ApplicationStatus.APPROVED;
  const isRejection = status === ApplicationStatus.REJECTED;
  const performedBy = (req as any).user?.name || 'Admissions staff';

  const application = await prisma.application.update({
    where: { id },
    data: {
      status,
      approvalResult: approvalResult?.trim()
        || (isApproval ? 'Approved by school admissions.' : isRejection ? 'Rejected by school admissions.' : undefined),
    },
  });

  if (application.studentId && isApproval) {
    const discountAmount = application.discountValue
      ? application.discountType === 'FIXED_AMOUNT'
        ? application.discountValue
        : (BASE_TUITION_FEE * application.discountValue) / 100
      : 0;
    const amountDue = Math.max(0, BASE_TUITION_FEE - discountAmount);

    await prisma.student.update({
      where: { id: application.studentId },
      data: {
        status: StudentStatus.ENROLLED,
        paymentStatus: amountDue === 0 ? PaymentStatus.PAID : PaymentStatus.UNPAID,
      },
    });

    const existingInvoice = await prisma.payment.findFirst({
      where: { reference: { startsWith: `INV-${application.id}-` } },
    });
    if (!existingInvoice) {
      const discountNote = discountAmount > 0 ? ` minus a $${discountAmount.toFixed(2)} scholarship discount` : '';
      await prisma.payment.create({
        data: {
          reference: `INV-${application.id}-${Date.now()}`,
          studentId: application.studentId,
          amount: amountDue,
          method: 'INVOICE',
          status: amountDue === 0 ? PaymentTxnStatus.COMPLETED : PaymentTxnStatus.PENDING,
          description: `Tuition for ${application.program}: $${BASE_TUITION_FEE.toFixed(2)}${discountNote} = $${amountDue.toFixed(2)} due.`,
        },
      });
    }

    await prisma.studentHistory.create({
      data: {
        studentId: application.studentId,
        action: 'APPLICATION_APPROVED',
        description: `Application for ${application.program} was approved. ${amountDue === 0 ? 'Full scholarship waiver applied — no balance due.' : `Tuition balance of $${amountDue.toFixed(2)} is due.`}`,
        performedBy,
      },
    });
  } else if (application.studentId && isRejection) {
    await prisma.studentHistory.create({
      data: {
        studentId: application.studentId,
        action: 'APPLICATION_REJECTED',
        description: `Application for ${application.program} was rejected.`,
        performedBy,
      },
    });
  }

  await prisma.activityLog.create({
    data: {
      title: `Application ${isRejection ? 'Rejected' : isApproval ? 'Approved' : 'Updated'}`,
      description: `${application.applicantName}'s application status changed to ${status}.`,
      type: 'APPLICATION',
    },
  });

  res.json({ ...application, applicationCode: applicationCode(application.id, application.createdAt) });
});
