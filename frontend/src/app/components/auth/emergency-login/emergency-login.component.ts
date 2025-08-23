import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EmergencyLoginService } from '@app/services/auth/emergency-login.service';
import { AuthService } from '@app/services/auth/auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

@Component({
  selector: 'app-emergency-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="emergency-login-container">
      <div class="emergency-header">
        <mat-icon class="emergency-icon">warning</mat-icon>
        <h1>🚨 EMERGENCY LOGIN SYSTEM 🚨</h1>
        <p>Bypass all token refresh issues and login immediately</p>
      </div>

      <mat-card class="emergency-card">
        <mat-card-header>
          <mat-card-title>Emergency Access</mat-card-title>
          <mat-card-subtitle>Token-issue-free login</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Quick Admin Access -->
          <div class="quick-access-section">
            <h3>🏆 Quick Admin Access</h3>
            <p>Instant admin access without any login issues</p>
            <button mat-raised-button 
                    color="warn" 
                    class="emergency-btn"
                    (click)="forceAdminAccess()"
                    [disabled]="isLoading">
              <mat-icon>admin_panel_settings</mat-icon>
              FORCE ADMIN ACCESS
              <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
            </button>
          </div>

          <div class="divider">OR</div>

          <!-- Emergency Login Form -->
          <div class="emergency-form">
            <h3>🔐 Emergency Login</h3>
            <form (ngSubmit)="emergencyLogin()" #loginForm="ngForm">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput 
                       type="email" 
                       [(ngModel)]="credentials.email"
                       name="email"
                       placeholder="admin@frontuna.com"
                       required>
                <mat-icon matSuffix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input matInput 
                       [type]="hidePassword ? 'password' : 'text'"
                       [(ngModel)]="credentials.password"
                       name="password"
                       placeholder="FrontunaAdmin2024!"
                       required>
                <button mat-icon-button 
                        matSuffix 
                        (click)="hidePassword = !hidePassword"
                        type="button">
                  <mat-icon>{{hidePassword ? 'visibility' : 'visibility_off'}}</mat-icon>
                </button>
              </mat-form-field>

              <button mat-raised-button 
                      color="primary" 
                      type="submit"
                      class="emergency-btn"
                      [disabled]="isLoading || !loginForm.valid">
                <mat-icon>login</mat-icon>
                EMERGENCY LOGIN
                <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
              </button>
            </form>
          </div>

          <!-- Pre-filled Credentials -->
          <div class="credentials-section">
            <h3>🔑 Admin Credentials</h3>
            <div class="credential-item">
              <strong>Email:</strong> admin&#64;frontuna.com
              <button mat-icon-button (click)="fillCredentials('admin')">
                <mat-icon>content_copy</mat-icon>
              </button>
            </div>
            <div class="credential-item">
              <strong>Password:</strong> FrontunaAdmin2024!
              <button mat-icon-button (click)="fillCredentials('admin')">
                <mat-icon>content_copy</mat-icon>
              </button>
            </div>
            <button mat-button 
                    color="accent"
                    (click)="fillCredentials('admin')">
              <mat-icon>auto_fix_high</mat-icon>
              AUTO-FILL ADMIN CREDENTIALS
            </button>
          </div>

          <!-- Status Info -->
          <div class="status-section" *ngIf="emergencyService.isEmergencyMode()">
            <mat-icon class="status-icon success">check_circle</mat-icon>
            <span>Emergency mode active - Token issues bypassed</span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Regular Login Fallback -->
      <div class="fallback-section">
        <p>If emergency login works, you can try regular login:</p>
        <button mat-button 
                color="primary"
                (click)="goToRegularLogin()">
          <mat-icon>login</mat-icon>
          Try Regular Login
        </button>
      </div>
    </div>
  `,
  styles: [`
    .emergency-login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    }

    .emergency-header {
      text-align: center;
      color: white;
      margin-bottom: 2rem;
    }

    .emergency-header .emergency-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .emergency-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .emergency-header p {
      font-size: 1.2rem;
      margin: 0;
      opacity: 0.9;
    }

    .emergency-card {
      width: 100%;
      max-width: 500px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }

    .quick-access-section {
      text-align: center;
      padding: 1rem 0;
      border: 2px dashed #ff6b6b;
      border-radius: 8px;
      margin-bottom: 2rem;
      background: rgba(255, 107, 107, 0.1);
    }

    .quick-access-section h3 {
      color: #ff6b6b;
      margin: 0 0 0.5rem 0;
    }

    .quick-access-section p {
      color: #666;
      margin: 0 0 1rem 0;
      font-size: 0.9rem;
    }

    .emergency-btn {
      width: 100%;
      height: 48px;
      font-weight: 600;
      font-size: 1rem;
      margin: 0.5rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .divider {
      text-align: center;
      font-weight: 600;
      color: #666;
      margin: 2rem 0;
      position: relative;
    }

    .divider::before,
    .divider::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 45%;
      height: 1px;
      background: #ddd;
    }

    .divider::before { left: 0; }
    .divider::after { right: 0; }

    .emergency-form h3 {
      color: #333;
      margin: 0 0 1rem 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .credentials-section {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 2rem;
    }

    .credentials-section h3 {
      color: #333;
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
    }

    .credential-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-family: monospace;
      font-size: 0.9rem;
    }

    .status-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: #e8f5e8;
      border-radius: 8px;
      margin-top: 1rem;
      color: #388e3c;
    }

    .status-icon.success {
      color: #4caf50;
    }

    .fallback-section {
      text-align: center;
      margin-top: 2rem;
      color: white;
    }

    .fallback-section p {
      margin: 0 0 1rem 0;
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .emergency-login-container {
        padding: 1rem;
      }

      .emergency-header h1 {
        font-size: 2rem;
      }

      .emergency-card {
        width: 100%;
        max-width: none;
      }
    }
  `]
})
export class EmergencyLoginComponent {
  private readonly router = inject(Router);
  public readonly emergencyService = inject(EmergencyLoginService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  public isLoading = false;
  public hidePassword = true;

  public credentials = {
    email: '',
    password: ''
  };

  async forceAdminAccess(): Promise<void> {
    console.log('🚨 FORCING ADMIN ACCESS - BYPASSING ALL TOKEN ISSUES!');
    
    this.isLoading = true;
    
    try {
      const success = await this.emergencyService.forceAdminAccess();
      
      if (success) {
        this.notificationService.showSuccess('🎉 EMERGENCY ADMIN ACCESS GRANTED!');
        console.log('✅ ADMIN ACCESS FORCED - Navigating to admin panel');
        
        // Force navigation after a brief delay
        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 500);
      } else {
        this.notificationService.showError('❌ Emergency admin access failed');
      }
      
    } catch (error) {
      console.error('❌ Force admin access error:', error);
      this.notificationService.showError('❌ Emergency access failed');
    } finally {
      this.isLoading = false;
    }
  }

  async emergencyLogin(): Promise<void> {
    console.log('🚨 EMERGENCY LOGIN ATTEMPT:', this.credentials.email);
    
    this.isLoading = true;
    
    try {
      const success = await this.emergencyService.emergencyLogin(
        this.credentials.email,
        this.credentials.password
      );
      
      if (success) {
        this.notificationService.showSuccess('🎉 EMERGENCY LOGIN SUCCESS!');
        
        // Check if admin user
        const user = this.emergencyService.getEmergencyUser();
        if (user && user.role === 'admin') {
          console.log('✅ Admin user detected - navigating to admin panel');
          this.router.navigate(['/admin']);
        } else {
          console.log('✅ Regular user - navigating to dashboard');
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.notificationService.showError('❌ Emergency login failed');
      }
      
    } catch (error) {
      console.error('❌ Emergency login error:', error);
      this.notificationService.showError('❌ Login failed');
    } finally {
      this.isLoading = false;
    }
  }

  fillCredentials(type: 'admin'): void {
    if (type === 'admin') {
      this.credentials.email = 'admin@frontuna.com';
      this.credentials.password = 'FrontunaAdmin2024!';
      this.notificationService.showInfo('✅ Admin credentials filled');
    }
  }

  goToRegularLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
