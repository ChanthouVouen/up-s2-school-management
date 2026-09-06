import { Router } from 'express';
import {
  getScholarshipOverview,
  getScholarshipSchemes,
  getScholarshipBeneficiaries,
  awardScholarship,
  getScholarshipCodes,
  validateScholarshipCode,
  createScholarshipCode,
  updateScholarshipCode,
  deleteScholarshipCode,
  revokeScholarship,
  getGradeScholarships,
  createGradeScholarship,
  updateGradeScholarship,
  deleteGradeScholarship,
} from '../controllers/scholarships.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Publicly available for student admission application
router.get('/codes/public', getScholarshipCodes);
router.get('/grades/public', getGradeScholarships);
router.post('/validate-code', validateScholarshipCode);

// Authenticated routes for staff & admin
router.use(authenticate);

router.get('/overview', getScholarshipOverview);
router.get('/schemes', getScholarshipSchemes);
router.get('/beneficiaries', getScholarshipBeneficiaries);

// Promo code management
router.get('/codes', getScholarshipCodes);
router.post('/codes', createScholarshipCode);
router.put('/codes/:id', updateScholarshipCode);
router.delete('/codes/:id', deleteScholarshipCode);

// Grade scholarship management
router.get('/grades', getGradeScholarships);
router.post('/grades', createGradeScholarship);
router.put('/grades/:id', updateGradeScholarship);
router.delete('/grades/:id', deleteGradeScholarship);

// Award & revoke
router.post('/award', awardScholarship);
router.delete('/beneficiaries/:studentId', revokeScholarship);

export default router;


