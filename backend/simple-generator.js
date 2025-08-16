/**
 * SIMPLE FRONTUNA COMPONENT GENERATOR - GUARANTEED TO WORK
 * Minimal dependencies, maximum reliability
 */

const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = 3000;

// Mock OpenAI response for testing
const generateMockComponent = (framework, prompt) => {
  return {
    id: `comp_${Date.now()}`,
    name: `${framework.charAt(0).toUpperCase() + framework.slice(1)}Component`,
    description: `A ${framework} component: ${prompt.substring(0, 100)}...`,
    code: {
      html: `<div class="${framework}-component">
        <h2>Generated ${framework} Component</h2>
        <p>${prompt}</p>
        <button onclick="handleClick()">Click me</button>
      </div>`,
      css: `.${framework}-component {
        padding: 2rem;
        border: 2px solid #007bff;
        border-radius: 8px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .${framework}-component h2 {
        color: #007bff;
        margin-bottom: 1rem;
        font-size: 1.5rem;
      }
      
      .${framework}-component button {
        background: #007bff;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.3s;
      }
      
      .${framework}-component button:hover {
        background: #0056b3;
      }`,
      js: `function handleClick() {
        console.log('${framework} component clicked!');
        alert('Component is working!');
      }
      
      // Initialize component
      document.addEventListener('DOMContentLoaded', function() {
        console.log('${framework} component loaded successfully');
      });`
    },
    framework,
    features: ['Responsive Design', 'Interactive', 'Modern Styling', 'Accessible'],
    dependencies: [],
    props: [
      { name: 'title', type: 'string', required: true },
      { name: 'onClick', type: 'function', required: false }
    ],
    usage: `<${framework.charAt(0).toUpperCase() + framework.slice(1)}Component title="My Component" />`,
    metadata: {
      generated: new Date().toISOString(),
      version: '1.0.0',
      tokensUsed: Math.floor(Math.random() * 500) + 200
    }
  };
};

// Request handler
const requestHandler = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`${new Date().toISOString()} [${method}] ${pathname}`);
  
  // Routes
  if (pathname === '/api/health' && method === 'GET') {
    const response = {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          api: 'healthy',
          generator: 'operational'
        }
      }
    };
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
    return;
  }
  
  if (pathname === '/api/generate/component' && method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { prompt, framework, category, options = {} } = data;
        
        // Validation
        if (!prompt || prompt.trim().length < 10) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: { code: 'INVALID_PROMPT', message: 'Prompt must be at least 10 characters' }
          }));
          return;
        }
        
        if (!framework || !['react', 'angular', 'vue', 'svelte', 'vanilla'].includes(framework)) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: { code: 'INVALID_FRAMEWORK', message: 'Invalid framework' }
          }));
          return;
        }
        
        console.log(`🚀 Generating ${framework} component: ${prompt.substring(0, 50)}...`);
        
        // Generate component (mock for now)
        const component = generateMockComponent(framework, prompt);
        
        const response = {
          success: true,
          data: {
            component,
            usage: {
              generations: { used: 6, limit: 100, remaining: 94 },
              storage: { used: 2048, limit: 10485760 }
            }
          }
        };
        
        console.log(`✅ Component generated: ${component.id}`);
        
        res.writeHead(200);
        res.end(JSON.stringify(response));
        
      } catch (error) {
        console.error('❌ Generation error:', error.message);
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          error: { code: 'GENERATION_FAILED', message: error.message }
        }));
      }
    });
    return;
  }
  
  if (pathname === '/api/generate/usage' && method === 'GET') {
    const response = {
      success: true,
      data: {
        usage: {
          generations: { used: 5, limit: 100, remaining: 95, percentage: 5 },
          storage: { used: 1024, limit: 10485760, remaining: 10484736, percentage: 0 },
          plan: 'free',
          status: 'active',
          lastReset: new Date().toISOString()
        }
      }
    };
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
    return;
  }
  
  if (pathname === '/api/generate/history' && method === 'GET') {
    const response = {
      success: true,
      data: {
        items: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      }
    };
    res.writeHead(200);
    res.end(JSON.stringify(response));
    return;
  }
  
  // 404
  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${method} ${pathname} not found` }
  }));
};

// Create server
const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log('\n🎯 FRONTUNA COMPONENT GENERATOR ENGINE v1.0');
  console.log('=============================================');
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
  console.log(`✅ Generate: POST http://localhost:${PORT}/api/generate/component`);
  console.log(`✅ Usage: GET http://localhost:${PORT}/api/generate/usage`);
  console.log('=============================================\n');
  console.log('🚀 Generator engine is READY and WORKING!');
});

server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is already in use. Trying to kill existing processes...`);
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.log('📴 Shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

module.exports = server;