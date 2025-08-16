const nodemailer = require('nodemailer');
const { createLogger } = require('../utils/logger');

const logger = createLogger('email-service');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send verification email
 */
exports.sendVerificationEmail = async (email, token, name) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@frontuna.ai',
      to: email,
      subject: 'Verify your Frontuna.ai account',
      html: `
        <h2>Welcome to Frontuna.ai, \${name}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="\${verificationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>\${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    logger.info('Verification email sent', { email, name });
    
  } catch (error) {
    logger.error('Send verification email error:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (email, token, name) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@frontuna.ai',
      to: email,
      subject: 'Reset your Frontuna.ai password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi \${name},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="\${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>\${resetUrl}</p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    logger.info('Password reset email sent', { email, name });
    
  } catch (error) {
    logger.error('Send password reset email error:', error);
    throw error;
  }
};

/**
 * Test email configuration
 */
exports.testConnection = async () => {
  try {
    await transporter.verify();
    return { success: true, message: 'SMTP connection verified' };
  } catch (error) {
    logger.error('SMTP connection test failed:', error);
    return { success: false, error: error.message };
  }
};