/**
 * 👤 USER REPOSITORY
 * Database operations for user management
 */

import { prisma } from '../../lib/prisma';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  passwordHash?: string;
  twoFASecret?: string;
  isActive?: boolean;
}

/**
 * Find user by email (case-insensitive)
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      subscriptions: {
        where: { status: 'active' },
        orderBy: { startsAt: 'desc' },
        take: 1
      }
    }
  });
}

/**
 * Find user by ID
 */
export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      subscriptions: {
        where: { status: 'active' },
        orderBy: { startsAt: 'desc' },
        take: 1
      }
    }
  });
}

/**
 * Find user by email with password (for authentication)
 */
export async function findUserByEmailWithPassword(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      role: true,
      isActive: true,
      emailVerifiedAt: true,
      twoFASecret: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      subscriptions: {
        where: { status: 'active' },
        orderBy: { startsAt: 'desc' },
        take: 1
      }
    }
  });
}

/**
 * Create new user
 */
export async function createUser(data: CreateUserData) {
  return prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'user',
    },
    include: {
      subscriptions: {
        where: { status: 'active' },
        orderBy: { startsAt: 'desc' },
        take: 1
      }
    }
  });
}

/**
 * Update user
 */
export async function updateUser(id: string, data: UpdateUserData) {
  return prisma.user.update({
    where: { id },
    data,
    include: {
      subscriptions: {
        where: { status: 'active' },
        orderBy: { startsAt: 'desc' },
        take: 1
      }
    }
  });
}

/**
 * Delete user (soft delete)
 */
export async function deleteUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: {
      isActive: false,
      // Note: We could add a deletedAt field in the future
    }
  });
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true }
  });
  return !!user;
}

/**
 * Update login info
 */
export async function updateLoginInfo(id: string, ip?: string) {
  return prisma.user.update({
    where: { id },
    data: {
      lastLoginAt: new Date(),
      lastLoginIP: ip,
    }
  });
}

/**
 * Get user profile (safe fields only)
 */
export async function getUserProfile(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      emailVerifiedAt: true,
      createdAt: true,
      lastLoginAt: true,
      subscriptions: {
        where: { status: 'active' },
        orderBy: { startsAt: 'desc' },
        take: 1,
        select: {
          plan: true,
          status: true,
          startsAt: true,
          renewsAt: true,
        }
      }
    }
  });
}
