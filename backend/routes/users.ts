import express from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/users.controller';

const router = express.Router();

router.use(authenticate, requireRole('ADMIN'));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List users with search & pagination (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A paginated list of users
 *       401:
 *         description: Missing, invalid, expired, or revoked token
 *       403:
 *         description: Caller is not an admin
 *   post:
 *     summary: Create a new user (admin only)
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
router.get('/', getUsers);
router.post('/', createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
