import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';

import { ComponentService, Component as AppComponent } from '../../services/component/component.service';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDialogModule,
    MatDividerModule,
    FormsModule
  ],
  template: `
    <div class="library-layout">
      <!-- Header with Search and Filters -->
      <div class="library-header">
        <div class="header-content">
          <h1>
            <mat-icon>folder</mat-icon>
            Component Library
          </h1>
          <p>Manage your saved components and organize your collection</p>
        </div>
        
        <div class="header-actions">
          <button mat-raised-button 
                  color="primary"
                  routerLink="/dashboard/generate">
            <mat-icon>add</mat-icon>
            Create Component
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="search-filters" *ngIf="components().length > 0">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search components...</mat-label>
          <input matInput 
                 [(ngModel)]="searchQuery" 
                 (input)="onSearch()"
                 placeholder="Search by name or code...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Framework</mat-label>
          <mat-select [(value)]="selectedFramework" (selectionChange)="onFilterChange()">
            <mat-option value="">All Frameworks</mat-option>
            <mat-option value="angular">Angular</mat-option>
            <mat-option value="react">React</mat-option>
            <mat-option value="vue">Vue</mat-option>
            <mat-option value="svelte">Svelte</mat-option>
            <mat-option value="vanilla">Vanilla</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Style</mat-label>
          <mat-select [(value)]="selectedStyle" (selectionChange)="onFilterChange()">
            <mat-option value="">All Styles</mat-option>
            <mat-option value="material">Material Design</mat-option>
            <mat-option value="bootstrap">Bootstrap</mat-option>
            <mat-option value="html">HTML/CSS</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-icon-button 
                (click)="refreshComponents()"
                matTooltip="Refresh">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading()">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        <p>Loading your components...</p>
      </div>

      <!-- Components Grid -->
      <div class="library-content" *ngIf="!isLoading()">
        <!-- Empty State -->
        <div class="empty-state" *ngIf="components().length === 0">
          <mat-icon class="empty-icon">bookmark_border</mat-icon>
          <h3>Your Library is Empty</h3>
          <p>Start generating and saving components to build your library!</p>
          <button mat-raised-button 
                  color="primary"
                  routerLink="/dashboard/generate">
            <mat-icon>auto_awesome</mat-icon>
            Generate Your First Component
          </button>
        </div>

        <!-- Components Grid -->
        <div class="components-grid" *ngIf="filteredComponents().length > 0">
          <mat-card class="component-card" 
                    *ngFor="let component of filteredComponents(); trackBy: trackComponent">
            <mat-card-header>
              <div class="component-header">
                <div class="component-info">
                  <mat-card-title>{{ component.name }}</mat-card-title>
                  <mat-card-subtitle>
                    <mat-chip class="framework-chip">{{ component.framework }}</mat-chip>
                    <mat-chip class="style-chip">{{ getStyleLabel(component.style) }}</mat-chip>
                    <span class="version">v{{ component.version }}</span>
                  </mat-card-subtitle>
                </div>
                
                <div class="component-actions">
                  <button mat-icon-button 
                          [matMenuTriggerFor]="componentMenu"
                          matTooltip="More actions">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  
                  <mat-menu #componentMenu="matMenu">
                    <button mat-menu-item (click)="editComponent(component)">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                    <button mat-menu-item (click)="viewVersions(component)">
                      <mat-icon>history</mat-icon>
                      <span>View History</span>
                    </button>
                    <button mat-menu-item (click)="exportComponent(component)">
                      <mat-icon>download</mat-icon>
                      <span>Export</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item 
                            (click)="deleteComponent(component)"
                            class="delete-action">
                      <mat-icon>delete</mat-icon>
                      <span>Delete</span>
                    </button>
                  </mat-menu>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content>
              <div class="code-preview">
                <div class="code-tabs">
                  <span class="code-tab active">TS</span>
                  <span class="code-tab">HTML</span>
                  <span class="code-tab">SCSS</span>
                </div>
                <div class="code-snippet">
                  <pre><code>{{ getCodePreview(component.codeTs) }}</code></pre>
                </div>
              </div>
              
              <div class="component-meta">
                <div class="meta-item">
                  <mat-icon>schedule</mat-icon>
                  <span>{{ component.createdAt | date:'short' }}</span>
                </div>
                <div class="meta-item" *ngIf="component.versions && component.versions.length > 1">
                  <mat-icon>history</mat-icon>
                  <span>{{ component.versions.length }} versions</span>
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button (click)="editComponent(component)">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
              <button mat-button (click)="exportComponent(component)">
                <mat-icon>download</mat-icon>
                Export
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- No Results State -->
        <div class="no-results-state" *ngIf="components().length > 0 && filteredComponents().length === 0">
          <mat-icon class="no-results-icon">search_off</mat-icon>
          <h3>No Components Found</h3>
          <p>Try adjusting your search or filters</p>
          <button mat-button (click)="clearFilters()">
            <mat-icon>clear</mat-icon>
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .library-layout {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header Styles */
    .library-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .header-content h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .header-content p {
      margin: 0;
      font-size: 16px;
      color: #666;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    /* Search and Filters */
    .search-filters {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 32px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .filter-field {
      min-width: 150px;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .loading-state p {
      margin-top: 16px;
      font-size: 16px;
    }

    /* Empty States */
    .empty-state, .no-results-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
      color: #666;
    }

    .empty-icon, .no-results-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ddd;
      margin-bottom: 24px;
    }

    .empty-state h3, .no-results-state h3 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 24px;
    }

    .empty-state p, .no-results-state p {
      margin: 0 0 32px 0;  
      font-size: 16px;
    }

    /* Components Grid */
    .components-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .component-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .component-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    /* Component Header */
    .component-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .component-info {
      flex: 1;
    }

    .component-info mat-card-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }

    .component-info mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .framework-chip {
      background: rgba(33, 150, 243, 0.2);
      color: #2196f3;
      font-size: 12px;
    }

    .style-chip {
      background: rgba(156, 39, 176, 0.2);
      color: #9c27b0;
      font-size: 12px;
    }

    .version {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .component-actions {
      display: flex;
      align-items: center;
    }

    /* Code Preview */
    .code-preview {
      margin: 16px 0;
    }

    .code-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .code-tab {
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      color: #666;
    }

    .code-tab.active {
      background: rgba(33, 150, 243, 0.2);
      color: #2196f3;
    }

    .code-snippet {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 12px;
      overflow: hidden;
    }

    .code-snippet pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Component Meta */
    .component-meta {
      display: flex;
      gap: 16px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #666;
    }

    .meta-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Menu Styles */
    .delete-action {
      color: #f44336 !important;
    }

    .delete-action mat-icon {
      color: #f44336 !important;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .library-layout {
        padding: 16px;
      }

      .library-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .header-content {
        text-align: center;
      }

      .search-filters {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field, .filter-field {
        min-width: unset;
        width: 100%;
      }

      .components-grid {
        grid-template-columns: 1fr;
      }

      .component-header {
        flex-direction: column;
        gap: 12px;
      }

      .component-info mat-card-subtitle {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .library-layout {
        padding: 12px;
      }

      .header-content h1 {
        font-size: 24px;
      }

      .empty-state, .no-results-state {
        padding: 40px 20px;
      }

      .empty-icon, .no-results-icon {
        font-size: 60px;
        width: 60px;
        height: 60px;
      }
    }
  `]
})
export class LibraryComponent implements OnInit {
  private readonly componentService = inject(ComponentService);
  private readonly notificationService = inject(NotificationService);

  // State
  public readonly components = signal<AppComponent[]>([]);
  public readonly isLoading = this.componentService.isLoading;
  
  // Search and filters
  public searchQuery = '';
  public selectedFramework = '';
  public selectedStyle = '';

  // Computed filtered components
  public readonly filteredComponents = computed(() => {
    let filtered = this.components();

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(component => 
        component.name.toLowerCase().includes(query) ||
        component.codeTs.toLowerCase().includes(query) ||
        component.codeHtml.toLowerCase().includes(query)
      );
    }

    // Apply framework filter
    if (this.selectedFramework) {
      filtered = filtered.filter(component => 
        component.framework === this.selectedFramework
      );
    }

    // Apply style filter
    if (this.selectedStyle) {
      filtered = filtered.filter(component => 
        component.style === this.selectedStyle
      );
    }

    return filtered;
  });

  ngOnInit(): void {
    console.log('🚀 Library Component - Loading components from database');
    this.loadComponents();
  }

  /**
   * Load components from database
   */
  private loadComponents(): void {
    this.componentService.getComponents().subscribe({
      next: (components) => {
        this.components.set(components);
        console.log('✅ Components loaded:', components.length);
      },
      error: (error) => {
        console.error('❌ Failed to load components:', error);
        this.notificationService.showError('Failed to load components');
      }
    });
  }

  /**
   * Refresh components
   */
  refreshComponents(): void {
    console.log('🔄 Refreshing components...');
    this.loadComponents();
  }

  /**
   * Handle search input
   */
  onSearch(): void {
    // Filtering is handled by computed signal
    console.log('🔍 Searching:', this.searchQuery);
  }

  /**
   * Handle filter changes
   */
  onFilterChange(): void {
    console.log('🎛️ Filters changed:', { 
      framework: this.selectedFramework, 
      style: this.selectedStyle 
    });
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedFramework = '';
    this.selectedStyle = '';
    console.log('🧹 Filters cleared');
  }

  /**
   * Edit component
   */
  editComponent(component: AppComponent): void {
    console.log('✏️ Edit component:', component.name);
    // TODO: Navigate to editor or open edit dialog
    this.notificationService.showInfo(`Edit functionality coming soon for "${component.name}"`);
  }

  /**
   * View component versions
   */
  viewVersions(component: AppComponent): void {
    console.log('📜 View versions for:', component.name);
    // TODO: Navigate to versions page or open versions dialog
    this.notificationService.showInfo(`Version history coming soon for "${component.name}"`);
  }

  /**
   * Export component
   */
  exportComponent(component: AppComponent): void {
    console.log('📦 Export component:', component.name);
    
    this.componentService.exportComponent(component.id).subscribe({
      next: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${component.name}-component.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Component exported successfully');
      },
      error: (error) => {
        console.error('❌ Export failed:', error);
      }
    });
  }

  /**
   * Delete component
   */
  deleteComponent(component: AppComponent): void {
    if (confirm(`Are you sure you want to delete "${component.name}"? This action cannot be undone.`)) {
      console.log('🗑️ Delete component:', component.name);
      
      this.componentService.deleteComponent(component.id).subscribe({
        next: () => {
          // Remove from local state
          const updatedComponents = this.components().filter(c => c.id !== component.id);
          this.components.set(updatedComponents);
          console.log('✅ Component deleted successfully');
        },
        error: (error) => {
          console.error('❌ Delete failed:', error);
        }
      });
    }
  }

  /**
   * Get style label for display
   */
  getStyleLabel(style: string): string {
    switch (style) {
      case 'material': return 'Material Design';
      case 'bootstrap': return 'Bootstrap';
      case 'html': return 'HTML/CSS';
      default: return style;
    }
  }

  /**
   * Get code preview (first few lines)
   */
  getCodePreview(code: string): string {
    const lines = code.split('\n').slice(0, 4);
    return lines.join('\n') + (code.split('\n').length > 4 ? '\n...' : '');
  }

  /**
   * Track function for ngFor
   */
  trackComponent(index: number, component: AppComponent): string {
    return component.id;
  }
}