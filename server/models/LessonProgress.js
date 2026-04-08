const mongoose = require('mongoose');

const { Schema } = mongoose;

const lessonProgressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    bestScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    attemptsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAttemptAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports =
  mongoose.models.LessonProgress ||
  mongoose.model('LessonProgress', lessonProgressSchema);
