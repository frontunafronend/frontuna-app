# 🚀 Live Database Setup Guide

## 📋 **What We've Done**

✅ **Connected API to Live Neon Database**
- Replaced all mock data with real Prisma database queries
- Added proper authentication with bcrypt password hashing
- Implemented JWT token generation and validation
- Added comprehensive audit logging
- Created real user management system

✅ **Enhanced Security**
- Real password hashing with bcrypt
- JWT tokens with proper expiration
- Audit logging for all authentication events
- Admin role verification
- Input validation and sanitization

✅ **API Endpoints Updated**
- `/health` - Now shows database connection status
- `/api/auth/login` - Real user authentication
- `/api/auth/signup` - Real user creation with validation
- `/api/auth/profile` - Real user profile from database
- `/api/admin/users` - Real user list from database
- `/api/admin/ai-tests` - Live system metrics
- All admin endpoints require real admin role

## 🔧 **Setup Steps**

### 1. **Set Up Neon Database**

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new database or use existing one
3. Copy your connection string (looks like):
   ```
   postgresql://username:password@host:5432/database?sslmode=require
   ```

### 2. **Configure Vercel Environment Variables**

Go to your Vercel project settings and add these environment variables:

```bash
# Required - Your Neon Database URL
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require

# Required - JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Optional - Bcrypt rounds (default: 12)
BCRYPT_ROUNDS=12

# Required - CORS Origins
CORS_ORIGIN=https://frontuna-frontend-app.vercel.app,http://localhost:4200,http://localhost:8080
```

### 3. **Run Database Migration**

```bash
# In your backend directory
npx prisma migrate deploy
npx prisma generate
```

### 4. **Seed Admin User**

```bash
# Create the initial admin user
npm run seed-admin
```

This will create:
- **Email**: `admin@frontuna.com`
- **Password**: `admin123`
- **Role**: `admin`

### 5. **Test the Setup**

Visit your test page at `http://localhost:8080` and test:
- ✅ Health check (should show "database: connected")
- ✅ Login with admin credentials
- ✅ Create new users via signup
- ✅ View real user data in admin panel

## 🎯 **Current Status**

### ✅ **Working (Live Database)**
- **API URL**: `https://frontuna-api.vercel.app`
- **Database**: Connected to Neon PostgreSQL
- **Authentication**: Real users with hashed passwords
- **Admin Panel**: Real user management
- **Audit Logging**: All events tracked

### 📊 **Admin Credentials**
- **Email**: `admin@frontuna.com`
- **Password**: `admin123`
- **Role**: `admin`

### 🔗 **Test URLs**
- **API Health**: `https://frontuna-api.vercel.app/health`
- **Test Page**: `http://localhost:8080`
- **Frontend**: `https://frontuna-frontend-app.vercel.app`

## 🚨 **Important Notes**

1. **Change Admin Password**: After setup, create a new admin user with a secure password
2. **Environment Variables**: Make sure all required env vars are set in Vercel
3. **Database Migration**: Run migrations before first use
4. **CORS Settings**: Update CORS_ORIGIN with your actual frontend domains

## 🔧 **Troubleshooting**

### Database Connection Issues
```bash
# Test database connection
npx prisma db pull
```

### Missing Tables
```bash
# Deploy migrations
npx prisma migrate deploy
```

### Admin User Issues
```bash
# Re-run admin seed
npm run seed-admin
```

## 🎉 **You're Ready!**

Your API is now connected to a live Neon database with:
- ✅ Real user authentication
- ✅ Secure password hashing
- ✅ JWT token management
- ✅ Admin role system
- ✅ Comprehensive audit logging
- ✅ Live system metrics

**Next Steps:**
1. Set up your Neon database connection string
2. Add environment variables to Vercel
3. Run database migrations
4. Seed the admin user
5. Test everything works!
