/**
 * 🔐 TWO-FACTOR AUTHENTICATION SERVICE
 * TOTP-based 2FA using otplib
 * Scaffolding for future implementation
 */

import * as otplib from 'otplib';
import { prisma } from '../../lib/prisma';
import { createAuditLog, AUDIT_EVENTS } from '../audit/audit.repository';
import { verifyPassword } from '../../libs/crypto';
import { findUserByEmailWithPassword, updateUser } from '../users/user.repository';

// Configure TOTP
otplib.authenticator.options = {
  window: 1, // Allow 1 step tolerance (30 seconds before/after)
  step: 30,  // 30-second time step
};

/**
 * Generate 2FA setup data
 */
export async function generate2FASetup(userId: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}> {
  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true, lastName: true }
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  // Generate secret
  const secret = otplib.authenticator.generateSecret();
  
  // Create service name
  const serviceName = 'Frontuna';
  const accountName = user.email;
  const issuer = 'Frontuna.ai';

  // Generate QR code URL
  const qrCodeUrl = otplib.authenticator.keyuri(accountName, serviceName, secret);

  // Generate backup codes (8 codes, 8 characters each)
  const backupCodes = Array.from({ length: 8 }, () => 
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  return {
    secret,
    qrCodeUrl,
    backupCodes,
  };
}

/**
 * Enable 2FA for user
 */
export async function enable2FA(
  userId: string,
  secret: string,
  code: string,
  req: any
): Promise<void> {
  // Verify the TOTP code
  const isValid = otplib.authenticator.verify({
    token: code,
    secret: secret,
  });

  if (!isValid) {
    await createAuditLog({
      userId,
      event: AUDIT_EVENTS.TWOFA_VERIFY_FAIL,
      meta: { action: 'enable' },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    throw new Error('INVALID_2FA_CODE');
  }

  // Store the secret
  await updateUser(userId, { twoFASecret: secret });

  // Audit log
  await createAuditLog({
    userId,
    event: AUDIT_EVENTS.TWOFA_ENABLE,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
}

/**
 * Disable 2FA for user
 */
export async function disable2FA(
  userId: string,
  password: string,
  code: string,
  req: any
): Promise<void> {
  // Get user with password and 2FA secret
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      twoFASecret: true,
    }
  });

  if (!user || !user.twoFASecret) {
    throw new Error('2FA_NOT_ENABLED');
  }

  // Verify password
  const passwordResult = await verifyPassword(password, user.passwordHash);
  if (!passwordResult.isValid) {
    await createAuditLog({
      userId,
      event: AUDIT_EVENTS.TWOFA_VERIFY_FAIL,
      meta: { action: 'disable', reason: 'invalid_password' },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    throw new Error('INVALID_PASSWORD');
  }

  // Verify 2FA code
  const isValid = otplib.authenticator.verify({
    token: code,
    secret: user.twoFASecret,
  });

  if (!isValid) {
    await createAuditLog({
      userId,
      event: AUDIT_EVENTS.TWOFA_VERIFY_FAIL,
      meta: { action: 'disable', reason: 'invalid_code' },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    throw new Error('INVALID_2FA_CODE');
  }

  // Remove 2FA secret
  await updateUser(userId, { twoFASecret: null });

  // Audit log
  await createAuditLog({
    userId,
    event: AUDIT_EVENTS.TWOFA_DISABLE,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
}

/**
 * Verify 2FA code
 */
export async function verify2FACode(
  userId: string,
  code: string,
  req: any
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFASecret: true }
  });

  if (!user || !user.twoFASecret) {
    return false;
  }

  const isValid = otplib.authenticator.verify({
    token: code,
    secret: user.twoFASecret,
  });

  // Audit log
  await createAuditLog({
    userId,
    event: isValid ? AUDIT_EVENTS.TWOFA_VERIFY_OK : AUDIT_EVENTS.TWOFA_VERIFY_FAIL,
    meta: { standalone: true },
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  return isValid;
}

/**
 * Check if user has 2FA enabled
 */
export async function has2FAEnabled(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFASecret: true }
  });

  return !!(user && user.twoFASecret);
}
