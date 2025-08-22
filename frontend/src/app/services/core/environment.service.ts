import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

/**
 * Enterprise-grade Environment Detection Service
 * 
 * This service provides a centralized, robust way to detect the current environment
 * and provide appropriate configuration values. It implements multiple detection
 * strategies to ensure reliable environment identification.
 * 
 * @author Frontuna AI Team
 * @version 1.0.0
 */
@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  
  private readonly _environment = environment;
  private readonly _runtimeEnvironment: 'development' | 'staging' | 'production';
  private readonly _apiBaseUrl: string;
  private readonly _isLocalDevelopment: boolean;
  private readonly _isProduction: boolean;
  private readonly _detectionMethods: string[] = [];

  constructor() {
    // Multi-strategy environment detection for maximum reliability
    this._runtimeEnvironment = this.detectEnvironment();
    this._apiBaseUrl = this.determineApiUrl();
    this._isLocalDevelopment = this._runtimeEnvironment === 'development';
    this._isProduction = this._runtimeEnvironment === 'production';
    
    this.logEnvironmentInfo();
  }

  /**
   * Detect current environment using multiple strategies
   * Priority: URL-based > Build config > Fallback detection
   */
  private detectEnvironment(): 'development' | 'staging' | 'production' {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // Strategy 1: URL-based detection (most reliable for deployed apps)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168.')) {
      this._detectionMethods.push('URL-localhost');
      return 'development';
    }
    
    if (hostname.includes('staging') || hostname.includes('dev.') || hostname.includes('test.')) {
      this._detectionMethods.push('URL-staging');
      return 'staging';
    }
    
    if (hostname.includes('frontuna.com') || hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      this._detectionMethods.push('URL-production');
      return 'production';
    }
    
    // Strategy 2: Build configuration detection
    if (this._environment.production === false) {
      this._detectionMethods.push('Build-development');
      return 'development';
    }
    
    if (this._environment.production === true) {
      this._detectionMethods.push('Build-production');
      return 'production';
    }
    
    // Strategy 3: Protocol and port-based fallback
    if (protocol === 'http:' && (port === '4200' || port === '3000')) {
      this._detectionMethods.push('Protocol-development');
      return 'development';
    }
    
    // Strategy 4: Default fallback
    this._detectionMethods.push('Fallback-production');
    return 'production';
  }

  /**
   * Determine the correct API URL based on environment
   */
  private determineApiUrl(): string {
    const hostname = window.location.hostname;
    
    // Development environments
    if (this._runtimeEnvironment === 'development') {
      // Check if we're running on a different port and adjust accordingly
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
      }
      // For local network development (e.g., mobile testing)
      if (hostname.includes('192.168.') || hostname.includes('10.0.')) {
        return `http://${hostname}:3000/api`;
      }
    }
    
    // Staging environment
    if (this._runtimeEnvironment === 'staging') {
      return 'https://api-staging.frontuna.com/api';
    }
    
    // Production environment
    return 'https://api.frontuna.com/api';
  }

  /**
   * Log environment detection information for debugging
   */
  private logEnvironmentInfo(): void {
    const info = {
      detectedEnvironment: this._runtimeEnvironment,
      detectionMethods: this._detectionMethods,
      apiUrl: this._apiBaseUrl,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      port: window.location.port,
      buildConfig: {
        production: this._environment.production,
        apiUrl: this._environment.apiUrl
      }
    };
    
    console.group('🏗️ Environment Detection Service');
    console.log('✅ Environment detected:', this._runtimeEnvironment);
    console.log('🔗 API URL determined:', this._apiBaseUrl);
    console.log('🔍 Detection methods used:', this._detectionMethods);
    console.log('📊 Full detection info:', info);
    console.groupEnd();
  }

  // Public getters for environment information
  
  /**
   * Get the detected runtime environment
   */
  get environment(): 'development' | 'staging' | 'production' {
    return this._runtimeEnvironment;
  }

  /**
   * Get the appropriate API base URL for the current environment
   */
  get apiUrl(): string {
    return this._apiBaseUrl;
  }

  /**
   * Check if running in local development
   */
  get isLocalDevelopment(): boolean {
    return this._isLocalDevelopment;
  }

  /**
   * Check if running in production
   */
  get isProduction(): boolean {
    return this._isProduction;
  }

  /**
   * Check if running in staging
   */
  get isStaging(): boolean {
    return this._runtimeEnvironment === 'staging';
  }

  /**
   * Get the socket URL for the current environment
   */
  get socketUrl(): string {
    if (this._runtimeEnvironment === 'development') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
      }
      if (hostname.includes('192.168.') || hostname.includes('10.0.')) {
        return `http://${hostname}:3000`;
      }
    }
    
    if (this._runtimeEnvironment === 'staging') {
      return 'https://api-staging.frontuna.com';
    }
    
    return 'https://api.frontuna.com';
  }

  /**
   * Get environment-specific configuration
   */
  get config() {
    return {
      ...this._environment,
      // Override with detected values
      apiUrl: this._apiBaseUrl,
      socketUrl: this.socketUrl,
      production: this._isProduction,
      environment: this._runtimeEnvironment
    };
  }

  /**
   * Get debug information about environment detection
   */
  getDebugInfo() {
    return {
      detectedEnvironment: this._runtimeEnvironment,
      detectionMethods: this._detectionMethods,
      apiUrl: this._apiBaseUrl,
      socketUrl: this.socketUrl,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      port: window.location.port,
      originalConfig: this._environment,
      runtimeConfig: this.config
    };
  }
}
