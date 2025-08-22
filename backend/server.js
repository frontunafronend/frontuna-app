/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:38:46.922Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - GENERIC_ERROR_MESSAGE: MEDIUM
 */


// 🛡️ DATABASE GUARD: This code interacts with the database
// CRITICAL RULES:
// 1. ALWAYS wrap database queries in try-catch blocks
// 2. ALWAYS provide fallback responses for demo mode
// 3. NEVER expose raw database errors to frontend
// 4. ALWAYS validate user input before database operations
/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:32:02.148Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - GENERIC_ERROR_MESSAGE: MEDIUM
 */


// 🛡️ DATABASE GUARD: This code interacts with the database
// CRITICAL RULES:
// 1. ALWAYS wrap database queries in try-catch blocks
// 2. ALWAYS provide fallback responses for demo mode
// 3. NEVER expose raw database errors to frontend
// 4. ALWAYS validate user input before database operations
/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:30:47.955Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - GENERIC_ERROR_MESSAGE: MEDIUM
 */


// 🛡️ DATABASE GUARD: This code interacts with the database
// CRITICAL RULES:
// 1. ALWAYS wrap database queries in try-catch blocks
// 2. ALWAYS provide fallback responses for demo mode
// 3. NEVER expose raw database errors to frontend
// 4. ALWAYS validate user input before database operations
/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:22:45.981Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - GENERIC_ERROR_MESSAGE: MEDIUM
 */


// 🛡️ DATABASE GUARD: This code interacts with the database
// CRITICAL RULES:
// 1. ALWAYS wrap database queries in try-catch blocks
// 2. ALWAYS provide fallback responses for demo mode
// 3. NEVER expose raw database errors to frontend
// 4. ALWAYS validate user input before database operations
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Import app configuration
const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');
const { createLogger } = require('./src/utils/logger');
const logger = createLogger('server');
const { initializeWebSocket } = require('./src/websocket');
const cronJobs = require('./cron');

// Constants
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize WebSocket handlers
initializeWebSocket(io);

// Global error handlers
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (err, promise) => {
  logger.error('UNHANDLED REJECTION! ⚠️ Details:', {
    error: err.message,
    stack: err.stack,
    promise: promise
  });
  // Don't shut down the server - just log and continue
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});

// Start server immediately, then try database connection
function startServer() {
  try {
    // Start server first
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      
      // Connect to database after server is running
      connectToDatabase();
    });

    // Handle server startup errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        logger.error('❌ Server error:', err);
      }
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Connect to database asynchronously (non-blocking)
async function connectToDatabase() {
  try {
    await connectDatabase();
    logger.info('✅ Database connected successfully');
    
    // Start cron jobs after database connection
    if (NODE_ENV === 'production') {
      cronJobs.start();
      logger.info('✅ Cron jobs started');
    }
  } catch (dbError) {
    logger.warn('⚠️ Database connection failed, server running without database:', dbError.message);
    logger.info('📝 Server will run in demo mode without persistent data');
  }
}

// Start the server
startServer();

module.exports = { server, io };