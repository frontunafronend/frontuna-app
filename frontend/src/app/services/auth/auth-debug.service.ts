import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { EncryptionService } from '../shared/encryption.service';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthDebugService {
  private readonly authService = inject(AuthService);
  private readonly encryptionService = inject(EncryptionService);

  /**
   * Get complete authentication debug information
   */
  async getAuthDebugInfo(): Promise<any> {
    const debug = {
      timestamp: new Date().toISOString(),
      authState: {
        isAuthenticated: this.authService.isAuthenticated(),
        currentUser: this.authService.currentUser(),
        isLoading: this.authService.isLoading()
      },
      storage: {
        encryptionAvailable: this.encryptionService.isSecureStorageAvailable(),
        regularStorage: {
          token: !!localStorage.getItem(environment.auth.tokenKey),
          refreshToken: !!localStorage.getItem(environment.auth.refreshTokenKey)
        },
        encryptedStorage: {
          token: !!localStorage.getItem('frontuna_secure_access_token'),
          refreshToken: !!localStorage.getItem('frontuna_secure_refresh_token'),
          userSession: !!localStorage.getItem('frontuna_secure_user_session')
        }
      },
      tokens: {
        hasToken: false,
        tokenValid: false,
        tokenExpiry: null as string | null
      }
    };

    // Get token information
    try {
      const token = await this.authService.getToken();
      debug.tokens.hasToken = !!token;
      
      if (token) {
        debug.tokens.tokenValid = this.isTokenValid(token);
        const payload = this.decodeToken(token);
        debug.tokens.tokenExpiry = new Date(payload.exp * 1000).toISOString();
      }
    } catch (error) {
      console.error('Failed to get token info:', error);
    }

    return debug;
  }

  /**
   * Print debug information to console
   */
  async logDebugInfo(): Promise<void> {
    const debug = await this.getAuthDebugInfo();
    console.group('🔍 Authentication Debug Info');
    console.log('📊 Debug Data:', debug);
    console.log('🔐 Auth State:', debug.authState);
    console.log('💾 Storage:', debug.storage);
    console.log('🎫 Tokens:', debug.tokens);
    console.groupEnd();
  }

  /**
   * Test authentication persistence
   */
  async testAuthPersistence(): Promise<void> {
    console.group('🧪 Testing Authentication Persistence');
    
    // Before refresh state
    const beforeRefresh = await this.getAuthDebugInfo();
    console.log('📸 Before refresh state:', beforeRefresh);
    
    // Simulate page refresh by reinitializing auth
    console.log('🔄 Simulating page refresh...');
    await this.authService.initializeForApp();
    
    // After refresh state
    const afterRefresh = await this.getAuthDebugInfo();
    console.log('📸 After refresh state:', afterRefresh);
    
    // Compare states
    const persistenceWorking = 
      beforeRefresh.authState.isAuthenticated === afterRefresh.authState.isAuthenticated &&
      beforeRefresh.authState.currentUser?.email === afterRefresh.authState.currentUser?.email;
    
    console.log(persistenceWorking ? '✅ Persistence test passed' : '❌ Persistence test failed');
    console.groupEnd();
  }

  /**
   * Clear all authentication data (for testing)
   */
  async clearAllAuthData(): Promise<void> {
    console.log('🧹 Clearing all authentication data...');
    
    // Clear encrypted storage
    this.encryptionService.clearUserSession();
    this.encryptionService.removeSecureItem('access_token');
    this.encryptionService.removeSecureItem('refresh_token');
    
    // Clear regular storage
    localStorage.removeItem(environment.auth.tokenKey);
    localStorage.removeItem(environment.auth.refreshTokenKey);
    
    // Clear any other auth-related storage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('frontuna_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ All authentication data cleared');
  }

  /**
   * Add debug commands to window for manual testing
   */
  addDebugCommands(): void {
    if (typeof window !== 'undefined') {
      (window as any).authDebug = {
        getInfo: () => this.getAuthDebugInfo(),
        logInfo: () => this.logDebugInfo(),
        testPersistence: () => this.testAuthPersistence(),
        clearAll: () => this.clearAllAuthData(),
        reinitialize: () => this.authService.initializeForApp()
      };
      
      console.log('🛠️ Debug commands added to window.authDebug:');
      console.log('  - window.authDebug.getInfo() - Get debug info');
      console.log('  - window.authDebug.logInfo() - Log debug info');
      console.log('  - window.authDebug.testPersistence() - Test persistence');
      console.log('  - window.authDebug.clearAll() - Clear all auth data');
      console.log('  - window.authDebug.reinitialize() - Reinitialize auth');
    }
  }

  /**
   * Check if token is valid and not expired
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Decode JWT token payload
   */
  private decodeToken(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }
}