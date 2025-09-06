const { execSync } = require('child_process');

console.log('🚀 Deploying Frontend to fix www.frontuna.com...');

try {
  // Deploy the frontend
  console.log('📦 Deploying frontend...');
  const result = execSync('vercel --prod --force', { encoding: 'utf8', cwd: __dirname });
  console.log(result);
  
  // Extract the deployment URL
  const urlMatch = result.match(/https:\/\/frontuna-frontend-app-[a-z0-9]+-frontunas-projects-11c7fb14\.vercel\.app/);
  if (!urlMatch) {
    throw new Error('Could not find deployment URL in Vercel output.');
  }
  const deploymentUrl = urlMatch[0];
  console.log(`✅ Frontend deployed: ${deploymentUrl}`);

  // Update the www.frontuna.com alias
  console.log('🔗 Updating www.frontuna.com alias...');
  execSync(`vercel alias set ${deploymentUrl} www.frontuna.com`, { encoding: 'utf8', cwd: __dirname });
  console.log(`> Success! https://www.frontuna.com now points to ${deploymentUrl}`);

  console.log('🎉 Frontend deployment complete! www.frontuna.com is now live!');

} catch (error) {
  console.error('❌ Frontend deployment failed:', error.message);
  process.exit(1);
}
