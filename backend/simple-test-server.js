/**
 * 🌟 SIMPLE TEST SERVER FOR ADMIN FUNCTIONALITY
 * This server works without database dependencies for testing
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4201'],
  credentials: true
}));
app.use(express.json());

// 📊 Mock live users data (simulating Neon database)
const mockUsers = [
  {
    id: '1',
    email: 'admin@frontuna.com',
    role: 'admin',
    name: 'Admin User',
    joinedAt: new Date('2024-01-01'),
    avatar: null,
    plan: 'enterprise',
    generationsUsed: 45,
    generationsLimit: 1000,
    status: 'active'
  },
  {
    id: '2', 
    email: 'user@frontuna.com',
    role: 'user',
    name: 'Regular User',
    joinedAt: new Date('2024-01-15'),
    avatar: null,
    plan: 'basic',
    generationsUsed: 23,
    generationsLimit: 100,
    status: 'active'
  },
  {
    id: '3',
    email: 'test@example.com',
    role: 'user', 
    name: 'Test User',
    joinedAt: new Date('2024-02-01'),
    avatar: null,
    plan: 'basic',
    generationsUsed: 12,
    generationsLimit: 100,
    status: 'active'
  },
  {
    id: '4',
    email: 'admin@frontuna.ai',
    role: 'admin',
    name: 'AI Admin',
    joinedAt: new Date('2024-01-10'),
    avatar: null,
    plan: 'enterprise', 
    generationsUsed: 78,
    generationsLimit: 1000,
    status: 'active'
  },
  {
    id: '5',
    email: 'premium@example.com',
    role: 'user',
    name: 'Premium User',
    joinedAt: new Date('2024-02-15'),
    avatar: null,
    plan: 'pro',
    generationsUsed: 156,
    generationsLimit: 500,
    status: 'active'
  }
];

// 🏥 Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    },
    database: {
      status: 'connected',
      users: mockUsers.length,
      responseTime: '12ms'
    }
  });
});

// 👥 Get All Users (Admin Only)
app.get('/api/admin/users', (req, res) => {
  try {
    console.log('📊 Fetching users for admin panel...');
    
    res.json({
      success: true,
      message: `Retrieved ${mockUsers.length} users from database`,
      data: mockUsers,
      source: 'MOCK_DATABASE',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch users:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch users'
    });
  }
});

// 📊 Get Admin Statistics
app.get('/api/admin/stats', (req, res) => {
  try {
    const stats = {
      totalUsers: mockUsers.length,
      totalAdmins: mockUsers.filter(u => u.role === 'admin').length,
      totalComponents: 15,
      activeUsers: mockUsers.filter(u => u.status === 'active').length,
      userGrowth: 12.5,
      generationGrowth: 8.3,
      monthlyRevenue: 15420,
      revenueGrowth: 22.7,
      systemHealth: 98.2
    };
    
    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
      source: 'MOCK_DATABASE',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch statistics:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch statistics'
    });
  }
});

// 🤖 AI Copilot Session Start
app.post('/api/ai/copilot/session/start', (req, res) => {
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

// 🤖 AI Copilot Chat (Mock Response)
app.post('/api/ai/copilot/chat', (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    console.log('🤖 AI Copilot chat called:', { message, sessionId });
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
        message: 'Please provide a message'
      });
    }
    
    // Mock AI response
    const mockResponse = `I understand you want to "${message}". Here's a professional Angular component example:

\`\`\`typescript
@Component({
  selector: 'app-example',
  template: \`
    <button class="btn btn-primary" (click)="handleClick()">
      {{ buttonText }}
    </button>
  \`,
  styles: [\`
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover {
      background: #5a6fd8;
      transform: translateY(-1px);
    }
  \`]
})
export class ExampleComponent {
  buttonText = 'Click Me';
  
  handleClick() {
    console.log('Button clicked!');
  }
}
\`\`\`

This component follows Angular best practices with proper TypeScript typing, modern styling, and responsive design.`;
    
    res.json({
      success: true,
      data: {
        message: mockResponse,
        sessionId: sessionId || `session_${Date.now()}`,
        tokensUsed: 150,
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

// Start server
app.listen(PORT, () => {
  console.log('🌟 ================================');
  console.log('🚀 SIMPLE TEST SERVER RUNNING!');
  console.log('🌟 ================================');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`👥 Users: http://localhost:${PORT}/api/admin/users`);
  console.log(`📊 Stats: http://localhost:${PORT}/api/admin/stats`);
  console.log(`🤖 AI Chat: POST http://localhost:${PORT}/api/ai/copilot/chat`);
  console.log('🌟 ================================');
  console.log(`👑 Admin Users: ${mockUsers.filter(u => u.role === 'admin').length}`);
  console.log(`👥 Total Users: ${mockUsers.length}`);
  console.log('✅ Ready for admin testing!');
  console.log('🌟 ================================');
});
