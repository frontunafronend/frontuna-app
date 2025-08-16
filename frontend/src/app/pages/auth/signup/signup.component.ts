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
  selector: 'app-signup',
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
                <mat-card-title>Get Started Free</mat-card-title>
                <mat-card-subtitle>Join thousands of developers</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="signupForm" (ngSubmit)="signup()" class="auth-form">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>First Name</mat-label>
                    <input matInput type="text" formControlName="firstName" placeholder="Enter your first name">
                    <mat-icon matSuffix>person</mat-icon>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email" placeholder="Enter your email">
                    <mat-icon matSuffix>email</mat-icon>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Password</mat-label>
                    <input matInput type="password" formControlName="password" placeholder="Create a password">
                    <mat-icon matSuffix>lock</mat-icon>
                  </mat-form-field>
                  
                  <button mat-raised-button color="primary" type="submit" 
                          class="w-100 auth-button" 
                          [disabled]="signupForm.invalid || isLoading">
                    @if (isLoading) {
                      <mat-progress-spinner diameter="20" mode="indeterminate"></mat-progress-spinner>
                    } @else {
                      <mat-icon>rocket_launch</mat-icon>
                      Create Account
                    }
                  </button>
                </form>
                
                <div class="auth-links">
                  <p>Already have an account? 
                    <a routerLink="/auth/login" mat-button color="primary">Sign In</a>
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
export class SignupComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  signupForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;

  signup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const userData = this.signupForm.value;

    this.authService.signup(userData).subscribe({
      next: (response) => {
        console.log('Signup successful!', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Signup failed:', error);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}