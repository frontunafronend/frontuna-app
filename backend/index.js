// Simple Node.js server for Vercel
const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
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
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`Origin: ${req.headers.origin || 'None'}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Frontuna API is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/signup'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API is working perfectly!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('Login requested:', req.body);
  res.json({
    success: true,
    data: {
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: 900,
      user: {
        id: '1',
        email: 'admin@frontuna.com',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User'
      }
    },
    message: 'Login successful'
  });
});

app.post('/api/auth/signup', (req, res) => {
  console.log('Signup requested:', req.body);
  res.json({
    success: true,
    data: {
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: 900,
      user: {
        id: '2',
        email: req.body.email || 'user@example.com',
        role: 'user',
        firstName: req.body.firstName || 'User',
        lastName: req.body.lastName || 'Name'
      }
    },
    message: 'Signup successful'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
