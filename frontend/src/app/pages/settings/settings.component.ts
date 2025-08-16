import { Component, OnInit, inject, computed } from '@angular/core';
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
import { AuthService } from '../../services/auth/auth.service';

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
    MatExpansionModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  public readonly currentUser = computed(() => this.authService.currentUser());

  // Profile form
  profileForm: FormGroup = this.fb.group({
    firstName: [this.currentUser()?.firstName || '', Validators.required],
    lastName: [this.currentUser()?.lastName || '', Validators.required],
    email: [this.currentUser()?.email || '', [Validators.required, Validators.email]],
    company: [this.currentUser()?.company || ''],
    timezone: ['UTC']
  });

  // Preferences
  preferences = {
    darkMode: false,
    compactMode: false,
    defaultFramework: 'react',
    autoSave: true,
    typescript: true
  };

  // Notifications
  notifications = {
    generationComplete: true,
    weeklySummary: true,
    planUpdates: true,
    browserNotifications: false
  };

  // Security
  twoFactorEnabled = false;
  apiKeys = [
    { id: 'key_123', name: 'Production API', created: new Date(2024, 0, 15) },
    { id: 'key_456', name: 'Development API', created: new Date(2024, 1, 20) }
  ];

  ngOnInit(): void {
    console.log('Settings component initialized');
    this.loadUserSettings();
  }

  loadUserSettings(): void {
    // Load user settings from service
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company || ''
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      console.log('Saving profile:', this.profileForm.value);
      // TODO: Implement profile save
      alert('Profile saved successfully!');
    }
  }

  resetProfile(): void {
    this.loadUserSettings();
  }

  updatePreference(key: string, value: any): void {
    console.log(`Updating preference ${key}:`, value);
    // TODO: Save preference to backend
  }

  changePassword(): void {
    console.log('Opening change password dialog');
    // TODO: Implement password change dialog
    alert('Password change functionality will be implemented');
  }

  toggleTwoFactor(): void {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    console.log('2FA toggled:', this.twoFactorEnabled);
    // TODO: Implement 2FA setup/disable
  }

  createApiKey(): void {
    console.log('Creating new API key');
    // TODO: Implement API key creation
    alert('API key creation functionality will be implemented');
  }

  deleteApiKey(keyId: string): void {
    console.log('Deleting API key:', keyId);
    this.apiKeys = this.apiKeys.filter(key => key.id !== keyId);
  }

  exportData(type: string): void {
    console.log('Exporting data type:', type);
    // TODO: Implement data export
    alert(`${type} export functionality will be implemented`);
  }

  importData(): void {
    console.log('Importing data');
    // TODO: Implement data import
    alert('Data import functionality will be implemented');
  }

  clearAllComponents(): void {
    if (confirm('Are you sure you want to delete all your components? This action cannot be undone.')) {
      console.log('Clearing all components');
      // TODO: Implement clear components
      alert('Clear components functionality will be implemented');
    }
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
      console.log('Deleting account');
      // TODO: Implement account deletion
      alert('Account deletion functionality will be implemented');
    }
  }
}