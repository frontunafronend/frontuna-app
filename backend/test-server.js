/**
 * Simple test server to check if basic backend works
 */

const express = require('express');
const cors = require('cors');
const { createLogger } = require('./src/utils/logger');

const app = express();
const logger = createLogger('test-server');
const PORT = 3000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Test server is working!',
    timestamp: new Date().toISOString()
  });
});

// Test generator endpoint
app.post('/api/generate/component', (req, res) => {
  const { prompt, framework } = req.body;
  
  logger.info('Test generation request received', { prompt, framework });
  
  // Mock response
  res.json({
    success: true,
    data: {
      component: {
        id: `test_${Date.now()}`,
        name: 'TestComponent',
        description: 'A test component',
        code: {
          html: '<div class="test-component">Hello World</div>',
          css: '.test-component { padding: 1rem; border: 1px solid #ccc; }',
          js: 'console.log("Test component loaded");'
        },
        framework,
        prompt
      }
    },
    message: 'Test component generated successfully'
  });
});

// Test usage endpoint
app.get('/api/generate/usage', (req, res) => {
  res.json({
    success: true,
    data: {
      usage: {
        generations: { used: 5, limit: 100, remaining: 95 },
        storage: { used: 1024, limit: 10485760, remaining: 10484736 }
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Test server running on port ${PORT}`);
  console.log(`✅ Test server ready at http://localhost:${PORT}`);
  console.log(`🧪 Test endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`   - POST http://localhost:${PORT}/api/generate/component`);
  console.log(`   - GET  http://localhost:${PORT}/api/generate/usage`);
});

module.exports = app;