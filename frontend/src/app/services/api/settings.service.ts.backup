import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { NotificationService } from '../notification/notification.service';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  timezone?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserPreferences {
  darkMode: boolean;
  compactMode: boolean;
  defaultFramework: 'react' | 'angular' | 'vue';
  autoSave: boolean;
  typescript: boolean;
  theme?: string;
}

export interface NotificationSettings {
  generationComplete: boolean;
  weeklySummary: boolean;
  planUpdates: boolean;
  browserNotifications: boolean;
  emailNotifications: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key?: string; // Only returned when creating
  created: string;
  lastUsed?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService extends BaseApiService {
  private readonly notificationService = inject(NotificationService);

  // State management
  private readonly _userPreferences = new BehaviorSubject<UserPreferences | null>(null);
  private readonly _notificationSettings = new BehaviorSubject<NotificationSettings | null>(null);
  private readonly _apiKeys = new BehaviorSubject<ApiKey[]>([]);

  // Public observables
  public readonly userPreferences$ = this._userPreferences.asObservable();
  public readonly notificationSettings$ = this._notificationSettings.asObservable();
  public readonly apiKeys$ = this._apiKeys.asObservable();

  constructor() {
    super();
    this.loadUserSettings();
  }

  /**
   * Handle API errors with default fallback values
   */
  private handleApiError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Let the app keep running by returning a safe result
      if (result !== undefined) {
        return of(result as T);
      }
      
      // For operations without fallback, show error and rethrow
      this.notificationService.showError(`Failed to ${operation}. Please try again.`);
      return throwError(() => error);
    };
  }

  /**
   * Load all user settings on service initialization
   */
  private loadUserSettings(): void {
    this.getUserPreferences().subscribe();
    this.getNotificationSettings().subscribe();
    this.getApiKeys().subscribe();
  }

  // ===== PROFILE MANAGEMENT =====

  /**
   * Update user profile information
   */
  updateProfile(profileData: Partial<UserProfile>): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/profile`, profileData).pipe(
      tap((response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('Profile updated successfully!');
        }
      }),
      catchError(this.handleApiError('update profile'))
    );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/profile`).pipe(
      catchError(this.handleApiError('get profile'))
    );
  }

  // ===== PASSWORD MANAGEMENT =====

  /**
   * Change user password
   */
  changePassword(passwordData: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/change-password`, passwordData).pipe(
      tap((response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('Password changed successfully!');
        }
      }),
      catchError(this.handleApiError('change password'))
    );
  }

  // ===== PREFERENCES MANAGEMENT =====

  /**
   * Get user preferences
   */
  getUserPreferences(): Observable<UserPreferences> {
    return this.http.get<any>(`${this.baseUrl}/users/preferences`).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._userPreferences.next(response.data);
        }
      }),
      catchError(this.handleApiError('get user preferences', {
        darkMode: false,
        compactMode: false,
        defaultFramework: 'react' as const,
        autoSave: true,
        typescript: true
      }))
    );
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/preferences`, preferences).pipe(
      tap((response: any) => {
        if (response.success) {
          // Update local state
          const currentPrefs = this._userPreferences.value;
          if (currentPrefs) {
            this._userPreferences.next({ ...currentPrefs, ...preferences });
          }
          this.notificationService.showSuccess('Preferences updated successfully!');
        }
      }),
      catchError(this.handleApiError('update preferences'))
    );
  }

  /**
   * Update a single preference
   */
  updateSinglePreference(key: keyof UserPreferences, value: any): Observable<any> {
    return this.updatePreferences({ [key]: value });
  }

  // ===== NOTIFICATION SETTINGS =====

  /**
   * Get notification settings
   */
  getNotificationSettings(): Observable<NotificationSettings> {
    return this.http.get<any>(`${this.baseUrl}/users/notifications`).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._notificationSettings.next(response.data);
        }
      }),
      catchError(this.handleApiError('get notification settings', {
        generationComplete: true,
        weeklySummary: true,
        planUpdates: true,
        browserNotifications: false,
        emailNotifications: true
      }))
    );
  }

  /**
   * Update notification settings
   */
  updateNotificationSettings(settings: Partial<NotificationSettings>): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/notifications`, settings).pipe(
      tap((response: any) => {
        if (response.success) {
          // Update local state
          const currentSettings = this._notificationSettings.value;
          if (currentSettings) {
            this._notificationSettings.next({ ...currentSettings, ...settings });
          }
          this.notificationService.showSuccess('Notification settings updated!');
        }
      }),
      catchError(this.handleApiError('update notification settings'))
    );
  }

  // ===== API KEY MANAGEMENT =====

  /**
   * Get all API keys
   */
  getApiKeys(): Observable<ApiKey[]> {
    return this.http.get<any>(`${this.baseUrl}/users/api-keys`).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._apiKeys.next(response.data);
        }
      }),
      catchError(this.handleApiError('get API keys', []))
    );
  }

  /**
   * Create new API key
   */
  createApiKey(name: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/api-keys`, { name }).pipe(
      tap((response: any) => {
        if (response.success) {
          // Refresh API keys list
          this.getApiKeys().subscribe();
          this.notificationService.showSuccess('API key created successfully!');
        }
      }),
      catchError(this.handleApiError('create API key'))
    );
  }

  /**
   * Delete API key
   */
  deleteApiKey(keyId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/api-keys/${keyId}`).pipe(
      tap((response: any) => {
        if (response.success) {
          // Update local state
          const currentKeys = this._apiKeys.value;
          this._apiKeys.next(currentKeys.filter(key => key.id !== keyId));
          this.notificationService.showSuccess('API key deleted successfully!');
        }
      }),
      catchError(this.handleApiError('delete API key'))
    );
  }

  // ===== TWO-FACTOR AUTHENTICATION =====

  /**
   * Enable/disable 2FA
   */
  toggle2FA(enable: boolean): Observable<any> {
    const endpoint = enable ? 'enable-2fa' : 'disable-2fa';
    return this.http.post(`${this.baseUrl}/auth/${endpoint}`, {}).pipe(
      tap((response: any) => {
        if (response.success) {
          const action = enable ? 'enabled' : 'disabled';
          this.notificationService.showSuccess(`Two-factor authentication ${action}!`);
        }
      }),
      catchError(this.handleApiError('toggle 2FA'))
    );
  }

  // ===== DATA EXPORT/IMPORT =====

  /**
   * Export user data
   */
  exportData(type: 'components' | 'settings' | 'all'): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/export/${type}`, { 
      responseType: 'blob' 
    }).pipe(
      tap(() => {
        this.notificationService.showSuccess(`${type} data exported successfully!`);
      }),
      catchError(this.handleApiError('export data'))
    );
  }

  /**
   * Import user data
   */
  importData(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.baseUrl}/users/import`, formData).pipe(
      tap((response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('Data imported successfully!');
        }
      }),
      catchError(this.handleApiError('import data'))
    );
  }

  // ===== DANGER ZONE =====

  /**
   * Clear all user components
   */
  clearAllComponents(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/components`).pipe(
      tap((response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('All components cleared successfully!');
        }
      }),
      catchError(this.handleApiError('clear all components'))
    );
  }

  /**
   * Delete user account
   */
  deleteAccount(password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/delete-account`, { password }).pipe(
      tap((response: any) => {
        if (response?.success) {
          this.notificationService.showSuccess('Account deleted successfully!');
        }
      }),
      catchError(this.handleApiError('delete account'))
    );
  }

  // ===== UTILITY METHODS =====

  /**
   * Get current preferences value
   */
  getCurrentPreferences(): UserPreferences | null {
    return this._userPreferences.value;
  }

  /**
   * Get current notification settings value
   */
  getCurrentNotificationSettings(): NotificationSettings | null {
    return this._notificationSettings.value;
  }

  /**
   * Get current API keys value
   */
  getCurrentApiKeys(): ApiKey[] {
    return this._apiKeys.value;
  }
}
