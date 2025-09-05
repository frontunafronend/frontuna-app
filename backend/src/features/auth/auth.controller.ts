/**
 * 🔐 SECURE AUTH CONTROLLER
 * Handles HTTP requests for authentication endpoints
 * Maintains backward compatibility with existing frontend
 */

import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { getUserProfile } from '../users/user.repository';
import { env } from '../../config/env';

/**
 * User signup
 * POST /api/auth/signup
 */
export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, firstName, lastName, agreeToTerms } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email and password are required'
        }
      });
      return;
    }

    if (!agreeToTerms) {
      res.status(400).json({
        success: false,
        error: {
          code: 'TERMS_NOT_AGREED',
          message: 'You must agree to the terms and conditions'
        }
      });
      return;
    }

    const result = await authService.signup({
      email,
      password,
      firstName,
      lastName,
    }, req);

    // Set refresh token cookie
    setRefreshTokenCookie(res, result.refreshToken);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken, // Keep for transition
        expiresIn: result.expiresIn,
      },
      message: 'Account created successfully!'
    });

  } catch (error) {
    if (error.message === 'USER_ALREADY_EXISTS') {
      res.status(409).json({
        success: false,
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: 'An account with this email already exists'
        }
      });
      return;
    }

    console.error('Signup error:', error);
    next(error);
  }
}

/**
 * User login
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, code } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email and password are required'
        }
      });
      return;
    }

    const result = await authService.login({
      email,
      password,
      code,
    }, req);

    // Set refresh token cookie
    setRefreshTokenCookie(res, result.refreshToken);

    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken, // Keep for transition
        expiresIn: result.expiresIn,
      },
      message: 'Login successful'
    });

  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
      return;
    }

    if (error.message === 'USER_INACTIVE') {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'Your account has been deactivated'
        }
      });
      return;
    }

    if (error.message === 'TWOFA_REQUIRED') {
      res.status(200).json({
        success: false,
        error: {
          code: 'TWOFA_REQUIRED',
          message: 'Two-factor authentication code required'
        }
      });
      return;
    }

    console.error('Login error:', error);
    next(error);
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Try to get refresh token from cookie first, then body (transition period)
    let refreshToken = req.cookies?.frt || req.body?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: {
          code: 'REFRESH_TOKEN_REQUIRED',
          message: 'Refresh token is required'
        }
      });
      return;
    }

    const result = await authService.refreshTokens(refreshToken, req);

    // Set new refresh token cookie
    setRefreshTokenCookie(res, result.refreshToken);

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken, // Keep for transition
        expiresIn: result.expiresIn,
      }
    });

  } catch (error) {
    // Clear invalid refresh token cookie
    clearRefreshTokenCookie(res);

    if (error.message === 'INVALID_REFRESH_TOKEN' || 
        error.message === 'REFRESH_TOKEN_EXPIRED' ||
        error.message === 'TOKEN_REVOKED') {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token'
        }
      });
      return;
    }

    if (error.message === 'USER_INACTIVE') {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'User account has been deactivated'
        }
      });
      return;
    }

    console.error('Refresh token error:', error);
    next(error);
  }
}

/**
 * User logout
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies?.frt || req.body?.refreshToken;

    await authService.logout(refreshToken, req);

    // Clear refresh token cookie
    clearRefreshTokenCookie(res);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
}

/**
 * Get user profile
 * GET /api/auth/profile
 */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const user = await getUserProfile(req.user.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    next(error);
  }
}

/**
 * Request password reset
 * POST /api/auth/reset-password
 */
export async function requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email is required'
        }
      });
      return;
    }

    await authService.requestPasswordReset(email, req);

    res.json({
      success: true,
      message: 'If an account with this email exists, you will receive a password reset link.'
    });

  } catch (error) {
    console.error('Request password reset error:', error);
    next(error);
  }
}

/**
 * Reset password with token
 * POST /api/auth/reset-password/:token
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_REQUIRED',
          message: 'New password is required'
        }
      });
      return;
    }

    await authService.resetPassword(token, newPassword, req);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    if (error.message === 'INVALID_RESET_TOKEN') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RESET_TOKEN',
          message: 'Invalid or expired password reset token'
        }
      });
      return;
    }

    console.error('Reset password error:', error);
    next(error);
  }
}

/**
 * Verify email with token
 * POST /api/auth/verify-email/:token
 */
export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.params;

    await authService.verifyEmail(token, req);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    if (error.message === 'INVALID_VERIFICATION_TOKEN') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_VERIFICATION_TOKEN',
          message: 'Invalid or expired email verification token'
        }
      });
      return;
    }

    console.error('Email verification error:', error);
    next(error);
  }
}

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export async function resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email is required'
        }
      });
      return;
    }

    // TODO: Implement resend verification logic
    res.json({
      success: true,
      message: 'If an unverified account with this email exists, a verification email has been sent.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    next(error);
  }
}

/**
 * Helper: Set refresh token cookie
 */
function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  const maxAge = 45 * 24 * 60 * 60 * 1000; // 45 days in milliseconds

  res.cookie('frt', refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    path: '/api/auth/refresh',
    maxAge,
  });
}

/**
 * Helper: Clear refresh token cookie
 */
function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie('frt', {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    path: '/api/auth/refresh',
  });
}
