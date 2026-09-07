import prisma from '../lib/prisma';
import { getStudentForUser } from '../utils/resolveStudent';
import { InquiryStatus } from '../types/enums';

export function validateContact(body: any) {
  const { name, email, subject, message } = body;
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return null;
  }
  return { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() };
}

export async function createPublicInquiryService(body: any) {
  const parsed = validateContact(body);
  if (!parsed) {
    throw new Error('Name, email, subject, and message are required');
  }

  const inquiry = await prisma.inquiry.create({ data: parsed });

  await prisma.activityLog.create({
    data: {
      title: 'New Inquiry Received',
      description: `${inquiry.name} sent a message: "${inquiry.subject}".`,
      type: 'SYSTEM',
    },
  });

  return { message: 'Thanks for reaching out — our admissions team will get back to you shortly.', id: inquiry.id };
}

export async function createInquiryService(userId: string, body: any) {
  const student = await getStudentForUser(userId);
  if (!student) {
    throw new Error('No student profile linked to this account');
  }

  const parsed = validateContact({ name: student.name, email: student.email || body.email, ...body });
  if (!parsed) {
    throw new Error('Subject and message are required');
  }

  return prisma.inquiry.create({
    data: { ...parsed, studentId: student.id },
  });
}

export async function getMyInquiriesService(userId: string) {
  const student = await getStudentForUser(userId);
  if (!student) {
    throw new Error('No student profile linked to this account');
  }

  const inquiries = await prisma.inquiry.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
  });

  return { data: inquiries };
}

export async function getInquiriesService(query: Record<string, any>) {
  const { status } = query;
  const where: any = {};
  if (status && Object.values(InquiryStatus).includes(status as InquiryStatus)) {
    where.status = status;
  }

  return prisma.inquiry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { student: { select: { id: true, studentCode: true, name: true } } },
  });
}

export async function respondToInquiryService(id: number, body: Record<string, any>) {
  const { status, response } = body;

  if (!Number.isInteger(id)) {
    throw new Error('Invalid inquiry ID');
  }
  if (status && !Object.values(InquiryStatus).includes(status)) {
    throw new Error('Invalid status');
  }

  return prisma.inquiry.update({
    where: { id },
    data: {
      response: response !== undefined ? (response?.trim() || null) : undefined,
      status: status || (response ? InquiryStatus.RESOLVED : undefined),
    },
  });
}
