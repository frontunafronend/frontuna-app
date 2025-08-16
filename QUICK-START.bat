@echo off
echo 🚀 STARTING FRONTUNA COMPONENT GENERATOR ENGINE v1.0
echo ================================================

echo.
echo 🔄 Killing existing Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo 🔄 Starting Backend Server...
start "Frontuna Backend" cmd /k "cd /d backend && node simple-generator.js"

echo 🔄 Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo 🔄 Starting Frontend Server...
start "Frontuna Frontend" cmd /k "cd /d frontend && ng serve --port 4200 --disable-host-check"

echo.
echo ✅ COMPONENT GENERATOR ENGINE STARTED!
echo ================================================
echo 🌐 Frontend: http://localhost:4200
echo 🔧 Backend:  http://localhost:3000
echo 📚 Health:   http://localhost:3000/api/health
echo ================================================
echo.
echo 🎯 Go to http://localhost:4200 to use the generator!
echo.

pause