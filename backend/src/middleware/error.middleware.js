const { createLogger } = require('../utils/logger');

const logger = createLogger('error-middleware');

/**
 * Global error handling middleware
 */
const errorMiddleware = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let errorResponse = {
    success: false,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    }
  };

  // Log error details
  logger.error('Error occurred:', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    }
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    const validationErrors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    
    errorResponse.error = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: validationErrors,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };
  } 
  else if (error.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId, etc.)
    statusCode = 400;
    errorResponse.error = {
      code: 'INVALID_DATA_FORMAT',
      message: `Invalid ${error.path}: ${error.value}`,
      field: error.path,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };
  }
  else if (error.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    const duplicateField = Object.keys(error.keyValue)[0];
    const duplicateValue = error.keyValue[duplicateField];
    
    errorResponse.error = {
      code: 'DUPLICATE_ENTRY',
      message: `${duplicateField} '${duplicateValue}' already exists`,
      field: duplicateField,
      value: duplicateValue,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };
  }
  else if (error.name === 'JsonWebTokenError') {
    // JWT error
    statusCode = 401;
    errorResponse.error = {
      code: 'INVALID_TOKEN',
      message: 'Invalid token',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };
  }
  else if (error.name === 'TokenExpiredError') {
    // JWT expired error
    statusCode = 401;
    errorResponse.error = {
      code: 'TOKEN_EXPIRED',
      message: 'Token has expired',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };
  }
  else if (error.name === 'MulterError') {
    // File upload error
    statusCode = 400;
    let message = 'File upload error';
    let code = 'FILE_UPLOAD_ERROR';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large';
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        code = 'TOO_MANY_FILES';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        code = 'UNEXPECTED_FILE';
        break;
      default:
        message = error.message;
    }

    errorResponse.error = {
      code,
      message,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };
  }
  else if (error.type === 'entity.parse.failed') {
    // JSON parse error
    statusCode = 400;
    errorResponse.error = {
      code: 'INVALID_JSON',
      message: 'Invalid JSON in request body',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };
  }
  else if (error.type === 'entity.too.large') {
    // Request body too large
    statusCode = 413;
    errorResponse.error = {
      code: 'REQUEST_TOO_LARGE',
      message: 'Request body too large',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };
  }

  // Don't expose sensitive error details in production
  if (process.env.NODE_ENV === 'production') {
    if (statusCode === 500) {
      errorResponse.error.message = 'Internal server error';
      delete errorResponse.error.stack;
    }
    
    // Remove sensitive fields
    delete errorResponse.error.stack;
    
    // Don't expose detailed validation errors in production
    if (errorResponse.error.code === 'VALIDATION_ERROR' && errorResponse.error.details) {
      errorResponse.error.details = errorResponse.error.details.map(detail => ({
        field: detail.field,
        message: detail.message
        // Remove value to avoid exposing sensitive data
      }));
    }
  } else {
    // In development, include stack trace
    if (error.stack) {
      errorResponse.error.stack = error.stack.split('\n').slice(0, 10); // Limit stack trace
    }
  }

  // Add request ID if available (useful for debugging)
  if (req.requestId) {
    errorResponse.error.requestId = req.requestId;
  }

  // Add suggestion for common errors
  if (statusCode === 401) {
    errorResponse.error.suggestion = 'Please check your authentication credentials and try again';
  } else if (statusCode === 403) {
    errorResponse.error.suggestion = 'You do not have permission to access this resource';
  } else if (statusCode === 404) {
    errorResponse.error.suggestion = 'Please check the URL and try again';
  } else if (statusCode === 429) {
    errorResponse.error.suggestion = 'You are making too many requests. Please slow down and try again later';
  } else if (statusCode === 500) {
    errorResponse.error.suggestion = 'This is a server error. Please try again later or contact support if the problem persists';
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle async errors in route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create a custom error
 */
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found middleware (404 handler)
 */
const notFoundMiddleware = (req, res, next) => {
  const error = new AppError(
    `Cannot find ${req.originalUrl} on this server`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

module.exports = {
  errorMiddleware,
  asyncHandler,
  AppError,
  notFoundMiddleware
};