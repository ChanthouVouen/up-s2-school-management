import prisma from '../lib/prisma';
import { updateRolePermissionsSchema, createRoleSchema } from '../validations/roles.validation';

export async function getRolesService() {
  return prisma.role.findMany({
    orderBy: { name: 'asc' },
    include: { permissions: { orderBy: { name: 'asc' } } },
  });
}

export async function updateRolePermissionsService(roleId: string, body: any) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw new Error('Role not found');
  }

  const parsed = updateRolePermissionsSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error('Validation failed');
  }

  const { permissionIds } = parsed.data;
  const existingPermissions = await prisma.permission.findMany({ where: { id: { in: permissionIds } } });
  if (existingPermissions.length !== permissionIds.length) {
    throw new Error('One or more permission IDs are invalid');
  }

  const updated = await prisma.role.update({
    where: { id: roleId },
    data: { permissions: { set: permissionIds.map((permissionId: string) => ({ id: permissionId })) } },
    include: { permissions: { orderBy: { name: 'asc' } } },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Role Permissions Updated',
      description: `Updated permissions for role ${updated.name} (${updated.permissions.length} permission${updated.permissions.length === 1 ? '' : 's'} assigned).`,
      type: 'ROLE',
    },
  });

  return updated;
}

export async function createRoleService(body: any) {
  const parsed = createRoleSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error('Validation failed');
  }

  const { name } = parsed.data;
  const existingRole = await prisma.role.findUnique({ where: { name } });
  if (existingRole) {
    throw new Error('Role already exists.');
  }

  const roleCreate = await prisma.role.create({ data: { name } });

  await prisma.activityLog.create({
    data: {
      title: 'New Role Created',
      description: `Role "${roleCreate.name}" was created.`,
      type: 'ROLE',
    },
  });

  return roleCreate;
}
