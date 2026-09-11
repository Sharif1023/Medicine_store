import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

const getUserId = (userOrId) => {
  if (userOrId && typeof userOrId === 'object') {
    return userOrId.id ?? userOrId.userId ?? userOrId.sub;
  }

  return userOrId;
};

const accessSecret =
  process.env.JWT_ACCESS_SECRET ||
  env?.jwtAccessSecret ||
  env?.jwt_access_secret ||
  env?.jwt?.access;

const refreshSecret =
  process.env.JWT_REFRESH_SECRET ||
  env?.jwtRefreshSecret ||
  env?.jwt_refresh_secret ||
  env?.jwt?.refresh;

const accessExpiresIn =
  process.env.JWT_ACCESS_EXPIRES_IN ||
  env?.jwtAccessExpiresIn ||
  env?.jwt?.accessExpiresIn ||
  '15m';

const refreshExpiresIn =
  process.env.JWT_REFRESH_EXPIRES_IN ||
  env?.jwtRefreshExpiresIn ||
  env?.jwt?.refreshExpiresIn ||
  '7d';

if (!accessSecret) {
  throw new Error(
    'JWT_ACCESS_SECRET is missing. Check server/.env'
  );
}

if (!refreshSecret) {
  throw new Error(
    'JWT_REFRESH_SECRET is missing. Check server/.env'
  );
}

export const accessToken = (userOrId) => {
  const userId = getUserId(userOrId);

  if (!userId) {
    throw new Error(
      'Cannot create access token without a user id'
    );
  }

  return jwt.sign(
    {
      sub: String(userId),
      type: 'access',

      // Makes each token unique
      jti: crypto.randomUUID(),
    },
    accessSecret,
    {
      expiresIn: accessExpiresIn,
    }
  );
};

export const refreshToken = (userOrId) => {
  const userId = getUserId(userOrId);

  if (!userId) {
    throw new Error(
      'Cannot create refresh token without a user id'
    );
  }

  return jwt.sign(
    {
      sub: String(userId),
      type: 'refresh',

      // Prevents duplicate refresh token hashes
      jti: crypto.randomUUID(),
    },
    refreshSecret,
    {
      expiresIn: refreshExpiresIn,
    }
  );
};

export const verifyAccess = (token) => {
  return jwt.verify(token, accessSecret);
};

export const verifyRefresh = (token) => {
  return jwt.verify(token, refreshSecret);
};

export const hashToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(String(token))
    .digest('hex');
};

// Backward compatibility
export const signAccess = accessToken;
export const signRefresh = refreshToken;