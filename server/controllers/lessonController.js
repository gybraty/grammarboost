const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { slugify } = require('../utils/slugify');
const { Lesson, Tag } = require('../models');
const { uploadBuffer } = require('../services/cloudinaryService');

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];

const listLessons = asyncHandler(async (req, res) => {
  const { level, search, includeUnpublished, tag } = req.query;
  const filter = {};

  if (level) {
    if (!cefrLevels.includes(level)) {
      throw new ApiError(400, 'Invalid CEFR level');
    }
    filter.level = level;
  }

  if (tag) {
    const tagDoc = mongoose.Types.ObjectId.isValid(tag)
      ? await Tag.findById(tag)
      : await Tag.findOne({ slug: tag });

    if (!tagDoc) {
      throw new ApiError(404, 'Tag not found');
    }

    filter.tags = tagDoc._id;
  }

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ title: regex }, { summary: regex }];
    const tagMatches = await Tag.find({
      $or: [{ name: regex }, { slug: regex }],
    }).select('_id');
    if (tagMatches.length > 0) {
      filter.$or.push({ tags: { $in: tagMatches.map((tagDoc) => tagDoc._id) } });
    }
  }

  if (includeUnpublished === 'true') {
    if (!req.user || req.user.role !== 'admin') {
      throw new ApiError(403, 'Admin access required to include unpublished lessons');
    }
  } else {
    filter.isPublished = true;
  }

  const lessons = await Lesson.find(filter)
    .populate('tags', 'name slug')
    .sort({ level: 1, title: 1 });
  res.json({ data: lessons });
});

const getLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const query = mongoose.Types.ObjectId.isValid(lessonId)
    ? { _id: lessonId }
    : { slug: lessonId };

  const lesson = await Lesson.findOne(query).populate('tags', 'name slug');
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  if (!lesson.isPublished && (!req.user || req.user.role !== 'admin')) {
    throw new ApiError(403, 'Lesson is not published');
  }

  res.json({ data: lesson });
});

const resolveTags = async (tags) => {
  if (!tags || tags.length === 0) {
    return [];
  }

  const invalidId = tags.find((tagId) => !mongoose.Types.ObjectId.isValid(tagId));
  if (invalidId) {
    throw new ApiError(400, 'Tags must be valid tag ids');
  }

  const tagDocs = await Tag.find({ _id: { $in: tags } }).select('_id');
  if (tagDocs.length !== tags.length) {
    throw new ApiError(400, 'One or more tags do not exist');
  }

  return tagDocs.map((tagDoc) => tagDoc._id);
};

const createLesson = asyncHandler(async (req, res) => {
  const { level, title, slug, summary, content, tags, isPublished } = req.body;

  if (!level || !title || !content) {
    throw new ApiError(400, 'Level, title, and content are required');
  }

  if (!cefrLevels.includes(level)) {
    throw new ApiError(400, 'Invalid CEFR level');
  }

  if (tags && !Array.isArray(tags)) {
    throw new ApiError(400, 'Tags must be an array');
  }

  let finalSlug = slugify(slug || title);
  if (!finalSlug) {
    throw new ApiError(400, 'Slug could not be generated');
  }

  const existing = await Lesson.findOne({ slug: finalSlug });
  if (existing) {
    finalSlug = `${finalSlug}-${Date.now()}`;
  }

  const tagIds = await resolveTags(tags);

  const lesson = await Lesson.create({
    level,
    title,
    slug: finalSlug,
    summary,
    content,
    tags: tagIds,
    isPublished: isPublished !== undefined ? isPublished : true,
    createdBy: req.user.id,
    updatedBy: req.user.id,
  });

  res.status(201).json({ data: lesson });
});

const updateLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  const updates = ['level', 'title', 'summary', 'content', 'isPublished'];
  updates.forEach((field) => {
    if (req.body[field] !== undefined) {
      lesson[field] = req.body[field];
    }
  });

  if (req.body.tags !== undefined) {
    if (req.body.tags && !Array.isArray(req.body.tags)) {
      throw new ApiError(400, 'Tags must be an array');
    }
    lesson.tags = await resolveTags(req.body.tags);
  }

  if (req.body.slug) {
    const newSlug = slugify(req.body.slug);
    if (!newSlug) {
      throw new ApiError(400, 'Slug could not be generated');
    }
    const existing = await Lesson.findOne({ slug: newSlug, _id: { $ne: lessonId } });
    if (existing) {
      throw new ApiError(409, 'Slug already exists');
    }
    lesson.slug = newSlug;
  }

  if (req.body.level && !cefrLevels.includes(req.body.level)) {
    throw new ApiError(400, 'Invalid CEFR level');
  }

  lesson.updatedBy = req.user.id;
  await lesson.save();
  res.json({ data: lesson });
});

const deleteLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const lesson = await Lesson.findByIdAndDelete(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  res.status(204).send();
});

const uploadLessonMedia = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  if (!req.file) {
    throw new ApiError(400, 'Media file is required');
  }

  const result = await uploadBuffer(req.file.buffer, {
    folder: 'grammarboost/lessons',
    resource_type: 'image',
  });

  const mediaItem = {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    alt: req.body.alt,
  };

  lesson.media.push(mediaItem);
  lesson.updatedBy = req.user.id;
  await lesson.save();

  res.status(201).json({ data: mediaItem });
});

module.exports = {
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  uploadLessonMedia,
};
