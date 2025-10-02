import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * 🎯 PROFESSIONAL ENVIRONMENT CONFIGURATION SERVICE
 * 
 * Centralized configuration management for local vs production environments.
 * Provides type-safe, environment-aware configuration for the entire application.
 */
@Injectable({
  providedIn: 'root'
})
export class EnvironmentConfigService {
  
  // Environment detection
  readonly isProduction = environment.production;
  readonly isDevelopment = !environment.production;
  readonly isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // API Configuration
  readonly apiConfig = {
    baseUrl: this.getApiBaseUrl(),
    timeout: this.isProduction ? 10000 : 30000, // 10s prod, 30s dev
    retryAttempts: this.isProduction ? 3 : 1,
    retryDelay: 1000
  };
  
  // CORS Configuration
  readonly corsConfig = {
    mode: this.isProduction ? 'strict' : 'permissive' as 'strict' | 'permissive',
    allowedOrigins: this.getAllowedOrigins(),
    credentials: true
  };
  
  // Authentication Configuration
  readonly authConfig = {
    tokenExpiry: this.isProduction ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 24h prod, 7d dev
    refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
    maxLoginAttempts: this.isProduction ? 5 : 10,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    sessionTimeout: this.isProduction ? 60 * 60 * 1000 : 8 * 60 * 60 * 1000 // 1h prod, 8h dev
  };
  
  // Security Configuration
  readonly securityConfig = {
    enableCSRF: this.isProduction,
    enableAuditLog: this.isProduction,
    enableRateLimit: this.isProduction,
    encryptLocalStorage: this.isProduction,
    strictSSL: this.isProduction
  };
  
  // Feature Flags
  readonly features = {
    enableDebugMode: this.isDevelopment,
    enableDevTools: this.isDevelopment,
    enableMockData: this.isDevelopment,
    enableEmergencyAccess: true, // Always enabled for admin access
    enableOfflineMode: false,
    enableAnalytics: this.isProduction
  };
  
  // Admin Configuration
  readonly adminConfig = {
    emergencyEmails: ['admin@frontuna.com', 'amir@frontuna.com'],
    setupKey: 'frontuna-admin-2024',
    maxAdminSessions: this.isProduction ? 3 : 10,
    adminSessionTimeout: 2 * 60 * 60 * 1000 // 2 hours
  };
  
  /**
   * Get API base URL based on environment
   */
  private getApiBaseUrl(): string {
    if (this.isProduction) {
      return 'https://api.frontuna.com';
    }
    
    if (this.isLocal) {
      return environment.socketUrl;
    }
    
    // Staging or other environments
    return environment.apiUrl;
  }
  
  /**
   * Get allowed CORS origins
   */
  private getAllowedOrigins(): string[] {
    if (this.isProduction) {
      return [
        'https://www.frontuna.com',
        'https://frontuna.com',
        'https://app.frontuna.com'
      ];
    }
    
    return [
      'http://localhost:4200',
      environment.socketUrl,
      'http://127.0.0.1:4200',
      'http://127.0.0.1:3000'
    ];
  }
  
  /**
   * Check if current environment matches specified type
   */
  isEnvironment(env: 'production' | 'development' | 'local'): boolean {
    switch (env) {
      case 'production':
        return this.isProduction;
      case 'development':
        return this.isDevelopment;
      case 'local':
        return this.isLocal;
      default:
        return false;
    }
  }
  
  /**
   * Get environment-specific configuration
   */
  getConfig<T>(key: keyof this): T {
    return (this as any)[key];
  }
  
  /**
   * Log current environment configuration (development only)
   */
  logEnvironmentInfo(): void {
    if (this.isDevelopment) {
      console.group('🔧 Environment Configuration');
      console.log('Environment:', this.isProduction ? 'Production' : 'Development');
      console.log('Is Local:', this.isLocal);
      console.log('API Base URL:', this.apiConfig.baseUrl);
      console.log('CORS Mode:', this.corsConfig.mode);
      console.log('Features:', this.features);
      console.groupEnd();
    }
  }
}
