# 🚀 Frontuna Deployment Guide

## ⚠️ IMPORTANT: Sequential Deployment Required

**Always deploy backend and frontend separately with timeouts to avoid Vercel conflicts!**

## 🎯 Recommended Deployment Methods

### 1. **Full Sequential Deployment** (Recommended)
```bash
# From project root - deploys both with proper timing
node deploy-all.js
```
This will:
- Deploy backend API first
- Wait 10 seconds
- Deploy frontend
- Wait 5 seconds  
- Update www.frontuna.com alias

### 2. **Individual Deployments** (Manual Control)

#### Backend Only:
```bash
cd backend
node deploy.js
```

#### Frontend Only:
```bash
cd frontend
node deploy-frontend.js
```

**⏰ If deploying manually, wait at least 10 seconds between backend and frontend deployments!**

## 📋 Deployment Status Check

After deployment, verify:
- ✅ Backend: https://frontuna-api.vercel.app/health
- ✅ Frontend: https://www.frontuna.com
- ✅ Authentication: Try creating a user account

## 🔧 Projects Configuration

- **Backend**: `frontuna-api` project on Vercel
- **Frontend**: `frontuna-frontend-app` project on Vercel
- **Database**: Unified production Neon DB for both local & live

## 🚨 Troubleshooting

If deployments fail:
1. Check Vercel project Root Directory settings (should be empty/`.`)
2. Ensure no simultaneous deployments are running
3. Use `vercel --prod --force` for fresh deployments
4. Check environment variables are set correctly

## 📝 Notes

- Both local and live use the same production Neon database
- CORS is configured for all frontend domains
- JWT tokens use production secrets for consistency
