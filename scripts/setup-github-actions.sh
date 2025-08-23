#!/bin/bash

# 🚀 GitHub Actions Setup Script for Frontuna Auto-Deployment

echo "🚀 Setting up GitHub Actions for Auto-Deployment"
echo "=================================================="
echo ""

echo "📋 This script will help you set up automatic deployment to both:"
echo "   • Frontend: www.frontuna.com (frontuna-app project)"
echo "   • Backend: frontuna-api.vercel.app (frontuna-api project)"
echo ""

echo "🔧 You need to add these secrets to GitHub:"
echo "   https://github.com/frontunafronend/frontuna-app/settings/secrets/actions"
echo ""

echo "1. VERCEL_TOKEN"
echo "   → Get from: https://vercel.com/account/tokens"
echo "   → Create new token named 'GitHub Actions'"
echo ""

echo "2. VERCEL_ORG_ID"
echo "   → Get from: Vercel Dashboard → Settings → General"
echo "   → Look for 'Organization ID' or 'Team ID'"
echo ""

echo "3. VERCEL_FRONTEND_PROJECT_ID"
echo "   → Get from: frontuna-app project → Settings → General"
echo "   → Copy the 'Project ID' (starts with prj_)"
echo ""

echo "4. VERCEL_BACKEND_PROJECT_ID"
echo "   → Get from: frontuna-api project → Settings → General"
echo "   → Copy the 'Project ID' (starts with prj_)"
echo ""

echo "✅ After adding secrets, push this commit to trigger first deployment!"
echo ""

echo "🎯 Benefits:"
echo "   • Frontend changes → Auto-deploy to www.frontuna.com"
echo "   • Backend changes → Auto-deploy to frontuna-api.vercel.app"
echo "   • Smart detection - only deploys what changed"
echo "   • No more manual deployments needed!"
echo ""

echo "📊 Monitor deployments at:"
echo "   https://github.com/frontunafronend/frontuna-app/actions"
echo ""

echo "🆘 Need help? Check GITHUB_ACTIONS_SETUP.md for detailed instructions."
