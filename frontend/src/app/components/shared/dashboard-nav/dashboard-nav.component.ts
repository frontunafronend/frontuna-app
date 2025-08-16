import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

export interface DashboardNavItem {
  path: string;
  label: string;
  icon: string;
  description?: string;
}

@Component({
  selector: 'app-dashboard-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <nav class="dashboard-nav">
      <div class="nav-container">
        <!-- Home/Dashboard Link -->
        <div class="nav-brand">
          <a routerLink="/dashboard" class="brand-link">
            <mat-icon>dashboard</mat-icon>
            <span class="brand-text">Dashboard</span>
          </a>
          @if (currentPage && currentPage.toLowerCase() !== 'dashboard') {
            <mat-icon class="nav-separator">chevron_right</mat-icon>
            <span class="current-page">{{ currentPage }}</span>
          }
        </div>

        <!-- Navigation Menu -->
        <div class="nav-actions">
          <button mat-button 
                  [matMenuTriggerFor]="navMenu"
                  class="nav-menu-trigger">
            <mat-icon>apps</mat-icon>
            <span>Navigate</span>
            <mat-icon>expand_more</mat-icon>
          </button>

          <mat-menu #navMenu="matMenu" class="dashboard-nav-menu">
            <!-- Dashboard Overview -->
            <a mat-menu-item 
               [routerLink]="navItems[0].path"
               routerLinkActive="active-menu-item">
              <mat-icon>{{ navItems[0].icon }}</mat-icon>
              <div class="menu-item-content">
                <span class="menu-item-label">{{ navItems[0].label }}</span>
                <small class="menu-item-description">{{ navItems[0].description }}</small>
              </div>
            </a>
            
            <mat-divider></mat-divider>
            <div class="menu-section-header">AI-Powered Tools</div>
            
            <!-- AI Tools -->
            @for (item of getAITools(); track item.path) {
              <a mat-menu-item 
                 [routerLink]="item.path"
                 routerLinkActive="active-menu-item">
                <mat-icon>{{ item.icon }}</mat-icon>
                <div class="menu-item-content">
                  <span class="menu-item-label">{{ item.label }}</span>
                  <small class="menu-item-description">{{ item.description }}</small>
                </div>
              </a>
            }
            
            <mat-divider></mat-divider>
            <div class="menu-section-header">Component Management</div>
            
            <!-- Component Management -->
            @for (item of getComponentTools(); track item.path) {
              <a mat-menu-item 
                 [routerLink]="item.path"
                 routerLinkActive="active-menu-item">
                <mat-icon>{{ item.icon }}</mat-icon>
                <div class="menu-item-content">
                  <span class="menu-item-label">{{ item.label }}</span>
                  <small class="menu-item-description">{{ item.description }}</small>
                </div>
              </a>
            }
            
            <mat-divider></mat-divider>
            <div class="menu-section-header">History & Export</div>
            
            <!-- History & Export -->
            @for (item of getHistoryTools(); track item.path) {
              <a mat-menu-item 
                 [routerLink]="item.path"
                 routerLinkActive="active-menu-item">
                <mat-icon>{{ item.icon }}</mat-icon>
                <div class="menu-item-content">
                  <span class="menu-item-label">{{ item.label }}</span>
                  <small class="menu-item-description">{{ item.description }}</small>
                </div>
              </a>
            }
            
            <mat-divider></mat-divider>
            <div class="menu-section-header">Other</div>
            
            <a mat-menu-item routerLink="/library">
              <mat-icon>folder</mat-icon>
              <div class="menu-item-content">
                <span class="menu-item-label">Component Library</span>
                <small class="menu-item-description">Browse public components</small>
              </div>
            </a>
            <a mat-menu-item routerLink="/settings">
              <mat-icon>settings</mat-icon>
              <div class="menu-item-content">
                <span class="menu-item-label">Settings</span>
                <small class="menu-item-description">Account and preferences</small>
              </div>
            </a>
          </mat-menu>

          <!-- Quick Actions -->
          <button mat-raised-button 
                  color="primary"
                  routerLink="/dashboard/ai-copilot"
                  class="quick-generate">
            <mat-icon>psychology</mat-icon>
            AI Copilot
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .dashboard-nav {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--primary-color);
      font-weight: 600;
      font-size: 18px;
      transition: all 0.2s ease;
    }

    .brand-link:hover {
      color: var(--primary-color-dark);
      transform: translateX(2px);
    }

    .brand-text {
      font-weight: 700;
    }

    .nav-separator {
      color: rgba(0, 0, 0, 0.4);
      font-size: 20px;
    }

    .current-page {
      color: rgba(0, 0, 0, 0.7);
      font-weight: 600;
      font-size: 16px;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .nav-menu-trigger {
      display: flex;
      align-items: center;
      gap: 6px;
      color: rgba(0, 0, 0, 0.7);
    }

    .quick-generate {
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .quick-generate:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    /* Menu Styles */
    ::ng-deep .dashboard-nav-menu {
      max-width: 300px;
      margin-top: 8px;
    }

    ::ng-deep .dashboard-nav-menu .mat-mdc-menu-item {
      height: auto;
      padding: 12px 16px;
      line-height: 1.4;
    }

    .menu-item-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-left: 12px;
    }

    .menu-item-label {
      font-weight: 600;
      color: rgba(0, 0, 0, 0.87);
    }

    .menu-item-description {
      color: rgba(0, 0, 0, 0.6);
      font-size: 12px;
      line-height: 1.3;
    }

    ::ng-deep .active-menu-item {
      background: rgba(102, 126, 234, 0.1);
      color: var(--primary-color);
    }

    ::ng-deep .active-menu-item .menu-item-label {
      color: var(--primary-color);
      font-weight: 700;
    }

    .menu-section-header {
      padding: 8px 16px 4px 16px;
      font-size: 11px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(0, 0, 0, 0.03);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .nav-container {
        padding: 8px 16px;
      }

      .brand-text {
        display: none;
      }

      .nav-menu-trigger span {
        display: none;
      }

      .quick-generate span {
        display: none;
      }

      .current-page {
        font-size: 14px;
      }
    }

    @media (max-width: 480px) {
      .nav-brand {
        gap: 8px;
      }

      .nav-actions {
        gap: 8px;
      }

      .current-page {
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  `]
})
export class DashboardNavComponent {
  @Input() currentPage: string = '';

  public readonly navItems: DashboardNavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      description: 'Overview and recent activity'
    },
    // AI-Powered Tools
    {
      path: '/dashboard/ai-copilot',
      label: 'AI Copilot',
      icon: 'psychology',
      description: 'Your intelligent coding assistant'
    },
    {
      path: '/dashboard/generate',
      label: 'Generate Component',
      icon: 'auto_awesome',
      description: 'Create new components with AI'
    },
    {
      path: '/dashboard/scaffold',
      label: 'Scaffold Generator',
      icon: 'construction',
      description: 'Generate complete project structures'
    },
    {
      path: '/dashboard/playground',
      label: 'Component Playground',
      icon: 'code',
      description: 'Interactive development environment'
    },
    // Component Management
    {
      path: '/dashboard/components', 
      label: 'My Components',
      icon: 'widgets',
      description: 'Manage your components'
    },
    {
      path: '/dashboard/gallery',
      label: 'Component Gallery',
      icon: 'view_carousel',
      description: 'Discover and remix community components'
    },
    {
      path: '/dashboard/templates',
      label: 'Templates',
      icon: 'view_module',
      description: 'Browse pre-built templates'
    },
    // History & Export
    {
      path: '/dashboard/history',
      label: 'History',
      icon: 'history',
      description: 'View generation history'
    },
    {
      path: '/dashboard/export',
      label: 'Export',
      icon: 'download',
      description: 'Download your projects'
    }
  ];

  // Helper methods to group navigation items
  getAITools(): DashboardNavItem[] {
    return this.navItems.slice(1, 5); // AI Copilot, Generate, Scaffold, Playground
  }

  getComponentTools(): DashboardNavItem[] {
    return this.navItems.slice(5, 8); // My Components, Gallery, Templates
  }

  getHistoryTools(): DashboardNavItem[] {
    return this.navItems.slice(8, 10); // History, Export
  }
}