import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

// GET /permissions - List all permissions (used to populate role permission editors)
export const getPermissions: RequestHandler = asyncHandler(async (_req, res) => {
  const permissions = await prisma.permission.findMany({ orderBy: { name: 'asc' } });
  res.status(200).json(permissions);
});
