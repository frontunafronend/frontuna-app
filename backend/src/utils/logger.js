const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}] ${info.label ? '[' + info.label + ']' : ''}: ${info.message}`
  )
);

// Define transports
const transports = [];

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'debug',
      format: consoleFormat
    })
  );
}

// File transports - disabled for serverless environments like Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const logDir = path.join(__dirname, '../../logs');

  // Error log - only error level (only in non-serverless environments)
  transports.push(
    new DailyRotateFile({
      level: 'error',
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: format
    })
  );
}

  // Combined log - all levels
  transports.push(
    new DailyRotateFile({
      level: process.env.LOG_LEVEL || 'info',
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: format
    })
  );

  // HTTP access log
  transports.push(
    new DailyRotateFile({
      level: 'http',
      filename: path.join(logDir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: format
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false
});

/**
 * Create a child logger with a specific label
 * @param {string} label - The label for the logger
 * @returns {winston.Logger} Child logger instance
 */
function createLogger(label) {
  return logger.child({ label });
}

/**
 * Log an error with context
 * @param {string} message - Error message
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
function logError(message, error, context = {}) {
  logger.error(message, {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context
  });
}

/**
 * Log API request/response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} responseTime - Response time in ms
 */
function logApiCall(req, res, responseTime) {
  logger.http('API Call', {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id
  });
}

/**
 * Log authentication events
 * @param {string} event - Event type (login, logout, register, etc.)
 * @param {string} userId - User ID
 * @param {Object} context - Additional context
 */
function logAuthEvent(event, userId, context = {}) {
  logger.info('Authentication Event', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...context
  });
}

/**
 * Log security events
 * @param {string} event - Security event type
 * @param {Object} context - Event context
 */
function logSecurityEvent(event, context = {}) {
  logger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...context
  });
}

/**
 * Log AI/OpenAI related events
 * @param {string} event - AI event type
 * @param {Object} context - Event context
 */
function logAIEvent(event, context = {}) {
  const aiLogger = createLogger('ai-keeper');
  aiLogger.info(event, {
    timestamp: new Date().toISOString(),
    ...context
  });
}

module.exports = {
  logger,
  createLogger,
  logError,
  logApiCall,
  logAuthEvent,
  logSecurityEvent,
  logAIEvent
};