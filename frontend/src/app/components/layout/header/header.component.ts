import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '@app/services/auth/auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="header-toolbar">
      <div class="container-fluid">
        <!-- Logo -->
        <a routerLink="/" class="navbar-brand">
          <img src="assets/images/logo/cat-logo.png" 
               alt="Happy Cat with Fish Logo" 
               class="logo-svg"
               (error)="useTextLogo = true"
               [hidden]="useTextLogo" />
          <div class="logo-text-fallback my-2" [hidden]="!useTextLogo">
            🐱 
          </div>
          <span class="brand-text">Frontuna.com</span>
        </a>

        <!-- Desktop Navigation -->
        <div class="desktop-nav-wrapper">
          <nav class="navbar-nav">
            <a routerLink="/about" 
               routerLinkActive="active"
               class="nav-link">
              About
            </a>
            @if (currentUser()) {
              <a routerLink="/dashboard/components" 
                 routerLinkActive="active"
                 class="nav-link">
                Components
              </a>
            }
            <a routerLink="/how-it-works" 
               routerLinkActive="active"
               class="nav-link">
              How It Works
            </a>
            <a routerLink="/tutorials" 
               routerLinkActive="active"
               class="nav-link">
              Tutorials
            </a>
            <a routerLink="/contact" 
               routerLinkActive="active"
               class="nav-link">
              Contact
            </a>
            @if (currentUser()) {
              <a routerLink="/billing" 
                 routerLinkActive="active"
                 class="nav-link billing-link">
                <mat-icon>payment</mat-icon>
                Billing
              </a>
            }
          </nav>
        </div>

        <!-- User Actions -->
        <div class="user-actions">
          @if (currentUser()) {
            <!-- Authenticated User Menu -->
            <div class="authenticated-menu">
              <!-- Dashboard Link -->
              <a routerLink="/dashboard" 
                 mat-button 
                 class="nav-button">
                <mat-icon>dashboard</mat-icon>
                Dashboard
              </a>

              <!-- Component Library -->
              <a routerLink="/library" 
                 mat-button 
                 class="nav-button">
                <mat-icon>folder</mat-icon>
                Library
              </a>

              <!-- Notifications -->
              <button mat-icon-button 
                      [matMenuTriggerFor]="notificationMenu"
                      class="notification-button">
                <mat-icon [matBadge]="notificationCount()" 
                          [matBadgeHidden]="notificationCount() === 0"
                          matBadgeColor="warn"
                          aria-hidden="false">
                  notifications
                </mat-icon>
              </button>

              <!-- User Menu -->
              <button mat-button 
                      [matMenuTriggerFor]="userMenu"
                      class="user-menu-button">
                <div class="user-info">
                  <div class="user-avatar">👤</div>
                  <span class="user-name">
                    {{ currentUser()?.firstName }}
                  </span>
                  <mat-icon>arrow_drop_down</mat-icon>
                </div>
              </button>
            </div>
          } @else {
            <!-- Guest User Actions - Only show when NOT logged in -->
            <div class="guest-menu">
              <a routerLink="/auth/login" 
                 mat-button
                 class="sign-in-btn">
                Sign In
              </a>
              <a routerLink="/auth/signup" 
                 mat-raised-button 
                 class="get-started-btn">
                Get Started
              </a>
            </div>
          }

          <!-- Mobile Menu Toggle -->
          <button mat-icon-button 
                  class="mobile-menu-toggle"
                  (click)="toggleMobileMenu()">
            <mat-icon>menu</mat-icon>
          </button>
        </div>
      </div>
    </mat-toolbar>

    <!-- Mobile Menu -->
    @if (isMobileMenuOpen()) {
      <div class="mobile-menu d-lg-none">
        <div class="mobile-menu-content">
          <nav class="mobile-nav">
            <a routerLink="/about" 
               (click)="closeMobileMenu()"
               class="mobile-nav-link">
              About
            </a>
            @if (currentUser()) {
              <a routerLink="/dashboard/generate" 
                 (click)="closeMobileMenu()"
                 class="mobile-nav-link">
                Components
              </a>
            }
            <a routerLink="/how-it-works" 
               (click)="closeMobileMenu()"
               class="mobile-nav-link">
              How It Works
            </a>
            <a routerLink="/tutorials" 
               (click)="closeMobileMenu()"
               class="mobile-nav-link">
              Tutorials
            </a>
            <a routerLink="/contact" 
               (click)="closeMobileMenu()"
               class="mobile-nav-link">
              Contact
            </a>
            
            @if (currentUser()) {
              <hr class="mobile-divider">
              <a routerLink="/dashboard" 
                 (click)="closeMobileMenu()"
                 class="mobile-nav-link">
                <mat-icon>dashboard</mat-icon>
                Dashboard
              </a>
              <a routerLink="/library" 
                 (click)="closeMobileMenu()"
                 class="mobile-nav-link">
                <mat-icon>folder</mat-icon>
                Library
              </a>
              <a routerLink="/billing" 
                 (click)="closeMobileMenu()"
                 class="mobile-nav-link">
                <mat-icon>payment</mat-icon>
                Billing
              </a>
              <!-- @if (isAdmin()) {
                <a routerLink="/admin" 
                   (click)="closeMobileMenu()"
                   class="mobile-nav-link">
                  <mat-icon>admin_panel_settings</mat-icon>
                  Admin
                </a>
              } -->
            }
          </nav>

          @if (!currentUser()) {
            <div class="mobile-auth-actions">
              <a routerLink="/auth/login" 
                 mat-button 
                 (click)="closeMobileMenu()"
                 class="w-100 mb-2">
                Sign In
              </a>
              <a routerLink="/auth/signup" 
                 mat-raised-button 
                 color="accent"
                 (click)="closeMobileMenu()"
                 class="w-100">
                Get Started
              </a>
            </div>
          }
        </div>
      </div>
    }

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu">
      <div class="user-menu-header">
        <div class="user-details">
          <div class="user-avatar-large">👤</div>
          <div class="user-text">
            <div class="user-full-name">
              {{ currentUser()?.firstName }} {{ currentUser()?.lastName }}
            </div>
            <div class="user-email">{{ currentUser()?.email }}</div>
            <div class="user-plan">{{ currentUser()?.subscription?.plan | titlecase }}</div>
          </div>
        </div>
      </div>
      
      <mat-divider></mat-divider>
      
      <button mat-menu-item routerLink="/settings">
        <mat-icon>person</mat-icon>
        <span>Profile Settings</span>
      </button>
      
      <button mat-menu-item routerLink="/billing">
        <mat-icon>payment</mat-icon>
        <span>Billing & Usage</span>
      </button>
      
      <button mat-menu-item routerLink="/settings">
        <mat-icon>settings</mat-icon>
        <span>Preferences</span>
      </button>
      
      <mat-divider></mat-divider>
      
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Sign Out</span>
      </button>
    </mat-menu>

    <!-- Notification Menu -->
    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="notification-header">
        <h4>Notifications</h4>
        <button mat-button (click)="markAllAsRead()">Mark All Read</button>
      </div>
      
      <mat-divider></mat-divider>
      
      @if (notifications().length === 0) {
        <div class="no-notifications">
          <mat-icon>notifications_none</mat-icon>
          <p>No notifications</p>
        </div>
      } @else {
        @for (notification of notifications(); track $index) {
          <button mat-menu-item 
                  class="notification-item"
                  [class.unread]="!notification.isRead"
                  (click)="handleNotificationClick(notification)">
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ notification.createdAt | date:'short' }}</div>
            </div>
          </button>
        }
      }
      
      <mat-divider></mat-divider>
      
      <button mat-menu-item routerLink="/settings" class="view-all-btn">
        View All Notifications
      </button>
    </mat-menu>
  `,
  styles: [`
    :host {
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
    }

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

    .header-toolbar {
      position: relative;
      width: 100%;
      height: 70px;
      background: #2c2c2c !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      padding: 0 !important;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      overflow: visible;
    }

    .header-toolbar .container-fluid {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      position: relative;
    }

    .navbar-brand {
      text-decoration: none;
      color: inherit;
      font-weight: 700;
      font-size: 1.5rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all var(--transition-normal);
      padding: 0.25rem 0;
    }

    .navbar-brand:hover {
      transform: translateY(-1px);
    }

    .logo-svg {
      height: 32px;
      width: auto;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }

    .logo-text-fallback {
      font-size: 1.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
    }

    .brand-text {
      color: #ffc107 !important;
      font-weight: 700;
      letter-spacing: -0.5px;
      font-size: 1.2rem;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      transition: all var(--transition-normal);
    }
    
    .navbar-brand:hover .brand-text {
      color: #ffcd38 !important;
      text-shadow: 0 2px 4px rgba(255,193,7,0.3);
    }

    .desktop-nav-wrapper {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    .navbar-nav {
      display: flex !important;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      height: 100%;
      flex-direction: row !important;
      flex-wrap: nowrap;
      white-space: nowrap;
    }

    .nav-link {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      padding: 0.5rem 0;
      transition: all var(--transition-normal);
      font-weight: 500;
      font-size: 1rem;
      position: relative;
      white-space: nowrap;
      border-bottom: 2px solid transparent;
      outline: none !important;
    }

    .nav-link:hover {
      color: white;
      border-bottom-color: rgba(255, 255, 255, 0.5);
    }

    .nav-link:focus {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
      color: white;
      border-bottom-color: rgba(255, 255, 255, 0.5);
    }
    
    .nav-link.active {
      color: white;
      border-bottom-color: #ffc107;
      font-weight: 600;
    }

    .billing-link {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .billing-link mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .nav-button {
      color: rgba(255, 255, 255, 0.9) !important;
      border-radius: 50px !important;
      padding: 0.5rem 1rem !important;
      transition: all var(--transition-normal);
      font-size: 0.85rem;
      outline: none !important;
      border: none !important;
    }

    .nav-button:hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
      transform: translateY(-1px);
      color: white !important;
    }

    .nav-button:focus {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: white !important;
    }

    .sign-in-btn {
      color: rgba(255, 255, 255, 0.9) !important;
      border-radius: 50px !important;
      padding: 0.5rem 1rem !important;
      transition: all var(--transition-normal);
      font-size: 0.9rem;
      outline: none !important;
      border: none !important;
    }

    .sign-in-btn:hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: white !important;
    }

    .sign-in-btn:focus {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: white !important;
    }

    .notification-button {
      color: rgba(255, 255, 255, 0.9) !important;
      outline: none !important;
      border: none !important;
    }

    .notification-button:hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: white !important;
    }

    .notification-button:focus {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: white !important;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .user-avatar-large {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
    }

    .user-menu-button {
      color: rgba(255, 255, 255, 0.9) !important;
      border-radius: 50px !important;
      padding: 0.5rem 1rem !important;
      outline: none !important;
      border: none !important;
    }

    .user-menu-button:hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: white !important;
    }

    .user-menu-button:focus {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: white !important;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .mobile-menu-toggle {
      display: none;
      color: rgba(255, 255, 255, 0.9) !important;
      outline: none !important;
      border: none !important;
    }

    .mobile-menu-toggle:hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: white !important;
    }

    .mobile-menu-toggle:focus {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: white !important;
    }

    .user-actions {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .authenticated-menu,
    .guest-menu {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .get-started-btn {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%) !important;
      color: #333 !important;
      font-weight: 700;
      border-radius: 50px !important;
      box-shadow: 0 4px 20px rgba(255, 193, 7, 0.3);
      transition: all var(--transition-normal);
      padding: 0.75rem 1.5rem !important;
      font-size: 0.9rem;
      border: none !important;
      letter-spacing: 0.5px;
      outline: none !important;
    }
    
    .get-started-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(255, 193, 7, 0.4);
      background: linear-gradient(135deg, var(--primary-color-dark) 0%, #e65100 100%) !important;
    }

    .get-started-btn:focus {
      outline: none !important;
      border: none !important;
      box-shadow: 0 8px 30px rgba(255, 193, 7, 0.4) !important;
      background: linear-gradient(135deg, var(--primary-color-dark) 0%, #e65100 100%) !important;
      transform: translateY(-2px);
    }

    .user-name {
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9) !important;
    }

    .mobile-menu {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      background: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 999;
      max-height: calc(100vh - 70px);
      overflow-y: auto;
    }

    .mobile-menu-content {
      padding: 1rem;
    }

    .mobile-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      color: #333;
      text-decoration: none;
      border-radius: 0.25rem;
      transition: background-color 0.3s ease;
    }

    .mobile-nav-link:hover {
      background-color: #f8f9fa;
    }

    .mobile-divider {
      margin: 1rem 0;
      border-color: #e9ecef;
    }

    /* Responsive adjustments */
    @media (max-width: 1200px) {
      .header-toolbar .container-fluid {
        padding: 0 1.5rem;
      }
      
      .navbar-nav {
        gap: 1.5rem;
        display: flex !important;
        flex-direction: row !important;
      }
      
      .nav-link {
        font-size: 0.9rem;
      }
    }

    @media (max-width: 992px) {
      .header-toolbar .container-fluid {
        padding: 0 1.25rem;
      }
      
      .navbar-nav {
        gap: 1rem;
        display: flex !important;
        flex-direction: row !important;
      }
      
      .nav-link {
        font-size: 0.85rem;
      }
    }

    @media (max-width: 860px) {
      .navbar-nav {
        gap: 0.8rem;
        display: flex !important;
        flex-direction: row !important;
      }
      
      .nav-link {
        font-size: 0.8rem;
      }
    }

    @media (max-width: 768px) {
      .header-toolbar .container-fluid {
        padding: 0 1rem;
      }
      
      .navbar-brand {
        font-size: 1.3rem;
      }
      
      .logo-svg {
        height: 28px;
      }
      
      .get-started-btn {
        padding: 0.6rem 1.2rem !important;
        font-size: 0.85rem;
      }
      
      .desktop-nav-wrapper {
        flex: 1;
        display: flex;
        justify-content: center;
      }
      
      .navbar-nav {
        gap: 0.5rem;
        display: flex !important;
        flex-direction: row !important;
        align-items: center;
        justify-content: center;
      }
      
      .nav-link {
        font-size: 0.75rem;
      }
      
      .mobile-menu-toggle {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .header-toolbar .container-fluid {
        padding: 0 0.75rem;
      }
      
      .navbar-brand {
        font-size: 1.2rem;
      }
      
      .brand-text {
        font-size: 0.9em;
      }
      
      .logo-svg {
        height: 24px;
      }
      
      .get-started-btn {
        padding: 0.5rem 1rem !important;
        font-size: 0.8rem;
      }
      
      .user-actions {
        gap: 0.5rem;
      }
      
      /* Hide desktop nav on very small screens only */
      .navbar-nav {
        display: none;
      }
      
      .mobile-menu-toggle {
        display: block;
      }
    }

    .mobile-auth-actions {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .user-menu-header {
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin: -8px -8px 0 -8px;
    }

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-text {
      flex: 1;
    }

    .user-full-name {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .user-email {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .user-plan {
      font-size: 0.8rem;
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      display: inline-block;
      margin-top: 0.25rem;
    }

    .notification-menu {
      min-width: 350px;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      margin: -8px -8px 0 -8px;
      background: #f8f9fa;
    }

    .notification-header h4 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .notification-item {
      width: 100%;
      text-align: left;
      padding: 1rem !important;
      border-left: 3px solid transparent;
    }

    .notification-item.unread {
      background-color: #f0f8ff;
      border-left-color: #007bff;
    }

    .notification-content {
      width: 100%;
    }

    .notification-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .notification-message {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.25rem;
    }

    .notification-time {
      font-size: 0.8rem;
      color: #999;
    }

    .no-notifications {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .no-notifications mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 0.5rem;
      opacity: 0.5;
    }

    .view-all-btn {
      width: 100%;
      text-align: center;
      font-weight: 600;
      color: #007bff;
    }

    @media (max-width: 991px) {
      .header-toolbar {
        height: 60px;
      }

      .mobile-menu {
        top: 60px;
      }

      .logo {
        height: 28px;
      }

      .brand-text {
        font-size: 1.25rem;
      }
    }
  `]
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  
  // Logo fallback state
  useTextLogo = false;
  
  // Mobile menu state
  private _isMobileMenuOpen = false;

  // Computed properties
  public readonly currentUser = this.authService.currentUser;
  public readonly isAdmin = computed(() => this.authService.isAdmin());
  
  // Mock data - replace with actual notification service
  public readonly notifications = computed(() => [] as any[]);
  public readonly notificationCount = computed(() => this.notifications().filter((n: any) => !n.isRead).length);
  public readonly isMobileMenuOpen = computed(() => this._isMobileMenuOpen);

  logout(): void {
    this.authService.logout();
  }

  toggleMobileMenu(): void {
    this._isMobileMenuOpen = !this._isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this._isMobileMenuOpen = false;
  }

  markAllAsRead(): void {
    // TODO: Implement mark all notifications as read
    console.log('Mark all notifications as read');
  }

  handleNotificationClick(notification: any): void {
    // TODO: Implement notification click handler
    console.log('Notification clicked:', notification);
  }
}