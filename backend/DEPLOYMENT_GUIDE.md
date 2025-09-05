# 🚀 Frontuna Auth Deployment Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env` file with required variables:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/frontuna_db"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET="your-32-character-secret-key-here"
JWT_REFRESH_SECRET="different-32-character-secret-here"

# CORS & Frontend
CORS_ORIGIN="http://localhost:4200,http://localhost:4201,https://frontuna.com"
FRONTEND_URL="http://localhost:4200"

# Email (optional for development)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@frontuna.ai"

# Optional
NODE_ENV="development"
PORT="3000"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="45d"
```

### 3. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run migrations (requires database connection)
npx prisma migrate dev --name auth-security-upgrade

# Or create migration file without applying
npx prisma migrate dev --create-only --name auth-security-upgrade
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 🔄 Integration with Existing System

### Replace Existing Auth Controller
The new auth system replaces `backend/src/controllers/auth.controller.js`:

1. **Backup existing file:**
   ```bash
   mv src/controllers/auth.controller.js src/controllers/auth.controller.js.backup
   ```

2. **Update route imports:**
   ```javascript
   // In your main app file, replace:
   const authRoutes = require('./routes/auth.routes');
   
   // With:
   import authRoutes from './features/auth/auth.routes';
   ```

3. **Add cookie parser middleware:**
   ```javascript
   // Add to your main app file:
   import cookieParser from 'cookie-parser';
   app.use(cookieParser());
   ```

### Maintain Compatibility
The new system maintains 100% backward compatibility:
- ✅ Same endpoint URLs
- ✅ Same request/response formats  
- ✅ Same error codes and messages
- ✅ Frontend continues working unchanged

### Gradual Migration Path

**Phase 1: Deploy New Backend (Current)**
- New secure auth system active
- httpOnly cookies set alongside JSON tokens
- Frontend uses localStorage (existing behavior)
- Both cookie and body refresh tokens accepted

**Phase 2: Update Frontend (Future)**
- Remove localStorage token handling
- Use cookies for refresh tokens
- Update auth interceptors

**Phase 3: Cleanup (Future)**
- Remove JSON refresh token responses
- Enforce cookie-only refresh flow

## 🛡️ Security Verification

### Test Authentication Flow
```bash
# 1. Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "agreeToTerms": true
  }'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# 3. Access Protected Route
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Refresh Token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

### Verify Security Features
- ✅ Access tokens expire in 15 minutes
- ✅ Refresh tokens rotate on every use
- ✅ httpOnly cookies are set
- ✅ Rate limiting blocks excessive requests
- ✅ Audit logs are created
- ✅ Password hashing uses Argon2

## 📊 Monitoring

### Audit Log Queries
```sql
-- Recent login attempts
SELECT * FROM "AuditLog" 
WHERE event IN ('LOGIN_OK', 'LOGIN_FAIL') 
ORDER BY "createdAt" DESC 
LIMIT 50;

-- Security events
SELECT * FROM "AuditLog" 
WHERE event IN ('BRUTE_FORCE_DETECTED', 'TOKEN_REVOKED', 'SUSPICIOUS_ACTIVITY')
ORDER BY "createdAt" DESC;

-- Failed login patterns
SELECT ip, COUNT(*) as attempts
FROM "AuditLog" 
WHERE event = 'LOGIN_FAIL' 
AND "createdAt" > NOW() - INTERVAL '1 hour'
GROUP BY ip 
ORDER BY attempts DESC;
```

### Health Checks
```bash
# Server health
curl http://localhost:3000/health

# Email service test
# (Check server logs for email configuration status)
```

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Error: P1001: Can't reach database server
```
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check network connectivity

**2. JWT Secret Missing**
```
JWT_SECRET must be at least 32 characters
```
- Generate secure secrets: `openssl rand -base64 32`
- Ensure JWT_SECRET ≠ JWT_REFRESH_SECRET

**3. CORS Errors**
```
CORS policy violation: Origin not allowed
```
- Add frontend URL to CORS_ORIGIN
- Ensure credentials: true in CORS config

**4. Email Not Sending**
```
Failed to send email: Authentication failed
```
- Verify SMTP credentials
- Use app-specific passwords for Gmail
- Check firewall/network restrictions

**5. Rate Limiting Too Aggressive**
```
Too many requests
```
- Adjust rate limits in `middlewares/rateLimit.ts`
- Clear failed attempts: restart server
- Use different IP for testing

### Debug Mode
Enable detailed logging:
```bash
LOG_LEVEL=debug npm run dev
```

### Reset Development Data
```bash
# Clear all auth-related data
npx prisma migrate reset
npx prisma migrate dev
```

## 📈 Performance Optimization

### Production Recommendations

1. **Use Redis for Rate Limiting**
   ```javascript
   // Replace in-memory store with Redis
   import RedisStore from 'rate-limit-redis';
   ```

2. **Database Indexing**
   ```sql
   -- Verify indexes exist
   \d+ "RefreshToken"
   \d+ "AuditLog"
   ```

3. **Connection Pooling**
   ```javascript
   // Prisma connection pool
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Monitoring Setup**
   - Application Performance Monitoring (APM)
   - Database query monitoring
   - Security event alerting
   - Rate limit metrics

## 🔮 Next Steps

1. **Deploy to staging environment**
2. **Run comprehensive tests**
3. **Monitor security metrics**
4. **Plan frontend migration**
5. **Implement 2FA when ready**
6. **Add OAuth providers**
7. **Set up session management**

## 📞 Support

For deployment issues:
1. Check server logs for detailed errors
2. Verify environment variables
3. Test database connectivity
4. Review CORS configuration
5. Check rate limiting status

The authentication system is now enterprise-ready with comprehensive security features while maintaining full backward compatibility! 🎉
