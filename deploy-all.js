const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting SEQUENTIAL Frontuna Deployment...');
console.log('⏰ This will deploy backend first, wait, then frontend to avoid conflicts\n');

async function sleep(seconds) {
  console.log(`⏳ Waiting ${seconds} seconds before next deployment...`);
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function deploySequentially() {
  try {
    // Step 1: Deploy Backend API
    console.log('📦 STEP 1: Deploying Backend API (frontuna-api)...');
    console.log('📍 Location: backend/');
    
    const backendResult = execSync('node deploy.js', { 
      encoding: 'utf8', 
      cwd: path.join(__dirname, 'backend')
    });
    console.log(backendResult);
    console.log('✅ Backend deployment completed!\n');

    // Wait between deployments
    await sleep(10);

    // Step 2: Deploy Frontend
    console.log('📦 STEP 2: Deploying Frontend (frontuna-frontend-app)...');
    console.log('📍 Location: frontend/');
    
    process.chdir(path.join(__dirname, 'frontend'));
    const frontendResult = execSync('vercel --prod --force --yes', { encoding: 'utf8' });
    console.log(frontendResult);

    // Extract frontend deployment URL
    const urlMatch = frontendResult.match(/https:\/\/frontuna-frontend-app-[a-z0-9]+-frontunas-projects-11c7fb14\.vercel\.app/);
    if (urlMatch) {
      const deploymentUrl = urlMatch[0];
      console.log(`✅ Frontend deployed: ${deploymentUrl}`);

      // Wait before alias update
      await sleep(5);

      // Update www.frontuna.com alias
      console.log('🔗 Updating www.frontuna.com alias...');
      execSync(`vercel alias set ${deploymentUrl} www.frontuna.com --yes`, { encoding: 'utf8' });
      console.log(`> Success! https://www.frontuna.com now points to ${deploymentUrl}`);
    }

    console.log('\n🎉 SEQUENTIAL DEPLOYMENT COMPLETE!');
    console.log('✅ Backend: https://frontuna-api.vercel.app');
    console.log('✅ Frontend: https://www.frontuna.com');
    console.log('\n🔐 Authentication system is now live and ready for testing!');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploySequentially();
