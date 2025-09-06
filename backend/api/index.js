const express = require('express');
const cors = require('cors');

const app = express();

// CORS - Allow all origins for testing
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`Origin: ${req.headers.origin || 'None'}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Vercel serverless API is working!',
    environment: process.env.NODE_ENV || 'development'
  });
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

// Simple auth endpoints
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

// Catch all
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
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

// Export for Vercel
module.exports = app;
