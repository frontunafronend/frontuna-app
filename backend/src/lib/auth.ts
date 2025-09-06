import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { User } from '@prisma/client'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
  private static readonly JWT_EXPIRES_IN = '15m'
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '30d'

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
    return bcrypt.hash(password, saltRounds)
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN })
  }

  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN })
  }

  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, this.JWT_SECRET) as JWTPayload
  }

  static async createUser(data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    role?: string
  }): Promise<User> {
    const hashedPassword = await this.hashPassword(data.password)
    
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'user'
      }
    })
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
  }

  static async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    })
  }

  static async updateLastLogin(userId: string, ip?: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        lastLoginIP: ip
      }
    })
  }

  static async logAuditEvent(data: {
    userId?: string
    event: string
    meta?: any
    ip?: string
    userAgent?: string
  }): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        event: data.event,
        meta: data.meta,
        ip: data.ip,
        userAgent: data.userAgent
      }
    })
  }

  static async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }
}
