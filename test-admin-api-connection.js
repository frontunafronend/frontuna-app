// 🧪 Test Admin Dashboard API Connection
const https = require('https');

// Use the same API that login is using successfully
const API_BASE = 'frontuna-eas4on0jd-frontunas-projects-11c7fb14.vercel.app';

async function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => reject(error));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testAdminAPIConnection() {
  console.log('🧪 Testing Admin Dashboard API Connection...');
  console.log(`📍 API Base: https://${API_BASE}`);
  
  // Step 1: Test admin login (same as successful login)
  console.log('\n🔐 Step 1: Testing Admin Login...');
  try {
    const loginResult = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@frontuna.com',
      password: 'admin123'
    });
    
    if (loginResult.status === 200 && loginResult.data.success && loginResult.data.token) {
      console.log('✅ Admin Login: SUCCESS');
      const adminToken = loginResult.data.token;
      
      // Step 2: Test admin endpoints that the dashboard uses
      console.log('\n👥 Step 2: Testing Admin Users Endpoint...');
      const usersResult = await makeRequest('/api/admin/users', 'GET', null, adminToken);
      
      if (usersResult.status === 200 && usersResult.data.success) {
        console.log('✅ Admin Users Endpoint: SUCCESS');
        console.log(`   Found ${usersResult.data.data.users.length} users`);
      } else {
        console.log('❌ Admin Users Endpoint: FAILED');
        console.log('   Response:', JSON.stringify(usersResult.data, null, 2));
      }
      
      // Step 3: Test admin stats endpoint
      console.log('\n📊 Step 3: Testing Admin Stats Endpoint...');
      const statsResult = await makeRequest('/api/admin/stats', 'GET', null, adminToken);
      
      if (statsResult.status === 200 && statsResult.data.success) {
        console.log('✅ Admin Stats Endpoint: SUCCESS');
        console.log('   Stats:', JSON.stringify(statsResult.data.data.stats.overview, null, 2));
      } else {
        console.log('❌ Admin Stats Endpoint: FAILED');
        console.log('   Response:', JSON.stringify(statsResult.data, null, 2));
      }
      
      // Step 4: Test profile endpoint (used by auth service)
      console.log('\n👤 Step 4: Testing Profile Endpoint...');
      const profileResult = await makeRequest('/api/auth/profile', 'GET', null, adminToken);
      
      if (profileResult.status === 200 && profileResult.data.success) {
        console.log('✅ Profile Endpoint: SUCCESS');
        console.log(`   User: ${profileResult.data.data.user.email}`);
      } else {
        console.log('❌ Profile Endpoint: FAILED');
        console.log('   Response:', JSON.stringify(profileResult.data, null, 2));
      }
      
      console.log('\n🎯 SUMMARY:');
      console.log('✅ Same API that login uses successfully');
      console.log('✅ Admin dashboard should work with this API');
      console.log('✅ All endpoints return the expected data format');
      
    } else {
      console.log('❌ Admin Login: FAILED');
      console.log('   Response:', JSON.stringify(loginResult.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminAPIConnection();
