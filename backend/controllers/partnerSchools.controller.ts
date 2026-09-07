import { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getPublicPartnerSchoolsService, getPartnerSchoolsService, getPartnerSchoolByIdService, createPartnerSchoolService, updatePartnerSchoolService, deletePartnerSchoolService, addMouService, updateMouService, deleteMouService } from '../services/partner-school.service';

/**
 * GET /partner-schools/public - Guest-safe list of active partner schools,
 * for the public admission form's scholarship/partnership selector (no auth).
 */
export const getPublicPartnerSchools: RequestHandler = asyncHandler(async (_req, res) => {
  const result = await getPublicPartnerSchoolsService();
  res.json(result);
});

/**
 * Get all partner schools with filtering, pagination, and statistics overview
 */
export const getPartnerSchools: RequestHandler = asyncHandler(async (req, res) => {
  const result = await getPartnerSchoolsService(req.query as Record<string, any>);
  res.status(200).json(result);
});

/**
 * Get single partner school by ID with detailed MOUs and Students
 */
export const getPartnerSchoolById: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const school = await getPartnerSchoolByIdService(id ?? '');
    res.status(200).json(school);
  } catch (error: any) {
    if (error.message === 'Partner school not found') {
      res.status(404).json({ message: 'Partner school not found' });
      return;
    }
    res.status(400).json({ message: error.message || 'Invalid partner school ID' });
  }
});

/**
 * Create a new partner school / company
 */
export const createPartnerSchool: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const created = await createPartnerSchoolService(req.body);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Unable to create partner school' });
  }
});

/**
 * Update partner school profile
 */
export const updatePartnerSchool: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await updatePartnerSchoolService(id ?? '', req.body);
    res.status(200).json(updated);
  } catch (error: any) {
    if (error.message === 'Partner school not found') {
      res.status(404).json({ message: 'Partner school not found' });
      return;
    }
    res.status(400).json({ message: error.message || 'Unable to update partner school' });
  }
});

/**
 * Delete partner school
 */
export const deletePartnerSchool: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await deletePartnerSchoolService(id ?? '');
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Partner school not found') {
      res.status(404).json({ message: 'Partner school not found' });
      return;
    }
    res.status(400).json({ message: error.message || 'Unable to delete partner school' });
  }
});

/**
 * Add MOU to a partner school
 */
export const addMou: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const createdMou = await addMouService(id ?? '', req.body);
    res.status(201).json(createdMou);
  } catch (error: any) {
    if (error.message === 'Partner school not found') {
      res.status(404).json({ message: 'Partner school not found' });
      return;
    }
    res.status(400).json({ message: error.message || 'Unable to create MOU' });
  }
});

/**
 * Update existing MOU
 */
export const updateMou: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const mouId = Array.isArray(req.params.mouId) ? req.params.mouId[0] : req.params.mouId;
    const updatedMou = await updateMouService(mouId ?? '', req.body);
    res.status(200).json(updatedMou);
  } catch (error: any) {
    if (error.message === 'MOU record not found') {
      res.status(404).json({ message: 'MOU record not found' });
      return;
    }
    res.status(400).json({ message: error.message || 'Unable to update MOU' });
  }
});

/**
 * Delete an MOU
 */
export const deleteMou: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const mouId = Array.isArray(req.params.mouId) ? req.params.mouId[0] : req.params.mouId;
    const result = await deleteMouService(mouId ?? '');
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'MOU record not found') {
      res.status(404).json({ message: 'MOU record not found' });
      return;
    }
    res.status(400).json({ message: error.message || 'Unable to delete MOU' });
  }
});
