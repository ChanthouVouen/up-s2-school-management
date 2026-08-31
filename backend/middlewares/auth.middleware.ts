import { RequestHandler } from 'express';
import { RoleName } from '../types/roles';
import { verifyAuthToken } from '../utils/jwt';
import { isTokenBlacklisted } from '../utils/tokenBlacklist';
import { asyncHandler } from '../utils/asyncHandler';

export const authenticate: RequestHandler = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

  if (!token) {
    res.status(401).json({ message: 'Authentication token is missing' });
    return;
  }

  let payload;
  try {
    payload = verifyAuthToken(token);
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  if (await isTokenBlacklisted(token)) {
    res.status(401).json({ message: 'Token has been revoked' });
    return;
  }

  req.user = { id: payload.sub, role: payload.role, permissions: payload.permissions ?? [] };
  req.token = token;
  req.tokenExpiresAt = new Date(payload.exp * 1000);
  next();
});

export function requireRole(...roles: RoleName[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

/** Grants access if the user holds at least one of the given permissions. */
export function requirePermission(...permissions: string[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user || !permissions.some((permission) => req.user!.permissions.includes(permission))) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
