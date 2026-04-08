const express = require('express');
const questionController = require('../controllers/questionController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

/**
 * @openapi
 * /api/questions/{questionId}:
 *   put:
 *     summary: Update a question
 *     tags:
 *       - Questions
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               prompt:
 *                 type: string
 *               choices:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctAnswers:
 *                 type: array
 *                 items:
 *                   type: string
 *               explanation:
 *                 type: string
 *               order:
 *                 type: number
 *               difficulty:
 *                 type: number
 *     responses:
 *       200:
 *         description: Question updated
 */
router.put('/:questionId', requireAuth, requireAdmin, questionController.updateQuestion);

/**
 * @openapi
 * /api/questions/{questionId}:
 *   delete:
 *     summary: Delete a question
 *     tags:
 *       - Questions
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Question deleted
 */
router.delete(
  '/:questionId',
  requireAuth,
  requireAdmin,
  questionController.deleteQuestion
);

module.exports = router;
