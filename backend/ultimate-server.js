/**
 * 🌟 ULTIMATE FRONTUNA SERVER
 * The most professional server ever created with LIVE Neon database!
 * NO MOCK DATA - EVERYTHING IS REAL!
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { ultimateDB } = require('./ultimate-database-manager');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
let openai = null;
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
 * 🚀 Initialize Ultimate Server
 */
async function initializeUltimateServer() {
  try {
    console.log('🌟 Starting Ultimate Frontuna Server...');
    
    // Initialize the ultimate database
    await ultimateDB.initialize();
    console.log('✅ Ultimate Database Manager ready!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize Ultimate Server:', error.message);
    throw error;
  }
}

// 🌟 ULTIMATE HEALTH CHECK ENDPOINT
app.get('/health', async (req, res) => {
  try {
    const dbStatus = ultimateDB.getConnectionStatus();
    const dbStats = await ultimateDB.getDatabaseStats();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      },
      services: {
        openai: !!openai,
        database: dbStatus.isConnected,
        databaseHealth: dbStatus.health.status
      },
      database: {
        connection: dbStatus,
        statistics: dbStats
      }
    };

    res.json(health);
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 🎯 API TEST ENDPOINT
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '🌟 Ultimate Frontuna Server is LIVE with real Neon database!',
    timestamp: new Date().toISOString(),
    database: 'LIVE NEON DATABASE - NO MOCK DATA!'
  });
});

// 👥 GET ALL USERS (LIVE DATA FROM NEON)
app.get('/api/admin/users', async (req, res) => {
  try {
    console.log('📊 Fetching LIVE users from Neon database...');
    
    const users = await ultimateDB.getAllUsers();
    
    res.json({
      success: true,
      message: `Retrieved ${users.length} users from LIVE Neon database`,
      data: users,
      source: 'LIVE_NEON_DATABASE',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch users:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch users from live database'
    });
  }
});

// 👑 GET ADMIN USERS (LIVE DATA FROM NEON)
app.get('/api/admin/admins', async (req, res) => {
  try {
    console.log('👑 Fetching LIVE admin users from Neon database...');
    
    const admins = await ultimateDB.getAdminUsers();
    
    res.json({
      success: true,
      message: `Retrieved ${admins.length} admin users from LIVE Neon database`,
      data: admins,
      source: 'LIVE_NEON_DATABASE',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch admin users:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch admin users from live database'
    });
  }
});

// 🔍 GET USER BY ID (LIVE DATA FROM NEON)
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`🔍 Fetching user ${userId} from LIVE Neon database...`);
    
    const user = await ultimateDB.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in live database'
      });
    }
    
    res.json({
      success: true,
      message: 'User retrieved from LIVE Neon database',
      data: user,
      source: 'LIVE_NEON_DATABASE',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch user by ID:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch user from live database'
    });
  }
});

// 📊 GET DATABASE STATISTICS (LIVE DATA FROM NEON)
app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('📊 Fetching LIVE database statistics from Neon...');
    
    const stats = await ultimateDB.getDatabaseStats();
    
    res.json({
      success: true,
      message: 'Database statistics from LIVE Neon database',
      data: stats,
      source: 'LIVE_NEON_DATABASE',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch database statistics:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch statistics from live database'
    });
  }
});

// 🔄 CREATE OR UPDATE USER (LIVE DATA TO NEON)
app.post('/api/admin/users', async (req, res) => {
  try {
    const userData = req.body;
    console.log('🔄 Creating/updating user in LIVE Neon database...', userData.email);
    
    const user = await ultimateDB.upsertUser(userData);
    
    res.json({
      success: true,
      message: 'User created/updated in LIVE Neon database',
      data: user,
      source: 'LIVE_NEON_DATABASE',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to create/update user:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create/update user in live database'
    });
  }
});

// 🤖 OpenAI test endpoint
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
        { role: "user", content: "Say hello from the Ultimate Frontuna Server with LIVE Neon database!" }
      ],
      max_tokens: 100
    });

    res.json({
      success: true,
      message: completion.choices[0].message.content,
      source: 'LIVE_OPENAI_API',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🤖 AI Copilot Chat Endpoint
app.post('/api/ai/copilot/chat', async (req, res) => {
  try {
    console.log('🤖 AI Copilot chat called:', req.body);
    
    if (!openai) {
      return res.json({
        success: false,
        error: 'OpenAI not initialized',
        message: 'OpenAI API key not found'
      });
    }
    
    const { message, context, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
        message: 'Please provide a message'
      });
    }
    
    console.log('🧠 Generating AI response for:', message);
    
    // Create AI completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert Angular developer and coding assistant. You help users create professional, modern Angular components with TypeScript, HTML, and SCSS.
          
Context: ${context || 'No context provided'}
          
Always provide:
1. Clear, professional code
2. Best practices
3. Proper TypeScript typing
4. Modern Angular features
5. Responsive design
          
Format your response as helpful explanations with code examples when appropriate.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });
    
    const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    console.log('✅ AI response generated successfully');
    
    res.json({
      success: true,
      data: {
        message: aiResponse,
        sessionId: sessionId || `session_${Date.now()}`,
        tokensUsed: completion.usage?.total_tokens || 0,
        model: 'gpt-3.5-turbo',
        responseTime: Date.now(),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ AI Copilot error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to generate AI response'
    });
  }
});

// 🤖 AI Copilot Session Start
app.post('/api/ai/copilot/session/start', async (req, res) => {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🆕 New AI Copilot session started:', sessionId);
    
    res.json({
      success: true,
      data: {
        sessionId,
        timestamp: new Date().toISOString(),
        message: 'AI Copilot session started successfully'
      }
    });
    
  } catch (error) {
    console.error('❌ Session start error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to start session'
    });
  }
});

// 🌟 ULTIMATE SERVER STARTUP
async function startUltimateServer() {
  try {
    // Initialize the ultimate system
    await initializeUltimateServer();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log('🌟 ================================');
      console.log('🚀 ULTIMATE FRONTUNA SERVER LIVE!');
      console.log('🌟 ================================');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🧪 API test: http://localhost:${PORT}/api/test`);
      console.log(`👥 Live users: http://localhost:${PORT}/api/admin/users`);
      console.log(`👑 Live admins: http://localhost:${PORT}/api/admin/admins`);
      console.log(`📊 Live stats: http://localhost:${PORT}/api/admin/stats`);
      console.log(`🤖 OpenAI test: POST http://localhost:${PORT}/api/ai/test`);
      console.log('🌟 ================================');
      console.log('✅ LIVE NEON DATABASE CONNECTED!');
      console.log('🚫 NO MOCK DATA - EVERYTHING REAL!');
      console.log('🌟 ================================');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 Shutting down Ultimate Server...');
      await ultimateDB.shutdown();
      server.close(() => {
        console.log('✅ Ultimate Server shutdown complete');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('🛑 Shutting down Ultimate Server...');
      await ultimateDB.shutdown();
      server.close(() => {
        console.log('✅ Ultimate Server shutdown complete');
        process.exit(0);
      });
    });

    return server;
    
  } catch (error) {
    console.error('❌ Failed to start Ultimate Server:', error.message);
    process.exit(1);
  }
}

// 🚀 Start the ultimate server
if (require.main === module) {
  startUltimateServer();
}

module.exports = app;
