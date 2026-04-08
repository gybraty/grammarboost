const { ApiError } = require('../utils/ApiError');

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Forbidden'));
  }
  return next();
};

module.exports = { requireAdmin };
