const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { createLogger, logAuthEvent, logSecurityEvent } = require('../utils/logger');
const emailService = require('../services/email.service');

const logger = createLogger('auth-controller');

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { sub: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

/**
 * User login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user by email with password
    const user = await User.findOneWithPassword({ email });
    if (!user) {
      logSecurityEvent('failed_login_attempt', { email, ip: req.ip });
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      logSecurityEvent('failed_login_attempt', { userId: user.id, email, ip: req.ip });
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Update user's last login (if you add these fields to schema)
    try {
      await User.updateLastLogin(user.id, { ip: req.ip });
    } catch (error) {
      // Ignore if fields don't exist in schema
      logger.warn('Could not update last login info:', error.message);
    }

    // Remove sensitive data
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      subscription: user.subscriptions?.[0] || null
    };

    logAuthEvent('login_success', user.id, { ip: req.ip, rememberMe });

    res.json({
      success: true,
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
        expiresIn: jwt.decode(accessToken).exp
      },
      message: 'Login successful'
    });

  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * User signup
 */
exports.signup = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, agreeToTerms, subscribeToNewsletter } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: 'An account with this email already exists'
        }
      });
    }

    // Create user using Prisma service
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'user'
    });

    // Create default subscription for the user
    const { prisma } = require('../lib/prisma');
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'free',
        status: 'active',
        startsAt: new Date(),
        renewsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Remove sensitive data for response
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      subscription: {
        plan: 'free',
        status: 'active',
        startsAt: new Date(),
        renewsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    };

    logAuthEvent('signup_success', user.id, { ip: req.ip, subscribeToNewsletter });

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
        expiresIn: jwt.decode(accessToken).exp
      },
      message: 'Account created successfully!'
    });

  } catch (error) {
    logger.error('Signup error:', error);
    next(error);
  }
};

/**
 * Refresh access token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'REFRESH_TOKEN_REQUIRED',
          message: 'Refresh token is required'
        }
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN_TYPE',
          message: 'Invalid token type'
        }
      });
    }

    // Find user
    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid refresh token'
        }
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save();

    logAuthEvent('token_refresh', user._id, { ip: req.ip });

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: jwt.decode(tokens.accessToken).exp
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token'
        }
      });
    }
    
    logger.error('Token refresh error:', error);
    next(error);
  }
};

/**
 * Get user profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'avatar', 'preferences'];
    const actualUpdates = {};

    // Filter allowed updates
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        actualUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      actualUpdates, 
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    logAuthEvent('profile_update', user._id, { updates: Object.keys(actualUpdates) });

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect'
        }
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    logAuthEvent('password_change', user._id, { ip: req.ip });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};

/**
 * Request password reset
 */
exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken, `${user.firstName} ${user.lastName}`);
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
    }

    logAuthEvent('password_reset_request', user._id, { ip: req.ip });

    res.json({
      success: true,
      message: 'If an account with this email exists, you will receive a password reset link.'
    });

  } catch (error) {
    logger.error('Request password reset error:', error);
    next(error);
  }
};

/**
 * Reset password with token
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RESET_TOKEN',
          message: 'Invalid or expired password reset token'
        }
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    logAuthEvent('password_reset_success', user._id, { ip: req.ip });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
};

/**
 * Verify email
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_VERIFICATION_TOKEN',
          message: 'Invalid email verification token'
        }
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerifiedAt = new Date();
    await user.save();

    logAuthEvent('email_verification_success', user._id);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    logger.error('Email verification error:', error);
    next(error);
  }
};

/**
 * Resend verification email
 */
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.isEmailVerified) {
      return res.json({
        success: true,
        message: 'If an unverified account with this email exists, a verification email has been sent.'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    await user.save();

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationToken, `${user.firstName} ${user.lastName}`);
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
    }

    logAuthEvent('verification_email_resent', user._id);

    res.json({
      success: true,
      message: 'If an unverified account with this email exists, a verification email has been sent.'
    });

  } catch (error) {
    logger.error('Resend verification error:', error);
    next(error);
  }
};

/**
 * Logout user
 */
exports.logout = async (req, res, next) => {
  try {
    // Clear refresh token from database
    await User.findByIdAndUpdate(req.user.id, { 
      $unset: { refreshToken: 1 }
    });

    logAuthEvent('logout', req.user.id, { ip: req.ip });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

/**
 * Delete user account
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Password is incorrect'
        }
      });
    }

    // Soft delete - mark as inactive
    user.isActive = false;
    user.deletedAt = new Date();
    await user.save();

    logAuthEvent('account_deletion', user._id, { ip: req.ip });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    logger.error('Delete account error:', error);
    next(error);
  }
};

// OAuth placeholder methods (to be implemented later)
exports.googleAuth = (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Google OAuth not implemented yet'
    }
  });
};

exports.googleCallback = (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Google OAuth callback not implemented yet'
    }
  });
};

exports.githubAuth = (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'GitHub OAuth not implemented yet'
    }
  });
};

exports.githubCallback = (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'GitHub OAuth callback not implemented yet'
    }
  });
};