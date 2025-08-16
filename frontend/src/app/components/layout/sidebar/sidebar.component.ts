import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';

import { AuthService } from '@app/services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule
  ],
  template: `
    <div class="sidebar" [class.collapsed]="isCollapsed()">
      <!-- Toggle Button -->
      <button mat-icon-button 
              class="sidebar-toggle"
              (click)="toggleSidebar()">
        <mat-icon>{{ isCollapsed() ? 'menu' : 'menu_open' }}</mat-icon>
      </button>

      <!-- Navigation List -->
      <mat-nav-list class="sidebar-nav">
        <!-- Main Navigation -->
        <a mat-list-item 
           routerLink="/dashboard"
           routerLinkActive="active"
           class="nav-item">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle>Dashboard</span>
        </a>

        <a mat-list-item 
           routerLink="/dashboard/generate"
           routerLinkActive="active"
           class="nav-item">
          <mat-icon matListItemIcon>auto_awesome</mat-icon>
          <span matListItemTitle>Generate</span>
          <span matListItemLine>Create new components</span>
        </a>

        <a mat-list-item 
           routerLink="/library"
           routerLinkActive="active"
           class="nav-item">
          <mat-icon matListItemIcon>folder</mat-icon>
          <span matListItemTitle>Library</span>
          <span matListItemLine>{{ componentCount() }} components</span>
        </a>

        <a mat-list-item 
           routerLink="/dashboard/history"
           routerLinkActive="active"
           class="nav-item">
          <mat-icon matListItemIcon>history</mat-icon>
          <span matListItemTitle>History</span>
          <span matListItemLine>Generation history</span>
        </a>

        <mat-divider></mat-divider>

        <!-- Quick Actions -->
        <h3 matSubheader>Quick Actions</h3>

        <a mat-list-item 
           routerLink="/dashboard/templates"
           routerLinkActive="active"
           class="nav-item">
          <mat-icon matListItemIcon>template_library</mat-icon>
          <span matListItemTitle>Templates</span>
          <span matListItemLine>Pre-built components</span>
        </a>

        <a mat-list-item 
           routerLink="/dashboard/export"
           routerLinkActive="active"
           class="nav-item">
          <mat-icon matListItemIcon>download</mat-icon>
          <span matListItemTitle>Export</span>
          <span matListItemLine>Download components</span>
        </a>

        <a mat-list-item 
           routerLink="/dashboard/import"
           routerLinkActive="active"
           class="nav-item">
          <mat-icon matListItemIcon>upload</mat-icon>
          <span matListItemTitle>Import</span>
          <span matListItemLine>Upload existing code</span>
        </a>

        <mat-divider></mat-divider>

        <!-- Settings & Account -->
        <h3 matSubheader>Account</h3>

        <a mat-list-item 
           routerLink="/profile"
           routerLinkActive="active"
           class="nav-item">
          <mat-icon matListItemIcon>person</mat-icon>
          <span matListItemTitle>Profile</span>
          <span matListItemLine>Account settings</span>
        </a>

        <a mat-list-item 
           routerLink="/billing"
           routerLinkActive="active"
           class="nav-item">
          <mat-icon matListItemIcon>payment</mat-icon>
          <span matListItemTitle>Billing</span>
          <span matListItemLine>{{ currentPlan() }} plan</span>
          @if (usagePercentage() > 80) {
            <mat-icon matListItemMeta 
                      [matBadge]="usagePercentage() + '%'"
                      matBadgeColor="warn"
                      matBadgeSize="small">
              warning
            </mat-icon>
          }
        </a>

        <a mat-list-item 
           routerLink="/preferences"
           routerLinkActive="active"
           class="nav-item">
          <mat-icon matListItemIcon>settings</mat-icon>
          <span matListItemTitle>Preferences</span>
          <span matListItemLine>App settings</span>
        </a>

        @if (isAdmin()) {
          <mat-divider></mat-divider>
          
          <!-- Admin Section -->
          <h3 matSubheader>Administration</h3>

          <a mat-list-item 
             routerLink="/admin"
             routerLinkActive="active"
             class="nav-item">
            <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
            <span matListItemTitle>Admin Panel</span>
            <span matListItemLine>System management</span>
          </a>

          <a mat-list-item 
             routerLink="/admin/analytics"
             routerLinkActive="active"
             class="nav-item">
            <mat-icon matListItemIcon>analytics</mat-icon>
            <span matListItemTitle>Analytics</span>
            <span matListItemLine>Usage statistics</span>
          </a>

          <a mat-list-item 
             routerLink="/admin/users"
             routerLinkActive="active"
             class="nav-item">
            <mat-icon matListItemIcon>group</mat-icon>
            <span matListItemTitle>Users</span>
            <span matListItemLine>User management</span>
          </a>
        }

        <mat-divider></mat-divider>

        <!-- Help & Support -->
        <h3 matSubheader>Support</h3>

        <a mat-list-item 
           href="https://docs.frontuna.ai"
           target="_blank"
           class="nav-item">
          <mat-icon matListItemIcon>help</mat-icon>
          <span matListItemTitle>Documentation</span>
          <span matListItemLine>Get help</span>
        </a>

        <a mat-list-item 
           href="https://community.frontuna.ai"
           target="_blank"
           class="nav-item">
          <mat-icon matListItemIcon>forum</mat-icon>
          <span matListItemTitle>Community</span>
          <span matListItemLine>Join discussions</span>
        </a>

        <a mat-list-item 
           routerLink="/feedback"
           routerLinkActive="active"
           class="nav-item">
          <mat-icon matListItemIcon>feedback</mat-icon>
          <span matListItemTitle>Feedback</span>
          <span matListItemLine>Share ideas</span>
        </a>
      </mat-nav-list>

      <!-- User Info (when collapsed) -->
      @if (isCollapsed()) {
        <div class="sidebar-user-compact">
          <img [src]="currentUser()?.avatar || 'assets/images/default-avatar.png'" 
               [alt]="currentUser()?.firstName"
               class="user-avatar-small" />
        </div>
      }
    </div>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100vh;
      background: white;
      border-right: 1px solid #e0e0e0;
      position: fixed;
      left: 0;
      top: 70px;
      z-index: 999;
      transition: width 0.3s ease;
      overflow-x: hidden;
      overflow-y: auto;
    }

    .sidebar.collapsed {
      width: 64px;
    }

    .sidebar-toggle {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
    }

    .sidebar-nav {
      padding: 3rem 0 1rem;
    }

    .nav-item {
      margin: 0.25rem 0.5rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }

    .nav-item:hover {
      background-color: #f5f5f5;
    }

    .nav-item.active {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .nav-item.active mat-icon {
      color: #1976d2;
    }

    .collapsed .nav-item span {
      opacity: 0;
    }

    .collapsed mat-subheader {
      opacity: 0;
    }

    .sidebar-user-compact {
      position: absolute;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
    }

    .user-avatar-small {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    /* Hide text when collapsed */
    .collapsed [matListItemTitle],
    .collapsed [matListItemLine],
    .collapsed [matListItemMeta] {
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    /* Responsive behavior */
    @media (max-width: 991px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .sidebar.collapsed {
        width: 280px;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        top: 60px;
        width: 100%;
        max-width: 280px;
      }
    }

    /* Custom scrollbar */
    .sidebar::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 2px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
      background: #999;
    }
  `]
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  // State
  private readonly isCollapsedSignal = computed(() => false); // Implement state management

  // Computed properties
  public readonly currentUser = this.authService.currentUser;
  public readonly isAdmin = computed(() => this.authService.isAdmin());
  public readonly isCollapsed = this.isCollapsedSignal;
  
  // Mock data - replace with actual services
  public readonly componentCount = computed(() => 25);
  public readonly currentPlan = computed(() => this.currentUser()?.subscription.plan || 'Free');
  public readonly usagePercentage = computed(() => {
    const user = this.currentUser();
    if (!user) return 0;
    return Math.round((user.usage.generationsUsed / user.usage.generationsLimit) * 100);
  });

  toggleSidebar(): void {
    // TODO: Implement sidebar toggle
  }
}