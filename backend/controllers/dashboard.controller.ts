import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApplicationStatus } from '../types/enums';

export const getDashboardStats: RequestHandler = asyncHandler(async (_req, res) => {
  // Auto-heal any invalid zero dates ('0000-00-00 00:00:00') inserted manually into MySQL
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE students SET createdAt = NOW() WHERE createdAt IS NULL OR CAST(createdAt AS CHAR) LIKE '0000%'`
    );
    await prisma.$executeRawUnsafe(
      `UPDATE students SET updatedAt = NOW() WHERE updatedAt IS NULL OR CAST(updatedAt AS CHAR) LIKE '0000%'`
    );
    await prisma.$executeRawUnsafe(
      `UPDATE documents SET createdAt = NOW() WHERE createdAt IS NULL OR CAST(createdAt AS CHAR) LIKE '0000%'`
    );
    await prisma.$executeRawUnsafe(
      `UPDATE applications SET createdAt = NOW() WHERE createdAt IS NULL OR CAST(createdAt AS CHAR) LIKE '0000%'`
    );
  } catch (err) {
    // Ignore raw execution errors if tables are empty/uninitialized
  }

  const now = new Date();

  const utcStartOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const localStartOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfToday = utcStartOfToday < localStartOfToday ? utcStartOfToday : localStartOfToday;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Construct last 7 days window (from 6 days ago up to today)
  const dayWindows = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));

    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

    const name = `${dayNames[d.getDay()]} ${d.getDate()}`;
    return { name, start, end };
  });

  // Execute all database queries concurrently using Promise.all for maximum performance & cleanliness
  const [
    totalStudents,
    studentsToday,
    pendingDocuments,
    pendingApplications,
    enrolledStudents,
    paidStudentsCount,
    unpaidStudentsCount,
    recentStudents,
    recentActivities,
    chartData,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.document.count({ where: { status: 'PENDING' } }),
    prisma.application.count({ where: { status: ApplicationStatus.PENDING } }),
    prisma.student.count({ where: { status: 'ENROLLED' } }),
    prisma.student.count({ where: { paymentStatus: 'PAID' } }),
    prisma.student.count({ where: { paymentStatus: 'UNPAID' } }),
    prisma.student.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        studentCode: true,
        name: true,
        email: true,
        status: true,
        paymentStatus: true,
        department: true,
        createdAt: true,
      },
    }),
    prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    Promise.all(
      dayWindows.map(async (window) => {
        const [studentCount, applicationCount] = await Promise.all([
          prisma.student.count({ where: { createdAt: { gte: window.start, lte: window.end } } }),
          prisma.application.count({ where: { createdAt: { gte: window.start, lte: window.end } } }),
        ]);
        return {
          name: window.name,
          Students: studentCount,
          Applications: applicationCount,
        };
      })
    ),
  ]);

  res.status(200).json({
    summary: {
      totalStudents,
      studentsToday,
      pendingDocuments,
      pendingApplications,
      enrolledStudents,
      paymentStatusBreakdown: {
        paid: paidStudentsCount,
        unpaid: unpaidStudentsCount,
      },
    },
    chartData,
    recentStudents,
    recentActivities,
  });
});
