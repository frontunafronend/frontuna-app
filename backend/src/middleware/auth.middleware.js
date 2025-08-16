const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createLogger, logSecurityEvent } = require('../utils/logger');

const logger = createLogger('auth-middleware');

/**
 * Authentication middleware to verify JWT tokens
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_MISSING',
          message: 'Access token is required'
        }
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      let errorCode = 'INVALID_TOKEN';
      let errorMessage = 'Invalid access token';

      if (jwtError.name === 'TokenExpiredError') {
        errorCode = 'TOKEN_EXPIRED';
        errorMessage = 'Access token has expired';
      } else if (jwtError.name === 'JsonWebTokenError') {
        errorCode = 'INVALID_TOKEN';
        errorMessage = 'Invalid access token';
      }

      logSecurityEvent('invalid_token_attempt', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: jwtError.message
      });

      return res.status(401).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage
        }
      });
    }

    // Find user
    const user = await User.findById(decoded.sub);
    
    if (!user) {
      logSecurityEvent('token_for_nonexistent_user', {
        userId: decoded.sub,
        ip: req.ip
      });

      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User associated with this token no longer exists'
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      logSecurityEvent('token_for_inactive_user', {
        userId: user._id,
        ip: req.ip
      });

      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Your account has been deactivated'
        }
      });
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
      logSecurityEvent('token_invalidated_by_password_change', {
        userId: user._id,
        ip: req.ip
      });

      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_INVALIDATED',
          message: 'Token is no longer valid due to password change'
        }
      });
    }

    // Attach user to request object
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      subscription: user.subscription,
      usage: user.usage
    };

    next();

  } catch (error) {
    logger.error('Authentication middleware error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error occurred'
      }
    });
  }
};

/**
 * Optional authentication middleware
 * Adds user info to request if token is present and valid, but doesn't require it
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.sub);
      
      if (user && user.isActive) {
        req.user = {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          subscription: user.subscription,
          usage: user.usage
        };
      }
    } catch (jwtError) {
      // Silently ignore invalid tokens in optional middleware
      logger.debug('Optional auth failed:', jwtError.message);
    }

    next();

  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    next();
  }
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuthMiddleware;