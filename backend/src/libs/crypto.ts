/**
 * 🔐 SECURE CRYPTOGRAPHY LIBRARY
 * Provides Argon2id hashing with bcrypt fallback for backward compatibility
 * Includes timing-safe comparison and secure random token generation
 */

import * as argon2 from 'argon2';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { env } from '../config/env';

// Argon2 configuration
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 MB
  timeCost: 3,         // 3 iterations
  parallelism: 1,      // 1 thread
};

/**
 * Hash password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password, ARGON2_OPTIONS);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Verify password with backward compatibility
 * - If hash looks like bcrypt ($2a$, $2b$, $2y$), verify with bcrypt
 * - If verification succeeds, re-hash with Argon2 and return both result and new hash
 * - Otherwise verify with Argon2
 */
export async function verifyPassword(
  password: string, 
  hash: string
): Promise<{ isValid: boolean; needsRehash?: boolean; newHash?: string }> {
  try {
    // Check if it's a bcrypt hash
    if (isBcryptHash(hash)) {
      const isValid = await bcrypt.compare(password, hash);
      
      if (isValid) {
        // Re-hash with Argon2 for security upgrade
        const newHash = await hashPassword(password);
        return { isValid: true, needsRehash: true, newHash };
      }
      
      return { isValid: false };
    }
    
    // Verify with Argon2
    const isValid = await argon2.verify(hash, password);
    return { isValid };
    
  } catch (error) {
    // Log error but don't expose details
    console.error('Password verification error:', error.message);
    return { isValid: false };
  }
}

/**
 * Check if hash is bcrypt format
 */
function isBcryptHash(hash: string): boolean {
  return /^\$2[aby]\$/.test(hash);
}

/**
 * Generate cryptographically secure random token
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Hash token for database storage
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Timing-safe string comparison
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  
  return crypto.timingSafeEqual(bufferA, bufferB);
}

/**
 * Generate secure random string for various purposes
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    result += chars[randomIndex];
  }
  
  return result;
}

/**
 * Create refresh token with metadata
 */
export function createRefreshToken(): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = generateSecureToken(48); // 96 hex characters
  const hashedToken = hashToken(token);
  
  // Parse refresh token expiry (e.g., "45d" -> 45 days)
  const expiryMatch = env.JWT_REFRESH_EXPIRES_IN.match(/^(\d+)([dhms])$/);
  if (!expiryMatch) {
    throw new Error('Invalid JWT_REFRESH_EXPIRES_IN format');
  }
  
  const [, amount, unit] = expiryMatch;
  const multipliers = { d: 24 * 60 * 60 * 1000, h: 60 * 60 * 1000, m: 60 * 1000, s: 1000 };
  const expiresAt = new Date(Date.now() + parseInt(amount) * multipliers[unit]);
  
  return { token, hashedToken, expiresAt };
}

/**
 * Create one-time token for email verification/password reset
 */
export function createOneTimeToken(expiryMinutes: number = 15): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = generateSecureToken(32); // 64 hex characters
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  
  return { token, hashedToken, expiresAt };
}
