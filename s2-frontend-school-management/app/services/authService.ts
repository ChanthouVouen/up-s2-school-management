import api from "./api";
import type { AuthUser, LoginResponse, RegisterResponse, RegisterResult } from "../types/auth.types";

export const loginUser = async (email: string, password: string): Promise<boolean> => {
  try {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });

    localStorage.setItem('authToken', res.data.token);
    localStorage.setItem('authUser', JSON.stringify(res.data.user));
    localStorage.setItem('role', res.data.user.role);
    return true;
  } catch (error) {
    return false;
  }
};

export const registerUser = async (name: string, email: string, password: string): Promise<RegisterResult> => {
  try {
    await api.post<RegisterResponse>('/auth/register', { name, email, password });
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // ignore — we clear local session state regardless
  } finally {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('role');
  }
};

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem('authUser');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => !!localStorage.getItem('authToken');
