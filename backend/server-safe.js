const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Constants
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🚀 Starting Frontuna Backend Server...');
console.log('📦 Environment:', NODE_ENV);
console.log('🔌 Port:', PORT);

// Basic middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

app.use(morgan('combined'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'https://frontuna.com',
    'https://www.frontuna.com',
    'https://frontuna.ai',
    'https://www.frontuna.ai',
    'https://frontuna-app.vercel.app',
    'https://frontuna-frontend.vercel.app'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

console.log('🔒 CORS Origins:', corsOptions.origin);

// Apply CORS
app.use(cors(corsOptions));

// Basic health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Safe backend server is running!',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    cors: 'configured'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy!',
    timestamp: new Date().toISOString()
  });
});

// Try to load routes safely
try {
  console.log('📋 Loading routes...');
  
  // Basic auth routes (simplified)
  app.post('/api/auth/signup', (req, res) => {
    console.log('📝 Signup request received');
    
    // Create demo user
    const user = {
      id: 'demo-user-' + Date.now(),
      email: req.body.email || 'demo@example.com',
      firstName: req.body.firstName || 'Demo',
      lastName: req.body.lastName || 'User',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    // Create properly formatted JWT token
    const demoPayload = {
      sub: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year from now
    };

    // Simple JWT format (header.payload.signature) - using base64 encoding
    const header = Buffer.from(JSON.stringify({alg: 'HS256', typ: 'JWT'})).toString('base64');
    const payload = Buffer.from(JSON.stringify(demoPayload)).toString('base64');
    const signature = 'demo-signature-' + Date.now();
    const demoJWT = `${header}.${payload}.${signature}`;

    res.status(201).json({
      success: true,
      data: {
        user,
        accessToken: demoJWT,
        refreshToken: 'demo-refresh-' + Date.now(),
        expiresIn: demoPayload.exp,
        message: 'Account created successfully!'
      }
    });
  });

  app.post('/api/auth/login', (req, res) => {
    console.log('🔐 Login request received');
    
    // Create demo user
    const user = {
      id: 'demo-user-login-' + Date.now(),
      email: req.body.email || 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    // Create properly formatted JWT token
    const demoPayload = {
      sub: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year from now
    };

    const header = Buffer.from(JSON.stringify({alg: 'HS256', typ: 'JWT'})).toString('base64');
    const payload = Buffer.from(JSON.stringify(demoPayload)).toString('base64');
    const signature = 'demo-signature-' + Date.now();
    const demoJWT = `${header}.${payload}.${signature}`;

    res.json({
      success: true,
      data: {
        user,
        accessToken: demoJWT,
        refreshToken: 'demo-refresh-' + Date.now(),
        expiresIn: demoPayload.exp,
        message: 'Login successful!'
      }
    });
  });

  // Settings API endpoints (mock for now)
  app.get('/api/users/preferences', (req, res) => {
    res.json({
      success: true,
      data: {
        darkMode: false,
        compactMode: false,
        defaultFramework: 'react',
        autoSave: true,
        typescript: true
      }
    });
  });

  app.put('/api/users/preferences', (req, res) => {
    console.log('⚙️ Updating preferences:', req.body);
    res.json({
      success: true,
      message: 'Preferences updated successfully'
    });
  });

  app.get('/api/users/notifications', (req, res) => {
    res.json({
      success: true,
      data: {
        generationComplete: true,
        weeklySummary: true,
        planUpdates: true,
        browserNotifications: false,
        emailNotifications: true
      }
    });
  });

  app.put('/api/users/notifications', (req, res) => {
    console.log('🔔 Updating notification settings:', req.body);
    res.json({
      success: true,
      message: 'Notification settings updated successfully'
    });
  });

  app.get('/api/users/api-keys', (req, res) => {
    res.json({
      success: true,
      data: [
        {
          id: 'key_demo_123',
          name: 'Demo API Key',
          created: new Date().toISOString(),
          lastUsed: null
        }
      ]
    });
  });

  app.put('/api/auth/profile', (req, res) => {
    console.log('👤 Updating profile:', req.body);
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  });

  console.log('✅ Routes loaded successfully');

} catch (error) {
  console.error('❌ Error loading routes:', error);
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Global error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong!'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`
    }
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('🎉 Safe Backend Server is running!');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
