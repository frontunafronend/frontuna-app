const rateLimit = require('express-rate-limit');
const { createLogger, logSecurityEvent } = require('../utils/logger');

const logger = createLogger('rate-limit');

// Create rate limit message
const createRateLimitMessage = (windowMs, max) => ({
  success: false,
  error: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: `Too many requests. You can make ${max} requests per ${windowMs / 1000 / 60} minutes.`,
    retryAfter: Math.ceil(windowMs / 1000),
    timestamp: new Date().toISOString()
  }
});

// Rate limit handler
const rateLimitHandler = (req, res) => {
  const windowMs = req.rateLimit?.windowMs || 900000; // 15 minutes default
  const max = req.rateLimit?.limit || 100;
  
  logSecurityEvent('rate_limit_exceeded', {
    ip: req.ip,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  res.status(429).json(createRateLimitMessage(windowMs, max));
};

// Skip rate limiting for certain conditions
const skipSuccessfulRequests = (req, res) => {
  return res.statusCode < 400;
};

const skipFailedRequests = (req, res) => {
  return res.statusCode >= 400;
};

// General API rate limit
const generalLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: createRateLimitMessage(15 * 60 * 1000, 100),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: skipSuccessfulRequests
});

// Authentication endpoints rate limit (stricter)
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: createRateLimitMessage(15 * 60 * 1000, 5),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false
});

// Password reset rate limit (very strict)
const passwordResetLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: createRateLimitMessage(60 * 60 * 1000, 3),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false
});

// Email verification rate limit
const emailVerificationLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Limit each IP to 3 verification requests per 10 minutes
  message: createRateLimitMessage(10 * 60 * 1000, 3),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false
});

// Component generation rate limit
const generationLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 generation requests per 5 minutes
  message: createRateLimitMessage(5 * 60 * 1000, 20),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: skipSuccessfulRequests
});

// File upload rate limit
const uploadLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 upload requests per 10 minutes
  message: createRateLimitMessage(10 * 60 * 1000, 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: skipSuccessfulRequests
});

// Admin endpoints rate limit
const adminLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 admin requests per 5 minutes
  message: createRateLimitMessage(5 * 60 * 1000, 50),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: skipSuccessfulRequests
});

// Export rate limit (for downloading components)
const exportLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // Limit each IP to 15 export requests per 10 minutes
  message: createRateLimitMessage(10 * 60 * 1000, 15),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: skipSuccessfulRequests
});

module.exports = {
  general: generalLimit,
  auth: authLimit,
  passwordReset: passwordResetLimit,
  emailVerification: emailVerificationLimit,
  generation: generationLimit,
  upload: uploadLimit,
  admin: adminLimit,
  export: exportLimit
};