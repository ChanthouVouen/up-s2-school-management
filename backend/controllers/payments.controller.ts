import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { getStudentForUser } from '../utils/resolveStudent';
import { PaymentStatus } from '../types/enums';

function paymentReference() {
  return `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// GET /payments - Admin/staff: list all payments
export const getPayments: RequestHandler = asyncHandler(async (req, res) => {
  const { studentId } = req.query;
  const where: any = {};
  if (studentId) {
    where.studentId = Number(studentId);
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { student: { select: { id: true, studentCode: true, name: true, email: true } } },
  });

  res.json({ data: payments });
});

// GET /payments/mine - The logged-in student's own payment history
export const getMyPayments: RequestHandler = asyncHandler(async (req, res) => {
  const student = await getStudentForUser(req.user!.id);
  if (!student) {
    res.status(404).json({ message: 'No student profile linked to this account' });
    return;
  }

  const payments = await prisma.payment.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ data: payments, paymentStatus: student.paymentStatus });
});

// POST /payments/checkout - Student pays online (simulated / demo checkout, no real gateway)
export const checkout: RequestHandler = asyncHandler(async (req, res) => {
  const student = await getStudentForUser(req.user!.id);
  if (!student) {
    res.status(404).json({ message: 'No student profile linked to this account' });
    return;
  }

  const { amount, method, description } = req.body;
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    res.status(400).json({ message: 'A valid payment amount is required' });
    return;
  }

  // Settle the outstanding tuition invoice generated at admission approval, if one exists,
  // instead of logging an unrelated duplicate payment row.
  const pendingInvoice = await prisma.payment.findFirst({
    where: { studentId: student.id, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });

  const resolvedMethod = typeof method === 'string' && method.trim() ? method.trim().toUpperCase() : 'CARD';
  const payment = pendingInvoice
    ? await prisma.payment.update({
        where: { id: pendingInvoice.id },
        data: { amount: numericAmount, method: resolvedMethod, status: 'COMPLETED' },
      })
    : await prisma.payment.create({
        data: {
          reference: paymentReference(),
          studentId: student.id,
          amount: numericAmount,
          method: resolvedMethod,
          description: description?.trim() || 'Tuition / fee payment',
          status: 'COMPLETED',
        },
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

  res.status(201).json(payment);
});
