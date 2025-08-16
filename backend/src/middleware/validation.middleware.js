const { validationResult } = require('express-validator');
const { createLogger } = require('../utils/logger');

const logger = createLogger('validation-middleware');

/**
 * Validation middleware to check express-validator results
 */
const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    logger.warn('Validation failed:', {
      url: req.originalUrl,
      method: req.method,
      errors: validationErrors,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: validationErrors,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
      }
    });
  }

  next();
};

module.exports = validationMiddleware;