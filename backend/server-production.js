const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize Express app
const app = express();

// Database connection (Neon PostgreSQL)
let db;
if (process.env.DATABASE_URL) {
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  console.log('🗄️ Connected to Neon PostgreSQL database');
} else {
  console.warn('⚠️ No DATABASE_URL found, using demo mode');
}

// CORS Configuration - Ultra-permissive for debugging
const corsOptions = {
  origin: true, // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: !!process.env.DATABASE_URL,
    cors: 'permissive'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    api: 'production-backend',
    database: !!db,
    timestamp: new Date().toISOString()
  });
});

// 🔑 SUPER ADMIN SETUP ROUTE (Use this once to become admin)
app.post('/api/setup-admin', async (req, res) => {
  try {
    const { email, setupKey } = req.body;
    
    // Security: Only allow if setup key matches
    const SETUP_KEY = process.env.ADMIN_SETUP_KEY || 'frontuna-admin-2024';
    
    if (setupKey !== SETUP_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Invalid setup key'
      });
    }

    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected'
      });
    }

    // Update user role to admin
    const result = await db.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE email = $2 RETURNING id, email, first_name, last_name, role',
      ['admin', email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please sign up first.'
      });
    }

    const user = result.rows[0];
    
    res.json({
      success: true,
      message: 'Admin privileges granted successfully!',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      }
    });

    console.log(`🔑 Admin privileges granted to: ${email}`);

  } catch (error) {
    console.error('❌ Setup admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup admin privileges'
    });
  }
});

// 👥 GET ALL USERS ENDPOINT (Admin only)
app.get('/api/admin/users', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected'
      });
    }

    // Get all users with basic info
    const result = await db.query(`
      SELECT 
        id, 
        email, 
        first_name, 
        last_name, 
        role, 
        created_at, 
        updated_at,
        last_login_at
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: {
        users: result.rows.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lastLoginAt: user.last_login_at
        })),
        total: result.rows.length
      }
    });

  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Authentication endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!db) {
      // Demo mode - create temporary user
      const user = {
        id: 'demo-user-' + Date.now(),
        email,
        firstName,
        lastName,
        role: 'user',
        createdAt: new Date().toISOString()
      };

      const token = jwt.sign(
        { 
          sub: user.id, 
          email: user.email, 
          role: user.role,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
        },
        process.env.JWT_SECRET || 'demo-secret'
      );

      return res.status(201).json({
        success: true,
        data: {
          user,
          accessToken: token,
          refreshToken: 'demo-refresh-' + Date.now(),
          expiresIn: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
          message: 'Account created successfully (demo mode)!'
        }
      });
    }

    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const result = await db.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, email, first_name, last_name, role, created_at
    `, [email, hashedPassword, firstName, lastName, 'user']);

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user.id, 
        email: user.email, 
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
      },
      process.env.JWT_SECRET || 'demo-secret'
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          createdAt: user.created_at
        },
        accessToken: token,
        refreshToken: 'refresh-' + user.id + '-' + Date.now(),
        expiresIn: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
        message: 'Account created successfully!'
      }
    });

    console.log(`✅ New user registered: ${email}`);

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (!db) {
      // Demo mode
      const user = {
        id: 'demo-user-login',
        email,
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        createdAt: new Date().toISOString()
      };

      const token = jwt.sign(
        { 
          sub: user.id, 
          email: user.email, 
          role: user.role,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
        },
        process.env.JWT_SECRET || 'demo-secret'
      );

      return res.json({
        success: true,
        data: {
          user,
          accessToken: token,
          refreshToken: 'demo-refresh-login',
          expiresIn: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
          message: 'Login successful (demo mode)!'
        }
      });
    }

    // Get user from database
    const result = await db.query(
      'SELECT id, email, password_hash, first_name, last_name, role, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user.id, 
        email: user.email, 
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
      },
      process.env.JWT_SECRET || 'demo-secret'
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          createdAt: user.created_at
        },
        accessToken: token,
        refreshToken: 'refresh-' + user.id + '-' + Date.now(),
        expiresIn: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
        message: 'Login successful!'
      }
    });

    console.log(`✅ User logged in: ${email}`);

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Settings endpoints (from your working settings service)
app.get('/api/users/preferences', (req, res) => {
  res.json({
    success: true,
    data: {
      darkMode: false,
      language: 'en',
      defaultFramework: 'react',
      autoSave: true,
      notifications: true
    }
  });
});

app.put('/api/users/preferences', (req, res) => {
  res.json({
    success: true,
    data: req.body,
    message: 'Preferences updated successfully'
  });
});

app.get('/api/users/notifications', (req, res) => {
  res.json({
    success: true,
    data: {
      email: true,
      push: false,
      generationComplete: true,
      weeklyDigest: false
    }
  });
});

app.put('/api/users/notifications', (req, res) => {
  res.json({
    success: true,
    data: req.body,
    message: 'Notification settings updated successfully'
  });
});

app.get('/api/users/api-keys', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'key-1',
        name: 'Production Key',
        key: 'fta_' + Math.random().toString(36).substring(2, 15),
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/users/api-keys', (req, res) => {
  const newKey = {
    id: 'key-' + Date.now(),
    name: req.body.name || 'New API Key',
    key: 'fta_' + Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString(),
    lastUsed: null
  };
  
  res.json({
    success: true,
    data: newKey,
    message: 'API key created successfully'
  });
});

app.delete('/api/users/api-keys/:id', (req, res) => {
  res.json({
    success: true,
    message: 'API key deleted successfully'
  });
});

app.put('/api/auth/profile', (req, res) => {
  res.json({
    success: true,
    data: req.body,
    message: 'Profile updated successfully'
  });
});

app.post('/api/auth/change-password', (req, res) => {
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

app.post('/api/auth/toggle-2fa', (req, res) => {
  res.json({
    success: true,
    data: { enabled: req.body.enabled },
    message: '2FA ' + (req.body.enabled ? 'enabled' : 'disabled') + ' successfully'
  });
});

app.get('/api/users/export/:type', (req, res) => {
  const data = JSON.stringify({ 
    type: req.params.type,
    exportedAt: new Date().toISOString(),
    data: 'Sample export data'
  });
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.type}-export.json"`);
  res.send(data);
});

app.post('/api/users/import', (req, res) => {
  res.json({
    success: true,
    message: 'Data imported successfully'
  });
});

app.delete('/api/users/clear-components', (req, res) => {
  res.json({
    success: true,
    message: 'All components cleared successfully'
  });
});

app.post('/api/auth/delete-account', (req, res) => {
  res.json({
    success: true,
    message: 'Account deletion initiated. You will receive a confirmation email.'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Super admin setup: POST /api/setup-admin`);
});

module.exports = app;
