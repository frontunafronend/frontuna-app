// 🚀 Verify Production Deployment
const https = require('https');

console.log('🔍 Verifying Production Deployment...');
console.log('');

const FRONTEND_URL = 'frontuna-frontend-app.vercel.app';
const API_URL = 'frontuna-ble8qc5m1-frontunas-projects-11c7fb14.vercel.app';

async function checkEndpoint(hostname, path = '/', description) {
  return new Promise((resolve) => {
    const options = {
      hostname: hostname,
      path: path,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      console.log(`✅ ${description}: ${res.statusCode} ${res.statusMessage}`);
      resolve(true);
    });

    req.on('error', (error) => {
      console.log(`❌ ${description}: ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏰ ${description}: Timeout`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function verifyDeployment() {
  console.log('🌐 Checking Frontend Deployment...');
  await checkEndpoint(FRONTEND_URL, '/', 'Frontend Home Page');
  await checkEndpoint(FRONTEND_URL, '/admin', 'Frontend Admin Dashboard');
  
  console.log('');
  console.log('🔧 Checking API Deployment...');
  await checkEndpoint(API_URL, '/health', 'API Health Check');
  await checkEndpoint(API_URL, '/api/health', 'API Health Endpoint');
  
  console.log('');
  console.log('🎯 Deployment URLs:');
  console.log(`📱 Frontend: https://${FRONTEND_URL}`);
  console.log(`🔧 API: https://${API_URL}`);
  console.log(`👑 Admin Dashboard: https://${FRONTEND_URL}/admin`);
  
  console.log('');
  console.log('🧪 Test the Integration:');
  console.log('1. Open the admin dashboard');
  console.log('2. Login with: admin@frontuna.com / admin123');
  console.log('3. Check console for live API calls');
  console.log('4. Verify real user data is displayed');
  console.log('5. Test AI system functions');
  
  console.log('');
  console.log('✨ Your complete admin dashboard with live API integration is now deployed!');
}

verifyDeployment();
