// Simple test script for local API
const http = require('http');

console.log('🧪 Testing Local API...');

// Test health endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📊 Response:', data);
    try {
      const json = JSON.parse(data);
      console.log('🎯 Parsed:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('⚠️ Not JSON:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.end();
