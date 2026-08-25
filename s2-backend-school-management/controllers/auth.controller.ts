import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { signAuthToken } from '../utils/jwt';
import { blacklistToken } from '../utils/tokenBlacklist';
import { getOrCreateRole } from '../utils/roles';
import { RoleName } from '../types/roles';
import { loginSchema, registerSchema } from '../validations/auth.validation';

function sanitizeUser<T extends { password: string; roleId: string; role: { name: string } }>(user: T) {
  const { password: _password, roleId: _roleId, role, ...rest } = user;
  return { ...rest, role: role.name };
}

//Register staff
export const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: 'An account with this email already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const staffRole = await getOrCreateRole('STAFF');
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, roleId: staffRole.id },
    include: { role: true },
  });

  res.status(201).json({ user: sanitizeUser(user) });
});


//login
export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !passwordMatches) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const token = signAuthToken({ sub: user.id, role: user.role.name as RoleName });

  res.status(200).json({ token, user: sanitizeUser(user) });
});


//logout
export const logout = asyncHandler(async (req, res) => {
  if (req.token && req.tokenExpiresAt) {
    await blacklistToken(req.token, req.tokenExpiresAt);
  }

  res.status(200).json({ message: 'Logged out successfully' });
});


//get current user
export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { role: true } });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.status(200).json({ user: sanitizeUser(user) });
});
