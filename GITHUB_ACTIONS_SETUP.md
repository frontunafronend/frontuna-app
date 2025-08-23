# 🚀 GitHub Actions Auto-Deployment Setup

This guide sets up automatic deployment to both Vercel projects when you push to GitHub.

## 🎯 **Current Setup:**

- **Frontend**: `frontuna-app` → `www.frontuna.com` 
- **Backend**: `frontuna-api` → `frontuna-api.vercel.app`
- **Repository**: `https://github.com/frontunafronend/frontuna-app`

## 🔧 **Required GitHub Secrets**

You need to add these secrets to your GitHub repository:

### 1. Go to GitHub Repository Settings
1. Visit: `https://github.com/frontunafronend/frontuna-app/settings/secrets/actions`
2. Click **"New repository secret"**

### 2. Add These Secrets:

#### **VERCEL_TOKEN**
```
Get from: https://vercel.com/account/tokens
Value: Your Vercel API token
```

#### **VERCEL_ORG_ID**
```
Get from: Vercel Dashboard → Settings → General
Value: Your team/organization ID (starts with "team_" or "user_")
```

#### **VERCEL_FRONTEND_PROJECT_ID** 
```
Get from: frontuna-app project → Settings → General
Value: Project ID for www.frontuna.com (starts with "prj_")
```

#### **VERCEL_BACKEND_PROJECT_ID**
```
Get from: frontuna-api project → Settings → General  
Value: Project ID for frontuna-api.vercel.app (starts with "prj_")
```

## 🎯 **How It Works:**

### **Smart Deployment Detection:**
- **Frontend changes** (`frontend/`, `shared/`, `vercel.json`) → Deploy to `www.frontuna.com`
- **Backend changes** (`backend/`, `api/`, `shared/`) → Deploy to `frontuna-api.vercel.app`
- **No unnecessary deployments** - only deploys what changed

### **Workflow Triggers:**
- ✅ **Push to main** - Auto-deploy production
- ✅ **Pull requests** - Preview deployments
- ✅ **Manual trigger** - Can run manually if needed

### **Build Process:**
1. **Detects changes** in frontend/backend directories
2. **Installs dependencies** for changed projects
3. **Builds projects** using production settings
4. **Deploys to correct Vercel project**
5. **Reports success/failure** in GitHub

## 📋 **Quick Setup Checklist:**

- [ ] Add `VERCEL_TOKEN` secret
- [ ] Add `VERCEL_ORG_ID` secret  
- [ ] Add `VERCEL_FRONTEND_PROJECT_ID` secret
- [ ] Add `VERCEL_BACKEND_PROJECT_ID` secret
- [ ] Push changes to trigger first deployment
- [ ] Verify deployments in GitHub Actions tab

## 🔍 **Finding Your IDs:**

### **Vercel Token:**
1. Go to https://vercel.com/account/tokens
2. Create new token with name "GitHub Actions"
3. Copy the token value

### **Organization ID:**
1. Go to any Vercel project settings
2. Look for "Organization ID" or "Team ID"
3. Copy the ID (format: `team_xxxxx` or `user_xxxxx`)

### **Project IDs:**
1. **Frontend**: Go to `frontuna-app` project → Settings → General
2. **Backend**: Go to `frontuna-api` project → Settings → General  
3. Copy each "Project ID" (format: `prj_xxxxx`)

## 🎉 **Result:**

Once set up, every time you push changes:

- **Frontend auth fixes** → Automatically deploy to `www.frontuna.com`
- **Backend API changes** → Automatically deploy to `frontuna-api.vercel.app`
- **No more manual deployments needed!**

Your authentication fixes and admin panel will automatically go live! 🚀
