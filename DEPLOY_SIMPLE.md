# Simple Vercel Deployment Guide

## Current Setup
- **Frontend**: Root `vercel.json` - Deploys Angular app from `frontend/` folder
- **Backend**: `backend/vercel.json` - Deploys Node.js API from `backend/` folder

## Deployment Steps

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy Frontend (from root)
vercel --prod

# Deploy Backend (from backend folder)
cd backend
vercel --prod
```

### Option 2: GitHub Integration
1. Push changes to main branch
2. Vercel auto-deploys both projects

### Option 3: Vercel Dashboard
1. Go to vercel.com/dashboard
2. Click "Redeploy" for each project

## Project Structure
```
/vercel.json          -> Frontend deployment config
/backend/vercel.json  -> Backend deployment config
```

## Troubleshooting
- If frontend doesn't deploy: Check `frontend/dist/frontuna-app/browser` exists
- If backend doesn't deploy: Check `backend/server-production.js` exists
- For build issues: Run `npm ci` and build locally first

## Environment Variables
Set these in Vercel Dashboard for each project:
- NODE_ENV=production
- DATABASE_URL (for backend)
- Any other app-specific variables
