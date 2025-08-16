import { Component, OnInit, OnDestroy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRippleModule } from '@angular/material/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { 
  ComponentGalleryService, 
  GalleryComponent, 
  ComponentCategory, 
  GalleryFilter 
} from '@app/services/gallery/component-gallery.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

interface CategoryInfo {
  category: ComponentCategory;
  name: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-component-gallery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatTabsModule,
    MatRippleModule,
    ScrollingModule
  ],
  template: `
    <div class="gallery-container">
      <!-- Header -->
      <div class="gallery-header">
        <div class="header-content">
          <h2>
            <mat-icon>widgets</mat-icon>
            Component Gallery
          </h2>
          <p>Discover and remix beautiful, reusable components</p>
        </div>
        
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ totalComponents() }}</span>
            <span class="stat-label">Components</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ featuredCount() }}</span>
            <span class="stat-label">Featured</span>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="search-section">
        <div class="search-controls">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search components...</mat-label>
            <input matInput 
                   [(ngModel)]="searchQuery"
                   (input)="onSearchChange()"
                   placeholder="Enter component name, tag, or description">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="category-filter">
            <mat-label>Category</mat-label>
            <mat-select [(value)]="selectedCategory" (selectionChange)="onCategoryChange()">
              <mat-option value="">All Categories</mat-option>
              @for (category of categories(); track category.category) {
                <mat-option [value]="category.category">
                  <div class="category-option">
                    <mat-icon>{{ category.icon }}</mat-icon>
                    <span>{{ category.name }}</span>
                    <mat-chip class="count-chip">{{ category.count }}</mat-chip>
                  </div>
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="framework-filter">
            <mat-label>Framework</mat-label>
            <mat-select [(value)]="selectedFramework" (selectionChange)="onFrameworkChange()">
              <mat-option value="">All Frameworks</mat-option>
              @for (framework of frameworks; track framework.value) {
                <mat-option [value]="framework.value">
                  <div class="framework-option">
                    <img [src]="getFrameworkIcon(framework.value)" 
                         [alt]="framework.label"
                         class="framework-icon">
                    <span>{{ framework.label }}</span>
                  </div>
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="sort-filter">
            <mat-label>Sort by</mat-label>
            <mat-select [(value)]="sortBy" (selectionChange)="onSortChange()">
              <mat-option value="popular">Most Popular</mat-option>
              <mat-option value="recent">Most Recent</mat-option>
              <mat-option value="name">Name A-Z</mat-option>
              <mat-option value="downloads">Most Downloaded</mat-option>
              <mat-option value="likes">Most Liked</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Active Filters -->
        @if (hasActiveFilters()) {
          <div class="active-filters">
            <mat-chip-listbox>
              @if (searchQuery) {
                <mat-chip (removed)="clearSearch()">
                  Search: "{{ searchQuery }}"
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }
              @if (selectedCategory) {
                <mat-chip (removed)="clearCategory()">
                  Category: {{ getCategoryName(selectedCategory) }}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }
              @if (selectedFramework) {
                <mat-chip (removed)="clearFramework()">
                  Framework: {{ getFrameworkName(selectedFramework) }}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }
            </mat-chip-listbox>
            <button mat-stroked-button (click)="clearAllFilters()">
              <mat-icon>clear_all</mat-icon>
              Clear All
            </button>
          </div>
        }
      </div>

      <!-- Content Tabs -->
      <div class="gallery-content">
        <mat-tab-group [(selectedIndex)]="activeTab" (selectedTabChange)="onTabChange($event.index)">
          
          <!-- All Components Tab -->
          <mat-tab label="All Components">
            <div class="tab-content">
              @if (isLoading() && components().length === 0) {
                <div class="loading-state">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Loading components...</p>
                </div>
              } @else if (components().length > 0) {
                
                <!-- Components Grid -->
                <div class="components-grid" 
                     (scroll)="onScroll()">
                  
                  @for (component of components(); track component.id) {
                    <div class="component-card" 
                         matRipple
                         [matRippleColor]="'rgba(0, 123, 255, 0.1)'"
                         (click)="previewComponent(component)">
                      
                      <!-- Component Preview -->
                      <div class="component-preview">
                        @if (component.preview.thumbnail) {
                          <img [src]="component.preview.thumbnail" 
                               [alt]="component.displayName"
                               class="preview-image">
                        } @else {
                          <div class="preview-placeholder">
                            <mat-icon>widgets</mat-icon>
                          </div>
                        }
                        
                        <!-- Overlay with quick actions -->
                        <div class="preview-overlay">
                          <div class="quick-actions">
                            <button mat-mini-fab 
                                    color="primary"
                                    matTooltip="Preview"
                                    (click)="$event.stopPropagation(); previewComponent(component)">
                              <mat-icon>visibility</mat-icon>
                            </button>
                            <button mat-mini-fab 
                                    color="accent"
                                    matTooltip="Remix"
                                    (click)="$event.stopPropagation(); remixComponent(component)">
                              <mat-icon>auto_fix_high</mat-icon>
                            </button>
                            <button mat-mini-fab
                                    matTooltip="Use Component"
                                    (click)="$event.stopPropagation(); useComponent(component)">
                              <mat-icon>add_circle</mat-icon>
                            </button>
                          </div>
                        </div>

                        <!-- Badges -->
                        <div class="component-badges">
                          @if (component.isOfficial) {
                            <mat-chip class="official-badge">Official</mat-chip>
                          }
                          @if (component.isFeatured) {
                            <mat-chip class="featured-badge">Featured</mat-chip>
                          }
                          @if (component.author.verified) {
                            <mat-icon class="verified-icon" matTooltip="Verified Author">verified</mat-icon>
                          }
                        </div>
                      </div>

                      <!-- Component Info -->
                      <div class="component-info">
                        <div class="component-header">
                          <h3 class="component-name">{{ component.displayName }}</h3>
                          <div class="component-actions">
                            <button mat-icon-button 
                                    [class.favorited]="isFavorite(component.id)"
                                    matTooltip="{{ isFavorite(component.id) ? 'Remove from favorites' : 'Add to favorites' }}"
                                    (click)="$event.stopPropagation(); toggleFavorite(component)">
                              <mat-icon>{{ isFavorite(component.id) ? 'favorite' : 'favorite_border' }}</mat-icon>
                            </button>
                            <button mat-icon-button 
                                    [matMenuTriggerFor]="componentMenu"
                                    (click)="$event.stopPropagation(); setContextComponent(component)">
                              <mat-icon>more_vert</mat-icon>
                            </button>
                          </div>
                        </div>

                        <p class="component-description">{{ component.description }}</p>

                        <!-- Framework and Category -->
                        <div class="component-meta">
                          <div class="meta-item">
                            <img [src]="getFrameworkIcon(component.framework)" 
                                 [alt]="component.framework"
                                 class="framework-icon small">
                            <span>{{ component.framework | titlecase }}</span>
                          </div>
                          <div class="meta-item">
                            <mat-icon>category</mat-icon>
                            <span>{{ getCategoryName(component.category) }}</span>
                          </div>
                          <div class="meta-item complexity-{{ component.metadata.complexity }}">
                            <mat-icon>{{ getComplexityIcon(component.metadata.complexity) }}</mat-icon>
                            <span>{{ component.metadata.complexity | titlecase }}</span>
                          </div>
                        </div>

                        <!-- Tags -->
                        <div class="component-tags">
                          @for (tag of component.tags.slice(0, 3); track tag) {
                            <mat-chip class="tag-chip">{{ tag }}</mat-chip>
                          }
                          @if (component.tags.length > 3) {
                            <mat-chip class="more-tags">+{{ component.tags.length - 3 }}</mat-chip>
                          }
                        </div>

                        <!-- Stats -->
                        <div class="component-stats">
                          <div class="stat">
                            <mat-icon>download</mat-icon>
                            <span>{{ formatNumber(component.usage.downloads) }}</span>
                          </div>
                          <div class="stat">
                            <mat-icon>favorite</mat-icon>
                            <span>{{ formatNumber(component.usage.likes) }}</span>
                          </div>
                          <div class="stat">
                            <mat-icon>visibility</mat-icon>
                            <span>{{ formatNumber(component.usage.views) }}</span>
                          </div>
                          <div class="stat">
                            <mat-icon>fork_right</mat-icon>
                            <span>{{ formatNumber(component.usage.forks) }}</span>
                          </div>
                        </div>

                        <!-- Author -->
                        <div class="component-author">
                          <span class="author-name">by {{ component.author.name }}</span>
                          <span class="update-time">{{ getRelativeTime(component.updatedAt) }}</span>
                        </div>
                      </div>
                    </div>
                  }

                  <!-- Loading More -->
                  @if (isLoadingMore()) {
                    <div class="loading-more">
                      <mat-spinner diameter="32"></mat-spinner>
                      <p>Loading more components...</p>
                    </div>
                  }
                </div>

                <!-- No More Components -->
                @if (!hasMoreComponents() && components().length > 0) {
                  <div class="end-of-results">
                    <mat-icon>check_circle</mat-icon>
                    <p>You've seen all {{ components().length }} components</p>
                  </div>
                }
              } @else {
                <div class="empty-state">
                  <mat-icon>search_off</mat-icon>
                  <h3>No components found</h3>
                  <p>Try adjusting your search terms or filters to find what you're looking for.</p>
                  <button mat-flat-button color="primary" (click)="clearAllFilters()">
                    <mat-icon>clear_all</mat-icon>
                    Clear Filters
                  </button>
                </div>
              }
            </div>
          </mat-tab>

          <!-- Featured Tab -->
          <mat-tab label="Featured">
            <div class="tab-content">
              @if (isLoadingFeatured()) {
                <div class="loading-state">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Loading featured components...</p>
                </div>
              } @else if (featuredComponents().length > 0) {
                <div class="featured-grid">
                  @for (component of featuredComponents(); track component.id) {
                    <div class="featured-component-card" (click)="previewComponent(component)">
                      <div class="featured-preview">
                        @if (component.preview.thumbnail) {
                          <img [src]="component.preview.thumbnail" 
                               [alt]="component.displayName">
                        } @else {
                          <div class="preview-placeholder">
                            <mat-icon>widgets</mat-icon>
                          </div>
                        }
                        <div class="featured-overlay">
                          <div class="featured-actions">
                            <button mat-fab 
                                    color="primary"
                                    (click)="$event.stopPropagation(); remixComponent(component)">
                              <mat-icon>auto_fix_high</mat-icon>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="featured-info">
                        <h3>{{ component.displayName }}</h3>
                        <p>{{ component.description }}</p>
                        <div class="featured-stats">
                          <span class="downloads">{{ formatNumber(component.usage.downloads) }} downloads</span>
                          <span class="likes">{{ formatNumber(component.usage.likes) }} likes</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <mat-icon>star_outline</mat-icon>
                  <h3>No featured components</h3>
                  <p>Featured components will appear here when available.</p>
                </div>
              }
            </div>
          </mat-tab>

          <!-- My Favorites Tab -->
          <mat-tab label="My Favorites">
            <div class="tab-content">
              @if (favoriteComponents().length > 0) {
                <div class="favorites-grid">
                  @for (component of favoriteComponents(); track component.id) {
                    <div class="favorite-component-card" (click)="previewComponent(component)">
                      <div class="component-preview">
                        @if (component.preview.thumbnail) {
                          <img [src]="component.preview.thumbnail" 
                               [alt]="component.displayName">
                        } @else {
                          <div class="preview-placeholder">
                            <mat-icon>widgets</mat-icon>
                          </div>
                        }
                      </div>
                      <div class="component-info">
                        <h4>{{ component.displayName }}</h4>
                        <p>{{ component.description }}</p>
                        <div class="favorite-actions">
                          <button mat-stroked-button (click)="$event.stopPropagation(); remixComponent(component)">
                            <mat-icon>auto_fix_high</mat-icon>
                            Remix
                          </button>
                          <button mat-icon-button 
                                  color="warn"
                                  (click)="$event.stopPropagation(); toggleFavorite(component)">
                            <mat-icon>favorite</mat-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <mat-icon>favorite_border</mat-icon>
                  <h3>No favorite components</h3>
                  <p>Components you favorite will appear here for quick access.</p>
                  <button mat-flat-button color="primary" (click)="activeTab = 0">
                    <mat-icon>widgets</mat-icon>
                    Browse Components
                  </button>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <!-- Component Context Menu -->
    <mat-menu #componentMenu="matMenu">
      @if (contextComponent()) {
        <button mat-menu-item (click)="previewComponent(contextComponent()!)">
          <mat-icon>visibility</mat-icon>
          Preview
        </button>
        <button mat-menu-item (click)="remixComponent(contextComponent()!)">
          <mat-icon>auto_fix_high</mat-icon>
          Remix
        </button>
        <button mat-menu-item (click)="useComponent(contextComponent()!)">
          <mat-icon>add_circle</mat-icon>
          Use Component
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="likeComponent(contextComponent()!)">
          <mat-icon>thumb_up</mat-icon>
          Like
        </button>
        <button mat-menu-item (click)="shareComponent(contextComponent()!)">
          <mat-icon>share</mat-icon>
          Share
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="viewAuthor(contextComponent()!)">
          <mat-icon>person</mat-icon>
          View Author
        </button>
        <button mat-menu-item (click)="reportComponent(contextComponent()!)">
          <mat-icon>flag</mat-icon>
          Report
        </button>
      }
    </mat-menu>
  `,
  styles: [`
    .gallery-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f8f9fa;
    }

    .gallery-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      background: #ffffff;
      border-bottom: 1px solid #e9ecef;
    }

    .header-content h2 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
      font-weight: 500;
    }

    .header-content p {
      margin: 8px 0 0 0;
      color: #6c757d;
    }

    .header-stats {
      display: flex;
      gap: 32px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 600;
      color: #007bff;
    }

    .stat-label {
      display: block;
      font-size: 12px;
      color: #6c757d;
      text-transform: uppercase;
    }

    .search-section {
      padding: 16px 24px;
      background: #ffffff;
      border-bottom: 1px solid #e9ecef;
    }

    .search-controls {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      margin-bottom: 16px;
    }

    .search-field {
      flex: 1;
      max-width: 400px;
    }

    .category-filter,
    .framework-filter,
    .sort-filter {
      min-width: 180px;
    }

    .category-option,
    .framework-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .framework-icon {
      width: 20px;
      height: 20px;
    }

    .framework-icon.small {
      width: 16px;
      height: 16px;
    }

    .count-chip {
      margin-left: auto;
      font-size: 10px;
      height: 18px;
      background-color: #e9ecef !important;
      color: #6c757d !important;
    }

    .active-filters {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .gallery-content {
      flex: 1;
      overflow: hidden;
    }

    .tab-content {
      padding: 24px;
      height: calc(100vh - 280px);
      overflow-y: auto;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      gap: 16px;
    }

    .components-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .component-card {
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      height: 480px;
    }

    .component-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 123, 255, 0.15);
    }

    .component-preview {
      position: relative;
      height: 200px;
      overflow: hidden;
      background: #f8f9fa;
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6c757d;
    }

    .preview-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .preview-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .component-card:hover .preview-overlay {
      opacity: 1;
    }

    .quick-actions {
      display: flex;
      gap: 12px;
    }

    .component-badges {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: flex-end;
    }

    .official-badge {
      background-color: #28a745 !important;
      color: #ffffff !important;
      font-size: 10px;
      height: 20px;
    }

    .featured-badge {
      background-color: #ffc107 !important;
      color: #212529 !important;
      font-size: 10px;
      height: 20px;
    }

    .verified-icon {
      color: #007bff;
      font-size: 18px;
      background: #ffffff;
      border-radius: 50%;
      padding: 2px;
    }

    .component-info {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }

    .component-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .component-name {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #212529;
    }

    .component-actions {
      display: flex;
      gap: 4px;
    }

    .component-actions .favorited {
      color: #dc3545;
    }

    .component-description {
      margin: 0;
      font-size: 14px;
      color: #6c757d;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .component-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #6c757d;
    }

    .meta-item mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .complexity-beginner {
      color: #28a745;
    }

    .complexity-intermediate {
      color: #ffc107;
    }

    .complexity-advanced {
      color: #dc3545;
    }

    .component-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .tag-chip {
      font-size: 10px;
      height: 18px;
      background-color: #e9ecef !important;
      color: #495057 !important;
    }

    .more-tags {
      font-size: 10px;
      height: 18px;
      background-color: #007bff !important;
      color: #ffffff !important;
    }

    .component-stats {
      display: flex;
      gap: 16px;
      margin-top: auto;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #6c757d;
    }

    .stat mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .component-author {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #6c757d;
      padding-top: 8px;
      border-top: 1px solid #f8f9fa;
    }

    .author-name {
      font-weight: 500;
    }

    .featured-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 32px;
    }

    .featured-component-card {
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      height: 320px;
    }

    .featured-component-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 32px rgba(0, 123, 255, 0.2);
    }

    .featured-preview {
      position: relative;
      height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .featured-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .featured-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .featured-component-card:hover .featured-overlay {
      opacity: 1;
    }

    .featured-info {
      padding: 24px;
    }

    .featured-info h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
    }

    .featured-info p {
      margin: 0 0 16px 0;
      color: #6c757d;
      line-height: 1.5;
    }

    .featured-stats {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: #007bff;
      font-weight: 500;
    }

    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .favorite-component-card {
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      height: 300px;
    }

    .favorite-component-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .favorite-component-card .component-preview {
      height: 160px;
    }

    .favorite-component-card .component-info {
      padding: 16px;
    }

    .favorite-component-card h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .favorite-component-card p {
      margin: 0 0 16px 0;
      font-size: 13px;
      color: #6c757d;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .favorite-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .loading-more {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      gap: 16px;
    }

    .end-of-results {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      gap: 12px;
      color: #6c757d;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      text-align: center;
      color: #6c757d;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #495057;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      max-width: 400px;
    }

    @media (max-width: 1200px) {
      .components-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }

      .featured-grid {
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .gallery-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .header-stats {
        width: 100%;
        justify-content: space-around;
      }

      .search-controls {
        flex-direction: column;
        gap: 12px;
      }

      .category-filter,
      .framework-filter,
      .sort-filter {
        min-width: auto;
      }

      .active-filters {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .components-grid,
      .featured-grid,
      .favorites-grid {
        grid-template-columns: 1fr;
      }

      .component-card {
        height: auto;
        min-height: 400px;
      }

      .featured-component-card {
        height: auto;
        min-height: 280px;
      }
    }
  `]
})
export class ComponentGalleryComponent implements OnInit, OnDestroy {
  private readonly galleryService = inject(ComponentGalleryService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  // Outputs
  readonly onComponentPreview = output<GalleryComponent>();
  readonly onComponentRemix = output<GalleryComponent>();
  readonly onComponentUse = output<GalleryComponent>();

  // State
  readonly isLoading = signal<boolean>(false);
  readonly isLoadingMore = signal<boolean>(false);
  readonly isLoadingFeatured = signal<boolean>(false);
  readonly components = signal<GalleryComponent[]>([]);
  readonly featuredComponents = signal<GalleryComponent[]>([]);
  readonly favoriteComponents = signal<GalleryComponent[]>([]);
  readonly contextComponent = signal<GalleryComponent | null>(null);
  readonly hasMoreComponents = signal<boolean>(true);
  readonly totalComponents = signal<number>(0);
  readonly featuredCount = signal<number>(0);

  // Filters
  searchQuery = '';
  selectedCategory: ComponentCategory | '' = '';
  selectedFramework = '';
  sortBy: 'popular' | 'recent' | 'name' | 'downloads' | 'likes' = 'popular';
  activeTab = 0;
  currentPage = 1;

  // Static data
  readonly frameworks = [
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' }
  ];

  // Computed
  readonly categories = computed<CategoryInfo[]>(() => {
    return [
      { category: 'buttons', name: 'Buttons', icon: 'smart_button', count: 24 },
      { category: 'forms', name: 'Forms', icon: 'assignment', count: 18 },
      { category: 'navigation', name: 'Navigation', icon: 'menu', count: 15 },
      { category: 'layout', name: 'Layout', icon: 'view_quilt', count: 22 },
      { category: 'data-display', name: 'Data Display', icon: 'table_chart', count: 31 },
      { category: 'feedback', name: 'Feedback', icon: 'feedback', count: 12 },
      { category: 'surfaces', name: 'Surfaces', icon: 'crop_portrait', count: 19 },
      { category: 'inputs', name: 'Inputs', icon: 'input', count: 27 },
      { category: 'media', name: 'Media', icon: 'perm_media', count: 14 },
      { category: 'overlays', name: 'Overlays', icon: 'layers', count: 16 }
    ];
  });

  constructor() {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery = query;
      this.resetAndLoadComponents();
    });
  }

  ngOnInit() {
    this.loadComponents();
    this.loadFeaturedComponents();
    this.loadFavorites();
    
    // Subscribe to favorites updates
    this.galleryService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(favorites => {
        const favoriteIds = favorites.map(f => f.componentId);
        const allComponents = this.components();
        const favoriteComps = allComponents.filter(c => favoriteIds.includes(c.id));
        this.favoriteComponents.set(favoriteComps);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadComponents() {
    const filter: GalleryFilter = {
      search: this.searchQuery || undefined,
      category: this.selectedCategory || undefined,
      framework: this.selectedFramework || undefined,
      sortBy: this.sortBy,
      sortOrder: 'desc'
    };

    this.isLoading.set(true);
    this.galleryService.getComponents(filter, this.currentPage, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.currentPage === 1) {
            this.components.set(response.components);
          } else {
            this.components.update(current => [...current, ...response.components]);
          }
          
          this.hasMoreComponents.set(response.hasMore);
          this.totalComponents.set(response.total);
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
        }
      });
  }

  private loadFeaturedComponents() {
    this.isLoadingFeatured.set(true);
    this.galleryService.getFeaturedComponents(6)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (components) => {
          this.featuredComponents.set(components);
          this.featuredCount.set(components.length);
          this.isLoadingFeatured.set(false);
        },
        error: () => {
          this.isLoadingFeatured.set(false);
        }
      });
  }

  private loadFavorites() {
    this.galleryService.getFavorites().subscribe();
  }

  private resetAndLoadComponents() {
    this.currentPage = 1;
    this.loadComponents();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }

  onCategoryChange() {
    this.resetAndLoadComponents();
  }

  onFrameworkChange() {
    this.resetAndLoadComponents();
  }

  onSortChange() {
    this.resetAndLoadComponents();
  }

  onTabChange(index: number) {
    this.activeTab = index;
    
    if (index === 1 && this.featuredComponents().length === 0) {
      this.loadFeaturedComponents();
    }
  }

  onScroll() {
    if (this.hasMoreComponents() && !this.isLoadingMore()) {
      this.isLoadingMore.set(true);
      this.currentPage++;
      this.loadComponents();
    }
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedCategory || this.selectedFramework);
  }

  clearSearch() {
    this.searchQuery = '';
    this.resetAndLoadComponents();
  }

  clearCategory() {
    this.selectedCategory = '';
    this.resetAndLoadComponents();
  }

  clearFramework() {
    this.selectedFramework = '';
    this.resetAndLoadComponents();
  }

  clearAllFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedFramework = '';
    this.sortBy = 'popular';
    this.resetAndLoadComponents();
  }

  previewComponent(component: GalleryComponent) {
    this.onComponentPreview.emit(component);
  }

  remixComponent(component: GalleryComponent) {
    this.onComponentRemix.emit(component);
  }

  useComponent(component: GalleryComponent) {
    this.onComponentUse.emit(component);
  }

  setContextComponent(component: GalleryComponent) {
    this.contextComponent.set(component);
  }

  isFavorite(componentId: string): boolean {
    return this.galleryService.isFavorite(componentId);
  }

  toggleFavorite(component: GalleryComponent) {
    if (this.isFavorite(component.id)) {
      this.galleryService.removeFromFavorites(component.id).subscribe();
    } else {
      this.galleryService.addToFavorites(component.id).subscribe();
    }
  }

  likeComponent(component: GalleryComponent | null) {
    if (component) {
      this.galleryService.likeComponent(component.id).subscribe();
    }
  }

  shareComponent(component: GalleryComponent | null) {
    if (component) {
      // TODO: Implement sharing functionality
      this.notificationService.showInfo('Share functionality coming soon');
    }
  }

  viewAuthor(component: GalleryComponent | null) {
    if (component) {
      // TODO: Implement author profile view
      this.notificationService.showInfo('Author profile coming soon');
    }
  }

  reportComponent(component: GalleryComponent | null) {
    if (component) {
      // TODO: Implement reporting functionality
      this.notificationService.showInfo('Report functionality coming soon');
    }
  }

  getCategoryName(category: ComponentCategory): string {
    const categoryInfo = this.categories().find(c => c.category === category);
    return categoryInfo?.name || category;
  }

  getFrameworkName(framework: string): string {
    const frameworkInfo = this.frameworks.find(f => f.value === framework);
    return frameworkInfo?.label || framework;
  }

  getFrameworkIcon(framework: string): string {
    return `assets/images/frameworks/${framework}.svg`;
  }

  getComplexityIcon(complexity: string): string {
    switch (complexity) {
      case 'beginner': return 'looks_one';
      case 'intermediate': return 'looks_two';
      case 'advanced': return 'looks_3';
      default: return 'help';
    }
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}