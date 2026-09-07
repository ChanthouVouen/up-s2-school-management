import prisma from '../../lib/prisma';

export async function resolveScholarshipDiscount(
  track: string,
  opts: { partnerSchoolId?: number | null; specialCode?: string }
): Promise<{ discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | null; discountValue: number | null }> {
  if (track === 'GRADE_A') {
    const gradeTier = await prisma.gradeScholarship.findFirst({ where: { grade: 'A', active: true } });
    return gradeTier
      ? { discountType: gradeTier.discountType, discountValue: gradeTier.discountValue }
      : { discountType: null, discountValue: null };
  }

  if (track === 'SPECIAL_CODE') {
    const normalizedCode = String(opts.specialCode || '').trim().toUpperCase();
    const codeRow = await prisma.scholarshipCode.findFirst({ where: { code: normalizedCode, active: true } });
    const quotaAvailable = codeRow && !(codeRow.maxUses && codeRow.usedCount >= codeRow.maxUses);
    const notExpired = codeRow && !(codeRow.expiresAt && new Date(codeRow.expiresAt) < new Date());

    if (codeRow && quotaAvailable && notExpired) {
      await prisma.scholarshipCode.update({
        where: { id: codeRow.id },
        data: { usedCount: { increment: 1 } },
      });
      return { discountType: codeRow.discountType, discountValue: codeRow.discountValue };
    }

    return { discountType: null, discountValue: null };
  }

  if (track === 'MOU_PARTNER' && opts.partnerSchoolId) {
    const activeMou = await prisma.mou.findFirst({
      where: { partnerSchoolId: opts.partnerSchoolId, status: 'ACTIVE' },
    });
    return activeMou
      ? { discountType: activeMou.discountType, discountValue: activeMou.discountValue }
      : { discountType: null, discountValue: null };
  }

  return { discountType: null, discountValue: null };
}
