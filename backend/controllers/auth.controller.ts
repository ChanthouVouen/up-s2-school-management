import { RequestHandler } from 'express';
import { loginSchema, registerSchema } from '../validations/auth.validation';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from '../services/auth.service';

export const register: RequestHandler = async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const result = await registerUser(parsed.data);
    res.status(201).json(result);
  } catch (error: any) {
    const statusCode = error.message?.includes('already exists') ? 409 : 400;
    res.status(statusCode).json({ message: error.message || 'Unable to register user' });
  }
};

export const login: RequestHandler = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const result = await loginUser(parsed.data);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Invalid email or password' });
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    const result = await logoutUser(req.token, req.tokenExpiresAt);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Logout failed' });
  }
};

export const me: RequestHandler = async (req, res) => {
  try {
    const result = await getCurrentUser(req.user!.id);
    res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.message === 'User not found' ? 404 : 400;
    res.status(statusCode).json({ message: error.message || 'Unable to fetch current user' });
  }
};
