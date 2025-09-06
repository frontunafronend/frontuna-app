// 🚀 SIMPLE NEON API - Direct connection test
const http = require('http');
const url = require('url');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('🚀 Simple Neon API Starting...');
console.log('📍 DATABASE_URL configured:', !!process.env.DATABASE_URL);

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const PORT = process.env.PORT || 3000;

// Database connection test
let dbClient;
let dbConnected = false;

async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Try native pg client
    const { Client } = require('pg');
    dbClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await dbClient.connect();
    const result = await dbClient.query('SELECT NOW() as current_time, version() as db_version');
    
    dbConnected = true;
    console.log('✅ Database connected successfully!');
    console.log('📊 Database info:', result.rows[0]);
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    dbConnected = false;
    return false;
  }
}

// Initialize database
testDatabaseConnection();

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
    return res.status(200).end();
  }
  
  try {
    // Health endpoint
    if (pathname === '/health') {
      console.log('❤️ Health check requested');
      
      // Try to reconnect if not connected
      if (!dbConnected) {
        await testDatabaseConnection();
      }
      
      return sendJSON(res, 200, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: dbConnected ? '✅ Simple Neon API is healthy!' : '⚠️ API running without database',
        environment: 'production',
        database: dbConnected ? 'connected' : 'disconnected',
        version: '1.0.0'
      }, origin);
    }
    
    // Login endpoint
    if (pathname === '/api/auth/login' && method === 'POST') {
      console.log('🔐 Login requested');
      
      const body = await parseBody(req);
      
      if (!body.email || !body.password) {
        return sendJSON(res, 400, {
          success: false,
          error: 'Email and password are required'
        }, origin);
      }
      
      try {
        let user = null;
        
        if (dbConnected && dbClient) {
          // Try database authentication
          console.log('🔍 Checking database for user:', body.email);
          const result = await dbClient.query(
            'SELECT id, email, "passwordHash", role FROM "User" WHERE email = $1',
            [body.email.toLowerCase()]
          );
          user = result.rows[0] || null;
          console.log('👤 Database user found:', !!user);
        }
        
        if (!user) {
          // Fallback authentication for admin
          if (body.email === 'admin@frontuna.com' && body.password === 'admin123') {
            console.log('✅ Using fallback admin authentication');
            user = {
              id: 'fallback-admin-id',
              email: 'admin@frontuna.com',
              role: 'admin',
              passwordHash: await bcrypt.hash('admin123', 12)
            };
          }
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
        
        console.log('✅ Login successful for:', user.email);
        
        return sendJSON(res, 200, {
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          },
          accessToken: tokens.accessToken
        }, origin);
        
      } catch (error) {
        console.log('❌ Login error:', error.message);
        return sendJSON(res, 500, {
          success: false,
          error: 'Login failed'
        }, origin);
      }
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
  console.log(`🚀 Simple Neon API running on port ${PORT}`);
  console.log(`📍 Database: ${dbConnected ? 'Connected' : 'Disconnected'}`);
});

module.exports = server;
