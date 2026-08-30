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

const router = Router();

router.get('/', getStudents);
router.post('/', createStudent);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.patch('/:id/status', updateStudentStatus);
router.delete('/:id', deleteStudent);
router.get('/:id/history', getStudentHistory);

export default router;
