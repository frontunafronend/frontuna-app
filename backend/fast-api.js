// 🚀 FAST API - Immediate responses, async database
const http = require('http');
const url = require('url');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('🚀 Fast API Starting...');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const PORT = process.env.PORT || 3000;

// Database status (don't wait for connection)
let dbStatus = 'checking';
let dbClient = null;

// Test database connection in background
async function initDatabase() {
  try {
    console.log('🔄 Testing database connection in background...');
    
    if (!process.env.DATABASE_URL) {
      dbStatus = 'no-url';
      console.log('⚠️ No DATABASE_URL configured');
      return;
    }
    
    const { Client } = require('pg');
    dbClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
      query_timeout: 5000
    });
    
    await dbClient.connect();
    await dbClient.query('SELECT 1');
    
    dbStatus = 'connected';
    console.log('✅ Database connected!');
  } catch (error) {
    dbStatus = 'failed';
    console.log('❌ Database connection failed:', error.message);
    dbClient = null;
  }
}

// Start database connection in background (don't wait)
initDatabase();

// CORS headers
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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
        reject(error);
      }
    });
  });
};

// Generate JWT tokens
const generateTokens = (userId, email, role) => {
  const accessToken = jwt.sign(
    { userId, email, role, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, email, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  return { accessToken, refreshToken };
};

// Quick database query with timeout
const quickQuery = async (sql, params = []) => {
  if (!dbClient || dbStatus !== 'connected') {
    throw new Error('Database not available');
  }
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Query timeout'));
    }, 3000);
    
    dbClient.query(sql, params)
      .then(result => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeout);
        reject(error);
      });
  });
};

// Main server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const origin = req.headers.origin;
  
  console.log(`📨 ${method} ${pathname}`);
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setCORSHeaders(res, origin);
    res.writeHead(200);
    return res.end();
  }
  
  try {
    // Health endpoint - ALWAYS responds quickly
    if (pathname === '/health') {
      console.log('❤️ Health check - responding immediately');
      
      return sendJSON(res, 200, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: dbStatus === 'connected' ? '✅ Fast API with Neon Database!' : '⚡ Fast API ready!',
        environment: 'production',
        database: dbStatus,
        version: '1.0.0-fast',
        responseTime: 'immediate'
      }, origin);
    }
    
    // Login endpoint - Quick response
    if (pathname === '/api/auth/login' && method === 'POST') {
      console.log('🔐 Login - processing quickly');
      
      const body = await parseBody(req);
      
      if (!body.email || !body.password) {
        return sendJSON(res, 400, {
          success: false,
          error: 'Email and password are required'
        }, origin);
      }
      
      try {
        let user = null;
        
        // Try quick database lookup
        if (dbStatus === 'connected' && dbClient) {
          try {
            console.log('🔍 Quick database check...');
            const result = await quickQuery(
              'SELECT id, email, "passwordHash", role FROM "User" WHERE email = $1',
              [body.email.toLowerCase()]
            );
            user = result.rows[0] || null;
            console.log('👤 Database user:', !!user);
          } catch (dbError) {
            console.log('⚠️ Database query failed, using fallback');
          }
        }
        
        // Fallback authentication for admin (always works)
        if (!user && body.email === 'admin@frontuna.com' && body.password === 'admin123') {
          console.log('✅ Using fallback admin authentication');
          user = {
            id: 'admin-fallback-id',
            email: 'admin@frontuna.com',
            role: 'admin',
            passwordHash: '$2a$12$nubFibBPiIcCuUfSScX3Z.Cp2emY54JdFHvI/hO3q0OW.qt7M8Mk.' // admin123
          };
        }
        
        if (!user) {
          return sendJSON(res, 401, {
            success: false,
            error: 'Invalid credentials'
          }, origin);
        }
        
        // Verify password
        const passwordValid = await bcrypt.compare(body.password, user.passwordHash);
        
        if (!passwordValid) {
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
        
        console.log('✅ Login successful:', user.email);
        
        return sendJSON(res, 200, {
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          },
          accessToken: tokens.accessToken,
          source: user.id.includes('fallback') ? 'fallback' : 'database'
        }, origin);
        
      } catch (error) {
        console.log('❌ Login error:', error.message);
        return sendJSON(res, 500, {
          success: false,
          error: 'Login processing failed'
        }, origin);
      }
    }
    
    // Signup endpoint
    if (pathname === '/api/auth/signup' && method === 'POST') {
      const body = await parseBody(req);
      
      if (!body.email || !body.password) {
        return sendJSON(res, 400, {
          success: false,
          error: 'Email and password are required'
        }, origin);
      }
      
      // For now, return success (can implement database insert later)
      return sendJSON(res, 200, {
        success: true,
        message: 'Signup successful (demo mode)',
        user: {
          id: 'demo-user-' + Date.now(),
          email: body.email,
          role: 'user'
        }
      }, origin);
    }
    
    // 404 for other routes
    return sendJSON(res, 404, {
      success: false,
      error: 'Endpoint not found'
    }, origin);
    
  } catch (error) {
    console.log('❌ Server error:', error.message);
    return sendJSON(res, 500, {
      success: false,
      error: 'Internal server error'
    }, origin);
  }
});

server.listen(PORT, () => {
  console.log(`⚡ Fast API running on port ${PORT}`);
  console.log(`📍 Database status: ${dbStatus}`);
});

module.exports = server;
