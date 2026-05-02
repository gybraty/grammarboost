const express = require('express');
const { requireAuth } = require('../middleware/auth');
const progressController = require('../controllers/progressController');

const router = express.Router();

/**
 * @openapi
 * /api/progress:
 *   get:
 *     summary: Get user lesson progress
 *     tags:
 *       - Progress
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Progress list
 */
router.get('/', requireAuth, progressController.getProgress);

/**
 * @openapi
 * /api/progress/attempts:
 *   get:
 *     summary: Get detailed quiz attempt history
 *     description: Returns all quiz attempts for the authenticated user with individual answers and question details.
 *     tags:
 *       - Progress
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of quiz attempts with answers
 */
router.get('/attempts', requireAuth, progressController.getAttempts);

module.exports = router;
