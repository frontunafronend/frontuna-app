// 🔍 Test API Deployment Status
const https = require('https');

console.log('🔍 Testing API Deployment Status...');
console.log('');

const API_BASE = 'frontuna-ble8qc5m1-frontunas-projects-11c7fb14.vercel.app';

async function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: API_BASE,
      path: path,
      method: 'GET',
      timeout: 15000,
      headers: {
        'User-Agent': 'Deployment-Test/1.0'
      }
    };

    console.log(`🧪 Testing ${description}...`);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${description}: ${res.statusCode} ${res.statusMessage}`);
        
        if (res.statusCode !== 200) {
          console.log(`📄 Response: ${data.substring(0, 200)}...`);
        }
        
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${description}: ${error.message}`);
      resolve({ error: error.message });
    });

    req.on('timeout', () => {
      console.log(`⏰ ${description}: Request timeout`);
      req.destroy();
      resolve({ error: 'Timeout' });
    });

    req.end();
  });
}

async function runTests() {
  console.log(`🎯 Testing API: https://${API_BASE}`);
  console.log('');
  
  const tests = [
    { path: '/health', desc: 'Health Check' },
    { path: '/api/health', desc: 'API Health' },
    { path: '/', desc: 'Root Endpoint' },
    { path: '/api/admin/users', desc: 'Admin Users (should be 401)' }
  ];
  
  for (const test of tests) {
    await testEndpoint(test.path, test.desc);
    console.log('');
  }
  
  console.log('🎯 Diagnosis:');
  console.log('- If all endpoints return errors, the API deployment failed');
  console.log('- If health checks work but others fail, it\'s a code issue');
  console.log('- If you get HTML responses, Vercel might be showing error pages');
  console.log('');
  console.log('💡 Next steps:');
  console.log('1. Check Vercel dashboard for deployment logs');
  console.log('2. Look for build errors or runtime errors');
  console.log('3. Check environment variables are set correctly');
}

runTests();
