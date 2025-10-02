// Verify Angular hardcoded localhost fix
const fs = require('fs');
const path = require('path');

console.log('🔧 Verifying Angular Localhost Fix...');
console.log('');

const filesToCheck = [
  'frontend/src/app/services/core/environment.service.ts',
  'frontend/src/app/pages/admin/admin-dashboard.component.ts',
  'frontend/src/app/services/config/environment-config.service.ts'
];

let allFixed = true;

filesToCheck.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    console.log(`📄 Checking: ${filePath}`);
    
    // Check for hardcoded localhost:3000
    if (content.includes('localhost:3000')) {
      console.log(`❌ Still contains hardcoded localhost:3000`);
      allFixed = false;
    } else {
      console.log(`✅ No hardcoded localhost:3000 found`);
    }
    
    // Check for proper environment usage
    if (content.includes('environment.apiUrl') || content.includes('environmentService.apiUrl')) {
      console.log(`✅ Uses environment configuration`);
    }
    
    console.log('');
  }
});

console.log('🎯 SUMMARY:');
if (allFixed) {
  console.log('✅ ALL HARDCODED LOCALHOST:3000 REFERENCES FIXED!');
  console.log('');
  console.log('📊 Expected behavior:');
  console.log('   - Angular should now use live API: https://frontuna-ble8qc5m1-frontunas-projects-11c7fb14.vercel.app/api');
  console.log('   - Network tab should show calls to the live API');
  console.log('   - Console should show real user data instead of NULL');
  console.log('   - Authentication should work with real JWT tokens');
} else {
  console.log('❌ Some hardcoded references still exist');
}

console.log('');
console.log('🌐 Test URLs:');
console.log('   - Angular App: http://localhost:4201');
console.log('   - Test Page: http://localhost:8080/test');
console.log('   - Admin Dashboard: http://localhost:8080/admin');
