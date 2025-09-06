// 🚀 MINIMAL TEST API - No auth, immediate responses
const http = require('http');
const url = require('url');

console.log('🚀 Minimal Test API Starting...');

const PORT = process.env.PORT || 3000;

// CORS headers
const setCORSHeaders = (res, origin) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// JSON response helper
const sendJSON = (res, status, data) => {
  setCORSHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// Main server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  
  console.log(`📨 ${method} ${pathname}`);
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(200);
    return res.end();
  }
  
  try {
    // Health endpoint - NO AUTH REQUIRED
    if (pathname === '/health') {
      console.log('❤️ Health check - responding immediately');
      
      return sendJSON(res, 200, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: '✅ Minimal Test API is working!',
        environment: 'production',
        version: '1.0.0-minimal',
        auth: 'none'
      });
    }
    
    // Test endpoint
    if (pathname === '/test') {
      return sendJSON(res, 200, {
        success: true,
        message: 'Test endpoint working!',
        timestamp: new Date().toISOString()
      });
    }
    
    // Login endpoint - ALWAYS SUCCESS FOR TESTING
    if (pathname === '/api/auth/login' && method === 'POST') {
      console.log('🔐 Login test - always success');
      
      return sendJSON(res, 200, {
        success: true,
        message: 'Login test successful',
        user: {
          id: 'test-user-id',
          email: 'admin@frontuna.com',
          role: 'admin'
        },
        accessToken: 'test-token-123'
      });
    }
    
    // Default response
    return sendJSON(res, 200, {
      success: true,
      message: 'Minimal API is working',
      endpoint: pathname,
      method: method,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.log('❌ Server error:', error.message);
    return sendJSON(res, 500, {
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

server.listen(PORT, () => {
  console.log(`⚡ Minimal Test API running on port ${PORT}`);
});

module.exports = server;
