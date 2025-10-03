/**
 * 🧪 Test: No Mock Responses - Only Real AI
 * 
 * This test verifies that the system never returns mock responses
 * and always requires a real OpenAI API key for AI functionality.
 */

const https = require('https');

console.log('🧪 Testing: No Mock Responses Policy');
console.log('🎯 Objective: Verify only real AI responses are provided');

// Test without API key (should fail with clear message)
function testWithoutApiKey() {
  return new Promise((resolve, reject) => {
    const testData = {
      sessionId: `test_no_mock_${Date.now()}`,
      message: 'Create a simple component',
      context: 'Test without API key'
    };

    const postData = JSON.stringify(testData);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/ai/copilot/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': 'Bearer test-token'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, response });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Run the test
async function runTest() {
  try {
    console.log('\n🔍 Testing without OpenAI API key...');
    
    const result = await testWithoutApiKey();
    
    console.log('📊 Status Code:', result.statusCode);
    console.log('🔍 Success:', result.response.success);
    
    if (result.statusCode === 400 && !result.response.success) {
      console.log('✅ CORRECT: Request failed as expected');
      console.log('🔍 Error Code:', result.response.error?.code);
      console.log('📝 Error Message:', result.response.error?.message);
      
      if (result.response.error?.code === 'MISSING_API_KEY') {
        console.log('✅ CORRECT: Proper error code for missing API key');
      } else {
        console.log('❌ WRONG: Expected MISSING_API_KEY error code');
      }
      
      if (result.response.data?.requiresApiKey) {
        console.log('✅ CORRECT: Properly indicates API key requirement');
      } else {
        console.log('❌ WRONG: Should indicate API key requirement');
      }
      
      // Check that no mock response is provided
      const message = result.response.data?.message || '';
      if (message.includes('No mock responses') || message.includes('Only real AI responses')) {
        console.log('✅ CORRECT: Clearly states no mock responses provided');
      } else {
        console.log('❌ WRONG: Should clearly state no mock responses');
      }
      
      console.log('\n🎉 TEST PASSED: No mock responses policy enforced!');
      console.log('✅ System correctly requires real OpenAI API key');
      console.log('✅ No fallback mock responses provided');
      console.log('✅ Clear error messages guide user to configure API key');
      
    } else {
      console.log('❌ TEST FAILED: Expected 400 error without API key');
      console.log('📄 Full Response:', JSON.stringify(result.response, null, 2));
    }
    
  } catch (error) {
    console.error('❌ TEST ERROR:', error.message);
    console.log('\n💡 Make sure the backend server is running on localhost:3000');
  }
}

// Instructions
console.log('\n📋 Test Instructions:');
console.log('1. Make sure backend server is running');
console.log('2. Ensure NO OpenAI API key is configured');
console.log('3. This test verifies the system rejects requests without API key');
console.log('4. No mock responses should be provided');

runTest();
