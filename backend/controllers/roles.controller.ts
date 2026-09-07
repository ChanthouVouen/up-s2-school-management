import { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getRolesService, updateRolePermissionsService, createRoleService } from '../services/roles.service';

// GET /roles - List all roles with their permissions
export const getRoles: RequestHandler = asyncHandler(async (_req, res) => {
  const roles = await getRolesService();
  res.status(200).json(roles);
});

// PUT /roles/:id/permissions - Replace a role's permission set
export const updateRolePermissions: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const updated = await updateRolePermissionsService(String(req.params.id), req.body);
    res.status(200).json(updated);
  } catch (error: any) {
    if (error.message === 'Role not found') {
      res.status(404).json({ message: 'Role not found' });
      return;
    }
    res.status(400).json({ message: error.message || 'Validation failed' });
  }
});


export const createRole: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const roleCreate = await createRoleService(req.body);
    res.status(201).json(roleCreate);
  } catch (error: any) {
    if (error.message === 'Role already exists.') {
      res.status(400).json({ message: 'Role already exists.' });
      return;
    }
    res.status(400).json({ message: error.message || 'Validation failed' });
  }
});