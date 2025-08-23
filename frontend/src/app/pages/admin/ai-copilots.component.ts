import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';

import { SeoService } from '@app/services/seo/seo.service';

interface AICopilotInfo {
  name: string;
  type: 'component' | 'service' | 'page';
  location: string;
  status: 'active' | 'inactive' | 'beta';
  features: string[];
  linesOfCode: number;
  lastUpdated: Date;
  usage: {
    dailyRequests: number;
    successRate: number;
    avgResponseTime: string;
  };
}

interface GuardInfo {
  name: string;
  type: 'CanActivateFn' | 'CanDeactivateFn' | 'CanLoadFn';
  location: string;
  status: 'active' | 'inactive';
  protectedRoutes: string[];
  lastTriggered: Date;
  successRate: number;
  description: string;
}

@Component({
  selector: 'app-admin-ai-copilots',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTabsModule,
    MatBadgeModule
  ],
  template: `
    <div class="admin-layout">
      <!-- Header -->
      <div class="admin-header">
        <div class="header-content">
          <div class="breadcrumb">
            <a routerLink="/admin" class="breadcrumb-link">
              <mat-icon>admin_panel_settings</mat-icon>
              Admin Dashboard
            </a>
            <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
            <span class="breadcrumb-current">AI System Overview</span>
          </div>
          <h1>
            <mat-icon>psychology</mat-icon>
            AI Copilots & Guards Management
          </h1>
          <p>Comprehensive overview of all AI components and security guards in the system</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="admin-content">
        <!-- Summary Cards -->
        <div class="summary-grid">
          <mat-card class="summary-card copilots-card">
            <mat-card-content>
              <div class="summary-header">
                <mat-icon>smart_toy</mat-icon>
                <span class="summary-label">AI Copilots</span>
              </div>
              <div class="summary-value">{{ aiCopilots.length }}</div>
              <div class="summary-details">
                <span class="active-count">{{ getActiveCount(aiCopilots) }} Active</span>
                <span class="beta-count">{{ getBetaCount(aiCopilots) }} Beta</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card guards-card">
            <mat-card-content>
              <div class="summary-header">
                <mat-icon>security</mat-icon>
                <span class="summary-label">Security Guards</span>
              </div>
              <div class="summary-value">{{ guards.length }}</div>
              <div class="summary-details">
                <span class="routes-protected">{{ getTotalProtectedRoutes() }} Routes Protected</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card performance-card">
            <mat-card-content>
              <div class="summary-header">
                <mat-icon>speed</mat-icon>
                <span class="summary-label">System Performance</span>
              </div>
              <div class="summary-value">{{ getAverageSuccessRate() }}%</div>
              <div class="summary-details">
                <span class="performance-status">Overall Success Rate</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card usage-card">
            <mat-card-content>
              <div class="summary-header">
                <mat-icon>analytics</mat-icon>
                <span class="summary-label">Daily Usage</span>
              </div>
              <div class="summary-value">{{ getTotalDailyRequests() }}</div>
              <div class="summary-details">
                <span class="usage-trend">AI Requests Today</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tabs for detailed views -->
        <mat-tab-group class="content-tabs">
          <!-- AI Copilots Tab -->
          <mat-tab label="AI Copilots">
            <div class="tab-content">
              <div class="section-header">
                <h2>AI Copilot Components</h2>
                <div class="section-actions">
                  <button mat-button color="primary">
                    <mat-icon>refresh</mat-icon>
                    Refresh Status
                  </button>
                  <button mat-raised-button color="primary">
                    <mat-icon>add</mat-icon>
                    Add New Copilot
                  </button>
                </div>
              </div>

              <div class="copilots-grid">
                <mat-card 
                  *ngFor="let copilot of aiCopilots" 
                  class="copilot-card"
                  [class]="'status-' + copilot.status">
                  <mat-card-header>
                    <div mat-card-avatar class="copilot-avatar">
                      <mat-icon>{{ getCopilotIcon(copilot.type) }}</mat-icon>
                    </div>
                    <mat-card-title>{{ copilot.name }}</mat-card-title>
                    <mat-card-subtitle>{{ copilot.type | titlecase }} • {{ copilot.linesOfCode }} LOC</mat-card-subtitle>
                    <div class="card-actions">
                      <mat-chip [class]="'status-chip-' + copilot.status">
                        {{ copilot.status | titlecase }}
                      </mat-chip>
                    </div>
                  </mat-card-header>
                  
                  <mat-card-content>
                    <div class="copilot-location">
                      <mat-icon>folder</mat-icon>
                      <code>{{ copilot.location }}</code>
                    </div>
                    
                    <div class="copilot-features">
                      <h4>Features:</h4>
                      <div class="features-list">
                        <mat-chip 
                          *ngFor="let feature of copilot.features.slice(0, 3)" 
                          class="feature-chip">
                          {{ feature }}
                        </mat-chip>
                        <span *ngIf="copilot.features.length > 3" class="more-features">
                          +{{ copilot.features.length - 3 }} more
                        </span>
                      </div>
                    </div>

                    <div class="copilot-metrics">
                      <div class="metric">
                        <span class="metric-label">Daily Requests:</span>
                        <span class="metric-value">{{ copilot.usage.dailyRequests }}</span>
                      </div>
                      <div class="metric">
                        <span class="metric-label">Success Rate:</span>
                        <span class="metric-value success-rate">{{ copilot.usage.successRate }}%</span>
                      </div>
                      <div class="metric">
                        <span class="metric-label">Avg Response:</span>
                        <span class="metric-value">{{ copilot.usage.avgResponseTime }}</span>
                      </div>
                    </div>
                  </mat-card-content>

                  <mat-card-actions>
                    <button mat-button color="primary">
                      <mat-icon>visibility</mat-icon>
                      View Details
                    </button>
                    <button mat-button>
                      <mat-icon>edit</mat-icon>
                      Configure
                    </button>
                    <button mat-icon-button [matMenuTriggerFor]="copilotMenu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #copilotMenu="matMenu">
                      <button mat-menu-item>
                        <mat-icon>code</mat-icon>
                        View Source
                      </button>
                      <button mat-menu-item>
                        <mat-icon>bug_report</mat-icon>
                        Debug Mode
                      </button>
                      <button mat-menu-item>
                        <mat-icon>analytics</mat-icon>
                        View Analytics
                      </button>
                      <button mat-menu-item class="danger-action">
                        <mat-icon>power_settings_new</mat-icon>
                        Disable
                      </button>
                    </mat-menu>
                  </mat-card-actions>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Guards Tab -->
          <mat-tab label="Security Guards">
            <div class="tab-content">
              <div class="section-header">
                <h2>Security Guards</h2>
                <div class="section-actions">
                  <button mat-button color="primary">
                    <mat-icon>shield</mat-icon>
                    Test All Guards
                  </button>
                  <button mat-raised-button color="primary">
                    <mat-icon>add_moderator</mat-icon>
                    Create Guard
                  </button>
                </div>
              </div>

              <div class="guards-list">
                <mat-card *ngFor="let guard of guards" class="guard-card">
                  <mat-card-header>
                    <div mat-card-avatar class="guard-avatar">
                      <mat-icon>security</mat-icon>
                    </div>
                    <mat-card-title>{{ guard.name }}</mat-card-title>
                    <mat-card-subtitle>{{ guard.type }} • {{ guard.protectedRoutes.length }} routes protected</mat-card-subtitle>
                    <div class="card-actions">
                      <mat-chip [class]="'status-chip-' + guard.status">
                        {{ guard.status | titlecase }}
                      </mat-chip>
                      <mat-chip class="success-rate-chip">
                        {{ guard.successRate }}% Success
                      </mat-chip>
                    </div>
                  </mat-card-header>
                  
                  <mat-card-content>
                    <div class="guard-description">
                      <p>{{ guard.description }}</p>
                    </div>
                    
                    <div class="guard-location">
                      <mat-icon>folder</mat-icon>
                      <code>{{ guard.location }}</code>
                    </div>

                    <div class="protected-routes">
                      <h4>Protected Routes:</h4>
                      <div class="routes-list">
                        <mat-chip 
                          *ngFor="let route of guard.protectedRoutes.slice(0, 4)" 
                          class="route-chip">
                          {{ route }}
                        </mat-chip>
                        <span *ngIf="guard.protectedRoutes.length > 4" class="more-routes">
                          +{{ guard.protectedRoutes.length - 4 }} more routes
                        </span>
                      </div>
                    </div>

                    <div class="guard-metrics">
                      <div class="metric">
                        <span class="metric-label">Last Triggered:</span>
                        <span class="metric-value">{{ guard.lastTriggered | date:'short' }}</span>
                      </div>
                      <div class="metric">
                        <span class="metric-label">Success Rate:</span>
                        <mat-progress-bar 
                          mode="determinate" 
                          [value]="guard.successRate"
                          [color]="guard.successRate > 95 ? 'primary' : guard.successRate > 80 ? 'accent' : 'warn'">
                        </mat-progress-bar>
                      </div>
                    </div>
                  </mat-card-content>

                  <mat-card-actions>
                    <button mat-button color="primary">
                      <mat-icon>play_arrow</mat-icon>
                      Test Guard
                    </button>
                    <button mat-button>
                      <mat-icon>timeline</mat-icon>
                      View Logs
                    </button>
                    <button mat-icon-button [matMenuTriggerFor]="guardMenu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #guardMenu="matMenu">
                      <button mat-menu-item>
                        <mat-icon>code</mat-icon>
                        View Source
                      </button>
                      <button mat-menu-item>
                        <mat-icon>settings</mat-icon>
                        Configure
                      </button>
                      <button mat-menu-item>
                        <mat-icon>history</mat-icon>
                        Access History
                      </button>
                      <button mat-menu-item class="danger-action">
                        <mat-icon>block</mat-icon>
                        Disable Guard
                      </button>
                    </mat-menu>
                  </mat-card-actions>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- System Health Tab -->
          <mat-tab label="System Health">
            <div class="tab-content">
              <div class="health-overview">
                <mat-card class="health-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>health_and_safety</mat-icon>
                      AI System Health
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="health-metrics">
                      <div class="health-metric">
                        <span class="health-label">Overall System Health</span>
                        <div class="health-indicator">
                          <mat-progress-bar mode="determinate" value="98" color="primary"></mat-progress-bar>
                          <span class="health-percentage">98%</span>
                        </div>
                      </div>
                      
                      <div class="health-metric">
                        <span class="health-label">AI Response Time</span>
                        <div class="health-indicator">
                          <span class="response-time">2.3s avg</span>
                          <mat-chip class="performance-good">Good</mat-chip>
                        </div>
                      </div>
                      
                      <div class="health-metric">
                        <span class="health-label">Guard Success Rate</span>
                        <div class="health-indicator">
                          <mat-progress-bar mode="determinate" value="99.2" color="primary"></mat-progress-bar>
                          <span class="health-percentage">99.2%</span>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      padding: 2rem;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .admin-header {
      margin-bottom: 2rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #666;
    }

    .breadcrumb-link {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      text-decoration: none;
      color: #667eea;
      transition: color 0.2s ease;
    }

    .breadcrumb-link:hover {
      color: #5a67d8;
    }

    .breadcrumb-separator {
      font-size: 1rem;
    }

    .breadcrumb-current {
      font-weight: 500;
    }

    .admin-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 0 0 0.5rem 0;
    }

    .admin-header p {
      font-size: 1.1rem;
      color: #666;
      margin: 0;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      transition: transform 0.2s ease;
    }

    .summary-card:hover {
      transform: translateY(-2px);
    }

    .summary-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .summary-header mat-icon {
      font-size: 1.5rem;
      color: #667eea;
    }

    .summary-label {
      font-weight: 500;
      color: #666;
    }

    .summary-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .summary-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.9rem;
      color: #666;
    }

    .content-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .tab-content {
      padding: 2rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .section-header h2 {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .section-actions {
      display: flex;
      gap: 1rem;
    }

    .copilots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .copilot-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .copilot-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .copilot-card.status-active {
      border-left: 4px solid #4caf50;
    }

    .copilot-card.status-beta {
      border-left: 4px solid #ff9800;
    }

    .copilot-card.status-inactive {
      border-left: 4px solid #f44336;
    }

    .copilot-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .card-actions {
      margin-left: auto;
    }

    .status-chip-active { background: #e8f5e8; color: #388e3c; }
    .status-chip-beta { background: #fff3e0; color: #f57c00; }
    .status-chip-inactive { background: #ffebee; color: #d32f2f; }

    .copilot-location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #666;
    }

    .copilot-location code {
      background: #f5f5f5;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .copilot-features h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      color: #333;
      font-weight: 600;
    }

    .features-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .feature-chip {
      font-size: 0.75rem;
      min-height: 24px;
      background: #e3f2fd;
      color: #1976d2;
    }

    .more-features {
      font-size: 0.8rem;
      color: #666;
      font-style: italic;
    }

    .copilot-metrics {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-label {
      font-size: 0.8rem;
      color: #666;
    }

    .metric-value {
      font-weight: 600;
      color: #333;
    }

    .success-rate {
      color: #4caf50;
    }

    .guards-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .guard-card {
      transition: transform 0.2s ease;
    }

    .guard-card:hover {
      transform: translateY(-1px);
    }

    .guard-avatar {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .guard-description {
      margin-bottom: 1rem;
    }

    .guard-description p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }

    .guard-location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #666;
    }

    .guard-location code {
      background: #f5f5f5;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .protected-routes h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      color: #333;
      font-weight: 600;
    }

    .routes-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .route-chip {
      font-size: 0.75rem;
      min-height: 24px;
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .more-routes {
      font-size: 0.8rem;
      color: #666;
      font-style: italic;
    }

    .guard-metrics {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .success-rate-chip {
      background: #e8f5e8;
      color: #388e3c;
    }

    .health-overview {
      max-width: 800px;
    }

    .health-card {
      margin-bottom: 2rem;
    }

    .health-metrics {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .health-metric {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .health-label {
      font-weight: 500;
      color: #333;
    }

    .health-indicator {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .health-indicator mat-progress-bar {
      flex: 1;
      height: 8px;
    }

    .health-percentage {
      font-weight: 600;
      color: #4caf50;
      min-width: 50px;
    }

    .response-time {
      font-weight: 600;
      color: #333;
    }

    .performance-good {
      background: #e8f5e8;
      color: #388e3c;
    }

    .danger-action {
      color: #d32f2f !important;
    }

    @media (max-width: 768px) {
      .admin-layout {
        padding: 1rem;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .copilots-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .tab-content {
        padding: 1rem;
      }
    }
  `]
})
export class AICopilotAdminComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  // AI Copilots data
  public readonly aiCopilots: AICopilotInfo[] = [
    {
      name: 'AI Copilot Panel',
      type: 'component',
      location: 'frontend/src/app/components/ai/ai-copilot-panel/',
      status: 'active',
      features: ['Real-time suggestions', 'Quick actions', 'History management', 'Professional loader', 'Responsive design'],
      linesOfCode: 806,
      lastUpdated: new Date('2024-01-15'),
      usage: {
        dailyRequests: 1247,
        successRate: 98.5,
        avgResponseTime: '2.1s'
      }
    },
    {
      name: 'AI Copilot Chat Page',
      type: 'page',
      location: 'frontend/src/app/pages/dashboard/ai-copilot.component.ts',
      status: 'active',
      features: ['Chat interface', 'Code editor', 'Multi-language support', 'Live preview', 'Session management'],
      linesOfCode: 579,
      lastUpdated: new Date('2024-01-12'),
      usage: {
        dailyRequests: 892,
        successRate: 96.8,
        avgResponseTime: '2.8s'
      }
    },
    {
      name: 'AI Copilot Service',
      type: 'service',
      location: 'frontend/src/app/services/ai/ai-copilot.service.ts',
      status: 'active',
      features: ['Session management', 'Real-time messaging', 'Suggestion management', 'Code tracking', 'Testing integration'],
      linesOfCode: 308,
      lastUpdated: new Date('2024-01-10'),
      usage: {
        dailyRequests: 2156,
        successRate: 99.2,
        avgResponseTime: '1.8s'
      }
    },
    {
      name: 'AI Prompt Core Service',
      type: 'service',
      location: 'frontend/src/app/services/ai/ai-prompt-core.service.ts',
      status: 'active',
      features: ['Multi-type prompts', 'Model management', 'History persistence', 'Context awareness', 'Analytics integration'],
      linesOfCode: 312,
      lastUpdated: new Date('2024-01-08'),
      usage: {
        dailyRequests: 1876,
        successRate: 97.9,
        avgResponseTime: '2.3s'
      }
    },
    {
      name: 'AI Code Generator Service',
      type: 'service',
      location: 'frontend/src/app/services/ai/ai-code-generator.service.ts',
      status: 'active',
      features: ['Multi-framework support', 'Component types', 'Styling options', 'Dependency management', 'File generation'],
      linesOfCode: 159,
      lastUpdated: new Date('2024-01-05'),
      usage: {
        dailyRequests: 734,
        successRate: 95.4,
        avgResponseTime: '3.2s'
      }
    },
    {
      name: 'AI Transform Service',
      type: 'service',
      location: 'frontend/src/app/services/ai/ai-transform.service.ts',
      status: 'beta',
      features: ['Framework conversion', 'Code optimization', 'Performance improvements', 'Accessibility enhancements'],
      linesOfCode: 245,
      lastUpdated: new Date('2024-01-03'),
      usage: {
        dailyRequests: 156,
        successRate: 89.7,
        avgResponseTime: '4.1s'
      }
    },
    {
      name: 'AI Copilot State Service',
      type: 'service',
      location: 'frontend/src/app/services/ai/ai-copilot-state.service.ts',
      status: 'active',
      features: ['State management', 'Progress monitoring', 'Chat management', 'Context awareness', 'Reactive state'],
      linesOfCode: 369,
      lastUpdated: new Date('2024-01-02'),
      usage: {
        dailyRequests: 3421,
        successRate: 99.8,
        avgResponseTime: '0.3s'
      }
    },
    {
      name: 'AI Diff Service',
      type: 'service',
      location: 'frontend/src/app/services/ai/ai-diff.service.ts',
      status: 'beta',
      features: ['Smart diff generation', 'Change impact analysis', 'Merge conflict resolution'],
      linesOfCode: 187,
      lastUpdated: new Date('2023-12-28'),
      usage: {
        dailyRequests: 89,
        successRate: 92.1,
        avgResponseTime: '2.9s'
      }
    }
  ];

  // Guards data
  public readonly guards: GuardInfo[] = [
    {
      name: 'AuthGuard',
      type: 'CanActivateFn',
      location: 'frontend/src/app/guards/auth.guard.ts',
      status: 'active',
      protectedRoutes: ['/dashboard', '/dashboard/generate', '/dashboard/templates', '/dashboard/history', '/dashboard/export', '/dashboard/components', '/dashboard/ai-copilot', '/dashboard/scaffold', '/dashboard/playground', '/dashboard/editor', '/dashboard/gallery', '/library', '/settings', '/billing'],
      lastTriggered: new Date('2024-01-15T10:30:00'),
      successRate: 99.2,
      description: 'Protects routes requiring authentication. Uses multi-token checking with emergency mode support and async token validation with fallbacks.'
    },
    {
      name: 'AdminGuard',
      type: 'CanActivateFn',
      location: 'frontend/src/app/guards/admin.guard.ts',
      status: 'active',
      protectedRoutes: ['/admin'],
      lastTriggered: new Date('2024-01-15T09:15:00'),
      successRate: 100,
      description: 'Protects admin-only routes and features. Implements role-based access control for admin/moderator roles with emergency admin mode bypass.'
    }
  ];

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'AI Copilots & Guards - Admin - Frontuna.com',
      description: 'Administrative overview of AI copilot components and security guards in the Frontuna system.',
      url: 'https://frontuna.com/admin/ai-copilots',
      robots: 'noindex, nofollow'
    });
  }

  getCopilotIcon(type: string): string {
    switch (type) {
      case 'component': return 'widgets';
      case 'service': return 'settings';
      case 'page': return 'web';
      default: return 'smart_toy';
    }
  }

  getActiveCount(copilots: AICopilotInfo[]): number {
    return copilots.filter(c => c.status === 'active').length;
  }

  getBetaCount(copilots: AICopilotInfo[]): number {
    return copilots.filter(c => c.status === 'beta').length;
  }

  getTotalProtectedRoutes(): number {
    return this.guards.reduce((total, guard) => total + guard.protectedRoutes.length, 0);
  }

  getAverageSuccessRate(): number {
    const totalSuccessRate = [...this.aiCopilots, ...this.guards].reduce((sum, item) => {
      return sum + ('usage' in item ? item.usage.successRate : item.successRate);
    }, 0);
    return Math.round(totalSuccessRate / (this.aiCopilots.length + this.guards.length));
  }

  getTotalDailyRequests(): number {
    return this.aiCopilots.reduce((total, copilot) => total + copilot.usage.dailyRequests, 0);
  }
}
