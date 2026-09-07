import prisma from '../lib/prisma';
import { getStudentForUser } from '../utils/resolveStudent';
import { PaymentStatus } from '../types/enums';

export async function getPaymentsService(studentId?: string) {
  const where: any = {};
  if (studentId) {
    where.studentId = Number(studentId);
  }

  return prisma.payment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { student: { select: { id: true, studentCode: true, name: true, email: true } } },
  });
}

export async function getMyPaymentsService(userId: string) {
  const student = await getStudentForUser(userId);
  if (!student) {
    throw new Error('No student profile linked to this account');
  }

  const payments = await prisma.payment.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
  });

  return { data: payments, paymentStatus: student.paymentStatus };
}

export async function checkoutService(userId: string, body: any) {
  const student = await getStudentForUser(userId);
  if (!student) {
    throw new Error('No student profile linked to this account');
  }

  const { amount, method } = body;
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw new Error('A valid payment amount is required');
  }

  const pendingInvoice = await prisma.payment.findFirst({
    where: { studentId: student.id, status: 'PENDING', reference: { startsWith: 'INV-' } },
    orderBy: { createdAt: 'desc' },
  });

  if (!pendingInvoice) {
    throw new Error('No payment is currently due.');
  }

  if (Math.abs(numericAmount - pendingInvoice.amount) > 0.01) {
    throw new Error(`The amount due is $${pendingInvoice.amount.toFixed(2)}. Please pay that exact amount.`);
  }

  const resolvedMethod = typeof method === 'string' && method.trim() ? method.trim().toUpperCase() : 'CARD';
  const payment = await prisma.payment.update({
    where: { id: pendingInvoice.id },
    data: { method: resolvedMethod, status: 'COMPLETED' },
  });

  await prisma.student.update({
    where: { id: student.id },
    data: { paymentStatus: PaymentStatus.PAID },
  });

  await prisma.activityLog.create({
    data: {
      title: 'Payment Received',
      description: `${student.name} paid ${numericAmount.toFixed(2)} via ${payment.method} (${payment.reference}).`,
      type: 'PAYMENT',
    },
  });

  return payment;
}
