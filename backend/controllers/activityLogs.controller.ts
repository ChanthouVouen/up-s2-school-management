import { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getActivityLogsService, getActivityLogStatsService } from '../services/activity-log.service';

// GET /activity-logs - List activity logs with search, type filter, date range & pagination
export const getActivityLogs: RequestHandler = asyncHandler(async (req, res) => {
  const result = await getActivityLogsService(req.query as Record<string, any>);
  res.status(200).json(result);
});

// GET /activity-logs/stats - Summary counts for the activity log dashboard card
export const getActivityLogStats: RequestHandler = asyncHandler(async (_req, res) => {
  const stats = await getActivityLogStatsService();
  res.status(200).json(stats);
});
