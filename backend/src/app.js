const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');

// Import middleware
const { errorMiddleware } = require('./middleware/error.middleware');
const { createLogger } = require('./utils/logger');

// Import routes
const routes = require('./routes');

// Create Express app
const app = express();

// Create logger instance
const logger = createLogger('app');

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com"]
    }
  }
}));

// CORS configuration with enhanced debugging and multiple fallbacks
const corsOptions = {
  origin: function (origin, callback) {
    // Enhanced allowed origins with multiple fallbacks
    const allowedOrigins = [
      // Environment variable (priority)
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      // Development
      'http://localhost:4200',
      'http://127.0.0.1:4200',
      // Production domains
      'https://frontuna.com',
      'https://www.frontuna.com',
      'https://frontuna.ai',
      'https://www.frontuna.ai',
      // Vercel domains (common patterns)
      'https://frontuna-app.vercel.app',
      'https://frontuna-frontend.vercel.app'
    ].filter(Boolean); // Remove undefined values
    
    // Log for debugging (only in development or if debug is enabled)
    if (process.env.NODE_ENV !== 'production' || process.env.CORS_DEBUG === 'true') {
      logger.info('🔍 CORS Debug:', {
        requestOrigin: origin,
        allowedOrigins,
        frontendUrl: process.env.FRONTEND_URL,
        corsOrigin: process.env.CORS_ORIGIN,
        nodeEnv: process.env.NODE_ENV
      });
    }
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      logger.info('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      logger.info(`✅ CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      logger.warn(`❌ CORS: Rejecting origin: ${origin}`, { allowedOrigins });
      callback(new Error(`CORS policy violation: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  // Handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware with debugging option
if (process.env.CORS_DEBUG === 'permissive') {
  // TEMPORARY: Ultra-permissive CORS for debugging
  logger.warn('🚨 WARNING: Using permissive CORS policy for debugging!');
  app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));
} else {
  // Use the secure CORS configuration
  app.use(cors(corsOptions));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(mongoSanitize()); // Against NoSQL injection
app.use(xss()); // Against XSS attacks
app.use(hpp()); // Against HTTP Parameter Pollution

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Health check endpoint with CORS debugging
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      cors: {
        frontendUrl: process.env.FRONTEND_URL,
        corsOrigin: process.env.CORS_ORIGIN,
        requestOrigin: req.headers.origin,
        allowedOrigins: [
          process.env.FRONTEND_URL,
          process.env.CORS_ORIGIN,
          'http://localhost:4200',
          'https://frontuna.com',
          'https://www.frontuna.com',
          'https://frontuna.ai',
          'https://www.frontuna.ai',
          'https://frontuna-app.vercel.app',
          'https://frontuna-frontend.vercel.app'
        ].filter(Boolean)
      },
      services: [
        {
          name: 'database',
          status: 'healthy', // TODO: Check actual database connection
          responseTime: 0
        },
        {
          name: 'openai',
          status: 'healthy', // TODO: Check OpenAI API
          responseTime: 0
        }
      ]
    }
  });
});

// CORS debugging endpoint
app.get('/cors-debug', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      requestOrigin: req.headers.origin,
      requestHeaders: req.headers,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        FRONTEND_URL: process.env.FRONTEND_URL,
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        CORS_DEBUG: process.env.CORS_DEBUG
      },
      allowedOrigins: [
        process.env.FRONTEND_URL,
        process.env.CORS_ORIGIN,
        'http://localhost:4200',
        'https://frontuna.com',
        'https://www.frontuna.com',
        'https://frontuna.ai',
        'https://www.frontuna.ai',
        'https://frontuna-app.vercel.app',
        'https://frontuna-frontend.vercel.app'
      ].filter(Boolean),
      corsConfig: {
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
      }
    }
  });
});

// API routes
app.use('/api', routes);

// Serve static files (uploaded files, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Handle 404 for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `API endpoint ${req.method} ${req.path} not found`,
      path: req.path,
      timestamp: new Date().toISOString()
    }
  });
});

// Global error handling middleware (must be last)
app.use(errorMiddleware);

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;