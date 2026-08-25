export const ROLE_NAMES = ['ADMIN', 'STAFF'] as const;

export type RoleName = (typeof ROLE_NAMES)[number];
