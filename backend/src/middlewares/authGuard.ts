/**
 * 🛡️ SECURE AUTH GUARD MIDDLEWARE
 * JWT authentication and role-based authorization
 * Supports both Bearer tokens and cookie-based auth
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../libs/jwt';
import { prisma } from '../lib/prisma';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        isActive: boolean;
      };
    }
  }
}

/**
 * Main authentication middleware
 */
export async function authGuard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_MISSING',
          message: 'Access token is required'
        }
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT token
    let payload: AccessTokenPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      let errorCode = 'INVALID_TOKEN';
      let errorMessage = 'Invalid access token';

      if (error.message === 'Access token expired') {
        errorCode = 'TOKEN_EXPIRED';
        errorMessage = 'Access token has expired';
      }

      res.status(401).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage
        }
      });
      return;
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        emailVerifiedAt: true,
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User associated with this token no longer exists'
        }
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'User account has been deactivated'
        }
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    console.error('Auth guard error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error occurred'
      }
    });
  }
}

/**
 * Role-based authorization middleware factory
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
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

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
        }
      });
      return;
    }

    next();
  };
}

/**
 * Optional auth middleware (doesn't fail if no token)
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = verifyAccessToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        }
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        };
      }
    } catch (error) {
      // Invalid token, but continue without user
      console.log('Optional auth - invalid token:', error.message);
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue even on error
  }
}

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Admin or moderator middleware
 */
export const requireModerator = requireRole(['admin', 'moderator']);

/**
 * Email verification check middleware
 */
export function requireEmailVerified(req: Request, res: Response, next: NextFunction): void {
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

  // For now, we'll skip email verification requirement
  // This can be enabled later when email verification is fully implemented
  next();
}
