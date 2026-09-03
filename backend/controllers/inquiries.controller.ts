import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { getStudentForUser } from '../utils/resolveStudent';
import { InquiryStatus } from '../types/enums';

function validateContact(body: any) {
  const { name, email, subject, message } = body;
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return null;
  }
  return { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() };
}

// POST /inquiries/public - Guest "Contact Us" submission from the welcome page (no auth)
export const createPublicInquiry: RequestHandler = asyncHandler(async (req, res) => {
  const parsed = validateContact(req.body);
  if (!parsed) {
    res.status(400).json({ message: 'Name, email, subject, and message are required' });
    return;
  }

  const inquiry = await prisma.inquiry.create({ data: parsed });

  await prisma.activityLog.create({
    data: {
      title: 'New Inquiry Received',
      description: `${inquiry.name} sent a message: "${inquiry.subject}".`,
      type: 'SYSTEM',
    },
  });

  res.status(201).json({ message: 'Thanks for reaching out — our admissions team will get back to you shortly.', id: inquiry.id });
});

// POST /inquiries - Logged-in student submits an information request
export const createInquiry: RequestHandler = asyncHandler(async (req, res) => {
  const student = await getStudentForUser(req.user!.id);
  if (!student) {
    res.status(404).json({ message: 'No student profile linked to this account' });
    return;
  }

  const parsed = validateContact({ name: student.name, email: student.email || req.body.email, ...req.body });
  if (!parsed) {
    res.status(400).json({ message: 'Subject and message are required' });
    return;
  }

  const inquiry = await prisma.inquiry.create({
    data: { ...parsed, studentId: student.id },
  });

  res.status(201).json(inquiry);
});

// GET /inquiries/mine - The logged-in student's own requests + admin responses
export const getMyInquiries: RequestHandler = asyncHandler(async (req, res) => {
  const student = await getStudentForUser(req.user!.id);
  if (!student) {
    res.status(404).json({ message: 'No student profile linked to this account' });
    return;
  }

  const inquiries = await prisma.inquiry.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ data: inquiries });
});

// GET /inquiries - Admin/staff: list all inquiries
export const getInquiries: RequestHandler = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const where: any = {};
  if (status && Object.values(InquiryStatus).includes(status as InquiryStatus)) {
    where.status = status;
  }

  const inquiries = await prisma.inquiry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { student: { select: { id: true, studentCode: true, name: true } } },
  });

  res.json({ data: inquiries });
});

// PATCH /inquiries/:id - Admin/staff responds to and/or updates the status of an inquiry
export const respondToInquiry: RequestHandler = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { status, response } = req.body;

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid inquiry ID' });
    return;
  }
  if (status && !Object.values(InquiryStatus).includes(status)) {
    res.status(400).json({ message: 'Invalid status' });
    return;
  }

  const inquiry = await prisma.inquiry.update({
    where: { id },
    data: {
      response: response !== undefined ? (response?.trim() || null) : undefined,
      status: status || (response ? InquiryStatus.RESOLVED : undefined),
    },
  });

  res.json(inquiry);
});
