import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApplicationStatus } from '../types/enums';

function applicationCode(id: number, createdAt: Date) {
  return `APP-${createdAt.getFullYear()}-${String(id).padStart(4, '0')}`;
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
