import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { RoleName } from '../types/roles';

const JWT_SECRET = env.jwtSecret;
const JWT_EXPIRES_IN = env.jwtExpiresIn as SignOptions['expiresIn'];

export interface AuthTokenClaims {
  sub: string;
  role: RoleName;
  permissions: string[];
}

export interface AuthTokenPayload extends AuthTokenClaims {
  exp: number;
}

export function signAuthToken(claims: AuthTokenClaims): string {
  return jwt.sign(claims, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}
