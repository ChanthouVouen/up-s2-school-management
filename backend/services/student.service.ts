import prisma from '../lib/prisma';
import { getStudentForUser } from '../utils/resolveStudent';
import { StudentStatus, PaymentStatus } from '../types/enums';

export async function getMyProfileService(userId: string) {
  const student = await getStudentForUser(userId);
  if (!student) {
    throw new Error('No student profile linked to this account');
  }

  return prisma.student.findUnique({
    where: { id: student.id },
    include: {
      applications: { orderBy: { createdAt: 'desc' } },
      _count: { select: { documents: true, payments: true } },
    },
  });
}

export async function getStudentsService(query: Record<string, any>) {
  const { search, status, paymentStatus, department, page = '1', limit = '10' } = query;
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
        partnerSchool: { include: { mous: { orderBy: { endDate: 'desc' } } } },
        histories: { orderBy: { createdAt: 'desc' }, take: 5 },
        applications: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { documents: true, applications: true, histories: true } },
      },
    }),
  ]);

  return {
    data: students,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };
}

export async function getStudentByIdService(idParam: string) {
  const studentId = parseInt(String(idParam), 10);
  if (isNaN(studentId)) throw new Error('Invalid student ID');

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      partnerSchool: { include: { mous: { orderBy: { endDate: 'desc' } } } },
      applications: { orderBy: { createdAt: 'desc' } },
      documents: { orderBy: { uploadedAt: 'desc' } },
      histories: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!student) throw new Error('Student not found');
  return student;
}

export async function createStudentService(body: any, userName?: string) {
  const { name, email, phone, gender, dob, address, status, paymentStatus, department, studentCode, partnerSchoolId, photoUrl, scholarshipTrack, specialCode, scholarshipNotes } = body;

  if (!name || name.trim() === '') {
    throw new Error('Student name is required');
  }

  let code = studentCode;
  if (!code || code.trim() === '') {
    const year = new Date().getFullYear();
    const count = await prisma.student.count();
    code = `STU-${year}-${(count + 1).toString().padStart(3, '0')}`;
  }

  let resolvedPartnerSchoolId: number | null = null;
  const initialHistories: any[] = [{
    action: 'STUDENT_CREATED',
    description: `Registered new student profile (${code.trim()}).`,
    performedBy: userName || 'Admin',
  }];

  if (scholarshipTrack === 'GRADE_A') {
    const grade = body.gradeLetter ? String(body.gradeLetter).trim().toUpperCase() : 'A';
    const val = body.gradeDiscountValue !== undefined ? body.gradeDiscountValue : 100;
    const typeLabel = body.gradeDiscountType === 'FIXED_AMOUNT' ? '$' : '%';
    initialHistories.push({
      action: 'SCHOLARSHIP_AWARDED',
      description: `🏆 National Exam Grade ${grade} Merit Scholarship: ${val}${typeLabel} Tuition Waiver awarded. ${scholarshipNotes || ''}`.trim(),
      performedBy: userName || 'Admin',
    });
  } else if (scholarshipTrack === 'SPECIAL_CODE') {
    const codeStr = String(specialCode || '').trim().toUpperCase();
    if (!codeStr) {
      throw new Error('A scholarship promo code is required.');
    }
    const codeObj = await prisma.scholarshipCode.findFirst({ where: { code: codeStr, active: true } });
    if (!codeObj) throw new Error(`Invalid or inactive scholarship code: "${codeStr}".`);
    await prisma.scholarshipCode.update({ where: { id: codeObj.id }, data: { usedCount: { increment: 1 } } });
    const val = `${codeObj.discountValue}${codeObj.discountType === 'FIXED_AMOUNT' ? '$' : '%'}`;
    initialHistories.push({
      action: 'SCHOLARSHIP_AWARDED',
      description: `🎟️ Special Scholarship Code applied: ${codeStr} (${val} Tuition Reduction). ${scholarshipNotes || ''}`.trim(),
      performedBy: userName || 'Admin',
    });
  } else if (scholarshipTrack === 'MOU_PARTNER' && partnerSchoolId) {
    resolvedPartnerSchoolId = Number(partnerSchoolId);
    const partner = await prisma.partnerSchool.findUnique({ where: { id: resolvedPartnerSchoolId }, include: { mous: { where: { status: 'ACTIVE' }, take: 1 } } });
    const discountInfo = partner?.mous?.[0] ? `${partner.mous[0].discountValue}${partner.mous[0].discountType === 'PERCENTAGE' ? '%' : '$'} discount` : 'partner agreement';
    initialHistories.push({
      action: 'SCHOLARSHIP_AWARDED',
      description: `🏫 MOU Partner School: ${partner?.name || 'Partner School'} (${discountInfo}). ${scholarshipNotes || ''}`.trim(),
      performedBy: userName || 'Admin',
    });
  } else if (partnerSchoolId) {
    resolvedPartnerSchoolId = Number(partnerSchoolId);
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
      photoUrl: photoUrl ? photoUrl.trim() : null,
      status: status && Object.values(StudentStatus).includes(status) ? status : StudentStatus.ENROLLED,
      paymentStatus: paymentStatus && Object.values(PaymentStatus).includes(paymentStatus) ? paymentStatus : PaymentStatus.UNPAID,
      department: department ? department.trim() : null,
      partnerSchoolId: resolvedPartnerSchoolId,
      histories: { create: initialHistories },
    },
    include: { partnerSchool: { include: { mous: { orderBy: { endDate: 'desc' } } } }, histories: true },
  });

  await prisma.activityLog.create({
    data: { title: 'New Student Registered', description: `Student ${newStudent.name} (${newStudent.studentCode}) was created.`, type: 'STUDENT' },
  });

  return newStudent;
}

export async function updateStudentService(idParam: string, body: any, userName?: string) {
  const studentId = parseInt(String(idParam), 10);
  if (isNaN(studentId)) throw new Error('Invalid student ID');

  const existingStudent = await prisma.student.findUnique({ where: { id: studentId } });
  if (!existingStudent) throw new Error('Student not found');

  const { name, email, phone, gender, dob, address, status, paymentStatus, department, partnerSchoolId, photoUrl, scholarshipTrack, specialCode, scholarshipNotes } = body;
  const changes: string[] = [];
  if (name && name !== existingStudent.name) changes.push(`Name changed from "${existingStudent.name}" to "${name}"`);
  if (status && status !== existingStudent.status) changes.push(`Status changed from "${existingStudent.status}" to "${status}"`);
  if (paymentStatus && paymentStatus !== existingStudent.paymentStatus) changes.push(`Payment status changed from "${existingStudent.paymentStatus}" to "${paymentStatus}"`);
  if (department !== undefined && department !== existingStudent.department) changes.push(`Department updated to "${department || 'None'}"`);

  let updatedPartnerSchoolId: number | null = existingStudent.partnerSchoolId;
  let scholarshipAwardDescription: string | null = null;

  if (scholarshipTrack !== undefined) {
    if (scholarshipTrack === 'NONE' || scholarshipTrack === null || scholarshipTrack === '') {
      updatedPartnerSchoolId = null;
      changes.push('Scholarship set to None (Standard Rate)');
      scholarshipAwardDescription = 'Scholarship status changed to None (Standard Rate / Non-Affiliated)';
    } else if (scholarshipTrack === 'GRADE_A') {
      updatedPartnerSchoolId = null;
      const grade = body.gradeLetter ? String(body.gradeLetter).trim().toUpperCase() : 'A';
      const val = body.gradeDiscountValue !== undefined ? body.gradeDiscountValue : 100;
      const typeLabel = body.gradeDiscountType === 'FIXED_AMOUNT' ? '$' : '%';
      changes.push(`Awarded Grade ${grade} Merit Scholarship (${val}${typeLabel} Waiver)`);
      scholarshipAwardDescription = `🏆 National Exam Grade ${grade} Merit Scholarship: ${val}${typeLabel} Tuition Waiver awarded. ${scholarshipNotes || ''}`.trim();
    } else if (scholarshipTrack === 'SPECIAL_CODE') {
      updatedPartnerSchoolId = null;
      const codeStr = String(specialCode || '').trim().toUpperCase();
      if (!codeStr) throw new Error('A scholarship promo code is required.');
      const codeObj = await prisma.scholarshipCode.findFirst({ where: { code: codeStr, active: true } });
      if (!codeObj) throw new Error(`Invalid or inactive scholarship code: "${codeStr}".`);
      await prisma.scholarshipCode.update({ where: { id: codeObj.id }, data: { usedCount: { increment: 1 } } });
      const val = `${codeObj.discountValue}${codeObj.discountType === 'FIXED_AMOUNT' ? '$' : '%'}`;
      changes.push(`Applied Special Scholarship Code: ${codeStr}`);
      scholarshipAwardDescription = `🎟️ Special Scholarship Code applied: ${codeStr} (${val} Tuition Reduction). ${scholarshipNotes || ''}`.trim();
    } else if (scholarshipTrack === 'MOU_PARTNER') {
      updatedPartnerSchoolId = partnerSchoolId ? Number(partnerSchoolId) : null;
      if (updatedPartnerSchoolId) {
        const partner = await prisma.partnerSchool.findUnique({ where: { id: updatedPartnerSchoolId }, include: { mous: { where: { status: 'ACTIVE' }, take: 1 } } });
        const discountInfo = partner?.mous?.[0] ? `${partner.mous[0].discountValue}${partner.mous[0].discountType === 'PERCENTAGE' ? '%' : '$'} discount` : 'partner agreement';
        changes.push(`Affiliated with partner school: ${partner?.name || 'Partner School'}`);
        scholarshipAwardDescription = `🏫 MOU Partner School: ${partner?.name || 'Partner School'} (${discountInfo}). ${scholarshipNotes || ''}`.trim();
      }
    }
  } else if (partnerSchoolId !== undefined) {
    updatedPartnerSchoolId = partnerSchoolId ? Number(partnerSchoolId) : null;
    if (updatedPartnerSchoolId !== existingStudent.partnerSchoolId) changes.push('Partner Institution updated.');
  }

  const updatedStudent = await prisma.student.update({
    where: { id: studentId },
    data: {
      name: name ? name.trim() : existingStudent.name,
      email: email !== undefined ? (email ? email.trim() : null) : existingStudent.email,
      phone: phone !== undefined ? (phone ? phone.trim() : null) : existingStudent.phone,
      gender: gender !== undefined ? (gender ? gender.trim() : null) : existingStudent.gender,
      dob: dob ? new Date(dob) : existingStudent.dob,
      address: address !== undefined ? (address ? address.trim() : null) : existingStudent.address,
      photoUrl: photoUrl !== undefined ? (photoUrl ? photoUrl.trim() : null) : (existingStudent as any).photoUrl,
      status: status && Object.values(StudentStatus).includes(status) ? status : existingStudent.status,
      paymentStatus: paymentStatus && Object.values(PaymentStatus).includes(paymentStatus) ? paymentStatus : existingStudent.paymentStatus,
      department: department !== undefined ? (department ? department.trim() : null) : existingStudent.department,
      partnerSchoolId: updatedPartnerSchoolId,
    },
    include: { partnerSchool: { include: { mous: { orderBy: { endDate: 'desc' } } } } },
  });

  if (scholarshipAwardDescription) {
    await prisma.studentHistory.create({
      data: { studentId, action: 'SCHOLARSHIP_AWARDED', description: scholarshipAwardDescription, performedBy: userName || 'Admin' },
    });
  }

  if (changes.length > 0) {
    await prisma.studentHistory.create({
      data: { studentId, action: 'PROFILE_UPDATED', description: changes.join('; '), performedBy: 'Admin' },
    });

    await prisma.activityLog.create({
      data: { title: 'Student Updated', description: `Student profile ${updatedStudent.name} (${updatedStudent.studentCode}) updated.`, type: 'STUDENT' },
    });
  }

  return updatedStudent;
}

export async function updateStudentStatusService(idParam: string, body: any) {
  const studentId = parseInt(String(idParam), 10);
  if (isNaN(studentId)) throw new Error('Invalid student ID');

  const existingStudent = await prisma.student.findUnique({ where: { id: studentId } });
  if (!existingStudent) throw new Error('Student not found');

  const { status, paymentStatus } = body;
  return prisma.student.update({
    where: { id: studentId },
    data: {
      status: status && Object.values(StudentStatus).includes(status) ? status : existingStudent.status,
      paymentStatus: paymentStatus && Object.values(PaymentStatus).includes(paymentStatus) ? paymentStatus : existingStudent.paymentStatus,
    },
  });
}

export async function deleteStudentService(idParam: string) {
  const studentId = parseInt(String(idParam), 10);
  if (isNaN(studentId)) throw new Error('Invalid student ID');

  const existingStudent = await prisma.student.findUnique({ where: { id: studentId } });
  if (!existingStudent) throw new Error('Student not found');

  await prisma.student.delete({ where: { id: studentId } });
  await prisma.activityLog.create({
    data: { title: 'Student Profile Deleted', description: `Student ${existingStudent.name} (${existingStudent.studentCode}) was deleted.`, type: 'STUDENT' },
  });

  return { message: 'Student deleted successfully', id: studentId };
}

export async function getStudentHistoryService(idParam: string) {
  const studentId = parseInt(String(idParam), 10);
  if (isNaN(studentId)) throw new Error('Invalid student ID');

  return prisma.studentHistory.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
  });
}
