import express from 'express';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { PERMISSIONS } from '../types/permissions';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get the organization settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The organization settings
 *       401:
 *         description: Missing, invalid, expired, or revoked token
 *       403:
 *         description: Caller lacks settings:view permission
 *   put:
 *     summary: Update the organization settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings updated
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Caller lacks settings:update permission
 */
router.get('/', requirePermission(PERMISSIONS.SETTINGS_VIEW), getSettings);
router.put('/', requirePermission(PERMISSIONS.SETTINGS_UPDATE), updateSettings);

export default router;
