import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { updateRolePermissionsSchema, createRoleSchema } from '../validations/roles.validation';

// GET /roles - List all roles with their permissions
export const getRoles: RequestHandler = asyncHandler(async (_req, res) => {
  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' },
    include: { permissions: { orderBy: { name: 'asc' } } },
  });
  res.status(200).json(roles);
});

// PUT /roles/:id/permissions - Replace a role's permission set
export const updateRolePermissions: RequestHandler = asyncHandler(async (req, res) => {
  const id = String(req.params.id);

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) {
    res.status(404).json({ message: 'Role not found' });
    return;
  }

  const parsed = updateRolePermissionsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { permissionIds } = parsed.data;

  const existingPermissions = await prisma.permission.findMany({ where: { id: { in: permissionIds } } });
  if (existingPermissions.length !== permissionIds.length) {
    res.status(400).json({ message: 'One or more permission IDs are invalid' });
    return;
  }

  const updated = await prisma.role.update({
    where: { id },
    data: { permissions: { set: permissionIds.map((permissionId: string) => ({ id: permissionId })) } },
    include: { permissions: { orderBy: { name: 'asc' } } },
  });

  res.status(200).json(updated);
});


export const createRole: RequestHandler = asyncHandler(async (req, res) => {
  const parsed = createRoleSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const { name } = parsed.data;

  const existingRole = await prisma.role.findUnique({ where: { name } });
  if (existingRole) {
    res.status(400).json({ message: 'Role already exists.' });
    return;
  }

  const roleCreate = await prisma.role.create({
    data: { name },
  });

  res.status(201).json(roleCreate);
});