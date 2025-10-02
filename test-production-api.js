// 🧪 PRODUCTION API TESTING SCRIPT
const https = require('https');

const PRODUCTION_API = 'frontuna-bwub47a6t-frontunas-projects-11c7fb14.vercel.app';

console.log('🚀 Testing Production API Deployment...');
console.log(`🔗 API URL: https://${PRODUCTION_API}`);
console.log('');

// Helper function to make HTTPS requests
function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: PRODUCTION_API,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Frontuna-Test-Client/1.0',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData, headers: res.headers });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('🏥 Testing Health Endpoint...');
  try {
    const response = await makeRequest('/health');
    if (response.status === 200) {
      console.log('✅ Health endpoint working!');
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Database: ${response.data.database}`);
      console.log(`   Environment: ${response.data.environment}`);
      console.log(`   Version: ${response.data.version}`);
      return true;
    } else {
      console.log(`❌ Health endpoint failed: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Health endpoint error: ${error.message}`);
    return false;
  }
}

async function testLoginEndpoint() {
  console.log('\n🔐 Testing Login Endpoint...');
  try {
    const loginData = {
      email: 'admin@frontuna.com',
      password: 'admin123'
    };
    
    const response = await makeRequest('/api/auth/login', 'POST', loginData);
    if (response.status === 200 && response.data.success) {
      console.log('✅ Login endpoint working!');
      console.log(`   User: ${response.data.data.user.email}`);
      console.log(`   Role: ${response.data.data.user.role}`);
      console.log(`   Token received: ${response.data.data.accessToken ? 'Yes' : 'No'}`);
      return response.data.data.accessToken;
    } else {
      console.log(`❌ Login failed: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Login error: ${error.message}`);
    return null;
  }
}

async function testAdminEndpoint(token) {
  console.log('\n👑 Testing Admin Endpoint...');
  try {
    const response = await makeRequest('/api/admin/users', 'GET', null, token);
    if (response.status === 200 && response.data.success) {
      console.log('✅ Admin endpoint working!');
      console.log(`   Total users: ${response.data.data.total}`);
      console.log(`   Users found: ${response.data.data.users.length}`);
      return true;
    } else {
      console.log(`❌ Admin endpoint failed: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Admin endpoint error: ${error.message}`);
    return false;
  }
}

async function testAllEndpoints() {
  console.log('🧪 Running Production API Tests...\n');
  
  let results = {
    health: false,
    login: false,
    admin: false,
    token: null
  };
  
  // Test health endpoint
  results.health = await testHealthEndpoint();
  
  // Test login endpoint
  results.token = await testLoginEndpoint();
  results.login = !!results.token;
  
  // Test admin endpoint (if login worked)
  if (results.token) {
    results.admin = await testAdminEndpoint(results.token);
  }
  
  // Summary
  console.log('\n📊 TEST RESULTS SUMMARY:');
  console.log('========================');
  console.log(`🏥 Health Endpoint: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔐 Login Endpoint: ${results.login ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`👑 Admin Endpoint: ${results.admin ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(r => r === true).length;
  const totalTests = 3;
  
  console.log(`\n🎯 Overall: ${passCount}/${totalTests} tests passed`);
  
  if (passCount === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Your production API is working perfectly!');
    console.log('✅ Ready for frontend integration');
    console.log('✅ Database connection successful');
    console.log('✅ Authentication system functional');
    console.log('✅ Admin features working');
  } else {
    console.log('\n⚠️ Some tests failed. Check the following:');
    console.log('1. Environment variables set in Vercel dashboard');
    console.log('2. Database connection string is correct');
    console.log('3. JWT_SECRET is configured');
    console.log('4. Admin user exists in database');
  }
  
  console.log(`\n🔗 Production API URL: https://${PRODUCTION_API}`);
  console.log('🎯 Next steps: Update your frontend to use this API URL');
}

// Run all tests
testAllEndpoints().catch(console.error);
