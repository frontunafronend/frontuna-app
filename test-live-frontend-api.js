// 🧪 Test what API URL the live frontend is actually using
const https = require('https');

console.log('🔍 Testing Live Frontend API Configuration...');
console.log('');

async function testLiveFrontend() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.frontuna.com',
      path: '/',
      method: 'GET',
      timeout: 15000
    };

    console.log('🌐 Fetching live frontend to check API configuration...');
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Frontend Response: ${res.statusCode} ${res.statusMessage}`);
        
        // Look for API URL in the response
        const oldApiMatch = data.match(/frontuna-65f6ckcgq-frontunas-projects-11c7fb14\.vercel\.app/);
        const newApiMatch = data.match(/frontuna-eas4on0jd-frontunas-projects-11c7fb14\.vercel\.app/);
        
        console.log('');
        console.log('🔍 API URL Analysis:');
        
        if (oldApiMatch) {
          console.log('❌ PROBLEM: Frontend still using OLD API URL');
          console.log('   Old API: frontuna-65f6ckcgq-frontunas-projects-11c7fb14.vercel.app');
          console.log('   Status: 503 Service Unavailable');
          console.log('');
          console.log('🔧 SOLUTION NEEDED:');
          console.log('   - Frontend deployment needs to be updated');
          console.log('   - GitHub auto-deployment may not have triggered');
          console.log('   - Manual deployment may be required');
        }
        
        if (newApiMatch) {
          console.log('✅ GOOD: Frontend using NEW API URL');
          console.log('   New API: frontuna-eas4on0jd-frontunas-projects-11c7fb14.vercel.app');
          console.log('   Status: Should be working');
        }
        
        if (!oldApiMatch && !newApiMatch) {
          console.log('⚠️  Could not detect API URL in frontend source');
          console.log('   This might be due to build optimization');
        }
        
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('1. Check Vercel dashboard for deployment status');
        console.log('2. Trigger manual deployment if auto-deploy failed');
        console.log('3. Verify GitHub webhook is working');
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Frontend test failed: ${error.message}`);
      resolve();
    });

    req.on('timeout', () => {
      console.log(`⏰ Frontend test timeout`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

testLiveFrontend();
