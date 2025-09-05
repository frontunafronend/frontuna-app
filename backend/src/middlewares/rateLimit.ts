/**
 * 🚦 ENHANCED RATE LIMITING
 * Progressive backoff for brute force protection
 * Integrates with existing rate limiting system
 */

import rateLimit from 'express-rate-limit';
import { createAuditLog, AUDIT_EVENTS } from '../features/audit/audit.repository';
import { env } from '../config/env';

// In-memory store for failed login attempts (use Redis in production)
const failedAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>();

/**
 * Progressive backoff configuration
 */
const BACKOFF_CONFIG = {
  maxAttempts: 5,
  baseDelay: 60000, // 1 minute
  maxDelay: 3600000, // 1 hour
  multiplier: 2,
};

/**
 * Get backoff delay based on attempt count
 */
function getBackoffDelay(attempts: number): number {
  const delay = BACKOFF_CONFIG.baseDelay * Math.pow(BACKOFF_CONFIG.multiplier, attempts - BACKOFF_CONFIG.maxAttempts);
  return Math.min(delay, BACKOFF_CONFIG.maxDelay);
}

/**
 * Check if IP+email combination is blocked
 */
export function checkBruteForce(ip: string, email?: string) {
  return (req: any, res: any, next: any) => {
    const key = email ? `${ip}:${email}` : ip;
    const now = Date.now();
    const attempt = failedAttempts.get(key);

    if (attempt && attempt.blockedUntil && now < attempt.blockedUntil) {
      const remainingTime = Math.ceil((attempt.blockedUntil - now) / 1000);
      
      // Log brute force attempt
      createAuditLog({
        event: AUDIT_EVENTS.BRUTE_FORCE_DETECTED,
        meta: { ip, email, remainingTime, attempts: attempt.count },
        ip,
        userAgent: req.get('User-Agent')
      });

      res.status(429).json({
        success: false,
        error: {
          code: 'BRUTE_FORCE_DETECTED',
          message: `Too many failed attempts. Try again in ${remainingTime} seconds.`,
          retryAfter: remainingTime
        }
      });
      return;
    }

    next();
  };
}

/**
 * Record failed login attempt
 */
export function recordFailedAttempt(ip: string, email?: string): void {
  const key = email ? `${ip}:${email}` : ip;
  const now = Date.now();
  const attempt = failedAttempts.get(key) || { count: 0, lastAttempt: 0 };

  attempt.count++;
  attempt.lastAttempt = now;

  if (attempt.count >= BACKOFF_CONFIG.maxAttempts) {
    const delay = getBackoffDelay(attempt.count);
    attempt.blockedUntil = now + delay;
  }

  failedAttempts.set(key, attempt);

  // Clean up old entries (older than 1 hour)
  const cutoff = now - 3600000;
  for (const [k, v] of failedAttempts.entries()) {
    if (v.lastAttempt < cutoff && (!v.blockedUntil || v.blockedUntil < now)) {
      failedAttempts.delete(k);
    }
  }
}

/**
 * Clear failed attempts on successful login
 */
export function clearFailedAttempts(ip: string, email?: string): void {
  const key = email ? `${ip}:${email}` : ip;
  failedAttempts.delete(key);
}

/**
 * Enhanced rate limit configurations
 */

// General API rate limit
export const generalLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. You can make 100 requests per 15 minutes.',
      retryAfter: 900
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    createAuditLog({
      event: 'RATE_LIMIT_EXCEEDED',
      meta: { endpoint: req.originalUrl, limit: 'general' },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json(res.locals.message || {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests'
      }
    });
  }
});

// Authentication endpoints (stricter)
export const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Increased from 5 to 10 for better UX
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. You can make 10 attempts per 15 minutes.',
      retryAfter: 900
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    createAuditLog({
      event: 'RATE_LIMIT_EXCEEDED',
      meta: { endpoint: req.originalUrl, limit: 'auth' },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts'
      }
    });
  }
});

// Password reset (very strict)
export const passwordResetLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: {
      code: 'PASSWORD_RESET_LIMIT_EXCEEDED',
      message: 'Too many password reset requests. You can make 3 requests per hour.',
      retryAfter: 3600
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    createAuditLog({
      event: 'RATE_LIMIT_EXCEEDED',
      meta: { endpoint: req.originalUrl, limit: 'password_reset' },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'PASSWORD_RESET_LIMIT_EXCEEDED',
        message: 'Too many password reset requests'
      }
    });
  }
});

// Email verification
export const emailVerificationLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    success: false,
    error: {
      code: 'EMAIL_VERIFICATION_LIMIT_EXCEEDED',
      message: 'Too many verification requests. You can make 3 requests per 10 minutes.',
      retryAfter: 600
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    createAuditLog({
      event: 'RATE_LIMIT_EXCEEDED',
      meta: { endpoint: req.originalUrl, limit: 'email_verification' },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'EMAIL_VERIFICATION_LIMIT_EXCEEDED',
        message: 'Too many verification requests'
      }
    });
  }
});
