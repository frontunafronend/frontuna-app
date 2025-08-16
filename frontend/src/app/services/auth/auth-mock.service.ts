import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError, delay } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { 
  User, 
  LoginRequest, 
  SignupRequest, 
  AuthResponse, 
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserRole,
  SubscriptionPlan,
  SubscriptionStatus
} from '@app/models/auth.model';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthMockService {
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  
  // Reactive state using signals
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly isAuthenticatedSignal = signal<boolean>(false);
  private readonly isLoadingSignal = signal<boolean>(false);
  
  // Public observables and computed values
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  public readonly isAuthenticated = computed(() => this.isAuthenticatedSignal());
  public readonly isLoading = computed(() => this.isLoadingSignal());
  public readonly currentUser = computed(() => this.currentUserSubject.value);

  // Mock users database
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'demo@frontuna.com',
      firstName: 'Demo',
      lastName: 'User',
      company: 'Frontuna Demo',
      role: UserRole.USER,
      avatar: undefined,
      isActive: true,
      isEmailVerified: true,
      subscription: {
        plan: SubscriptionPlan.PRO,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isTrialActive: false,
        trialEndDate: undefined
      },
      usage: {
        generationsUsed: 25,
        generationsLimit: 500,
        storageUsed: 150, // MB
        storageLimit: 2000, // MB
        lastResetDate: new Date()
      },
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          updates: true,
          marketing: false
        },
        ui: {
          enableAnimations: true,
          enableTooltips: true,
          compactMode: false
        }
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: '2',
      email: 'admin@frontuna.com',
      firstName: 'Admin',
      lastName: 'User',
      company: 'Frontuna',
      role: UserRole.ADMIN,
      avatar: undefined,
      isActive: true,
      isEmailVerified: true,
      subscription: {
        plan: SubscriptionPlan.ENTERPRISE,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isTrialActive: false,
        trialEndDate: undefined
      },
      usage: {
        generationsUsed: 0,
        generationsLimit: -1, // Unlimited
        storageUsed: 500,
        storageLimit: -1, // Unlimited
        lastResetDate: new Date()
      },
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          updates: true,
          marketing: true
        },
        ui: {
          enableAnimations: true,
          enableTooltips: true,
          compactMode: false
        }
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }
  ];

  constructor() {
    // Check if user was previously logged in (for demo purposes)
    const savedUser = localStorage.getItem('mock_current_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSignal.set(true);
        console.log('🔐 Mock Auth: Restored user session:', user.email);
      } catch (error) {
        console.error('Failed to restore mock user session:', error);
      }
    }
  }

  /**
   * Mock login with demo credentials
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 Mock Auth: Login attempt with:', credentials.email);
    this.isLoadingSignal.set(true);
    
    // Simulate network delay
    return of(null).pipe(
      delay(1000),
      map(() => {
        // Check if user exists in mock database
        let user = this.mockUsers.find(u => u.email === credentials.email);
        
        // If user doesn't exist, create a new demo user on-the-fly
        if (!user) {
          console.log('🆕 Mock Auth: Creating new demo user for:', credentials.email);
          
          // Extract name from email for demo purposes
          const emailParts = credentials.email.split('@');
          const namePart = emailParts[0];
          const firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          
          user = {
            id: Date.now().toString(),
            email: credentials.email,
            firstName: firstName,
            lastName: 'Demo',
            company: 'Demo Company',
            role: UserRole.USER,
            avatar: undefined,
            isActive: true,
            isEmailVerified: true,
            subscription: {
              plan: SubscriptionPlan.FREE,
              status: SubscriptionStatus.TRIAL,
              startDate: new Date(),
              endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
              isTrialActive: true,
              trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            },
            usage: {
              generationsUsed: Math.floor(Math.random() * 5), // Random usage for demo
              generationsLimit: 10,
              storageUsed: Math.floor(Math.random() * 20),
              storageLimit: 100,
              lastResetDate: new Date()
            },
            preferences: {
              theme: 'light',
              language: 'en',
              timezone: 'UTC',
              notifications: {
                email: true,
                push: false,
                updates: true,
                marketing: false
              },
              ui: {
                enableAnimations: true,
                enableTooltips: true,
                compactMode: false
              }
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Add to mock database for future logins
          this.mockUsers.push(user);
        }
        
        // For demo purposes, accept any password
        // In real implementation, you'd verify the password hash
        console.log('✅ Mock Auth: Login successful for:', user.email);
        
        // Create mock auth response
        const authResponse: AuthResponse = {
          user,
          accessToken: this.generateMockToken(user),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 3600 // 1 hour
        };
        
        return authResponse;
      }),
      tap((authResponse) => {
        // Store user session
        localStorage.setItem('mock_current_user', JSON.stringify(authResponse.user));
        localStorage.setItem('mock_access_token', authResponse.accessToken);
        
        // Update state
        this.currentUserSubject.next(authResponse.user);
        this.isAuthenticatedSignal.set(true);
        
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
        this.notificationService.showSuccess(`Welcome back, ${authResponse.user.firstName}!`);
      }),
      tap(() => this.isLoadingSignal.set(false))
    );
  }

  /**
   * Mock signup
   */
  signup(userData: SignupRequest): Observable<AuthResponse> {
    console.log('🔐 Mock Auth: Signup attempt with:', userData.email);
    this.isLoadingSignal.set(true);
    
    return of(null).pipe(
      delay(1500),
      map(() => {
        // Check if user already exists
        const existingUser = this.mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          throw new Error('User already exists');
        }
        
        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          company: userData.company,
          role: UserRole.USER,
          avatar: undefined,
          isActive: true,
          isEmailVerified: false,
          subscription: {
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.TRIAL,
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
            isTrialActive: true,
            trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          },
          usage: {
            generationsUsed: 0,
            generationsLimit: 10,
            storageUsed: 0,
            storageLimit: 100,
            lastResetDate: new Date()
          },
          preferences: {
            theme: 'light',
            language: 'en',
            timezone: 'UTC',
            notifications: {
              email: true,
              push: false,
              updates: true,
              marketing: userData.subscribeToNewsletter || false
            },
            ui: {
              enableAnimations: true,
              enableTooltips: true,
              compactMode: false
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Add to mock database
        this.mockUsers.push(newUser);
        
        console.log('✅ Mock Auth: Signup successful for:', newUser.email);
        
        const authResponse: AuthResponse = {
          user: newUser,
          accessToken: this.generateMockToken(newUser),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 3600
        };
        
        return authResponse;
      }),
      tap((authResponse) => {
        // Store user session
        localStorage.setItem('mock_current_user', JSON.stringify(authResponse.user));
        localStorage.setItem('mock_access_token', authResponse.accessToken);
        
        // Update state
        this.currentUserSubject.next(authResponse.user);
        this.isAuthenticatedSignal.set(true);
        
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
        this.notificationService.showSuccess(`Welcome to Frontuna, ${authResponse.user.firstName}!`);
      }),
      tap(() => this.isLoadingSignal.set(false))
    );
  }

  /**
   * Logout current user
   */
  logout(): void {
    console.log('🔐 Mock Auth: Logout');
    
    // Clear mock storage
    localStorage.removeItem('mock_current_user');
    localStorage.removeItem('mock_access_token');
    
    // Clear state
    this.currentUserSubject.next(null);
    this.isAuthenticatedSignal.set(false);
    
    // Navigate to login
    this.router.navigate(['/auth/login']);
    this.notificationService.showInfo('You have been logged out');
  }

  /**
   * Mock password reset
   */
  requestPasswordReset(request: ResetPasswordRequest): Observable<void> {
    return of(undefined).pipe(
      delay(1000),
      tap(() => {
        this.notificationService.showSuccess('Password reset email sent! (Mock)');
      })
    );
  }

  /**
   * Mock change password
   */
  changePassword(request: ChangePasswordRequest): Observable<void> {
    return of(undefined).pipe(
      delay(800),
      tap(() => {
        this.notificationService.showSuccess('Password changed successfully! (Mock)');
      })
    );
  }

  /**
   * Mock update profile
   */
  updateProfile(updates: UpdateProfileRequest): Observable<User> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const currentUser = this.currentUserSubject.value;
        if (!currentUser) {
          throw new Error('No user logged in');
        }
        
        // Update user data - ensure preferences are properly merged
        const updatedUser: User = {
          ...currentUser,
          ...updates,
          preferences: {
            ...currentUser.preferences,
            ...(updates.preferences || {})
          },
          updatedAt: new Date()
        };
        
        return updatedUser;
      }),
      tap((user) => {
        // Update storage and state
        localStorage.setItem('mock_current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.notificationService.showSuccess('Profile updated successfully!');
      })
    );
  }

  /**
   * Mock load user profile
   */
  loadUserProfile(): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }
    
    return of(currentUser).pipe(delay(200));
  }

  /**
   * Mock refresh token
   */
  refreshToken(): Observable<AuthResponse> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return throwError(() => new Error('No user to refresh'));
    }
    
    const authResponse: AuthResponse = {
      user: currentUser,
      accessToken: this.generateMockToken(currentUser),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 3600
    };
    
    return of(authResponse).pipe(delay(300));
  }

  /**
   * Mock get token
   */
  async getToken(): Promise<string | null> {
    return localStorage.getItem('mock_access_token');
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
   * Initialize mock auth (for compatibility)
   */
  async initializeForApp(): Promise<void> {
    console.log('🔐 Mock Auth: Initialize for app');
    // Already initialized in constructor
  }

  /**
   * Generate mock JWT token
   */
  private generateMockToken(user: User): string {
    // This is a mock token - DO NOT use in production
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    }));
    const signature = btoa('mock_signature');
    
    return `${header}.${payload}.${signature}`;
  }
}