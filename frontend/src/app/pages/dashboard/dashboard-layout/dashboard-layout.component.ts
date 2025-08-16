import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '@app/services/auth/auth.service';
import { GoogleAnalyticsService } from '../../../services/analytics/google-analytics.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="dashboard-layout">
      <aside class="dashboard-sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <img src="assets/images/logo/cat-logo.png" 
                 alt="Happy Cat with Fish Logo" 
                 class="logo-icon-image"
                 (error)="onLogoImageError($event)"/>
            <span class="logo-text">Frontuna.com</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-section">
            <h3 class="nav-section-title">Main</h3>
            <a routerLink="/dashboard" 
               routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: true}"
               class="nav-item">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            <a routerLink="/dashboard/generate" 
               routerLinkActive="active"
               class="nav-item">
              <mat-icon>auto_awesome</mat-icon>
              <span>Generate Component</span>
            </a>
            <a routerLink="/dashboard/components" 
               routerLinkActive="active"
               class="nav-item">
              <mat-icon>widgets</mat-icon>
              <span>My Components</span>
            </a>
            <a routerLink="/library" 
               routerLinkActive="active"
               class="nav-item">
              <mat-icon>folder</mat-icon>
              <span>Component Library</span>
            </a>
          </div>
          
          <div class="nav-section">
            <h3 class="nav-section-title">Tools</h3>
            <a routerLink="/dashboard/templates" 
               routerLinkActive="active"
               class="nav-item">
              <mat-icon>view_module</mat-icon>
              <span>Templates</span>
            </a>
            <a routerLink="/dashboard/history" 
               routerLinkActive="active"
               class="nav-item">
              <mat-icon>history</mat-icon>
              <span>Generation History</span>
            </a>
            <a routerLink="/dashboard/export" 
               routerLinkActive="active"
               class="nav-item">
              <mat-icon>download</mat-icon>
              <span>Export Projects</span>
            </a>
          </div>
          
          <div class="nav-section">
            <h3 class="nav-section-title">Account</h3>
            <a routerLink="/settings" 
               routerLinkActive="active"
               class="nav-item">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </a>
            <a routerLink="/billing" 
               routerLinkActive="active"
               class="nav-item">
              <mat-icon>payment</mat-icon>
              <span>Billing</span>
            </a>
            <button (click)="logout()" class="nav-item logout-btn">
              <mat-icon>logout</mat-icon>
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
        
        <div class="sidebar-footer">
          <div class="usage-widget">
            <div class="usage-header">
              <span class="usage-title">Monthly Usage</span>
              <span class="usage-count">{{ mockUsage.used }}/{{ mockUsage.limit }}</span>
            </div>
            <mat-progress-bar 
              mode="determinate" 
              [value]="usagePercentage()"
              [color]="usagePercentage() > 80 ? 'warn' : 'primary'">
            </mat-progress-bar>
          </div>
        </div>
      </aside>
      
      <main class="dashboard-content">
        <!-- Child routes will load here -->
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    /* Global focus style override to remove orange borders */
    * {
      outline: none !important;
    }

    *:focus {
      outline: none !important;
      border-color: inherit !important;
      box-shadow: none !important;
    }

    a:focus,
    button:focus,
    mat-button:focus,
    mat-raised-button:focus,
    mat-icon-button:focus {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
    }

    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--primary-color-light) 0%, var(--secondary-color-light) 100%);
    }
    
    .dashboard-sidebar {
      width: 280px;
      background: var(--secondary-color);
      color: white;
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
    }
    
    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon-image {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: white;
      padding: 4px;
    }
    
    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: white;
    }
    
    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
      overflow-y: auto;
    }
    
    .nav-section {
      margin-bottom: 32px;
    }
    
    .nav-section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255,255,255,0.7);
      margin: 0 0 12px 20px;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      transition: all 0.2s ease;
      font-size: 14px;
      font-weight: 500;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }
    
    .nav-item:hover {
      background: rgba(255,255,255,0.1);
      color: white;
      transform: translateX(4px);
    }
    
    .nav-item.active {
      background: linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 100%);
      color: white;
      border-right: 3px solid var(--accent-color);
      font-weight: 600;
    }
    
    .nav-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .logout-btn {
      color: rgba(255,255,255,0.6);
      border-top: 1px solid rgba(255,255,255,0.1);
      margin-top: 12px;
      padding-top: 20px;
    }
    
    .logout-btn:hover {
      color: #ff6b6b;
      background: rgba(255,107,107,0.1);
    }
    
    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .usage-widget {
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 16px;
    }
    
    .usage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .usage-title {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255,255,255,0.8);
    }
    
    .usage-count {
      font-size: 12px;
      font-weight: 600;
      color: white;
    }
    
    .dashboard-content {
      flex: 1;
      margin-left: 280px;
      min-height: 100vh;
      background: transparent;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .dashboard-sidebar {
        width: 260px;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .dashboard-sidebar.open {
        transform: translateX(0);
      }
      
      .dashboard-content {
        margin-left: 0;
      }
      
      .nav-item {
        font-size: 14px;
        padding: 10px 16px;
      }
      
      .logo-text {
        font-size: 18px;
      }
      
      .sidebar-header {
        padding: 20px 16px;
      }
    }

    @media (max-width: 480px) {
      .dashboard-sidebar {
        width: 100%;
        position: fixed;
        z-index: 9999;
      }
      
      .nav-section-title {
        font-size: 11px;
        margin-left: 16px;
      }
      
      .usage-widget {
        padding: 12px;
      }
    }
  `]
})
export class DashboardLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly analyticsService = inject(GoogleAnalyticsService);
  private readonly router = inject(Router);

  public readonly currentUser = this.authService.currentUser;

  // Mock usage data - replace with real data from service
  public readonly mockUsage = {
    used: 23,
    limit: 100
  };

  ngOnInit(): void {
    this.analyticsService.trackPageView({
      page_title: 'Dashboard Layout',
      page_location: window.location.href
    });
  }

  usagePercentage(): number {
    return Math.round((this.mockUsage.used / this.mockUsage.limit) * 100);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onLogoImageError(event: any): void {
    // Fallback for logo image
    const target = event.target;
    if (target) {
      const container = target.parentElement;
      const fallback = document.createElement('div');
      fallback.innerHTML = '🐱';
      fallback.style.cssText = `
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border-radius: 50%;
        font-size: 16px;
      `;
      
      target.style.display = 'none';
      container.appendChild(fallback);
    }
  }
}