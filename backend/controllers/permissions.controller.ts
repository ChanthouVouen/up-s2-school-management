import { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getPermissionsService } from '../services/permissions.service';

// GET /permissions - List all permissions (used to populate role permission editors)
export const getPermissions: RequestHandler = asyncHandler(async (_req, res) => {
  const permissions = await getPermissionsService();
  res.status(200).json(permissions);
});
