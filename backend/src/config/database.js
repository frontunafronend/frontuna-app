const { createLogger } = require('../utils/logger');

const logger = createLogger('database');

/**
 * Connect to database (PostgreSQL via Prisma)
 */
async function connectDatabase() {
  try {
    // Import Prisma client
    const prisma = require('../lib/prisma').default;
    
    // Test the connection
    await prisma.$connect();
    
    logger.info('Database connected successfully via Prisma');

    // Handle application shutdown
    process.on('SIGINT', async () => {
      await prisma.$disconnect();
      logger.info('Database connection closed due to application termination');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await prisma.$disconnect();
      logger.info('Database connection closed due to application termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

/**
 * Disconnect from database
 */
async function disconnectDatabase() {
  try {
    const prisma = require('../lib/prisma').default;
    await prisma.$disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
}

/**
 * Get database connection status
 */
function getDatabaseStatus() {
  try {
    const prisma = require('../lib/prisma').default;
    return {
      status: 'connected',
      type: 'postgresql',
      provider: 'prisma'
    };
  } catch (error) {
    return {
      status: 'disconnected',
      type: 'postgresql',
      provider: 'prisma',
      error: error.message
    };
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus
};