#!/usr/bin/env node

/**
 * Simple deployment script to ensure stable API deployments
 * This script deploys the simple-test-server.js which we know works reliably
 */

const { execSync } = require('child_process');

console.log('🚀 Starting stable API deployment...');

try {
  // Deploy using the simple server configuration
  console.log('📦 Deploying secure TypeScript backend with Neon DB...');
  const result = execSync('vercel --prod --force', { encoding: 'utf8' });
  console.log(result);
  
  // Extract the deployment URL from the output
  const urlMatch = result.match(/https:\/\/frontuna-[a-z0-9]+-frontunas-projects-11c7fb14\.vercel\.app/);
  
  if (urlMatch) {
    const deploymentUrl = urlMatch[0];
    console.log(`✅ Deployment successful: ${deploymentUrl}`);
    
    // Update the alias to point to the new deployment
    console.log('🔗 Updating frontuna-api.vercel.app alias...');
    const aliasResult = execSync(`vercel alias set ${deploymentUrl} frontuna-api.vercel.app`, { encoding: 'utf8' });
    console.log(aliasResult);
    
    console.log('🎉 Deployment complete! API is live at https://frontuna-api.vercel.app');
  } else {
    console.error('❌ Could not extract deployment URL from output');
  }
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
