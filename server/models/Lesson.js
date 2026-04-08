const mongoose = require('mongoose');

const { Schema } = mongoose;

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];

const mediaSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, trim: true },
    resourceType: {
      type: String,
      enum: ['image', 'video', 'raw'],
      default: 'image',
    },
    format: { type: String, trim: true },
    width: { type: Number },
    height: { type: Number },
    bytes: { type: Number },
    alt: { type: String, trim: true },
  },
  { _id: false }
);

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
    content: {
      type: String,
      required: true,
    },
    media: [mediaSchema],
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
