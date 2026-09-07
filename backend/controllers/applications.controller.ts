import { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApplicationStatus } from '../types/enums';
import {
  createApplicationRecord,
  createPublicApplication,
  findApplicationById,
  listApplications,
  reapplyApplicationRecord,
  updateApplicationStatusRecord,
  getStudentProfileForUser,
} from '../services/application.service';

export const getApplications: RequestHandler = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const searchText = typeof search === 'string' ? search.trim() : '';

  const applications = await listApplications(searchText, typeof status === 'string' ? status : undefined);
  res.json({ data: applications });
});

export const getApplicationById: RequestHandler = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid application ID' });
    return;
  }

  const application = await findApplicationById(id);
  if (!application) {
    res.status(404).json({ message: 'Application not found' });
    return;
  }

  res.json(application);
});

export const createApplication: RequestHandler = asyncHandler(async (req, res) => {
  const { applicantName, email, program, studentId, partnerSchoolId, responsibleStaffId,
    scholarshipRequested, scholarshipDetails, notes, applicationDate } = req.body;

  try {
    const application = await createApplicationRecord({
      applicantName,
      email,
      program,
      studentId,
      partnerSchoolId,
      responsibleStaffId,
      scholarshipRequested,
      scholarshipDetails,
      notes,
      applicationDate,
      actorUserId: req.user?.id,
    });

    res.status(201).json(application);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Unable to create application' });
  }
});

// POST /applications/public - Guest self-service admission application (no auth).
// Immediately provisions a STUDENT-role portal account so the applicant can
// log in, track status, submit documents, and pay fees while under review.
export const applyPublic: RequestHandler = asyncHandler(async (req, res) => {
  const {
    applicantName, email, phone, dob, program, partnerSchoolId,
    scholarshipRequested, scholarshipTrack, specialCode, scholarshipDetails, notes,
  } = req.body;

  try {
    const result = await createPublicApplication({
      applicantName,
      email,
      phone,
      dob,
      program,
      partnerSchoolId,
      scholarshipRequested,
      scholarshipTrack,
      specialCode,
      scholarshipDetails,
      notes,
    });

    res.status(201).json(result);
  } catch (error: any) {
    const statusCode = error.message?.includes('already exists') ? 409 : 400;
    res.status(statusCode).json({ message: error.message || 'Unable to submit application' });
  }
});

// POST /applications/reapply - A logged-in student whose latest application was rejected can submit a new
// one from their own portal, without needing a fresh account (the public /apply form blocks re-use of an
// email that already has a portal account).
export const reapplyApplication: RequestHandler = asyncHandler(async (req, res) => {
  const student = await getStudentProfileForUser(req.user!.id);
  if (!student) {
    res.status(404).json({ message: 'No student profile linked to this account' });
    return;
  }

  try {
    const application = await reapplyApplicationRecord(student.id, req.body);
    res.status(201).json(application);
  } catch (error: any) {
    const statusCode = error.message === 'No student profile linked to this account' ? 404 : 400;
    res.status(statusCode).json({ message: error.message || 'Unable to reapply' });
  }
});

export const updateApplicationStatus: RequestHandler = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { status, approvalResult } = req.body;

  try {
    const application = await updateApplicationStatusRecord(
      id,
      status,
      approvalResult,
      (req as any).user?.name || 'Admissions staff'
    );

    res.json(application);
  } catch (error: any) {
    const message = error.message || 'Unable to update application status';
    if (message.includes('Application not found')) {
      res.status(404).json({ message });
      return;
    }

    res.status(400).json({ message });
  }
});
