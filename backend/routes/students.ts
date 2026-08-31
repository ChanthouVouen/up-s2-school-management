import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
  getStudentHistory,
} from '../controllers/students.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../types/permissions';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.STUDENT_VIEW), getStudents);
router.post('/', requirePermission(PERMISSIONS.STUDENT_CREATE), createStudent);
router.get('/:id', requirePermission(PERMISSIONS.STUDENT_VIEW), getStudentById);
router.put('/:id', requirePermission(PERMISSIONS.STUDENT_UPDATE), updateStudent);
router.patch('/:id/status', requirePermission(PERMISSIONS.STUDENT_UPDATE), updateStudentStatus);
router.delete('/:id', requirePermission(PERMISSIONS.STUDENT_DELETE), deleteStudent);
router.get('/:id/history', requirePermission(PERMISSIONS.STUDENT_VIEW), getStudentHistory);

export default router;
