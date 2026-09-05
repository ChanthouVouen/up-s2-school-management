import prisma from '../lib/prisma';

/** Looks up the Student profile linked to a logged-in STUDENT user's account. */
export function getStudentForUser(userId: string) {
  return prisma.student.findUnique({ where: { userId } });
}
