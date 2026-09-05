import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { saveBase64File } from '../utils/saveBase64File';
import { getStudentForUser } from '../utils/resolveStudent';
import { DocumentStatus, DocumentType } from '../types/enums';

// GET /documents/mine - The logged-in student's own submitted documents
export const getMyDocuments: RequestHandler = asyncHandler(async (req, res) => {
  const student = await getStudentForUser(req.user!.id);
  if (!student) {
    res.status(404).json({ message: 'No student profile linked to this account' });
    return;
  }

  const documents = await prisma.document.findMany({
    where: { studentId: student.id },
    orderBy: { uploadedAt: 'desc' },
  });

  res.json({ data: documents });
});

// POST /documents/mine - Student submits a document for review
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

  let saved: { url: string; filename: string; mimeType: string; size: number };
  try {
    saved = saveBase64File(file, 'documents', `doc-${student.studentCode}`);
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
      fileName: saved.filename,
      fileUrl: saved.url,
      fileType: saved.mimeType,
      fileSize: saved.size,
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
