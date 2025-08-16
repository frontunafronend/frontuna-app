const { createLogger } = require('../utils/logger');

const logger = createLogger('admin-middleware');

/**
 * Admin middleware to check if user has admin privileges
 */
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required for admin access'
        }
      });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      logger.warn('Non-admin user attempted to access admin endpoint', {
        userId: req.user.id,
        role: req.user.role,
        endpoint: req.path,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PRIVILEGES',
          message: 'Admin privileges required'
        }
      });
    }

    logger.info('Admin access granted', {
      userId: req.user.id,
      role: req.user.role,
      endpoint: req.path
    });

    next();

  } catch (error) {
    logger.error('Admin middleware error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'ADMIN_CHECK_ERROR',
        message: 'Error checking admin privileges'
      }
    });
  }
};

module.exports = adminMiddleware;