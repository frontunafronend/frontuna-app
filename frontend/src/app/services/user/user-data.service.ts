import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { EnvironmentService } from '../core/environment.service';
import { NotificationService } from '../notification/notification.service';
import { AuthService } from '../auth/auth.service';
import { User } from '@app/models/auth.model';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  subscription: {
    plan: 'free' | 'pro' | 'premium' | 'enterprise';
    status: 'active' | 'inactive' | 'trial' | 'expired';
    startDate: Date;
    endDate: Date;
    isTrialActive: boolean;
  };
  usage: {
    generationsUsed: number;
    generationsLimit: number;
    storageUsed: number;
    storageLimit: number;
    lastResetDate: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private readonly http = inject(HttpClient);
  private readonly environmentService = inject(EnvironmentService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  private readonly apiUrl = `${this.environmentService.apiUrl}/users`;

  // Signals for reactive state management
  private readonly _userProfile = signal<UserProfile | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Public computed properties
  public readonly userProfile = this._userProfile.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();

  constructor() {
    console.log('🔧 USER DATA SERVICE INITIALIZED');
    
    // Monitor auth changes and fetch user data when authenticated
    this.authService.currentUser$.subscribe(user => {
      if (user?.id) {
        console.log('👤 User authenticated, fetching profile data...');
        this.fetchUserProfile(user.id).subscribe();
      } else {
        console.log('👤 User not authenticated, clearing profile data');
        this._userProfile.set(null);
      }
    });
  }

  /**
   * Fetch user profile from backend
   */
  fetchUserProfile(userId?: string): Observable<UserProfile> {
    const targetUserId = userId || this.authService.currentUser()?.id;
    console.log('🔍 Fetching user profile for:', targetUserId);
    
    if (!targetUserId) {
      console.warn('⚠️ No user ID available for profile fetch');
      const fallbackProfile = this.createFallbackProfile('anonymous');
      this._userProfile.set(fallbackProfile);
      return of(fallbackProfile);
    }

    this._isLoading.set(true);
    this._error.set(null);

    // Use current user endpoint if no specific user ID
    const endpoint = userId ? `${this.apiUrl}/${userId}/profile` : `${this.apiUrl}/profile`;

    return this.http.get<{success: boolean, data: UserProfile}>(endpoint).pipe(
      map(response => response.data),
      tap(profile => {
        console.log('✅ User profile fetched successfully:', profile);
        this._userProfile.set(profile);
        this._isLoading.set(false);
      }),
      catchError(error => {
        console.error('❌ Failed to fetch user profile:', error);
        this._error.set('Failed to load user profile');
        this._isLoading.set(false);
        
        // Create fallback user profile
        const fallbackProfile = this.createFallbackProfile(targetUserId);
        this._userProfile.set(fallbackProfile);
        
        this.notificationService.showWarning('Using offline user data');
        return of(fallbackProfile);
      })
    );
  }

  /**
   * Update user profile
   */
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Observable<UserProfile> {
    console.log('🔄 Updating user profile:', updates);
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.put<{success: boolean, data: UserProfile}>(`${this.apiUrl}/${userId}/profile`, updates).pipe(
      map(response => response.data),
      tap(profile => {
        console.log('✅ User profile updated successfully:', profile);
        this._userProfile.set(profile);
        this._isLoading.set(false);
        this.notificationService.showSuccess('Profile updated successfully');
      }),
      catchError(error => {
        console.error('❌ Failed to update user profile:', error);
        this._error.set('Failed to update profile');
        this._isLoading.set(false);
        this.notificationService.showError('Failed to update profile');
        throw error;
      })
    );
  }

  /**
   * Get user subscription details
   */
  getUserSubscription(): Observable<UserProfile['subscription']> {
    const profile = this._userProfile();
    if (profile?.subscription) {
      return of(profile.subscription);
    }

    const currentUser = this.authService.currentUser();
    if (currentUser?.id) {
      return this.fetchUserProfile(currentUser.id).pipe(
        map(profile => profile.subscription)
      );
    }

    // Return default free subscription
    return of({
      plan: 'free',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isTrialActive: false
    });
  }

  /**
   * Get user usage statistics
   */
  getUserUsage(): Observable<UserProfile['usage']> {
    const profile = this._userProfile();
    if (profile?.usage) {
      return of(profile.usage);
    }

    const currentUser = this.authService.currentUser();
    if (currentUser?.id) {
      return this.fetchUserProfile(currentUser.id).pipe(
        map(profile => profile.usage)
      );
    }

    // Return default usage
    return of({
      generationsUsed: 0,
      generationsLimit: 10,
      storageUsed: 0,
      storageLimit: 100,
      lastResetDate: new Date()
    });
  }

  /**
   * Create fallback user profile when backend is unavailable
   */
  private createFallbackProfile(userId: string): UserProfile {
    const currentUser = this.authService.currentUser();
    const isAdmin = currentUser?.email === 'admin@frontuna.com' || currentUser?.role === 'admin';
    
    console.log('🛡️ Creating fallback user profile for:', currentUser?.email);
    
    return {
      id: userId,
      email: currentUser?.email || 'user@example.com',
      firstName: currentUser?.firstName || 'User',
      lastName: currentUser?.lastName || 'Name',
      role: isAdmin ? 'admin' : 'user',
      subscription: {
        plan: isAdmin ? 'premium' : 'free',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isTrialActive: false
      },
      usage: {
        generationsUsed: 0,
        generationsLimit: isAdmin ? 1000 : 10,
        storageUsed: 0,
        storageLimit: isAdmin ? 1000 : 100,
        lastResetDate: new Date()
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Refresh user data from backend
   */
  refreshUserData(): Observable<UserProfile | null> {
    const currentUser = this.authService.currentUser();
    if (currentUser?.id) {
      return this.fetchUserProfile(currentUser.id);
    }
    return of(null);
  }

  /**
   * Get user analytics
   */
  getUserAnalytics(): Observable<any[]> {
    return this.http.get<{success: boolean, data: any[]}>(`${this.apiUrl}/analytics`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('❌ Failed to fetch analytics:', error);
        return of([]);
      })
    );
  }

  /**
   * Get generation history
   */
  getGenerationHistory(page: number = 1, limit: number = 20): Observable<any[]> {
    return this.http.get<{success: boolean, data: any[]}>(`${this.apiUrl}/analytics/generations?page=${page}&limit=${limit}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('❌ Failed to fetch generation history:', error);
        return of([]);
      })
    );
  }

  /**
   * Get usage trends
   */
  getUsageTrends(period: '7d' | '30d' | '90d' = '7d'): Observable<any[]> {
    return this.http.get<{success: boolean, data: any[]}>(`${this.apiUrl}/analytics/usage-trends?period=${period}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('❌ Failed to fetch usage trends:', error);
        return of([]);
      })
    );
  }

  /**
   * Get user preferences
   */
  getUserPreferences(): Observable<any> {
    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}/preferences`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('❌ Failed to fetch preferences:', error);
        return of({
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            updates: true,
            marketing: false
          }
        });
      })
    );
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(preferences: any): Observable<any> {
    return this.http.put<{success: boolean, data: any}>(`${this.apiUrl}/preferences`, preferences).pipe(
      map(response => response.data),
      tap(() => {
        this.notificationService.showSuccess('Preferences updated successfully');
      }),
      catchError(error => {
        console.error('❌ Failed to update preferences:', error);
        this.notificationService.showError('Failed to update preferences');
        throw error;
      })
    );
  }

  /**
   * Get user notifications
   */
  getUserNotifications(): Observable<any[]> {
    return this.http.get<{success: boolean, data: any[]}>(`${this.apiUrl}/notifications`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('❌ Failed to fetch notifications:', error);
        return of([]);
      })
    );
  }

  /**
   * Mark notification as read
   */
  markNotificationRead(notificationId: string): Observable<void> {
    return this.http.put<{success: boolean}>(`${this.apiUrl}/notifications/${notificationId}/read`, {}).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('❌ Failed to mark notification as read:', error);
        throw error;
      })
    );
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<{success: boolean}>(`${this.apiUrl}/notifications/${notificationId}`).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('❌ Failed to delete notification:', error);
        throw error;
      })
    );
  }

  /**
   * Change password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<{success: boolean}>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      map(() => void 0),
      tap(() => {
        this.notificationService.showSuccess('Password changed successfully');
      }),
      catchError(error => {
        console.error('❌ Failed to change password:', error);
        this.notificationService.showError('Failed to change password');
        throw error;
      })
    );
  }

  /**
   * Export user data
   */
  exportUserData(): Observable<any> {
    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}/export`).pipe(
      map(response => response.data),
      tap(() => {
        this.notificationService.showSuccess('User data exported successfully');
      }),
      catchError(error => {
        console.error('❌ Failed to export user data:', error);
        this.notificationService.showError('Failed to export user data');
        throw error;
      })
    );
  }

  /**
   * Clear user data (on logout)
   */
  clearUserData(): void {
    console.log('🧹 Clearing user data');
    this._userProfile.set(null);
    this._error.set(null);
    this._isLoading.set(false);
  }
}
