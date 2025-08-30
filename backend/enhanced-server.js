/**
 * 🚀 ENHANCED FRONTUNA SERVER
 * Professional server with Neon database integration
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { NeonDatabaseService } = require('./neon-integration');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const neonService = new NeonDatabaseService();
let prisma = null;
let openai = null;

// Initialize OpenAI
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('✅ OpenAI initialized successfully');
} else {
  console.log('⚠️ OpenAI API key not found');
}

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4201', 'https://frontuna.com'],
  credentials: true
}));
app.use(express.json());

/**
 * Initialize database connection
 */
async function initializeDatabase() {
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    
    if (databaseUrl) {
      prisma = await neonService.initialize(databaseUrl);
      console.log('✅ Database initialized successfully');
    } else {
      console.log('⚠️ No database URL found - running in mock mode');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('⚠️ Running in mock mode');
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        openai: !!openai,
        database: await neonService.healthCheck()
      }
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoints
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Enhanced Frontuna Server is running!',
    timestamp: new Date().toISOString()
  });
});

// OpenAI test endpoint
app.post('/api/ai/test', async (req, res) => {
  try {
    if (!openai) {
      return res.status(400).json({
        success: false,
        error: 'OpenAI not configured'
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "Say hello from Frontuna!" }
      ],
      max_tokens: 50
    });

    res.json({
      success: true,
      message: completion.choices[0].message.content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Database test endpoint
app.get('/api/database/test', async (req, res) => {
  try {
    if (!prisma) {
      return res.json({
        success: true,
        message: 'Running in mock mode - no database connected',
        mode: 'mock'
      });
    }

    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as db_version`;
    
    res.json({
      success: true,
      message: 'Database connection successful',
      data: result[0],
      mode: 'database'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log('🚀 Enhanced Frontuna Server started successfully!');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🧪 API test: http://localhost:${PORT}/api/test`);
      console.log(`🤖 OpenAI test: POST http://localhost:${PORT}/api/ai/test`);
      console.log(`🗄️ Database test: http://localhost:${PORT}/api/database/test`);
      console.log('🌟 Ready to serve requests!');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 Shutting down gracefully...');
      await neonService.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
