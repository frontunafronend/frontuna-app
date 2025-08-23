# 🚀 Manual Frontend Deployment Script for Windows
# This script deploys the frontend directly to your www.frontuna.com project

Write-Host "🚀 Manual Frontend Deployment to www.frontuna.com" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Building frontend for production..." -ForegroundColor Blue
Set-Location frontend

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    npm ci
}

# Build the project
Write-Host "🔨 Building Angular app..." -ForegroundColor Blue
npm run build:prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Blue

# Check if vercel is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "📥 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy with production flag
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 SUCCESS! Frontend deployed to www.frontuna.com" -ForegroundColor Green
    Write-Host "✅ Your admin panel and auth fixes should now be live!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 Test your deployment:" -ForegroundColor Cyan
    Write-Host "1. Visit https://www.frontuna.com" -ForegroundColor White
    Write-Host "2. Login with: admin@frontuna.com / FrontunaAdmin2024!" -ForegroundColor White
    Write-Host "3. Check header dropdown for Admin Panel button" -ForegroundColor White
    Write-Host "4. Test refresh on any page (should not redirect to login)" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
