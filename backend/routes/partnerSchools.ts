import { Router } from 'express';
import {
  getPartnerSchools,
  getPartnerSchoolById,
  createPartnerSchool,
  updatePartnerSchool,
  deletePartnerSchool,
  addMou,
  updateMou,
  deleteMou,
  getPublicPartnerSchools,
} from '../controllers/partnerSchools.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../types/permissions';

const router = Router();

// Guest-safe list for the public admission form — must be registered before the auth guard below.
router.get('/public', getPublicPartnerSchools);

router.use(authenticate);

// Partner Schools CRUD
router.get('/', requirePermission(PERMISSIONS.PARTNER_SCHOOL_VIEW), getPartnerSchools);
router.post('/', requirePermission(PERMISSIONS.PARTNER_SCHOOL_CREATE), createPartnerSchool);
router.get('/:id', requirePermission(PERMISSIONS.PARTNER_SCHOOL_VIEW), getPartnerSchoolById);
router.put('/:id', requirePermission(PERMISSIONS.PARTNER_SCHOOL_UPDATE), updatePartnerSchool);
router.delete('/:id', requirePermission(PERMISSIONS.PARTNER_SCHOOL_DELETE), deletePartnerSchool);

// MOU Sub-resources
router.post('/:id/mous', requirePermission(PERMISSIONS.PARTNER_SCHOOL_CREATE), addMou);
router.put('/mous/:mouId', requirePermission(PERMISSIONS.PARTNER_SCHOOL_UPDATE), updateMou);
router.delete('/mous/:mouId', requirePermission(PERMISSIONS.PARTNER_SCHOOL_DELETE), deleteMou);

export default router;
