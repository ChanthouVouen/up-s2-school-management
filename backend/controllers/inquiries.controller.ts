import { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { createPublicInquiryService, createInquiryService, getMyInquiriesService, getInquiriesService, respondToInquiryService } from '../services/inquiry.service';

// POST /inquiries/public - Guest "Contact Us" submission from the welcome page (no auth)
export const createPublicInquiry: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const result = await createPublicInquiryService(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Unable to submit inquiry' });
  }
});

// POST /inquiries - Logged-in student submits an information request
export const createInquiry: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const inquiry = await createInquiryService(req.user!.id, req.body);
    res.status(201).json(inquiry);
  } catch (error: any) {
    const status = error.message === 'No student profile linked to this account' ? 404 : 400;
    res.status(status).json({ message: error.message || 'Unable to create inquiry' });
  }
});

// GET /inquiries/mine - The logged-in student's own requests + admin responses
export const getMyInquiries: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const result = await getMyInquiriesService(req.user!.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'No student profile linked to this account' });
  }
});

// GET /inquiries - Admin/staff: list all inquiries
export const getInquiries: RequestHandler = asyncHandler(async (req, res) => {
  const inquiries = await getInquiriesService(req.query as Record<string, any>);
  res.json({ data: inquiries });
});

// PATCH /inquiries/:id - Admin/staff responds to and/or updates the status of an inquiry
export const respondToInquiry: RequestHandler = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const inquiry = await respondToInquiryService(id, req.body);
    res.json(inquiry);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Unable to update inquiry' });
  }
});
