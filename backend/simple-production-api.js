// 🚀 SIMPLE PRODUCTION API - Based on working local version
const http = require('http');
const url = require('url');

console.log('🚀 Starting Simple Production API Server...');

// CORS headers - Production origins
const setCORSHeaders = (res, origin) => {
  const allowedOrigins = [
    'https://frontuna.com',
    'https://www.frontuna.com',
    'https://frontuna-frontend-app.vercel.app',
    'http://localhost:4200',
    'http://localhost:4201',
    'http://localhost:8080'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Default to main production domain
    res.setHeader('Access-Control-Allow-Origin', 'https://frontuna.com');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// JSON response helper
const sendJSON = (res, statusCode, data, origin) => {
  setCORSHeaders(res, origin);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
};

// Parse JSON body
const parseBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
};

// Main handler function for Vercel
module.exports = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`🌐 ${new Date().toISOString()} - ${method} ${path}`);
  console.log(`   Origin: ${req.headers.origin || 'None'}`);

  // Handle preflight requests
  if (method === 'OPTIONS') {
    console.log('🔄 CORS Preflight request');
    setCORSHeaders(res, req.headers.origin);
    res.writeHead(200);
    res.end();
    return;
  }

  // Routes
  if (path === '/' && method === 'GET') {
    sendJSON(res, 200, {
      status: 'ok',
      message: '🎉 Frontuna Production API is running!',
      timestamp: new Date().toISOString(),
      server: 'Production API Server',
      version: '1.0.0',
      endpoints: [
        'GET /health - Health check',
        'POST /api/auth/login - Authentication',
        'POST /api/auth/signup - User registration',
        'GET /api/auth/profile - User profile (protected)',
        'GET /api/admin/users - Admin users list (protected)'
      ]
    }, req.headers.origin);
  }
  else if (path === '/health' && method === 'GET') {
    console.log('❤️ Health check requested');
    sendJSON(res, 200, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: '✅ Production API is healthy!',
      environment: 'production',
      uptime: process.uptime()
    }, req.headers.origin);
  }
  else if (path === '/api/auth/login' && method === 'POST') {
    const body = await parseBody(req);
    console.log('🔐 Login requested:', { email: body.email, hasPassword: !!body.password });
    
    // In production, you'd validate against real database
    // For now, using mock data that matches your frontend expectations
    sendJSON(res, 200, {
      success: true,
      data: {
        accessToken: 'prod-access-token-' + Date.now(),
        refreshToken: 'prod-refresh-token-' + Date.now(),
        expiresIn: 900,
        user: {
          id: '1',
          email: body.email || 'admin@frontuna.com',
          role: 'admin',
          firstName: 'Production',
          lastName: 'Admin',
          isActive: true,
          emailVerifiedAt: new Date().toISOString()
        }
      },
      message: '✅ Login successful (Production API)'
    }, req.headers.origin);
  }
  else if (path === '/api/auth/signup' && method === 'POST') {
    const body = await parseBody(req);
    console.log('📝 Signup requested:', { email: body.email, hasPassword: !!body.password });
    
    sendJSON(res, 200, {
      success: true,
      data: {
        accessToken: 'prod-access-token-' + Date.now(),
        refreshToken: 'prod-refresh-token-' + Date.now(),
        expiresIn: 900,
        user: {
          id: '2',
          email: body.email || 'user@frontuna.com',
          role: 'user',
          firstName: body.firstName || 'New',
          lastName: body.lastName || 'User',
          isActive: true,
          emailVerifiedAt: new Date().toISOString()
        }
      },
      message: '✅ Signup successful (Production API)'
    }, req.headers.origin);
  }
  else if (path === '/api/auth/profile' && method === 'GET') {
    console.log('👤 Profile requested');
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJSON(res, 401, {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No valid token provided'
        }
      }, req.headers.origin);
    }
    
    sendJSON(res, 200, {
      success: true,
      data: {
        user: {
          id: '1',
          email: 'admin@frontuna.com',
          role: 'admin',
          firstName: 'Production',
          lastName: 'Admin',
          isActive: true,
          emailVerifiedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        }
      },
      message: '✅ Profile retrieved (Production API)'
    }, req.headers.origin);
  }
  else if (path === '/api/admin/users' && method === 'GET') {
    console.log('👥 Admin users requested');
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJSON(res, 401, {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No valid token provided'
        }
      }, req.headers.origin);
    }
    
    sendJSON(res, 200, {
      success: true,
      data: {
        users: [
          { id: '1', email: 'admin@frontuna.com', role: 'admin', isActive: true },
          { id: '2', email: 'user@frontuna.com', role: 'user', isActive: true },
          { id: '3', email: 'demo@frontuna.com', role: 'user', isActive: true }
        ],
        total: 3
      },
      message: '✅ Admin users retrieved (Production API)'
    }, req.headers.origin);
  }
  else {
    // 404
    console.log(`❌ 404 - Route not found: ${method} ${path}`);
    sendJSON(res, 404, {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${method} ${path} not found`,
        availableEndpoints: [
          'GET /',
          'GET /health',
          'POST /api/auth/login',
          'POST /api/auth/signup',
          'GET /api/auth/profile',
          'GET /api/admin/users'
        ]
      }
    }, req.headers.origin);
  }
};
