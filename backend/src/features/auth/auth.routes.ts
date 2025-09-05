/**
 * 🔐 SECURE AUTH ROUTES
 * Authentication endpoints with validation and rate limiting
 * Maintains backward compatibility with existing frontend
 */

import { Router } from 'express';
import * as authController from './auth.controller';
import { authGuard } from '../../middlewares/authGuard';
import { validateRequest } from '../../middlewares/validation';
import {
  signupSchema,
  loginSchema,
  refreshTokenSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from './auth.schemas';

const router = Router();

// Rate limiting middleware (imported from existing system)
// Note: Rate limiting is handled by the existing middleware in the main app

/**
 * Public routes (no authentication required)
 */

// POST /api/auth/signup
router.post('/signup', 
  validateRequest(signupSchema),
  authController.signup
);

// POST /api/auth/login
router.post('/login',
  validateRequest(loginSchema),
  authController.login
);

// POST /api/auth/refresh
router.post('/refresh',
  validateRequest(refreshTokenSchema),
  authController.refreshToken
);

// POST /api/auth/reset-password (request reset)
router.post('/reset-password',
  validateRequest(resetPasswordRequestSchema),
  authController.requestPasswordReset
);

// POST /api/auth/reset-password/:token (confirm reset)
router.post('/reset-password/:token',
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

// POST /api/auth/verify-email/:token
router.post('/verify-email/:token',
  validateRequest(verifyEmailSchema),
  authController.verifyEmail
);

// POST /api/auth/resend-verification
router.post('/resend-verification',
  validateRequest(resendVerificationSchema),
  authController.resendVerification
);

/**
 * Protected routes (authentication required)
 */

// GET /api/auth/profile
router.get('/profile',
  authGuard,
  authController.getProfile
);

// POST /api/auth/logout
router.post('/logout',
  authGuard,
  authController.logout
);

// TODO: Add these routes when implementing profile management
// PUT /api/auth/profile
// POST /api/auth/change-password
// DELETE /api/auth/account

// TODO: Add 2FA routes when implementing TOTP
// POST /api/auth/2fa/setup
// POST /api/auth/2fa/enable
// POST /api/auth/2fa/disable
// POST /api/auth/2fa/verify

export default router;
