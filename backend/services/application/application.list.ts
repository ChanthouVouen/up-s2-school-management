import prisma from '../../lib/prisma';
import { ApplicationStatus } from '../../types/enums';
import { applicationCode } from './application.utils';

export async function listApplications(searchText: string, status?: string) {
  const where: any = {};

  if (searchText) {
    where.OR = [
      { applicantName: { contains: searchText } },
      { email: { contains: searchText } },
      { program: { contains: searchText } },
    ];
  }

  if (status && Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
    where.status = status;
  }

  const applications = await prisma.application.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      student: { select: { id: true, studentCode: true, name: true, email: true } },
      partnerSchool: { select: { id: true, name: true, city: true } },
      responsibleStaff: { select: { id: true, name: true, email: true } },
    },
  });

  return applications.map((application) => ({
    ...application,
    applicationCode: applicationCode(application.id, application.createdAt),
  }));
}

export async function findApplicationById(id: number) {
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      student: true,
      partnerSchool: true,
      responsibleStaff: { select: { id: true, name: true, email: true } },
    },
  });

  if (!application) return null;

  return { ...application, applicationCode: applicationCode(application.id, application.createdAt) };
}
