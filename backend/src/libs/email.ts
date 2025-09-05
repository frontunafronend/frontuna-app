/**
 * 📧 SECURE EMAIL SERVICE
 * Handles email verification and password reset emails
 * Development mode logs to console, production uses SMTP
 */

import * as nodemailer from 'nodemailer';
import { env } from '../config/env';

// Email transporter
let transporter: nodemailer.Transporter | null = null;

/**
 * Initialize email transporter
 */
function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (env.isDevelopment && (!env.SMTP_USER || !env.SMTP_PASS)) {
      // Development mode - log to console
      transporter = nodemailer.createTransporter({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    } else {
      // Production mode - use SMTP
      transporter = nodemailer.createTransporter({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
  }
  
  return transporter;
}

/**
 * Email templates
 */
const templates = {
  emailVerification: (name: string, verificationUrl: string) => ({
    subject: 'Verify your Frontuna account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Welcome to Frontuna!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Thank you for signing up for Frontuna. To complete your registration, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace;">${verificationUrl}</p>
            
            <p><strong>This link will expire in 24 hours.</strong></p>
            
            <p>If you didn't create an account with Frontuna, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Frontuna. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordReset: (name: string, resetUrl: string) => ({
    subject: 'Reset your Frontuna password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>You requested to reset your password for your Frontuna account. Click the button below to set a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This link will expire in 15 minutes</li>
                <li>The link can only be used once</li>
                <li>If you didn't request this reset, please ignore this email</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 Frontuna. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

/**
 * Send email verification
 */
export async function sendEmailVerification(
  email: string,
  token: string,
  name: string
): Promise<void> {
  const verificationUrl = `${env.FRONTEND_URL}/auth/verify-email/${token}`;
  const template = templates.emailVerification(name, verificationUrl);
  
  await sendEmail(email, template.subject, template.html);
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(
  email: string,
  token: string,
  name: string
): Promise<void> {
  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password/${token}`;
  const template = templates.passwordReset(name, resetUrl);
  
  await sendEmail(email, template.subject, template.html);
}

/**
 * Generic email sender
 */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    const transporter = getTransporter();
    
    const mailOptions = {
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    };

    if (env.isDevelopment && (!env.SMTP_USER || !env.SMTP_PASS)) {
      // Development mode - log to console
      console.log('📧 Email would be sent:');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`HTML: ${html.substring(0, 200)}...`);
    } else {
      // Production mode - actually send
      const result = await transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${to}: ${result.messageId}`);
    }
  } catch (error) {
    console.error('📧 Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Test email configuration
 */
export async function testEmailConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (env.isDevelopment && (!env.SMTP_USER || !env.SMTP_PASS)) {
      return { success: true, message: 'Development mode - emails logged to console' };
    }
    
    const transporter = getTransporter();
    await transporter.verify();
    return { success: true, message: 'SMTP connection verified' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
