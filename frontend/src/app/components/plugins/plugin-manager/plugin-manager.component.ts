import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { PluginService } from '@app/services/plugins/plugin.service';
import { 
  Plugin, 
  PluginCategory, 
  PluginInstallation, 
  PluginMarketplace 
} from '@app/models/plugin.model';
import { NotificationService } from '@app/services/notification/notification.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

interface PluginCategoryInfo {
  category: PluginCategory;
  name: string;
  description: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-plugin-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
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
    MatSlideToggleModule
  ],
  template: `
    <div class="plugin-manager-container">
      <!-- Header -->
      <div class="manager-header">
        <div class="header-content">
          <h2>
            <mat-icon>extension</mat-icon>
            Plugin Manager
          </h2>
          <p>Extend Frontuna with powerful plugins and integrations</p>
        </div>
        
        <div class="header-actions">
          <button mat-stroked-button (click)="refreshAll()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
          
          <button mat-flat-button color="primary" (click)="createPlugin()">
            <mat-icon>add</mat-icon>
            Create Plugin
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="search-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search plugins...</mat-label>
          <input matInput 
                 [(ngModel)]="searchQuery"
                 (input)="onSearchChange()"
                 placeholder="Enter plugin name, keyword, or author">
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
      </div>

      <!-- Plugin Tabs -->
      <div class="plugin-tabs">
        <mat-tab-group [(selectedIndex)]="activeTab" (selectedTabChange)="onTabChange($event.index)">
          
          <!-- Marketplace Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>store</mat-icon>
              Marketplace
              @if (marketplace()?.totalPlugins) {
                <mat-chip class="tab-badge">{{ marketplace()!.totalPlugins }}</mat-chip>
              }
            </ng-template>
            
            <div class="tab-content marketplace-tab">
              @if (isLoadingMarketplace()) {
                <div class="loading-state">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Loading marketplace...</p>
                </div>
              } @else if (marketplace()) {
                
                <!-- Featured Plugins -->
                @if (marketplace()!.featured.length > 0 && !searchQuery && !selectedCategory) {
                  <section class="featured-section">
                    <h3>
                      <mat-icon>star</mat-icon>
                      Featured Plugins
                    </h3>
                    <div class="plugins-grid featured-grid">
                      @for (plugin of marketplace()!.featured; track plugin.id) {
                        <div class="plugin-card featured-card" (click)="viewPluginDetails(plugin)">
                          <div class="plugin-header">
                            <div class="plugin-icon">
                              @if (plugin.icon) {
                                <img [src]="plugin.icon" [alt]="plugin.name">
                              } @else {
                                <mat-icon>extension</mat-icon>
                              }
                            </div>
                            <div class="plugin-meta">
                              <h4>{{ plugin.displayName || plugin.name }}</h4>
                              <p class="plugin-author">by {{ plugin.author }}</p>
                            </div>
                            <div class="plugin-badges">
                              @if (plugin.isOfficial) {
                                <mat-chip class="official-badge">Official</mat-chip>
                              }
                              @if (plugin.isVerified) {
                                <mat-icon class="verified-icon" matTooltip="Verified">verified</mat-icon>
                              }
                            </div>
                          </div>
                          
                          <div class="plugin-content">
                            <p class="plugin-description">{{ plugin.description }}</p>
                            
                            <div class="plugin-stats">
                              <div class="stat">
                                <mat-icon>download</mat-icon>
                                <span>{{ formatNumber(plugin.downloads) }}</span>
                              </div>
                              <div class="stat">
                                <mat-icon>star</mat-icon>
                                <span>{{ plugin.rating.toFixed(1) }}</span>
                              </div>
                              <div class="stat">
                                <mat-icon>schedule</mat-icon>
                                <span>{{ getRelativeTime(plugin.updatedAt) }}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div class="plugin-actions">
                            @if (isPluginInstalled(plugin.id)) {
                              <button mat-stroked-button disabled>
                                <mat-icon>check</mat-icon>
                                Installed
                              </button>
                            } @else {
                              <button mat-flat-button 
                                      color="primary"
                                      [disabled]="isInstalling(plugin.id)"
                                      (click)="$event.stopPropagation(); installPlugin(plugin)">
                                @if (isInstalling(plugin.id)) {
                                  <mat-spinner diameter="16"></mat-spinner>
                                  Installing...
                                } @else {
                                  <mat-icon>download</mat-icon>
                                  Install
                                }
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </section>
                }

                <!-- All Plugins / Search Results -->
                <section class="all-plugins-section">
                  <h3>
                    <mat-icon>apps</mat-icon>
                    @if (searchQuery || selectedCategory) {
                      Search Results
                    } @else {
                      All Plugins
                    }
                    <span class="count">({{ filteredMarketplacePlugins().length }})</span>
                  </h3>
                  
                  @if (filteredMarketplacePlugins().length > 0) {
                    <div class="plugins-grid">
                      @for (plugin of filteredMarketplacePlugins(); track plugin.id) {
                        <div class="plugin-card" (click)="viewPluginDetails(plugin)">
                          <div class="plugin-header">
                            <div class="plugin-icon">
                              @if (plugin.icon) {
                                <img [src]="plugin.icon" [alt]="plugin.name">
                              } @else {
                                <mat-icon>extension</mat-icon>
                              }
                            </div>
                            <div class="plugin-meta">
                              <h4>{{ plugin.displayName || plugin.name }}</h4>
                              <p class="plugin-author">by {{ plugin.author }}</p>
                              <p class="plugin-version">v{{ plugin.version }}</p>
                            </div>
                            <div class="plugin-badges">
                              @if (plugin.isOfficial) {
                                <mat-chip class="official-badge">Official</mat-chip>
                              }
                              @if (plugin.isVerified) {
                                <mat-icon class="verified-icon" matTooltip="Verified">verified</mat-icon>
                              }
                            </div>
                          </div>
                          
                          <div class="plugin-content">
                            <p class="plugin-description">{{ plugin.description }}</p>
                            
                            <div class="plugin-tags">
                              @for (keyword of plugin.keywords.slice(0, 3); track keyword) {
                                <mat-chip class="tag-chip">{{ keyword }}</mat-chip>
                              }
                            </div>
                            
                            <div class="plugin-stats">
                              <div class="stat">
                                <mat-icon>download</mat-icon>
                                <span>{{ formatNumber(plugin.downloads) }}</span>
                              </div>
                              <div class="stat">
                                <mat-icon>star</mat-icon>
                                <span>{{ plugin.rating.toFixed(1) }}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div class="plugin-actions">
                            @if (isPluginInstalled(plugin.id)) {
                              <button mat-stroked-button disabled>
                                <mat-icon>check</mat-icon>
                                Installed
                              </button>
                            } @else {
                              <button mat-flat-button 
                                      color="primary"
                                      [disabled]="isInstalling(plugin.id)"
                                      (click)="$event.stopPropagation(); installPlugin(plugin)">
                                @if (isInstalling(plugin.id)) {
                                  <mat-spinner diameter="16"></mat-spinner>
                                } @else {
                                  <mat-icon>download</mat-icon>
                                  Install
                                }
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="empty-state">
                      <mat-icon>search_off</mat-icon>
                      <h3>No plugins found</h3>
                      <p>Try adjusting your search terms or category filter.</p>
                    </div>
                  }
                </section>
              }
            </div>
          </mat-tab>

          <!-- Installed Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>check_circle</mat-icon>
              Installed
              @if (installedPlugins().length > 0) {
                <mat-chip class="tab-badge">{{ installedPlugins().length }}</mat-chip>
              }
            </ng-template>
            
            <div class="tab-content installed-tab">
              @if (isLoadingInstalled()) {
                <div class="loading-state">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Loading installed plugins...</p>
                </div>
              } @else if (installedPlugins().length > 0) {
                <div class="installed-plugins-list">
                  @for (installation of installedPlugins(); track installation.pluginId) {
                    <div class="installed-plugin-card">
                      <div class="plugin-info">
                        <div class="plugin-icon">
                          <mat-icon>extension</mat-icon>
                        </div>
                        <div class="plugin-details">
                          <h4>{{ getPluginName(installation.pluginId) }}</h4>
                          <p class="plugin-version">Version {{ installation.version }}</p>
                          <p class="install-date">Installed {{ getRelativeTime(installation.installedAt) }}</p>
                        </div>
                      </div>
                      
                      <div class="plugin-status">
                        <mat-chip [class]="'status-' + installation.status">
                          {{ installation.status | titlecase }}
                        </mat-chip>
                        @if (installation.lastUsed) {
                          <p class="last-used">Last used {{ getRelativeTime(installation.lastUsed) }}</p>
                        }
                      </div>
                      
                      <div class="plugin-controls">
                        <mat-slide-toggle 
                          [checked]="installation.status === 'active'"
                          [disabled]="isTogglingPlugin(installation.pluginId)"
                          (change)="togglePlugin(installation, $event.checked)">
                          {{ installation.status === 'active' ? 'Enabled' : 'Disabled' }}
                        </mat-slide-toggle>
                        
                        <button mat-icon-button 
                                [matMenuTriggerFor]="pluginMenu"
                                (click)="setContextPlugin(installation)">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <mat-icon>extension</mat-icon>
                  <h3>No plugins installed</h3>
                  <p>Browse the marketplace to find and install plugins.</p>
                  <button mat-flat-button color="primary" (click)="activeTab = 0">
                    <mat-icon>store</mat-icon>
                    Browse Marketplace
                  </button>
                </div>
              }
            </div>
          </mat-tab>

          <!-- Development Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>code</mat-icon>
              Development
            </ng-template>
            
            <div class="tab-content development-tab">
              <div class="development-header">
                <div class="header-info">
                  <h3>Plugin Development</h3>
                  <p>Create and manage your own plugins</p>
                </div>
                <button mat-flat-button color="primary" (click)="createPlugin()">
                  <mat-icon>add</mat-icon>
                  New Plugin
                </button>
              </div>
              
              @if (developmentPlugins().length > 0) {
                <div class="development-plugins">
                  @for (devPlugin of developmentPlugins(); track devPlugin.id) {
                    <div class="dev-plugin-card">
                      <div class="dev-plugin-header">
                        <div class="plugin-info">
                          <h4>{{ devPlugin.name }}</h4>
                          <p>{{ devPlugin.manifest.description }}</p>
                        </div>
                        <mat-chip [class]="'status-' + devPlugin.status">
                          {{ devPlugin.status | titlecase }}
                        </mat-chip>
                      </div>
                      
                      <div class="dev-plugin-actions">
                        <button mat-stroked-button (click)="editPlugin(devPlugin)">
                          <mat-icon>edit</mat-icon>
                          Edit
                        </button>
                        <button mat-stroked-button (click)="testPlugin(devPlugin)">
                          <mat-icon>play_arrow</mat-icon>
                          Test
                        </button>
                        <button mat-stroked-button (click)="publishPlugin(devPlugin)">
                          <mat-icon>publish</mat-icon>
                          Publish
                        </button>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <mat-icon>code</mat-icon>
                  <h3>No development plugins</h3>
                  <p>Start building your first plugin to extend Frontuna's capabilities.</p>
                  <button mat-flat-button color="primary" (click)="createPlugin()">
                    <mat-icon>add</mat-icon>
                    Create Your First Plugin
                  </button>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <!-- Plugin Context Menu -->
    <mat-menu #pluginMenu="matMenu">
      <button mat-menu-item (click)="configurePlugin(contextPlugin())">
        <mat-icon>settings</mat-icon>
        Configure
      </button>
      <button mat-menu-item (click)="viewPluginDetails(getPluginById(contextPlugin()?.pluginId))">
        <mat-icon>info</mat-icon>
        Details
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="updatePlugin(contextPlugin())">
        <mat-icon>update</mat-icon>
        Update
      </button>
      <button mat-menu-item (click)="reinstallPlugin(contextPlugin())">
        <mat-icon>refresh</mat-icon>
        Reinstall
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="uninstallPlugin(contextPlugin())" class="danger">
        <mat-icon>delete</mat-icon>
        Uninstall
      </button>
    </mat-menu>
  `,
  styles: [`
    .plugin-manager-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f8f9fa;
    }

    .manager-header {
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

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .search-section {
      display: flex;
      gap: 16px;
      padding: 16px 24px;
      background: #ffffff;
      border-bottom: 1px solid #e9ecef;
    }

    .search-field {
      flex: 1;
      max-width: 400px;
    }

    .category-filter {
      min-width: 200px;
    }

    .category-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .count-chip {
      margin-left: auto;
      font-size: 10px;
      height: 18px;
      background-color: #e9ecef !important;
      color: #6c757d !important;
    }

    .plugin-tabs {
      flex: 1;
      overflow: hidden;
    }

    .tab-badge {
      margin-left: 8px;
      font-size: 10px;
      height: 18px;
      background-color: #007bff !important;
      color: #ffffff !important;
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

    .featured-section {
      margin-bottom: 32px;
    }

    .featured-section h3,
    .all-plugins-section h3,
    .development-header h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 500;
    }

    .count {
      color: #6c757d;
      font-weight: normal;
      font-size: 14px;
    }

    .plugins-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .featured-grid {
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    }

    .plugin-card {
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .plugin-card:hover {
      border-color: #007bff;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
      transform: translateY(-2px);
    }

    .featured-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      border: none;
    }

    .featured-card .plugin-description,
    .featured-card .plugin-author,
    .featured-card .plugin-version {
      color: rgba(255, 255, 255, 0.9);
    }

    .plugin-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .plugin-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .featured-card .plugin-icon {
      background: rgba(255, 255, 255, 0.2);
    }

    .plugin-icon img {
      width: 32px;
      height: 32px;
    }

    .plugin-icon mat-icon {
      color: #6c757d;
    }

    .featured-card .plugin-icon mat-icon {
      color: #ffffff;
    }

    .plugin-meta {
      flex: 1;
    }

    .plugin-meta h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .plugin-author,
    .plugin-version {
      margin: 0;
      font-size: 13px;
      color: #6c757d;
    }

    .plugin-badges {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .official-badge {
      font-size: 10px;
      height: 18px;
      background-color: #28a745 !important;
      color: #ffffff !important;
    }

    .verified-icon {
      color: #007bff;
      font-size: 18px;
    }

    .featured-card .verified-icon {
      color: #ffffff;
    }

    .plugin-content {
      flex: 1;
    }

    .plugin-description {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #495057;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .plugin-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 12px;
    }

    .tag-chip {
      font-size: 10px;
      height: 18px;
      background-color: #e9ecef !important;
      color: #6c757d !important;
    }

    .plugin-stats {
      display: flex;
      gap: 16px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #6c757d;
    }

    .featured-card .stat {
      color: rgba(255, 255, 255, 0.9);
    }

    .stat mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .plugin-actions {
      display: flex;
      gap: 8px;
    }

    .installed-plugins-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .installed-plugin-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
    }

    .plugin-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .plugin-details h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .plugin-details p {
      margin: 0;
      font-size: 13px;
      color: #6c757d;
    }

    .plugin-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .status-active {
      background-color: #d1e7dd !important;
      color: #0f5132 !important;
    }

    .status-inactive {
      background-color: #f8d7da !important;
      color: #721c24 !important;
    }

    .status-installing {
      background-color: #fff3cd !important;
      color: #856404 !important;
    }

    .last-used {
      font-size: 11px;
      color: #6c757d;
      margin: 0;
    }

    .plugin-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .development-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .header-info p {
      margin: 4px 0 0 0;
      color: #6c757d;
    }

    .development-plugins {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .dev-plugin-card {
      padding: 20px;
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
    }

    .dev-plugin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .dev-plugin-header h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .dev-plugin-header p {
      margin: 0;
      color: #6c757d;
    }

    .status-draft {
      background-color: #fff3cd !important;
      color: #856404 !important;
    }

    .status-published {
      background-color: #d1e7dd !important;
      color: #0f5132 !important;
    }

    .dev-plugin-actions {
      display: flex;
      gap: 8px;
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

    .danger {
      color: #dc3545 !important;
    }

    .danger mat-icon {
      color: #dc3545 !important;
    }

    @media (max-width: 1200px) {
      .plugins-grid,
      .featured-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .manager-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }

      .search-section {
        flex-direction: column;
        gap: 12px;
      }

      .category-filter {
        min-width: auto;
      }

      .plugins-grid,
      .featured-grid {
        grid-template-columns: 1fr;
      }

      .installed-plugin-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .plugin-controls {
        width: 100%;
        justify-content: space-between;
      }

      .development-header {
        flex-direction: column;
        gap: 16px;
      }

      .dev-plugin-actions {
        flex-wrap: wrap;
      }
    }
  `]
})
export class PluginManagerComponent implements OnInit, OnDestroy {
  private readonly pluginService = inject(PluginService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  // State
  readonly isLoadingMarketplace = signal<boolean>(false);
  readonly isLoadingInstalled = signal<boolean>(false);
  readonly marketplace = signal<PluginMarketplace | null>(null);
  readonly marketplacePlugins = signal<Plugin[]>([]);
  readonly installedPlugins = signal<PluginInstallation[]>([]);
  readonly developmentPlugins = signal<any[]>([]);
  readonly installingPlugins = signal<Set<string>>(new Set());
  readonly togglingPlugins = signal<Set<string>>(new Set());
  readonly contextPlugin = signal<PluginInstallation | null>(null);

  // Filters
  searchQuery = '';
  selectedCategory: PluginCategory | '' = '';
  activeTab = 0;

  // Computed
  readonly categories = computed<PluginCategoryInfo[]>(() => {
    const marketplace = this.marketplace();
    return marketplace?.categories || [];
  });

  readonly filteredMarketplacePlugins = computed(() => {
    let plugins = this.marketplacePlugins();
    
    if (this.selectedCategory) {
      plugins = plugins.filter(p => p.category === this.selectedCategory);
    }
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      plugins = plugins.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.author.toLowerCase().includes(query) ||
        p.keywords.some(k => k.toLowerCase().includes(query))
      );
    }
    
    return plugins;
  });

  constructor() {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery = query;
      this.loadMarketplacePlugins();
    });
  }

  ngOnInit() {
    this.loadMarketplace();
    this.loadInstalledPlugins();
    this.loadDevelopmentPlugins();
    
    // Subscribe to plugin service updates
    this.pluginService.installedPlugins$
      .pipe(takeUntil(this.destroy$))
      .subscribe(plugins => {
        this.installedPlugins.set(plugins);
      });
    
    this.pluginService.marketplace$
      .pipe(takeUntil(this.destroy$))
      .subscribe(marketplace => {
        if (marketplace) {
          this.marketplace.set(marketplace);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMarketplace() {
    this.isLoadingMarketplace.set(true);
    this.pluginService.getMarketplacePlugins(this.selectedCategory || undefined, this.searchQuery || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (plugins) => {
          this.marketplacePlugins.set(plugins);
          this.isLoadingMarketplace.set(false);
        },
        error: () => {
          this.isLoadingMarketplace.set(false);
        }
      });
  }

  private loadMarketplacePlugins() {
    this.loadMarketplace();
  }

  private loadInstalledPlugins() {
    this.isLoadingInstalled.set(true);
    this.pluginService.getInstalledPlugins()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoadingInstalled.set(false);
        },
        error: () => {
          this.isLoadingInstalled.set(false);
        }
      });
  }

  private loadDevelopmentPlugins() {
    this.pluginService.getDevelopmentPlugins()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (plugins) => {
          this.developmentPlugins.set(plugins);
        },
        error: () => {
          // Handle error silently for now
        }
      });
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }

  onCategoryChange() {
    this.loadMarketplacePlugins();
  }

  onTabChange(index: number) {
    this.activeTab = index;
    
    // Load data for the selected tab if needed
    switch (index) {
      case 0: // Marketplace
        if (this.marketplacePlugins().length === 0) {
          this.loadMarketplacePlugins();
        }
        break;
      case 1: // Installed
        if (this.installedPlugins().length === 0) {
          this.loadInstalledPlugins();
        }
        break;
      case 2: // Development
        if (this.developmentPlugins().length === 0) {
          this.loadDevelopmentPlugins();
        }
        break;
    }
  }

  refreshAll() {
    this.loadMarketplace();
    this.loadInstalledPlugins();
    this.loadDevelopmentPlugins();
  }

  installPlugin(plugin: Plugin) {
    const installing = this.installingPlugins();
    installing.add(plugin.id);
    this.installingPlugins.set(new Set(installing));
    
    this.pluginService.installPlugin(plugin.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const updated = this.installingPlugins();
          updated.delete(plugin.id);
          this.installingPlugins.set(new Set(updated));
        },
        error: () => {
          const updated = this.installingPlugins();
          updated.delete(plugin.id);
          this.installingPlugins.set(new Set(updated));
        }
      });
  }

  togglePlugin(installation: PluginInstallation, enabled: boolean) {
    const toggling = this.togglingPlugins();
    toggling.add(installation.pluginId);
    this.togglingPlugins.set(new Set(toggling));
    
    this.pluginService.togglePlugin(installation.pluginId, enabled)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const updated = this.togglingPlugins();
          updated.delete(installation.pluginId);
          this.togglingPlugins.set(new Set(updated));
        },
        error: () => {
          const updated = this.togglingPlugins();
          updated.delete(installation.pluginId);
          this.togglingPlugins.set(new Set(updated));
        }
      });
  }

  uninstallPlugin(installation: PluginInstallation | null) {
    if (!installation) return;
    
    this.pluginService.uninstallPlugin(installation.pluginId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  setContextPlugin(installation: PluginInstallation) {
    this.contextPlugin.set(installation);
  }

  isPluginInstalled(pluginId: string): boolean {
    return this.installedPlugins().some(p => p.pluginId === pluginId);
  }

  isInstalling(pluginId: string): boolean {
    return this.installingPlugins().has(pluginId);
  }

  isTogglingPlugin(pluginId: string): boolean {
    return this.togglingPlugins().has(pluginId);
  }

  getPluginName(pluginId: string): string {
    const plugin = this.marketplacePlugins().find(p => p.id === pluginId);
    return plugin?.displayName || plugin?.name || pluginId;
  }

  getPluginById(pluginId: string | undefined): Plugin | null {
    if (!pluginId) return null;
    return this.marketplacePlugins().find(p => p.id === pluginId) || null;
  }

  viewPluginDetails(plugin: Plugin | null) {
    if (plugin) {
      // TODO: Open plugin details modal
      this.notificationService.showInfo('Plugin details dialog coming soon');
    }
  }

  configurePlugin(installation: PluginInstallation | null) {
    if (installation) {
      // TODO: Open plugin configuration dialog
      this.notificationService.showInfo('Plugin configuration dialog coming soon');
    }
  }

  updatePlugin(installation: PluginInstallation | null) {
    if (installation) {
      // TODO: Implement plugin update
      this.notificationService.showInfo('Plugin update functionality coming soon');
    }
  }

  reinstallPlugin(installation: PluginInstallation | null) {
    if (installation) {
      // TODO: Implement plugin reinstall
      this.notificationService.showInfo('Plugin reinstall functionality coming soon');
    }
  }

  createPlugin() {
    // TODO: Open create plugin dialog
    this.notificationService.showInfo('Create plugin dialog coming soon');
  }

  editPlugin(devPlugin: any) {
    // TODO: Open plugin editor
    this.notificationService.showInfo('Plugin editor coming soon');
  }

  testPlugin(devPlugin: any) {
    // TODO: Open plugin test runner
    this.notificationService.showInfo('Plugin testing functionality coming soon');
  }

  publishPlugin(devPlugin: any) {
    // TODO: Implement plugin publishing
    this.notificationService.showInfo('Plugin publishing functionality coming soon');
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