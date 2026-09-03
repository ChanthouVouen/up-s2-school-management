import { RequestHandler } from 'express';
import fs from 'fs/promises';
import path from 'path';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { DocumentStatus, DocumentType } from '../types/enums';

const documentInclude = {
  student: { select: { id: true, studentCode: true, name: true } },
} as const;

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const getDocuments: RequestHandler = asyncHandler(async (req, res) => {
  const { search, status, type, page = '1', limit = '10' } = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
  const where: any = {};

  if (search && String(search).trim()) {
    const value = String(search).trim();
    where.OR = [{ title: { contains: value } }, { fileName: { contains: value } }, { description: { contains: value } }];
  }
  if (status && Object.values(DocumentStatus).includes(String(status) as DocumentStatus)) where.status = status;
  if (type && Object.values(DocumentType).includes(String(type) as DocumentType)) where.type = type;

  const [total, data] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({ where, skip: (pageNum - 1) * limitNum, take: limitNum, orderBy: { uploadedAt: 'desc' }, include: documentInclude }),
  ]);
  res.json({ data, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
});

export const getDocumentById: RequestHandler = asyncHandler(async (req, res) => {
  const id = parseId(String(req.params.id));
  if (!id) { res.status(400).json({ message: 'Invalid document ID' }); return; }
  const document = await prisma.document.findUnique({ where: { id }, include: { ...documentInclude, reviews: { orderBy: { uploadedAt: 'desc' } } } });
  if (!document) { res.status(404).json({ message: 'Document not found' }); return; }
  res.json(document);
});

export const createDocument: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400).json({ message: 'A document file is required' }); return; }
  const { title, type = 'OTHER', description, studentId } = req.body;
  if (!title || !String(title).trim()) { res.status(400).json({ message: 'Title is required' }); return; }
  if (!Object.values(DocumentType).includes(type)) { res.status(400).json({ message: 'Invalid document type' }); return; }
  const document = await prisma.document.create({
    data: { title: String(title).trim(), type, description: description || null, studentId: studentId ? Number(studentId) : null, fileName: req.file.originalname, fileUrl: `/uploads/documents/${req.file.filename}`, fileType: req.file.mimetype, fileSize: req.file.size },
    include: documentInclude,
  });
  await prisma.activityLog.create({ data: { title: 'Document Uploaded', description: `Uploaded '${document.title}'`, type: 'DOCUMENT' } });
  res.status(201).json(document);
});

export const updateDocument: RequestHandler = asyncHandler(async (req, res) => {
  const id = parseId(String(req.params.id));
  if (!id) { res.status(400).json({ message: 'Invalid document ID' }); return; }
  const document = await prisma.document.update({
    where: { id },
    data: { ...(req.body.title !== undefined && { title: String(req.body.title).trim() }), ...(req.body.description !== undefined && { description: req.body.description || null }), ...(req.body.type !== undefined && { type: req.body.type }) },
    include: documentInclude,
  }).catch(() => null);
  if (!document) { res.status(404).json({ message: 'Document not found' }); return; }
  res.json(document);
});

export const reviewDocument: RequestHandler = asyncHandler(async (req, res) => {
  const id = parseId(String(req.params.id));
  const { status, comment } = req.body;
  if (!id) { res.status(400).json({ message: 'Invalid document ID' }); return; }
  if (status !== 'VERIFIED' && status !== 'REJECTED') { res.status(400).json({ message: 'Review status must be VERIFIED or REJECTED' }); return; }
  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) { res.status(404).json({ message: 'Document not found' }); return; }
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.document.update({ where: { id }, data: { status, reviewComment: comment || null, reviewedBy: req.user!.id, reviewedAt: new Date() }, include: documentInclude });
    await tx.documentReview.create({ data: { documentId: id, reviewerId: req.user!.id, status, comment: comment || null } });
    return result;
  });
  res.json(updated);
});

export const deleteDocument: RequestHandler = asyncHandler(async (req, res) => {
  const id = parseId(String(req.params.id));
  if (!id) { res.status(400).json({ message: 'Invalid document ID' }); return; }
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) { res.status(404).json({ message: 'Document not found' }); return; }
  await prisma.document.delete({ where: { id } });
  const filePath = path.join(process.cwd(), document.fileUrl.replace(/^\//, '').split('/').join(path.sep));
  await fs.unlink(filePath).catch(() => undefined);
  res.json({ message: 'Document deleted', id });
});

export const getDocumentReviews: RequestHandler = asyncHandler(async (req, res) => {
  const id = parseId(String(req.params.id));
  if (!id) { res.status(400).json({ message: 'Invalid document ID' }); return; }
  const reviews = await prisma.documentReview.findMany({ where: { documentId: id }, orderBy: { uploadedAt: 'desc' } });
  res.json(reviews);
});
