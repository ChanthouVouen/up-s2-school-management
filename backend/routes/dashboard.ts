import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../types/permissions';

const router = express.Router();

router.get('/stats', authenticate, requirePermission(PERMISSIONS.DASHBOARD_VIEW), getDashboardStats);

export default router;
