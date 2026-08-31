import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

// GET /roles - List all roles (used to populate role dropdowns)
export const getRoles: RequestHandler = asyncHandler(async (_req, res) => {
  const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
  res.status(200).json(roles);
});
