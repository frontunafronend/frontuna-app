#!/bin/bash

# 🚀 Manual Frontend Deployment Script
# This script deploys the frontend directly to your www.frontuna.com project

echo "🚀 Manual Frontend Deployment to www.frontuna.com"
echo "=================================================="

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Building frontend for production..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm ci
fi

# Build the project
echo "🔨 Building Angular app..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy with production flag
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Frontend deployed to www.frontuna.com"
    echo "✅ Your admin panel and auth fixes should now be live!"
    echo ""
    echo "🧪 Test your deployment:"
    echo "1. Visit https://www.frontuna.com"
    echo "2. Login with: admin@frontuna.com / FrontunaAdmin2024!"
    echo "3. Check header dropdown for Admin Panel button"
    echo "4. Test refresh on any page (should not redirect to login)"
else
    echo "❌ Deployment failed!"
    exit 1
fi
