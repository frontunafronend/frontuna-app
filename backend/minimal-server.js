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
    
    // Return success response
    res.status(201).json({
      success: true,
      data: {
        user,
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
    
    res.json({
      success: true,
      data: {
        user,
        accessToken: 'demo-token-' + Date.now(),
        refreshToken: 'demo-refresh-' + Date.now(),
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
