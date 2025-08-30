@echo off
echo 🌟 Starting Ultimate Frontuna Server with Live Neon Database...
echo.

REM Set the Neon database URL
set DATABASE_URL=postgresql://neondb_owner:npg_CUA5d3BQLGON@ep-soft-fire-aemufuhz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require^&channel_binding=require

echo ✅ Database URL configured
echo 🚀 Starting server...
echo.

node ultimate-server.js

pause
