const mongoose = require('mongoose');

const { Schema } = mongoose;

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['learner', 'admin'],
      default: 'learner',
    },
    profile: {
      displayName: {
        type: String,
        trim: true,
      },
      level: {
        type: String,
        enum: cefrLevels,
      },
      goals: {
        type: String,
        trim: true,
      },
      avatarUrl: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
