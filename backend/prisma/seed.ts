import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { ROLE_NAMES } from '../types/roles';
import { getOrCreateRole } from '../utils/roles';

const PERMISSIONS_BY_ROLE = {
  ADMIN: [
    'student:create',
    'student:view',
    'student:update',
    'student:delete',
    'user:create',
    'user:view',
    'user:update',
    'user:delete',
    'role:view',
    'role:update',
    'dashboard:view',
    'payment:view',
    'payment:create',
    'payment:update',
    'payment:delete',
    'document:view',
    'document:create',
    'document:update',
    'document:delete',
    'application:view',
    'application:approve',
    'application:reject',
    'partner_school:view',
    'partner_school:create',
    'partner_school:update',
    'partner_school:delete',
  ],
  STAFF: [
    'student:view',
    'student:create',
    'student:update',
    'dashboard:view',
    'payment:view',
    'payment:create',
    'payment:update',
    'document:view',
    'document:create',
    'document:update',
    'application:view',
    'partner_school:view',
    'partner_school:create',
    'partner_school:update',
  ],
} as const;

async function createPermissionsForRoles() {
  const allPermissionNames = Array.from(
    new Set(Object.values(PERMISSIONS_BY_ROLE).flat())
  );

  const permissionRecords = await Promise.all(
    allPermissionNames.map(async (name) =>
      prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const permissionMap = new Map(permissionRecords.map((permission: any) => [permission.name, permission]));

  for (const roleName of ROLE_NAMES) {
    const role = await getOrCreateRole(roleName);
    const permissionsForRole = (PERMISSIONS_BY_ROLE[roleName] ?? []).map((permissionName) => {
      const permission = permissionMap.get(permissionName);
      if (!permission) {
        throw new Error(`Permission not found for role ${roleName}: ${permissionName}`);
      }
      return permission;
    });

    await prisma.role.update({
      where: { id: role.id },
      data: {
        permissions: {
          set: permissionsForRole.map((permission: any) => ({ id: permission.id })),
        },
      },
    });

    console.log(`Linked ${permissionsForRole.length} permissions to ${roleName}`);
  }
}

async function main() {
  for (const name of ROLE_NAMES) {
    await getOrCreateRole(name);
  }

  await createPermissionsForRoles();

  const email = 'admin@school.com';
  const password = 'password';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin account already exists: ${email}`);
    return;
  }

  const adminRole = await getOrCreateRole('ADMIN');
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name: 'Admin',
      email,
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log(`Admin account created: ${email} / ${password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
