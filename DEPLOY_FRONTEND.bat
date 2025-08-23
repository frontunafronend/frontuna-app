@echo off
echo 🚀 Deploying Frontend to www.frontuna.com...
echo.

cd /d "%~dp0"

if not exist "frontend" (
    echo ❌ Error: frontend directory not found!
    pause
    exit /b 1
)

cd frontend

echo 📦 Installing dependencies...
call npm ci

echo 🔨 Building for production...
call npm run build:prod

if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 🚀 Deploying to Vercel...
call vercel --prod --yes

if errorlevel 1 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo.
echo 🎉 SUCCESS! Frontend deployed to www.frontuna.com
echo ✅ Your admin panel and auth fixes should now be live!
echo.
echo 🧪 Test: Visit https://www.frontuna.com and login as admin
echo.
pause
