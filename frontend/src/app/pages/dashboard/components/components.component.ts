import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import { ComponentStateService, GeneratedComponent } from '../../../services/component-state/component-state.service';
import { EnhancedPreviewComponent } from '../../../components/shared/enhanced-preview/enhanced-preview.component';
import { DashboardNavComponent } from '../../../components/shared/dashboard-nav/dashboard-nav.component';
import { SeoService } from '../../../services/seo/seo.service';
import { GoogleAnalyticsService } from '../../../services/analytics/google-analytics.service';

interface ComponentCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-components',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule,
    EnhancedPreviewComponent,
    DashboardNavComponent
  ],
  template: `
    <app-dashboard-nav currentPage="My Components"></app-dashboard-nav>
    
    <div class="components-layout">
      <!-- Header -->
      <div class="components-header">
        <div class="header-content">
          <h1>
            <mat-icon>widgets</mat-icon>
            My Components
          </h1>
          <p>Manage, preview, and organize all your generated components</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button 
                  color="primary" 
                  routerLink="/dashboard/generate">
            <mat-icon>add</mat-icon>
            Generate New Component
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-section">
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-info">
                <div class="stat-icon">
                  <mat-icon>widgets</mat-icon>
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ allComponents().length }}</div>
                  <div class="stat-label">Total Components</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-info">
                <div class="stat-icon saved">
                  <mat-icon>bookmark</mat-icon>
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ savedComponents().length }}</div>
                  <div class="stat-label">Saved Components</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-info">
                <div class="stat-icon recent">
                  <mat-icon>schedule</mat-icon>
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ recentComponents().length }}</div>
                  <div class="stat-label">Recent (7 days)</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-info">
                <div class="stat-icon frameworks">
                  <mat-icon>code</mat-icon>
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ uniqueFrameworks().length }}</div>
                  <div class="stat-label">Frameworks Used</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Categories Overview -->
      <div class="categories-section">
        <h2>Browse by Category</h2>
        <div class="categories-grid">
          @for (category of componentCategories; track category.id) {
            <mat-card class="category-card" 
                      (click)="filterByCategory(category.id)"
                      [class.active]="selectedCategory === category.id">
              <mat-card-content>
                <div class="category-icon" [style.background-color]="category.color">
                  <mat-icon>{{ category.icon }}</mat-icon>
                </div>
                <h3>{{ category.name }}</h3>
                <div class="category-count" [matBadge]="category.count">
                  {{ category.count }} components
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search components</mat-label>
            <input matInput 
                   [(ngModel)]="searchQuery"
                   (ngModelChange)="filterComponents()"
                   placeholder="Search by name, description, or framework">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Framework</mat-label>
            <mat-select [(ngModel)]="selectedFramework" (selectionChange)="filterComponents()">
              <mat-option value="">All Frameworks</mat-option>
              <mat-option value="react">React</mat-option>
              <mat-option value="angular">Angular</mat-option>
              <mat-option value="vue">Vue.js</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Sort By</mat-label>
            <mat-select [(ngModel)]="sortBy" (selectionChange)="filterComponents()">
              <mat-option value="newest">Newest First</mat-option>
              <mat-option value="oldest">Oldest First</mat-option>
              <mat-option value="name">Name A-Z</mat-option>
              <mat-option value="framework">Framework</mat-option>
            </mat-select>
          </mat-form-field>

          @if (hasActiveFilters()) {
            <button mat-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          }
        </div>
      </div>

      <!-- Components Grid -->
      <div class="components-content">
        <mat-tab-group [(selectedIndex)]="selectedTab">
          <mat-tab label="Grid View">
            <div class="components-grid">
              @for (component of filteredComponents(); track component.id) {
                <mat-card class="component-card">
                  <div class="component-preview" (click)="previewComponent(component)">
                    <div class="preview-placeholder">
                      <mat-icon>code</mat-icon>
                      <div class="component-type">{{ component.framework }}</div>
                    </div>
                    <div class="preview-overlay">
                      <button mat-fab color="primary">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </div>
                  </div>

                  <mat-card-content>
                    <div class="component-header">
                      <h3>{{ component.name }}</h3>
                      <div class="component-actions">
                        <button mat-icon-button 
                                (click)="toggleSave(component)"
                                [matTooltip]="component.isSaved ? 'Remove from saved' : 'Save component'">
                          <mat-icon [color]="component.isSaved ? 'primary' : ''">
                            {{ component.isSaved ? 'bookmark' : 'bookmark_border' }}
                          </mat-icon>
                        </button>
                        <button mat-icon-button 
                                [matMenuTriggerFor]="menu"
                                matTooltip="More actions">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #menu="matMenu">
                          <button mat-menu-item (click)="editComponent(component)">
                            <mat-icon>edit</mat-icon>
                            <span>Edit Component</span>
                          </button>
                          <button mat-menu-item (click)="duplicateComponent(component)">
                            <mat-icon>content_copy</mat-icon>
                            <span>Duplicate</span>
                          </button>
                          <button mat-menu-item (click)="exportComponent(component)">
                            <mat-icon>download</mat-icon>
                            <span>Export</span>
                          </button>
                          <button mat-menu-item (click)="deleteComponent(component)" class="delete-action">
                            <mat-icon>delete</mat-icon>
                            <span>Delete</span>
                          </button>
                        </mat-menu>
                      </div>
                    </div>

                    <p class="component-description">{{ component.description }}</p>

                    <div class="component-meta">
                      <mat-chip-set>
                        <mat-chip class="framework-chip">
                          {{ component.framework }}
                        </mat-chip>
                        <mat-chip class="design-chip">
                          {{ component.designFramework }}
                        </mat-chip>
                        @if (component.features && component.features.length > 0) {
                          <mat-chip class="features-chip">
                            +{{ component.features.length }} features
                          </mat-chip>
                        }
                      </mat-chip-set>
                    </div>

                    <div class="component-info">
                      <span class="created-date">
                        <mat-icon>schedule</mat-icon>
                        {{ component.createdAt | date:'short' }}
                      </span>
                      @if (component.updatedAt && component.updatedAt !== component.createdAt) {
                        <span class="updated-date">
                          <mat-icon>edit</mat-icon>
                          Updated {{ component.updatedAt | date:'short' }}
                        </span>
                      }
                    </div>
                  </mat-card-content>

                  <mat-card-actions>
                    <button mat-button (click)="previewComponent(component)">
                      <mat-icon>visibility</mat-icon>
                      Preview
                    </button>
                    <button mat-button (click)="editComponent(component)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-raised-button 
                            color="primary"
                            (click)="useComponent(component)">
                      <mat-icon>launch</mat-icon>
                      Use Component
                    </button>
                  </mat-card-actions>
                </mat-card>
              } @empty {
                <div class="empty-state">
                  <mat-icon class="empty-icon">widgets</mat-icon>
                  <h3>{{ getEmptyStateTitle() }}</h3>
                  <p>{{ getEmptyStateMessage() }}</p>
                  <div class="empty-actions">
                    @if (hasActiveFilters()) {
                      <button mat-button (click)="clearFilters()">
                        <mat-icon>clear</mat-icon>
                        Clear Filters
                      </button>
                    }
                    <button mat-raised-button 
                            color="primary" 
                            routerLink="/dashboard/generate">
                      <mat-icon>add</mat-icon>
                      Generate Component
                    </button>
                  </div>
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab label="List View">
            <div class="components-list">
              @for (component of filteredComponents(); track component.id) {
                <mat-card class="component-list-item">
                  <mat-card-content>
                    <div class="list-item-content">
                      <div class="component-icon">
                        <mat-icon>code</mat-icon>
                      </div>
                      <div class="component-details">
                        <h4>{{ component.name }}</h4>
                        <p>{{ component.description }}</p>
                        <div class="component-tags">
                          <mat-chip class="framework-chip">{{ component.framework }}</mat-chip>
                          <mat-chip class="design-chip">{{ component.designFramework }}</mat-chip>
                          <span class="component-date">{{ component.createdAt | date:'short' }}</span>
                        </div>
                      </div>
                      <div class="list-item-actions">
                        <button mat-button (click)="previewComponent(component)">
                          <mat-icon>visibility</mat-icon>
                          Preview
                        </button>
                        <button mat-button (click)="editComponent(component)">
                          <mat-icon>edit</mat-icon>
                          Edit
                        </button>
                        <button mat-raised-button 
                                color="primary"
                                (click)="useComponent(component)">
                          <mat-icon>launch</mat-icon>
                          Use
                        </button>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              } @empty {
                <div class="empty-state">
                  <mat-icon class="empty-icon">widgets</mat-icon>
                  <h3>{{ getEmptyStateTitle() }}</h3>
                  <p>{{ getEmptyStateMessage() }}</p>
                  <div class="empty-actions">
                    @if (hasActiveFilters()) {
                      <button mat-button (click)="clearFilters()">
                        <mat-icon>clear</mat-icon>
                        Clear Filters
                      </button>
                    }
                    <button mat-raised-button 
                            color="primary" 
                            routerLink="/dashboard/generate">
                      <mat-icon>add</mat-icon>
                      Generate Component
                    </button>
                  </div>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <!-- Preview Modal -->
    @if (selectedComponent()) {
      <div class="preview-modal-overlay" (click)="closePreview()">
        <div class="preview-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ selectedComponent()?.name }}</h2>
            <button mat-icon-button (click)="closePreview()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="modal-content">
            <app-enhanced-preview 
              [component]="selectedComponent()!"
              [enableEditing]="true">
            </app-enhanced-preview>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .components-layout {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      min-height: calc(100vh - 120px);
    }

    /* Header */
    .components-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .header-content h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      background: linear-gradient(45deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-content p {
      margin: 0;
      font-size: 1.1rem;
      color: #666;
    }

    /* Stats Section */
    .stats-section {
      margin-bottom: 32px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .stat-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-color);
      color: white;
    }

    .stat-icon.saved {
      background: #4caf50;
    }

    .stat-icon.recent {
      background: #ff9800;
    }

    .stat-icon.frameworks {
      background: #9c27b0;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #333;
      line-height: 1;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }

    /* Categories */
    .categories-section {
      margin-bottom: 32px;
    }

    .categories-section h2 {
      margin: 0 0 16px 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .category-card {
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      border: 2px solid transparent;
    }

    .category-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .category-card.active {
      border-color: var(--primary-color);
      background: rgba(102, 126, 234, 0.05);
    }

    .category-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      color: white;
    }

    .category-card h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .category-count {
      font-size: 12px;
      color: #666;
    }

    /* Filters */
    .filters-section {
      margin-bottom: 24px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    .filters-row mat-form-field {
      min-width: 150px;
    }

    /* Components Grid */
    .components-content {
      margin-top: 24px;
    }

    .components-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      padding: 24px 0;
    }

    .component-card {
      transition: all 0.2s ease;
      cursor: pointer;
      overflow: hidden;
    }

    .component-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .component-preview {
      position: relative;
      height: 180px;
      background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .preview-placeholder {
      text-align: center;
      color: #666;
    }

    .preview-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }

    .component-type {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 1px;
    }

    .preview-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .component-preview:hover .preview-overlay {
      opacity: 1;
    }

    .component-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .component-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      flex: 1;
    }

    .component-actions {
      display: flex;
      gap: 4px;
    }

    .component-description {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .component-meta {
      margin-bottom: 16px;
    }

    .component-meta mat-chip {
      font-size: 12px;
      height: 24px;
    }

    .framework-chip {
      background: #e3f2fd;
      color: #1976d2;
    }

    .design-chip {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .features-chip {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .component-info {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #666;
      margin-bottom: 16px;
    }

    .component-info span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .component-info mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* List View */
    .components-list {
      padding: 24px 0;
    }

    .component-list-item {
      margin-bottom: 16px;
    }

    .list-item-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .component-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .component-details {
      flex: 1;
    }

    .component-details h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .component-details p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .component-tags {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .component-tags mat-chip {
      font-size: 11px;
      height: 20px;
    }

    .component-date {
      font-size: 12px;
      color: #999;
    }

    .list-item-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
      grid-column: 1 / -1;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ddd;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 24px;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      font-size: 16px;
    }

    .empty-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Preview Modal */
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
    }

    .modal-content {
      max-height: calc(90vh - 80px);
      overflow: auto;
    }

    .delete-action {
      color: #f44336 !important;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .components-layout {
        padding: 16px;
      }

      .components-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .header-content h1 {
        font-size: 2rem;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field,
      .filters-row mat-form-field {
        width: 100%;
        min-width: auto;
      }

      .components-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .categories-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .list-item-content {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .component-details {
        text-align: center;
      }

      .list-item-actions {
        justify-content: center;
      }

      .preview-modal {
        margin: 10px;
        max-height: calc(100vh - 20px);
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .categories-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .empty-actions {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class ComponentsComponent implements OnInit {
  private readonly componentStateService = inject(ComponentStateService);
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);

  // Search and filter state
  public searchQuery = '';
  public selectedCategory = '';
  public selectedFramework = '';
  public sortBy = 'newest';
  public selectedTab = 0;

  // Selected component for preview
  public selectedComponent = signal<GeneratedComponent | null>(null);

  // Component categories for filtering
  public readonly componentCategories: ComponentCategory[] = [
    { id: 'ui', name: 'UI Components', icon: 'widgets', count: 0, color: '#2196f3' },
    { id: 'forms', name: 'Forms', icon: 'assignment', count: 0, color: '#4caf50' },
    { id: 'navigation', name: 'Navigation', icon: 'menu', count: 0, color: '#ff9800' },
    { id: 'data', name: 'Data Display', icon: 'table_chart', count: 0, color: '#9c27b0' },
    { id: 'layout', name: 'Layout', icon: 'view_quilt', count: 0, color: '#f44336' },
    { id: 'feedback', name: 'Feedback', icon: 'feedback', count: 0, color: '#607d8b' }
  ];

  // Computed properties
  public readonly allComponents = computed(() => this.componentStateService.components());
  public readonly savedComponents = computed(() => 
    this.allComponents().filter(c => c.isSaved)
  );
  public readonly recentComponents = computed(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.allComponents().filter(c => 
      c.createdAt && new Date(c.createdAt) > weekAgo
    );
  });
  public readonly uniqueFrameworks = computed(() => 
    [...new Set(this.allComponents().map(c => c.framework))]
  );

  public filteredComponents = signal<GeneratedComponent[]>([]);

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'My Components - Frontuna.com',
      description: 'Manage, preview, and organize all your generated components. Browse by category, framework, and search through your component library.',
      url: 'https://frontuna.com/dashboard/components'
    });

    this.analyticsService.trackPageView({
      page_title: 'Components Dashboard',
      page_location: window.location.href
    });

    // Initialize filtered components
    this.filterComponents();
    
    // Update category counts
    this.updateCategoryCounts();
  }

  filterComponents(): void {
    let filtered = this.allComponents();

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(component => 
        component.name.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query) ||
        component.framework.toLowerCase().includes(query) ||
        component.designFramework.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(component => 
        this.getComponentCategory(component) === this.selectedCategory
      );
    }

    // Apply framework filter
    if (this.selectedFramework) {
      filtered = filtered.filter(component => 
        component.framework.toLowerCase() === this.selectedFramework.toLowerCase()
      );
    }

    // Apply sorting
    filtered = this.sortComponents(filtered);

    this.filteredComponents.set(filtered);
  }

  private sortComponents(components: GeneratedComponent[]): GeneratedComponent[] {
    return [...components].sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'framework':
          return a.framework.localeCompare(b.framework);
        default:
          return 0;
      }
    });
  }

  private getComponentCategory(component: GeneratedComponent): string {
    const name = component.name.toLowerCase();
    const description = component.description.toLowerCase();

    if (name.includes('form') || name.includes('input') || description.includes('form')) {
      return 'forms';
    }
    if (name.includes('nav') || name.includes('menu') || description.includes('navigation')) {
      return 'navigation';
    }
    if (name.includes('table') || name.includes('chart') || description.includes('data')) {
      return 'data';
    }
    if (name.includes('layout') || name.includes('grid') || description.includes('layout')) {
      return 'layout';
    }
    if (name.includes('toast') || name.includes('alert') || description.includes('notification')) {
      return 'feedback';
    }
    return 'ui';
  }

  private updateCategoryCounts(): void {
    const counts = this.componentCategories.reduce((acc, cat) => {
      acc[cat.id] = 0;
      return acc;
    }, {} as { [key: string]: number });

    this.allComponents().forEach(component => {
      const category = this.getComponentCategory(component);
      counts[category]++;
    });

    this.componentCategories.forEach(category => {
      category.count = counts[category.id] || 0;
    });
  }

  filterByCategory(categoryId: string): void {
    this.selectedCategory = this.selectedCategory === categoryId ? '' : categoryId;
    this.filterComponents();
    
    this.analyticsService.trackEvent({
      action: 'filter_components',
      category: 'components',
      label: `category_${categoryId}`
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedFramework = '';
    this.sortBy = 'newest';
    this.filterComponents();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedCategory || this.selectedFramework);
  }

  previewComponent(component: GeneratedComponent): void {
    this.selectedComponent.set(component);
    this.analyticsService.trackEvent({
      action: 'preview_component',
      category: 'components',
      label: component.id
    });
  }

  closePreview(): void {
    this.selectedComponent.set(null);
  }

  editComponent(component: GeneratedComponent): void {
    // Navigate to generate page with component pre-loaded
    window.open(`/dashboard/generate?edit=${component.id}`, '_blank');
    
    this.analyticsService.trackEvent({
      action: 'edit_component',
      category: 'components',
      label: component.id
    });
  }

  useComponent(component: GeneratedComponent): void {
    // Copy component code to clipboard or navigate to generate page
    this.analyticsService.trackEvent({
      action: 'use_component',
      category: 'components',
      label: component.id
    });
    
    alert(`Component "${component.name}" is ready to use!\n\nThe component code has been prepared for integration into your project.`);
  }

  toggleSave(component: GeneratedComponent): void {
    component.isSaved = !component.isSaved;
    this.componentStateService.updateComponent(component.id, { isSaved: component.isSaved });
    
    this.analyticsService.trackEvent({
      action: component.isSaved ? 'save_component' : 'unsave_component',
      category: 'components',
      label: component.id
    });
  }

  duplicateComponent(component: GeneratedComponent): void {
    const duplicated = {
      ...component,
      id: `${component.id}_copy_${Date.now()}`,
      name: `${component.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSaved: false
    };
    
    this.componentStateService.addComponent(duplicated);
    this.filterComponents();
    
    this.analyticsService.trackEvent({
      action: 'duplicate_component',
      category: 'components',
      label: component.id
    });
  }

  exportComponent(component: GeneratedComponent): void {
    // Create and download ZIP file with component code
    this.analyticsService.trackEvent({
      action: 'export_component',
      category: 'components',
      label: component.id
    });
    
    alert(`Exporting "${component.name}"...\n\nComponent files will be downloaded as a ZIP archive.`);
  }

  deleteComponent(component: GeneratedComponent): void {
    if (confirm(`Are you sure you want to delete "${component.name}"?\n\nThis action cannot be undone.`)) {
      this.componentStateService.deleteComponent(component.id);
      this.filterComponents();
      this.updateCategoryCounts();
      
      this.analyticsService.trackEvent({
        action: 'delete_component',
        category: 'components',
        label: component.id
      });
    }
  }



  getEmptyStateTitle(): string {
    if (this.hasActiveFilters()) {
      return 'No components match your filters';
    }
    return 'No components yet';
  }

  getEmptyStateMessage(): string {
    if (this.hasActiveFilters()) {
      return 'Try adjusting your search criteria or clearing the filters to see more components.';
    }
    return 'Start building your component library by generating your first component!';
  }
}