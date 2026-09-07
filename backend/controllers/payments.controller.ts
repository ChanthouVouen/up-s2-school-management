import { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getPaymentsService, getMyPaymentsService, checkoutService } from '../services/payments.service';

// GET /payments - Admin/staff: list all payments
export const getPayments: RequestHandler = asyncHandler(async (req, res) => {
  const payments = await getPaymentsService(String(req.query.studentId || ''));
  res.json({ data: payments });
});

// GET /payments/mine - The logged-in student's own payment history
export const getMyPayments: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const data = await getMyPaymentsService(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'No student profile linked to this account' });
  }
});

// POST /payments/checkout - Student pays online (simulated / demo checkout, no real gateway)
export const checkout: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const payment = await checkoutService(req.user!.id, req.body);
    res.status(201).json(payment);
  } catch (error: any) {
    const message = error.message || 'Unable to complete payment';
    if (message.includes('No student profile linked') || message.includes('No payment is currently due') || message.includes('A valid payment amount') || message.includes('The amount due is')) {
      res.status(400).json({ message });
      return;
    }
    res.status(400).json({ message });
  }
});
