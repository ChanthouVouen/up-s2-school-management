export const ROLE_NAMES = ['ADMIN', 'STAFF', 'STUDENT'] as const;

export type RoleName = (typeof ROLE_NAMES)[number];
