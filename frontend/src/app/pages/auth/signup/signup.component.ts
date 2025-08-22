import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProfessionalLoaderComponent } from '@app/components/ui/professional-loader/professional-loader.component';
import { MatStepperModule } from '@angular/material/stepper';

import { AuthService } from '@app/services/auth/auth.service';
import { SeoService } from '@app/services/seo/seo.service';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';
import { GlobalLoaderService } from '@app/services/ui/global-loader.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
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
    ProfessionalLoaderComponent,
    MatStepperModule
  ],
  template: `
    <div class="auth-container">
      <!-- Professional Loading Overlay -->
      @if (isLoading()) {
        <div class="loading-overlay">
          <app-professional-loader 
            type="processing" 
            message="Creating your account..." 
            subMessage="Please wait while we set up your developer workspace"
            size="normal">
          </app-professional-loader>
        </div>
      }
      
      <div class="auth-card-container">
        <mat-card class="auth-card">
          <mat-card-header class="auth-header">
            <div class="auth-header-content">
              <div class="auth-logo">
                <img src="assets/images/logo/cat-logo.svg" 
                     alt="Happy Cat with Fish Logo" 
                     class="auth-logo-img"
                     (error)="onImageError($event)"
                     width="50" 
                     height="50"
                     loading="eager" />
              </div>
              <div class="auth-header-text">
                <mat-card-title>Create Your Account</mat-card-title>
                <mat-card-subtitle>Join thousands of developers using Frontuna.ai</mat-card-subtitle>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="auth-form">
              <div class="name-fields">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>First Name</mat-label>
                  <input matInput 
                         type="text" 
                         formControlName="firstName"
                         placeholder="First name"
                         autocomplete="given-name">
                  <!-- First name is now optional -->
                  <mat-error *ngIf="signupForm.get('firstName')?.hasError('minlength')">
                    Must be at least 2 characters
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Last Name</mat-label>
                  <input matInput 
                         type="text" 
                         formControlName="lastName"
                         placeholder="Last name"
                         autocomplete="family-name">
                  <!-- Last name is now optional -->
                  <mat-error *ngIf="signupForm.get('lastName')?.hasError('minlength')">
                    Must be at least 2 characters
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Email Address</mat-label>
                <input matInput 
                       type="email" 
                       formControlName="email"
                       placeholder="Enter your email"
                       autocomplete="email">
                <mat-icon matPrefix>email</mat-icon>
                <mat-error *ngIf="signupForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="signupForm.get('email')?.hasError('email')">
                  Please enter a valid email address
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Password</mat-label>
                <input matInput 
                       [type]="hidePassword ? 'password' : 'text'"
                       formControlName="password"
                       placeholder="Create a strong password"
                       autocomplete="new-password">
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button 
                        matSuffix 
                        type="button"
                        (click)="hidePassword = !hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="signupForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="signupForm.get('password')?.hasError('minlength')">
                  Password must be at least 8 characters
                </mat-error>
                <mat-error *ngIf="signupForm.get('password')?.hasError('pattern')">
                  Password must contain uppercase, lowercase, number, and special character
                </mat-error>
              </mat-form-field>

              <div class="password-strength">
                <div class="strength-bar">
                  <div class="strength-fill" [ngClass]="passwordStrength"></div>
                </div>
                <span class="strength-text">{{ passwordStrengthText }}</span>
              </div>

              <!-- Confirm Password Field -->
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Confirm Password</mat-label>
                <input matInput 
                       [type]="hideConfirmPassword ? 'password' : 'text'"
                       formControlName="confirmPassword"
                       placeholder="Confirm your password"
                       autocomplete="new-password">
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button 
                        matSuffix 
                        type="button"
                        (click)="hideConfirmPassword = !hideConfirmPassword">
                  <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="signupForm.get('confirmPassword')?.hasError('required')">
                  Please confirm your password
                </mat-error>
                <mat-error *ngIf="signupForm.get('confirmPassword')?.hasError('passwordMismatch')">
                  Passwords do not match
                </mat-error>
              </mat-form-field>

              <!-- Terms and Newsletter -->
              <div class="form-checkboxes">
                <mat-checkbox formControlName="agreeToTerms" required class="terms-checkbox">
                  I agree to the 
                  <a href="/terms" target="_blank">Terms of Service</a> and 
                  <a href="/privacy" target="_blank">Privacy Policy</a>
                </mat-checkbox>
                
                <mat-error *ngIf="signupForm.get('agreeToTerms')?.hasError('required') && signupForm.get('agreeToTerms')?.touched" 
                           class="terms-error">
                  You must agree to the terms and conditions
                </mat-error>

                <mat-checkbox formControlName="subscribeToNewsletter" class="newsletter-checkbox">
                  Send me product updates and development tips (optional)
                </mat-checkbox>
              </div>

              <button mat-raised-button 
                      color="primary" 
                      type="submit"
                      class="auth-submit-btn"
                      [disabled]="signupForm.invalid || isLoading()">
                @if (isLoading()) {
                  <span>Creating Account...</span>
                } @else {
                  <mat-icon>person_add</mat-icon>
                  <span>Create Account</span>
                }
              </button>
            </form>

            <div class="divider">
              <span>or</span>
            </div>

            <div class="social-login">
              <button mat-stroked-button 
                      class="social-btn google-btn"
                      (click)="signupWithGoogle()"
                      [disabled]="isLoading()">
                <img src="assets/images/social/google.svg" alt="Google" />
                Continue with Google
              </button>

              <button mat-stroked-button 
                      class="social-btn github-btn"
                      (click)="signupWithGithub()"
                      [disabled]="isLoading()">
                <img src="assets/images/social/github.svg" alt="GitHub" />
                Continue with GitHub
              </button>
            </div>
          </mat-card-content>

          <mat-card-actions class="auth-actions">
            <p class="login-prompt">
              Already have an account?
              <a routerLink="/auth/login" class="login-link">Sign in instead</a>
            </p>
          </mat-card-actions>
        </mat-card>

        <div class="auth-benefits">
          <h3>Start your journey with</h3>
          <div class="benefit-list">
            <div class="benefit-item">
              <div class="benefit-icon">
                <mat-icon>auto_awesome</mat-icon>
              </div>
              <div class="benefit-content">
                <h4>Free Trial</h4>
                <p>Generate 10 components free, no credit card required</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">
                <mat-icon>speed</mat-icon>
              </div>
              <div class="benefit-content">
                <h4>Instant Setup</h4>
                <p>Start generating components immediately after signup</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">
                <mat-icon>support</mat-icon>
              </div>
              <div class="benefit-content">
                <h4>Expert Support</h4>
                <p>Get help from our team of frontend experts</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">
                <mat-icon>security</mat-icon>
              </div>
              <div class="benefit-content">
                <h4>Secure & Private</h4>
                <p>Your code and data are always protected</p>
              </div>
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
      max-width: 1100px;
      width: 100%;
      align-items: start;
    }

    .auth-card {
      width: 100%;
      max-width: 450px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
      width: 100%;
    }

    .auth-header-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      gap: 1rem;
    }

    .auth-header-text {
      width: 100%;
      text-align: center;
    }

    .auth-header-text mat-card-title {
      width: 100%;
      font-size: 1.8rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .auth-header-text mat-card-subtitle {
      width: 100%;
      color: #666;
      font-size: 1rem;
      line-height: 1.4;
    }

    .auth-logo {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 60px; /* Fixed width for logo container */
      height: 60px; /* Fixed height to prevent layout shift */
      min-height: 60px;
      margin: 0 auto;
    }

    .auth-logo-img {
      height: 50px;
      width: 50px; /* Fixed width to prevent layout shift */
      max-width: 50px;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, opacity 0.3s ease;
      /* Prevent layout shift during loading */
      display: block;
    }
    
    .auth-logo-img:hover {
      transform: scale(1.05);
    }
    
    .auth-logo-img.error {
      opacity: 0;
      pointer-events: none;
    }

    /* Ensure consistent spacing even when image loads */
    .auth-logo-img {
      /* Add a subtle background color while loading */
      background-color: rgba(103, 126, 234, 0.05);
    }

    .auth-logo-img:not(.error) {
      background-color: transparent;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .name-fields {
      display: flex;
      gap: 1rem;
    }

    .half-width {
      flex: 1;
    }

    .password-strength {
      margin-top: -1rem;
      margin-bottom: 0.5rem;
    }

    .strength-bar {
      height: 4px;
      background: #e0e0e0;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .strength-fill {
      height: 100%;
      transition: all 0.3s ease;
      border-radius: 2px;
    }

    .strength-fill.weak {
      width: 25%;
      background: #f44336;
    }

    .strength-fill.fair {
      width: 50%;
      background: #ff9800;
    }

    .strength-fill.good {
      width: 75%;
      background: #2196f3;
    }

    .strength-fill.strong {
      width: 100%;
      background: #4caf50;
    }

    .strength-text {
      font-size: 0.8rem;
      color: #666;
    }

    .form-checkboxes {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin: 2rem 0;
      padding: 1.5rem;
      background: rgba(103, 126, 234, 0.02);
      border-radius: 12px;
      border: 1px solid rgba(103, 126, 234, 0.1);
    }

    .terms-checkbox,
    .newsletter-checkbox {
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .form-checkboxes a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .form-checkboxes a:hover {
      text-decoration: underline;
      color: #5a6fd8;
    }

    .terms-error {
      color: #f44336;
      font-size: 0.75rem;
      margin-top: 0.5rem;
      font-weight: 500;
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
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      border: 2px solid #e0e0e0;
      transition: all 0.2s ease;
    }

    .social-btn:hover {
      border-color: #667eea;
      background-color: rgba(103, 126, 234, 0.05);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .social-btn img {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .google-btn:hover {
      border-color: #4285F4;
      background-color: rgba(66, 133, 244, 0.05);
    }

    .github-btn:hover {
      border-color: #333;
      background-color: rgba(51, 51, 51, 0.05);
    }

    .auth-actions {
      text-align: center;
      padding-top: 1rem;
    }

    .login-prompt {
      margin: 0;
      color: #666;
    }

    .login-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      margin-left: 0.5rem;
    }

    .login-link:hover {
      text-decoration: underline;
    }

    .auth-benefits {
      color: white;
      max-width: 350px;
    }

    .auth-benefits h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 2rem;
      text-align: center;
    }

    .benefit-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .benefit-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .benefit-icon {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #4ecdc4;
      flex-shrink: 0;
    }

    .benefit-content h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .benefit-content p {
      margin: 0;
      opacity: 0.9;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .auth-card-container {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .auth-benefits {
        order: -1;
        max-width: none;
      }

      .auth-card {
        max-width: 100%;
      }

      .name-fields {
        flex-direction: column;
        gap: 1.5rem;
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

    .terms-checkbox,
    .newsletter-checkbox {
      display: block !important;
      margin-bottom: 0.5rem;
    }

    .newsletter-checkbox {
      opacity: 0.8;
    }
  `]
})
export class SignupComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);
  private readonly globalLoader = inject(GlobalLoaderService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  public hidePassword = true;
  public hideConfirmPassword = true;
  public readonly isLoading = this.authService.isLoading;

  public passwordStrength = 'weak';
  public passwordStrengthText = 'Weak';

  public signupForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.minLength(2), Validators.maxLength(50)]], // Optional now
    lastName: ['', [Validators.minLength(2), Validators.maxLength(50)]], // Optional now
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]],
    confirmPassword: ['', [Validators.required]],
    agreeToTerms: [false, [Validators.requiredTrue]],
    subscribeToNewsletter: [false]
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'Sign Up - Frontuna.ai',
      description: 'Create your free Frontuna.ai account and start generating frontend components with AI. No credit card required.',
      url: 'https://frontuna.ai/auth/signup',
      robots: 'noindex, nofollow'
    });

    this.analyticsService.trackPageView({
      page_title: 'Signup - Frontuna.ai',
      page_location: window.location.href
    });

    // Watch password changes for strength indicator
    this.signupForm.get('password')?.valueChanges.subscribe(password => {
      this.updatePasswordStrength(password);
    });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  updatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 'weak';
      this.passwordStrengthText = 'Weak';
      return;
    }

    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    switch (true) {
      case score <= 2:
        this.passwordStrength = 'weak';
        this.passwordStrengthText = 'Weak';
        break;
      case score <= 4:
        this.passwordStrength = 'fair';
        this.passwordStrengthText = 'Fair';
        break;
      case score <= 5:
        this.passwordStrength = 'good';
        this.passwordStrengthText = 'Good';
        break;
      default:
        this.passwordStrength = 'strong';
        this.passwordStrengthText = 'Strong';
    }
  }

  onSubmit(): void {
    console.log('Form submitted. Valid:', this.signupForm.valid);
    console.log('Form errors:', this.signupForm.errors);
    console.log('Form value:', this.signupForm.value);
    
    if (this.signupForm.valid) {
      const formValue = this.signupForm.value;
      
      // Validate password strength
      if (this.passwordStrength === 'weak') {
        this.notificationService.showWarning('Please create a stronger password with uppercase, lowercase, numbers, and special characters.');
        return;
      }
      
      // Only send fields that the backend expects
      const signupData = {
        email: formValue.email,
        password: formValue.password,
        firstName: formValue.firstName || '',
        lastName: formValue.lastName || '',
        agreeToTerms: formValue.agreeToTerms,
        subscribeToNewsletter: formValue.subscribeToNewsletter || false
      };
      
      console.log('Sending signup data:', signupData);
      
      // Show beautiful global loader
      this.globalLoader.show(this.globalLoader.forOperation('signup'));
      
      this.authService.signup(signupData).subscribe({
        next: (response) => {
          console.log('Signup successful!', response);
          this.analyticsService.trackSignup('email');
          
          // Update loader message
          this.globalLoader.updateMessage('Account created successfully!', 'Redirecting to dashboard...');
          
          // Wait for auth state to be properly set, then navigate using Angular router
          setTimeout(() => {
            this.globalLoader.hide();
            // Use Angular router instead of window.location to preserve auth state
            this.router.navigate(['/dashboard']).then(success => {
              if (!success) {
                console.warn('Navigation to dashboard failed, trying fallback');
                // Fallback if navigation fails
                window.location.href = '/dashboard';
              }
            });
          }, 2000);
        },
        error: (error) => {
          console.error('Signup failed:', error);
          this.analyticsService.trackError(`Signup failed: ${error.message || error}`);
          
          // Hide loader and show error
          this.globalLoader.hide();
          
          const errorMessage = error?.error?.message || error?.message || 'Registration failed. Please try again.';
          this.notificationService.showError(errorMessage);
        },
        complete: () => {
          console.log('Signup request completed');
        }
      });
    } else {
      // Show validation errors
      this.signupForm.markAllAsTouched();
      
      // Find and show first error
      const firstErrorControl = Object.keys(this.signupForm.controls).find(key => {
        const control = this.signupForm.get(key);
        return control && control.errors;
      });
      
      if (firstErrorControl) {
        const control = this.signupForm.get(firstErrorControl);
        const errors = control?.errors;
        
        let errorMessage = 'Please fix the form errors:';
        if (errors?.['required']) {
          errorMessage = `${this.getFieldDisplayName(firstErrorControl)} is required.`;
        } else if (errors?.['email']) {
          errorMessage = 'Please enter a valid email address.';
        } else if (errors?.['minlength']) {
          errorMessage = `${this.getFieldDisplayName(firstErrorControl)} is too short.`;
        } else if (errors?.['pattern']) {
          errorMessage = 'Password must contain uppercase, lowercase, numbers, and special characters.';
        } else if (errors?.['passwordMismatch']) {
          errorMessage = 'Passwords do not match.';
        } else if (errors?.['requiredTrue']) {
          errorMessage = 'You must agree to the terms and conditions.';
        }
        
        this.notificationService.showWarning(errorMessage);
      }
      
      console.log('Form is invalid. Individual field errors:');
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        if (control && control.errors) {
          console.log(`${key}:`, control.errors);
        }
      });
    }
  }
  
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      agreeToTerms: 'Terms agreement'
    };
    return displayNames[fieldName] || fieldName;
  }

  signupWithGoogle(): void {
    // TODO: Implement Google OAuth
    console.log('Google signup not implemented yet');
    this.analyticsService.trackEvent({
      action: 'social_signup_attempt',
      category: 'authentication',
      label: 'google'
    });
  }

  signupWithGithub(): void {
    // TODO: Implement GitHub OAuth
    console.log('GitHub signup not implemented yet');
    this.analyticsService.trackEvent({
      action: 'social_signup_attempt',
      category: 'authentication',
      label: 'github'
    });
  }

  onImageError(event: Event): void {
    console.warn('Cat logo failed to load, trying fallback');
    const img = event.target as HTMLImageElement;
    
    // Try different fallback paths in order of preference
    if (img.src.includes('cat-logo.svg')) {
      console.log('SVG failed, trying PNG');
      img.src = 'assets/images/logo/cat-logo.png'; // Try PNG fallback
    } else if (img.src.includes('cat-logo.png')) {
      console.log('PNG failed, trying absolute SVG path');
      img.src = '/assets/images/logo/cat-logo.svg'; // Try absolute SVG path
    } else if (img.src.includes('/assets/images/logo/cat-logo.svg')) {
      console.log('Absolute SVG failed, trying main logo');
      img.src = 'assets/images/logo/logo.svg'; // Try main logo SVG
    } else {
      // Hide image if all fallbacks fail but maintain layout
      console.error('All image fallbacks failed for cat logo');
      img.classList.add('error');
      // Show a simple emoji as final fallback
      const logoContainer = img.closest('.auth-logo');
      if (logoContainer) {
        logoContainer.innerHTML = '<span style="font-size: 2rem;">🐱</span>';
      }
    }
  }
}