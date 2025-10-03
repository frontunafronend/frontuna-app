/**
 * 🧪 AI Integration Test
 * 
 * Simple test to verify the AI Copilot integration is working properly
 */

const https = require('https');

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.API_URL || 'http://localhost:3000',
  testMessage: 'Create a simple Angular component',
  timeout: 30000
};

console.log('🧪 Testing AI Copilot Integration...');
console.log('📍 API URL:', TEST_CONFIG.baseUrl);
console.log('💬 Test Message:', TEST_CONFIG.testMessage);

// Mock authentication token (replace with real token in production)
const mockToken = 'test-token';

const testData = {
  sessionId: `test_${Date.now()}`,
  message: TEST_CONFIG.testMessage,
  context: 'Integration test',
  conversationHistory: [],
  continuePreviousConversation: false
};

const postData = JSON.stringify(testData);

const options = {
  hostname: new URL(TEST_CONFIG.baseUrl).hostname,
  port: new URL(TEST_CONFIG.baseUrl).port || (TEST_CONFIG.baseUrl.includes('https') ? 443 : 80),
  path: '/api/ai/copilot/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${mockToken}`,
    'Origin': 'http://localhost:4200'
  },
  timeout: TEST_CONFIG.timeout
};

console.log('\n🚀 Sending test request...');

const req = https.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      console.log('\n✅ Response received:');
      console.log('🔍 Success:', response.success);
      
      if (response.success && response.data) {
        console.log('💬 AI Message Length:', response.data.message?.length || 0);
        console.log('🤖 Model Used:', response.data.model);
        console.log('🔢 Tokens Used:', response.data.tokensUsed);
        console.log('⏱️ Response Time:', response.data.responseTime + 'ms');
        console.log('🔧 Has Code:', response.data.hasCode);
        
        if (response.data.code) {
          console.log('💻 Code Language:', response.data.code.language);
          console.log('📝 Code Length:', response.data.code.code?.length || 0);
        }
        
        if (response.data.requiresApiKey) {
          console.log('⚠️ OpenAI API Key Required - Using fallback mode');
        } else {
          console.log('🎯 Real OpenAI API integration working!');
        }
        
        console.log('\n🎉 AI Copilot integration test PASSED!');
      } else {
        console.log('❌ Error:', response.error);
        console.log('\n💥 AI Copilot integration test FAILED!');
      }
      
    } catch (error) {
      console.error('❌ JSON Parse Error:', error.message);
      console.log('📄 Raw Response:', data);
      console.log('\n💥 AI Copilot integration test FAILED!');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
  console.log('\n💥 AI Copilot integration test FAILED!');
});

req.on('timeout', () => {
  console.error('⏰ Request Timeout');
  req.destroy();
  console.log('\n💥 AI Copilot integration test FAILED!');
});

req.write(postData);
req.end();

console.log('⏳ Waiting for response...');
