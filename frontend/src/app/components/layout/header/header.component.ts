import { Component, inject, computed, signal } from '@angular/core';
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

    <!-- Bootstrap-style Mobile Menu -->
    <div class="mobile-menu-collapse" [class.show]="isMobileMenuOpen()">
      <div class="mobile-menu-container">
        <nav class="mobile-nav">
          <a routerLink="/about" 
             (click)="closeMobileMenu()"
             class="mobile-nav-link">
            About
          </a>
          @if (currentUser()) {
            <a routerLink="/dashboard/components" 
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
            <div class="mobile-divider"></div>
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
          } @else {
            <div class="mobile-divider"></div>
            <a routerLink="/auth/login" 
               (click)="closeMobileMenu()"
               class="mobile-nav-link mobile-auth-link">
              Sign In
            </a>
            <a routerLink="/auth/signup" 
               (click)="closeMobileMenu()"
               class="mobile-nav-link mobile-auth-link primary">
              Get Started
            </a>
          }
        </nav>
      </div>
    </div>

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
            <div class="user-plan-section">
              <div class="user-plan" [class.plan-free]="getUserPlan() === 'free'" 
                                   [class.plan-premium]="getUserPlan() === 'premium'"
                                   [class.plan-pro]="getUserPlan() === 'pro'">
                <mat-icon class="plan-icon">{{ getPlanIcon() }}</mat-icon>
                {{ getUserPlanLabel() }}
              </div>
                                  <div class="user-usage" *ngIf="getUserUsage() as usage">
                      {{ usage.used }}/{{ usage.limit }} generations used
                    </div>
            </div>
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
      
      <!-- 👑 ADMIN PANEL - Only visible to admin users -->
      @if (isAdmin()) {
        <mat-divider></mat-divider>
        
        <button mat-menu-item routerLink="/admin" class="admin-menu-item">
          <mat-icon class="admin-icon">admin_panel_settings</mat-icon>
          <span>Admin Panel</span>
          <mat-icon class="admin-badge">verified</mat-icon>
        </button>
      }
       
      
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

    /* Bootstrap-style Mobile Menu */
    .mobile-menu-collapse {
      display: none;
      background: #ffffff;
      border-top: 1px solid #e9ecef;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .mobile-menu-collapse.show {
      display: block;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .mobile-menu-container {
      padding: 1rem;
      max-width: 100%;
    }

    .mobile-nav {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #333;
      text-decoration: none;
      transition: all 0.2s ease;
      font-weight: 500;
      font-size: 1rem;
      border-bottom: 1px solid #f8f9fa;
    }

    .mobile-nav-link:hover {
      background-color: #f8f9fa;
      color: #007bff;
    }

    .mobile-nav-link:active {
      background-color: #e9ecef;
    }

    .mobile-nav-link mat-icon {
      color: #6c757d;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .mobile-nav-link:hover mat-icon {
      color: #007bff;
    }

    .mobile-divider {
      height: 1px;
      background-color: #e9ecef;
      margin: 0.5rem 0;
    }

    .mobile-auth-link {
      font-weight: 600;
      text-align: center;
      justify-content: center;
    }

    .mobile-auth-link.primary {
      background-color: #007bff;
      color: white !important;
      border-radius: 0.375rem;
      margin: 0.5rem 0;
    }

    .mobile-auth-link.primary:hover {
      background-color: #0056b3;
      color: white !important;
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

    @media (max-width: 900px) {
      /* Start hiding desktop nav on larger mobile/small tablet screens */
      .desktop-nav-wrapper {
        display: none !important;
      }
      
      .navbar-nav {
        display: none !important;
      }
      
      .mobile-menu-toggle {
        display: flex !important;
        align-items: center;
        justify-content: center;
      }
      
      /* Hide authenticated menu items on mobile - they'll be in the mobile menu */
      .authenticated-menu .nav-button {
        display: none !important;
      }
      
      /* Keep only notification and user menu buttons */
      .authenticated-menu {
        gap: 0.4rem;
      }
      
      .notification-button,
      .user-menu-button {
        display: flex !important;
      }
    }

    @media (max-width: 860px) {
      .header-toolbar .container-fluid {
        padding: 0 1rem;
      }
      
      .authenticated-menu {
        gap: 0.3rem;
      }
      
      .nav-button {
        padding: 0.35rem 0.7rem !important;
        font-size: 0.75rem;
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
      
      /* Completely hide desktop navigation on tablets and smaller */
      .desktop-nav-wrapper {
        display: none !important;
      }
      
      .navbar-nav {
        display: none !important;
      }
      
      /* Show mobile menu toggle on tablets and smaller */
      .mobile-menu-toggle {
        display: flex !important;
        align-items: center;
        justify-content: center;
      }
      
      .user-actions {
        gap: 0.5rem;
      }
      
      /* Hide authenticated menu nav buttons on mobile - they'll be in the mobile menu */
      .authenticated-menu .nav-button {
        display: none !important;
      }
      
      /* Adjust authenticated menu for mobile - keep only notification and user menu */
      .authenticated-menu {
        gap: 0.25rem;
      }
      
      .notification-button,
      .user-menu-button {
        display: flex !important;
      }
    }

    @media (max-width: 480px) {
      .header-toolbar .container-fluid {
        padding: 0 0.75rem;
      }
      
      .navbar-brand {
        font-size: 1.1rem;
      }
      
      .brand-text {
        font-size: 0.85rem;
      }
      
      .logo-svg {
        height: 24px;
      }
      
      .get-started-btn {
        padding: 0.5rem 1rem !important;
        font-size: 0.8rem;
      }
      
      .user-actions {
        gap: 0.25rem;
      }
      
      /* Further compress authenticated menu on small screens */
      .authenticated-menu {
        gap: 0.15rem;
      }
      
      /* Nav buttons are hidden on mobile, so these styles aren't needed */
      .authenticated-menu .nav-button {
        display: none !important;
      }
      
      .user-menu-button {
        padding: 0.3rem 0.6rem !important;
      }
      
      .user-avatar {
        width: 24px;
        height: 24px;
        font-size: 1rem;
      }
      
      .user-name {
        font-size: 0.8rem;
      }
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

    .user-plan-section {
      margin-top: 0.5rem;
    }

    .user-plan {
      font-size: 0.8rem;
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      margin-bottom: 0.25rem;
      font-weight: 600;
    }

    .user-plan.plan-free {
      background: rgba(158, 158, 158, 0.3);
      color: rgba(255, 255, 255, 0.9);
    }

    .user-plan.plan-pro {
      background: rgba(255, 193, 7, 0.3);
      color: #ffeb3b;
    }

    .user-plan.plan-premium {
      background: rgba(156, 39, 176, 0.3);
      color: #e1bee7;
    }

    .plan-icon {
      font-size: 14px !important;
      width: 14px !important;
      height: 14px !important;
    }

    .user-usage {
      font-size: 0.7rem;
      opacity: 0.8;
      font-weight: 400;
    }

    /* 👑 ADMIN MENU ITEM STYLES */
    .admin-menu-item {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1)) !important;
      color: #ff9800 !important;
      font-weight: 600 !important;
      position: relative;
    }

    .admin-menu-item:hover {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 152, 0, 0.2)) !important;
      color: #ff6f00 !important;
    }

    .admin-menu-item .admin-icon {
      color: #ff9800 !important;
    }

    .admin-menu-item .admin-badge {
      margin-left: auto !important;
      font-size: 16px !important;
      color: #ff9800 !important;
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

      .logo-svg {
        height: 28px;
      }

      .brand-text {
        font-size: 1.1rem;
      }
    }
    
    /* Additional breakpoint for very small screens */
    @media (max-width: 360px) {
      .header-toolbar .container-fluid {
        padding: 0 0.5rem;
      }
      
      .navbar-brand {
        font-size: 1rem;
      }
      
      .brand-text {
        font-size: 0.8rem;
      }
      
      .logo-svg {
        height: 20px;
      }
      
      .get-started-btn {
        padding: 0.4rem 0.8rem !important;
        font-size: 0.75rem;
      }
      
      .user-actions {
        gap: 0.15rem;
      }
      
      .nav-button {
        padding: 0.25rem 0.5rem !important;
        font-size: 0.7rem;
      }
      

    }
  `]
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  
  // Logo fallback state
  useTextLogo = false;
  
  // Simple mobile menu state
  private readonly _isMobileMenuOpen = signal(false);

  // Computed properties
  public readonly currentUser = this.authService.currentUser;
  public readonly isAdmin = computed(() => {
    const user = this.currentUser();
    
    // 🔍 BULLETPROOF ADMIN DETECTION - Multiple fallback methods
    const checks = {
      hasUser: !!user,
      email: user?.email || 'NO_EMAIL',
      role: user?.role || 'NO_ROLE',
      isAdminEmail: user?.email === 'admin@frontuna.com',
      isAdminRole: user?.role === 'admin',
      isAdminRoleString: user?.role === 'admin' || user?.role?.toLowerCase() === 'admin',
      emailContainsAdmin: user?.email?.toLowerCase().includes('admin') || false,
      firstNameIsAdmin: user?.firstName?.toLowerCase() === 'admin' || false
    };
    
    // 🚀 MULTIPLE ADMIN DETECTION METHODS
    const adminMethods = [
      checks.isAdminEmail,                    // Method 1: Exact email match
      checks.isAdminRole,                     // Method 2: Role is 'admin'
      checks.isAdminRoleString,              // Method 3: Role string comparison
      checks.emailContainsAdmin,             // Method 4: Email contains 'admin'
      checks.firstNameIsAdmin                // Method 5: First name is 'admin'
    ];
    
    const isAdmin = adminMethods.some(method => method === true);
    
    // 🔍 COMPREHENSIVE DEBUGGING
    console.log('👑 BULLETPROOF ADMIN CHECK:', {
      ...checks,
      adminMethods,
      finalResult: isAdmin,
      timestamp: new Date().toISOString(),
      localStorage_tokens: {
        primary: !!localStorage.getItem('frontuna_primary_token'),
        backup1: !!localStorage.getItem('frontuna_backup1_token'),
        emergency: !!localStorage.getItem('frontuna_emergency_token')
      }
    });
    
    // 🚨 ULTIMATE FALLBACK - Always show admin for admin@frontuna.com
    if (user?.email === 'admin@frontuna.com') {
      console.log('🔧 ULTIMATE ADMIN FALLBACK ACTIVATED for admin@frontuna.com');
      return true;
    }
    
    // 🚨 EMERGENCY FALLBACK - Show admin button if any admin indicators exist
    if (user && (user.email?.includes('admin') || user.role?.includes('admin') || user.firstName?.toLowerCase() === 'admin')) {
      console.log('🚨 EMERGENCY ADMIN FALLBACK ACTIVATED');
      return true;
    }
    
    return isAdmin;
  });
  
  // Mock data - replace with actual notification service
  public readonly notifications = computed(() => [] as any[]);
  public readonly notificationCount = computed(() => this.notifications().filter((n: any) => !n.isRead).length);
  public readonly isMobileMenuOpen = this._isMobileMenuOpen.asReadonly();

  async logout(): Promise<void> {
    await this.authService.logout();
  }

  toggleMobileMenu(): void {
    this._isMobileMenuOpen.set(!this._isMobileMenuOpen());
  }

  closeMobileMenu(): void {
    this._isMobileMenuOpen.set(false);
  }

  markAllAsRead(): void {
    // TODO: Implement mark all notifications as read
    console.log('Mark all notifications as read');
  }

  handleNotificationClick(notification: any): void {
    // TODO: Implement notification click handler
    console.log('Notification clicked:', notification);
  }

  // 💼 USER PLAN AND USAGE METHODS
  getUserPlan(): string {
    const user = this.currentUser();
    const plan = user?.subscription?.plan || 'free';
    console.log('📊 User Plan:', plan);
    return plan.toLowerCase();
  }

  getUserPlanLabel(): string {
    const plan = this.getUserPlan();
    const labels = {
      'free': 'Free Plan',
      'pro': 'Pro Plan', 
      'premium': 'Premium Plan',
      'enterprise': 'Enterprise Plan'
    };
    return labels[plan as keyof typeof labels] || 'Free Plan';
  }

  getPlanIcon(): string {
    const plan = this.getUserPlan();
    const icons = {
      'free': 'account_circle',
      'pro': 'star',
      'premium': 'workspace_premium',
      'enterprise': 'business'
    };
    return icons[plan as keyof typeof icons] || 'account_circle';
  }

  getUserUsage(): { used: number; limit: number } | null {
    const user = this.currentUser();
    if (user?.usage) {
      return {
        used: user.usage.generationsUsed || 0,
        limit: user.usage.generationsLimit || 10
      };
    }
    // Default usage for free plan
    return { used: 0, limit: 10 };
  }


}