import { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getDashboardStatsService } from '../services/dashboard.service';

export const getDashboardStats: RequestHandler = asyncHandler(async (_req, res) => {
  const data = await getDashboardStatsService();
  res.status(200).json(data);
});
