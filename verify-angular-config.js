// Verify Angular environment configuration
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Angular Environment Configuration...');
console.log('');

// Read the environment file
const envPath = path.join(__dirname, 'frontend/src/environments/environment.ts');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('📄 Current environment.ts content:');
console.log('='.repeat(50));

// Extract the apiUrl line
const apiUrlMatch = envContent.match(/apiUrl:\s*['"`]([^'"`]+)['"`]/);
if (apiUrlMatch) {
  console.log(`✅ API URL: ${apiUrlMatch[1]}`);
} else {
  console.log('❌ API URL not found');
}

// Check if it's pointing to the correct live API
const expectedAPI = 'https://frontuna-ble8qc5m1-frontunas-projects-11c7fb14.vercel.app/api';
if (apiUrlMatch && apiUrlMatch[1] === expectedAPI) {
  console.log('✅ Configuration is CORRECT - pointing to live API');
} else {
  console.log('❌ Configuration is INCORRECT');
  console.log(`   Expected: ${expectedAPI}`);
  console.log(`   Found: ${apiUrlMatch ? apiUrlMatch[1] : 'Not found'}`);
}

console.log('');
console.log('🎯 Expected behavior after restart:');
console.log('   - Angular should make API calls to the live API');
console.log('   - Console should show real user data instead of NULL');
console.log('   - Network tab should show calls to frontuna-ble8qc5m1-frontunas-projects-11c7fb14.vercel.app');
console.log('');
console.log('📊 Compare with test pages:');
console.log('   - Test page: http://localhost:8080/test (working)');
console.log('   - Angular app: http://localhost:4201 (should work now)');
