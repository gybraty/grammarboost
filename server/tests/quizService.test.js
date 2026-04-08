const mongoose = require('mongoose');
const { evaluateAnswers } = require('../services/quizService');

describe('Quiz service', () => {
  it('scores answers case-insensitively', () => {
    const questions = [
      {
        _id: new mongoose.Types.ObjectId(),
        correctAnswers: ['Is'],
        explanation: 'Use "is" for singular present.',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        correctAnswers: ['are'],
        explanation: 'Use "are" for plural present.',
      },
    ];

    const answers = [
      { questionId: questions[0]._id, answer: 'is' },
      { questionId: questions[1]._id, answer: 'ARE' },
    ];

    const result = evaluateAnswers({ questions, answers });
    expect(result.score).toBe(2);
    expect(result.maxScore).toBe(2);
    expect(result.percentage).toBe(100);
    expect(result.results[0].isCorrect).toBe(true);
  });
});
