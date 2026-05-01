const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { ApiError } = require('../utils/ApiError');

let cachedClient;

const getR2Config = () => {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_BASE_URL,
    R2_ENDPOINT,
  } = process.env;

  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    throw new ApiError(500, 'R2 is not configured');
  }

  const endpoint =
    R2_ENDPOINT || (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '');

  if (!endpoint) {
    throw new ApiError(500, 'R2 is not configured');
  }

  return {
    endpoint,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET,
    publicBaseUrl: R2_PUBLIC_BASE_URL,
  };
};

const getClient = (config) => {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }
  return cachedClient;
};

const getPublicBaseUrl = (config) =>
  (config.publicBaseUrl || `${config.endpoint.replace(/\/$/, '')}/${config.bucket}`).replace(
    /\/$/,
    ''
  );

const buildPublicUrl = (config, key) => `${getPublicBaseUrl(config)}/${key}`;

const sanitizeName = (name) => name.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-');

const uploadPdfBuffer = async ({ buffer, originalName, contentType }) => {
  const config = getR2Config();
  const client = getClient(config);
  const ext = path.extname(originalName || '').toLowerCase() || '.pdf';
  const baseName = sanitizeName(path.basename(originalName || 'lesson', ext)) || 'lesson';
  const key = `lessons/${Date.now()}-${baseName}${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/pdf',
    })
  );

  return {
    contentLink: buildPublicUrl(config, key),
    contentKey: key,
    bucket: config.bucket,
  };
};

const deletePdfObject = async (contentKey) => {
  const config = getR2Config();
  const client = getClient(config);

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: contentKey,
    })
  );
};

const getKeyFromPublicUrl = (contentLink) => {
  if (!contentLink) return null;
  const config = getR2Config();
  const base = getPublicBaseUrl(config);

  if (!contentLink.startsWith(base)) {
    return null;
  }

  const remainder = contentLink.slice(base.length).replace(/^\/+/, '');
  if (!remainder) return null;
  return remainder.split('?')[0];
};

module.exports = {
  uploadPdfBuffer,
  deletePdfObject,
  getKeyFromPublicUrl,
};
