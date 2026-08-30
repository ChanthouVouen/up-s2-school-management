import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { StudentStatus, PaymentStatus } from '../types/enums';

// GET /students - List students with search, filters & pagination
export const getStudents: RequestHandler = asyncHandler(async (req, res) => {
  const { search, status, paymentStatus, department, page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const whereClause: any = {};

  if (search) {
    const searchStr = (search as string).trim();
    whereClause.OR = [
      { studentCode: { contains: searchStr } },
      { name: { contains: searchStr } },
      { email: { contains: searchStr } },
      { department: { contains: searchStr } },
    ];
  }

  if (status && Object.values(StudentStatus).includes(status as any)) {
    whereClause.status = status;
  }

  if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus as any)) {
    whereClause.paymentStatus = paymentStatus;
  }

  if (department && (department as string).trim() !== '') {
    whereClause.department = { contains: (department as string).trim() };
  }

  const [total, students] = await Promise.all([
    prisma.student.count({ where: whereClause }),
    prisma.student.findMany({
      where: whereClause,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { documents: true, applications: true, histories: true },
        },
      },
    }),
  ]);

  res.status(200).json({
    data: students,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// GET /students/:id - Get student details by ID
export const getStudentById: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(String(id), 10);

  if (isNaN(studentId)) {
    res.status(400).json({ message: 'Invalid student ID' });
    return;
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      applications: { orderBy: { createdAt: 'desc' } },
      documents: { orderBy: { createdAt: 'desc' } },
      histories: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!student) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  res.status(200).json(student);
});

// POST /students - Create new student
export const createStudent: RequestHandler = asyncHandler(async (req, res) => {
  const { name, email, phone, gender, dob, address, status, paymentStatus, department, studentCode } = req.body;

  if (!name || name.trim() === '') {
    res.status(400).json({ message: 'Student name is required' });
    return;
  }

  // Generate unique student code if not provided
  let code = studentCode;
  if (!code || code.trim() === '') {
    const year = new Date().getFullYear();
    const count = await prisma.student.count();
    code = `STU-${year}-${(count + 1).toString().padStart(3, '0')}`;
  }

  const newStudent = await prisma.student.create({
    data: {
      studentCode: code.trim(),
      name: name.trim(),
      email: email ? email.trim() : null,
      phone: phone ? phone.trim() : null,
      gender: gender ? gender.trim() : null,
      dob: dob ? new Date(dob) : null,
      address: address ? address.trim() : null,
      status: status && Object.values(StudentStatus).includes(status) ? status : StudentStatus.ENROLLED,
      paymentStatus: paymentStatus && Object.values(PaymentStatus).includes(paymentStatus) ? paymentStatus : PaymentStatus.UNPAID,
      department: department ? department.trim() : null,
      histories: {
        create: {
          action: 'STUDENT_CREATED',
          description: `Registered new student profile (${code.trim()}).`,
          performedBy: 'Admin',
        },
      },
    },
    include: {
      histories: true,
    },
  });

  // Log system activity
  await prisma.activityLog.create({
    data: {
      title: 'New Student Registered',
      description: `Student ${newStudent.name} (${newStudent.studentCode}) was created.`,
      type: 'STUDENT',
    },
  });

  res.status(201).json(newStudent);
});

// PUT /students/:id - Update student details
export const updateStudent: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(String(id), 10);

  if (isNaN(studentId)) {
    res.status(400).json({ message: 'Invalid student ID' });
    return;
  }

  const existingStudent = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!existingStudent) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  const { name, email, phone, gender, dob, address, status, paymentStatus, department } = req.body;

  // Detect modified fields for audit trail
  const changes: string[] = [];
  if (name && name !== existingStudent.name) changes.push(`Name changed from "${existingStudent.name}" to "${name}"`);
  if (status && status !== existingStudent.status) changes.push(`Status changed from "${existingStudent.status}" to "${status}"`);
  if (paymentStatus && paymentStatus !== existingStudent.paymentStatus) changes.push(`Payment status changed from "${existingStudent.paymentStatus}" to "${paymentStatus}"`);
  if (department !== undefined && department !== existingStudent.department) changes.push(`Department updated to "${department || 'None'}"`);

  const updatedStudent = await prisma.student.update({
    where: { id: studentId },
    data: {
      name: name ? name.trim() : existingStudent.name,
      email: email !== undefined ? (email ? email.trim() : null) : existingStudent.email,
      phone: phone !== undefined ? (phone ? phone.trim() : null) : existingStudent.phone,
      gender: gender !== undefined ? (gender ? gender.trim() : null) : existingStudent.gender,
      dob: dob ? new Date(dob) : existingStudent.dob,
      address: address !== undefined ? (address ? address.trim() : null) : existingStudent.address,
      status: status && Object.values(StudentStatus).includes(status) ? status : existingStudent.status,
      paymentStatus: paymentStatus && Object.values(PaymentStatus).includes(paymentStatus) ? paymentStatus : existingStudent.paymentStatus,
      department: department !== undefined ? (department ? department.trim() : null) : existingStudent.department,
    },
  });

  if (changes.length > 0) {
    await prisma.studentHistory.create({
      data: {
        studentId: studentId,
        action: 'PROFILE_UPDATED',
        description: changes.join('; '),
        performedBy: 'Admin',
      },
    });

    await prisma.activityLog.create({
      data: {
        title: 'Student Updated',
        description: `Updated profile for ${updatedStudent.name} (${updatedStudent.studentCode}).`,
        type: 'STUDENT',
      },
    });
  }

  res.status(200).json(updatedStudent);
});

// PATCH /students/:id/status - Quick update status or paymentStatus
export const updateStudentStatus: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(String(id), 10);

  if (isNaN(studentId)) {
    res.status(400).json({ message: 'Invalid student ID' });
    return;
  }

  const { status, paymentStatus } = req.body;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  const updateData: any = {};
  const historyLogs: string[] = [];

  if (status && Object.values(StudentStatus).includes(status)) {
    updateData.status = status;
    historyLogs.push(`Status changed to ${status}`);
  }

  if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus)) {
    updateData.paymentStatus = paymentStatus;
    historyLogs.push(`Payment status changed to ${paymentStatus}`);
  }

  if (Object.keys(updateData).length === 0) {
    res.status(400).json({ message: 'No valid status or paymentStatus provided' });
    return;
  }

  const updated = await prisma.student.update({
    where: { id: studentId },
    data: updateData,
  });

  await prisma.studentHistory.create({
    data: {
      studentId,
      action: 'STATUS_CHANGED',
      description: historyLogs.join('; '),
      performedBy: 'Admin',
    },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Student Status Updated',
      description: `Updated status for ${updated.name} (${updated.studentCode}): ${historyLogs.join(', ')}.`,
      type: 'STUDENT',
    },
  });

  res.status(200).json(updated);
});

// DELETE /students/:id - Delete student
export const deleteStudent: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(String(id), 10);

  if (isNaN(studentId)) {
    res.status(400).json({ message: 'Invalid student ID' });
    return;
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  await prisma.student.delete({
    where: { id: studentId },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Student Removed',
      description: `Deleted student record ${student.name} (${student.studentCode}).`,
      type: 'STUDENT',
    },
  });

  res.status(200).json({ message: 'Student deleted successfully', id: studentId });
});

// GET /students/:id/history - Get student audit trail history
export const getStudentHistory: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(String(id), 10);

  if (isNaN(studentId)) {
    res.status(400).json({ message: 'Invalid student ID' });
    return;
  }

  const histories = await prisma.studentHistory.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json(histories);
});
