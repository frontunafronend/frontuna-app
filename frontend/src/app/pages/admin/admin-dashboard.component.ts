import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { SeoService } from '@app/services/seo/seo.service';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';

@Component({
  selector: 'app-admin-dashboard',
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
    NgChartsModule
  ],
  template: `
    <div class="admin-layout">
      <div class="admin-header">
        <h1>
          <mat-icon>admin_panel_settings</mat-icon>
          Admin Dashboard
        </h1>
        <p>Manage users, monitor system health, and analyze usage</p>
      </div>

      <div class="admin-content">
        <!-- Key Metrics -->
        <div class="metrics-section">
          <div class="metrics-grid">
            <mat-card class="metric-card users-metric">
              <mat-card-content>
                <div class="metric-header">
                  <mat-icon>people</mat-icon>
                  <span class="metric-label">Total Users</span>
                </div>
                <div class="metric-value">{{ metrics.totalUsers }}</div>
                <div class="metric-change positive">
                  <mat-icon>trending_up</mat-icon>
                  <span>+{{ metrics.userGrowth }}% this month</span>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="metric-card generations-metric">
              <mat-card-content>
                <div class="metric-header">
                  <mat-icon>auto_awesome</mat-icon>
                  <span class="metric-label">Components Generated</span>
                </div>
                <div class="metric-value">{{ metrics.totalGenerations }}</div>
                <div class="metric-change positive">
                  <mat-icon>trending_up</mat-icon>
                  <span>+{{ metrics.generationGrowth }}% this week</span>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="metric-card revenue-metric">
              <mat-card-content>
                <div class="metric-header">
                  <mat-icon>monetization_on</mat-icon>
                  <span class="metric-label">Monthly Revenue</span>
                </div>
                <div class="metric-value">\${{ metrics.monthlyRevenue }}</div>
                <div class="metric-change positive">
                  <mat-icon>trending_up</mat-icon>
                  <span>+{{ metrics.revenueGrowth }}% vs last month</span>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="metric-card health-metric">
              <mat-card-content>
                <div class="metric-header">
                  <mat-icon>health_and_safety</mat-icon>
                  <span class="metric-label">System Health</span>
                </div>
                <div class="metric-value health-value">
                  <span class="health-status healthy">{{ metrics.systemHealth }}%</span>
                </div>
                <div class="metric-change">
                  <mat-icon>check_circle</mat-icon>
                  <span>All systems operational</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Main Content Tabs -->
        <mat-tab-group class="admin-tabs">
          <!-- Analytics Tab -->
          <mat-tab label="Analytics">
            <div class="tab-content">
              <div class="charts-section">
                <div class="charts-grid">
                  <mat-card class="chart-card">
                    <mat-card-header>
                      <mat-card-title>User Registrations</mat-card-title>
                      <mat-card-subtitle>Last 30 days</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <canvas baseChart
                              [data]="userRegistrationData"
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
                              [data]="generationData"
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
                              [data]="frameworkData"
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
                              [data]="subscriptionData"
                              [options]="pieChartOptions"
                              type="pie">
                      </canvas>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Users Tab -->
          <mat-tab label="Users">
            <div class="tab-content">
              <div class="users-section">
                <div class="users-header">
                  <h2>User Management</h2>
                  <div class="users-actions">
                    <button mat-button color="primary">
                      <mat-icon>download</mat-icon>
                      Export Users
                    </button>
                    <button mat-raised-button color="primary">
                      <mat-icon>person_add</mat-icon>
                      Add User
                    </button>
                  </div>
                </div>

                <mat-card class="users-table-card">
                  <mat-card-content>
                    <table mat-table [dataSource]="recentUsers" class="users-table">
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
                            <button mat-menu-item>
                              <mat-icon>visibility</mat-icon>
                              View Details
                            </button>
                            <button mat-menu-item>
                              <mat-icon>edit</mat-icon>
                              Edit User
                            </button>
                            <button mat-menu-item>
                              <mat-icon>block</mat-icon>
                              Suspend User
                            </button>
                            <button mat-menu-item class="danger-action">
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
          </mat-tab>

          <!-- System Tab -->
          <mat-tab label="System">
            <div class="tab-content">
              <div class="system-section">
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
                        <div class="status-indicator healthy"></div>
                        <span>Healthy</span>
                      </div>
                      <div class="system-metrics">
                        <div class="metric">
                          <span>Connections:</span>
                          <strong>25/100</strong>
                        </div>
                        <div class="metric">
                          <span>Storage:</span>
                          <strong>2.1 GB / 10 GB</strong>
                        </div>
                        <div class="metric">
                          <span>Response Time:</span>
                          <strong>12ms</strong>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="system-card">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>cloud</mat-icon>
                        OpenAI API
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="system-status">
                        <div class="status-indicator healthy"></div>
                        <span>Operational</span>
                      </div>
                      <div class="system-metrics">
                        <div class="metric">
                          <span>Requests Today:</span>
                          <strong>1,247</strong>
                        </div>
                        <div class="metric">
                          <span>Success Rate:</span>
                          <strong>99.2%</strong>
                        </div>
                        <div class="metric">
                          <span>Avg Response:</span>
                          <strong>2.3s</strong>
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
                          <mat-progress-bar mode="determinate" value="45" color="primary"></mat-progress-bar>
                          <span>45%</span>
                        </div>
                        <div class="resource-item">
                          <span>Memory</span>
                          <mat-progress-bar mode="determinate" value="62" color="accent"></mat-progress-bar>
                          <span>62%</span>
                        </div>
                        <div class="resource-item">
                          <span>Disk Usage</span>
                          <mat-progress-bar mode="determinate" value="78" color="warn"></mat-progress-bar>
                          <span>78%</span>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="system-card">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>bug_report</mat-icon>
                        Error Logs
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="log-summary">
                        <div class="log-level">
                          <span class="log-dot error"></span>
                          <span>Errors: 3</span>
                        </div>
                        <div class="log-level">
                          <span class="log-dot warning"></span>
                          <span>Warnings: 12</span>
                        </div>
                        <div class="log-level">
                          <span class="log-dot info"></span>
                          <span>Info: 156</span>
                        </div>
                      </div>
                      <button mat-button color="primary" class="view-logs-btn">
                        <mat-icon>visibility</mat-icon>
                        View Detailed Logs
                      </button>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- AI System Tab -->
          <mat-tab label="AI System">
            <div class="tab-content">
              <div class="ai-system-section">
                <!-- Quick Access Card -->
                <mat-card class="quick-access-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>smart_toy</mat-icon>
                      AI System Management
                    </mat-card-title>
                    <mat-card-subtitle>Manage AI copilots, guards, and system health</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="quick-access-grid">
                      <button mat-raised-button 
                              color="primary" 
                              routerLink="/admin/ai-copilots"
                              class="access-button">
                        <mat-icon>psychology</mat-icon>
                        <div class="button-content">
                          <span class="button-title">AI Copilots & Guards</span>
                          <span class="button-subtitle">View all AI components and security guards</span>
                        </div>
                      </button>
                      
                      <button mat-raised-button 
                              color="accent" 
                              class="access-button">
                        <mat-icon>analytics</mat-icon>
                        <div class="button-content">
                          <span class="button-title">AI Analytics</span>
                          <span class="button-subtitle">Performance metrics and usage statistics</span>
                        </div>
                      </button>
                      
                      <button mat-raised-button 
                              color="warn" 
                              class="access-button">
                        <mat-icon>settings</mat-icon>
                        <div class="button-content">
                          <span class="button-title">AI Configuration</span>
                          <span class="button-subtitle">Configure AI models and parameters</span>
                        </div>
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- AI Insights Card -->
                <mat-card class="ai-insights-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>psychology</mat-icon>
                      AI Insights & Recommendations
                    </mat-card-title>
                    <mat-card-subtitle>Weekly analysis from AI Keeper</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="insights-list">
                      <div class="insight-item" *ngFor="let insight of aiInsights">
                        <div class="insight-icon">
                          <mat-icon [class]="'insight-' + insight.type">{{ insight.icon }}</mat-icon>
                        </div>
                        <div class="insight-content">
                          <h4>{{ insight.title }}</h4>
                          <p>{{ insight.description }}</p>
                          <div class="insight-actions" *ngIf="insight.actions">
                            <button mat-button 
                                    color="primary" 
                                    *ngFor="let action of insight.actions"
                                    (click)="executeInsightAction(action)">
                              {{ action.label }}
                            </button>
                          </div>
                        </div>
                        <div class="insight-priority">
                          <mat-chip [class]="'priority-' + insight.priority">
                            {{ insight.priority | titlecase }}
                          </mat-chip>
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
      transition: transform 0.2s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
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

    .health-value .health-status.healthy {
      color: #4caf50;
    }

    .metric-change {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .metric-change.positive {
      color: #4caf50;
    }

    .metric-change mat-icon {
      font-size: 1rem;
    }

    .admin-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .tab-content {
      padding: 2rem;
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
    }

    .users-header h2 {
      margin: 0;
      font-weight: 600;
      color: #333;
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

    .danger-action {
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

    .status-indicator.healthy {
      background: #4caf50;
    }

    .status-indicator.warning {
      background: #ff9800;
    }

    .status-indicator.error {
      background: #f44336;
    }

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

    .insights-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .insight-item {
      display: flex;
      gap: 1.5rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .insight-icon {
      flex-shrink: 0;
    }

    .insight-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .insight-icon .insight-optimization { color: #4caf50; }
    .insight-icon .insight-warning { color: #ff9800; }
    .insight-icon .insight-info { color: #2196f3; }

    .insight-content {
      flex: 1;
    }

    .insight-content h4 {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
      color: #333;
    }

    .insight-content p {
      margin: 0 0 1rem 0;
      color: #666;
      line-height: 1.6;
    }

    .insight-actions {
      display: flex;
      gap: 0.75rem;
    }

    .insight-priority {
      flex-shrink: 0;
    }

    .priority-high { background: #ffebee; color: #d32f2f; }
    .priority-medium { background: #fff3e0; color: #f57c00; }
    .priority-low { background: #e8f5e8; color: #388e3c; }

    .quick-access-card {
      margin-bottom: 2rem;
    }

    .quick-access-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .access-button {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      height: auto;
      min-height: 80px;
      text-align: left;
      border-radius: 8px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .access-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .access-button mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .button-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .button-title {
      font-size: 1.1rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .button-subtitle {
      font-size: 0.9rem;
      opacity: 0.8;
      line-height: 1.3;
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
        gap: 1rem;
        align-items: stretch;
      }

      .tab-content {
        padding: 1rem;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);

  // Mock data - replace with real data from services
  public readonly metrics = {
    totalUsers: 2847,
    userGrowth: 12.5,
    totalGenerations: 45782,
    generationGrowth: 8.3,
    monthlyRevenue: 15420,
    revenueGrowth: 22.7,
    systemHealth: 98.2
  };

  public readonly userColumns = ['avatar', 'name', 'plan', 'usage', 'status', 'joined', 'actions'];

  public readonly recentUsers = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: null,
      plan: 'pro',
      generationsUsed: 45,
      generationsLimit: 500,
      status: 'active',
      joinedAt: new Date('2024-01-15')
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: null,
      plan: 'basic',
      generationsUsed: 23,
      generationsLimit: 100,
      status: 'active',
      joinedAt: new Date('2024-01-20')
    },
    {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      avatar: null,
      plan: 'free',
      generationsUsed: 8,
      generationsLimit: 10,
      status: 'trial',
      joinedAt: new Date('2024-01-25')
    }
  ];

  public readonly aiInsights = [
    {
      type: 'optimization',
      icon: 'trending_up',
      title: 'React Component Demand Spike',
      description: 'React component generations increased 35% this week. Consider promoting React-specific tutorials.',
      priority: 'high',
      actions: [
        { label: 'Create React Tutorial', action: 'create_tutorial' },
        { label: 'Send Email Campaign', action: 'send_campaign' }
      ]
    },
    {
      type: 'warning',
      icon: 'warning',
      title: 'High API Response Times',
      description: 'OpenAI API response times averaging 4.2s. Consider implementing request queuing.',
      priority: 'medium',
      actions: [
        { label: 'Implement Queue', action: 'implement_queue' },
        { label: 'Monitor Closely', action: 'monitor' }
      ]
    },
    {
      type: 'info',
      icon: 'lightbulb',
      title: 'User Retention Opportunity',
      description: 'Users who generate 3+ components have 85% retention rate. Create onboarding flow to encourage this.',
      priority: 'medium',
      actions: [
        { label: 'Update Onboarding', action: 'update_onboarding' }
      ]
    }
  ];

  // Chart configurations
  public readonly chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  public readonly pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };

  public readonly userRegistrationData: ChartData<'line'> = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Registrations',
      data: [45, 67, 89, 123],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4
    }]
  };

  public readonly generationData: ChartData<'bar'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Generations',
      data: [234, 456, 378, 567, 489, 234, 123],
      backgroundColor: '#667eea'
    }]
  };

  public readonly frameworkData: ChartData<'doughnut'> = {
    labels: ['React', 'Angular', 'Vue', 'Svelte'],
    datasets: [{
      data: [45, 30, 20, 5],
      backgroundColor: ['#61dafb', '#dd0031', '#4fc08d', '#ff3e00']
    }]
  };

  public readonly subscriptionData: ChartData<'pie'> = {
    labels: ['Free', 'Basic', 'Pro', 'Enterprise'],
    datasets: [{
      data: [60, 25, 12, 3],
      backgroundColor: ['#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0']
    }]
  };

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'Admin Dashboard - Frontuna.ai',
      description: 'Administrative dashboard for managing Frontuna.ai users, analytics, and system health.',
      url: 'https://frontuna.ai/admin',
      robots: 'noindex, nofollow'
    });

    this.analyticsService.trackPageView({
      page_title: 'Admin Dashboard - Frontuna.ai',
      page_location: window.location.href
    });
  }

  executeInsightAction(action: any): void {
    console.log('Executing insight action:', action);
    
    this.analyticsService.trackEvent({
      action: 'admin_insight_action',
      category: 'admin',
      label: action.action
    });
  }
}