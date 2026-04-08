const asyncHandler = require('../middleware/asyncHandler');
const { LessonProgress } = require('../models');

const getProgress = asyncHandler(async (req, res) => {
  const progress = await LessonProgress.find({ user: req.user.id })
    .populate('lesson', 'title level slug')
    .sort({ updatedAt: -1 });

  res.json({ data: progress });
});

module.exports = { getProgress };
