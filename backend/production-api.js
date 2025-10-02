// 🚀 PRODUCTION API - Live Neon Database Only
const http = require('http');
const url = require('url');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

console.log('🚀 PRODUCTION API Starting - Live Database Only...');

// Environment variables - REQUIRED for production
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'production-jwt-secret-key';
const JWT_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '30d';
const PORT = process.env.PORT || 3000;

if (!DATABASE_URL) {
  console.error('❌ CRITICAL: DATABASE_URL environment variable is required for production');
  process.exit(1);
}

// Initialize Prisma Client - Production Only
let prisma;
let databaseReady = false;

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to production Neon database...');
    
    prisma = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: DATABASE_URL
        }
      }
    });
    
    // Test connection
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1 as connection_test`;
    
    databaseReady = true;
    console.log('✅ Production database connected successfully!');
    
    // Verify admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@frontuna.com' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user verified in production database');
    } else {
      console.warn('⚠️ Admin user not found - run seed script');
    }
    
    return true;
  } catch (error) {
    console.error('❌ CRITICAL: Production database connection failed:', error.message);
    console.error('💡 Check DATABASE_URL and network connectivity');
    process.exit(1); // Exit on database failure in production
  }
}

// Initialize database connection
initializeDatabase();

// CORS configuration for production
const setCORSHeaders = (res, origin) => {
  const allowedOrigins = [
    'https://frontuna.com',
    'https://www.frontuna.com',
    'https://frontuna-frontend-app.vercel.app',
    'http://localhost:4200',
    'http://localhost:8080',
    'http://localhost:3000'
  ];
  
  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
};

// JSON response helper
const sendJSON = (res, status, data, origin) => {
  setCORSHeaders(res, origin);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// Parse request body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
};

// Generate JWT tokens
const generateTokens = (userId, email, role) => {
  const accessToken = jwt.sign(
    { 
      userId, 
      email, 
      role, 
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  const refreshToken = jwt.sign(
    { 
      userId, 
      email, 
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
  
  return { accessToken, refreshToken };
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Extract token from request
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies for token
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenMatch = cookies.match(/accessToken=([^;]+)/);
    if (tokenMatch) {
      return tokenMatch[1];
    }
  }
  
  return null;
};

// Authentication middleware
const requireAuth = async (req, res, origin) => {
  const token = extractToken(req);
  
  if (!token) {
    return sendJSON(res, 401, {
      success: false,
      error: 'Authentication required'
    }, origin);
  }
  
  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'access') {
    return sendJSON(res, 401, {
      success: false,
      error: 'Invalid or expired token'
    }, origin);
  }
  
  // Verify user exists in database
  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true }
    });
    
    if (!user) {
      return sendJSON(res, 401, {
        success: false,
        error: 'User not found'
      }, origin);
    }
    
    req.user = user;
    return null; // Success
  } catch (error) {
    console.error('Auth middleware error:', error);
    return sendJSON(res, 500, {
      success: false,
      error: 'Authentication verification failed'
    }, origin);
  }
};

// Admin middleware
const requireAdmin = (req, res, origin) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendJSON(res, 403, {
      success: false,
      error: 'Admin access required'
    }, origin);
  }
  return null; // Success
};

// Main server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const origin = req.headers.origin;
  
  console.log(`📨 ${method} ${pathname} from ${origin || 'no-origin'}`);
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setCORSHeaders(res, origin);
    res.writeHead(200);
    return res.end();
  }
  
  try {
    // Health endpoint - Production status
    if (pathname === '/health') {
      console.log('❤️ Production health check');
      
      let dbStatus = 'disconnected';
      let message = '❌ Database not ready';
      
      if (databaseReady && prisma) {
        try {
          await prisma.$queryRaw`SELECT 1 as health_check`;
          dbStatus = 'connected';
          message = '✅ Production API with Live Neon Database is healthy!';
        } catch (error) {
          console.error('Database health check failed:', error.message);
          dbStatus = 'error';
          message = '❌ Database connection error';
        }
      }
      
      return sendJSON(res, 200, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: message,
        environment: 'production',
        database: dbStatus,
        version: '1.0.0-production',
        mockData: false // NO MOCK DATA IN PRODUCTION
      }, origin);
    }
    
    // Login endpoint - LIVE DATABASE ONLY
    if (pathname === '/api/auth/login' && method === 'POST') {
      console.log('🔐 Production login request');
      
      if (!databaseReady) {
        return sendJSON(res, 503, {
          success: false,
          error: 'Database not ready'
        }, origin);
      }
      
      const body = await parseBody(req);
      
      if (!body.email || !body.password) {
        return sendJSON(res, 400, {
          success: false,
          error: 'Email and password are required'
        }, origin);
      }
      
      try {
        // Find user in LIVE database only
        const user = await prisma.user.findUnique({
          where: { email: body.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            role: true,
            createdAt: true
          }
        });
        
        if (!user) {
          console.log('❌ User not found:', body.email);
          return sendJSON(res, 401, {
            success: false,
            error: 'Invalid credentials'
          }, origin);
        }
        
        // Verify password
        const passwordValid = await bcrypt.compare(body.password, user.passwordHash);
        
        if (!passwordValid) {
          console.log('❌ Invalid password for:', body.email);
          return sendJSON(res, 401, {
            success: false,
            error: 'Invalid credentials'
          }, origin);
        }
        
        // Generate tokens
        const tokens = generateTokens(user.id, user.email, user.role);
        
        // Set httpOnly cookies
        res.setHeader('Set-Cookie', [
          `accessToken=${tokens.accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`,
          `refreshToken=${tokens.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`
        ]);
        
        console.log('✅ Production login successful:', user.email);
        
        return sendJSON(res, 200, {
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
          },
          accessToken: tokens.accessToken
        }, origin);
        
      } catch (error) {
        console.error('❌ Login error:', error.message);
        return sendJSON(res, 500, {
          success: false,
          error: 'Login failed'
        }, origin);
      }
    }
    
    // Signup endpoint - LIVE DATABASE ONLY
    if (pathname === '/api/auth/signup' && method === 'POST') {
      console.log('📝 Production signup request');
      
      if (!databaseReady) {
        return sendJSON(res, 503, {
          success: false,
          error: 'Database not ready'
        }, origin);
      }
      
      const body = await parseBody(req);
      
      if (!body.email || !body.password) {
        return sendJSON(res, 400, {
          success: false,
          error: 'Email and password are required'
        }, origin);
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return sendJSON(res, 400, {
          success: false,
          error: 'Invalid email format'
        }, origin);
      }
      
      // Validate password strength
      if (body.password.length < 6) {
        return sendJSON(res, 400, {
          success: false,
          error: 'Password must be at least 6 characters'
        }, origin);
      }
      
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: body.email.toLowerCase() }
        });
        
        if (existingUser) {
          return sendJSON(res, 409, {
            success: false,
            error: 'User already exists'
          }, origin);
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(body.password, 12);
        
        // Create user in LIVE database
        const newUser = await prisma.user.create({
          data: {
            email: body.email.toLowerCase(),
            passwordHash: passwordHash,
            role: 'user'
          },
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
          }
        });
        
        // Generate tokens
        const tokens = generateTokens(newUser.id, newUser.email, newUser.role);
        
        // Set httpOnly cookies
        res.setHeader('Set-Cookie', [
          `accessToken=${tokens.accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`,
          `refreshToken=${tokens.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`
        ]);
        
        console.log('✅ Production signup successful:', newUser.email);
        
        return sendJSON(res, 201, {
          success: true,
          message: 'User created successfully',
          user: newUser,
          accessToken: tokens.accessToken
        }, origin);
        
      } catch (error) {
        console.error('❌ Signup error:', error.message);
        return sendJSON(res, 500, {
          success: false,
          error: 'User creation failed'
        }, origin);
      }
    }
    
    // Profile endpoint - AUTHENTICATED USERS ONLY
    if (pathname === '/api/auth/profile' && method === 'GET') {
      console.log('👤 Production profile request');
      
      if (!databaseReady) {
        return sendJSON(res, 503, {
          success: false,
          error: 'Database not ready'
        }, origin);
      }
      
      const authError = await requireAuth(req, res, origin);
      if (authError) return;
      
      try {
        // Get fresh user data from database
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
          }
        });
        
        if (!user) {
          return sendJSON(res, 404, {
            success: false,
            error: 'User not found'
          }, origin);
        }
        
        return sendJSON(res, 200, {
          success: true,
          user: user
        }, origin);
        
      } catch (error) {
        console.error('❌ Profile error:', error.message);
        return sendJSON(res, 500, {
          success: false,
          error: 'Failed to get profile'
        }, origin);
      }
    }
    
    // Admin users endpoint - ADMIN ONLY
    if (pathname === '/api/admin/users' && method === 'GET') {
      console.log('👑 Production admin users request');
      
      if (!databaseReady) {
        return sendJSON(res, 503, {
          success: false,
          error: 'Database not ready'
        }, origin);
      }
      
      const authError = await requireAuth(req, res, origin);
      if (authError) return;
      
      const adminError = requireAdmin(req, res, origin);
      if (adminError) return;
      
      try {
        // Get all users from LIVE database
        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        
        return sendJSON(res, 200, {
          success: true,
          users: users,
          total: users.length
        }, origin);
        
      } catch (error) {
        console.error('❌ Admin users error:', error.message);
        return sendJSON(res, 500, {
          success: false,
          error: 'Failed to get users'
        }, origin);
      }
    }
    
    // Logout endpoint
    if (pathname === '/api/auth/logout' && method === 'POST') {
      console.log('🚪 Production logout request');
      
      // Clear cookies
      res.setHeader('Set-Cookie', [
        'accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
        'refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
      ]);
      
      return sendJSON(res, 200, {
        success: true,
        message: 'Logged out successfully'
      }, origin);
    }
    
    // 404 for unknown routes
    return sendJSON(res, 404, {
      success: false,
      error: 'Endpoint not found',
      availableEndpoints: [
        'GET /health',
        'POST /api/auth/login',
        'POST /api/auth/signup',
        'GET /api/auth/profile',
        'POST /api/auth/logout',
        'GET /api/admin/users'
      ]
    }, origin);
    
  } catch (error) {
    console.error('❌ Server error:', error.message);
    return sendJSON(res, 500, {
      success: false,
      error: 'Internal server error'
    }, origin);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down gracefully...');
  if (prisma) {
    await prisma.$disconnect();
  }
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  if (prisma) {
    await prisma.$disconnect();
  }
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 PRODUCTION API running on port ${PORT}`);
  console.log(`📍 Database: ${databaseReady ? 'Connected' : 'Connecting...'}`);
  console.log(`🔒 Authentication: JWT with bcrypt`);
  console.log(`📊 Mock Data: DISABLED - Live Database Only`);
  console.log(`🌐 CORS: Production origins configured`);
});

module.exports = server;
