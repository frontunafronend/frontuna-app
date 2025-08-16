# 🚀 Vercel Dashboard Deployment Checklist

Follow this checklist when setting up your Frontuna app in the Vercel dashboard.

## 📋 Pre-Deployment Checklist

- [ ] Code pushed to GitHub repository
- [ ] Neon database created and accessible
- [ ] Environment variables documented
- [ ] Local build test completed successfully

## 🔧 Vercel Dashboard Setup

### 1. Import Project
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Click **"New Project"**
- [ ] Select **"Import Git Repository"**
- [ ] Choose your GitHub repository
- [ ] Click **"Import"**

### 2. Configure Project Settings
- [ ] **Project Name**: `frontuna-app` (or your preferred name)
- [ ] **Framework Preset**: Angular (should auto-detect)
- [ ] **Root Directory**: `.` (root, not frontend)
- [ ] **Build Command**: `cd frontend && npm ci && npm run build -- --configuration=production`
- [ ] **Output Directory**: `frontend/dist/frontuna-frontend/browser`
- [ ] **Install Command**: `npm ci`

### 3. Environment Variables
Add these in **Settings → Environment Variables**:

#### Production Variables:
- [ ] `NEON_DATABASE_URL` = `postgresql://username:password@host/database?sslmode=require`
- [ ] `NODE_ENV` = `production`
- [ ] `API_BASE_URL` = `https://your-app.vercel.app/api`

#### Optional Variables:
- [ ] `VERCEL_ANALYTICS_ID` = `your-analytics-id`
- [ ] `SENTRY_DSN` = `your-sentry-dsn` (if using Sentry)

### 4. Deploy
- [ ] Click **"Deploy"**
- [ ] Wait for build completion (2-3 minutes)
- [ ] Check build logs for any errors

## ✅ Post-Deployment Verification

### 1. Basic Functionality
- [ ] Visit deployed URL
- [ ] Homepage loads correctly
- [ ] Navigation works (no 404 errors)
- [ ] Dark theme applied
- [ ] No console errors

### 2. API Endpoints
- [ ] Test health check: `https://your-app.vercel.app/api/health`
- [ ] Test database check: `https://your-app.vercel.app/api/db-check`
- [ ] Verify API responses are JSON formatted

### 3. Core Features
- [ ] AI Copilot page loads
- [ ] Chat interface functional
- [ ] Code editor displays
- [ ] Apply to Editor button works
- [ ] Layout is 30% chat, 70% editor

### 4. Performance
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] No memory leaks in dev tools
- [ ] Mobile responsive design

## 🚨 Common Issues & Solutions

### Build Failures

**Issue**: `Module not found: Error: Can't resolve...`
**Solution**: 
- [ ] Check all imports in TypeScript files
- [ ] Verify dependencies in package.json
- [ ] Clear node_modules and reinstall

**Issue**: `FATAL ERROR: Ineffective mark-compacts near heap limit`
**Solution**:
- [ ] Add to vercel.json: `"env": { "NODE_OPTIONS": "--max-old-space-size=4096" }`

### Runtime Errors

**Issue**: 404 on page refresh
**Solution**:
- [ ] Verify rewrite rule in vercel.json: `{ "source": "/(.*)", "destination": "/" }`

**Issue**: API calls returning 404
**Solution**:
- [ ] Check API file paths in `/api` directory
- [ ] Verify function exports are default exports
- [ ] Check CORS headers

### Database Connection

**Issue**: Database connection timeout
**Solution**:
- [ ] Verify NEON_DATABASE_URL format
- [ ] Ensure SSL mode is required: `?sslmode=require`
- [ ] Check Neon database is active (not sleeping)

**Issue**: Authentication failed
**Solution**:
- [ ] Verify username/password in connection string
- [ ] Check database user permissions
- [ ] Ensure database exists

## 📊 Monitoring Setup

### Vercel Analytics
- [ ] Enable Vercel Analytics in dashboard
- [ ] Add analytics script to Angular app
- [ ] Verify data collection

### Error Tracking
- [ ] Set up Sentry (optional)
- [ ] Configure error boundaries
- [ ] Test error reporting

## 🔄 Continuous Deployment

### Automatic Deployments
- [ ] **Production**: Deploys from `main` branch
- [ ] **Preview**: Deploys from feature branches
- [ ] **Development**: Manual deployments only

### Branch Protection
- [ ] Enable branch protection on `main`
- [ ] Require PR reviews
- [ ] Require status checks to pass

## 📈 Performance Optimization

### Bundle Analysis
- [ ] Run `npm run analyze` locally
- [ ] Check bundle sizes in Vercel dashboard
- [ ] Implement lazy loading if needed

### Caching
- [ ] Verify static assets are cached (automatic)
- [ ] Check CDN distribution (automatic)
- [ ] Monitor cache hit rates

## 🎯 Final Verification

- [ ] All pages accessible via direct URL
- [ ] SEO meta tags present
- [ ] Social media previews work
- [ ] Security headers active
- [ ] SSL certificate valid
- [ ] Custom domain configured (if applicable)

## 📞 Support Resources

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Angular Deployment**: [angular.io/guide/deployment](https://angular.io/guide/deployment)
- **Neon Documentation**: [neon.tech/docs](https://neon.tech/docs)

---

**Deployment Date**: ___________
**Deployed URL**: ___________
**Verified By**: ___________
