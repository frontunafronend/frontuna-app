import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProfessionalLoaderComponent } from '@app/components/ui/professional-loader/professional-loader.component';

import { AuthService } from '@app/services/auth/auth.service';
import { SeoService } from '@app/services/seo/seo.service';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    ProfessionalLoaderComponent
  ],
  template: `
    <div class="auth-container">
      <!-- Professional Loading Overlay -->
      @if (isLoading()) {
        <div class="loading-overlay">
          <app-professional-loader 
            type="processing" 
            message="Signing you in..." 
            subMessage="Please wait while we authenticate your account"
            size="normal">
          </app-professional-loader>
        </div>
      }
      
      <div class="auth-card-container">
        <mat-card class="auth-card">
          <mat-card-header class="auth-header">
            <div class="auth-logo">
                              <img src="assets/images/logo/cat-logo.png" alt="Happy Cat with Fish Logo" />
            </div>
            <mat-card-title>Welcome Back</mat-card-title>
            <mat-card-subtitle>Sign in to your Frontuna.ai account</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Email Address</mat-label>
                <input matInput 
                       type="email" 
                       formControlName="email"
                       placeholder="Enter your email"
                       autocomplete="email">
                <mat-icon matPrefix>email</mat-icon>
                <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                  Please enter a valid email address
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Password</mat-label>
                <input matInput 
                       [type]="hidePassword ? 'password' : 'text'"
                       formControlName="password"
                       placeholder="Enter your password"
                       autocomplete="current-password">
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button 
                        matSuffix 
                        type="button"
                        (click)="hidePassword = !hidePassword"
                        [attr.aria-label]="'Hide password'"
                        [attr.aria-pressed]="hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                  Password must be at least 8 characters long
                </mat-error>
              </mat-form-field>

              <div class="form-options">
                <mat-checkbox formControlName="rememberMe">
                  Remember me
                </mat-checkbox>
                <a routerLink="/auth/forgot-password" class="forgot-password-link">
                  Forgot password?
                </a>
              </div>

              <button mat-raised-button 
                      color="primary" 
                      type="submit"
                      class="auth-submit-btn"
                      [disabled]="loginForm.invalid || isLoading()">
                @if (isLoading()) {
                  <span>Signing In...</span>
                } @else {
                  <mat-icon>login</mat-icon>
                  <span>Sign In</span>
                }
              </button>
            </form>

            <div class="divider">
              <span>or</span>
            </div>

            <div class="social-login">
              <button mat-stroked-button 
                      class="social-btn google-btn"
                      (click)="loginWithGoogle()"
                      [disabled]="isLoading()">
                <img src="assets/images/social/google.svg" alt="Google" />
                Continue with Google
              </button>

              <button mat-stroked-button 
                      class="social-btn github-btn"
                      (click)="loginWithGithub()"
                      [disabled]="isLoading()">
                <img src="assets/images/social/github.svg" alt="GitHub" />
                Continue with GitHub
              </button>
            </div>
          </mat-card-content>

          <mat-card-actions class="auth-actions">
            <p class="signup-prompt">
              Don't have an account?
              <a routerLink="/auth/signup" class="signup-link">Sign up for free</a>
            </p>
          </mat-card-actions>
        </mat-card>

        <div class="auth-features">
          <h3>Why developers choose Frontuna.ai</h3>
          <div class="feature-list">
            <div class="feature-item">
              <mat-icon>speed</mat-icon>
              <span>Generate components 10x faster</span>
            </div>
            <div class="feature-item">
              <mat-icon>code</mat-icon>
              <span>Production-ready code</span>
            </div>
            <div class="feature-item">
              <mat-icon>accessibility</mat-icon>
              <span>Accessibility built-in</span>
            </div>
            <div class="feature-item">
              <mat-icon>devices</mat-icon>
              <span>Responsive by default</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      position: relative;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .auth-card-container {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 4rem;
      max-width: 1000px;
      width: 100%;
      align-items: center;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-logo {
      margin-bottom: 1rem;
    }

    .auth-logo img {
      height: 40px;
      width: auto;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: -0.5rem 0 0.5rem;
    }

    .forgot-password-link {
      color: #667eea;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .forgot-password-link:hover {
      text-decoration: underline;
    }

    .auth-submit-btn {
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .divider {
      position: relative;
      text-align: center;
      margin: 2rem 0;
      color: #666;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e0e0e0;
    }

    .divider span {
      background: white;
      padding: 0 1rem;
      position: relative;
    }

    .social-login {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.75rem;
      font-weight: 500;
    }

    .social-btn img {
      width: 20px;
      height: 20px;
    }

    .auth-actions {
      text-align: center;
      padding-top: 1rem;
    }

    .signup-prompt {
      margin: 0;
      color: #666;
    }

    .signup-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      margin-left: 0.5rem;
    }

    .signup-link:hover {
      text-decoration: underline;
    }

    .auth-features {
      color: white;
      max-width: 300px;
    }

    .auth-features h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 2rem;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 1rem;
      opacity: 0.9;
    }

    .feature-item mat-icon {
      color: #4ecdc4;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .auth-card-container {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .auth-features {
        order: -1;
        text-align: center;
        max-width: none;
      }

      .auth-card {
        max-width: 100%;
      }
    }

    @media (max-width: 480px) {
      .auth-container {
        padding: 1rem 0.5rem;
      }

      .auth-card {
        padding: 1.5rem;
      }

      .social-login {
        gap: 0.75rem;
      }

      .social-btn {
        font-size: 0.9rem;
        padding: 0.6rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);

  public hidePassword = true;
  public readonly isLoading = this.authService.isLoading;

  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false]
  });

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'Sign In - Frontuna.ai',
      description: 'Sign in to your Frontuna.ai account and start generating frontend components with AI.',
      url: 'https://frontuna.ai/auth/login',
      robots: 'noindex, nofollow'
    });

    this.analyticsService.trackPageView({
      page_title: 'Login - Frontuna.ai',
      page_location: window.location.href
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      
      this.authService.login(formValue).subscribe({
        next: () => {
          this.analyticsService.trackLogin('email');
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.analyticsService.trackError(`Login failed: ${error.message}`);
        }
      });
    }
  }

  loginWithGoogle(): void {
    // TODO: Implement Google OAuth
    console.log('Google login not implemented yet');
    this.analyticsService.trackEvent({
      action: 'social_login_attempt',
      category: 'authentication',
      label: 'google'
    });
  }

  loginWithGithub(): void {
    // TODO: Implement GitHub OAuth
    console.log('GitHub login not implemented yet');
    this.analyticsService.trackEvent({
      action: 'social_login_attempt',
      category: 'authentication',
      label: 'github'
    });
  }
}