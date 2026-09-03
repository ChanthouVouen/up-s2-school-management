import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ActivityType } from '../types/enums';

// GET /activity-logs - List activity logs with search, type filter, date range & pagination
export const getActivityLogs: RequestHandler = asyncHandler(async (req, res) => {
  const { search, type, from, to, page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const whereClause: any = {};

  if (search) {
    const searchStr = (search as string).trim();
    whereClause.OR = [
      { title: { contains: searchStr } },
      { description: { contains: searchStr } },
    ];
  }

  if (type && Object.values(ActivityType).includes(type as any)) {
    whereClause.type = type;
  }

  if (from || to) {
    whereClause.createdAt = {};
    if (from) whereClause.createdAt.gte = new Date(from as string);
    if (to) whereClause.createdAt.lte = new Date(to as string);
  }

  const [total, logs] = await Promise.all([
    prisma.activityLog.count({ where: whereClause }),
    prisma.activityLog.findMany({
      where: whereClause,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  res.status(200).json({
    data: logs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// GET /activity-logs/stats - Summary counts for the activity log dashboard card
export const getActivityLogStats: RequestHandler = asyncHandler(async (_req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [total, totalToday, byTypeRaw] = await Promise.all([
    prisma.activityLog.count(),
    prisma.activityLog.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.activityLog.groupBy({
      by: ['type'],
      _count: { _all: true },
    }),
  ]);

  const byType = byTypeRaw.reduce<Record<string, number>>((acc, row) => {
    acc[row.type ?? 'UNKNOWN'] = row._count._all;
    return acc;
  }, {});

  res.status(200).json({ total, totalToday, byType });
});
