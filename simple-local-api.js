// 🚀 SIMPLE LOCAL API - No external dependencies
// Run this with: node simple-local-api.js

const http = require('http');
const url = require('url');

const PORT = 3001;

console.log('🚀 Starting Simple Local API Server...');

// CORS headers
const setCORSHeaders = (res, origin) => {
  // Use specific origin instead of wildcard when credentials are involved
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:4200',
    'http://localhost:4201'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
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

const server = http.createServer(async (req, res) => {
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
      message: '🎉 Simple Local API is running!',
      timestamp: new Date().toISOString(),
      server: 'Simple Local Development Server',
      endpoints: [
        'GET /health - Health check',
        'POST /api/auth/login - Mock login',
        'POST /api/auth/signup - Mock signup'
      ]
    }, req.headers.origin);
  }
  else if (path === '/health' && method === 'GET') {
    console.log('❤️ Health check requested');
    sendJSON(res, 200, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: '✅ Simple Local API is healthy!',
      uptime: process.uptime(),
      environment: 'local-development'
    }, req.headers.origin);
  }
  else if (path === '/api/auth/login' && method === 'POST') {
    const body = await parseBody(req);
    console.log('🔐 Login requested:', body);
    
    sendJSON(res, 200, {
      success: true,
      data: {
        accessToken: 'simple-local-token-' + Date.now(),
        refreshToken: 'simple-refresh-token-' + Date.now(),
        expiresIn: 900,
        user: {
          id: '1',
          email: body.email || 'admin@frontuna.com',
          role: 'admin',
          firstName: 'Local',
          lastName: 'Admin'
        }
      },
      message: '✅ Login successful (Simple Local API)'
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
          firstName: 'Local',
          lastName: 'Admin',
          isActive: true,
          emailVerifiedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        }
      },
      message: '✅ Profile retrieved (Simple Local API)'
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
          { id: '2', email: 'user@frontuna.com', role: 'user', isActive: true }
        ],
        total: 2
      },
      message: '✅ Admin users retrieved (Simple Local API)'
    }, req.headers.origin);
  }
  else if (path === '/api/auth/signup' && method === 'POST') {
    const body = await parseBody(req);
    console.log('📝 Signup requested:', body);
    
    sendJSON(res, 200, {
      success: true,
      data: {
        accessToken: 'simple-local-token-' + Date.now(),
        refreshToken: 'simple-refresh-token-' + Date.now(),
        expiresIn: 900,
        user: {
          id: '2',
          email: body.email || 'user@example.com',
          role: 'user',
          firstName: body.firstName || 'New',
          lastName: body.lastName || 'User'
        }
      },
      message: '✅ Signup successful (Simple Local API)'
    }, req.headers.origin);
  }
  else {
    // 404
    console.log(`❌ 404 - Route not found: ${method} ${path}`);
    sendJSON(res, 404, {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${method} ${path} not found`
      }
    }, req.headers.origin);
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('🎉 ================================');
  console.log('🚀 SIMPLE LOCAL API IS RUNNING!');
  console.log('🎉 ================================');
  console.log('');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`❤️ Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log('');
  console.log('✅ Ready to handle requests!');
  console.log('');
});

module.exports = server;
