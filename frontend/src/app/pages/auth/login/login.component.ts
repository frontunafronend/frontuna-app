import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SecureAuthService } from '@app/services/auth/secure-auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <mat-card class="auth-card">
              <mat-card-header>
                <mat-card-title>Sign In</mat-card-title>
                <mat-card-subtitle>Welcome back to Frontuna.com</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="loginForm" (ngSubmit)="login()" class="auth-form">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email" placeholder="Enter your email">
                    <mat-icon matSuffix>email</mat-icon>
                    @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                      <mat-error>Please enter a valid email</mat-error>
                    }
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Password</mat-label>
                    <input matInput type="password" formControlName="password" placeholder="Enter your password">
                    <mat-icon matSuffix>lock</mat-icon>
                    @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                      <mat-error>Password is required</mat-error>
                    }
                  </mat-form-field>
                  
                  <button mat-raised-button color="primary" type="submit" 
                          class="w-100 auth-button" 
                          [disabled]="loginForm.invalid || isLoading">
                    @if (isLoading) {
                      <mat-progress-spinner diameter="20" mode="indeterminate"></mat-progress-spinner>
                    } @else {
                      <mat-icon>login</mat-icon>
                      Sign In
                    }
                  </button>
                </form>
                
                <div class="auth-links">
                  <p>Don't have an account? 
                    <a routerLink="/auth/signup" mat-button color="primary">Sign Up</a>
                  </p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem 0;
    }
    
    .auth-card {
      max-width: 400px;
      margin: 0 auto;
    }
    
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin: 1rem 0;
    }
    
    .auth-button {
      padding: 0.75rem;
      font-size: 1rem;
    }
    
    .auth-links {
      text-align: center;
      margin-top: 1rem;
    }
  `]
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(SecureAuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isLoading = false;

  login(): void {
    console.log('🔐 AI COPILOT LOGIN - Starting professional authentication...');
    console.log('Form valid:', this.loginForm.valid);
    
    if (this.loginForm.invalid) {
      console.log('Form is invalid, showing user feedback');
      this.loginForm.markAllAsTouched();
      
      // 🎯 ENHANCED USER FEEDBACK - Show specific validation errors
      if (this.loginForm.get('email')?.hasError('required')) {
        this.notificationService.showError('Please enter your email address');
      } else if (this.loginForm.get('email')?.hasError('email')) {
        this.notificationService.showError('Please enter a valid email address');
      } else if (this.loginForm.get('password')?.hasError('required')) {
        this.notificationService.showError('Please enter your password');
      }
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;
    
    // 🎯 ENHANCED USER FEEDBACK - Show loading state
    this.notificationService.showInfo('Signing you in...');
    console.log('🚀 Sending credentials to Ultimate Auth Service');

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ LOGIN SUCCESS - User authenticated!', response);
        
        // 🎯 ENHANCED USER FEEDBACK - Show success and guide user
        this.notificationService.showSuccess(`Welcome back, ${response.user.firstName}! 🎉`);
        
        // 🎯 SMART NAVIGATION - Give user immediate feedback before redirect
        setTimeout(() => {
          this.notificationService.showInfo('Redirecting to your dashboard...');
          this.router.navigate(['/dashboard']).then(success => {
            if (!success) {
              console.warn('Navigation failed, trying fallback');
              window.location.href = '/dashboard';
            }
          });
        }, 500);
      },
      error: (error) => {
        console.error('❌ LOGIN FAILED:', error);
        this.isLoading = false;
        
        // 🎯 ENHANCED ERROR HANDLING - Provide helpful guidance
        const email = credentials.email;
        if (email && !localStorage.getItem('frontuna_local_user')) {
          // User doesn't exist, guide them to signup
          this.notificationService.showWarning(
            `No account found for ${email}. Would you like to create an account?`
          );
          
          setTimeout(() => {
            const shouldSignup = confirm(`No account found for ${email}.\n\nWould you like to create a new account?`);
            if (shouldSignup) {
              this.router.navigate(['/auth/signup'], { 
                queryParams: { email: email } 
              });
            }
          }, 2000);
        }
        // Error details are already handled by Ultimate Auth Service
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}