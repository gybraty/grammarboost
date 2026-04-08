const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');
const tokenService = require('../services/tokenService');
const { ApiError } = require('../utils/ApiError');
const { User } = require('../models');

const setAuthCookies = (res, tokens) => {
  res.cookie('accessToken', tokens.accessToken, tokenService.getAccessCookieOptions());
  res.cookie('refreshToken', tokens.refreshToken, tokenService.getRefreshCookieOptions());
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', tokenService.getAccessCookieOptions());
  res.clearCookie('refreshToken', tokenService.getRefreshCookieOptions());
};

const register = asyncHandler(async (req, res) => {
  const { email, password, displayName, level, goals } = req.body;
  const { user, tokens } = await authService.register({
    email,
    password,
    displayName,
    level,
    goals,
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
  });

  setAuthCookies(res, tokens);
  res.status(201).json({ data: user });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login({
    email,
    password,
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
  });

  setAuthCookies(res, tokens);
  res.json({ data: user });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies || {};
  const { user, tokens } = await authService.refresh({
    refreshToken,
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
  });

  setAuthCookies(res, tokens);
  res.json({ data: user });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies || {};
  await authService.logout({ refreshToken });
  clearAuthCookies(res);
  res.status(204).send();
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({ data: authService.sanitizeUser(user) });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};
