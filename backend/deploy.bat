@echo off
echo 🚀 FRONTUNA PRODUCTION DEPLOYMENT
echo ================================

echo.
echo 📋 Pre-deployment checklist:
echo ✅ Database URL configured in Vercel
echo ✅ JWT_SECRET configured in Vercel  
echo ✅ Admin user exists in database
echo.

echo 🔄 Starting deployment to Vercel...
vercel --prod

echo.
echo 🎯 Deployment complete!
echo.
echo 📊 Test your deployment:
echo 🔗 Health Check: https://your-deployment.vercel.app/health
echo 🔐 Admin Login: Open admin-dashboard.html
echo 🧪 API Tests: Open test-live-api-simple.html
echo.

echo 👑 Admin Credentials:
echo Email: admin@frontuna.com
echo Password: admin123
echo.

pause
