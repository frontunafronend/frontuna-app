// Quick test to verify Angular is using the correct API
const https = require('https');

console.log('🧪 Testing Angular API Configuration...');
console.log('');

// Test the endpoints that Angular should be calling
const API_BASE = 'frontuna-ble8qc5m1-frontunas-projects-11c7fb14.vercel.app';

function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: API_BASE,
      path: path,
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:4201'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ ${description}: ${res.statusCode}`);
      resolve(res.statusCode);
    });

    req.on('error', (e) => {
      console.log(`❌ ${description}: ${e.message}`);
      resolve(null);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔗 Testing API endpoints that Angular should use:');
  console.log(`📍 API Base: https://${API_BASE}`);
  console.log('');
  
  await testEndpoint('/health', 'Health Check');
  await testEndpoint('/api/health', 'API Health Check');
  await testEndpoint('/api/auth/profile', 'Profile Endpoint (should be 401)');
  
  console.log('');
  console.log('🎯 If Angular is configured correctly, it should make calls to these endpoints.');
  console.log('📊 Check the Network tab in your browser at http://localhost:4201');
  console.log('🔍 Look for API calls to:', `https://${API_BASE}`);
}

runTests();
