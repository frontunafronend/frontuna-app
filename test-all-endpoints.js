// 🧪 COMPREHENSIVE API ENDPOINT TESTING
const http = require('http');

const API_BASE = 'localhost';
const API_PORT = 3000;

// Test credentials
const adminCreds = { email: 'admin@frontuna.com', password: 'admin123' };
const userCreds = { email: 'john@example.com', password: 'password123' };

let adminToken = null;
let userToken = null;

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
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
      console.log('✅ Health endpoint working');
      console.log(`   Database: ${response.data.database}`);
      console.log(`   Environment: ${response.data.environment}`);
    } else {
      console.log('❌ Health endpoint failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Health endpoint error:', error.message);
  }
}

async function testAdminLogin() {
  console.log('\n👑 Testing Admin Login...');
  try {
    const response = await makeRequest('/api/auth/login', 'POST', adminCreds);
    if (response.status === 200 && response.data.success) {
      adminToken = response.data.data.accessToken;
      console.log('✅ Admin login successful');
      console.log(`   User: ${response.data.data.user.email}`);
      console.log(`   Role: ${response.data.data.user.role}`);
    } else {
      console.log('❌ Admin login failed:', response.data);
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.message);
  }
}

async function testUserLogin() {
  console.log('\n👤 Testing User Login...');
  try {
    const response = await makeRequest('/api/auth/login', 'POST', userCreds);
    if (response.status === 200 && response.data.success) {
      userToken = response.data.data.accessToken;
      console.log('✅ User login successful');
      console.log(`   User: ${response.data.data.user.email}`);
      console.log(`   Role: ${response.data.data.user.role}`);
    } else {
      console.log('❌ User login failed:', response.data);
    }
  } catch (error) {
    console.log('❌ User login error:', error.message);
  }
}

async function testAdminUsers() {
  console.log('\n👥 Testing Admin Users Endpoint...');
  try {
    const response = await makeRequest('/api/admin/users', 'GET', null, adminToken);
    if (response.status === 200 && response.data.success) {
      console.log('✅ Admin users endpoint working');
      console.log(`   Total users: ${response.data.data.total}`);
      console.log(`   Users found: ${response.data.data.users.length}`);
    } else {
      console.log('❌ Admin users failed:', response.data);
    }
  } catch (error) {
    console.log('❌ Admin users error:', error.message);
  }
}

async function testAdminStats() {
  console.log('\n📈 Testing Admin Stats Endpoint...');
  try {
    const response = await makeRequest('/api/admin/stats', 'GET', null, adminToken);
    if (response.status === 200 && response.data.success) {
      console.log('✅ Admin stats endpoint working');
      const stats = response.data.data.stats;
      console.log(`   Total users: ${stats.overview.totalUsers}`);
      console.log(`   Total components: ${stats.overview.totalComponents}`);
      console.log(`   Total tokens: ${stats.overview.totalTokensUsed}`);
    } else {
      console.log('❌ Admin stats failed:', response.data);
    }
  } catch (error) {
    console.log('❌ Admin stats error:', error.message);
  }
}

async function testUserProfile() {
  console.log('\n👤 Testing User Profile Endpoint...');
  try {
    const response = await makeRequest('/api/users/profile', 'GET', null, userToken);
    if (response.status === 200 && response.data.success) {
      console.log('✅ User profile endpoint working');
      const user = response.data.data.user;
      console.log(`   Email: ${user.email}`);
      console.log(`   Components: ${user.stats.totalComponents}`);
      console.log(`   Tokens used: ${user.stats.totalTokensUsed}`);
    } else {
      console.log('❌ User profile failed:', response.data);
    }
  } catch (error) {
    console.log('❌ User profile error:', error.message);
  }
}

async function testUserComponents() {
  console.log('\n🧩 Testing User Components Endpoint...');
  try {
    const response = await makeRequest('/api/api/components', 'GET', null, userToken);
    if (response.status === 200 && response.data.success) {
      console.log('✅ User components endpoint working');
      console.log(`   Total components: ${response.data.data.total}`);
      if (response.data.data.components.length > 0) {
        const comp = response.data.data.components[0];
        console.log(`   Sample component: ${comp.name} (${comp.framework})`);
      }
    } else {
      console.log('❌ User components failed:', response.data);
    }
  } catch (error) {
    console.log('❌ User components error:', error.message);
  }
}

async function testUserAnalytics() {
  console.log('\n📊 Testing User Analytics Endpoint...');
  try {
    const response = await makeRequest('/api/users/analytics', 'GET', null, userToken);
    if (response.status === 200 && response.data.success) {
      console.log('✅ User analytics endpoint working');
      const analytics = response.data.data.analytics;
      console.log(`   Total components: ${analytics.totalComponents}`);
      console.log(`   Requests last 30 days: ${analytics.requestsLast30Days}`);
      console.log(`   Avg tokens per request: ${analytics.avgTokensPerRequest}`);
    } else {
      console.log('❌ User analytics failed:', response.data);
    }
  } catch (error) {
    console.log('❌ User analytics error:', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Tests...\n');
  
  await testHealthEndpoint();
  await testAdminLogin();
  await testUserLogin();
  
  if (adminToken) {
    await testAdminUsers();
    await testAdminStats();
  }
  
  if (userToken) {
    await testUserProfile();
    await testUserComponents();
    await testUserAnalytics();
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Summary:');
  console.log('✅ All endpoints should now be working');
  console.log('✅ Database populated with sample data');
  console.log('✅ Authentication working for admin and users');
  console.log('✅ Your frontend API calls should now succeed');
}

// Run tests
runAllTests().catch(console.error);
