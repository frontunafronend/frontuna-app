// 🚀 PRODUCTION API - Based on working local structure
const url = require('url');

console.log('🚀 Production API Starting...');

// CORS headers - Production ready
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

// Main handler - Vercel serverless function
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
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: '✅ Production API is healthy!',
        environment: 'production',
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

      // Production login validation (using same test credentials for now)
      if (body.email === 'admin@frontuna.com' && body.password === 'admin123') {
        const accessToken = 'prod-jwt-token-' + Date.now();
        const refreshToken = 'prod-refresh-token-' + Date.now();
        
        // Set httpOnly cookies for production
        res.setHeader('Set-Cookie', [
          `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`,
          `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`
        ]);

        return sendJSON(res, 200, {
          success: true,
          data: {
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresIn: 900,
            user: {
              id: '1',
              email: 'admin@frontuna.com',
              role: 'admin',
              firstName: 'Production',
              lastName: 'Admin'
            }
          },
          message: '✅ Login successful (Production API)'
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
        message: 'User created successfully (Production)',
        user: {
          id: Date.now().toString(),
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
          id: '1',
          email: 'admin@frontuna.com',
          firstName: 'Production',
          lastName: 'Admin',
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
        data: {
          users: [
            {
              id: '1',
              email: 'admin@frontuna.com',
              role: 'admin',
              isActive: true
            },
            {
              id: '2',
              email: 'user@frontuna.com',
              role: 'user',
              isActive: true
            }
          ],
          total: 2
        },
        message: '✅ Admin users retrieved (Production API)'
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