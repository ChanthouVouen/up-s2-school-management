import crypto from 'crypto';
import prisma from '../lib/prisma';
import { StudentStatus, PaymentStatus } from '../types/enums';

export function checkStudentEligibility(student: any): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (student.status !== StudentStatus.ENROLLED) {
    reasons.push(`Student status is "${student.status}" (must be ENROLLED).`);
  }

  if (student.paymentStatus !== PaymentStatus.PAID) {
    reasons.push(`Payment status is "${student.paymentStatus}" (must be PAID).`);
  }

  if (student.applications && student.applications.length > 0) {
    const hasApproved = student.applications.some((app: any) => app.status === 'APPROVED');
    if (!hasApproved) {
      reasons.push('Student admission application has not been APPROVED.');
    }
  }

  return { eligible: reasons.length === 0, reasons };
}

export async function getIdCardsService(query: Record<string, any>) {
  const { search, statusFilter, department, page = '1', limit = '10' } = query;
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

  if (department && (department as string).trim() !== '') {
    whereClause.department = { contains: (department as string).trim() };
  }

  const [allStudents, totalCount] = await Promise.all([
    prisma.student.findMany({
      where: whereClause,
      include: {
        idCard: true,
        applications: { select: { id: true, status: true, program: true } },
        partnerSchool: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.student.count({ where: whereClause }),
  ]);

  const mappedStudents = allStudents.map((student: any) => {
    const eligibility = checkStudentEligibility(student);
    return { ...student, isEligible: eligibility.eligible, eligibilityReasons: eligibility.reasons };
  });

  let filtered = mappedStudents;
  if (statusFilter === 'GENERATED') {
    filtered = mappedStudents.filter((s: any) => s.idCard && s.idCard.status === 'ACTIVE');
  } else if (statusFilter === 'ELIGIBLE') {
    filtered = mappedStudents.filter((s: any) => s.isEligible && (!s.idCard || s.idCard.status !== 'ACTIVE'));
  } else if (statusFilter === 'INELIGIBLE') {
    filtered = mappedStudents.filter((s: any) => !s.isEligible);
  } else if (statusFilter === 'REVOKED') {
    filtered = mappedStudents.filter((s: any) => s.idCard && s.idCard.status === 'REVOKED');
  }

  const paginated = filtered.slice(skip, skip + limitNum);
  const totalCardsGenerated = mappedStudents.filter((s: any) => s.idCard && s.idCard.status === 'ACTIVE').length;
  const totalEligible = mappedStudents.filter((s: any) => s.isEligible).length;
  const totalPendingGeneration = mappedStudents.filter((s: any) => s.isEligible && (!s.idCard || s.idCard.status !== 'ACTIVE')).length;
  const totalRevoked = mappedStudents.filter((s: any) => s.idCard && s.idCard.status === 'REVOKED').length;

  return {
    data: paginated,
    meta: {
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filtered.length / limitNum) || 1,
    },
    stats: {
      totalStudents: mappedStudents.length,
      totalCardsGenerated,
      totalEligible,
      totalPendingGeneration,
      totalRevoked,
    },
    totalCount,
  };
}

export async function getIdCardByStudentIdService(studentIdParam: string) {
  const idNum = parseInt(studentIdParam || '', 10);
  if (isNaN(idNum)) {
    throw new Error('Invalid student ID.');
  }

  const [student, organization] = await Promise.all([
    prisma.student.findUnique({
      where: { id: idNum },
      include: { idCard: true, applications: true, partnerSchool: true },
    }),
    prisma.organizationSetting.findFirst(),
  ]);

  if (!student) {
    throw new Error('Student not found.');
  }

  const eligibility = checkStudentEligibility(student);
  return {
    student: { ...student, isEligible: eligibility.eligible, eligibilityReasons: eligibility.reasons },
    organization: organization || {
      orgName: 'School Management Institute',
      slogan: 'Excellence in Education',
      primaryEmail: 'info@school.edu',
      supportPhone: '+1 800-555-0199',
    },
  };
}

export async function generateIdCardService(studentId: string, validYears: number | string = 4) {
  const idNum = parseInt(studentId, 10);
  if (isNaN(idNum)) {
    throw new Error('Valid student ID is required.');
  }

  const student = await prisma.student.findUnique({
    where: { id: idNum },
    include: { idCard: true, applications: true },
  });

  if (!student) {
    throw new Error('Student not found.');
  }

  const eligibility = checkStudentEligibility(student);
  if (!eligibility.eligible) {
    throw new Error('Student is not eligible for ID Card generation.');
  }

  const issueDate = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(issueDate.getFullYear() + (parseInt(String(validYears), 10) || 4));

  const cardNumber = `IDC-${issueDate.getFullYear()}-${student.studentCode}`;
  const verificationToken = crypto.randomUUID();

  const idCard = student.idCard
    ? await prisma.idCard.update({
        where: { id: student.idCard.id },
        data: { cardNumber, expiryDate, verificationToken, status: 'ACTIVE', issueDate },
      })
    : await prisma.idCard.create({
        data: { cardNumber, studentId: student.id, issueDate, expiryDate, verificationToken, status: 'ACTIVE' },
      });

  await prisma.activityLog.create({
    data: {
      title: 'Student ID Card Generated',
      description: `Generated ID Card (${cardNumber}) for student ${student.name} (${student.studentCode}).`,
      type: 'ID_CARD',
    },
  });

  return { message: 'Student ID Card successfully generated.', idCard };
}

export async function revokeIdCardService(studentIdParam: string) {
  const idNum = parseInt(studentIdParam || '', 10);
  if (isNaN(idNum)) {
    throw new Error('Invalid student ID.');
  }

  const existingCard = await prisma.idCard.findUnique({
    where: { studentId: idNum },
    include: { student: true },
  });

  if (!existingCard) {
    throw new Error('No ID Card found for this student.');
  }

  const updatedCard = await prisma.idCard.update({
    where: { id: existingCard.id },
    data: { status: 'REVOKED' },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Student ID Card Revoked',
      description: `Revoked ID Card (${existingCard.cardNumber}) for student ${existingCard.student.name}.`,
      type: 'ID_CARD',
    },
  });

  return { message: 'ID Card has been revoked.', idCard: updatedCard };
}

export async function verifyIdCardService(tokenParam: string) {
  const token = (tokenParam || '').trim();
  if (!token) {
    throw new Error('Verification token is required.');
  }

  const idCardRecord = await prisma.idCard.findUnique({
    where: { verificationToken: token },
    include: { student: { include: { partnerSchool: true } } },
  });

  const organization = await prisma.organizationSetting.findFirst();
  const defaultOrg = organization || {
    orgName: 'School Management System',
    slogan: 'Official Academic Portal',
    primaryEmail: 'admin@school.edu',
    websiteUrl: 'https://school.edu',
  };

  if (!idCardRecord) {
    return { valid: false, status: 'NOT_FOUND', message: 'Invalid or non-existent Student ID Card token.', organization: defaultOrg };
  }

  const isExpired = new Date() > new Date(idCardRecord.expiryDate);
  const isRevoked = idCardRecord.status === 'REVOKED';

  if (isRevoked) {
    return {
      valid: false,
      status: 'REVOKED',
      message: 'WARNING: This Student ID Card has been REVOKED by administration.',
      idCard: idCardRecord,
      student: idCardRecord.student,
      organization: defaultOrg,
      verifiedAt: new Date().toISOString(),
    };
  }

  if (isExpired) {
    return {
      valid: false,
      status: 'EXPIRED',
      message: 'EXPIRED: This Student ID Card has passed its valid expiry date.',
      idCard: idCardRecord,
      student: idCardRecord.student,
      organization: defaultOrg,
      verifiedAt: new Date().toISOString(),
    };
  }

  return {
    valid: true,
    status: 'ACTIVE',
    message: 'VERIFIED: Official Student ID Card is VALID and ACTIVE.',
    idCard: idCardRecord,
    student: idCardRecord.student,
    organization: defaultOrg,
    verifiedAt: new Date().toISOString(),
  };
}
