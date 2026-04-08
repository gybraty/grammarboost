const mongoose = require('mongoose');

const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'fill-in-the-blank', 'short-answer'],
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    choices: [{ type: String, trim: true }],
    correctAnswers: [{ type: String, required: true, trim: true }],
    explanation: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
  },
  { timestamps: true }
);

questionSchema.pre('validate', function validateChoices(next) {
  if (this.type === 'multiple-choice') {
    if (!this.choices || this.choices.length < 2) {
      this.invalidate('choices', 'Multiple-choice questions require at least two choices.');
    }
  }

  if (!this.correctAnswers || this.correctAnswers.length === 0) {
    this.invalidate('correctAnswers', 'At least one correct answer is required.');
  }

  next();
});

module.exports = mongoose.models.Question || mongoose.model('Question', questionSchema);
