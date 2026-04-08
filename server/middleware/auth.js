const { ApiError } = require('../utils/ApiError');
const tokenService = require('../services/tokenService');

const requireAuth = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired access token'));
  }
};

const optionalAuth = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return next();
  }

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired access token'));
  }
};

module.exports = { requireAuth, optionalAuth };
