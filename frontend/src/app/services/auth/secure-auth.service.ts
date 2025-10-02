/**
 * 🔐 SECURE AUTH SERVICE
 * Integrates with the new secure backend authentication system
 * Fixes user restoration and route protection issues
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';

import { EnvironmentService } from '../core/environment.service';
import { NotificationService } from '../notification/notification.service';
import { User, LoginRequest, AuthResponse, UserRole } from '@app/models/auth.model';

interface StoredAuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  storedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class SecureAuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly environmentService = inject(EnvironmentService);
  private readonly notificationService = inject(NotificationService);

  // Storage keys
  private readonly STORAGE_KEYS = {
    AUTH_DATA: 'frontuna_secure_auth',
    USER_DATA: 'frontuna_user_data',
    ACCESS_TOKEN: 'frontuna_access_token',
    REFRESH_TOKEN: 'frontuna_refresh_token',
  } as const;

  // Reactive state
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isLoading = signal<boolean>(false);

  // Public signals
  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();

  // Computed properties
  public readonly isAdmin = computed(() => {
    const user = this._currentUser();
    return user?.role === 'admin';
  });

  public readonly isLoggedIn = computed(() => {
    return this._isAuthenticated() && !!this._currentUser();
  });

  constructor() {
    console.log('🔐 SecureAuthService: Initializing...');
    this.initializeAuth();
  }

  /**
   * Initialize authentication state
   */
  private async initializeAuth(): Promise<void> {
    try {
      // Check for stored auth data
      const storedAuthData = this.getStoredAuthData();
      
      if (storedAuthData && this.isAuthDataValid(storedAuthData)) {
        // Restore the EXACT user data (no fake users!)
        this._currentUser.set(storedAuthData.user);
        this._isAuthenticated.set(true);

        // Schedule token refresh if we have expiration time
        if (storedAuthData.expiresAt) {
          this.scheduleTokenRefresh(storedAuthData.expiresAt);
        }

        // Verify token is still valid with backend
        this.verifyTokenWithBackend(storedAuthData.accessToken).subscribe({
          next: (isValid) => {
            if (!isValid) {
              console.warn('⚠️ Stored token is invalid, attempting refresh...');
              if (storedAuthData.refreshToken) {
                this.attemptTokenRefresh(storedAuthData.refreshToken);
              } else {
                this.clearAuthState();
              }
            }
          },
          error: () => {
            // Token verification failed, try refresh or clear state
            if (storedAuthData.refreshToken) {
              this.attemptTokenRefresh(storedAuthData.refreshToken);
            } else {
              this.clearAuthState();
            }
          }
        });

        console.log('✅ Auth state restored from storage');
      } else {
        this.clearAuthState();
      }

    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      this.clearAuthState();
    }
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    
    return this.http.post<any>(`${this.environmentService.apiUrl}/auth/login`, credentials, {
      withCredentials: true // Important for cookies
    }).pipe(
      map(response => {
        if (response.success && response.user && response.token) {
          // Transform new API format to expected format
          return {
            user: response.user,
            accessToken: response.token,
            refreshToken: response.refreshToken || null,
            expiresIn: response.expiresIn || 86400 // Default to 24 hours
          } as AuthResponse;
        }
        throw new Error(response.error?.message || 'Login failed');
      }),
        tap(authResponse => {
          this.handleAuthSuccess(authResponse);
        }),
      catchError(error => {
        console.error('❌ Login failed:', error);
        this.handleAuthError(error);
        return throwError(() => error);
      }),
      finalize(() => {
        this._isLoading.set(false);
      })
    );
  }

  /**
   * Signup user
   */
  signup(signupData: any): Observable<AuthResponse> {
    this._isLoading.set(true);
    
    return this.http.post<any>(`${this.environmentService.apiUrl}/auth/signup`, signupData, {
      withCredentials: true // Important for cookies
    }).pipe(
      map(response => {
        if (response.success && response.user && response.token) {
          // Transform new API format to expected format
          return {
            user: response.user,
            accessToken: response.token,
            refreshToken: response.refreshToken || null,
            expiresIn: response.expiresIn || 86400 // Default to 24 hours
          } as AuthResponse;
        }
        throw new Error(response.error?.message || 'Signup failed');
      }),
        tap(authResponse => {
          this.handleAuthSuccess(authResponse);
        }),
      catchError(error => {
        console.error('❌ Signup failed:', error);
        this.handleAuthError(error);
        return throwError(() => error);
      }),
      finalize(() => {
        this._isLoading.set(false);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    this._isLoading.set(true);

    const refreshToken = localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
    
    // Always clear local state first for immediate logout
    this.clearAuthState();
    
    // Try to notify backend, but don't block logout if it fails
    const logoutRequest = this.http.post(`${this.environmentService.apiUrl}/auth/logout`, 
      { refreshToken }, 
      { withCredentials: true }
    ).pipe(
      tap(() => {
        // Backend logout successful
      }),
      catchError(error => {
        console.warn('⚠️ Backend logout failed, but local logout completed:', error);
        return of(null); // Don't fail logout on network error
      }),
      finalize(() => {
        this._isLoading.set(false);
        this.router.navigate(['/']); // Redirect to home page after logout
      })
    );

    return logoutRequest;
  }

  /**
   * Get user profile from backend
   */
  getUserProfile(): Observable<User> {
    return this.http.get<any>(`${this.environmentService.apiUrl}/auth/profile`).pipe(
      map(response => {
        if (response.success && response.data && response.data.user) {
          return response.data.user as User;
        }
        throw new Error(response.error?.message || 'Failed to get profile');
      }),
        tap(user => {
          this._currentUser.set(user);
          this.updateStoredUser(user);
        }),
      catchError(error => {
        console.error('❌ Failed to load profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<any>(`${this.environmentService.apiUrl}/auth/refresh`, 
      { refreshToken }, 
      { withCredentials: true }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Token refresh failed');
      }),
      tap(tokenData => {
        this.updateStoredTokens(tokenData.accessToken, tokenData.refreshToken, tokenData.expiresIn);
      }),
      catchError(error => {
        console.error('❌ Token refresh failed:', error);
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this._currentUser();
    return user?.role === role;
  }

  /**
   * Check if user is admin
   */
  isUserAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    const storedData = this.getStoredAuthData();
    return storedData?.accessToken || localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Private helper methods

  private handleAuthSuccess(authResponse: AuthResponse): void {
    // Store the REAL user data (not fake data!)
    this._currentUser.set(authResponse.user);
    this._isAuthenticated.set(true);

    // Calculate expiration time from API response
    const expiresAt = Date.now() + (authResponse.expiresIn * 1000); // Convert seconds to milliseconds

    // Store auth data securely with proper expiration
    this.storeAuthData({
      user: authResponse.user,
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken || this.generateRefreshToken(),
      expiresAt: expiresAt,
      storedAt: Date.now()
    });

    // Set up automatic token refresh before expiration
    this.scheduleTokenRefresh(expiresAt);

    console.log('✅ Auth success: User authenticated and session stored');
  }

  private handleAuthError(error: HttpErrorResponse): void {
    let message = 'Authentication failed';
    
    if (error.error?.error?.message) {
      message = error.error.error.message;
    } else if (error.message) {
      message = error.message;
    }

    this.notificationService.showError(message);
  }

  private storeAuthData(authData: StoredAuthData): void {
    try {
      // Store complete auth data
      localStorage.setItem(this.STORAGE_KEYS.AUTH_DATA, JSON.stringify(authData));
      
      // Store individual items for compatibility
      localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(authData.user));
      localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
      localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
      
      // Auth data stored securely
    } catch (error) {
      console.error('❌ Failed to store auth data:', error);
    }
  }

  private getStoredAuthData(): StoredAuthData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.AUTH_DATA);
      if (stored) {
        return JSON.parse(stored) as StoredAuthData;
      }

      // Fallback: try to reconstruct from individual items
      const user = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      const accessToken = localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);

      if (user && accessToken && refreshToken) {
        return {
          user: JSON.parse(user),
          accessToken,
          refreshToken,
          expiresAt: Date.now() + (15 * 60 * 1000), // Assume 15min expiry
          storedAt: Date.now()
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get stored auth data:', error);
      return null;
    }
  }

  private isAuthDataValid(authData: StoredAuthData): boolean {
    // Check if data exists and is not too old (max 7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    const age = authData.storedAt ? Date.now() - authData.storedAt : 0;
    
    // Check if token is expired
    const isTokenExpired = authData.expiresAt ? Date.now() > authData.expiresAt : false;
    
    // For local development, be more lenient with validation
    const hasRequiredData = !!(
      authData.user &&
      authData.user.email &&
      authData.accessToken &&
      authData.refreshToken
    );
    
    const isNotExpired = age < maxAge;
    
    // If token is expired but we have a refresh token, try to refresh
    if (isTokenExpired && authData.refreshToken && hasRequiredData) {
      this.attemptTokenRefresh(authData.refreshToken);
      return true; // Allow the session to continue while refresh is attempted
    }
    
    return hasRequiredData && isNotExpired && !isTokenExpired;
  }

  /**
   * Generate a refresh token for session management
   */
  private generateRefreshToken(): string {
    return `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Schedule automatic token refresh before expiration
   */
  private scheduleTokenRefresh(expiresAt: number): void {
    const refreshTime = expiresAt - (5 * 60 * 1000); // Refresh 5 minutes before expiry
    const timeUntilRefresh = refreshTime - Date.now();

    if (timeUntilRefresh > 0) {
      setTimeout(() => {
        const storedData = this.getStoredAuthData();
        if (storedData && storedData.refreshToken) {
          this.attemptTokenRefresh(storedData.refreshToken);
        }
      }, timeUntilRefresh);
    }
  }

  /**
   * Enhanced token refresh with better error handling
   */
  private attemptTokenRefresh(refreshToken: string): void {
    this.http.post<any>(`${this.environmentService.apiUrl}/auth/refresh`, 
      { refreshToken }, 
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        if (response.success && response.data.accessToken) {
          // Update stored auth data with new token
          const storedData = this.getStoredAuthData();
          if (storedData) {
            const newExpiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
            this.storeAuthData({
              ...storedData,
              accessToken: response.data.accessToken,
              expiresAt: newExpiresAt,
              storedAt: Date.now()
            });
            
            // Schedule next refresh
            this.scheduleTokenRefresh(newExpiresAt);
            console.log('✅ Token refreshed successfully');
          }
        }
      },
      error: (error) => {
        console.warn('⚠️ Token refresh failed, user may need to re-login:', error);
        // Don't immediately log out - let the user continue until they make a request
      }
    });
  }

  private updateStoredTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const storedData = this.getStoredAuthData();
    if (storedData) {
      storedData.accessToken = accessToken;
      storedData.refreshToken = refreshToken;
      storedData.expiresAt = Date.now() + (expiresIn * 1000);
      this.storeAuthData(storedData);
    }
  }

  private updateStoredUser(user: User): void {
    const storedData = this.getStoredAuthData();
    if (storedData) {
      storedData.user = user;
      this.storeAuthData(storedData);
    }
  }

  private verifyTokenWithBackend(token: string): Observable<boolean> {
    return this.http.get(`${this.environmentService.apiUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  private attemptTokenRefresh(refreshToken: string): void {
    this.http.post<any>(`${this.environmentService.apiUrl}/auth/refresh`, 
      { refreshToken }, 
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Token refresh successful');
          this.updateStoredTokens(
            response.data.accessToken, 
            response.data.refreshToken, 
            response.data.expiresIn
          );
        }
      },
      error: (error) => {
        console.error('❌ Token refresh failed:', error);
        this.clearAuthState();
      }
    });
  }

  private clearAuthState(): void {
    // Clear signals
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    
    // Clear storage
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear any legacy tokens
    const legacyKeys = [
      'access_token',
      'frontuna_primary_token',
      'frontuna_emergency_token',
      'frontuna_secure_access_token'
    ];
    
    legacyKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }
}
