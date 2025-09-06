// 🚀 VERCEL SERVERLESS API - Main handler
const url = require('url');

console.log('🚀 Vercel Serverless API Starting...');

// CORS headers
const setCORSHeaders = (res, origin) => {
  console.log(`🔍 CORS Debug - Origin: ${origin || 'No Origin'}`);
  
  const allowedOrigins = [
    'https://frontuna.com',
    'https://www.frontuna.com', 
    'https://frontuna-frontend-app.vercel.app',
    'http://localhost:4200',
    'http://localhost:4201',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:8080'
  ];
  
  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    console.log(`✅ CORS: Allowing origin ${origin}`);
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    console.log(`✅ CORS: No origin, allowing request`);
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    console.log(`⚠️ CORS: Unknown origin ${origin}, using default`);
    res.setHeader('Access-Control-Allow-Origin', 'https://frontuna.com');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// JSON response helper
const sendJSON = (res, statusCode, data, origin) => {
  setCORSHeaders(res, origin);
  res.setHeader('Content-Type', 'application/json');
  res.status(statusCode).json(data);
};

// Parse JSON body
const parseBody = (req) => {
  return new Promise((resolve) => {
    if (req.method === 'GET' || req.method === 'OPTIONS') {
      resolve({});
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
};

// Main handler
module.exports = async (req, res) => {
  const origin = req.headers.origin;
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`🌐 ${new Date().toISOString()} - ${method} ${pathname}`);
  console.log(`   Origin: ${origin || 'None'}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    console.log('🔄 CORS Preflight request');
    setCORSHeaders(res, origin);
    return res.status(200).end();
  }

  try {
    // Health endpoint
    if (pathname === '/health') {
      console.log('❤️ Health check requested');
      return sendJSON(res, 200, {
        status: 'healthy',
        message: 'Production API is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }, origin);
    }

    // Auth endpoints
    if (pathname === '/api/auth/login') {
      if (method !== 'POST') {
        return sendJSON(res, 405, { error: 'Method not allowed' }, origin);
      }

      const body = await parseBody(req);
      console.log('🔐 Login requested:', { email: body.email, password: '***' });

      // Mock login validation
      if (body.email === 'admin@frontuna.com' && body.password === 'admin123') {
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        // Set httpOnly cookie for refresh token
        res.setHeader('Set-Cookie', [
          `refreshToken=mock-refresh-${Date.now()}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`,
          `accessToken=${mockToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`
        ]);

        return sendJSON(res, 200, {
          success: true,
          message: 'Login successful',
          user: {
            id: 1,
            email: 'admin@frontuna.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
          },
          token: mockToken
        }, origin);
      } else {
        return sendJSON(res, 401, {
          success: false,
          error: 'Invalid credentials'
        }, origin);
      }
    }

    if (pathname === '/api/auth/signup') {
      if (method !== 'POST') {
        return sendJSON(res, 405, { error: 'Method not allowed' }, origin);
      }

      const body = await parseBody(req);
      console.log('📝 Signup requested:', { email: body.email });

      return sendJSON(res, 201, {
        success: true,
        message: 'User created successfully',
        user: {
          id: Date.now(),
          email: body.email,
          firstName: body.firstName || 'New',
          lastName: body.lastName || 'User',
          role: 'user'
        }
      }, origin);
    }

    if (pathname === '/api/auth/profile') {
      console.log('👤 Profile requested');
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendJSON(res, 401, { error: 'No token provided' }, origin);
      }

      return sendJSON(res, 200, {
        success: true,
        user: {
          id: 1,
          email: 'admin@frontuna.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        }
      }, origin);
    }

    // Admin endpoints
    if (pathname === '/api/admin/users') {
      console.log('👥 Admin users requested');
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendJSON(res, 401, { error: 'No token provided' }, origin);
      }

      return sendJSON(res, 200, {
        success: true,
        users: [
          {
            id: 1,
            email: 'admin@frontuna.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            isActive: true
          },
          {
            id: 2,
            email: 'user@frontuna.com',
            firstName: 'Regular',
            lastName: 'User',
            role: 'user',
            isActive: true
          }
        ]
      }, origin);
    }

    // 404 for unknown routes
    console.log(`❌ Route not found: ${pathname}`);
    return sendJSON(res, 404, {
      error: 'Route not found',
      path: pathname,
      availableRoutes: ['/health', '/api/auth/login', '/api/auth/signup', '/api/auth/profile', '/api/admin/users']
    }, origin);

  } catch (error) {
    console.error('💥 Server error:', error);
    return sendJSON(res, 500, {
      error: 'Internal server error',
      message: error.message
    }, origin);
  }
};