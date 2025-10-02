// 🧪 COMPLETE SYSTEM TEST - Professional API Testing
const https = require('https');

const API_BASE = 'frontuna-ble8qc5m1-frontunas-projects-11c7fb14.vercel.app';

// Test credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@frontuna.com',
  password: 'admin123'
};

const USER_CREDENTIALS = {
  email: 'john@example.com',
  password: 'password123'
};

// Make HTTP request helper
function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: API_BASE,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8080'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...');
  try {
    const result = await makeRequest('/health');
    if (result.status === 200 && result.data.status === 'ok') {
      console.log('✅ Health check passed');
      console.log(`   Database: ${result.data.database}`);
      console.log(`   Environment: ${result.data.environment}`);
      return true;
    } else {
      console.log('❌ Health check failed:', result.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testAdminLogin() {
  console.log('\n🔐 Testing Admin Login...');
  try {
    const result = await makeRequest('/api/auth/login', 'POST', ADMIN_CREDENTIALS);
    if (result.status === 200 && result.data.success && result.data.token) {
      console.log('✅ Admin login successful');
      console.log(`   User: ${result.data.user.email}`);
      console.log(`   Role: ${result.data.user.role}`);
      console.log(`   Token: ${result.data.token.substring(0, 20)}...`);
      return result.data.token;
    } else {
      console.log('❌ Admin login failed:', result.status, result.data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.message);
    return null;
  }
}

async function testUserLogin() {
  console.log('\n👤 Testing User Login...');
  try {
    const result = await makeRequest('/api/auth/login', 'POST', USER_CREDENTIALS);
    if (result.status === 200 && result.data.success && result.data.token) {
      console.log('✅ User login successful');
      console.log(`   User: ${result.data.user.email}`);
      console.log(`   Role: ${result.data.user.role}`);
      return result.data.token;
    } else {
      console.log('❌ User login failed:', result.status, result.data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ User login error:', error.message);
    return null;
  }
}

async function testAdminEndpoints(token) {
  console.log('\n👑 Testing Admin Endpoints...');
  
  // Test admin users endpoint
  try {
    const result = await makeRequest('/api/admin/users', 'GET', null, token);
    if (result.status === 200 && result.data.success && result.data.data.users) {
      console.log('✅ Admin users endpoint working');
      console.log(`   Total users: ${result.data.data.users.length}`);
      return true;
    } else {
      console.log('❌ Admin users endpoint failed:', result.status);
      console.log('   Response:', JSON.stringify(result.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Admin users endpoint error:', error.message);
    return false;
  }
}

async function testProtectedEndpoints(token) {
  console.log('\n🔒 Testing Protected Endpoints...');
  
  // Test profile endpoint
  try {
    const result = await makeRequest('/api/auth/profile', 'GET', null, token);
    if (result.status === 200 && result.data.success && result.data.data.user) {
      console.log('✅ Profile endpoint working');
      console.log(`   User: ${result.data.data.user.email}`);
      return true;
    } else {
      console.log('❌ Profile endpoint failed:', result.status);
      console.log('   Response:', JSON.stringify(result.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Profile endpoint error:', error.message);
    return false;
  }
}

// Main test runner
async function runCompleteSystemTest() {
  console.log('🚀 FRONTUNA COMPLETE SYSTEM TEST');
  console.log('='.repeat(50));
  console.log(`🔗 API Base: https://${API_BASE}`);
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Health Check
  totalTests++;
  if (await testHealthEndpoint()) passedTests++;
  
  // Test 2: Admin Login
  totalTests++;
  const adminToken = await testAdminLogin();
  if (adminToken) passedTests++;
  
  // Test 3: User Login
  totalTests++;
  const userToken = await testUserLogin();
  if (userToken) passedTests++;
  
  // Test 4: Admin Endpoints (if admin login worked)
  if (adminToken) {
    totalTests++;
    if (await testAdminEndpoints(adminToken)) passedTests++;
  }
  
  // Test 5: Protected Endpoints (if user login worked)
  if (userToken) {
    totalTests++;
    if (await testProtectedEndpoints(userToken)) passedTests++;
  }
  
  // Results
  console.log('\n📊 TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! System is fully functional!');
    console.log('\n🌐 Your system is ready:');
    console.log(`   📊 Admin Dashboard: http://localhost:8080/admin`);
    console.log(`   🧪 API Test Page: http://localhost:8080/test`);
    console.log(`   🚀 Live Frontend: https://frontend-n1lcs5adh-frontunas-projects-11c7fb14.vercel.app`);
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
  
  return passedTests === totalTests;
}

// Run the tests
runCompleteSystemTest().catch(console.error);
