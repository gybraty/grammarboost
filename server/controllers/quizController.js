const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { Lesson, LessonProgress, Question, QuizAttempt } = require('../models');
const { evaluateAnswers } = require('../services/quizService');

const getQuiz = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  if (!lesson.isPublished) {
    throw new ApiError(403, 'Lesson is not published');
  }

  const questions = await Question.find({ lesson: lessonId }).sort({ order: 1 });
  const quizQuestions = questions.map((question) => ({
    id: question._id,
    type: question.type,
    prompt: question.prompt,
    choices: question.choices,
    order: question.order,
    difficulty: question.difficulty,
  }));

  res.json({ data: quizQuestions });
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const { answers } = req.body;
  if (!Array.isArray(answers)) {
    throw new ApiError(400, 'Answers must be an array');
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  if (!lesson.isPublished) {
    throw new ApiError(403, 'Lesson is not published');
  }

  const questions = await Question.find({ lesson: lessonId }).sort({ order: 1 });
  if (questions.length === 0) {
    throw new ApiError(400, 'No questions available for this lesson');
  }

  const evaluation = evaluateAnswers({ questions, answers });
  const attempt = await QuizAttempt.create({
    user: req.user.id,
    lesson: lessonId,
    score: evaluation.score,
    maxScore: evaluation.maxScore,
    percentage: evaluation.percentage,
    answers: evaluation.results.map((result) => ({
      question: result.questionId,
      userAnswer: result.userAnswer,
      isCorrect: result.isCorrect,
    })),
  });

  const status = evaluation.percentage === 100 ? 'completed' : 'in_progress';
  await LessonProgress.findOneAndUpdate(
    { user: req.user.id, lesson: lessonId },
    {
      $set: {
        status,
        lastScore: evaluation.percentage,
        lastAttemptAt: new Date(),
      },
      $max: { bestScore: evaluation.percentage },
      $inc: { attemptsCount: 1 },
    },
    { upsert: true, new: true }
  );

  res.json({
    data: {
      attemptId: attempt._id,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      percentage: evaluation.percentage,
      results: evaluation.results,
    },
  });
});

module.exports = {
  getQuiz,
  submitQuiz,
};
