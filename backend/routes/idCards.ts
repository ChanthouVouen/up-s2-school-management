import { Router } from 'express';
import {
  getIdCards,
  getIdCardByStudentId,
  generateIdCard,
  revokeIdCard,
  verifyIdCard,
} from '../controllers/idCards.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../types/permissions';

const router = Router();

// Public QR Code verification route (no auth required so external scanning works seamlessly)
router.get('/verify/:token', verifyIdCard);

// Authenticated ID Card management routes
router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.ID_CARD_VIEW), getIdCards);
router.post('/generate', requirePermission(PERMISSIONS.ID_CARD_GENERATE), generateIdCard);
router.get('/:studentId', requirePermission(PERMISSIONS.ID_CARD_VIEW), getIdCardByStudentId);
router.post('/:studentId/revoke', requirePermission(PERMISSIONS.ID_CARD_REVOKE), revokeIdCard);

export default router;
