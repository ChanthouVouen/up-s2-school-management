import crypto from 'crypto';

import { ApplicationStatus } from '../../types/enums';

export const TERMINAL_APPLICATION_STATUSES: string[] = [
  ApplicationStatus.SCHOOL_APPROVED,
  ApplicationStatus.APPROVED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.ENROLLED,
];

export function applicationCode(id: number, createdAt: Date) {
  return `APP-${createdAt.getFullYear()}-${String(id).padStart(4, '0')}`;
}

export function generateTempPassword() {
  return crypto.randomBytes(6).toString('base64url');
}
