# 🚀 Frontuna Production Deployment Guide

## ✅ **Ready for Production!**

Your secure authentication system is **100% ready** for production deployment with Neon DB. Here's your complete deployment checklist:

---

## 🗄️ **1. Database Setup (Neon)**

### Create Neon Database:
1. Go to [Neon Console](https://console.neon.tech)
2. Create new project: `frontuna-production`
3. Copy your connection string
4. Enable connection pooling for better performance

### Your Connection String Format:
```
postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/frontuna_db?sslmode=require
```

---

## 🔐 **2. Environment Variables**

### Copy and Configure:
```bash
# Copy template
cp env.production.template .env

# Generate secure JWT secrets
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for JWT_REFRESH_SECRET (different!)
```

### Required Variables:
```env
DATABASE_URL="your-neon-connection-string"
JWT_SECRET="your-32-char-secret"
JWT_REFRESH_SECRET="different-32-char-secret"
CORS_ORIGIN="https://frontuna.com,https://frontuna-frontend-app.vercel.app"
FRONTEND_URL="https://frontuna.com"
NODE_ENV="production"
```

### Optional (but recommended):
```env
SMTP_HOST="smtp.gmail.com"
SMTP_USER="noreply@frontuna.ai"
SMTP_PASS="your-gmail-app-password"
EMAIL_FROM="Frontuna AI <noreply@frontuna.ai>"
OPENAI_API_KEY="sk-your-key-here"
```

---

## 🏗️ **3. Database Migration**

### Run Prisma Migration:
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Deploy migration to Neon
npx prisma migrate deploy

# Verify tables created
npx prisma studio
```

### Expected Tables:
- ✅ User (enhanced with new auth fields)
- ✅ RefreshToken (for token rotation)
- ✅ PasswordResetToken (secure reset flow)
- ✅ EmailVerifyToken (email verification)
- ✅ AuditLog (security events)
- ✅ UserSession (session management)
- ✅ Component, UsageLog, Subscription (existing)

---

## 🚀 **4. Vercel Deployment**

### Backend Deployment:
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel Dashboard:
# - DATABASE_URL
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - CORS_ORIGIN
# - All other env vars from template
```

### Frontend Update:
Update your frontend environment to point to production API:
```typescript
// frontend/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://frontuna-api.vercel.app'
};
```

---

## 🧪 **5. Testing Production**

### Test Authentication Flow:
```bash
# 1. Signup
curl -X POST https://frontuna-api.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "agreeToTerms": true
  }'

# 2. Login
curl -X POST https://frontuna-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# 3. Test protected route
curl -X GET https://frontuna-api.vercel.app/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Verify Security Features:
- ✅ Access tokens expire in 15 minutes
- ✅ Refresh tokens rotate on every use
- ✅ httpOnly cookies are set
- ✅ Rate limiting works
- ✅ Audit logs are created
- ✅ Email verification works (if SMTP configured)

---

## 📊 **6. Monitoring & Health Checks**

### Health Endpoint:
```bash
curl https://frontuna-api.vercel.app/health
```

### Database Queries:
```sql
-- Check recent signups
SELECT id, email, "createdAt", "emailVerifiedAt" 
FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- Check security events
SELECT event, ip, "createdAt" 
FROM "AuditLog" 
ORDER BY "createdAt" DESC 
LIMIT 20;

-- Check active sessions
SELECT COUNT(*) as active_sessions
FROM "RefreshToken" 
WHERE "revokedAt" IS NULL 
AND "expiresAt" > NOW();
```

---

## 🛡️ **7. Security Checklist**

### ✅ **Production Security Features:**
- **Password Hashing**: Argon2id (industry standard)
- **JWT Tokens**: Short-lived access (15min) + rotating refresh (45d)
- **Cookies**: httpOnly, secure, sameSite strict
- **Rate Limiting**: Progressive backoff for brute force
- **Audit Logging**: All security events tracked
- **Input Validation**: Zod schemas for all endpoints
- **CORS**: Properly configured for your domains
- **Environment**: All secrets validated with Zod

### ✅ **Database Security:**
- **Connection**: SSL required (Neon default)
- **Indexes**: Optimized for token lookups
- **Cleanup**: Expired tokens auto-managed
- **Backup**: Neon handles automatic backups

---

## 🔄 **8. Migration from Current System**

### Backward Compatibility:
- ✅ **Same URLs**: All existing endpoints unchanged
- ✅ **Same Responses**: JSON format identical
- ✅ **Same Frontend**: No frontend changes needed initially
- ✅ **Gradual Migration**: Can migrate users over time

### Migration Strategy:
1. **Deploy new backend** (maintains old behavior)
2. **Test thoroughly** with existing frontend
3. **Migrate users** (passwords re-hashed on login)
4. **Update frontend** to use cookies (optional)
5. **Remove localStorage** (future enhancement)

---

## 🚨 **9. Troubleshooting**

### Common Issues:

**Database Connection Error:**
```
Error: P1001: Can't reach database server
```
- ✅ Check DATABASE_URL format
- ✅ Verify Neon database is active
- ✅ Check connection pooling settings

**JWT Secret Error:**
```
JWT_SECRET must be at least 32 characters
```
- ✅ Generate new secret: `openssl rand -base64 32`
- ✅ Ensure JWT_SECRET ≠ JWT_REFRESH_SECRET

**CORS Error:**
```
CORS policy violation
```
- ✅ Add your domain to CORS_ORIGIN
- ✅ Include both www and non-www versions

**Email Not Sending:**
```
Failed to send email
```
- ✅ Use Gmail App Password (not regular password)
- ✅ Enable 2FA on Gmail account first
- ✅ Check SMTP settings

---

## 🎉 **10. You're Ready!**

### ✅ **What You Have:**
- **Enterprise-grade security** with Argon2 + JWT rotation
- **Audit logging** for compliance and monitoring
- **Rate limiting** against brute force attacks
- **Email verification** and password reset flows
- **2FA scaffolding** ready for future implementation
- **100% backward compatibility** with existing frontend
- **Production-ready** error handling and logging

### 🚀 **Deploy Command:**
```bash
# Final deployment
vercel --prod

# Your secure API will be live at:
# https://frontuna-api.vercel.app
```

### 📱 **Frontend Update:**
Just update your API URL and you're done! The frontend will work immediately with all the new security features.

---

**Your authentication system is now enterprise-ready! 🎉🔐**

Need help with deployment? Check the logs and verify each step above.
