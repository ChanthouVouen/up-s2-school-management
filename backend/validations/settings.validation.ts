import { z } from 'zod';

const emptyToUndefined = (val: unknown) => (val === '' ? undefined : val);

export const updateSettingsSchema = z.object({
  orgName: z.string().trim().min(1, 'Organization name is required'),
  slogan: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  logoUrl: z.preprocess(emptyToUndefined, z.string().optional()),
  primaryEmail: z.preprocess(emptyToUndefined, z.string().trim().toLowerCase().email('Invalid email address').optional()),
  supportPhone: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  websiteUrl: z.preprocess(emptyToUndefined, z.string().trim().url('Invalid URL').optional()),
  supportPortal: z.preprocess(emptyToUndefined, z.string().trim().url('Invalid URL').optional()),
  streetAddress: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  city: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  state: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  postalCode: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  country: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});
