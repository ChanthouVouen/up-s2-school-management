import { RequestHandler } from 'express';
import prisma from '../lib/prisma';

/**
 * GET /partner-schools/public - Guest-safe list of active partner schools,
 * for the public admission form's scholarship/partnership selector (no auth).
 */
export const getPublicPartnerSchools: RequestHandler = async (_req, res, next) => {
  try {
    const partnerSchools = await prisma.partnerSchool.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, city: true },
      orderBy: { name: 'asc' },
    });
    res.json({ data: partnerSchools });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all partner schools with filtering, pagination, and statistics overview
 */
export const getPartnerSchools: RequestHandler = async (req, res, next) => {
  try {
    const { search, type, status, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      const searchStr = String(search).trim();
      where.OR = [
        { name: { contains: searchStr } },
        { contactPerson: { contains: searchStr } },
        { contactEmail: { contains: searchStr } },
        { address: { contains: searchStr } },
        { city: { contains: searchStr } },
      ];
    }

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [partnerSchools, total] = await Promise.all([
      prisma.partnerSchool.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          mous: {
            orderBy: { endDate: 'desc' },
          },
          _count: {
            select: {
              students: true,
              mous: true,
            },
          },
        },
      }),
      prisma.partnerSchool.count({ where }),
    ]);

    // Statistics Overview
    const now = new Date();
    const sixtyDaysLater = new Date();
    sixtyDaysLater.setDate(now.getDate() + 60);

    const [totalPartners, activeMousCount, expiringMousCount] = await Promise.all([
      prisma.partnerSchool.count(),
      prisma.mou.count({
        where: {
          status: 'ACTIVE',
          endDate: { gte: now },
        },
      }),
      prisma.mou.count({
        where: {
          status: 'ACTIVE',
          endDate: {
            gte: now,
            lte: sixtyDaysLater,
          },
        },
      }),
    ]);

    res.status(200).json({
      data: partnerSchools,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      stats: {
        totalPartners,
        activeMousCount,
        expiringMousCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single partner school by ID with detailed MOUs and Students
 */
export const getPartnerSchoolById: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid partner school ID' });
      return;
    }

    const school = await prisma.partnerSchool.findUnique({
      where: { id },
      include: {
        mous: {
          orderBy: { endDate: 'desc' },
        },
        students: {
          select: {
            id: true,
            studentCode: true,
            name: true,
            email: true,
            phone: true,
            department: true,
            status: true,
          },
        },
        _count: {
          select: {
            students: true,
            mous: true,
          },
        },
      },
    });

    if (!school) {
      res.status(404).json({ message: 'Partner school not found' });
      return;
    }

    res.status(200).json(school);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new partner school / company
 */
export const createPartnerSchool: RequestHandler = async (req, res, next) => {
  try {
    const {
      name,
      type = 'HIGH_SCHOOL',
      city,
      address,
      website,
      logoUrl,
      contactPerson,
      contactEmail,
      contactPhone,
      status = 'ACTIVE',
      notes,
      initialMou,
    } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Name is a required field' });
      return;
    }

    const schoolData: any = {
      name,
      type,
      city,
      address,
      website,
      logoUrl,
      contactPerson,
      contactEmail,
      contactPhone,
      status,
      notes,
    };

    if (initialMou && initialMou.mouTitle && initialMou.startDate && initialMou.endDate) {
      const endD = new Date(initialMou.endDate);
      const computedStatus = endD >= new Date() ? 'ACTIVE' : 'EXPIRED';
      schoolData.mous = {
        create: [
          {
            mouTitle: initialMou.mouTitle,
            signDate: new Date(initialMou.signDate || initialMou.startDate),
            startDate: new Date(initialMou.startDate),
            endDate: endD,
            status: computedStatus,
            discountType: initialMou.discountType || 'PERCENTAGE',
            discountValue: Number(initialMou.discountValue || 0),
            maxEligibleStudents: initialMou.maxEligibleStudents ? Number(initialMou.maxEligibleStudents) : null,
            mouDocumentUrl: initialMou.mouDocumentUrl || null,
            scope: initialMou.scope || null,
            notes: initialMou.notes || null,
          },
        ],
      };
    }

    const created = await prisma.partnerSchool.create({
      data: schoolData,
      include: {
        mous: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        title: 'Partner School Created',
        description: `Created partner institution '${created.name}'`,
        type: 'PARTNER_SCHOOL',
      },
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

/**
 * Update partner school profile
 */
export const updatePartnerSchool: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid partner school ID' });
      return;
    }

    const {
      name,
      type,
      city,
      address,
      website,
      logoUrl,
      contactPerson,
      contactEmail,
      contactPhone,
      status,
      notes,
    } = req.body;

    const existing = await prisma.partnerSchool.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Partner school not found' });
      return;
    }

    const updated = await prisma.partnerSchool.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        type: type !== undefined ? type : existing.type,
        city: city !== undefined ? city : existing.city,
        address: address !== undefined ? address : existing.address,
        website: website !== undefined ? website : existing.website,
        logoUrl: logoUrl !== undefined ? logoUrl : existing.logoUrl,
        contactPerson: contactPerson !== undefined ? contactPerson : existing.contactPerson,
        contactEmail: contactEmail !== undefined ? contactEmail : existing.contactEmail,
        contactPhone: contactPhone !== undefined ? contactPhone : existing.contactPhone,
        status: status !== undefined ? status : existing.status,
        notes: notes !== undefined ? notes : existing.notes,
      },
      include: {
        mous: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        title: 'Partner School Updated',
        description: `Updated partner institution '${updated.name}'`,
        type: 'PARTNER_SCHOOL',
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete partner school
 */
export const deletePartnerSchool: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid partner school ID' });
      return;
    }

    const existing = await prisma.partnerSchool.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Partner school not found' });
      return;
    }

    await prisma.partnerSchool.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        title: 'Partner School Deleted',
        description: `Deleted partner institution '${existing.name}'`,
        type: 'PARTNER_SCHOOL',
      },
    });

    res.status(200).json({ message: 'Partner school deleted successfully', id });
  } catch (error) {
    next(error);
  }
};

/**
 * Add MOU to a partner school
 */
export const addMou: RequestHandler = async (req, res, next) => {
  try {
    const partnerSchoolId = Number(req.params.id);
    if (isNaN(partnerSchoolId)) {
      res.status(400).json({ message: 'Invalid partner school ID' });
      return;
    }

    const {
      mouTitle,
      signDate,
      startDate,
      endDate,
      status = 'ACTIVE',
      discountType = 'PERCENTAGE',
      discountValue = 0,
      maxEligibleStudents,
      mouDocumentUrl,
      scope,
      notes,
    } = req.body;

    if (!mouTitle || !startDate || !endDate) {
      res.status(400).json({ message: 'MOU Title, Start Date, and End Date are required' });
      return;
    }

    const school = await prisma.partnerSchool.findUnique({ where: { id: partnerSchoolId } });
    if (!school) {
      res.status(404).json({ message: 'Partner school not found' });
      return;
    }

    const endD = new Date(endDate);
    const computedStatus = endD >= new Date() ? 'ACTIVE' : 'EXPIRED';

    const createdMou = await prisma.mou.create({
      data: {
        partnerSchoolId,
        mouTitle,
        signDate: new Date(signDate || startDate),
        startDate: new Date(startDate),
        endDate: endD,
        status: computedStatus,
        discountType,
        discountValue: Number(discountValue || 0),
        maxEligibleStudents: maxEligibleStudents ? Number(maxEligibleStudents) : null,
        mouDocumentUrl: mouDocumentUrl || null,
        scope: scope || null,
        notes: notes || null,
      },
    });

    res.status(201).json(createdMou);
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing MOU
 */
export const updateMou: RequestHandler = async (req, res, next) => {
  try {
    const mouId = Number(req.params.mouId);
    if (isNaN(mouId)) {
      res.status(400).json({ message: 'Invalid MOU ID' });
      return;
    }

    const {
      mouTitle,
      signDate,
      startDate,
      endDate,
      status,
      discountType,
      discountValue,
      maxEligibleStudents,
      mouDocumentUrl,
      scope,
      notes,
    } = req.body;

    const existing = await prisma.mou.findUnique({ where: { id: mouId } });
    if (!existing) {
      res.status(404).json({ message: 'MOU record not found' });
      return;
    }

    const targetEndDate = endDate ? new Date(endDate) : existing.endDate;
    const computedStatus = targetEndDate >= new Date() ? 'ACTIVE' : 'EXPIRED';

    const updatedMou = await prisma.mou.update({
      where: { id: mouId },
      data: {
        mouTitle: mouTitle !== undefined ? mouTitle : existing.mouTitle,
        signDate: signDate ? new Date(signDate) : existing.signDate,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: targetEndDate,
        status: computedStatus,
        discountType: discountType !== undefined ? discountType : existing.discountType,
        discountValue: discountValue !== undefined ? Number(discountValue) : existing.discountValue,
        maxEligibleStudents: maxEligibleStudents !== undefined ? (maxEligibleStudents ? Number(maxEligibleStudents) : null) : existing.maxEligibleStudents,
        mouDocumentUrl: mouDocumentUrl !== undefined ? mouDocumentUrl : existing.mouDocumentUrl,
        scope: scope !== undefined ? scope : existing.scope,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    res.status(200).json(updatedMou);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an MOU
 */
export const deleteMou: RequestHandler = async (req, res, next) => {
  try {
    const mouId = Number(req.params.mouId);
    if (isNaN(mouId)) {
      res.status(400).json({ message: 'Invalid MOU ID' });
      return;
    }

    const existing = await prisma.mou.findUnique({ where: { id: mouId } });
    if (!existing) {
      res.status(404).json({ message: 'MOU record not found' });
      return;
    }

    await prisma.mou.delete({ where: { id: mouId } });

    res.status(200).json({ message: 'MOU deleted successfully', id: mouId });
  } catch (error) {
    next(error);
  }
};
