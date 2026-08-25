import express, { RequestHandler } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = express.Router();

const usersHandler: RequestHandler = (_req, res) => {
  res.send('respond with a resource');
};

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A plain text response
 *       401:
 *         description: Missing, invalid, expired, or revoked token
 *       403:
 *         description: Caller is not an admin
 */
router.get('/', authenticate, requireRole('ADMIN'), usersHandler);

export default router;