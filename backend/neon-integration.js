/**
 * 🌐 NEON DATABASE INTEGRATION
 * Professional Neon database connection for Frontuna
 */

const { PrismaClient } = require('@prisma/client');

class NeonDatabaseService {
  constructor() {
    this.prisma = null;
    this.isConnected = false;
  }

  /**
   * Initialize Neon database connection
   */
  async initialize(databaseUrl) {
    try {
      console.log('🌐 Connecting to Neon database...');
      
      this.prisma = new PrismaClient({
        datasources: {
          db: { url: databaseUrl }
        },
        log: ['error']
      });

      await this.prisma.$connect();
      
      // Test connection
      const result = await this.prisma.$queryRaw`SELECT NOW() as current_time`;
      console.log('✅ Neon database connected successfully!', result[0]);
      
      this.isConnected = true;
      return this.prisma;
      
    } catch (error) {
      console.error('❌ Failed to connect to Neon database:', error.message);
      throw error;
    }
  }

  /**
   * Get database client
   */
  getClient() {
    if (!this.isConnected || !this.prisma) {
      throw new Error('Database not connected. Call initialize() first.');
    }
    return this.prisma;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.prisma) return false;
      
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error.message);
      return false;
    }
  }

  /**
   * Disconnect
   */
  async disconnect() {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.isConnected = false;
      console.log('🔌 Disconnected from Neon database');
    }
  }
}

module.exports = { NeonDatabaseService };
