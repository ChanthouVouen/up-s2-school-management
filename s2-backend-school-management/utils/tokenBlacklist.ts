import crypto from 'crypto';
import prisma from '../lib/prisma';

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function blacklistToken(token: string, expiresAt: Date): Promise<void> {
  await prisma.blacklistedToken.upsert({
    where: { tokenHash: hashToken(token) },
    update: {},
    create: { tokenHash: hashToken(token), expiresAt },
  });
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const found = await prisma.blacklistedToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  return found !== null;
}
