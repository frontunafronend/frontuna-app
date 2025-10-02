// 🚀 LOCAL DEVELOPMENT SERVER
// This wraps the Vercel serverless function for local testing
require('dotenv').config();
const http = require('http');
const handler = require('./api/index.js');

const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Frontuna Local Development Server...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 Database URL: ${process.env.DATABASE_URL ? 'configured' : 'missing'}`);

const server = http.createServer(async (req, res) => {
  try {
    // Add some local development helpers
    req.headers.host = req.headers.host || `localhost:${PORT}`;
    
    // Create Vercel-compatible response object
    const vercelRes = {
      status: (code) => {
        res.statusCode = code;
        return vercelRes;
      },
      json: (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return vercelRes;
      },
      setHeader: (name, value) => {
        res.setHeader(name, value);
        return vercelRes;
      },
      end: (data) => {
        res.end(data);
        return vercelRes;
      }
    };
    
    // Call the Vercel serverless function
    await handler(req, vercelRes);
  } catch (error) {
    console.error('❌ Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: error.message
    }));
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Local server running on http://localhost:${PORT}`);
  console.log(`❤️ Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`👑 Admin users: http://localhost:${PORT}/api/admin/users`);
  console.log('');
  console.log('📝 Test credentials:');
  console.log('   Email: admin@frontuna.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('🌐 Open test page: http://localhost:8080');
});

module.exports = server;
