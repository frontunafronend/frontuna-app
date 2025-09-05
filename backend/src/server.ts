/**
 * 🚀 FRONTUNA SERVER
 * Production-ready server with secure authentication
 */

import { app } from './app';
import { env } from './config/env';
import { testEmailConnection } from './libs/email';

const PORT = env.PORT;

async function startServer() {
  try {
    // Test email configuration
    const emailTest = await testEmailConnection();
    if (emailTest.success) {
      console.log('✅ Email service configured');
    } else {
      console.warn('⚠️ Email service not configured:', emailTest.message);
    }

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Frontuna server running on port ${PORT}`);
      console.log(`📊 Environment: ${env.NODE_ENV}`);
      console.log(`🔐 Security features enabled:`);
      console.log(`   - JWT tokens with ${env.JWT_EXPIRES_IN} expiry`);
      console.log(`   - Refresh token rotation (${env.JWT_REFRESH_EXPIRES_IN})`);
      console.log(`   - Argon2 password hashing`);
      console.log(`   - Rate limiting & brute force protection`);
      console.log(`   - Audit logging`);
      console.log(`   - httpOnly cookies for refresh tokens`);
      console.log(`🌐 CORS origins: ${env.corsOrigins.join(', ')}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();
