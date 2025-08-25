/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:38:46.950Z
 * Issues detected: 2
 * 
 * This file is protected against common bugs:
 * - SETTINGS_NOT_PERSISTED: CRITICAL
 * - FORM_SUBMISSION_NO_DB: HIGH
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:32:02.178Z
 * Issues detected: 2
 * 
 * This file is protected against common bugs:
 * - SETTINGS_NOT_PERSISTED: CRITICAL
 * - FORM_SUBMISSION_NO_DB: HIGH
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:30:47.989Z
 * Issues detected: 2
 * 
 * This file is protected against common bugs:
 * - SETTINGS_NOT_PERSISTED: CRITICAL
 * - FORM_SUBMISSION_NO_DB: HIGH
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:22:46.001Z
 * Issues detected: 2
 * 
 * This file is protected against common bugs:
 * - SETTINGS_NOT_PERSISTED: CRITICAL
 * - FORM_SUBMISSION_NO_DB: HIGH
 */

import { Component, OnInit, inject, computed, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth/auth.service';
import { SettingsService, UserPreferences, NotificationSettings, ApiKey } from '../../services/api/settings.service';
import { NotificationService } from '../../services/notification/notification.service';
import { UserDataService } from '../../services/user/user-data.service';
import { GlobalLoaderService } from '../../services/ui/global-loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatTabsModule,
    MatChipsModule,
    MatExpansionModule,
    MatDialogModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly settingsService = inject(SettingsService);
  private readonly userDataService = inject(UserDataService);
  private readonly notificationService = inject(NotificationService);
  private readonly globalLoader = inject(GlobalLoaderService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  // Subscriptions
  private subscriptions = new Subscription();

  // Signals for reactive state
  public readonly currentUser = computed(() => this.authService.currentUser());
  public readonly isLoading = signal(false);
  public readonly preferences = signal<UserPreferences>({
    darkMode: false,
    compactMode: false,
    defaultFramework: 'react',
    autoSave: true,
    typescript: true
  });
  public readonly notifications = signal<NotificationSettings>({
    generationComplete: true,
    weeklySummary: true,
    planUpdates: true,
    browserNotifications: false,
    emailNotifications: true
  });
  public readonly apiKeys = signal<ApiKey[]>([]);
  public readonly twoFactorEnabled = signal(false);

  // Profile form
  profileForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    company: [''],
    timezone: ['UTC']
  });

  ngOnInit(): void {
    console.log('🔧 SETTINGS COMPONENT INITIALIZING WITH ENHANCED DB CONNECTIVITY');
    this.loadUserSettings();
    this.setupSubscriptions();
    
    // 🚀 SPRINT 1: Load comprehensive user data
    this.userDataService.fetchUserProfile().subscribe({
      next: (profile) => {
        console.log('✅ Settings comprehensive profile loaded:', profile);
        // Update profile form with comprehensive data
        this.profileForm.patchValue({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          company: (profile as any).company || '',
          timezone: 'UTC'
        });
      },
      error: (error) => {
        console.warn('⚠️ Settings comprehensive profile fetch failed:', error);
      }
    });
    
    // Load user preferences from UserDataService
    this.userDataService.getUserPreferences().subscribe({
      next: (preferences) => {
        console.log('✅ Settings comprehensive preferences loaded:', preferences);
      },
      error: (error) => {
        console.warn('⚠️ Settings comprehensive preferences fetch failed:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupSubscriptions(): void {
    // Subscribe to preferences changes
    this.subscriptions.add(
      this.settingsService.userPreferences$.subscribe(prefs => {
        if (prefs) {
          this.preferences.set(prefs);
        }
      })
    );

    // Subscribe to notification settings changes
    this.subscriptions.add(
      this.settingsService.notificationSettings$.subscribe(settings => {
        if (settings) {
          this.notifications.set(settings);
        }
      })
    );

    // Subscribe to API keys changes
    this.subscriptions.add(
      this.settingsService.apiKeys$.subscribe(keys => {
        this.apiKeys.set(keys);
      })
    );
  }

  loadUserSettings(): void {
    const user = this.currentUser();
    if (user) {
      // Update profile form with user data
      this.profileForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        company: user.company || '',
        timezone: (user as any).timezone || 'UTC'
      });
    }

    // Load settings from backend
    this.isLoading.set(true);
    
    // Load preferences, notifications, and API keys
    this.settingsService.getUserPreferences().subscribe({
      next: () => {
        console.log('✅ User preferences loaded from real backend');
      },
      error: (error) => {
        console.error('❌ Failed to load preferences:', error);
        this.notificationService.showError('Failed to load preferences');
      }
    });

    this.settingsService.getNotificationSettings().subscribe({
      next: () => {
        console.log('✅ Notification settings loaded from real backend');
      },
      error: (error) => {
        console.error('❌ Failed to load notification settings:', error);
      }
    });

    this.settingsService.getApiKeys().subscribe({
      next: () => {
        console.log('✅ API keys loaded from real backend');
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Failed to load API keys:', error);
        this.isLoading.set(false);
      }
    });
  }

  // ===== PROFILE MANAGEMENT =====

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.globalLoader.show(this.globalLoader.forOperation('saving'));
      
      this.subscriptions.add(
        this.settingsService.updateProfile(this.profileForm.value).subscribe({
          next: (response) => {
            console.log('✅ Profile saved to real backend:', response);
            this.globalLoader.hide();
            
            // Profile updated successfully
            console.log('✅ Profile updated in backend');
          },
          error: (error) => {
            console.error('❌ Failed to save profile:', error);
            this.globalLoader.hide();
            this.notificationService.showError('Failed to save profile');
          }
        })
      );
    } else {
      this.notificationService.showWarning('Please fill in all required fields');
    }
  }

  resetProfile(): void {
    this.loadUserSettings();
    this.notificationService.showInfo('Profile form reset');
  }

  // ===== PREFERENCES MANAGEMENT =====

  updatePreference(key: keyof UserPreferences, value: any): void {
    console.log(`🔄 Updating preference ${key}:`, value);
    
    this.subscriptions.add(
      this.settingsService.updateSinglePreference(key, value).subscribe({
        next: () => {
          console.log(`✅ Preference ${key} updated in real backend`);
        },
        error: (error) => {
          console.error(`❌ Failed to update preference ${key}:`, error);
          // Revert the change in UI
          const currentPrefs = this.preferences();
          this.preferences.set({ ...currentPrefs, [key]: !value });
        }
      })
    );
  }

  // ===== NOTIFICATION SETTINGS =====

  updateNotificationSetting(key: keyof NotificationSettings, value: boolean): void {
    console.log(`🔔 Updating notification setting ${key}:`, value);
    
    const currentSettings = this.notifications();
    const updatedSettings = { ...currentSettings, [key]: value };
    
    this.subscriptions.add(
      this.settingsService.updateNotificationSettings(updatedSettings).subscribe({
        next: () => {
          console.log(`✅ Notification setting ${key} updated in real backend`);
          this.notifications.set(updatedSettings);
        },
        error: (error) => {
          console.error(`❌ Failed to update notification setting ${key}:`, error);
          // Revert the change in UI
          this.notifications.set({ ...currentSettings, [key]: !value });
          this.notificationService.showError(`Failed to update ${key} setting`);
        }
      })
    );
  }

  // ===== SECURITY MANAGEMENT =====

  changePassword(): void {
    // TODO: Open password change dialog
    console.log('🔒 Opening change password dialog');
    this.notificationService.showInfo('Password change dialog will open here');
  }

  toggleTwoFactor(): void {
    const currentStatus = this.twoFactorEnabled();
    const newStatus = !currentStatus;
    
    this.subscriptions.add(
      this.settingsService.toggle2FA(newStatus).subscribe({
        next: () => {
          console.log(`✅ 2FA ${newStatus ? 'enabled' : 'disabled'} in real backend`);
          this.twoFactorEnabled.set(newStatus);
        },
        error: (error) => {
          console.error('❌ Failed to toggle 2FA:', error);
        }
      })
    );
  }

  // ===== API KEY MANAGEMENT =====

  createApiKey(): void {
    const keyName = prompt('Enter a name for your API key:');
    if (keyName && keyName.trim()) {
      this.subscriptions.add(
        this.settingsService.createApiKey(keyName.trim()).subscribe({
          next: (response) => {
            console.log('✅ API key created in real backend:', response);
            // Keys list will be updated via subscription
          },
          error: (error) => {
            console.error('❌ Failed to create API key:', error);
          }
        })
      );
    }
  }

  deleteApiKey(keyId: string): void {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      this.subscriptions.add(
        this.settingsService.deleteApiKey(keyId).subscribe({
          next: () => {
            console.log('✅ API key deleted from real backend');
            // Keys list will be updated via subscription
          },
          error: (error) => {
            console.error('❌ Failed to delete API key:', error);
          }
        })
      );
    }
  }

  // ===== DATA MANAGEMENT =====

  exportData(type: 'components' | 'settings' | 'all'): void {
    console.log(`📥 Exporting ${type} data from real backend`);
    
    this.subscriptions.add(
      this.settingsService.exportData(type).subscribe({
        next: (blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `frontuna-${type}-export-${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          window.URL.revokeObjectURL(url);
          
          console.log(`✅ ${type} data exported successfully`);
        },
        error: (error) => {
          console.error(`❌ Failed to export ${type} data:`, error);
        }
      })
    );
  }

  importData(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        console.log('📤 Importing data to real backend');
        
        this.subscriptions.add(
          this.settingsService.importData(file).subscribe({
            next: () => {
              console.log('✅ Data imported successfully');
              this.loadUserSettings(); // Refresh all settings
            },
            error: (error) => {
              console.error('❌ Failed to import data:', error);
            }
          })
        );
      }
    };
    
    input.click();
  }

  // ===== DANGER ZONE =====

  clearAllComponents(): void {
    if (confirm('Are you sure you want to delete all your components? This action cannot be undone.')) {
      this.subscriptions.add(
        this.settingsService.clearAllComponents().subscribe({
          next: () => {
            console.log('✅ All components cleared from real backend');
          },
          error: (error) => {
            console.error('❌ Failed to clear components:', error);
          }
        })
      );
    }
  }

  deleteAccount(): void {
    const password = prompt('Enter your password to confirm account deletion:');
    if (password) {
      if (confirm('Are you ABSOLUTELY SURE you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
        this.subscriptions.add(
          this.settingsService.deleteAccount(password).subscribe({
            next: () => {
              console.log('✅ Account deleted from real backend');
              // Logout and redirect
              this.authService.logout();
            },
            error: (error) => {
              console.error('❌ Failed to delete account:', error);
            }
          })
        );
      }
    }
  }
}