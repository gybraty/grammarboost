const { v2: cloudinary } = require('cloudinary');
const { ApiError } = require('../utils/ApiError');

const ensureConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new ApiError(500, 'Cloudinary environment variables are missing');
  }

  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  }
};

const uploadBuffer = async (buffer, options = {}) => {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });

    stream.end(buffer);
  });
};

module.exports = { uploadBuffer };
