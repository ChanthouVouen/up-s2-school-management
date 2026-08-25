import { RoleName } from './roles';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: RoleName;
      };
      token?: string;
      tokenExpiresAt?: Date;
    }
  }
}

export {};
