const express = require('express');
const { createLogger } = require('../utils/logger');
// Import Prisma client - fallback if TypeScript file doesn't exist
let prisma;
try {
  prisma = require('../lib/prisma').default;
} catch (error) {
  // Fallback: create Prisma client directly
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
}

const logger = createLogger('routes');

// Import route modules
const authRoutes = require('./auth.routes');
const generatorRoutes = require('./generator.routes');
const aiRoutes = require('./ai.routes');
const usageRoutes = require('./usage.routes');
const adminRoutes = require('./admin.routes');
const uploadRoutes = require('./upload.routes');
const analyticsRoutes = require('./analytics.routes');
const seoRoutes = require('./seo.routes');
const exportRoutes = require('./export.routes');

// Create main router
const router = express.Router();

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        database: 'healthy', // TODO: Check actual database status
        openai: 'healthy' // TODO: Check OpenAI API status
      }
    }
  });
});

// Database health check
router.get('/db/health', async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    logger.info('Database health check successful', { result });
    
    res.json({
      success: true,
      data: {
        status: 'ok',
        database: 'postgresql',
        connection: 'healthy',
        timestamp: new Date().toISOString(),
        test_query: result
      }
    });
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_CONNECTION_FAILED',
        message: 'Database health check failed',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// API version info
router.get('/version', (req, res) => {
  res.json({
    success: true,
    data: {
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/generate', generatorRoutes);
router.use('/ai', aiRoutes);
router.use('/usage', usageRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/seo', seoRoutes);
router.use('/export', exportRoutes);

// Catch-all handler for undefined routes
router.all('*', (req, res) => {
  logger.warn('API endpoint not found', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `API endpoint ${req.method} ${req.path} not found`,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      suggestion: 'Please check the API documentation for available endpoints'
    }
  });
});

module.exports = router;