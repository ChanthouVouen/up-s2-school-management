import express from 'express';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { getPermissions } from '../controllers/permissions.controller';
import { PERMISSIONS } from '../types/permissions';

const router = express.Router();

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: List all permissions (used to populate role permission editors)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of permissions
 *       401:
 *         description: Missing, invalid, expired, or revoked token
 *       403:
 *         description: Caller lacks role:view permission
 */
router.get('/', authenticate, requirePermission(PERMISSIONS.ROLE_VIEW), getPermissions);

export default router;
