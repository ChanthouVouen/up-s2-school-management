import { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getSettingsService, getPublicSettingsService, updateSettingsService } from '../services/settings.service';

export const getSettings: RequestHandler = asyncHandler(async (_req, res) => {
  const settings = await getSettingsService();
  res.status(200).json(settings);
});

export const getPublicSettings: RequestHandler = asyncHandler(async (_req, res) => {
  const settings = await getPublicSettingsService();
  res.status(200).json(settings);
});

export const updateSettings: RequestHandler = asyncHandler(async (req, res) => {
  const updated = await updateSettingsService(req.body);
  res.status(200).json(updated);
});
