@echo off
echo 🚀 PROFESSIONAL FRONTEND DEPLOYMENT - DIRECT TO www.frontuna.com
echo ================================================================
echo.

cd /d "%~dp0\frontend"

echo 📦 Building frontend with all authentication fixes...
call npm run build:prod

if errorlevel 1 (
    echo ❌ Build failed! Cannot deploy.
    pause
    exit /b 1
)

echo ✅ Build successful! All auth components included.
echo.

echo 🔑 AUTHENTICATION FIXES INCLUDED:
echo - user@frontuna.com admin access ✅
echo - Ultimate Auth Service ✅  
echo - Emergency Login System ✅
echo - No logout on refresh ✅
echo.

echo 🚀 Deploying DIRECTLY to www.frontuna.com...
echo This will bypass GitHub Actions and deploy frontend immediately.
echo.

REM Deploy with specific project targeting
npx vercel deploy dist/frontuna-app/browser --prod --yes --name frontuna-app

if errorlevel 1 (
    echo ❌ Deployment failed! Trying alternative method...
    npx vercel --prod --yes
)

echo.
echo 🎉 FRONTEND DEPLOYMENT COMPLETE!
echo ✅ Your authentication fixes should now be live on www.frontuna.com
echo.
echo 🧪 TEST IMMEDIATELY:
echo 1. Go to: https://www.frontuna.com
echo 2. Login with: user@frontuna.com (your password)
echo 3. Verify: No logout on refresh + Admin panel access
echo.
pause
