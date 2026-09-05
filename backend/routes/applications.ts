import { Router } from 'express';
import {
  applyPublic,
  createApplication,
  getApplicationById,
  getApplications,
  updateApplicationStatus,
} from '../controllers/applications.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../types/permissions';

const router = Router();

// Public self-service admission form — must be registered before the auth guard below.
router.post('/public', applyPublic);

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.APPLICATION_VIEW), getApplications);
router.post('/', requirePermission(PERMISSIONS.APPLICATION_VIEW), createApplication);
router.get('/:id', requirePermission(PERMISSIONS.APPLICATION_VIEW), getApplicationById);
router.patch('/:id/status', requirePermission(PERMISSIONS.APPLICATION_APPROVE, PERMISSIONS.APPLICATION_REJECT), updateApplicationStatus);

export default router;
