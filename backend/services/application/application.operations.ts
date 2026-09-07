import bcrypt from 'bcryptjs';

import prisma from '../../lib/prisma';
import { BASE_TUITION_FEE } from '../../constants/fees';
import { ApplicationStatus, PaymentStatus, PaymentTxnStatus, StudentStatus } from '../../types/enums';
import { getOrCreateRole } from '../../utils/roles';
import { getStudentForUser } from '../../utils/resolveStudent';
import { applicationCode, generateTempPassword, TERMINAL_APPLICATION_STATUSES } from './application.utils';
import { resolveScholarshipDiscount } from './application.scholarship';

export async function createApplicationRecord(payload: {
  applicantName: string;
  email: string;
  program: string;
  studentId?: number | null;
  partnerSchoolId?: number | null;
  responsibleStaffId?: string | null;
  scholarshipRequested?: boolean;
  scholarshipDetails?: string | null;
  notes?: string | null;
  applicationDate?: string | Date | null;
  actorUserId?: string | null;
}) {
  if (!payload.applicantName?.trim() || !payload.email?.trim() || !payload.program?.trim()) {
    throw new Error('Applicant name, email, and program are required');
  }

  if (Boolean(payload.scholarshipRequested)) {
    if (payload.studentId) {
      const existingStudent = await prisma.student.findUnique({
        where: { id: Number(payload.studentId) },
        include: { histories: { where: { action: 'SCHOLARSHIP_AWARDED' } } },
      });

      if (existingStudent && (existingStudent.partnerSchoolId || existingStudent.histories.length > 0)) {
        throw new Error('This student already has an active scholarship. Only one scholarship per student is permitted.');
      }
    }

    const existingAppWithScholarship = await prisma.application.findFirst({
      where: {
        email: payload.email.trim().toLowerCase(),
        scholarshipRequested: true,
      },
    });

    if (existingAppWithScholarship) {
      throw new Error('An application with a scholarship has already been submitted for this applicant. Each applicant can apply for only one scholarship.');
    }
  }

  const application = await prisma.application.create({
    data: {
      applicantName: payload.applicantName.trim(),
      email: payload.email.trim(),
      program: payload.program.trim(),
      studentId: payload.studentId ? Number(payload.studentId) : null,
      partnerSchoolId: payload.partnerSchoolId ? Number(payload.partnerSchoolId) : null,
      responsibleStaffId: payload.responsibleStaffId || payload.actorUserId || null,
      scholarshipRequested: Boolean(payload.scholarshipRequested),
      scholarshipDetails: payload.scholarshipDetails?.trim() || null,
      notes: payload.notes?.trim() || null,
      applicationDate: payload.applicationDate ? new Date(payload.applicationDate) : undefined,
    },
  });

  await prisma.activityLog.create({
    data: {
      title: 'New Application Received',
      description: `${application.applicantName} submitted an application for ${application.program}.`,
      type: 'APPLICATION',
    },
  });

  return { ...application, applicationCode: applicationCode(application.id, application.createdAt) };
}

export async function createPublicApplication(payload: {
  applicantName: string;
  email: string;
  phone?: string;
  dob?: string | Date | null;
  program: string;
  partnerSchoolId?: number | null;
  scholarshipRequested?: boolean;
  scholarshipTrack?: string;
  specialCode?: string;
  scholarshipDetails?: string | null;
  notes?: string | null;
}) {
  const applicantName = payload.applicantName?.trim();
  const program = payload.program?.trim();
  const email = payload.email?.trim();

  if (!applicantName || !email || !program) {
    throw new Error('Full name, email, and desired program are required');
  }

  const normalizedEmail = email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new Error('An account with this email already exists. Please log in to your student portal instead.');
  }

  if (Boolean(payload.scholarshipRequested)) {
    const existingAppWithScholarship = await prisma.application.findFirst({
      where: {
        email: normalizedEmail,
        scholarshipRequested: true,
      },
    });

    if (existingAppWithScholarship) {
      throw new Error('An application with a scholarship has already been submitted for this email. Each student can apply for only one scholarship.');
    }
  }

  const year = new Date().getFullYear();
  const studentCount = await prisma.student.count();
  const studentCode = `STU-${year}-${(studentCount + 1).toString().padStart(3, '0')}`;

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);
  const studentRole = await getOrCreateRole('STUDENT');

  const user = await prisma.user.create({
    data: {
      name: applicantName,
      email: normalizedEmail,
      password: hashedPassword,
      roleId: studentRole.id,
    },
  });

  const resolvedPartnerSchoolId = payload.partnerSchoolId ? Number(payload.partnerSchoolId) : null;

  let resolvedDiscountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | null = null;
  let resolvedDiscountValue: number | null = null;

  if (Boolean(payload.scholarshipRequested)) {
    const resolved = await resolveScholarshipDiscount(String(payload.scholarshipTrack || '').toUpperCase(), {
      partnerSchoolId: resolvedPartnerSchoolId,
      specialCode: payload.specialCode,
    });
    resolvedDiscountType = resolved.discountType;
    resolvedDiscountValue = resolved.discountValue;
  }

  const student = await prisma.student.create({
    data: {
      studentCode,
      name: applicantName,
      email: normalizedEmail,
      phone: payload.phone?.trim() || null,
      dob: payload.dob ? new Date(payload.dob) : null,
      status: StudentStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      userId: user.id,
      partnerSchoolId: resolvedPartnerSchoolId,
      histories: {
        create: {
          action: 'APPLICATION_SUBMITTED',
          description: `Applied online for the ${program} program.`,
          performedBy: 'Self (online application)',
        },
      },
    },
  });

  const application = await prisma.application.create({
    data: {
      applicantName,
      email: normalizedEmail,
      program,
      studentId: student.id,
      partnerSchoolId: resolvedPartnerSchoolId,
      status: ApplicationStatus.APPLICATION_SUBMITTED,
      scholarshipRequested: Boolean(payload.scholarshipRequested),
      scholarshipDetails: payload.scholarshipDetails?.trim() || null,
      discountType: resolvedDiscountType,
      discountValue: resolvedDiscountValue,
      notes: payload.notes?.trim() || null,
    },
  });

  await prisma.activityLog.create({
    data: {
      title: 'New Application Received',
      description: `${application.applicantName} applied online for ${application.program}.`,
      type: 'APPLICATION',
    },
  });

  return {
    applicationCode: applicationCode(application.id, application.createdAt),
    studentCode: student.studentCode,
    credentials: { email: normalizedEmail, tempPassword },
  };
}

export async function reapplyApplicationRecord(studentId: number, payload: {
  program: string;
  partnerSchoolId?: number | null;
  scholarshipRequested?: boolean;
  scholarshipTrack?: string;
  specialCode?: string;
  scholarshipDetails?: string | null;
  notes?: string | null;
}) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    throw new Error('No student profile linked to this account');
  }

  const latestApplication = await prisma.application.findFirst({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
  });

  if (!latestApplication || latestApplication.status !== ApplicationStatus.REJECTED) {
    throw new Error('You can only submit a new application after your latest one has been rejected.');
  }

  if (!payload.program?.trim()) {
    throw new Error('Desired program is required');
  }

  const resolvedPartnerSchoolId = payload.partnerSchoolId ? Number(payload.partnerSchoolId) : null;

  let resolvedDiscountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | null = null;
  let resolvedDiscountValue: number | null = null;

  if (Boolean(payload.scholarshipRequested)) {
    const resolved = await resolveScholarshipDiscount(String(payload.scholarshipTrack || '').toUpperCase(), {
      partnerSchoolId: resolvedPartnerSchoolId,
      specialCode: payload.specialCode,
    });
    resolvedDiscountType = resolved.discountType;
    resolvedDiscountValue = resolved.discountValue;
  }

  const application = await prisma.application.create({
    data: {
      applicantName: student.name,
      email: student.email || '',
      program: payload.program.trim(),
      studentId: student.id,
      partnerSchoolId: resolvedPartnerSchoolId,
      status: ApplicationStatus.APPLICATION_SUBMITTED,
      scholarshipRequested: Boolean(payload.scholarshipRequested),
      scholarshipDetails: payload.scholarshipDetails?.trim() || null,
      discountType: resolvedDiscountType,
      discountValue: resolvedDiscountValue,
      notes: payload.notes?.trim() || null,
    },
  });

  await prisma.student.update({
    where: { id: student.id },
    data: { status: StudentStatus.PENDING, partnerSchoolId: resolvedPartnerSchoolId },
  });

  await prisma.studentHistory.create({
    data: {
      studentId: student.id,
      action: 'APPLICATION_SUBMITTED',
      description: `Resubmitted a new application for the ${application.program} program after a previous rejection.`,
      performedBy: 'Self (student portal)',
    },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Application Resubmitted',
      description: `${student.name} resubmitted an application for ${application.program}.`,
      type: 'APPLICATION',
    },
  });

  return { ...application, applicationCode: applicationCode(application.id, application.createdAt) };
}

export async function updateApplicationStatusRecord(
  id: number,
  status: ApplicationStatus,
  approvalResult?: string,
  performedBy: string = 'Admissions staff'
) {
  if (!Number.isInteger(id) || !Object.values(ApplicationStatus).includes(status)) {
    throw new Error('A valid application ID and status are required');
  }

  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Application not found');
  }

  if (TERMINAL_APPLICATION_STATUSES.includes(existing.status)) {
    throw new Error('This application already has a final decision recorded and cannot be changed here.');
  }

  const isApproval = status === ApplicationStatus.SCHOOL_APPROVED || status === ApplicationStatus.APPROVED;
  const isRejection = status === ApplicationStatus.REJECTED;

  const application = await prisma.application.update({
    where: { id },
    data: {
      status,
      approvalResult: approvalResult?.trim()
        || (isApproval ? 'Approved by school admissions.' : isRejection ? 'Rejected by school admissions.' : undefined),
    },
  });

  let effectiveDiscountType = application.discountType;
  let effectiveDiscountValue = application.discountValue;

  if (application.studentId && isApproval) {
    if (effectiveDiscountValue == null && application.scholarshipRequested && application.partnerSchoolId) {
      const activeMou = await prisma.mou.findFirst({
        where: { partnerSchoolId: application.partnerSchoolId, status: 'ACTIVE' },
      });

      if (activeMou) {
        effectiveDiscountType = activeMou.discountType;
        effectiveDiscountValue = activeMou.discountValue;

        await prisma.application.update({
          where: { id: application.id },
          data: { discountType: effectiveDiscountType, discountValue: effectiveDiscountValue },
        });

        await prisma.studentHistory.create({
          data: {
            studentId: application.studentId,
            action: 'SCHOLARSHIP_AWARDED',
            description: `🏫 MOU Partner School discount applied automatically on approval: ${effectiveDiscountValue}${effectiveDiscountType === 'FIXED_AMOUNT' ? '$' : '%'} Tuition Reduction.`,
            performedBy,
          },
        });
      }
    }

    const discountAmount = effectiveDiscountValue
      ? effectiveDiscountType === 'FIXED_AMOUNT'
        ? effectiveDiscountValue
        : (BASE_TUITION_FEE * effectiveDiscountValue) / 100
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

  return {
    ...application,
    discountType: effectiveDiscountType,
    discountValue: effectiveDiscountValue,
    applicationCode: applicationCode(application.id, application.createdAt),
  };
}

export async function getStudentProfileForUser(userId: string) {
  return getStudentForUser(userId);
}
