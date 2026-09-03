import { Router } from 'express';
import {
  createApplication,
  getApplicationById,
  getApplications,
  updateApplicationStatus,
} from '../controllers/applications.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../types/permissions';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.APPLICATION_VIEW), getApplications);
router.post('/', requirePermission(PERMISSIONS.APPLICATION_VIEW), createApplication);
router.get('/:id', requirePermission(PERMISSIONS.APPLICATION_VIEW), getApplicationById);
router.patch('/:id/status', requirePermission(PERMISSIONS.APPLICATION_APPROVE), updateApplicationStatus);

export default router;
