import express from 'express';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/users.controller';
import { PERMISSIONS } from '../types/permissions';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List users with search & pagination
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A paginated list of users
 *       401:
 *         description: Missing, invalid, expired, or revoked token
 *       403:
 *         description: Caller lacks user:view permission
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Email already in use
 */
router.get('/', requirePermission(PERMISSIONS.USER_VIEW), getUsers);
router.post('/', requirePermission(PERMISSIONS.USER_CREATE), createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.put('/:id', requirePermission(PERMISSIONS.USER_UPDATE), updateUser);
router.delete('/:id', requirePermission(PERMISSIONS.USER_DELETE), deleteUser);

export default router;
