import { z } from 'zod';

export const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().min(1)),
});

export const createRoleSchema = z.object({
  name: z.string().min(6),
})