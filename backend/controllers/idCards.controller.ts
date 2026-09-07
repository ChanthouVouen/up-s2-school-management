import { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { checkStudentEligibility, getIdCardsService, getIdCardByStudentIdService, generateIdCardService, revokeIdCardService, verifyIdCardService } from '../services/id-card.service';

// GET /id-cards - List students with ID card status & eligibility
export const getIdCards: RequestHandler = asyncHandler(async (req, res) => {
  const result = await getIdCardsService(req.query as Record<string, any>);
  res.status(200).json({
    data: result.data,
    meta: result.meta,
    stats: result.stats,
  });
});

// GET /id-cards/:studentId - Get specific student ID card details & school settings
export const getIdCardByStudentId: RequestHandler = asyncHandler(async (req, res) => {
  const studentIdParam = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;
  try {
    const result = await getIdCardByStudentIdService(studentIdParam || '');
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Student not found.') {
      res.status(404).json({ message: 'Student not found.' });
      return;
    }
    res.status(400).json({ message: error.message || 'Invalid student ID.' });
  }
});

// POST /id-cards/generate - Generate or re-issue an ID Card
export const generateIdCard: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const result = await generateIdCardService(req.body.studentId, req.body.validYears ?? 4);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Student not found.') {
      res.status(404).json({ message: 'Student not found.' });
      return;
    }
    if (error.message === 'Student is not eligible for ID Card generation.') {
      const student = await (await import('../lib/prisma')).default.student.findUnique({
        where: { id: Number(req.body.studentId) },
        include: { applications: true },
      });
      const reasons = student ? checkStudentEligibility(student).reasons : [];
      res.status(400).json({ message: error.message, reasons });
      return;
    }
    res.status(400).json({ message: error.message || 'Unable to generate ID card.' });
  }
});

// POST /id-cards/:studentId/revoke - Revoke an existing ID Card
export const revokeIdCard: RequestHandler = asyncHandler(async (req, res) => {
  const studentIdParam = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;
  try {
    const result = await revokeIdCardService(studentIdParam || '');
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'No ID Card found for this student.') {
      res.status(404).json({ message: 'No ID Card found for this student.' });
      return;
    }
    res.status(400).json({ message: error.message || 'Unable to revoke ID card.' });
  }
});

// GET /id-cards/verify/:token - Public QR verification endpoint
export const verifyIdCard: RequestHandler = asyncHandler(async (req, res) => {
  const tokenParam = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  try {
    const result = await verifyIdCardService(tokenParam || '');
    const statusCode = result.status === 'NOT_FOUND' ? 404 : 200;
    res.status(statusCode).json(result);
  } catch (error: any) {
    res.status(400).json({ valid: false, message: error.message || 'Verification token is required.' });
  }
});
