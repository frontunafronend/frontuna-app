import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { interval, Subscription, firstValueFrom } from 'rxjs';

import { SecureAuthService } from '@app/services/auth/secure-auth.service';
import { EnvironmentService } from '@app/services/core/environment.service';

interface AdminMetrics {
  totalUsers: number;
  userGrowth: number;
  totalGenerations: number;
  generationGrowth: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  systemHealth: number;
}

interface SystemMetrics {
  database: {
    status: string;
    connections: number;
    maxConnections: number;
    storageUsed: number;
    storageTotal: number;
    responseTime: number;
  };
  api: {
    status: string;
    requestsToday: number;
    successRate: number;
    avgResponseTime: number;
  };
  server: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
  logs: {
    errors: number;
    warnings: number;
    info: number;
  };
}

interface ChartDataResponse {
  userRegistrations: { labels: string[]; data: number[] };
  componentGenerations: { labels: string[]; data: number[] };
  frameworkDistribution: { labels: string[]; data: number[] };
  subscriptionPlans: { labels: string[]; data: number[] };
}

@Component({
  selector: 'app-admin-dashboard-dynamic',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatProgressBarModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NgChartsModule
  ],
  template: `
    <div class="admin-layout">
      <div class="admin-header">
        <h1>
          <mat-icon>admin_panel_settings</mat-icon>
          Admin Dashboard
          <span class="live-indicator" [class.active]="isLiveDataActive()">
            <mat-icon>fiber_manual_record</mat-icon>
            LIVE
          </span>
        </h1>
        <p>Real-time system monitoring and management</p>
        <div class="refresh-controls">
          <button mat-raised-button color="primary" (click)="refreshAllData()" [disabled]="isLoading()">
            <mat-icon>refresh</mat-icon>
            Refresh Data
          </button>
          <button mat-button (click)="toggleAutoRefresh()" [color]="autoRefreshEnabled() ? 'accent' : 'basic'">
            <mat-icon>{{ autoRefreshEnabled() ? 'pause' : 'play_arrow' }}</mat-icon>
            Auto Refresh: {{ autoRefreshEnabled() ? 'ON' : 'OFF' }}
          </button>
        </div>
      </div>

      <div class="admin-content">
        <!-- Loading Overlay -->
        <div class="loading-overlay" *ngIf="isLoading()">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading live data...</p>
        </div>

        <!-- Key Metrics -->
        <div class="metrics-section">
          <div class="metrics-grid">
            <mat-card class="metric-card users-metric" [class.loading]="isLoadingMetrics()">
              <mat-card-content>
                <div class="metric-header">
                  <mat-icon>people</mat-icon>
                  <span class="metric-label">Total Users</span>
                </div>
                <div class="metric-value">{{ metrics().totalUsers | number }}</div>
                <div class="metric-change" [class.positive]="metrics().userGrowth > 0" [class.negative]="metrics().userGrowth < 0">
                  <mat-icon>{{ metrics().userGrowth > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                  <span>{{ metrics().userGrowth > 0 ? '+' : '' }}{{ metrics().userGrowth }}% this month</span>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="metric-card generations-metric" [class.loading]="isLoadingMetrics()">
              <mat-card-content>
                <div class="metric-header">
                  <mat-icon>auto_awesome</mat-icon>
                  <span class="metric-label">Components Generated</span>
                </div>
                <div class="metric-value">{{ metrics().totalGenerations | number }}</div>
                <div class="metric-change" [class.positive]="metrics().generationGrowth > 0" [class.negative]="metrics().generationGrowth < 0">
                  <mat-icon>{{ metrics().generationGrowth > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                  <span>{{ metrics().generationGrowth > 0 ? '+' : '' }}{{ metrics().generationGrowth }}% this week</span>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="metric-card revenue-metric" [class.loading]="isLoadingMetrics()">
              <mat-card-content>
                <div class="metric-header">
                  <mat-icon>monetization_on</mat-icon>
                  <span class="metric-label">Monthly Revenue</span>
                </div>
                <div class="metric-value">\${{ metrics().monthlyRevenue | number }}</div>
                <div class="metric-change" [class.positive]="metrics().revenueGrowth > 0" [class.negative]="metrics().revenueGrowth < 0">
                  <mat-icon>{{ metrics().revenueGrowth > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                  <span>{{ metrics().revenueGrowth > 0 ? '+' : '' }}{{ metrics().revenueGrowth }}% vs last month</span>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="metric-card health-metric" [class.loading]="isLoadingMetrics()">
              <mat-card-content>
                <div class="metric-header">
                  <mat-icon>health_and_safety</mat-icon>
                  <span class="metric-label">System Health</span>
                </div>
                <div class="metric-value health-value">
                  <span class="health-status" [class.healthy]="metrics().systemHealth > 95" [class.warning]="metrics().systemHealth <= 95 && metrics().systemHealth > 80" [class.critical]="metrics().systemHealth <= 80">
                    {{ metrics().systemHealth }}%
                  </span>
                </div>
                <div class="metric-change">
                  <mat-icon>{{ metrics().systemHealth > 95 ? 'check_circle' : 'warning' }}</mat-icon>
                  <span>{{ metrics().systemHealth > 95 ? 'All systems operational' : 'Monitoring required' }}</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Main Content Tabs -->
        <div class="admin-tabs">
          <!-- Tab Navigation -->
          <div class="tab-navigation">
            <button class="tab-button" 
                    [class.active]="activeTab() === 'analytics'"
                    (click)="setActiveTab('analytics')">
              <mat-icon>analytics</mat-icon>
              Analytics
            </button>
            <button class="tab-button" 
                    [class.active]="activeTab() === 'users'"
                    (click)="setActiveTab('users')">
              <mat-icon>people</mat-icon>
              Users
            </button>
            <button class="tab-button" 
                    [class.active]="activeTab() === 'system'"
                    (click)="setActiveTab('system')">
              <mat-icon>computer</mat-icon>
              System
            </button>
            <button class="tab-button" 
                    [class.active]="activeTab() === 'ai'"
                    (click)="setActiveTab('ai')">
              <mat-icon>psychology</mat-icon>
              AI System
            </button>
          </div>

          <!-- Analytics Tab -->
          <div class="tab-content" *ngIf="activeTab() === 'analytics'">
            <div class="charts-section" [class.loading]="isLoadingCharts()">
              <div class="charts-grid">
                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>User Registrations</mat-card-title>
                    <mat-card-subtitle>Last 4 weeks</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                            [data]="userRegistrationData()"
                            [options]="chartOptions"
                            type="line">
                    </canvas>
                  </mat-card-content>
                </mat-card>

                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Component Generations</mat-card-title>
                    <mat-card-subtitle>Daily breakdown</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                            [data]="generationData()"
                            [options]="chartOptions"
                            type="bar">
                    </canvas>
                  </mat-card-content>
                </mat-card>

                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Framework Usage</mat-card-title>
                    <mat-card-subtitle>Distribution</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                            [data]="frameworkData()"
                            [options]="pieChartOptions"
                            type="doughnut">
                    </canvas>
                  </mat-card-content>
                </mat-card>

                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Subscription Plans</mat-card-title>
                    <mat-card-subtitle>User distribution</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                            [data]="subscriptionData()"
                            [options]="pieChartOptions"
                            type="pie">
                    </canvas>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </div>

          <!-- Users Tab -->
          <div class="tab-content" *ngIf="activeTab() === 'users'">
            <div class="users-section">
              <div class="users-header">
                <h2>User Management</h2>
                
                <!-- Data Source Indicator -->
                <div class="real-data-indicator">
                  🌟 Live data from Neon Database ({{ liveUsers().length }} users)
                  <span class="last-updated">Last updated: {{ lastUpdated() | date:'short' }}</span>
                </div>
                
                <div class="users-actions">
                  <button mat-button color="primary" (click)="exportUsers()">
                    <mat-icon>download</mat-icon>
                    Export Users
                  </button>
                  <button mat-raised-button color="primary" (click)="addNewUser()">
                    <mat-icon>person_add</mat-icon>
                    Add User
                  </button>
                </div>
              </div>

              <mat-card class="users-table-card" [class.loading]="isLoadingUsers()">
                <mat-card-content>
                  <table mat-table [dataSource]="liveUsers()" class="users-table">
                    <ng-container matColumnDef="avatar">
                      <th mat-header-cell *matHeaderCellDef>Avatar</th>
                      <td mat-cell *matCellDef="let user">
                        <img [src]="user.avatar || 'assets/images/default-avatar.png'" 
                             [alt]="user.name"
                             class="user-avatar">
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Name</th>
                      <td mat-cell *matCellDef="let user">
                        <div class="user-info">
                          <strong>{{ user.name }}</strong>
                          <small>{{ user.email }}</small>
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="plan">
                      <th mat-header-cell *matHeaderCellDef>Plan</th>
                      <td mat-cell *matCellDef="let user">
                        <mat-chip [class]="'plan-' + user.plan">
                          {{ user.plan | titlecase }}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="usage">
                      <th mat-header-cell *matHeaderCellDef>Usage</th>
                      <td mat-cell *matCellDef="let user">
                        <div class="usage-info">
                          <span>{{ user.generationsUsed }}/{{ user.generationsLimit }}</span>
                          <mat-progress-bar 
                            mode="determinate" 
                            [value]="(user.generationsUsed / user.generationsLimit) * 100">
                          </mat-progress-bar>
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let user">
                        <mat-chip [class]="'status-' + user.status">
                          {{ user.status | titlecase }}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="joined">
                      <th mat-header-cell *matHeaderCellDef>Joined</th>
                      <td mat-cell *matCellDef="let user">
                        {{ user.joinedAt | date:'short' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let user">
                        <button mat-icon-button [matMenuTriggerFor]="userMenu">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #userMenu="matMenu">
                          <button mat-menu-item (click)="editUser(user)">
                            <mat-icon>edit</mat-icon>
                            Edit User
                          </button>
                          <button mat-menu-item (click)="suspendUser(user)">
                            <mat-icon>block</mat-icon>
                            Suspend User
                          </button>
                          <button mat-menu-item (click)="deleteUser(user)" class="delete-action">
                            <mat-icon>delete</mat-icon>
                            Delete User
                          </button>
                        </mat-menu>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: userColumns;"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <!-- System Tab -->
          <div class="tab-content" *ngIf="activeTab() === 'system'">
            <div class="system-section" [class.loading]="isLoadingSystem()">
              <div class="system-grid">
                <mat-card class="system-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>storage</mat-icon>
                      Database
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="system-status">
                      <div class="status-indicator" [class]="systemMetrics().database.status"></div>
                      <span>{{ systemMetrics().database.status | titlecase }}</span>
                    </div>
                    <div class="system-metrics">
                      <div class="metric">
                        <span>Connections:</span>
                        <strong>{{ systemMetrics().database.connections }}/{{ systemMetrics().database.maxConnections }}</strong>
                      </div>
                      <div class="metric">
                        <span>Storage:</span>
                        <strong>{{ systemMetrics().database.storageUsed }} GB / {{ systemMetrics().database.storageTotal }} GB</strong>
                      </div>
                      <div class="metric">
                        <span>Response Time:</span>
                        <strong>{{ systemMetrics().database.responseTime }}ms</strong>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="system-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>cloud</mat-icon>
                      API Service
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="system-status">
                      <div class="status-indicator" [class]="systemMetrics().api.status"></div>
                      <span>{{ systemMetrics().api.status | titlecase }}</span>
                    </div>
                    <div class="system-metrics">
                      <div class="metric">
                        <span>Requests Today:</span>
                        <strong>{{ systemMetrics().api.requestsToday | number }}</strong>
                      </div>
                      <div class="metric">
                        <span>Success Rate:</span>
                        <strong>{{ systemMetrics().api.successRate }}%</strong>
                      </div>
                      <div class="metric">
                        <span>Avg Response:</span>
                        <strong>{{ systemMetrics().api.avgResponseTime }}ms</strong>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="system-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>memory</mat-icon>
                      Server Resources
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="resource-metrics">
                      <div class="resource-item">
                        <span>CPU Usage</span>
                        <mat-progress-bar mode="determinate" [value]="systemMetrics().server.cpuUsage" [color]="getResourceColor(systemMetrics().server.cpuUsage)"></mat-progress-bar>
                        <span>{{ systemMetrics().server.cpuUsage }}%</span>
                      </div>
                      <div class="resource-item">
                        <span>Memory</span>
                        <mat-progress-bar mode="determinate" [value]="systemMetrics().server.memoryUsage" [color]="getResourceColor(systemMetrics().server.memoryUsage)"></mat-progress-bar>
                        <span>{{ systemMetrics().server.memoryUsage }}%</span>
                      </div>
                      <div class="resource-item">
                        <span>Disk Usage</span>
                        <mat-progress-bar mode="determinate" [value]="systemMetrics().server.diskUsage" [color]="getResourceColor(systemMetrics().server.diskUsage)"></mat-progress-bar>
                        <span>{{ systemMetrics().server.diskUsage }}%</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="system-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>bug_report</mat-icon>
                      System Logs
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="log-summary">
                      <div class="log-level">
                        <span class="log-dot error"></span>
                        <span>Errors: {{ systemMetrics().logs.errors }}</span>
                      </div>
                      <div class="log-level">
                        <span class="log-dot warning"></span>
                        <span>Warnings: {{ systemMetrics().logs.warnings }}</span>
                      </div>
                      <div class="log-level">
                        <span class="log-dot info"></span>
                        <span>Info: {{ systemMetrics().logs.info }}</span>
                      </div>
                    </div>
                    <button mat-button color="primary" class="view-logs-btn" (click)="viewSystemLogs()">
                      <mat-icon>visibility</mat-icon>
                      View Detailed Logs
                    </button>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </div>

          <!-- AI System Tab -->
          <div class="tab-content" *ngIf="activeTab() === 'ai'">
            <div class="ai-system-section" [class.loading]="isLoadingAI()">
              
              <!-- AI System Status -->
              <div class="ai-status-banner" [class.online]="aiSystemStatus().isOnline" [class.offline]="!aiSystemStatus().isOnline">
                <mat-icon>{{ aiSystemStatus().isOnline ? 'cloud_done' : 'cloud_off' }}</mat-icon>
                <span>AI System: {{ aiSystemStatus().isOnline ? 'ONLINE' : 'OFFLINE' }}</span>
                <span class="status-details">{{ aiSystemStatus().message }}</span>
              </div>

              <!-- AI Agents & Copilots Grid -->
              <div class="ai-agents-grid">
                
                <!-- AI Copilot Ultimate -->
                <mat-card class="ai-agent-card copilot-ultimate">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>psychology</mat-icon>
                      AI Copilot Ultimate
                      <mat-chip class="status-chip online">ACTIVE</mat-chip>
                    </mat-card-title>
                    <mat-card-subtitle>Advanced AI coding assistant with real-time collaboration</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="agent-stats">
                      <div class="stat">
                        <span class="stat-value">{{ aiAgentStats().copilotUltimate.sessions }}</span>
                        <span class="stat-label">Active Sessions</span>
                      </div>
                      <div class="stat">
                        <span class="stat-value">{{ aiAgentStats().copilotUltimate.messages }}</span>
                        <span class="stat-label">Messages Today</span>
                      </div>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-button color="primary" (click)="testAICopilot()">
                      <mat-icon>play_arrow</mat-icon>
                      Test Copilot
                    </button>
                    <button mat-button routerLink="/dashboard/ai-copilot-ultimate">
                      <mat-icon>launch</mat-icon>
                      Open
                    </button>
                  </mat-card-actions>
                </mat-card>

                <!-- Additional AI Agent Cards would go here -->
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      padding: 2rem;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
      position: relative;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-overlay p {
      margin-top: 1rem;
      font-size: 1.1rem;
      color: #666;
    }

    .admin-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .admin-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin: 0 0 0.5rem 0;
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      background: #f44336;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      opacity: 0.7;
      transition: all 0.3s ease;
    }

    .live-indicator.active {
      background: #4caf50;
      opacity: 1;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    .refresh-controls {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1rem;
    }

    .admin-header p {
      font-size: 1.2rem;
      color: #666;
      margin: 0;
    }

    .admin-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .metric-card.loading::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: loading 1.5s infinite;
    }

    @keyframes loading {
      0% { left: -100%; }
      100% { left: 100%; }
    }

    .metric-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .metric-header mat-icon {
      font-size: 1.5rem;
      color: #667eea;
    }

    .metric-label {
      font-weight: 500;
      color: #666;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .health-status.healthy { color: #4caf50; }
    .health-status.warning { color: #ff9800; }
    .health-status.critical { color: #f44336; }

    .metric-change {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .metric-change.positive { color: #4caf50; }
    .metric-change.negative { color: #f44336; }

    .metric-change mat-icon {
      font-size: 1rem;
    }

    .admin-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .tab-navigation {
      display: flex;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
      border-radius: 12px 12px 0 0;
    }

    .tab-button {
      flex: 1;
      padding: 16px 24px;
      border: none;
      background: transparent;
      color: #666;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 3px solid transparent;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
    }

    .tab-button:hover {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .tab-button.active {
      background: white;
      color: #667eea;
      border-bottom-color: #667eea;
      font-weight: 600;
    }

    .tab-content {
      padding: 2rem;
    }

    .tab-content.loading {
      opacity: 0.6;
      pointer-events: none;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    .chart-card {
      height: 400px;
    }

    .users-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .users-header h2 {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .real-data-indicator {
      background: linear-gradient(45deg, #4caf50, #8bc34a);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      font-weight: 500;
      box-shadow: 0 2px 10px rgba(76, 175, 80, 0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .last-updated {
      font-size: 0.8rem;
      opacity: 0.9;
    }

    .users-actions {
      display: flex;
      gap: 1rem;
    }

    .users-table {
      width: 100%;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-info small {
      color: #666;
      font-size: 0.8rem;
    }

    .usage-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 100px;
    }

    .usage-info span {
      font-size: 0.8rem;
      color: #666;
    }

    .plan-free { background: #e3f2fd; color: #1976d2; }
    .plan-basic { background: #f3e5f5; color: #7b1fa2; }
    .plan-pro { background: #e8f5e8; color: #388e3c; }
    .plan-enterprise { background: #fff3e0; color: #f57c00; }

    .status-active { background: #e8f5e8; color: #388e3c; }
    .status-inactive { background: #ffebee; color: #d32f2f; }
    .status-trial { background: #fff3e0; color: #f57c00; }

    .delete-action {
      color: #d32f2f !important;
    }

    .system-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .system-status {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .status-indicator.healthy { background: #4caf50; }
    .status-indicator.operational { background: #4caf50; }
    .status-indicator.warning { background: #ff9800; }
    .status-indicator.error { background: #f44336; }

    .system-metrics {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .resource-metrics {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .resource-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .resource-item span:first-child {
      min-width: 80px;
      font-size: 0.9rem;
      color: #666;
    }

    .resource-item mat-progress-bar {
      flex: 1;
    }

    .resource-item span:last-child {
      min-width: 40px;
      text-align: right;
      font-weight: 600;
    }

    .log-summary {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .log-level {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .log-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .log-dot.error { background: #f44336; }
    .log-dot.warning { background: #ff9800; }
    .log-dot.info { background: #2196f3; }

    .view-logs-btn {
      width: 100%;
    }

    .ai-status-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      font-weight: 500;
    }

    .ai-status-banner.online {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .ai-status-banner.offline {
      background: #ffebee;
      color: #c62828;
    }

    .ai-agents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .ai-agent-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .ai-agent-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .status-chip {
      font-size: 0.75rem;
      margin-left: 0.5rem;
    }

    .status-chip.online {
      background: #4caf50;
      color: white;
    }

    .agent-stats {
      display: flex;
      gap: 2rem;
      margin: 1rem 0;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
      display: block;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 768px) {
      .admin-layout {
        padding: 1rem;
      }

      .admin-header h1 {
        font-size: 2rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .system-grid {
        grid-template-columns: 1fr;
      }

      .users-header {
        flex-direction: column;
        align-items: stretch;
      }

      .tab-content {
        padding: 1rem;
      }

      .tab-button {
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.9rem;
      }
    }
  `]
})
export class AdminDashboardDynamicComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(SecureAuthService);
  private readonly environmentService = inject(EnvironmentService);
  private readonly snackBar = inject(MatSnackBar);

  // API Configuration
  private readonly API_BASE_URL = this.environmentService.apiUrl;

  // Loading States
  public readonly isLoading = signal(false);
  public readonly isLoadingMetrics = signal(false);
  public readonly isLoadingUsers = signal(false);
  public readonly isLoadingCharts = signal(false);
  public readonly isLoadingSystem = signal(false);
  public readonly isLoadingAI = signal(false);

  // Data Signals
  public readonly metrics = signal<AdminMetrics>({
    totalUsers: 0,
    userGrowth: 0,
    totalGenerations: 0,
    generationGrowth: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    systemHealth: 0
  });

  public readonly liveUsers = signal<any[]>([]);
  public readonly systemMetrics = signal<SystemMetrics>({
    database: { status: 'checking', connections: 0, maxConnections: 100, storageUsed: 0, storageTotal: 10, responseTime: 0 },
    api: { status: 'checking', requestsToday: 0, successRate: 0, avgResponseTime: 0 },
    server: { cpuUsage: 0, memoryUsage: 0, diskUsage: 0 },
    logs: { errors: 0, warnings: 0, info: 0 }
  });

  public readonly aiSystemStatus = signal({
    isOnline: false,
    message: 'Checking AI system status...',
    lastCheck: new Date()
  });

  public readonly aiAgentStats = signal({
    copilotUltimate: { sessions: 0, messages: 0, status: 'checking' }
  });

  // Chart Data
  public readonly userRegistrationData = signal<ChartData<'line'>>({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{ label: 'Registrations', data: [0, 0, 0, 0], borderColor: '#667eea', backgroundColor: 'rgba(102, 126, 234, 0.1)' }]
  });

  public readonly generationData = signal<ChartData<'bar'>>({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ label: 'Generations', data: [0, 0, 0, 0, 0, 0, 0], backgroundColor: '#667eea' }]
  });

  public readonly frameworkData = signal<ChartData<'doughnut'>>({
    labels: ['React', 'Angular', 'Vue', 'Svelte'],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['#61dafb', '#dd0031', '#4fc08d', '#ff3e00'] }]
  });

  public readonly subscriptionData = signal<ChartData<'pie'>>({
    labels: ['Free', 'Basic', 'Pro', 'Enterprise'],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0'] }]
  });

  // UI State
  public readonly activeTab = signal<string>('analytics');
  public readonly userColumns = ['avatar', 'name', 'plan', 'usage', 'status', 'joined', 'actions'];
  public readonly lastUpdated = signal(new Date());
  public readonly autoRefreshEnabled = signal(true);
  public readonly isLiveDataActive = computed(() => this.autoRefreshEnabled() && !this.isLoading());

  // Auto-refresh subscription
  private autoRefreshSubscription?: Subscription;

  // Chart Options
  public readonly chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  public readonly pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' }
    }
  };

  ngOnInit() {
    this.initializeDashboard();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  private async initializeDashboard() {
    this.isLoading.set(true);
    try {
      await this.refreshAllData();
      this.showSuccessMessage('Dashboard initialized with live data');
    } catch (error) {
      this.showErrorMessage('Failed to initialize dashboard');
    } finally {
      this.isLoading.set(false);
    }
  }

  async refreshAllData() {
    const promises = [
      this.loadMetrics(),
      this.loadUsers(),
      this.loadChartData(),
      this.loadSystemMetrics(),
      this.loadAIStatus()
    ];

    await Promise.allSettled(promises);
    this.lastUpdated.set(new Date());
  }

  private async loadMetrics() {
    this.isLoadingMetrics.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.API_BASE_URL}/admin/stats`)
      );

      if (response?.success && response?.data?.stats?.overview) {
        const overview = response.data.stats.overview;
        this.metrics.set({
          totalUsers: overview.totalUsers || 0,
          userGrowth: overview.userGrowth || 0,
          totalGenerations: overview.totalComponents || 0,
          generationGrowth: overview.componentGrowth || 0,
          monthlyRevenue: overview.monthlyRevenue || 0,
          revenueGrowth: overview.revenueGrowth || 0,
          systemHealth: overview.systemHealth || 0
        });

        // Update AI agent stats if available
        if (response.data.stats.aiAgents) {
          this.aiAgentStats.set(response.data.stats.aiAgents);
        }
      }
    } catch (error) {
      this.showErrorMessage('Failed to load metrics');
    } finally {
      this.isLoadingMetrics.set(false);
    }
  }

  private async loadUsers() {
    this.isLoadingUsers.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.API_BASE_URL}/admin/users`)
      );

      if (response?.success && response?.data?.users) {
        const users = response.data.users.map((user: any) => ({
          id: user.id,
          name: user.firstName || user.email.split('@')[0],
          email: user.email,
          avatar: user.avatar,
          plan: user.plan || 'basic',
          generationsUsed: user.generationsUsed || 0,
          generationsLimit: user.generationsLimit || 100,
          status: user.status || 'active',
          joinedAt: new Date(user.createdAt),
          role: user.role
        }));

        this.liveUsers.set(users);
      }
    } catch (error) {
      this.showErrorMessage('Failed to load users');
    } finally {
      this.isLoadingUsers.set(false);
    }
  }

  private async loadChartData() {
    this.isLoadingCharts.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.API_BASE_URL}/admin/analytics/charts`)
      );

      if (response?.success && response?.data?.charts) {
        const charts = response.data.charts;

        // Update user registration chart
        this.userRegistrationData.set({
          labels: charts.userRegistrations.labels,
          datasets: [{
            label: 'Registrations',
            data: charts.userRegistrations.data,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4
          }]
        });

        // Update generation chart
        this.generationData.set({
          labels: charts.componentGenerations.labels,
          datasets: [{
            label: 'Generations',
            data: charts.componentGenerations.data,
            backgroundColor: '#667eea'
          }]
        });

        // Update framework chart
        this.frameworkData.set({
          labels: charts.frameworkDistribution.labels,
          datasets: [{
            data: charts.frameworkDistribution.data,
            backgroundColor: ['#61dafb', '#dd0031', '#4fc08d', '#ff3e00', '#f7df1e']
          }]
        });

        // Update subscription chart
        this.subscriptionData.set({
          labels: charts.subscriptionPlans.labels,
          datasets: [{
            data: charts.subscriptionPlans.data,
            backgroundColor: ['#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0']
          }]
        });
      }
    } catch (error) {
      this.showErrorMessage('Failed to load chart data');
    } finally {
      this.isLoadingCharts.set(false);
    }
  }

  private async loadSystemMetrics() {
    this.isLoadingSystem.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.API_BASE_URL}/admin/system/metrics`)
      );

      if (response?.success && response?.data?.metrics) {
        this.systemMetrics.set(response.data.metrics);
      }
    } catch (error) {
      this.showErrorMessage('Failed to load system metrics');
    } finally {
      this.isLoadingSystem.set(false);
    }
  }

  private async loadAIStatus() {
    this.isLoadingAI.set(true);
    try {
      const healthResponse = await firstValueFrom(
        this.http.get<any>(`${this.API_BASE_URL}/../health`)
      );

      if (healthResponse) {
        this.aiSystemStatus.set({
          isOnline: true,
          message: 'All AI systems operational',
          lastCheck: new Date()
        });
      }
    } catch (error) {
      this.aiSystemStatus.set({
        isOnline: false,
        message: 'AI systems unavailable',
        lastCheck: new Date()
      });
    } finally {
      this.isLoadingAI.set(false);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
    
    // Load tab-specific data
    switch (tab) {
      case 'analytics':
        if (!this.userRegistrationData().datasets[0].data.some(d => d > 0)) {
          this.loadChartData();
        }
        break;
      case 'users':
        if (this.liveUsers().length === 0) {
          this.loadUsers();
        }
        break;
      case 'system':
        this.loadSystemMetrics();
        break;
      case 'ai':
        this.loadAIStatus();
        break;
    }
  }

  toggleAutoRefresh() {
    if (this.autoRefreshEnabled()) {
      this.stopAutoRefresh();
      this.autoRefreshEnabled.set(false);
      this.showInfoMessage('Auto-refresh disabled');
    } else {
      this.startAutoRefresh();
      this.autoRefreshEnabled.set(true);
      this.showInfoMessage('Auto-refresh enabled');
    }
  }

  private startAutoRefresh() {
    this.autoRefreshSubscription = interval(30000).subscribe(() => {
      if (this.autoRefreshEnabled() && !this.isLoading()) {
        this.refreshAllData();
      }
    });
  }

  private stopAutoRefresh() {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
      this.autoRefreshSubscription = undefined;
    }
  }

  getResourceColor(usage: number): 'primary' | 'accent' | 'warn' {
    if (usage < 70) return 'primary';
    if (usage < 85) return 'accent';
    return 'warn';
  }

  // User Management Methods
  editUser(user: any) {
    this.showInfoMessage(`Edit user: ${user.name}`);
    // Implementation would open a dialog
  }

  suspendUser(user: any) {
    this.showInfoMessage(`Suspend user: ${user.name}`);
    // Implementation would call API
  }

  async deleteUser(user: any) {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      try {
        await firstValueFrom(
          this.http.delete(`${this.API_BASE_URL}/admin/users/${user.id}`)
        );
        this.showSuccessMessage(`User ${user.name} deleted successfully`);
        this.loadUsers(); // Refresh users list
      } catch (error) {
        this.showErrorMessage('Failed to delete user');
      }
    }
  }

  addNewUser() {
    this.showInfoMessage('Add new user functionality');
    // Implementation would open a dialog
  }

  exportUsers() {
    const users = this.liveUsers();
    const csvContent = this.convertToCSV(users);
    this.downloadCSV(csvContent, 'users-export.csv');
    this.showSuccessMessage('Users exported successfully');
  }

  // AI System Methods
  async testAICopilot() {
    try {
      const response = await firstValueFrom(
        this.http.post<any>(`${this.API_BASE_URL}/ai/copilot/session/start`, {
          message: 'Admin diagnostic test',
          context: 'System health check'
        })
      );
      this.showSuccessMessage('AI Copilot test successful');
    } catch (error) {
      this.showErrorMessage('AI Copilot test failed');
    }
  }

  viewSystemLogs() {
    this.showInfoMessage('System logs viewer would open here');
    // Implementation would open logs viewer
  }

  // Utility Methods
  private convertToCSV(data: any[]): string {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  private downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showInfoMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}
