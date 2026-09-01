// Mirrors the permission names seeded in prisma/seed.ts (PERMISSIONS_BY_ROLE).
// Permissions themselves are dynamic, DB-driven rows (Role <-> Permission),
// so this is a typo-safe reference for wiring routes, not an exhaustive enum.
export const PERMISSIONS = {
  STUDENT_VIEW: 'student:view',
  STUDENT_CREATE: 'student:create',
  STUDENT_UPDATE: 'student:update',
  STUDENT_DELETE: 'student:delete',
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  ROLE_VIEW: 'role:view',
  ROLE_UPDATE: 'role:update',
  DASHBOARD_VIEW: 'dashboard:view',
  PAYMENT_VIEW: 'payment:view',
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_UPDATE: 'payment:update',
  PAYMENT_DELETE: 'payment:delete',
  DOCUMENT_VIEW: 'document:view',
  DOCUMENT_CREATE: 'document:create',
  DOCUMENT_UPDATE: 'document:update',
  DOCUMENT_DELETE: 'document:delete',
  APPLICATION_VIEW: 'application:view',
  APPLICATION_APPROVE: 'application:approve',
  APPLICATION_REJECT: 'application:reject',
  ACTIVITY_VIEW: 'activity:view',
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
