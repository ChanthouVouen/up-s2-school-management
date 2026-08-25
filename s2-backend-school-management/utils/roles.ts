import prisma from '../lib/prisma';
import { RoleName } from '../types/roles';

export async function getOrCreateRole(name: RoleName) {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}
