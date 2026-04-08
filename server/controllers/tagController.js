const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { slugify } = require('../utils/slugify');
const { Lesson, Tag } = require('../models');

const listTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find().sort({ name: 1 });
  res.json({ data: tags });
});

const createTag = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(400, 'Tag name is required');
  }

  const slug = slugify(name);
  if (!slug) {
    throw new ApiError(400, 'Tag slug could not be generated');
  }

  const existing = await Tag.findOne({ $or: [{ name }, { slug }] });
  if (existing) {
    throw new ApiError(409, 'Tag already exists');
  }

  const tag = await Tag.create({
    name,
    slug,
    description,
    createdBy: req.user.id,
    updatedBy: req.user.id,
  });

  res.status(201).json({ data: tag });
});

const updateTag = asyncHandler(async (req, res) => {
  const { tagId } = req.params;
  const tag = await Tag.findById(tagId);
  if (!tag) {
    throw new ApiError(404, 'Tag not found');
  }

  if (req.body.name) {
    const newSlug = slugify(req.body.name);
    if (!newSlug) {
      throw new ApiError(400, 'Tag slug could not be generated');
    }
    const existing = await Tag.findOne({ slug: newSlug, _id: { $ne: tagId } });
    if (existing) {
      throw new ApiError(409, 'Tag already exists');
    }
    tag.name = req.body.name;
    tag.slug = newSlug;
  }

  if (req.body.description !== undefined) {
    tag.description = req.body.description;
  }

  tag.updatedBy = req.user.id;
  await tag.save();

  res.json({ data: tag });
});

const deleteTag = asyncHandler(async (req, res) => {
  const { tagId } = req.params;
  const tag = await Tag.findByIdAndDelete(tagId);
  if (!tag) {
    throw new ApiError(404, 'Tag not found');
  }

  await Lesson.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } });
  res.status(204).send();
});

module.exports = {
  listTags,
  createTag,
  updateTag,
  deleteTag,
};
