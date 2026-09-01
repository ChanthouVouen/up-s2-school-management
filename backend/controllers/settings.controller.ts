import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { updateSettingsSchema } from '../validations/settings.validation';

const DEFAULT_SETTINGS = {
  id: 1,
  orgName: 'My School',
};

// GET /settings - Get the organization settings (creates the default row on first access)
export const getSettings: RequestHandler = asyncHandler(async (_req, res) => {
  const settings = await prisma.organizationSetting.upsert({
    where: { id: 1 },
    update: {},
    create: DEFAULT_SETTINGS,
  });

  res.status(200).json(settings);
});

// PUT /settings - Update the organization settings
export const updateSettings: RequestHandler = asyncHandler(async (req, res) => {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const data = parsed.data;

  const updated = await prisma.organizationSetting.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Organization Settings Updated',
      description: `Updated organization profile for "${updated.orgName}".`,
      type: 'SYSTEM',
    },
  });

  res.status(200).json(updated);
});
