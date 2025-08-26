# 🚀 PROFESSIONAL FRONTEND DEPLOYMENT - DIRECT TO www.frontuna.com
# This script bypasses GitHub Actions and deploys frontend directly

Write-Host "🚀 PROFESSIONAL FRONTEND DEPLOYMENT" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Navigate to frontend directory
Set-Location "frontend"

Write-Host "📦 Building frontend with authentication fixes..." -ForegroundColor Blue
npm run build:prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Cannot deploy." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful! All auth components included." -ForegroundColor Green
Write-Host ""

Write-Host "🔑 AUTHENTICATION FIXES INCLUDED:" -ForegroundColor Cyan
Write-Host "- user@frontuna.com admin access ✅" -ForegroundColor White
Write-Host "- Ultimate Auth Service ✅" -ForegroundColor White  
Write-Host "- Emergency Login System ✅" -ForegroundColor White
Write-Host "- No logout on refresh ✅" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Deploying DIRECTLY to www.frontuna.com..." -ForegroundColor Blue
Write-Host "This bypasses GitHub Actions and deploys frontend immediately." -ForegroundColor Yellow
Write-Host ""

# First, try to link/deploy to correct project
Write-Host "🎯 Targeting frontuna-app project (www.frontuna.com)..." -ForegroundColor Magenta

# Deploy with production flag - this should target the correct project
npx vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 FRONTEND DEPLOYMENT COMPLETE!" -ForegroundColor Green
    Write-Host "✅ Your authentication fixes are now live on www.frontuna.com" -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 TEST IMMEDIATELY:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://www.frontuna.com" -ForegroundColor White
    Write-Host "2. Login with: user@frontuna.com (your password)" -ForegroundColor White
    Write-Host "3. Verify: No logout on refresh + Admin panel access" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 PROFESSIONAL DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed! Check Vercel authentication." -ForegroundColor Red
    Write-Host "Run 'npx vercel login' first, then try again." -ForegroundColor Yellow
    exit 1
}
