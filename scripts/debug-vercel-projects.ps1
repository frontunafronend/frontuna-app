# 🔍 Debug Vercel Projects Script
# This script helps identify the correct Vercel project IDs

Write-Host "🔍 Vercel Projects Debugger" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if vercel is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "📥 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "📋 Listing all your Vercel projects..." -ForegroundColor Blue
Write-Host ""

# List all projects
vercel projects ls

Write-Host ""
Write-Host "🎯 Looking for these specific projects:" -ForegroundColor Yellow
Write-Host "  • frontuna-app (should serve www.frontuna.com)"
Write-Host "  • frontuna-api (should serve frontuna-api.vercel.app)"
Write-Host ""

Write-Host "📝 To get project details, run:" -ForegroundColor Green
Write-Host "  vercel projects ls --format json"
Write-Host ""

Write-Host "🔧 To link this directory to the correct project:" -ForegroundColor Green
Write-Host "  cd frontend"
Write-Host "  vercel link"
Write-Host ""

Write-Host "💡 GitHub Secrets needed:" -ForegroundColor Cyan
Write-Host "  VERCEL_TOKEN: Your Vercel token"
Write-Host "  VERCEL_ORG_ID: Your organization/team ID"
Write-Host "  VERCEL_FRONTEND_PROJECT_ID: Project ID for www.frontuna.com"
Write-Host "  VERCEL_BACKEND_PROJECT_ID: Project ID for frontuna-api.vercel.app"
Write-Host ""

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
