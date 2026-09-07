import { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getMyProfileService, getStudentsService, getStudentByIdService, createStudentService, updateStudentService, updateStudentStatusService, deleteStudentService, getStudentHistoryService } from '../services/student.service';

// GET /students/me - The logged-in student's own profile + application/enrollment status
export const getMyProfile: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const fullStudent = await getMyProfileService(req.user!.id);
    res.status(200).json(fullStudent);
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'No student profile linked to this account' });
  }
});

// GET /students - List students with search, filters & pagination
export const getStudents: RequestHandler = asyncHandler(async (req, res) => {
  const result = await getStudentsService(req.query as Record<string, any>);
  res.status(200).json(result);
});

// GET /students/:id - Get student details by ID
export const getStudentById: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const student = await getStudentByIdService(id ?? '');
    res.status(200).json(student);
  } catch (error: any) {
    if (error.message === 'Student not found') {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    res.status(400).json({ message: error.message || 'Invalid student ID' });
  }
});

// POST /students - Create new student
export const createStudent: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const newStudent = await createStudentService(req.body, (req as any).user?.name || 'Admin');
    res.status(201).json(newStudent);
  } catch (error: any) {
    const status = error.message === 'Student name is required' ? 400 : 400;
    res.status(status).json({ message: error.message || 'Unable to create student' });
  }
});

// PUT /students/:id - Update student details
export const updateStudent: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updatedStudent = await updateStudentService(id ?? '', req.body, (req as any).user?.name || 'Admin');
    res.status(200).json(updatedStudent);
  } catch (error: any) {
    if (error.message === 'Student not found') {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    res.status(400).json({ message: error.message || 'Unable to update student' });
  }
});

// PATCH /students/:id/status - Update status or payment status only
export const updateStudentStatus: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updatedStudent = await updateStudentStatusService(id ?? '', req.body);
    res.status(200).json(updatedStudent);
  } catch (error: any) {
    if (error.message === 'Student not found') {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    res.status(400).json({ message: error.message || 'Unable to update student status' });
  }
});

// DELETE /students/:id - Delete student profile
export const deleteStudent: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await deleteStudentService(id ?? '');
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Student not found') {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    res.status(400).json({ message: error.message || 'Unable to delete student' });
  }
});

// GET /students/:id/history - Get student audit history
export const getStudentHistory: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const histories = await getStudentHistoryService(id ?? '');
    res.status(200).json(histories);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Invalid student ID' });
  }
});
