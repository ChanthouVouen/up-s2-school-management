import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { saveBase64File } from '../utils/saveBase64File';
import { getStudentForUser } from '../utils/resolveStudent';
import { DocumentStatus, DocumentType } from '../types/enums';

// GET /documents - Admin/staff: list all submitted documents for review
export const getDocuments: RequestHandler = asyncHandler(async (req, res) => {
  const { status, studentId } = req.query;
  const where: any = {};

  if (status && Object.values(DocumentStatus).includes(status as DocumentStatus)) {
    where.status = status;
  }
  if (studentId) {
    where.studentId = Number(studentId);
  }

  const documents = await prisma.document.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { student: { select: { id: true, studentCode: true, name: true, email: true } } },
  });

  res.json({ data: documents });
});

// GET /documents/mine - The logged-in student's own submitted documents
export const getMyDocuments: RequestHandler = asyncHandler(async (req, res) => {
  const student = await getStudentForUser(req.user!.id);
  if (!student) {
    res.status(404).json({ message: 'No student profile linked to this account' });
    return;
  }

  const documents = await prisma.document.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ data: documents });
});

// POST /documents - Student submits a document for review
export const createDocument: RequestHandler = asyncHandler(async (req, res) => {
  const student = await getStudentForUser(req.user!.id);
  if (!student) {
    res.status(404).json({ message: 'No student profile linked to this account' });
    return;
  }

  const { title, type, file } = req.body;
  if (!title?.trim() || !file) {
    res.status(400).json({ message: 'Document title and file are required' });
    return;
  }

  let fileUrl: string;
  try {
    fileUrl = saveBase64File(file, 'documents', `doc-${student.studentCode}`).url;
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Invalid file' });
    return;
  }

  const document = await prisma.document.create({
    data: {
      title: title.trim(),
      type: type && Object.values(DocumentType).includes(type) ? type : DocumentType.OTHER,
      status: DocumentStatus.PENDING,
      studentId: student.id,
      fileUrl,
    },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Document Submitted',
      description: `${student.name} submitted "${document.title}" for review.`,
      type: 'DOCUMENT',
    },
  });

  res.status(201).json(document);
});

// PATCH /documents/:id/status - Admin/staff verifies or rejects a document
export const updateDocumentStatus: RequestHandler = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(id) || !Object.values(DocumentStatus).includes(status)) {
    res.status(400).json({ message: 'A valid document ID and status are required' });
    return;
  }

  const document = await prisma.document.update({
    where: { id },
    data: { status },
    include: { student: { select: { name: true, studentCode: true } } },
  });

  await prisma.activityLog.create({
    data: {
      title: `Document ${status === DocumentStatus.VERIFIED ? 'Verified' : status === DocumentStatus.REJECTED ? 'Rejected' : 'Updated'}`,
      description: `"${document.title}" for ${document.student?.name ?? 'a student'} was marked ${status}.`,
      type: 'DOCUMENT',
    },
  });

  res.json(document);
});
