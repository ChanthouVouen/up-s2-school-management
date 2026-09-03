import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { getOrCreateRole } from '../utils/roles';
import { ApplicationStatus, StudentStatus, PaymentStatus } from '../types/enums';

function applicationCode(id: number, createdAt: Date) {
  return `APP-${createdAt.getFullYear()}-${String(id).padStart(4, '0')}`;
}

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

  const application = await prisma.application.update({
    where: { id },
    data: {
      status,
      approvalResult: approvalResult?.trim() || (status === ApplicationStatus.SCHOOL_APPROVED || status === ApplicationStatus.APPROVED ? 'Approved by school admissions.' : undefined),
    },
  });
  await prisma.activityLog.create({
    data: {
      title: `Application ${status === ApplicationStatus.APPROVED ? 'Approved' : 'Rejected'}`,
      description: `${application.applicantName}'s application status changed to ${status}.`,
      type: 'APPLICATION',
    },
  });

  res.json({ ...application, applicationCode: applicationCode(application.id, application.createdAt) });
});
