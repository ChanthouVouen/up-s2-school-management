import prisma from '../lib/prisma';

export async function getPermissionsService() {
  return prisma.permission.findMany({ orderBy: { name: 'asc' } });
}
