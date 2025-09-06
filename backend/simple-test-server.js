/**
 * 🌟 SIMPLE TEST SERVER FOR ADMIN FUNCTIONALITY
 * This server works without database dependencies for testing
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 🔍 REQUEST LOGGING MIDDLEWARE - Debug all requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`🌐 [${timestamp}] ${req.method} ${req.url}`);
  console.log(`   Origin: ${req.headers.origin || 'No Origin'}`);
  console.log(`   User-Agent: ${req.headers['user-agent'] || 'No User-Agent'}`);
  console.log(`   Authorization: ${req.headers.authorization ? 'Present' : 'None'}`);
  console.log(`   Content-Type: ${req.headers['content-type'] || 'None'}`);
  next();
});

// 🔐 CORS MIDDLEWARE with detailed logging
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:4200', 
      'http://localhost:4201',
      'https://frontuna.com',
      'https://www.frontuna.com',
      'https://frontuna-frontend-app.vercel.app',
      'https://frontend-ow3k5ujpk-frontunas-projects-11c7fb14.vercel.app'
    ];
    
    console.log(`🔍 CORS Check - Origin: ${origin || 'No Origin'}`);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin allowed');
      callback(null, true);
    } else {
      console.log(`❌ CORS: Origin rejected - ${origin}`);
      console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error(`CORS policy violation: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

app.use(express.json());

// 🔐 AUTH GUARD MIDDLEWARE - Comprehensive authentication checking
const authGuard = (req, res, next) => {
  console.log('🔐 AUTH GUARD: Checking authentication...');
  
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  console.log(`   Token present: ${token ? 'Yes' : 'No'}`);
  
  if (!token) {
    console.log('❌ AUTH GUARD: No token provided');
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_MISSING',
        message: 'Access token is required'
      }
    });
  }
  
  // Mock token validation (in real app, verify JWT)
  if (token.startsWith('mock-access-token')) {
    console.log('✅ AUTH GUARD: Valid token');
    // Mock user data based on token
    req.user = {
      id: '1',
      email: 'admin@frontuna.com',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    };
    next();
  } else {
    console.log('❌ AUTH GUARD: Invalid token');
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid access token'
      }
    });
  }
};

// 👑 ADMIN GUARD MIDDLEWARE - Protect admin routes
const adminGuard = (req, res, next) => {
  console.log('👑 ADMIN GUARD: Checking admin permissions...');
  
  if (!req.user) {
    console.log('❌ ADMIN GUARD: No user in request');
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required'
      }
    });
  }
  
  console.log(`   User role: ${req.user.role}`);
  console.log(`   User email: ${req.user.email}`);
  
  if (req.user.role !== 'admin') {
    console.log('❌ ADMIN GUARD: Insufficient permissions');
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Admin access required'
      }
    });
  }
  
  console.log('✅ ADMIN GUARD: Admin access granted');
  next();
};

// 🔍 ROLE GUARD FACTORY - Create guards for specific roles
const roleGuard = (allowedRoles) => {
  return (req, res, next) => {
    console.log(`🔍 ROLE GUARD: Checking roles [${allowedRoles.join(', ')}]...`);
    
    if (!req.user) {
      console.log('❌ ROLE GUARD: No user in request');
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required'
        }
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      console.log(`❌ ROLE GUARD: Role '${req.user.role}' not in allowed roles`);
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
        }
      });
    }
    
    console.log(`✅ ROLE GUARD: Role '${req.user.role}' authorized`);
    next();
  };
};

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

// 👥 Get All Users (Admin Only) - PROTECTED ROUTE
app.get('/api/admin/users', authGuard, adminGuard, (req, res) => {
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

// 📊 Get Admin Statistics - PROTECTED ROUTE
app.get('/api/admin/stats', authGuard, adminGuard, (req, res) => {
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

// 🤖 AI Prompt Core Health Check
app.get('/api/ai/prompt/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ai-prompt-core'
  });
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

// 🔐 AUTH ENDPOINTS FOR LOCAL TESTING
app.post('/api/auth/signup', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: { code: 'USER_EXISTS', message: 'User already exists' }
    });
  }
  
  // Create new user
  const newUser = {
    id: String(mockUsers.length + 1),
    email,
    role: 'user',
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    joinedAt: new Date(),
    avatar: null,
    plan: 'basic',
    generationsUsed: 0,
    generationsLimit: 100,
    status: 'active',
    isActive: true,
    emailVerifiedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockUsers.push(newUser);
  
  // Return auth response
  res.json({
    success: true,
    data: {
      user: newUser,
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: 900 // 15 minutes
    },
    message: 'Signup successful'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = mockUsers.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
    });
  }
  
  // Return auth response
  res.json({
    success: true,
    data: {
      user,
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: 900 // 15 minutes
    },
    message: 'Login successful'
  });
});

app.post('/api/auth/refresh', (req, res) => {
  // Set httpOnly cookie for refresh token (secure auth feature)
  res.cookie('frt', 'mock-refresh-token-' + Date.now(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh',
    maxAge: 45 * 24 * 60 * 60 * 1000 // 45 days
  });
  
  res.json({
    success: true,
    data: {
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: 900 // 15 minutes
    },
    message: 'Token refreshed successfully'
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// 👤 Get User Profile - PROTECTED ROUTE
app.get('/api/auth/profile', authGuard, (req, res) => {
  // Return first user as mock profile
  const user = mockUsers[0];
  res.json({
    success: true,
    data: user
  });
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
  console.log(`🔐 Auth: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`🔐 Auth: POST http://localhost:${PORT}/api/auth/signup`);
  console.log('🌟 ================================');
  console.log(`👑 Admin Users: ${mockUsers.filter(u => u.role === 'admin').length}`);
  console.log(`👥 Total Users: ${mockUsers.length}`);
  console.log('✅ Ready for admin testing!');
  console.log('🌟 ================================');
});
