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

module.exports = router;
