const express = require('express');
const multer = require('multer');
const lessonController = require('../controllers/lessonController');
const questionController = require('../controllers/questionController');
const quizController = require('../controllers/quizController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * @openapi
 * /api/lessons:
 *   get:
 *     summary: List lessons
 *     tags:
 *       - Lessons
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Tag id or slug
 *       - in: query
 *         name: includeUnpublished
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lesson list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lesson'
 */
router.get('/', optionalAuth, lessonController.listLessons);

/**
 * @openapi
 * /api/lessons:
 *   post:
 *     summary: Create a lesson
 *     tags:
 *       - Lessons
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - level
 *               - title
 *               - content
 *             properties:
 *               level:
 *                 type: string
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               summary:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Lesson created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Lesson'
 */
router.post('/', requireAuth, requireAdmin, lessonController.createLesson);

/**
 * @openapi
 * /api/lessons/{lessonId}:
 *   get:
 *     summary: Get a lesson by ID or slug
 *     tags:
 *       - Lessons
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Lesson not found
 */
router.get('/:lessonId', optionalAuth, lessonController.getLesson);

/**
 * @openapi
 * /api/lessons/{lessonId}:
 *   put:
 *     summary: Update a lesson
 *     tags:
 *       - Lessons
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: string
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               summary:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Lesson updated
 */
router.put('/:lessonId', requireAuth, requireAdmin, lessonController.updateLesson);

/**
 * @openapi
 * /api/lessons/{lessonId}:
 *   delete:
 *     summary: Delete a lesson
 *     tags:
 *       - Lessons
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Lesson deleted
 */
router.delete('/:lessonId', requireAuth, requireAdmin, lessonController.deleteLesson);

/**
 * @openapi
 * /api/lessons/{lessonId}/media:
 *   post:
 *     summary: Upload lesson media
 *     tags:
 *       - Lessons
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               alt:
 *                 type: string
 *     responses:
 *       201:
 *         description: Media uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/LessonMedia'
 */
router.post(
  '/:lessonId/media',
  requireAuth,
  requireAdmin,
  upload.single('file'),
  lessonController.uploadLessonMedia
);

/**
 * @openapi
 * /api/lessons/{lessonId}/questions:
 *   post:
 *     summary: Create a question for a lesson
 *     tags:
 *       - Questions
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - prompt
 *               - correctAnswers
 *               - explanation
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
 *       201:
 *         description: Question created
 */
router.post(
  '/:lessonId/questions',
  requireAuth,
  requireAdmin,
  questionController.createQuestion
);

/**
 * @openapi
 * /api/lessons/{lessonId}/quiz:
 *   get:
 *     summary: Get quiz questions for a lesson
 *     tags:
 *       - Quizzes
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuizQuestion'
 */
router.get('/:lessonId/quiz', requireAuth, quizController.getQuiz);

/**
 * @openapi
 * /api/lessons/{lessonId}/quiz:
 *   post:
 *     summary: Submit quiz answers
 *     tags:
 *       - Quizzes
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionId
 *                     - answer
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     answer:
 *                       type: string
 *     responses:
 *       200:
 *         description: Quiz results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/QuizResult'
 */
router.post('/:lessonId/quiz', requireAuth, quizController.submitQuiz);

module.exports = router;
