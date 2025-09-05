/**
 * 📊 AUDIT LOG REPOSITORY
 * Handles audit log creation and querying
 */

import { prisma } from '../../lib/prisma';

export interface AuditLogData {
  userId?: string;
  event: string;
  meta?: any;
  ip?: string;
  userAgent?: string;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        event: data.event,
        meta: data.meta || null,
        ip: data.ip || null,
        userAgent: data.userAgent || null,
      }
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging shouldn't break the main flow
  }
}

/**
 * Get audit logs for user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    select: {
      id: true,
      event: true,
      meta: true,
      ip: true,
      userAgent: true,
      createdAt: true,
    }
  });
}

/**
 * Get security events (failed logins, etc.)
 */
export async function getSecurityEvents(
  limit: number = 100,
  offset: number = 0
) {
  const securityEvents = [
    'LOGIN_FAIL',
    'REFRESH_FAIL',
    'INVALID_TOKEN',
    'BRUTE_FORCE_DETECTED',
    'SUSPICIOUS_ACTIVITY'
  ];

  return prisma.auditLog.findMany({
    where: {
      event: { in: securityEvents }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        }
      }
    }
  });
}

/**
 * Audit event constants
 */
export const AUDIT_EVENTS = {
  // Authentication
  SIGNUP: 'SIGNUP',
  LOGIN_OK: 'LOGIN_OK',
  LOGIN_FAIL: 'LOGIN_FAIL',
  REFRESH_OK: 'REFRESH_OK',
  REFRESH_FAIL: 'REFRESH_FAIL',
  LOGOUT: 'LOGOUT',
  
  // Email verification
  VERIFY_REQUEST: 'VERIFY_REQUEST',
  VERIFY_OK: 'VERIFY_OK',
  VERIFY_FAIL: 'VERIFY_FAIL',
  
  // Password reset
  RESET_REQUEST: 'RESET_REQUEST',
  RESET_OK: 'RESET_OK',
  RESET_FAIL: 'RESET_FAIL',
  
  // 2FA
  TWOFA_ENABLE: 'TWOFA_ENABLE',
  TWOFA_DISABLE: 'TWOFA_DISABLE',
  TWOFA_VERIFY_OK: 'TWOFA_VERIFY_OK',
  TWOFA_VERIFY_FAIL: 'TWOFA_VERIFY_FAIL',
  
  // Security
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  BRUTE_FORCE_DETECTED: 'BRUTE_FORCE_DETECTED',
  
  // Profile
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  ACCOUNT_DELETE: 'ACCOUNT_DELETE',
} as const;
