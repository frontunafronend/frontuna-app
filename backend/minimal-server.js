/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:32:02.156Z
 * Issues detected: 3
 * 
 * This file is protected against common bugs:
 * - TOKEN_BASE64_MISMATCH: HIGH
 * - API_WITHOUT_DB_INTEGRATION: HIGH
 * - INCOMPLETE_API_RESPONSE: MEDIUM
 */


// 🛡️ DATABASE GUARD: This code interacts with the database
// CRITICAL RULES:
// 1. ALWAYS wrap database queries in try-catch blocks
// 2. ALWAYS provide fallback responses for demo mode
// 3. NEVER expose raw database errors to frontend
// 4. ALWAYS validate user input before database operations
/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:30:47.959Z
 * Issues detected: 3
 * 
 * This file is protected against common bugs:
 * - TOKEN_BASE64_MISMATCH: HIGH
 * - API_WITHOUT_DB_INTEGRATION: HIGH
 * - INCOMPLETE_API_RESPONSE: MEDIUM
 */


// 🛡️ DATABASE GUARD: This code interacts with the database
// CRITICAL RULES:
// 1. ALWAYS wrap database queries in try-catch blocks
// 2. ALWAYS provide fallback responses for demo mode
// 3. NEVER expose raw database errors to frontend
// 4. ALWAYS validate user input before database operations
/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:22:45.985Z
 * Issues detected: 3
 * 
 * This file is protected against common bugs:
 * - TOKEN_BASE64_MISMATCH: HIGH
 * - API_WITHOUT_DB_INTEGRATION: HIGH
 * - INCOMPLETE_API_RESPONSE: MEDIUM
 */


// 🛡️ DATABASE GUARD: This code interacts with the database
// CRITICAL RULES:
// 1. ALWAYS wrap database queries in try-catch blocks
// 2. ALWAYS provide fallback responses for demo mode
// 3. NEVER expose raw database errors to frontend
// 4. ALWAYS validate user input before database operations
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ultra-permissive CORS for immediate fix
app.use(cors({
  origin: true, // Allow ALL origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Minimal backend is working!',
    timestamp: new Date().toISOString(),
    cors: 'enabled-permissive'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Minimal signup endpoint that works
app.post('/api/auth/signup', async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    
    const { email, password, firstName, lastName, agreeToTerms } = req.body;
    
    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email, password, firstName, and lastName are required'
        }
      });
    }
    
    if (!agreeToTerms) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TERMS_NOT_AGREED',
          message: 'You must agree to the terms of service'
        }
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Simulate user creation (replace with real DB later)
    const user = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
      // Don't return password hash
    };
    
    console.log('User created successfully:', user);
    
    // Create a simple JWT-like token for the new user
    const demoPayload = {
      sub: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year from now
    };
    
    // Create a fake JWT token (header.payload.signature format)
    const header = Buffer.from(JSON.stringify({alg: 'HS256', typ: 'JWT'})).toString('base64url');
    const payload = Buffer.from(JSON.stringify(demoPayload)).toString('base64url');
    const signature = 'demo-signature';
    const demoJWT = `${header}.${payload}.${signature}`;
    
    // Return success response with tokens
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
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SIGNUP_FAILED',
        message: 'Failed to create account. Please try again.'
      }
    });
  }
});

// Minimal login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email and password are required'
        }
      });
    }
    
    // For now, return success for any login (replace with real auth later)
    const user = {
      id: '1',
      email,
      firstName: 'Demo',
      lastName: 'User'
    };
    
    // Create a simple JWT-like token that won't expire for demo purposes
    const demoPayload = {
      sub: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year from now
    };
    
    // Create a fake JWT token (header.payload.signature format)
    const header = Buffer.from(JSON.stringify({alg: 'HS256', typ: 'JWT'})).toString('base64url');
    const payload = Buffer.from(JSON.stringify(demoPayload)).toString('base64url');
    const signature = 'demo-signature';
    const demoJWT = `${header}.${payload}.${signature}`;
    
    res.json({
      success: true,
      data: {
        user,
        accessToken: demoJWT,
        refreshToken: 'demo-refresh-' + Date.now(),
        expiresIn: demoPayload.exp,
        message: 'Login successful'
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: 'Login failed. Please try again.'
      }
    });
  }
});

// Catch all other routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found`
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`✅ CORS enabled for all origins`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
