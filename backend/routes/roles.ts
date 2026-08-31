import express from 'express';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { getRoles, updateRolePermissions, createRole } from '../controllers/roles.controller';
import { PERMISSIONS } from '../types/permissions';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: List all roles with their permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *       401:
 *         description: Missing, invalid, expired, or revoked token
 *       403:
 *         description: Caller lacks role:view permission
 */
router.get('/', requirePermission(PERMISSIONS.ROLE_VIEW), getRoles);

/**
 * @swagger
 * /roles/{id}/permissions:
 *   put:
 *     summary: Replace a role's permission set
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role updated
 *       400:
 *         description: Validation failed or invalid permission IDs
 *       404:
 *         description: Role not found
 */
router.put('/:id/permissions', requirePermission(PERMISSIONS.ROLE_UPDATE), updateRolePermissions);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "admin"
 */
router.post('/', requirePermission(PERMISSIONS.ROLE_UPDATE), createRole);

export default router;
