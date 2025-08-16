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
import { AuthService } from '@app/services/auth/auth.service';

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
    MatProgressSpinnerModule
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
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isLoading = false;

  login(): void {
    console.log('Login attempt started');
    console.log('Form valid:', this.loginForm.valid);
    console.log('Form value:', this.loginForm.value);
    console.log('Form errors:', this.loginForm.errors);
    
    if (this.loginForm.invalid) {
      console.log('Form is invalid, marking all as touched');
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;
    console.log('Sending credentials to auth service:', credentials);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful!', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading = false;
        // Error handling is done in AuthService via NotificationService
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}