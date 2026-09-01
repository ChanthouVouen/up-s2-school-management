import express from 'express';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { getActivityLogs, getActivityLogStats } from '../controllers/activityLogs.controller';
import { PERMISSIONS } from '../types/permissions';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /activity-logs:
 *   get:
 *     summary: List activity logs with search, type filter, date range & pagination
 *     tags: [ActivityLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [STUDENT, TEACHER, DOCUMENT, APPLICATION, PAYMENT, SYSTEM]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A paginated list of activity logs
 *       401:
 *         description: Missing, invalid, expired, or revoked token
 *       403:
 *         description: Caller lacks activity:view permission
 */
router.get('/', requirePermission(PERMISSIONS.ACTIVITY_VIEW), getActivityLogs);

/**
 * @swagger
 * /activity-logs/stats:
 *   get:
 *     summary: Get activity log summary counts (today, total, by type)
 *     tags: [ActivityLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity log summary counts
 *       401:
 *         description: Missing, invalid, expired, or revoked token
 *       403:
 *         description: Caller lacks activity:view permission
 */
router.get('/stats', requirePermission(PERMISSIONS.ACTIVITY_VIEW), getActivityLogStats);

export default router;
