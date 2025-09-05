/**
 * 🔐 SECURE JWT LIBRARY
 * Handles access and refresh token signing/verification
 * Short-lived access tokens with proper claims
 */

import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';

// JWT payload interfaces
export interface AccessTokenPayload {
  sub: string;    // user ID
  email: string;  // user email
  role: string;   // user role
  iat: number;    // issued at
  exp: number;    // expires at
}

export interface RefreshTokenPayload {
  sub: string;    // user ID
  type: 'refresh';
  iat: number;    // issued at
  exp: number;    // expires at
}

/**
 * Sign access token (short-lived, 15 minutes)
 */
export function signAccessToken(payload: {
  userId: string;
  email: string;
  role: string;
}): string {
  const tokenPayload: Omit<AccessTokenPayload, 'iat' | 'exp'> = {
    sub: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  return jwt.sign(tokenPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
}

/**
 * Sign refresh token (long-lived, 45 days)
 */
export function signRefreshToken(userId: string): string {
  const tokenPayload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    sub: userId,
    type: 'refresh',
  };

  return jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    algorithm: 'HS256',
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
    }) as AccessTokenPayload;

    // Validate payload structure
    if (!payload.sub || !payload.email || !payload.role) {
      throw new Error('Invalid token payload');
    }

    return payload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token expired');
    }
    throw error;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
    }) as RefreshTokenPayload;

    // Validate payload structure
    if (!payload.sub || payload.type !== 'refresh') {
      throw new Error('Invalid refresh token payload');
    }

    return payload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    throw error;
  }
}

/**
 * Decode token without verification (for getting expiry info)
 */
export function decodeToken(token: string): any {
  return jwt.decode(token);
}

/**
 * Get token expiry timestamp
 */
export function getTokenExpiry(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as any;
    return decoded && decoded.exp ? decoded.exp : null;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired (without verification)
 */
export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  
  return Date.now() >= expiry * 1000;
}
