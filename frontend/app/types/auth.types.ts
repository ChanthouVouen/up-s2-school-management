export type RoleName = "ADMIN" | "STAFF" | "STUDENT";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  permissions: string[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  user: AuthUser;
}

export interface RegisterResult {
  success: boolean;
  message?: string;
}
