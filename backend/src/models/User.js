const { prisma } = require('../lib/prisma');
const bcrypt = require('bcryptjs');

/**
 * User service using Prisma
 */
class UserService {
  /**
   * Find user by email
   */
  static async findOne(query) {
    if (query.email) {
      return await prisma.user.findUnique({
        where: { email: query.email },
        include: {
          subscriptions: {
            where: { status: 'active' },
            orderBy: { startsAt: 'desc' },
            take: 1
          }
        }
      });
    }
    return null;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    return await prisma.user.findUnique({
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
   * Create new user
   */
  static async create(userData) {
    const { email, password, role = 'user' } = userData;
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    return await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role
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
  static async findByIdAndUpdate(id, updateData, options = {}) {
    const { password, ...otherData } = updateData;
    
    let dataToUpdate = { ...otherData };
    
    // Hash password if provided
    if (password) {
      const saltRounds = 12;
      dataToUpdate.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    return await prisma.user.update({
      where: { id },
      data: dataToUpdate,
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
   * Delete user
   */
  static async findByIdAndDelete(id) {
    return await prisma.user.delete({
      where: { id }
    });
  }

  /**
   * Compare password
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Find user with password (for authentication)
   */
  static async findOneWithPassword(query) {
    if (query.email) {
      return await prisma.user.findUnique({
        where: { email: query.email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
          createdAt: true,
          subscriptions: {
            where: { status: 'active' },
            orderBy: { startsAt: 'desc' },
            take: 1
          }
        }
      });
    }
    return null;
  }

  /**
   * Update last login
   */
  static async updateLastLogin(id, loginData) {
    // Note: lastLoginAt and lastLoginIP are not in the Prisma schema
    // You may need to add them or handle differently
    return await prisma.user.update({
      where: { id },
      data: {
        // Add these fields to your Prisma schema if needed
        // lastLoginAt: new Date(),
        // lastLoginIP: loginData.ip
      }
    });
  }
}

// Export as if it were a Mongoose model for compatibility
module.exports = UserService;