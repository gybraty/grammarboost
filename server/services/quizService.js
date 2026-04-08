const normalizeAnswer = (value) => (value || '').trim().toLowerCase();

const isCorrectAnswer = (question, answer) => {
  const normalizedAnswer = normalizeAnswer(answer);
  const normalizedCorrect = question.correctAnswers.map(normalizeAnswer);
  return normalizedCorrect.includes(normalizedAnswer);
};

const evaluateAnswers = ({ questions, answers }) => {
  const answerMap = new Map(
    (answers || []).map((item) => [item.questionId.toString(), item.answer])
  );

  const results = questions.map((question) => {
    const userAnswer = answerMap.get(question._id.toString()) || '';
    const isCorrect = isCorrectAnswer(question, userAnswer);
    return {
      questionId: question._id,
      userAnswer,
      isCorrect,
      correctAnswers: question.correctAnswers,
      explanation: question.explanation,
    };
  });

  const score = results.filter((result) => result.isCorrect).length;
  const maxScore = results.length;
  const percentage = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);

  return { results, score, maxScore, percentage };
};

module.exports = { evaluateAnswers };
