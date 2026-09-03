import { RequestHandler } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { StudentStatus, PaymentStatus } from '../types/enums';

/**
 * Checks whether a student meets the criteria for ID Card generation:
 * 1. Enrolled (status === ENROLLED)
 * 2. Tuition/Fee Paid (paymentStatus === PAID)
 * 3. Application Approved (if applications exist, at least one must be APPROVED)
 */
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

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

// GET /id-cards - List students with ID card status & eligibility
export const getIdCards: RequestHandler = asyncHandler(async (req, res) => {
  const { search, statusFilter, department, page = '1', limit = '10' } = req.query;

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
        applications: {
          select: { id: true, status: true, program: true },
        },
        partnerSchool: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.student.count({ where: whereClause }),
  ]);

  const mappedStudents = allStudents.map((student: any) => {
    const eligibility = checkStudentEligibility(student);
    return {
      ...student,
      isEligible: eligibility.eligible,
      eligibilityReasons: eligibility.reasons,
    };
  });

  // Filter in memory if statusFilter is provided
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

  // Overall statistics
  const totalCardsGenerated = mappedStudents.filter((s: any) => s.idCard && s.idCard.status === 'ACTIVE').length;
  const totalEligible = mappedStudents.filter((s: any) => s.isEligible).length;
  const totalPendingGeneration = mappedStudents.filter((s: any) => s.isEligible && (!s.idCard || s.idCard.status !== 'ACTIVE')).length;
  const totalRevoked = mappedStudents.filter((s: any) => s.idCard && s.idCard.status === 'REVOKED').length;

  res.status(200).json({
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
  });
});

// GET /id-cards/:studentId - Get specific student ID card details & school settings
export const getIdCardByStudentId: RequestHandler = asyncHandler(async (req, res) => {
  const studentIdParam = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;
  const idNum = parseInt(studentIdParam || '', 10);

  if (isNaN(idNum)) {
    res.status(400).json({ message: 'Invalid student ID.' });
    return;
  }

  const [student, organization] = await Promise.all([
    prisma.student.findUnique({
      where: { id: idNum },
      include: {
        idCard: true,
        applications: true,
        partnerSchool: true,
      },
    }),
    prisma.organizationSetting.findFirst(),
  ]);

  if (!student) {
    res.status(404).json({ message: 'Student not found.' });
    return;
  }

  const eligibility = checkStudentEligibility(student);

  res.status(200).json({
    student: {
      ...student,
      isEligible: eligibility.eligible,
      eligibilityReasons: eligibility.reasons,
    },
    organization: organization || {
      orgName: 'School Management Institute',
      slogan: 'Excellence in Education',
      primaryEmail: 'info@school.edu',
      supportPhone: '+1 800-555-0199',
    },
  });
});

// POST /id-cards/generate - Generate or re-issue an ID Card
export const generateIdCard: RequestHandler = asyncHandler(async (req, res) => {
  const { studentId, validYears = 4 } = req.body;
  const idNum = parseInt(studentId, 10);

  if (isNaN(idNum)) {
    res.status(400).json({ message: 'Valid student ID is required.' });
    return;
  }

  const student = await prisma.student.findUnique({
    where: { id: idNum },
    include: {
      idCard: true,
      applications: true,
    },
  });

  if (!student) {
    res.status(404).json({ message: 'Student not found.' });
    return;
  }

  // Validate Eligibility
  const eligibility = checkStudentEligibility(student);
  if (!eligibility.eligible) {
    res.status(400).json({
      message: 'Student is not eligible for ID Card generation.',
      reasons: eligibility.reasons,
    });
    return;
  }

  const issueDate = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(issueDate.getFullYear() + (parseInt(validYears, 10) || 4));

  const cardNumber = `IDC-${issueDate.getFullYear()}-${student.studentCode}`;
  const verificationToken = crypto.randomUUID();

  let idCard;
  if (student.idCard) {
    // Update existing ID card
    idCard = await prisma.idCard.update({
      where: { id: student.idCard.id },
      data: {
        cardNumber,
        expiryDate,
        verificationToken,
        status: 'ACTIVE',
        issueDate,
      },
    });
  } else {
    // Create new ID card
    idCard = await prisma.idCard.create({
      data: {
        cardNumber,
        studentId: student.id,
        issueDate,
        expiryDate,
        verificationToken,
        status: 'ACTIVE',
      },
    });
  }

  // Log activity
  await prisma.activityLog.create({
    data: {
      title: 'Student ID Card Generated',
      description: `Generated ID Card (${cardNumber}) for student ${student.name} (${student.studentCode}).`,
      type: 'ID_CARD',
    },
  });

  res.status(201).json({
    message: 'Student ID Card successfully generated.',
    idCard,
  });
});

// POST /id-cards/:studentId/revoke - Revoke an existing ID Card
export const revokeIdCard: RequestHandler = asyncHandler(async (req, res) => {
  const studentIdParam = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;
  const idNum = parseInt(studentIdParam || '', 10);

  if (isNaN(idNum)) {
    res.status(400).json({ message: 'Invalid student ID.' });
    return;
  }

  const existingCard = await prisma.idCard.findUnique({
    where: { studentId: idNum },
    include: { student: true },
  });

  if (!existingCard) {
    res.status(404).json({ message: 'No ID Card found for this student.' });
    return;
  }

  const updatedCard = await prisma.idCard.update({
    where: { id: existingCard.id },
    data: { status: 'REVOKED' },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      title: 'Student ID Card Revoked',
      description: `Revoked ID Card (${existingCard.cardNumber}) for student ${existingCard.student.name}.`,
      type: 'ID_CARD',
    },
  });

  res.status(200).json({
    message: 'ID Card has been revoked.',
    idCard: updatedCard,
  });
});

// GET /id-cards/verify/:token - Public QR verification endpoint
export const verifyIdCard: RequestHandler = asyncHandler(async (req, res) => {
  const tokenParam = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  const token = (tokenParam || '').trim();

  if (!token) {
    res.status(400).json({ valid: false, message: 'Verification token is required.' });
    return;
  }

  const idCardRecord = await prisma.idCard.findUnique({
    where: { verificationToken: token },
    include: {
      student: {
        include: {
          partnerSchool: true,
        },
      },
    },
  });

  const organization = await prisma.organizationSetting.findFirst();

  const defaultOrg = organization || {
    orgName: 'School Management System',
    slogan: 'Official Academic Portal',
    primaryEmail: 'admin@school.edu',
    websiteUrl: 'https://school.edu',
  };

  if (!idCardRecord) {
    res.status(404).json({
      valid: false,
      status: 'NOT_FOUND',
      message: 'Invalid or non-existent Student ID Card token.',
      organization: defaultOrg,
    });
    return;
  }

  const isExpired = new Date() > new Date(idCardRecord.expiryDate);
  const isRevoked = idCardRecord.status === 'REVOKED';

  if (isRevoked) {
    res.status(200).json({
      valid: false,
      status: 'REVOKED',
      message: 'WARNING: This Student ID Card has been REVOKED by administration.',
      idCard: idCardRecord,
      student: idCardRecord.student,
      organization: defaultOrg,
      verifiedAt: new Date().toISOString(),
    });
    return;
  }

  if (isExpired) {
    res.status(200).json({
      valid: false,
      status: 'EXPIRED',
      message: 'EXPIRED: This Student ID Card has passed its valid expiry date.',
      idCard: idCardRecord,
      student: idCardRecord.student,
      organization: defaultOrg,
      verifiedAt: new Date().toISOString(),
    });
    return;
  }

  res.status(200).json({
    valid: true,
    status: 'ACTIVE',
    message: 'VERIFIED: Official Student ID Card is VALID and ACTIVE.',
    idCard: idCardRecord,
    student: idCardRecord.student,
    organization: defaultOrg,
    verifiedAt: new Date().toISOString(),
  });
});
