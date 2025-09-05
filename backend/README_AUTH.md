# 🔐 Frontuna Authentication System

## Overview

The Frontuna authentication system has been upgraded to enterprise-grade security standards while maintaining backward compatibility with the existing frontend. This document outlines the secure authentication flows, cookie settings, and migration path.

## 🏗️ Architecture

### Core Components

- **Prisma Schema**: Secure database models with proper indexing
- **JWT Tokens**: Short-lived access tokens (15min) with proper claims
- **Refresh Tokens**: Secure rotation with chain tracking (45 days)
- **Password Security**: Argon2id with bcrypt fallback
- **Rate Limiting**: Progressive backoff for brute force protection
- **Audit Logging**: Comprehensive security event tracking
- **Email Verification**: One-time tokens with proper expiry
- **2FA Support**: TOTP scaffolding for future implementation

### Security Features

✅ **Token Rotation**: Refresh tokens rotate on every use  
✅ **Chain Tracking**: Revoked token detection with chain invalidation  
✅ **httpOnly Cookies**: Secure refresh token storage  
✅ **Password Upgrade**: Automatic bcrypt → argon2 migration  
✅ **Brute Force Protection**: Progressive delays for failed attempts  
✅ **Audit Logging**: All security events tracked  
✅ **Rate Limiting**: Multiple tiers of protection  
✅ **Email Security**: One-time tokens with short expiry  

## 🔑 Authentication Flows

### 1. User Registration

```
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "agreeToTerms": true
}
```

**Flow:**
1. Validate input (Zod schema)
2. Check email uniqueness
3. Hash password (Argon2id)
4. Create user + default subscription
5. Generate email verification token (24h)
6. Send verification email
7. Generate JWT access token (15min)
8. Generate refresh token (45 days)
9. Set httpOnly cookie + return JSON response
10. Log audit event

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "user" },
    "accessToken": "eyJ...",
    "refreshToken": "abc123...",
    "expiresIn": 1640995200
  }
}
```

### 2. User Login

```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "code": "123456"  // Optional 2FA
}
```

**Flow:**
1. Validate credentials
2. Check user exists & active
3. Verify password (upgrade bcrypt→argon2 if needed)
4. Verify 2FA code (if enabled)
5. Update login metadata
6. Generate new tokens
7. Set httpOnly cookie + return JSON
8. Log successful login

### 3. Token Refresh

```
POST /api/auth/refresh
{
  "refreshToken": "abc123..."  // Optional, can use cookie
}
```

**Flow:**
1. Extract token (cookie preferred, body fallback)
2. Verify JWT signature & expiry
3. Find stored token in database
4. Check not revoked & user active
5. Generate new token pair
6. Mark old token as replaced
7. Set new cookie + return new tokens
8. Log refresh event

**Security:** If revoked token used → revoke entire chain

### 4. Password Reset

**Request Reset:**
```
POST /api/auth/reset-password
{
  "email": "user@example.com"
}
```

**Confirm Reset:**
```
POST /api/auth/reset-password/:token
{
  "newPassword": "NewSecurePass456!"
}
```

**Flow:**
1. Generate one-time token (15min expiry)
2. Hash token for storage
3. Send email with raw token
4. On confirmation: verify token, update password
5. Revoke all refresh tokens
6. Mark token as used

## 🍪 Cookie Configuration

### Refresh Token Cookie (`frt`)

```javascript
{
  name: 'frt',
  httpOnly: true,                    // Prevent XSS access
  secure: NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict',               // CSRF protection
  path: '/api/auth/refresh',        // Limit scope
  maxAge: 45 * 24 * 60 * 60 * 1000 // 45 days
}
```

### CORS Configuration

```javascript
{
  origin: [
    'http://localhost:4200',
    'http://localhost:4201', 
    'https://frontuna.com'
  ],
  credentials: true  // Required for cookies
}
```

## 🔄 Migration Strategy

### Phase 1: Dual Support (Current)
- ✅ Set httpOnly cookies on login/refresh
- ✅ Still return refreshToken in JSON response
- ✅ Accept refresh token from cookie OR body
- ✅ Frontend continues using localStorage

### Phase 2: Cookie Migration (Future)
- Update frontend to use cookies only
- Remove refreshToken from JSON responses
- Remove localStorage token handling
- Update interceptors for cookie-based auth

### Phase 3: Cleanup (Future)
- Remove body-based refresh token support
- Enforce cookie-only refresh flow
- Remove transition compatibility code

## 🛡️ Security Measures

### Password Security
- **Argon2id** for new passwords (memory: 64MB, iterations: 3)
- **Bcrypt fallback** for existing passwords
- **Automatic upgrade** on successful login
- **Minimum requirements**: 8+ chars, mixed case, numbers, symbols

### Token Security
- **Access JWT**: 15-minute expiry, HS256, claims: `sub`, `email`, `role`
- **Refresh Token**: 45-day expiry, secure random (96 hex chars)
- **Hashed storage**: Only SHA256 hashes stored in database
- **Rotation**: New token on every refresh, old token marked replaced
- **Chain revocation**: Compromised token revokes entire chain

### Rate Limiting
- **General API**: 100 requests / 15 minutes
- **Auth endpoints**: 10 attempts / 15 minutes  
- **Password reset**: 3 requests / hour
- **Email verification**: 3 requests / 10 minutes
- **Brute force**: Progressive delays (1min → 1hour)

### Audit Logging
Events tracked: `SIGNUP`, `LOGIN_OK`, `LOGIN_FAIL`, `REFRESH_OK`, `REFRESH_FAIL`, `LOGOUT`, `VERIFY_REQUEST`, `VERIFY_OK`, `RESET_REQUEST`, `RESET_OK`, `TWOFA_*`

## 🔧 Environment Variables

### Required
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=different-32-char-secret
```

### Optional
```bash
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=45d
CORS_ORIGIN=http://localhost:4200,https://frontuna.com
FRONTEND_URL=http://localhost:4200
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@frontuna.ai
```

## 🧪 Testing

Run the test suite:
```bash
npm test auth.e2e.test.ts
```

Tests cover:
- ✅ Signup flow with validation
- ✅ Login with various scenarios
- ✅ Token refresh rotation
- ✅ Password reset flow
- ✅ Rate limiting enforcement
- ✅ Security edge cases

## 🚀 Deployment

### Database Migration
```bash
npx prisma migrate dev --name auth-security-upgrade
npx prisma generate
```

### Production Checklist
- [ ] Set secure environment variables
- [ ] Configure SMTP for emails
- [ ] Set up Redis for rate limiting (optional)
- [ ] Enable HTTPS for secure cookies
- [ ] Configure proper CORS origins
- [ ] Set up monitoring for audit logs

## 🔮 Future Enhancements

### 2FA Implementation
- TOTP setup/enable/disable endpoints
- QR code generation for authenticator apps
- Backup codes for recovery
- Enforce 2FA for admin users

### Session Management
- Device tracking and management
- Active session listing
- Remote logout capability
- Suspicious activity detection

### Advanced Security
- Device fingerprinting
- Geolocation-based alerts
- OAuth provider integration (Google, GitHub)
- Hardware security key support (WebAuthn)

## 📞 Support

For questions or issues with the authentication system:
1. Check audit logs for security events
2. Review rate limiting status
3. Verify environment configuration
4. Test with provided E2E test suite

## 🔄 API Compatibility

All existing endpoints maintain the same:
- ✅ URL paths (`/api/auth/*`)
- ✅ Request formats
- ✅ Response structures
- ✅ HTTP status codes
- ✅ Error message formats

The frontend will continue working without changes during the transition period.
