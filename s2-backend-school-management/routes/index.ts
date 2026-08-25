import express, { RequestHandler } from 'express';

const router = express.Router();

const homeHandler: RequestHandler = (_req, res) => {
  res.status(200).json({ message: 'School Management API' });
};

/**
 * @swagger
 * /:
 *   get:
 *     summary: API health check
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/', homeHandler);

export default router;