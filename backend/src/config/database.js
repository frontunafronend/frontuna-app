const mongoose = require('mongoose');
const { createLogger } = require('../utils/logger');

const logger = createLogger('database');

// MongoDB connection options
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 2000, // Keep trying to send operations for 2 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

/**
 * Connect to MongoDB database
 */
async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/frontuna-ai';
    
    logger.info('Connecting to MongoDB...', { uri: mongoUri.replace(/:[^:@]*@/, ':***@') });
    
    // Set shorter timeout for faster failure
    const connectionOptions = {
      ...options,
      serverSelectionTimeoutMS: 2000, // 2 seconds timeout
      connectTimeoutMS: 2000
    };
    
    await mongoose.connect(mongoUri, connectionOptions);
    
    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name
    });

    // Connection event handlers
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Handle application shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to application termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDatabase() {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    throw error;
  }
}

/**
 * Get database connection status
 */
function getDatabaseStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    status: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    database: mongoose.connection.name,
    collections: Object.keys(mongoose.connection.collections).length
  };
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus,
  mongoose
};