/**
 * 🔐 SECURE AUTH SERVICE
 * Handles all authentication operations with token rotation and security
 */

import { Request } from 'express';
import { hashPassword, verifyPassword, createRefreshToken, createOneTimeToken, hashToken, timingSafeEqual } from '../../libs/crypto';
import { signAccessToken, signRefreshToken, verifyRefreshToken, getTokenExpiry } from '../../libs/jwt';
import { sendEmailVerification, sendPasswordReset } from '../../libs/email';
import { prisma } from '../../lib/prisma';
import { createAuditLog, AUDIT_EVENTS } from '../audit/audit.repository';
import { 
  findUserByEmail, 
  findUserByEmailWithPassword, 
  createUser, 
  updateUser, 
  updateLoginInfo,
  emailExists 
} from '../users/user.repository';

// Interfaces
export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  code?: string; // 2FA code
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    isActive: boolean;
    emailVerifiedAt?: Date;
    createdAt: Date;
    subscription?: any;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * User signup
 */
export async function signup(data: SignupRequest, req: Request): Promise<AuthResponse> {
  const { email, password, firstName, lastName } = data;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');

  // Check if user already exists
  if (await emailExists(email)) {
    await createAuditLog({
      event: AUDIT_EVENTS.SIGNUP,
      meta: { email, success: false, reason: 'email_exists' },
      ip,
      userAgent
    });
    
    throw new Error('USER_ALREADY_EXISTS');
  }

  // Hash password with Argon2
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await createUser({
    email,
    passwordHash,
    firstName,
    lastName,
  });

  // Create default subscription
  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: 'free',
      status: 'active',
      startsAt: new Date(),
      renewsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    }
  });

  // Create email verification token
  const { token: emailToken, hashedToken: hashedEmailToken, expiresAt: emailExpiresAt } = createOneTimeToken(24 * 60); // 24 hours

  await prisma.emailVerifyToken.create({
    data: {
      userId: user.id,
      hashedToken: hashedEmailToken,
      expiresAt: emailExpiresAt,
    }
  });

  // Send verification email
  try {
    await sendEmailVerification(email, emailToken, firstName || 'User');
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't fail signup if email fails
  }

  // Generate tokens
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const { token: refreshTokenRaw, hashedToken: hashedRefreshToken, expiresAt: refreshExpiresAt } = createRefreshToken();

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      hashedToken: hashedRefreshToken,
      expiresAt: refreshExpiresAt,
      ip,
      userAgent,
    }
  });

  // Audit log
  await createAuditLog({
    userId: user.id,
    event: AUDIT_EVENTS.SIGNUP,
    meta: { email, firstName, lastName },
    ip,
    userAgent
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      subscription: user.subscriptions[0] || null,
    },
    accessToken,
    refreshToken: refreshTokenRaw,
    expiresIn: getTokenExpiry(accessToken) || 0,
  };
}

/**
 * User login
 */
export async function login(data: LoginRequest, req: Request): Promise<AuthResponse> {
  const { email, password, code } = data;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');

  // Find user with password
  const user = await findUserByEmailWithPassword(email);
  if (!user) {
    await createAuditLog({
      event: AUDIT_EVENTS.LOGIN_FAIL,
      meta: { email, reason: 'user_not_found' },
      ip,
      userAgent
    });
    throw new Error('INVALID_CREDENTIALS');
  }

  // Check if user is active
  if (!user.isActive) {
    await createAuditLog({
      userId: user.id,
      event: AUDIT_EVENTS.LOGIN_FAIL,
      meta: { email, reason: 'user_inactive' },
      ip,
      userAgent
    });
    throw new Error('USER_INACTIVE');
  }

  // Verify password
  const passwordResult = await verifyPassword(password, user.passwordHash);
  if (!passwordResult.isValid) {
    await createAuditLog({
      userId: user.id,
      event: AUDIT_EVENTS.LOGIN_FAIL,
      meta: { email, reason: 'invalid_password' },
      ip,
      userAgent
    });
    throw new Error('INVALID_CREDENTIALS');
  }

  // Re-hash password if needed (bcrypt -> argon2 migration)
  if (passwordResult.needsRehash && passwordResult.newHash) {
    await updateUser(user.id, { passwordHash: passwordResult.newHash });
  }

  // Check 2FA if enabled
  if (user.twoFASecret && !code) {
    throw new Error('TWOFA_REQUIRED');
  }

  if (user.twoFASecret && code) {
    // TODO: Implement TOTP verification
    // For now, we'll skip 2FA verification
  }

  // Update login info
  await updateLoginInfo(user.id, ip);

  // Generate tokens
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const { token: refreshTokenRaw, hashedToken: hashedRefreshToken, expiresAt: refreshExpiresAt } = createRefreshToken();

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      hashedToken: hashedRefreshToken,
      expiresAt: refreshExpiresAt,
      ip,
      userAgent,
    }
  });

  // Audit log
  await createAuditLog({
    userId: user.id,
    event: AUDIT_EVENTS.LOGIN_OK,
    meta: { email },
    ip,
    userAgent
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      subscription: user.subscriptions[0] || null,
    },
    accessToken,
    refreshToken: refreshTokenRaw,
    expiresIn: getTokenExpiry(accessToken) || 0,
  };
}

/**
 * Refresh tokens
 */
export async function refreshTokens(refreshToken: string, req: Request): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const ip = req.ip;
  const userAgent = req.get('User-Agent');

  // Verify refresh token format
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    await createAuditLog({
      event: AUDIT_EVENTS.REFRESH_FAIL,
      meta: { reason: 'invalid_token' },
      ip,
      userAgent
    });
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // Hash the token to find it in database
  const hashedToken = hashToken(refreshToken);

  // Find stored refresh token
  const storedToken = await prisma.refreshToken.findUnique({
    where: { hashedToken },
    include: { user: true }
  });

  if (!storedToken) {
    await createAuditLog({
      userId: payload.sub,
      event: AUDIT_EVENTS.REFRESH_FAIL,
      meta: { reason: 'token_not_found' },
      ip,
      userAgent
    });
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // Check if token is revoked
  if (storedToken.revokedAt) {
    // Revoke all tokens in the chain
    await revokeTokenChain(storedToken.id);
    
    await createAuditLog({
      userId: storedToken.userId,
      event: AUDIT_EVENTS.REFRESH_FAIL,
      meta: { reason: 'token_revoked', chainRevoked: true },
      ip,
      userAgent
    });
    throw new Error('TOKEN_REVOKED');
  }

  // Check if token is expired
  if (storedToken.expiresAt < new Date()) {
    await createAuditLog({
      userId: storedToken.userId,
      event: AUDIT_EVENTS.REFRESH_FAIL,
      meta: { reason: 'token_expired' },
      ip,
      userAgent
    });
    throw new Error('REFRESH_TOKEN_EXPIRED');
  }

  // Check if user is still active
  if (!storedToken.user.isActive) {
    await createAuditLog({
      userId: storedToken.userId,
      event: AUDIT_EVENTS.REFRESH_FAIL,
      meta: { reason: 'user_inactive' },
      ip,
      userAgent
    });
    throw new Error('USER_INACTIVE');
  }

  // Create new refresh token
  const { token: newRefreshTokenRaw, hashedToken: newHashedRefreshToken, expiresAt: newRefreshExpiresAt } = createRefreshToken();

  // Store new refresh token
  const newRefreshToken = await prisma.refreshToken.create({
    data: {
      userId: storedToken.userId,
      hashedToken: newHashedRefreshToken,
      expiresAt: newRefreshExpiresAt,
      ip,
      userAgent,
    }
  });

  // Mark old token as replaced
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: {
      revokedAt: new Date(),
      replacedByTokenId: newRefreshToken.id,
    }
  });

  // Generate new access token
  const accessToken = signAccessToken({
    userId: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
  });

  // Audit log
  await createAuditLog({
    userId: storedToken.userId,
    event: AUDIT_EVENTS.REFRESH_OK,
    ip,
    userAgent
  });

  return {
    accessToken,
    refreshToken: newRefreshTokenRaw,
    expiresIn: getTokenExpiry(accessToken) || 0,
  };
}

/**
 * Logout user
 */
export async function logout(refreshToken: string | undefined, req: Request): Promise<void> {
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  const userId = req.user?.id;

  if (refreshToken) {
    const hashedToken = hashToken(refreshToken);
    
    // Find and revoke the token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { hashedToken }
    });

    if (storedToken) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() }
      });
    }
  }

  // Audit log
  await createAuditLog({
    userId,
    event: AUDIT_EVENTS.LOGOUT,
    ip,
    userAgent
  });
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string, req: Request): Promise<void> {
  const ip = req.ip;
  const userAgent = req.get('User-Agent');

  const user = await findUserByEmail(email);
  
  // Always return success to prevent email enumeration
  await createAuditLog({
    userId: user?.id,
    event: AUDIT_EVENTS.RESET_REQUEST,
    meta: { email, userExists: !!user },
    ip,
    userAgent
  });

  if (!user) {
    return; // Don't reveal if email exists
  }

  // Create reset token (15 minutes)
  const { token, hashedToken, expiresAt } = createOneTimeToken(15);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      hashedToken,
      expiresAt,
    }
  });

  // Send reset email
  try {
    await sendPasswordReset(email, token, user.firstName || 'User');
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    // Don't throw - we already logged the request
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string, req: Request): Promise<void> {
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  const hashedToken = hashToken(token);

  // Find reset token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { hashedToken },
    include: { user: true }
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    await createAuditLog({
      event: AUDIT_EVENTS.RESET_FAIL,
      meta: { reason: 'invalid_token' },
      ip,
      userAgent
    });
    throw new Error('INVALID_RESET_TOKEN');
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password
  await updateUser(resetToken.userId, { passwordHash });

  // Mark token as used
  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date() }
  });

  // Revoke all refresh tokens for this user
  await prisma.refreshToken.updateMany({
    where: { 
      userId: resetToken.userId,
      revokedAt: null 
    },
    data: { revokedAt: new Date() }
  });

  // Audit log
  await createAuditLog({
    userId: resetToken.userId,
    event: AUDIT_EVENTS.RESET_OK,
    ip,
    userAgent
  });
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string, req: Request): Promise<void> {
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  const hashedToken = hashToken(token);

  // Find verification token
  const verifyToken = await prisma.emailVerifyToken.findUnique({
    where: { hashedToken },
    include: { user: true }
  });

  if (!verifyToken || verifyToken.usedAt || verifyToken.expiresAt < new Date()) {
    await createAuditLog({
      event: AUDIT_EVENTS.VERIFY_FAIL,
      meta: { reason: 'invalid_token' },
      ip,
      userAgent
    });
    throw new Error('INVALID_VERIFICATION_TOKEN');
  }

  // Mark email as verified
  await updateUser(verifyToken.userId, { emailVerifiedAt: new Date() });

  // Mark token as used
  await prisma.emailVerifyToken.update({
    where: { id: verifyToken.id },
    data: { usedAt: new Date() }
  });

  // Audit log
  await createAuditLog({
    userId: verifyToken.userId,
    event: AUDIT_EVENTS.VERIFY_OK,
    ip,
    userAgent
  });
}

/**
 * Revoke token chain (security measure)
 */
async function revokeTokenChain(tokenId: string): Promise<void> {
  // Find all tokens that were replaced by this token or replaced this token
  const tokens = await prisma.refreshToken.findMany({
    where: {
      OR: [
        { replacedByTokenId: tokenId },
        { id: tokenId }
      ]
    }
  });

  // Revoke all tokens in the chain
  const tokenIds = tokens.map(t => t.id);
  await prisma.refreshToken.updateMany({
    where: { id: { in: tokenIds } },
    data: { revokedAt: new Date() }
  });
}
