import bcrypt from 'bcryptjs';

import prisma from '../lib/prisma';
import { getOrCreateRole } from '../utils/roles';
import { sanitizeUser } from '../utils/sanitizeUser';
import { signAuthToken } from '../utils/jwt';
import { blacklistToken } from '../utils/tokenBlacklist';
import { RoleName } from '../types/roles';

export async function registerUser(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();
  const name = input.name.trim();

  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const staffRole = await getOrCreateRole('STAFF');

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, roleId: staffRole.id },
    include: { role: { include: { permissions: true } } },
  });

  return { user: sanitizeUser(user) };
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: { include: { permissions: true } } },
  });

  const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !passwordMatches) {
    console.warn(`Login failed for email: "${email}"`);
    throw new Error('Invalid email or password');
  }

  const token = signAuthToken({
    sub: user.id,
    role: user.role.name as RoleName,
    permissions: user.role.permissions.map((permission) => permission.name),
  });

  return { token, user: sanitizeUser(user) };
}

export async function logoutUser(token?: string, expiresAt?: Date) {
  if (token && expiresAt) {
    await blacklistToken(token, expiresAt);
  }

  return { message: 'Logged out successfully' };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: { include: { permissions: true } } },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return { user: sanitizeUser(user) };
}
