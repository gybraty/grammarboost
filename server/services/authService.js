const bcrypt = require('bcryptjs');
const { RefreshToken, User } = require('../models');
const { ApiError } = require('../utils/ApiError');
const tokenService = require('./tokenService');

const isEmailValid = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');

const sanitizeUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  profile: user.profile,
});

const createRefreshTokenRecord = async ({
  user,
  refreshToken,
  userAgent,
  ipAddress,
}) => {
  const decoded = tokenService.decodeRefreshToken(refreshToken);
  if (!decoded?.exp) {
    throw new ApiError(500, 'Unable to parse refresh token expiry');
  }

  const expiresAt = new Date(decoded.exp * 1000);
  const tokenHash = tokenService.hashToken(refreshToken);

  return RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt,
    userAgent,
    ipAddress,
  });
};

const issueTokensForUser = async ({ user, userAgent, ipAddress }) => {
  const accessToken = tokenService.createAccessToken(user);
  const refreshToken = tokenService.createRefreshToken(user);
  await createRefreshTokenRecord({ user, refreshToken, userAgent, ipAddress });
  return { accessToken, refreshToken };
};

const register = async ({
  email,
  password,
  displayName,
  level,
  goals,
  userAgent,
  ipAddress,
}) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const normalizedEmail = email.toLowerCase();

  if (!isEmailValid(normalizedEmail)) {
    throw new ApiError(400, 'Email format is invalid');
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    profile: {
      displayName,
      level,
      goals,
    },
  });

  const tokens = await issueTokensForUser({ user, userAgent, ipAddress });
  return { user: sanitizeUser(user), tokens };
};

const login = async ({ email, password, userAgent, ipAddress }) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const tokens = await issueTokensForUser({ user, userAgent, ipAddress });
  return { user: sanitizeUser(user), tokens };
};

const refresh = async ({ refreshToken, userAgent, ipAddress }) => {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  let payload;
  try {
    payload = tokenService.verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const tokenHash = tokenService.hashToken(refreshToken);
  const tokenRecord = await RefreshToken.findOne({
    tokenHash,
    user: payload.sub,
    revokedAt: null,
  });

  if (!tokenRecord) {
    throw new ApiError(401, 'Refresh token has been revoked');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  const newRefreshToken = tokenService.createRefreshToken(user);
  const newTokenHash = tokenService.hashToken(newRefreshToken);
  const decoded = tokenService.decodeRefreshToken(newRefreshToken);
  if (!decoded?.exp) {
    throw new ApiError(500, 'Unable to parse refresh token expiry');
  }

  tokenRecord.revokedAt = new Date();
  tokenRecord.replacedByTokenHash = newTokenHash;
  await tokenRecord.save();

  await RefreshToken.create({
    user: user._id,
    tokenHash: newTokenHash,
    expiresAt: new Date(decoded.exp * 1000),
    userAgent,
    ipAddress,
  });

  const accessToken = tokenService.createAccessToken(user);
  return { user: sanitizeUser(user), tokens: { accessToken, refreshToken: newRefreshToken } };
};

const logout = async ({ refreshToken }) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = tokenService.hashToken(refreshToken);
  const tokenRecord = await RefreshToken.findOne({ tokenHash, revokedAt: null });
  if (!tokenRecord) {
    return;
  }

  tokenRecord.revokedAt = new Date();
  await tokenRecord.save();
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  sanitizeUser,
};
