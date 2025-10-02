// 🧪 Test Admin Login with New API
const https = require('https');

console.log('🔐 Testing Admin Login with New API...');
console.log('');

const NEW_API_BASE = 'frontuna-65f6ckcgq-frontunas-projects-11c7fb14.vercel.app';

async function testLogin() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email: 'admin@frontuna.com',
      password: 'admin123'
    });

    const options = {
      hostname: NEW_API_BASE,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 15000
    };

    console.log(`🧪 Testing login to: https://${NEW_API_BASE}/api/auth/login`);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Login Response: ${res.statusCode} ${res.statusMessage}`);
        
        try {
          const parsed = JSON.parse(data);
          if (parsed.success && parsed.token) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log(`👤 User: ${parsed.user.email} (${parsed.user.role})`);
            console.log(`🔑 Token: ${parsed.token.substring(0, 20)}...`);
            console.log('');
            console.log('🎉 NEW API IS WORKING PERFECTLY!');
            console.log('✅ Authentication system operational');
            console.log('✅ Database connection working');
            console.log('✅ JWT tokens being generated');
          } else {
            console.log('❌ Login failed:', parsed.error || 'Unknown error');
          }
        } catch (e) {
          console.log('❌ Invalid JSON response:', data);
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Login test failed: ${error.message}`);
      resolve();
    });

    req.on('timeout', () => {
      console.log(`⏰ Login test timeout`);
      req.destroy();
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

testLogin();
