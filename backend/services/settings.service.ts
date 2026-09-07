import prisma from '../lib/prisma';
import { updateSettingsSchema } from '../validations/settings.validation';

const DEFAULT_SETTINGS = {
  id: 1,
  orgName: 'My School',
};

export async function getSettingsService() {
  return prisma.organizationSetting.upsert({
    where: { id: 1 },
    update: {},
    create: DEFAULT_SETTINGS,
  });
}

export async function getPublicSettingsService() {
  const settings = await prisma.organizationSetting.upsert({
    where: { id: 1 },
    update: {},
    create: DEFAULT_SETTINGS,
  });

  return {
    orgName: settings.orgName,
    slogan: settings.slogan,
    logoUrl: settings.logoUrl,
    primaryEmail: settings.primaryEmail,
    supportPhone: settings.supportPhone,
    websiteUrl: settings.websiteUrl,
    streetAddress: settings.streetAddress,
    city: settings.city,
    country: settings.country,
  };
}

export async function updateSettingsService(body: any) {
  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error('Validation failed');
  }

  const updated = await prisma.organizationSetting.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Organization Settings Updated',
      description: `Updated organization profile for "${updated.orgName}".`,
      type: 'SYSTEM',
    },
  });

  return updated;
}
