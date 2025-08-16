# 🚀 Frontuna Vercel Deployment Guide

This guide covers deploying the Frontuna Angular 17 + Neon application to Vercel Hobby (free tier).

## 📋 Prerequisites

- GitHub repository with your Frontuna code
- Vercel account (free)
- Neon database setup
- Node.js 20.x or higher

## 🔧 Step-by-Step Deployment

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Select **root directory** (not frontend subdirectory)
5. Vercel will auto-detect Angular framework

### 2. Configure Build Settings

Vercel should automatically detect these settings from `vercel.json`:

- **Framework Preset**: Angular
- **Build Command**: `cd frontend && npm ci && npm run build -- --configuration=production`
- **Output Directory**: `frontend/dist/frontend/browser`
- **Install Command**: `npm ci`

### 3. Environment Variables

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

#### Required Variables:
```bash
# Database
NEON_DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# API Configuration
NODE_ENV=production
API_BASE_URL=https://your-app.vercel.app/api

# Optional: Analytics & Monitoring
VERCEL_ANALYTICS_ID=your-analytics-id
```

#### Development Variables (for vercel dev):
```bash
NODE_ENV=development
API_BASE_URL=http://localhost:3000/api
```

### 4. SPA Rewrite Configuration

The `vercel.json` includes this rewrite rule:
```json
"rewrites": [{ "source": "/(.*)", "destination": "/" }]
```

**What this does:**
- All routes (`/dashboard`, `/ai-copilot`, etc.) redirect to `index.html`
- Angular Router handles client-side routing
- Prevents 404 errors on page refresh
- Essential for Single Page Applications (SPA)

### 5. Deploy

1. Click **"Deploy"** in Vercel
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployed URL
4. Test all routes and functionality

## 🧪 Local Build Testing

Before deploying, test the production build locally:

```bash
# Install dependencies
cd frontend && npm ci

# Build for production
npm run build:prod

# Serve locally (optional)
npx http-server dist/frontend/browser -p 8080

# Test with Vercel CLI
npm run start:vercel
```

## 📁 Project Structure

```
frontuna-app/
├── vercel.json              # Vercel configuration
├── DEPLOYMENT.md           # This file
├── frontend/               # Angular app
│   ├── package.json
│   ├── angular.json
│   └── dist/
│       └── frontend/
│           └── browser/    # Build output
├── backend/                # Node.js API (if separate)
└── api/                   # Vercel serverless functions
    ├── health.ts
    └── db-check.ts
```

## 🔄 Angular SSR vs SPA

### Current Setup (SPA - Single Page Application)
- ✅ Client-side rendering
- ✅ Fast development
- ✅ Simple deployment
- ❌ SEO limitations
- ❌ Slower initial load

### Future SSR Setup (Server-Side Rendering)
To enable SSR in the future:

1. Add Angular Universal:
   ```bash
   ng add @nguniversal/express-engine
   ```

2. Update `vercel.json`:
   ```json
   {
     "buildCommand": "cd frontend && npm ci && npm run build:ssr",
     "outputDirectory": "frontend/dist/frontend",
     "functions": {
       "frontend/dist/frontend/server/main.js": {
         "runtime": "nodejs20.x"
       }
     }
   }
   ```

## 🚨 Common Issues & Solutions

### Build Failures

**Issue**: `Module not found` errors
**Solution**: Ensure all dependencies are in `package.json`, not just `devDependencies`

**Issue**: `Out of memory` during build
**Solution**: Add to `vercel.json`:
```json
"env": {
  "NODE_OPTIONS": "--max-old-space-size=4096"
}
```

### Runtime Errors

**Issue**: 404 on page refresh
**Solution**: Verify the rewrite rule in `vercel.json` is correct

**Issue**: API calls failing
**Solution**: Check environment variables and API endpoints

### Database Connection

**Issue**: Neon connection timeout
**Solution**: Ensure connection string includes `?sslmode=require`

## 📊 Performance Optimization

### Bundle Size
- Use `ng build --stats-json` to analyze bundle size
- Implement lazy loading for routes
- Use Angular's built-in tree shaking

### Caching
Vercel automatically handles:
- Static asset caching (CSS, JS, images)
- CDN distribution
- Gzip compression

## 🔐 Security Headers

The `vercel.json` includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 📈 Monitoring

### Vercel Analytics
Add to your Angular app:
```bash
npm install @vercel/analytics
```

```typescript
// app.component.ts
import { inject } from '@vercel/analytics';

export class AppComponent {
  constructor() {
    inject();
  }
}
```

### Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for user analytics

## 🎯 Deployment Checklist

- [ ] Repository connected to Vercel
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Local build test passed
- [ ] Database connection verified
- [ ] All routes working after deployment
- [ ] API endpoints responding
- [ ] Security headers active
- [ ] Performance metrics acceptable
- [ ] Error monitoring setup

## 🆘 Support

- [Vercel Documentation](https://vercel.com/docs)
- [Angular Deployment Guide](https://angular.io/guide/deployment)
- [Neon Documentation](https://neon.tech/docs)

---

**Last Updated**: $(date)
**Vercel Plan**: Hobby (Free)
**Angular Version**: 17.x
**Node Version**: 20.x
