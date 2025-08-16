import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, timer } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { 
  User, 
  LoginRequest, 
  SignupRequest, 
  AuthResponse, 
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  TokenPayload 
} from '@app/models/auth.model';
import { ApiResponse } from '@app/models/api-response.model';
import { NotificationService } from '../notification/notification.service';
import { EncryptionService } from '../shared/encryption.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly encryptionService = inject(EncryptionService);
  
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  
  // Reactive state using signals
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly isAuthenticatedSignal = signal<boolean>(false);
  private readonly isLoadingSignal = signal<boolean>(false);
  
  // Public observables and computed values
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  public readonly isAuthenticated = computed(() => this.isAuthenticatedSignal());
  public readonly isLoading = computed(() => this.isLoadingSignal());
  public readonly currentUser = computed(() => this.currentUserSubject.value);
  
  // Token refresh timer
  private refreshTokenTimer?: any;

  constructor() {
    // Initialize auth synchronously first for immediate UI state
    this.initializeAuthSync();
    
    // Then initialize fully with async operations
    this.initializeAuth().catch(error => {
      console.error('Failed to initialize auth:', error);
    });
  }

  /**
   * Initialize auth state synchronously for immediate UI rendering
   */
  private initializeAuthSync(): void {
    try {
      console.log('🔐 Starting synchronous auth initialization...');
      
      // Check regular storage first for immediate state
      const regularToken = localStorage.getItem(environment.auth.tokenKey);
      if (regularToken && this.isTokenValid(regularToken)) {
        console.log('✅ Found valid token in regular storage');
        this.setAuthenticationState(true);
        return;
      }
      
      // Check if we have encrypted storage available
      if (this.encryptionService.isSecureStorageAvailable()) {
        // Check for encrypted data synchronously (will be validated async later)
        const encryptedToken = localStorage.getItem('frontuna_secure_access_token');
        const encryptedUser = localStorage.getItem('frontuna_secure_user_session');
        
        if (encryptedToken && encryptedUser) {
          console.log('✅ Found encrypted auth data, will validate async');
          this.setAuthenticationState(true);
          return;
        }
      }
      
      console.log('❌ No auth data found, user not authenticated');
      this.setAuthenticationState(false);
    } catch (error) {
      console.error('❌ Sync auth initialization failed:', error);
      this.setAuthenticationState(false);
    }
  }

  /**
   * Initialize authentication state from stored tokens and user session
   */
  private async initializeAuth(): Promise<void> {
    try {
      console.log('🔐 Starting async auth initialization...');
      
      // Check if encryption is available
      if (!this.encryptionService.isSecureStorageAvailable()) {
        console.warn('⚠️ Secure storage not available, using fallback');
        await this.initializeAuthFallbackAsync();
        return;
      }

      // Try to get stored session first
      const storedUser = await this.encryptionService.getUserSession();
      const token = await this.getStoredToken();

      console.log('🔍 Retrieved from storage:', {
        hasUser: !!storedUser,
        hasToken: !!token,
        tokenValid: token ? this.isTokenValid(token) : false
      });

      if (storedUser && token && this.isTokenValid(token)) {
        // Restore user session
        console.log('✅ Restoring user session from secure storage');
        this.currentUserSubject.next(storedUser);
        this.setAuthenticationState(true);
        await this.scheduleTokenRefresh();
        
        console.log('✅ Auth initialized from secure storage');
      } else if (token && this.isTokenValid(token)) {
        // Token exists but no user session, load from server
        console.log('🔄 Token found but no user session, loading from server');
        this.setAuthenticationState(true);
        this.loadUserProfile().subscribe({
          next: async (user) => {
            console.log('✅ User profile loaded, storing session');
            this.currentUserSubject.next(user);
            await this.encryptionService.storeUserSession(user);
            await this.scheduleTokenRefresh();
          },
          error: (error) => {
            console.error('❌ Failed to load user profile:', error);
            this.logout();
          }
        });
      } else {
        // No valid authentication found
        console.log('❌ No valid authentication found, clearing state');
        this.clearAuthState();
      }
    } catch (error) {
      console.error('❌ Failed to initialize secure auth:', error);
      await this.initializeAuthFallbackAsync();
    }
  }

  /**
   * Fallback initialization for when encryption is not available
   */
  private async initializeAuthFallbackAsync(): Promise<void> {
    console.log('🔄 Using fallback authentication initialization');
    
    const token = localStorage.getItem(environment.auth.tokenKey);
    if (token && this.isTokenValid(token)) {
      console.log('✅ Valid token found in regular storage');
      this.setAuthenticationState(true);
      
      this.loadUserProfile().subscribe({
        next: async (user) => {
          console.log('✅ User profile loaded in fallback mode');
          this.currentUserSubject.next(user);
          await this.scheduleTokenRefresh();
        },
        error: (error) => {
          console.error('❌ Failed to load user profile in fallback:', error);
          this.logout();
        }
      });
    } else {
      console.log('❌ No valid token in fallback mode');
      this.setAuthenticationState(false);
      this.currentUserSubject.next(null);
    }
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('AuthService: Login called with credentials:', credentials);
    console.log('AuthService: Sending POST to:', `${this.baseUrl}/login`);
    
    this.isLoadingSignal.set(true);
    
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, credentials)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Login failed');
          }
          return response.data;
        }),
        tap(async (authResponse) => {
          await this.handleAuthSuccess(authResponse);
          this.notificationService.showSuccess('Welcome back!');
        }),
        catchError(error => {
          console.error('AuthService: Login error:', error);
          console.error('AuthService: Error status:', error.status);
          console.error('AuthService: Error body:', error.error);
          this.notificationService.showError(error.error?.message || 'Login failed');
          return throwError(() => error);
        }),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  /**
   * Register new user
   */
  signup(userData: SignupRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/signup`, userData)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Registration failed');
          }
          return response.data;
        }),
        tap(async (authResponse) => {
          await this.handleAuthSuccess(authResponse);
          this.notificationService.showSuccess('Account created successfully!');
        }),
        catchError(error => {
          this.notificationService.showError(error.error?.message || 'Registration failed');
          return throwError(() => error);
        }),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  /**
   * Logout current user and clear all secure data
   */
  logout(): void {
    // Clear encrypted tokens and user session
    this.clearAuthState();
    
    // Clear user state  
    this.currentUserSubject.next(null);
    this.setAuthenticationState(false);
    
    // Clear refresh timer
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
      this.refreshTokenTimer = undefined;
    }
    
    // Navigate to login
    this.router.navigate(['/auth/login']);
    this.notificationService.showInfo('You have been logged out');
  }

  /**
   * Clear all authentication state and stored data
   */
  private clearAuthState(): void {
    try {
      // Clear encrypted storage
      this.encryptionService.clearUserSession();
      this.encryptionService.removeSecureItem('access_token');
      this.encryptionService.removeSecureItem('refresh_token');
      
      // Clear fallback storage
      localStorage.removeItem(environment.auth.tokenKey);
      localStorage.removeItem(environment.auth.refreshTokenKey);
    } catch (error) {
      console.error('Error clearing auth state:', error);
      // Fallback to clearing regular storage
      localStorage.removeItem(environment.auth.tokenKey);
      localStorage.removeItem(environment.auth.refreshTokenKey);
    }
  }

  /**
   * Request password reset
   */
  requestPasswordReset(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/reset-password`, request)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.error?.message || 'Password reset failed');
          }
        }),
        tap(() => {
          this.notificationService.showSuccess('Password reset email sent!');
        }),
        catchError(error => {
          this.notificationService.showError(error.error?.message || 'Password reset failed');
          return throwError(() => error);
        })
      );
  }

  /**
   * Change user password
   */
  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/change-password`, request)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.error?.message || 'Password change failed');
          }
        }),
        tap(() => {
          this.notificationService.showSuccess('Password changed successfully!');
        }),
        catchError(error => {
          this.notificationService.showError(error.error?.message || 'Password change failed');
          return throwError(() => error);
        })
      );
  }

  /**
   * Update user profile
   */
  updateProfile(updates: UpdateProfileRequest): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/profile`, updates)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Profile update failed');
          }
          return response.data;
        }),
        tap(user => {
          this.currentUserSubject.next(user);
          this.notificationService.showSuccess('Profile updated successfully!');
        }),
        catchError(error => {
          this.notificationService.showError(error.error?.message || 'Profile update failed');
          return throwError(() => error);
        })
      );
  }

  /**
   * Load current user profile
   */
  loadUserProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/profile`)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to load profile');
          }
          return response.data;
        })
      );
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<AuthResponse> {
    return new Observable(observer => {
      this.getStoredRefreshToken().then(refreshToken => {
        if (!refreshToken) {
          observer.error(new Error('No refresh token available'));
          return;
        }

        this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/refresh`, { refreshToken })
          .pipe(
            map(response => {
              if (!response.success || !response.data) {
                throw new Error(response.error?.message || 'Token refresh failed');
              }
              return response.data;
            }),
            tap(async (authResponse) => {
              await this.storeTokens(authResponse.accessToken, authResponse.refreshToken);
              await this.scheduleTokenRefresh();
            }),
            catchError(error => {
              this.logout();
              return throwError(() => error);
            })
          )
          .subscribe(observer);
      });
    });
  }

  /**
   * Get stored refresh token securely
   */
  private async getStoredRefreshToken(): Promise<string | null> {
    try {
      if (this.encryptionService.isSecureStorageAvailable()) {
        return await this.encryptionService.getSecureItem('refresh_token');
      } else {
        return localStorage.getItem(environment.auth.refreshTokenKey);
      }
    } catch (error) {
      console.error('Failed to get stored refresh token:', error);
      return localStorage.getItem(environment.auth.refreshTokenKey);
    }
  }

  /**
   * Get stored access token
   */
  async getToken(): Promise<string | null> {
    return await this.getStoredToken();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin') || this.hasRole('moderator');
  }

  /**
   * Handle successful authentication with secure storage
   */
  private async handleAuthSuccess(authResponse: AuthResponse): Promise<void> {
    try {
      // Store tokens securely
      await this.storeTokens(authResponse.accessToken, authResponse.refreshToken);
      
      // Store user session securely
      await this.encryptionService.storeUserSession(authResponse.user);
      
      // Update state
      this.currentUserSubject.next(authResponse.user);
      this.setAuthenticationState(true);
      
      // Schedule token refresh
      await this.scheduleTokenRefresh();
      
      // Navigate to dashboard
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Failed to handle auth success:', error);
      // Fallback to regular storage
      await this.handleAuthSuccessFallback(authResponse);
    }
  }

  /**
   * Fallback auth success handler
   */
  private async handleAuthSuccessFallback(authResponse: AuthResponse): Promise<void> {
    // Store tokens in regular storage
    localStorage.setItem(environment.auth.tokenKey, authResponse.accessToken);
    localStorage.setItem(environment.auth.refreshTokenKey, authResponse.refreshToken);
    
    // Update state
    this.currentUserSubject.next(authResponse.user);
    this.setAuthenticationState(true);
    
    // Schedule token refresh
    await this.scheduleTokenRefresh();
    
    // Navigate to dashboard
    this.router.navigate(['/dashboard']);
  }

  /**
   * Store tokens securely
   */
  private async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      if (this.encryptionService.isSecureStorageAvailable()) {
        await this.encryptionService.setSecureItem('access_token', accessToken);
        await this.encryptionService.setSecureItem('refresh_token', refreshToken);
      } else {
        // Fallback to regular storage
        localStorage.setItem(environment.auth.tokenKey, accessToken);
        localStorage.setItem(environment.auth.refreshTokenKey, refreshToken);
      }
    } catch (error) {
      console.error('Failed to store tokens securely:', error);
      // Fallback to regular storage
      localStorage.setItem(environment.auth.tokenKey, accessToken);
      localStorage.setItem(environment.auth.refreshTokenKey, refreshToken);
    }
  }

  /**
   * Get stored token securely
   */
  private async getStoredToken(): Promise<string | null> {
    try {
      if (this.encryptionService.isSecureStorageAvailable()) {
        return await this.encryptionService.getSecureItem('access_token');
      } else {
        return localStorage.getItem(environment.auth.tokenKey);
      }
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return localStorage.getItem(environment.auth.tokenKey);
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
  private decodeToken(token: string): TokenPayload {
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

  /**
   * Schedule automatic token refresh
   */
  private async scheduleTokenRefresh(): Promise<void> {
    try {
      const token = await this.getStoredToken();
      if (!token) return;

      const payload = this.decodeToken(token);
      const expiresAt = payload.exp * 1000;
      const refreshAt = expiresAt - environment.auth.tokenExpirationBuffer;
      const delay = refreshAt - Date.now();

      if (delay > 0) {
        this.refreshTokenTimer = timer(delay).subscribe(() => {
          this.refreshToken().subscribe({
            error: () => this.logout()
          });
        });
      }
    } catch (error) {
      console.error('Failed to schedule token refresh:', error);
      this.logout();
    }
  }

  /**
   * Set authentication state
   */
  private setAuthenticationState(isAuthenticated: boolean): void {
    console.log(`🔐 Setting auth state to: ${isAuthenticated}`);
    this.isAuthenticatedSignal.set(isAuthenticated);
  }

  /**
   * Public method to initialize auth (for APP_INITIALIZER)
   */
  public async initializeForApp(): Promise<void> {
    console.log('🚀 App initializer starting auth initialization...');
    
    try {
      // First do sync initialization
      this.initializeAuthSync();
      
      // Then do full async initialization  
      await this.initializeAuth();
      
      console.log('✅ App auth initialization complete');
    } catch (error) {
      console.error('❌ App auth initialization failed:', error);
      this.setAuthenticationState(false);
    }
  }
}