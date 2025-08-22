# 🚀 Backend Deployment Guide

## 🚨 **CRITICAL: Your API is not deployed!**

Your frontend is trying to call `https://api.frontuna.com/api/auth/signup` but this domain doesn't exist. Here's how to fix it:

## **Option 1: Deploy Backend to Vercel (Recommended)**

### **Step 1: Create New Vercel Project for Backend**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your **same GitHub repository**
4. **IMPORTANT**: Set the **Root Directory** to `backend/`
5. Vercel will detect it as a Node.js project

### **Step 2: Configure Vercel Settings**

**Build & Development Settings:**
- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: (leave empty)
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### **Step 3: Set Environment Variables**

In Vercel Dashboard → Settings → Environment Variables, add:

```bash
# Required
NODE_ENV=production
DATABASE_URL=your_neon_database_url_here
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# OpenAI (if using AI features)
OPENAI_API_KEY=your-openai-api-key-here

# CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Optional
PORT=3000
```

### **Step 4: Deploy**

1. Click **"Deploy"**
2. Your backend will be available at: `https://your-backend-name.vercel.app`
3. **Update your frontend environment file** with the new API URL

### **Step 5: Update Frontend Environment**

Update `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-name.vercel.app/api', // ← Your actual Vercel backend URL
  socketUrl: 'https://your-backend-name.vercel.app',
  // ... rest of config
};
```

## **Option 2: Use Your Current Vercel Project**

If you want everything in one project:

1. Update the main `vercel.json` to handle both frontend and backend
2. This is more complex but possible

## **Option 3: Alternative Hosting**

Deploy backend to:
- **Railway**: Easy Node.js deployment
- **Render**: Free tier available  
- **Heroku**: Classic choice
- **DigitalOcean App Platform**: Simple deployment

## **🔍 Current Error Explanation**

```
POST https://api.frontuna.com/api/auth/signup net::ERR_NAME_NOT_RESOLVED
```

This means:
- ❌ `api.frontuna.com` domain doesn't exist
- ❌ No DNS record for this domain
- ❌ Backend is not deployed anywhere

## **✅ After Deployment**

Your signup will work because:
- ✅ Backend API will be accessible
- ✅ Database connections will work
- ✅ Authentication will function properly
- ✅ Users can register and login

## **🚀 Quick Start**

1. **Deploy backend to Vercel** (15 minutes)
2. **Update frontend environment** with new API URL
3. **Redeploy frontend** 
4. **Test signup** - should work! 🎉

---

**Need help?** The backend code is ready - it just needs to be deployed to a server that's accessible from the internet.
