import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

function applicationCode(id: number, createdAt: Date) {
  return `APP-${createdAt.getFullYear()}-${String(id).padStart(4, '0')}`;
}

export interface SpecialScholarshipCode {
  id: string;
  code: string;
  title: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  description: string | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: Date | string | null;
}

export interface GradeScholarship {
  id: string;
  grade: string;
  title: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  description: string | null;
  active: boolean;
}

// GET /scholarships/codes - List all available promo codes from database
export const getScholarshipCodes: RequestHandler = asyncHandler(async (_req, res) => {
  const data = await prisma.scholarshipCode.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({ data });
});

// POST /scholarships/validate-code - Validate a promo code (Used in student /apply form)
export const validateScholarshipCode: RequestHandler = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    res.status(400).json({ valid: false, message: 'Scholarship code is required' });
    return;
  }

  const normalized = code.trim().toUpperCase();
  const matched = await prisma.scholarshipCode.findFirst({
    where: { code: normalized, active: true },
  });

  if (!matched) {
    res.status(404).json({ valid: false, message: 'Invalid or inactive scholarship code' });
    return;
  }

  if (matched.maxUses && matched.usedCount >= matched.maxUses) {
    res.status(400).json({ valid: false, message: 'This scholarship code has reached its maximum quota limit' });
    return;
  }

  if (matched.expiresAt && new Date(matched.expiresAt) < new Date()) {
    res.status(400).json({ valid: false, message: 'This scholarship code has expired' });
    return;
  }

  res.status(200).json({
    valid: true,
    data: matched,
    message: `Code applied: ${matched.title} (${matched.discountValue}${matched.discountType === 'PERCENTAGE' ? '%' : '$'} Off)`,
  });
});

// POST /scholarships/codes - Generate / Create a new scholarship code in database
export const createScholarshipCode: RequestHandler = asyncHandler(async (req, res) => {
  const { code, title, discountType, discountValue, description, maxUses, expiresAt } = req.body;

  if (!code || !title || discountValue === undefined) {
    res.status(400).json({ message: 'Code, title, and discountValue are required' });
    return;
  }

  const normalizedCode = String(code).trim().toUpperCase();
  const existing = await prisma.scholarshipCode.findUnique({
    where: { code: normalizedCode },
  });
  if (existing) {
    res.status(409).json({ message: `Scholarship code '${normalizedCode}' already exists` });
    return;
  }

  const newCode = await prisma.scholarshipCode.create({
    data: {
      code: normalizedCode,
      title: String(title).trim(),
      discountType: discountType === 'FIXED_AMOUNT' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
      discountValue: Math.max(1, Number(discountValue)),
      description: String(description || 'Special institutional grant voucher.').trim(),
      maxUses: maxUses ? Number(maxUses) : null,
      usedCount: 0,
      active: true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Scholarship Code Created',
      description: `Generated scholarship code ${newCode.code} (${newCode.discountValue}${newCode.discountType === 'PERCENTAGE' ? '%' : '$'} Off)`,
      type: 'ROLE',
    },
  });

  res.status(201).json({ message: 'Scholarship code created successfully', data: newCode });
});

// GET /scholarships/overview - Aggregate scholarship statistics
export const getScholarshipOverview: RequestHandler = asyncHandler(async (_req, res) => {
  const [activeMous, awardedStudentsCount, pendingApplicantsCount, activePartnersCount] = await Promise.all([
    prisma.mou.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        discountType: true,
        discountValue: true,
        maxEligibleStudents: true,
        partnerSchoolId: true,
      },
    }),
    prisma.student.count({
      where: {
        OR: [
          { partnerSchoolId: { not: null } },
          { histories: { some: { action: 'SCHOLARSHIP_AWARDED' } } },
        ],
      },
    }),
    prisma.application.count({
      where: {
        scholarshipRequested: true,
        status: { notIn: ['ENROLLED', 'REJECTED'] },
      },
    }),
    prisma.partnerSchool.count({
      where: {
        status: 'ACTIVE',
        mous: { some: { status: 'ACTIVE' } },
      },
    }),
  ]);

  const totalQuota = activeMous.reduce((sum, mou) => sum + (mou.maxEligibleStudents ?? 0), 0);
  const quotaUtilizationRate = totalQuota > 0 ? Math.min(100, Math.round((awardedStudentsCount / totalQuota) * 100)) : 0;

  res.status(200).json({
    activeSchemesCount: activeMous.length,
    awardedStudentsCount,
    pendingApplicantsCount,
    activePartnersCount,
    totalQuota,
    quotaUtilizationRate,
  });
});

// GET /scholarships/schemes - List active scholarship programs
export const getScholarshipSchemes: RequestHandler = asyncHandler(async (_req, res) => {
  const [mouSchemes, specialCodes, gradeScholarships] = await Promise.all([
    prisma.mou.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { discountValue: 'desc' },
      include: {
        partnerSchool: {
          select: {
            id: true,
            name: true,
            city: true,
            type: true,
            logoUrl: true,
            status: true,
            _count: {
              select: { students: true, applications: true },
            },
          },
        },
      },
    }),
    prisma.scholarshipCode.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.gradeScholarship.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const formattedMous = mouSchemes.map((mou) => ({
    id: `mou-${mou.id}`,
    track: 'MOU_PARTNER' as const,
    partnerSchoolId: mou.partnerSchoolId,
    schoolName: mou.partnerSchool.name,
    schoolCity: mou.partnerSchool.city,
    schoolType: mou.partnerSchool.type,
    logoUrl: mou.partnerSchool.logoUrl,
    mouTitle: mou.mouTitle,
    discountType: mou.discountType,
    discountValue: mou.discountValue,
    maxEligibleStudents: mou.maxEligibleStudents,
    enrolledCount: mou.partnerSchool._count.students,
    applicationsCount: mou.partnerSchool._count.applications,
    startDate: mou.startDate,
    endDate: mou.endDate,
    status: mou.status,
    notes: mou.notes,
  }));

  res.status(200).json({
    data: formattedMous,
    specialCodes,
    gradeScholarships,
  });
});

// GET /scholarships/beneficiaries - Combined list of scholarship recipients & applicants
export const getScholarshipBeneficiaries: RequestHandler = asyncHandler(async (req, res) => {
  const { search, type } = req.query;
  const searchStr = typeof search === 'string' ? search.trim().toLowerCase() : '';
  const filterType = typeof type === 'string' ? type.toUpperCase() : 'ALL';

  const results: any[] = [];

  // 1. Fetch enrolled students with partner school affiliation OR scholarship award history
  if (filterType === 'ALL' || filterType === 'STUDENT') {
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { partnerSchoolId: { not: null } },
          { histories: { some: { action: 'SCHOLARSHIP_AWARDED' } } },
        ],
      },
      include: {
        partnerSchool: {
          include: {
            mous: {
              where: { status: 'ACTIVE' },
              orderBy: { endDate: 'desc' },
              take: 1,
            },
          },
        },
        histories: {
          where: { action: 'SCHOLARSHIP_AWARDED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        applications: {
          select: { id: true, scholarshipRequested: true, scholarshipDetails: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const student of students) {
      const activeMou = student.partnerSchool?.mous?.[0];
      const awardHistory = student.histories[0]?.description || '';
      const appDetails = student.applications[0]?.scholarshipDetails || '';

      // Determine track
      let track: 'GRADE_A' | 'SPECIAL_CODE' | 'MOU_PARTNER' = 'MOU_PARTNER';
      let discountLabel = 'Partner Affiliated';

      if (awardHistory.includes('Grade') || appDetails.includes('Grade')) {
        track = 'GRADE_A';
        discountLabel = awardHistory.split('.')[0] || appDetails || '🏆 Grade Merit Waiver';
      } else if (awardHistory.includes('Special Code') || appDetails.includes('Special') || appDetails.includes('Code')) {
        track = 'SPECIAL_CODE';
        discountLabel = awardHistory || appDetails || '🎟️ Special Promo Code';
      } else if (activeMou) {
        discountLabel = activeMou.discountType === 'PERCENTAGE'
          ? `${activeMou.discountValue}% Waiver`
          : `$${activeMou.discountValue} Grant`;
      }

      results.push({
        id: `student-${student.id}`,
        rawId: student.id,
        kind: 'STUDENT',
        track,
        name: student.name,
        code: student.studentCode,
        email: student.email,
        phone: student.phone,
        program: student.department || 'General Academic',
        partnerSchoolId: student.partnerSchoolId,
        partnerSchoolName: student.partnerSchool?.name || (track === 'GRADE_A' ? 'National Examination Board' : 'Institutional Grant'),
        partnerSchoolCity: student.partnerSchool?.city,
        discountLabel,
        discountType: activeMou?.discountType || 'PERCENTAGE',
        discountValue: activeMou?.discountValue || (track === 'GRADE_A' ? 100 : 50),
        status: student.status,
        paymentStatus: student.paymentStatus,
        date: student.createdAt,
      });
    }
  }

  // 2. Fetch applicants requesting scholarships
  if (filterType === 'ALL' || filterType === 'APPLICANT') {
    const applications = await prisma.application.findMany({
      where: {
        scholarshipRequested: true,
      },
      include: {
        partnerSchool: {
          include: {
            mous: {
              where: { status: 'ACTIVE' },
              orderBy: { endDate: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const app of applications) {
      const activeMou = app.partnerSchool?.mous?.[0];
      const details = app.scholarshipDetails || '';

      let track: 'GRADE_A' | 'SPECIAL_CODE' | 'MOU_PARTNER' = 'MOU_PARTNER';
      let discountLabel = details || 'Scholarship Requested';

      if (details.includes('Grade')) {
        track = 'GRADE_A';
        discountLabel = details.split('.')[0] || '🏆 Grade Merit Applicant';
      } else if (details.includes('Code') || details.includes('Voucher')) {
        track = 'SPECIAL_CODE';
      } else if (activeMou) {
        discountLabel = activeMou.discountType === 'PERCENTAGE'
          ? `${activeMou.discountValue}% Waiver`
          : `$${activeMou.discountValue} Grant`;
      }

      results.push({
        id: `app-${app.id}`,
        rawId: app.id,
        kind: 'APPLICANT',
        track,
        name: app.applicantName,
        code: applicationCode(app.id, app.createdAt),
        email: app.email,
        phone: null,
        program: app.program,
        partnerSchoolId: app.partnerSchoolId,
        partnerSchoolName: app.partnerSchool?.name || (track === 'GRADE_A' ? 'High School BacII Honor' : 'Applicant Candidate'),
        partnerSchoolCity: app.partnerSchool?.city,
        discountLabel,
        discountType: activeMou?.discountType || null,
        discountValue: activeMou?.discountValue || null,
        status: app.status,
        paymentStatus: null,
        date: app.createdAt,
      });
    }
  }

  // Filter in memory for combined multi-model search
  let filtered = results;
  if (searchStr) {
    filtered = results.filter(
      (item) =>
        item.name.toLowerCase().includes(searchStr) ||
        item.code.toLowerCase().includes(searchStr) ||
        (item.email && item.email.toLowerCase().includes(searchStr)) ||
        (item.program && item.program.toLowerCase().includes(searchStr)) ||
        (item.partnerSchoolName && item.partnerSchoolName.toLowerCase().includes(searchStr)) ||
        (item.discountLabel && item.discountLabel.toLowerCase().includes(searchStr))
    );
  }

  res.status(200).json({
    data: filtered,
    total: filtered.length,
  });
});

// PUT /scholarships/codes/:id - Update an existing promo code
export const updateScholarshipCode: RequestHandler = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const { code, title, discountType, discountValue, description, maxUses, expiresAt, active } = req.body;

  const existing = await prisma.scholarshipCode.findFirst({
    where: { OR: [{ id }, { code: id }] },
  });
  if (!existing) {
    res.status(404).json({ message: 'Scholarship code not found' });
    return;
  }

  let normalizedCode = existing.code;
  if (code) {
    normalizedCode = String(code).trim().toUpperCase();
    if (normalizedCode !== existing.code) {
      const duplicate = await prisma.scholarshipCode.findUnique({
        where: { code: normalizedCode },
      });
      if (duplicate) {
        res.status(409).json({ message: `Promo code '${normalizedCode}' already exists` });
        return;
      }
    }
  }

  const updated = await prisma.scholarshipCode.update({
    where: { id: existing.id },
    data: {
      code: normalizedCode,
      ...(title !== undefined && { title: String(title).trim() }),
      ...(discountType !== undefined && {
        discountType: discountType === 'FIXED_AMOUNT' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
      }),
      ...(discountValue !== undefined && { discountValue: Math.max(1, Number(discountValue)) }),
      ...(description !== undefined && { description: String(description).trim() }),
      ...(maxUses !== undefined && { maxUses: maxUses ? Number(maxUses) : null }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      ...(active !== undefined && { active: Boolean(active) }),
    },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Scholarship Code Updated',
      description: `Updated promo code ${updated.code} (${updated.discountValue}${updated.discountType === 'PERCENTAGE' ? '%' : '$'} Off)`,
      type: 'ROLE',
    },
  });

  res.status(200).json({ message: 'Scholarship code updated successfully', data: updated });
});

// DELETE /scholarships/codes/:id - Delete a promo code
export const deleteScholarshipCode: RequestHandler = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const existing = await prisma.scholarshipCode.findFirst({
    where: { OR: [{ id }, { code: id }] },
  });
  if (!existing) {
    res.status(404).json({ message: 'Scholarship code not found' });
    return;
  }

  const deleted = await prisma.scholarshipCode.delete({
    where: { id: existing.id },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Scholarship Code Deleted',
      description: `Deleted scholarship promo code ${deleted.code}`,
      type: 'ROLE',
    },
  });

  res.status(200).json({ message: 'Scholarship code deleted successfully', data: deleted });
});

// DELETE /scholarships/beneficiaries/:studentId - Revoke/remove scholarship from student
export const revokeScholarship: RequestHandler = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const parsedId = Number(studentId);

  const student = await prisma.student.findUnique({
    where: { id: parsedId },
    include: { applications: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  if (!student) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  await prisma.student.update({
    where: { id: parsedId },
    data: { partnerSchoolId: null },
  });

  if (student.applications && student.applications.length > 0) {
    await prisma.application.update({
      where: { id: student.applications[0].id },
      data: {
        scholarshipRequested: false,
        scholarshipDetails: null,
        discountType: null,
        discountValue: null,
      },
    });
  }

  await prisma.studentHistory.create({
    data: {
      studentId: parsedId,
      action: 'SCHOLARSHIP_REVOKED',
      description: 'Scholarship was removed by administrator.',
      performedBy: (req as any).user?.name || 'Staff',
    },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Scholarship Revoked',
      description: `Removed scholarship for student ${student.name} (${student.studentCode})`,
      type: 'STUDENT',
    },
  });

  res.status(200).json({ message: 'Scholarship removed successfully' });
});

// GET /scholarships/grades - List all grade scholarship programs
export const getGradeScholarships: RequestHandler = asyncHandler(async (_req, res) => {
  const data = await prisma.gradeScholarship.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({ data });
});

// POST /scholarships/grades - Create a new grade scholarship tier
export const createGradeScholarship: RequestHandler = asyncHandler(async (req, res) => {
  const { grade, title, discountType, discountValue, description } = req.body;
  if (!grade || !title || discountValue === undefined) {
    res.status(400).json({ message: 'Grade, title, and discountValue are required' });
    return;
  }

  const normalizedGrade = String(grade).trim().toUpperCase();
  const normalizedTitle = String(title).trim();
  const normalizedDiscountType = discountType === 'FIXED_AMOUNT' ? 'FIXED_AMOUNT' : 'PERCENTAGE';
  const parsedDiscountValue = Math.max(1, Number(discountValue));
  const desc = String(description || `National Exam Grade ${normalizedGrade} Merit Scholarship`).trim();

  const newTier = await prisma.gradeScholarship.create({
    data: {
      grade: normalizedGrade,
      title: normalizedTitle,
      discountType: normalizedDiscountType,
      discountValue: parsedDiscountValue,
      description: desc,
      active: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Grade Scholarship Created',
      description: `Created grade scholarship tier "${newTier.title}" for Grade ${newTier.grade} (${newTier.discountValue}${newTier.discountType === 'PERCENTAGE' ? '%' : '$'} Off)`,
      type: 'ROLE',
    },
  });

  res.status(201).json({ message: 'Grade scholarship created successfully', data: newTier });
});

// PUT /scholarships/grades/:id - Update an existing grade scholarship tier
export const updateGradeScholarship: RequestHandler = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const { grade, title, discountType, discountValue, description, active } = req.body;

  const existing = await prisma.gradeScholarship.findUnique({
    where: { id },
  });
  if (!existing) {
    res.status(404).json({ message: 'Grade scholarship not found' });
    return;
  }

  const updated = await prisma.gradeScholarship.update({
    where: { id },
    data: {
      ...(grade !== undefined && { grade: String(grade).trim().toUpperCase() }),
      ...(title !== undefined && { title: String(title).trim() }),
      ...(discountType !== undefined && {
        discountType: discountType === 'FIXED_AMOUNT' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
      }),
      ...(discountValue !== undefined && { discountValue: Math.max(1, Number(discountValue)) }),
      ...(description !== undefined && { description: String(description).trim() }),
      ...(active !== undefined && { active: Boolean(active) }),
    },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Grade Scholarship Updated',
      description: `Updated grade scholarship "${updated.title}" for Grade ${updated.grade} (${updated.discountValue}${updated.discountType === 'PERCENTAGE' ? '%' : '$'} Off)`,
      type: 'ROLE',
    },
  });

  res.status(200).json({ message: 'Grade scholarship updated successfully', data: updated });
});

// DELETE /scholarships/grades/:id - Delete a grade scholarship tier
export const deleteGradeScholarship: RequestHandler = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const existing = await prisma.gradeScholarship.findUnique({
    where: { id },
  });
  if (!existing) {
    res.status(404).json({ message: 'Grade scholarship not found' });
    return;
  }

  const deleted = await prisma.gradeScholarship.delete({
    where: { id },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Grade Scholarship Deleted',
      description: `Deleted grade scholarship "${deleted.title}" (Grade ${deleted.grade})`,
      type: 'ROLE',
    },
  });

  res.status(200).json({ message: 'Grade scholarship deleted successfully', data: deleted });
});


