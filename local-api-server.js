// 🚀 LOCAL API SERVER - Backup solution for testing
// Run this with: node local-api-server.js
// Then update your frontend to use: http://localhost:3001

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001; // Different port to avoid conflicts

console.log('🚀 Starting Local API Server...');

// CORS - Allow all origins for local testing
app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://localhost:4201', 
    'http://localhost:8080',
    'https://frontuna.com',
    'https://www.frontuna.com',
    'https://frontuna-frontend-app.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`   Origin: ${req.headers.origin || 'None'}`);
  console.log(`   User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'None'}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('📋 Root endpoint accessed');
  res.json({
    status: 'ok',
    message: '🎉 Local Frontuna API is running perfectly!',
    timestamp: new Date().toISOString(),
    server: 'Local Development Server',
    endpoints: [
      'GET /health - Health check',
      'POST /api/auth/login - Mock login',
      'POST /api/auth/signup - Mock signup',
      'GET /api/auth/profile - Mock profile (requires token)',
      'GET /api/admin/users - Mock admin endpoint',
      'GET /api/admin/stats - Mock admin stats'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  console.log('❤️ Health check requested');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: '✅ Local API is healthy and ready!',
    uptime: process.uptime(),
    environment: 'local-development'
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login requested:', req.body);
  
  // Mock successful login
  res.json({
    success: true,
    data: {
      accessToken: 'local-access-token-' + Date.now(),
      refreshToken: 'local-refresh-token-' + Date.now(),
      expiresIn: 900,
      user: {
        id: '1',
        email: req.body.email || 'admin@frontuna.com',
        role: 'admin',
        firstName: 'Local',
        lastName: 'Admin',
        isActive: true,
        emailVerifiedAt: new Date().toISOString()
      }
    },
    message: '✅ Login successful (Local API)'
  });
});

app.post('/api/auth/signup', (req, res) => {
  console.log('📝 Signup requested:', req.body);
  
  res.json({
    success: true,
    data: {
      accessToken: 'local-access-token-' + Date.now(),
      refreshToken: 'local-refresh-token-' + Date.now(),
      expiresIn: 900,
      user: {
        id: '2',
        email: req.body.email || 'user@example.com',
        role: 'user',
        firstName: req.body.firstName || 'New',
        lastName: req.body.lastName || 'User',
        isActive: true,
        emailVerifiedAt: new Date().toISOString()
      }
    },
    message: '✅ Signup successful (Local API)'
  });
});

// Mock protected route
app.get('/api/auth/profile', (req, res) => {
  console.log('👤 Profile requested');
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'No valid token provided'
      }
    });
  }
  
  res.json({
    success: true,
    data: {
      user: {
        id: '1',
        email: 'admin@frontuna.com',
        role: 'admin',
        firstName: 'Local',
        lastName: 'Admin',
        isActive: true,
        emailVerifiedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      }
    },
    message: '✅ Profile retrieved (Local API)'
  });
});

// Mock admin endpoints
app.get('/api/admin/users', (req, res) => {
  console.log('👥 Admin users requested');
  res.json({
    success: true,
    data: {
      users: [
        { id: '1', email: 'admin@frontuna.com', role: 'admin', isActive: true },
        { id: '2', email: 'user@frontuna.com', role: 'user', isActive: true }
      ],
      total: 2
    },
    message: '✅ Users retrieved (Local API)'
  });
});

app.get('/api/admin/stats', (req, res) => {
  console.log('📊 Admin stats requested');
  res.json({
    success: true,
    data: {
      totalUsers: 2,
      activeUsers: 2,
      totalComponents: 15,
      totalUsage: 150
    },
    message: '✅ Stats retrieved (Local API)'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      availableEndpoints: [
        'GET /',
        'GET /health',
        'POST /api/auth/login',
        'POST /api/auth/signup',
        'GET /api/auth/profile',
        'GET /api/admin/users',
        'GET /api/admin/stats'
      ]
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🎉 ================================');
  console.log('🚀 LOCAL API SERVER IS RUNNING!');
  console.log('🎉 ================================');
  console.log('');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`❤️ Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log('');
  console.log('🔧 To use this API:');
  console.log('   1. Keep this server running');
  console.log('   2. Update your frontend environment to use:');
  console.log(`      apiUrl: 'http://localhost:${PORT}'`);
  console.log('');
  console.log('✅ Ready to handle requests!');
  console.log('');
});

module.exports = app;
