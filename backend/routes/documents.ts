import { Router } from 'express';
import {
  createDocument,
  getDocuments,
  getMyDocuments,
  updateDocumentStatus,
} from '../controllers/documents.controller';
import { authenticate, requirePermission, requireRole } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../types/permissions';

const router = Router();
router.use(authenticate);

router.get('/mine', requireRole('STUDENT'), getMyDocuments);
router.post('/', requireRole('STUDENT'), createDocument);
router.get('/', requirePermission(PERMISSIONS.DOCUMENT_VIEW), getDocuments);
router.patch('/:id/status', requirePermission(PERMISSIONS.DOCUMENT_UPDATE), updateDocumentStatus);

export default router;
