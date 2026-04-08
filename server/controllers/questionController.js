const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { Lesson, Question } = require('../models');

const createQuestion = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const { type, prompt, choices, correctAnswers, explanation, order, difficulty } =
    req.body;

  if (!type || !prompt || !correctAnswers || !explanation) {
    throw new ApiError(400, 'Type, prompt, correct answers, and explanation are required');
  }

  if (choices && !Array.isArray(choices)) {
    throw new ApiError(400, 'Choices must be an array');
  }

  const normalizedCorrectAnswers = Array.isArray(correctAnswers)
    ? correctAnswers
    : [correctAnswers];

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  const question = await Question.create({
    lesson: lessonId,
    type,
    prompt,
    choices,
    correctAnswers: normalizedCorrectAnswers,
    explanation,
    order,
    difficulty,
  });

  res.status(201).json({ data: question });
});

const updateQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  const fields = [
    'type',
    'prompt',
    'choices',
    'correctAnswers',
    'explanation',
    'order',
    'difficulty',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === 'choices' && req.body[field] && !Array.isArray(req.body[field])) {
        throw new ApiError(400, 'Choices must be an array');
      }
      if (field === 'correctAnswers') {
        question[field] = Array.isArray(req.body[field])
          ? req.body[field]
          : [req.body[field]];
      } else {
        question[field] = req.body[field];
      }
    }
  });

  await question.save();
  res.json({ data: question });
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const question = await Question.findByIdAndDelete(questionId);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  res.status(204).send();
});

module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
