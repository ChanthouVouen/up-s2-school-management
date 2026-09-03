import { Router } from 'express';
import {
  createInquiry,
  createPublicInquiry,
  getInquiries,
  getMyInquiries,
  respondToInquiry,
} from '../controllers/inquiries.controller';
import { authenticate, requirePermission, requireRole } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../types/permissions';

const router = Router();

// Public "Contact Us" endpoint — must be registered before the auth guard below.
router.post('/public', createPublicInquiry);

router.use(authenticate);

router.get('/mine', requireRole('STUDENT'), getMyInquiries);
router.post('/', requireRole('STUDENT'), createInquiry);
router.get('/', requirePermission(PERMISSIONS.INQUIRY_VIEW), getInquiries);
router.patch('/:id', requirePermission(PERMISSIONS.INQUIRY_RESPOND), respondToInquiry);

export default router;
