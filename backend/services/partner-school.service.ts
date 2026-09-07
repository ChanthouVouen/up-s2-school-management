import prisma from '../lib/prisma';

export async function getPublicPartnerSchoolsService() {
  const partnerSchools = await prisma.partnerSchool.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, name: true, city: true },
    orderBy: { name: 'asc' },
  });
  return { data: partnerSchools };
}

export async function getPartnerSchoolsService(query: Record<string, any>) {
  const { search, type, status, page = 1, limit = 10 } = query;
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
      include: { mous: { orderBy: { endDate: 'desc' } }, _count: { select: { students: true, mous: true } } },
    }),
    prisma.partnerSchool.count({ where }),
  ]);

  const now = new Date();
  const sixtyDaysLater = new Date();
  sixtyDaysLater.setDate(now.getDate() + 60);

  const [totalPartners, activeMousCount, expiringMousCount] = await Promise.all([
    prisma.partnerSchool.count(),
    prisma.mou.count({ where: { status: 'ACTIVE', endDate: { gte: now } } }),
    prisma.mou.count({ where: { status: 'ACTIVE', endDate: { gte: now, lte: sixtyDaysLater } } }),
  ]);

  return {
    data: partnerSchools,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    stats: { totalPartners, activeMousCount, expiringMousCount },
  };
}

export async function getPartnerSchoolByIdService(idParam: string) {
  const id = Number(idParam);
  if (isNaN(id)) throw new Error('Invalid partner school ID');

  const school = await prisma.partnerSchool.findUnique({
    where: { id },
    include: {
      mous: { orderBy: { endDate: 'desc' } },
      students: { select: { id: true, studentCode: true, name: true, email: true, phone: true, department: true, status: true } },
      _count: { select: { students: true, mous: true } },
    },
  });

  if (!school) throw new Error('Partner school not found');
  return school;
}

export async function createPartnerSchoolService(body: any) {
  const { name, type = 'HIGH_SCHOOL', city, address, website, logoUrl, contactPerson, contactEmail, contactPhone, status = 'ACTIVE', notes, initialMou } = body;

  if (!name) throw new Error('Name is a required field');

  const schoolData: any = { name, type, city, address, website, logoUrl, contactPerson, contactEmail, contactPhone, status, notes };

  if (initialMou && initialMou.mouTitle && initialMou.startDate && initialMou.endDate) {
    const endD = new Date(initialMou.endDate);
    const computedStatus = endD >= new Date() ? 'ACTIVE' : 'EXPIRED';
    schoolData.mous = {
      create: [{
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
      }],
    };
  }

  const created = await prisma.partnerSchool.create({ data: schoolData, include: { mous: true } });

  await prisma.activityLog.create({
    data: { title: 'Partner School Created', description: `Created partner institution '${created.name}'`, type: 'PARTNER_SCHOOL' },
  });

  return created;
}

export async function updatePartnerSchoolService(idParam: string, body: any) {
  const id = Number(idParam);
  if (isNaN(id)) throw new Error('Invalid partner school ID');

  const { name, type, city, address, website, logoUrl, contactPerson, contactEmail, contactPhone, status, notes } = body;
  const existing = await prisma.partnerSchool.findUnique({ where: { id } });
  if (!existing) throw new Error('Partner school not found');

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
    include: { mous: true },
  });

  await prisma.activityLog.create({
    data: { title: 'Partner School Updated', description: `Updated partner institution '${updated.name}'`, type: 'PARTNER_SCHOOL' },
  });

  return updated;
}

export async function deletePartnerSchoolService(idParam: string) {
  const id = Number(idParam);
  if (isNaN(id)) throw new Error('Invalid partner school ID');

  const existing = await prisma.partnerSchool.findUnique({ where: { id } });
  if (!existing) throw new Error('Partner school not found');

  await prisma.partnerSchool.delete({ where: { id } });
  await prisma.activityLog.create({
    data: { title: 'Partner School Deleted', description: `Deleted partner institution '${existing.name}'`, type: 'PARTNER_SCHOOL' },
  });

  return { message: 'Partner school deleted successfully', id };
}

export async function addMouService(idParam: string, body: any) {
  const partnerSchoolId = Number(idParam);
  if (isNaN(partnerSchoolId)) throw new Error('Invalid partner school ID');

  const { mouTitle, signDate, startDate, endDate, status = 'ACTIVE', discountType = 'PERCENTAGE', discountValue = 0, maxEligibleStudents, mouDocumentUrl, scope, notes } = body;

  if (!mouTitle || !startDate || !endDate) {
    throw new Error('MOU Title, Start Date, and End Date are required');
  }

  const school = await prisma.partnerSchool.findUnique({ where: { id: partnerSchoolId } });
  if (!school) throw new Error('Partner school not found');

  const endD = new Date(endDate);
  const computedStatus = endD >= new Date() ? 'ACTIVE' : 'EXPIRED';

  return prisma.mou.create({
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
}

export async function updateMouService(mouIdParam: string, body: any) {
  const mouId = Number(mouIdParam);
  if (isNaN(mouId)) throw new Error('Invalid MOU ID');

  const { mouTitle, signDate, startDate, endDate, status, discountType, discountValue, maxEligibleStudents, mouDocumentUrl, scope, notes } = body;
  const existing = await prisma.mou.findUnique({ where: { id: mouId } });
  if (!existing) throw new Error('MOU record not found');

  const targetEndDate = endDate ? new Date(endDate) : existing.endDate;
  const computedStatus = targetEndDate >= new Date() ? 'ACTIVE' : 'EXPIRED';

  return prisma.mou.update({
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
}

export async function deleteMouService(mouIdParam: string) {
  const mouId = Number(mouIdParam);
  if (isNaN(mouId)) throw new Error('Invalid MOU ID');

  const existing = await prisma.mou.findUnique({ where: { id: mouId } });
  if (!existing) throw new Error('MOU record not found');

  await prisma.mou.delete({ where: { id: mouId } });
  return { message: 'MOU deleted successfully', id: mouId };
}
