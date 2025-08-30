/**
 * 🤖 AUTH AGENT LOGIN COMPONENT
 * Simple login component that uses the AI Auth Agent
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthAgentService } from '@app/services/auth/auth-agent.service';

@Component({
  selector: 'app-auth-agent-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-agent-login">
      <div class="login-card">
        <h2>🤖 AI Auth Agent Login</h2>
        <p>Bulletproof authentication with session persistence</p>
        
        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="email" 
              required
              placeholder="admin@frontuna.com">
          </div>
          
          <div class="form-group">
            <label for="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="password" 
              required
              placeholder="Enter password">
          </div>
          
          <button 
            type="submit" 
            [disabled]="!loginForm.form.valid || isLoading"
            class="login-btn">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
        
        <div class="quick-login">
          <h3>Quick Login Options:</h3>
          <button (click)="quickLogin('admin@frontuna.com')" class="quick-btn admin">
            🛡️ Login as Admin
          </button>
          <button (click)="quickLogin('user@frontuna.com')" class="quick-btn user">
            👤 Login as User
          </button>
        </div>
        
        <div class="auth-status" *ngIf="authAgent.isAuthenticated()">
          <p>✅ Currently logged in as: {{ authAgent.getCurrentUser()?.email }}</p>
          <p>Role: {{ authAgent.getCurrentUser()?.role }}</p>
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-agent-login {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }
    
    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      max-width: 400px;
      width: 100%;
    }
    
    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    p {
      text-align: center;
      color: #666;
      margin-bottom: 2rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }
    
    input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .login-btn {
      width: 100%;
      padding: 0.75rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .login-btn:hover:not(:disabled) {
      background: #5a6fd8;
    }
    
    .login-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .quick-login {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e0e0e0;
    }
    
    .quick-login h3 {
      text-align: center;
      color: #333;
      margin-bottom: 1rem;
      font-size: 1rem;
    }
    
    .quick-btn {
      width: 100%;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      border: 2px solid;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .quick-btn.admin {
      background: #fff;
      border-color: #f44336;
      color: #f44336;
    }
    
    .quick-btn.admin:hover {
      background: #f44336;
      color: white;
    }
    
    .quick-btn.user {
      background: #fff;
      border-color: #4caf50;
      color: #4caf50;
    }
    
    .quick-btn.user:hover {
      background: #4caf50;
      color: white;
    }
    
    .auth-status {
      margin-top: 2rem;
      padding: 1rem;
      background: #e8f5e8;
      border-radius: 6px;
      text-align: center;
    }
    
    .auth-status p {
      margin: 0.5rem 0;
      color: #2e7d32;
    }
    
    .logout-btn {
      padding: 0.5rem 1rem;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
    }
    
    .logout-btn:hover {
      background: #d32f2f;
    }
  `]
})
export class AuthAgentLoginComponent {
  public readonly authAgent = inject(AuthAgentService);
  private readonly router = inject(Router);
  
  public email = '';
  public password = '';
  public isLoading = false;
  
  async onLogin() {
    if (!this.email || !this.password) return;
    
    this.isLoading = true;
    
    try {
      const success = await this.authAgent.login(this.email, this.password);
      
      if (success) {
        console.log('✅ Login successful!');
        
        // Navigate based on role
        if (this.authAgent.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        alert('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }
  
  async quickLogin(email: string) {
    this.email = email;
    this.password = 'password123'; // Demo password
    await this.onLogin();
  }
  
  logout() {
    this.authAgent.logout();
    this.email = '';
    this.password = '';
  }
}
