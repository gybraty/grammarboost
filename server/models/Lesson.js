const mongoose = require('mongoose');

const { Schema } = mongoose;

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];

const lessonSchema = new Schema(
  {
    level: {
      type: String,
      enum: cefrLevels,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
    },
    contentLink: {
      type: String,
      trim: true,
    },
    contentKey: {
      type: String,
      trim: true,
    },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

lessonSchema.index({ level: 1, title: 1 });

module.exports = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
