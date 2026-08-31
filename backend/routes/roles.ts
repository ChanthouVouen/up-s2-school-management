import express from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { getRoles } from '../controllers/roles.controller';

const router = express.Router();

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: List all roles (admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *       401:
 *         description: Missing, invalid, expired, or revoked token
 *       403:
 *         description: Caller is not an admin
 */
router.get('/', authenticate, requireRole('ADMIN'), getRoles);

export default router;
