import { Router } from 'express';
import {
  createDocument,
  getMyDocuments,
} from '../controllers/documents.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/mine', requireRole('STUDENT'), getMyDocuments);
router.post('/mine', requireRole('STUDENT'), createDocument);

export default router;
