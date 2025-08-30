import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '@app/services/auth/auth.service';
import { SeoService } from '@app/services/seo/seo.service';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';
import { ComponentStateService, GeneratedComponent } from '../../services/component-state/component-state.service';
import { UserDataService } from '../../services/user/user-data.service';
import { ComponentService } from '../../services/component/component.service';
import { EnhancedPreviewComponent } from '../../components/shared/enhanced-preview/enhanced-preview.component';
import { DashboardNavComponent } from '../../components/shared/dashboard-nav/dashboard-nav.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    EnhancedPreviewComponent,
    DashboardNavComponent
  ],
  template: `
    <div class="dashboard-page">
      <!-- Left Sidebar Navigation -->
      <div class="dashboard-sidebar">
        <div class="sidebar-header">
          <div class="brand-logo">
            <mat-icon class="logo-icon">dashboard</mat-icon>
            <span class="brand-name">Dashboard</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <!-- Dashboard Home -->
          <div class="nav-section">
            <a routerLink="/dashboard" 
               routerLinkActive="active" 
               [routerLinkActiveOptions]="{ exact: true }"
               class="nav-item dashboard-home">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard Home</span>
            </a>
          </div>

          <!-- AI-Powered Tools Section -->
          <div class="nav-section">
            <div class="nav-section-title">AI-Powered Tools</div>
            <a routerLink="/dashboard/ai-copilot" 
               routerLinkActive="active" 
               class="nav-item">
              <mat-icon>psychology</mat-icon>
              <span>AI Copilot</span>
            </a>
            <a routerLink="/dashboard/generate" 
               routerLinkActive="active" 
               class="nav-item">
              <mat-icon>auto_awesome</mat-icon>
              <span>Generate Component</span>
            </a>
            <a routerLink="/dashboard/scaffold" 
               routerLinkActive="active" 
               class="nav-item">
              <mat-icon>construction</mat-icon>
              <span>Scaffold Generator</span>
            </a>
            <a routerLink="/dashboard/playground" 
               routerLinkActive="active" 
               class="nav-item">
              <mat-icon>code</mat-icon>
              <span>Component Playground</span>
            </a>
          </div>

          <!-- Component Management Section -->
          <div class="nav-section">
            <div class="nav-section-title">Component Management</div>
            <a routerLink="/dashboard/components" 
               routerLinkActive="active" 
               class="nav-item">
              <mat-icon>widgets</mat-icon>
              <span>My Components</span>
            </a>
            <a routerLink="/dashboard/gallery" 
               routerLinkActive="active" 
               class="nav-item">
              <mat-icon>view_carousel</mat-icon>
              <span>Component Gallery</span>
            </a>
            <a routerLink="/dashboard/templates" 
               routerLinkActive="active" 
               class="nav-item">
              <mat-icon>view_module</mat-icon>
              <span>Templates</span>
            </a>
          </div>

          <!-- History & Export Section -->
          <div class="nav-section">
            <div class="nav-section-title">History & Export</div>
            <a routerLink="/dashboard/history" 
               routerLinkActive="active" 
               class="nav-item">
              <mat-icon>history</mat-icon>
              <span>History</span>
            </a>
            <a routerLink="/dashboard/export" 
               routerLinkActive="active" 
               class="nav-item">
              <mat-icon>download</mat-icon>
              <span>Export</span>
            </a>
          </div>

          <!-- Other Section -->
          <div class="nav-section">
            <div class="nav-section-title">Other</div>
            <a routerLink="/library" 
               routerLinkActive="active" 
               class="nav-item">
              <mat-icon>folder</mat-icon>
              <span>Component Library</span>
            </a>
            <a routerLink="/settings" 
               routerLinkActive="active" 
               class="nav-item">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </a>
            
            <!-- 👑 ADMIN PANEL - Only visible to admin users -->
            @if (isAdmin()) {
              <a routerLink="/admin" 
                 routerLinkActive="active" 
                 class="nav-item admin-nav">
                <mat-icon>admin_panel_settings</mat-icon>
                <span>Admin Panel</span>
                <mat-icon class="admin-badge" matTooltip="Administrator Access">verified</mat-icon>
              </a>
            }
          </div>
        </nav>

        <!-- Quick Action Button -->
        <div class="sidebar-footer">
          <button mat-raised-button 
                  color="primary" 
                  class="quick-action-btn"
                  routerLink="/dashboard/ai-copilot">
            <mat-icon>psychology</mat-icon>
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="dashboard-main">
        <div class="dashboard-header">
          <div class="header-content">
            <h1>Welcome back, {{ currentUser()?.firstName || 'Developer' }}!</h1>
            <p class="dashboard-subtitle">Ready to create amazing components?</p>
            

          </div>
          <div class="header-actions">
            <button (click)="generateComponent()" 
               mat-raised-button 
               color="primary" 
               class="generate-btn">
              <mat-icon>auto_awesome</mat-icon>
              Generate Component
            </button>
          </div>
        </div>

        <div class="dashboard-main-content">
        <div class="dashboard-grid">
          <!-- Quick Stats -->
          <div class="stats-section">
            <h2 class="section-title">Your Stats</h2>
            <div class="stats-grid">
              <mat-card class="stat-card usage-card">
                <mat-card-content>
                  <div class="stat-header">
                    <mat-icon class="stat-icon">trending_up</mat-icon>
                    <span class="stat-label">Usage This Month</span>
                  </div>
                  <div class="stat-value">
                    {{ mockUsage.used }} / {{ mockUsage.limit }}
                  </div>
                  <mat-progress-bar 
                    mode="determinate" 
                    [value]="usagePercentage()"
                    [color]="usagePercentage() > 80 ? 'warn' : 'primary'">
                  </mat-progress-bar>
                  <div class="stat-note">
                    {{ generationsRemaining() }} generations remaining
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card components-card">
                <mat-card-content>
                  <div class="stat-header">
                    <mat-icon class="stat-icon">folder</mat-icon>
                    <span class="stat-label">Saved Components</span>
                  </div>
                  <div class="stat-value">{{ savedComponentsCount() }}</div>
                  <div class="stat-note">
                    <a routerLink="/library" class="view-link">View Library</a>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card plan-card">
                <mat-card-content>
                  <div class="stat-header">
                    <mat-icon class="stat-icon">workspace_premium</mat-icon>
                    <span class="stat-label">Current Plan</span>
                  </div>
                  <div class="stat-value">{{ mockPlan }}</div>
                  <div class="stat-note">
                    <a routerLink="/billing" class="upgrade-link">Upgrade Plan</a>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card activity-card">
                <mat-card-content>
                  <div class="stat-header">
                    <mat-icon class="stat-icon">history</mat-icon>
                    <span class="stat-label">Recent Activity</span>
                  </div>
                  <div class="stat-value">{{ recentGenerationsCount() }}</div>
                  <div class="stat-note">
                    <a routerLink="/dashboard/history" class="view-link">View History</a>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="actions-section">
            <h2 class="section-title">Quick Actions</h2>
            <div class="actions-grid">
              <mat-card class="action-card" routerLink="/dashboard/generate">
                <mat-card-content>
                  <div class="action-icon">
                    <mat-icon>auto_awesome</mat-icon>
                  </div>
                  <h3>Generate Component</h3>
                  <p>Create new components with AI assistance</p>
                  <div class="action-badge">
                    <mat-chip color="primary">Most Popular</mat-chip>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="action-card" routerLink="/dashboard/templates">
                <mat-card-content>
                  <div class="action-icon">
                    <mat-icon>template_library</mat-icon>
                  </div>
                  <h3>Browse Templates</h3>
                  <p>Start with pre-built component templates</p>
                </mat-card-content>
              </mat-card>

              <mat-card class="action-card" routerLink="/library">
                <mat-card-content>
                  <div class="action-icon">
                    <mat-icon>folder_open</mat-icon>
                  </div>
                  <h3>Component Library</h3>
                  <p>Manage your saved components</p>
                  @if (savedComponentsCount() > 0) {
                    <div class="action-badge">
                      <mat-chip [matBadge]="savedComponentsCount()">{{ savedComponentsCount() }} saved</mat-chip>
                    </div>
                  }
                </mat-card-content>
              </mat-card>

              <mat-card class="action-card" routerLink="/dashboard/export">
                <mat-card-content>
                  <div class="action-icon">
                    <mat-icon>download</mat-icon>
                  </div>
                  <h3>Export Components</h3>
                  <p>Download your components as ZIP files</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <!-- Recent Components -->
          <div class="recent-section">
            <div class="section-header">
              <h2 class="section-title">Recent Components</h2>
              <a routerLink="/dashboard/components" mat-button color="primary">
                View All
                <mat-icon>arrow_forward</mat-icon>
              </a>
            </div>
            
            <div class="recent-components">
              @if (recentComponents().length === 0) {
                <div class="empty-state">
                  <mat-icon>code</mat-icon>
                  <h3>No components yet</h3>
                  <p>Start by generating your first component!</p>
                  <a routerLink="/dashboard/generate" 
                     mat-raised-button 
                     color="primary">
                    <mat-icon>add</mat-icon>
                    Generate Component
                  </a>
                </div>
              } @else {
                <div class="components-list">
                  @for (component of recentComponents(); track component.id) {
                    <mat-card class="component-card" (click)="previewComponent(component)">
                      <mat-card-content>
                        <div class="component-header">
                          <div class="component-info">
                            <h4>{{ component.name }}</h4>
                            <div class="component-meta">
                              <mat-chip class="framework-chip">{{ component.framework }}</mat-chip>
                              <mat-chip class="design-chip" [style.background-color]="getDesignFrameworkColor(component.designFramework)">
                                {{ getDesignFrameworkLabel(component.designFramework) }}
                              </mat-chip>
                              <span class="component-date">{{ component.createdAt | date:'short' }}</span>
                            </div>
                          </div>
                          <div class="component-actions" (click)="$event.stopPropagation()">
                            <button mat-icon-button 
                                    (click)="previewComponent(component)"
                                    matTooltip="Enhanced Preview with Editor">
                              <mat-icon>visibility</mat-icon>
                            </button>
                            <button mat-icon-button 
                                    (click)="editComponent(component)"
                                    matTooltip="Edit in Monaco Editor">
                              <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button 
                                    (click)="toggleSaveComponent(component)"
                                    matTooltip="Save to Library"
                                    [color]="component.isSaved ? 'primary' : ''">
                              <mat-icon>{{ component.isSaved ? 'bookmark' : 'bookmark_border' }}</mat-icon>
                            </button>
                          </div>
                        </div>
                        <p class="component-description">{{ component.description }}</p>
                        <div class="component-preview-hint">
                          <mat-icon>play_circle</mat-icon>
                          <span>Click to preview with Monaco Editor</span>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Tips and Tutorials -->
          <div class="tips-section">
            <h2 class="section-title">Tips & Tutorials</h2>
            <div class="tips-grid">
              <mat-card class="tip-card">
                <mat-card-content>
                  <div class="tip-icon">
                    <mat-icon>lightbulb</mat-icon>
                  </div>
                  <h4>Writing Better Prompts</h4>
                  <p>Learn how to write effective prompts for better component generation</p>
                  <a href="https://docs.frontuna.com/prompts" target="_blank" mat-button color="primary">
                    Read Guide
                  </a>
                </mat-card-content>
              </mat-card>

              <mat-card class="tip-card">
                <mat-card-content>
                  <div class="tip-icon">
                    <mat-icon>school</mat-icon>
                  </div>
                  <h4>Component Best Practices</h4>
                  <p>Discover best practices for creating maintainable components</p>
                  <a routerLink="/best-practices" mat-button color="primary">
                    Learn More
                  </a>
                </mat-card-content>
              </mat-card>

              <mat-card class="tip-card">
                <mat-card-content>
                  <div class="tip-icon">
                    <mat-icon>play_circle</mat-icon>
                  </div>
                  <h4>Video Tutorials</h4>
                  <p>Watch step-by-step tutorials on using Frontuna.com effectively</p>
                  <a routerLink="/tutorials" mat-button color="primary">
                    Watch Now
                  </a>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Preview Modal -->
    @if (selectedComponentForPreview()) {
      <div class="preview-modal-overlay" (click)="closePreview()">
        <div class="preview-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ selectedComponentForPreview()?.name }} - Enhanced Preview</h2>
            <div class="modal-actions">
              <button mat-raised-button 
                      color="primary"
                      (click)="editComponent(selectedComponentForPreview()!)">
                <mat-icon>edit</mat-icon>
                Edit Component
              </button>
              <button mat-icon-button (click)="closePreview()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
          <div class="modal-content">
            <app-enhanced-preview 
              [component]="selectedComponentForPreview()!"
              [enableEditing]="true">
            </app-enhanced-preview>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      min-height: 100vh;
      background: transparent;
    }

    /* Sidebar Styles */
    .dashboard-sidebar {
      width: 280px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-right: 1px solid rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      z-index: 100;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }

    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--primary-color);
    }

    .brand-name {
      font-size: 20px;
      font-weight: 700;
      color: var(--dark-color);
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 20px 0;
    }

    .nav-section {
      margin-bottom: 32px;
    }

    .nav-section-title {
      padding: 0 20px 12px 20px;
      font-size: 11px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: rgba(0, 0, 0, 0.7);
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background: rgba(102, 126, 234, 0.1);
      color: var(--primary-color);
      border-left-color: rgba(102, 126, 234, 0.3);
    }

    .nav-item.active {
      background: rgba(102, 126, 234, 0.15);
      color: var(--primary-color);
      border-left-color: var(--primary-color);
      font-weight: 600;
    }

    .nav-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* 👑 ADMIN PANEL STYLES */
    .nav-item.admin-nav {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1));
      border-left: 3px solid #ff9800;
      position: relative;
    }

    .nav-item.admin-nav:hover {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 152, 0, 0.2));
      border-left-color: #ff6f00;
    }

    .nav-item.admin-nav.active {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.25), rgba(255, 152, 0, 0.25));
      border-left-color: #ff6f00;
      font-weight: 700;
    }

    .admin-badge {
      margin-left: auto;
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      color: #ff9800;
    }

    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    .quick-action-btn {
      width: 100%;
      height: 48px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .quick-action-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    /* Main Content Area */
    .dashboard-main {
      flex: 1;
      margin-left: 280px;
      padding: 32px;
      overflow-x: hidden;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(45deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .dashboard-subtitle {
      margin: 0;
      font-size: 1.2rem;
      color: rgba(33, 37, 41, 0.8);
    }

    .generate-btn {
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      padding: 0 24px;
    }

    .dashboard-main-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-grid {
      display: flex;
      flex-direction: column;
      gap: 48px;
    }

    .section-title {
      font-size: 1.8rem;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: var(--dark-color);
    }

    /* Stats Section */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .stat-card {
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
    }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .stat-icon {
      width: 24px;
      height: 24px;
      color: var(--primary-color-light);
    }

    .stat-label {
      font-size: 14px;
      font-weight: 600;
      color: rgba(33, 37, 41, 0.8);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--dark-color);
      margin-bottom: 8px;
    }

    .stat-note {
      font-size: 12px;
      color: rgba(33, 37, 41, 0.6);
    }

    .view-link, .upgrade-link {
      color: var(--accent-color);
      text-decoration: none;
      font-weight: 600;
    }

    /* Actions Section */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .action-card {
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    }

    .action-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 50px rgba(102, 126, 234, 0.4);
      background: rgba(255,255,255,0.95);
    }

    .action-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
      border-radius: 50%;
      color: white;
    }

    .action-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .action-card h3 {
      margin: 0 0 8px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--dark-color);
    }

    .action-card p {
      margin: 0 0 16px 0;
      color: rgba(33, 37, 41, 0.7);
    }

    .action-badge {
      margin-top: 12px;
    }

    /* Recent Components */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .components-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .component-card {
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .component-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
    }

    .component-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .component-info h4 {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--dark-color);
    }

    .component-meta {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .framework-chip {
      background: rgba(33, 150, 243, 0.2);
      color: #2196f3;
    }

    .design-chip {
      color: var(--dark-color);
    }

    .component-date {
      font-size: 12px;
      color: rgba(33, 37, 41, 0.6);
    }

    .component-actions {
      display: flex;
      gap: 4px;
    }

    .component-description {
      margin: 0 0 12px 0;
      color: rgba(33, 37, 41, 0.7);
      font-size: 14px;
      line-height: 1.4;
    }

    .component-preview-hint {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: rgba(33, 37, 41, 0.5);
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .component-card:hover .component-preview-hint {
      opacity: 1;
    }

    /* Tips Section */
    .tips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .tip-card {
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,0,0,0.1);
      text-align: center;
      transition: all 0.3s ease;
    }

    .tip-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
    }

    .tip-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent-color);
      border-radius: 50%;
      color: white;
    }

    .tip-card h4 {
      margin: 0 0 8px 0;
      color: var(--dark-color);
      font-weight: 600;
    }

    .tip-card p {
      margin: 0 0 16px 0;
      color: rgba(33, 37, 41, 0.7);
      font-size: 14px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: rgba(33, 37, 41, 0.6);
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(33, 37, 41, 0.3);
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: var(--dark-color);
    }

    /* Enhanced Preview Modal */
    .preview-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .preview-modal {
      background: white;
      border-radius: 12px;
      max-width: 1200px;
      max-height: 90vh;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      flex: 1;
    }

    .modal-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-content {
      max-height: calc(90vh - 80px);
      overflow: auto;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .dashboard-sidebar {
        width: 260px;
      }

      .dashboard-main {
        margin-left: 260px;
        padding: 24px;
      }
    }

    @media (max-width: 768px) {
      .dashboard-sidebar {
        width: 100%;
        position: fixed;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        z-index: 1000;
      }

      .dashboard-sidebar.open {
        transform: translateX(0);
      }

      .dashboard-main {
        margin-left: 0;
        padding: 16px;
        width: 100%;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
        position: relative;
      }

      .dashboard-header::before {
        content: '';
        position: absolute;
        top: -16px;
        left: -16px;
        right: -16px;
        height: 60px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        padding: 0 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        z-index: 50;
      }

      .header-content h1 {
        font-size: 2rem;
      }

      .stats-grid,
      .actions-grid,
      .components-list,
      .tips-grid {
        grid-template-columns: 1fr;
      }

      .nav-section-title {
        font-size: 10px;
      }

      .nav-item {
        padding: 14px 20px;
      }

      .sidebar-footer {
        padding: 16px;
      }
    }

    @media (max-width: 480px) {
      .dashboard-main {
        padding: 12px;
      }

      .dashboard-header {
        gap: 12px;
      }

      .header-content h1 {
        font-size: 1.8rem;
      }

      .generate-btn {
        width: 100%;
        justify-content: center;
      }

      .brand-name {
        font-size: 18px;
      }

      .nav-item span {
        font-size: 14px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);
  private readonly router = inject(Router);
  private readonly componentStateService = inject(ComponentStateService);
  private readonly userDataService = inject(UserDataService);
  private readonly componentService = inject(ComponentService);

  public readonly currentUser = this.authService.currentUser;

  // Component state from service
  public readonly recentComponents = this.componentStateService.recentComponents;
  
  // 👑 ADMIN CHECK - Determine if current user is admin
  public readonly isAdmin = computed(() => {
    const user = this.currentUser();
    
    // Only show admin panel for actual admin users
    const isAdminRole = user?.role === 'admin';
    const isRealAdmin = isAdminRole && (user?.email === 'admin@frontuna.com' || user?.email === 'admin@frontuna.ai');
    
    console.log('🔍 ADMIN CHECK:', { 
      user: user?.email, 
      role: user?.role, 
      isAdminRole,
      isRealAdmin,
      showAdminPanel: isRealAdmin
    });
    
    // Only return true for verified admin users
    return isRealAdmin;
  });
  public readonly savedComponentsCount = computed(() => this.componentStateService.savedComponents().length);
  public readonly allComponents = this.componentStateService.components;
  
  // Preview functionality
  public selectedComponentForPreview = signal<GeneratedComponent | null>(null);

  // Mock data - will be replaced with real data from backend
  public readonly recentGenerationsCount = computed(() => this.recentComponents().length);
  public readonly mockUsage = {
    used: 23,
    limit: 100
  };
  public readonly mockPlan = 'Free';

  public readonly usagePercentage = computed(() => {
    return Math.round((this.mockUsage.used / this.mockUsage.limit) * 100);
  });

  public readonly generationsRemaining = computed(() => {
    return Math.max(0, this.mockUsage.limit - this.mockUsage.used);
  });

  ngOnInit(): void {
    console.log('🔧 DASHBOARD INITIALIZING WITH ENHANCED DATA CONNECTIVITY');
    
    this.seoService.setPageSeo({
      title: 'Dashboard - Frontuna.com',
      description: 'Your AI-powered frontend component generation dashboard. Create, manage, and export components with ease.',
      url: 'https://frontuna.com/dashboard'
    });

    this.analyticsService.trackPageView({
      page_title: 'Dashboard',
      page_location: window.location.href
    });
    
    // 🚀 SPRINT 1: COMPREHENSIVE DATA LOADING
    const currentUser = this.authService.currentUser();
    if (currentUser?.id) {
      console.log('👤 Loading comprehensive dashboard data for user:', currentUser.email);
      
      // Load user profile with subscription and usage data
      this.userDataService.fetchUserProfile().subscribe({
        next: (profile) => {
          console.log('✅ Dashboard user profile loaded:', {
            email: profile.email,
            plan: profile.subscription?.plan,
            usage: profile.usage
          });
        },
        error: (error) => {
          console.warn('⚠️ Dashboard profile fetch failed:', error);
        }
      });
      
      // Load user's components
      this.componentService.getComponents().subscribe({
        next: (components) => {
          console.log('✅ Dashboard components loaded:', components.length, 'components');
        },
        error: (error) => {
          console.warn('⚠️ Dashboard components fetch failed:', error);
        }
      });
      
      // Load user analytics
      this.userDataService.getUserAnalytics().subscribe({
        next: (analytics) => {
          console.log('✅ Dashboard analytics loaded:', analytics);
        },
        error: (error) => {
          console.warn('⚠️ Dashboard analytics fetch failed:', error);
        }
      });
    } else {
      console.warn('⚠️ No authenticated user found for dashboard data loading');
    }
  }

  generateComponent(): void {
    this.router.navigate(['/dashboard/generate']);
    
    this.analyticsService.trackEvent({
      action: 'click_generate_component',
      category: 'dashboard_action',
      label: 'header_button'
    });
  }

  // Enhanced Preview Functionality
  previewComponent(component: GeneratedComponent): void {
    this.selectedComponentForPreview.set(component);
    this.analyticsService.trackEvent({
      action: 'preview_component',
      category: 'dashboard_preview',
      label: component.id
    });
  }

  closePreview(): void {
    this.selectedComponentForPreview.set(null);
  }

  editComponent(component: GeneratedComponent): void {
    // Navigate to generate page with component pre-loaded for editing
    this.router.navigate(['/dashboard/generate'], { 
      queryParams: { edit: component.id }
    });
    
    this.analyticsService.trackEvent({
      action: 'edit_component',
      category: 'dashboard_edit',
      label: component.id
    });
  }

  toggleSaveComponent(component: GeneratedComponent): void {
    const newSavedState = !component.isSaved;
    
    // Update the component in the service
    this.componentStateService.updateComponent(component.id, { 
      isSaved: newSavedState 
    });
    
    this.analyticsService.trackEvent({
      action: newSavedState ? 'save_component' : 'unsave_component',
      category: 'dashboard_save',
      label: component.id
    });
    
    console.log(`✅ Component ${newSavedState ? 'saved to' : 'removed from'} library:`, component.name);
  }

  saveComponent(componentId: string): void {
    // Find the component and update its saved status
    const component = this.recentComponents().find((c: GeneratedComponent) => c.id === componentId);
    if (component && !component.isSaved) {
      // Use the service to update the component
      this.componentStateService.updateComponent(componentId, { isSaved: true });
      
      this.analyticsService.trackEvent({
        action: 'save_component',
        category: 'dashboard_action',
        label: component.name
      });
      
      // Show a success message
      console.log('✅ Component saved to library:', component.name);
    }
  }

  getDesignFrameworkLabel(framework: string): string {
    const frameworks: { [key: string]: string } = {
      'bootstrap': 'Bootstrap',
      'bootstrap-material': 'Bootstrap + Material',
      'material-ui': 'Material UI',
      'tailwind': 'Tailwind CSS',
      'plain': 'Plain CSS'
    };
    return frameworks[framework] || framework || 'Plain CSS';
  }

  getDesignFrameworkColor(framework: string): string {
    const colors: { [key: string]: string } = {
      'bootstrap': '#7952b3',
      'bootstrap-material': '#673ab7',
      'material-ui': '#2196f3',
      'tailwind': '#06b6d4',
      'plain': '#666666'
    };
    return colors[framework] || '#1976d2';
  }
}