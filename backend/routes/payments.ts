import { Router } from 'express';
import { checkout, getMyPayments, getPayments } from '../controllers/payments.controller';
import { authenticate, requirePermission, requireRole } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../types/permissions';

const router = Router();
router.use(authenticate);

router.get('/mine', requireRole('STUDENT'), getMyPayments);
router.post('/checkout', requireRole('STUDENT'), checkout);
router.get('/', requirePermission(PERMISSIONS.PAYMENT_VIEW), getPayments);

export default router;
