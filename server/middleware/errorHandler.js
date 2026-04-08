const { ApiError } = require('../utils/ApiError');

const notFound = (req, res) => {
  res.status(404).json({ error: { message: 'Not Found' } });
};

const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details;

  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
    details = Object.values(err.errors).map((error) => error.message);
  }

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier';
  }

  if (err.code === 11000) {
    status = 409;
    message = 'Duplicate value';
    details = err.keyValue;
  }

  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
    details = err.details;
  }

  res.status(status).json({ error: { message, details } });
};

module.exports = { notFound, errorHandler };
