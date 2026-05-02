const asyncHandler = require('../middleware/asyncHandler');
const { LessonProgress, QuizAttempt } = require('../models');

/**
 * GET /api/progress
 * Returns aggregated lesson progress for the current user.
 */
const getProgress = asyncHandler(async (req, res) => {
  const progress = await LessonProgress.find({ user: req.user.id })
    .populate('lesson', 'title level slug')
    .sort({ updatedAt: -1 });

  res.json({ data: progress });
});

/**
 * GET /api/progress/attempts
 * Returns detailed quiz attempt history for the current user.
 * Each attempt includes score, percentage, and per-question answers
 * with the question prompt populated.
 */
const getAttempts = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ user: req.user.id })
    .populate('lesson', 'title level slug')
    .populate('answers.question', 'prompt choices correctAnswers')
    .sort({ createdAt: -1 });

  res.json({ data: attempts });
});

module.exports = { getProgress, getAttempts };
