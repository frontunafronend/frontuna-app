// 🧪 Test New API Deployment
const https = require('https');

console.log('🔍 Testing New API Deployment...');
console.log('');

const NEW_API_BASE = 'frontuna-65f6ckcgq-frontunas-projects-11c7fb14.vercel.app';

async function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: NEW_API_BASE,
      path: path,
      method: 'GET',
      timeout: 15000,
      headers: {
        'User-Agent': 'New-Deployment-Test/1.0'
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
        
        if (res.statusCode === 200 && data) {
          try {
            const parsed = JSON.parse(data);
            console.log(`📄 Response: ${parsed.message || parsed.status || 'Success'}`);
          } catch (e) {
            console.log(`📄 Response: ${data.substring(0, 100)}...`);
          }
        } else if (res.statusCode !== 200) {
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
  console.log(`🎯 Testing NEW API: https://${NEW_API_BASE}`);
  console.log('');
  
  const tests = [
    { path: '/', desc: 'Root Endpoint (should work now!)' },
    { path: '/health', desc: 'Health Check' },
    { path: '/api/health', desc: 'API Health' },
    { path: '/api/admin/users', desc: 'Admin Users (should be 401)' },
    { path: '/api/auth/profile', desc: 'Auth Profile (should be 401)' }
  ];
  
  let allWorking = true;
  
  for (const test of tests) {
    const result = await testEndpoint(test.path, test.desc);
    if (result.error || (result.status !== 200 && result.status !== 401)) {
      allWorking = false;
    }
    console.log('');
  }
  
  console.log('🎯 Results:');
  if (allWorking) {
    console.log('✅ NEW API DEPLOYMENT IS WORKING!');
    console.log('🎉 The syntax fix has been successfully deployed!');
    console.log('');
    console.log('📱 Next step: Update frontend to use new API URL');
    console.log(`🔗 New API URL: https://${NEW_API_BASE}`);
  } else {
    console.log('❌ Some endpoints still have issues');
    console.log('🔍 Check Vercel logs for more details');
  }
}

runTests();
