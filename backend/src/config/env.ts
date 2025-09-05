/**
 * 🔐 SECURE ENVIRONMENT CONFIGURATION
 * Validates all required environment variables with Zod
 * Fails fast if critical variables are missing in production
 */

import { z } from 'zod';

// Environment schema validation
const envSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // JWT Secrets
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('45d'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:4200,http://localhost:4201,https://frontuna.com'),
  FRONTEND_URL: z.string().default('http://localhost:4200'),
  
  // Email (SMTP)
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@frontuna.ai'),
  
  // Security
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  
  // Optional
  LOG_LEVEL: z.string().default('info'),
  CORS_DEBUG: z.string().optional(),
});

// Parse and validate environment
function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    
    // Additional production checks
    if (env.NODE_ENV === 'production') {
      if (!env.SMTP_USER || !env.SMTP_PASS) {
        throw new Error('SMTP credentials are required in production');
      }
      
      if (env.JWT_SECRET === env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different in production');
      }
    }
    
    // Parse CORS origins
    const corsOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim());
    
    return {
      ...env,
      corsOrigins,
      isDevelopment: env.NODE_ENV === 'development',
      isProduction: env.NODE_ENV === 'production',
      isTest: env.NODE_ENV === 'test',
    };
    
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error(`  - ${error.message}`);
    }
    process.exit(1);
  }
}

// Export validated environment
export const env = validateEnv();

// Type for environment
export type Environment = typeof env;

console.log(`✅ Environment validated for ${env.NODE_ENV} mode`);
