import { Component, OnInit, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { AIVersioningService, ComponentVersion, VersionBranch } from '@app/services/ai/ai-versioning.service';
import { NotificationService } from '@app/services/notification/notification.service';

interface VersionHistoryItem extends Omit<ComponentVersion, 'author'> {
  relativeTime: string;
  changesSummary: string;
  branch?: string;
  status?: string;
  author: {
    name: string;
    avatar?: string;
  };
  isEditing?: boolean;
  originalName?: string;
  originalDescription?: string;
  lastModified?: Date;
}

interface HistoryFilter {
  branch?: string;
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
}

@Component({
  selector: 'app-version-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="version-history-container">
      <!-- Header -->
      <div class="history-header">
        <div class="header-info">
          <h3>
            <mat-icon>history</mat-icon>
            Version History
          </h3>
          <p>Track changes and manage component versions</p>
        </div>
        
        <div class="header-actions">
          <button mat-stroked-button (click)="toggleFilters()">
            <mat-icon>filter_list</mat-icon>
            Filters
            @if (hasActiveFilters()) {
              <mat-icon class="filter-active">circle</mat-icon>
            }
          </button>
          
          <button mat-flat-button color="primary" (click)="createVersion()">
            <mat-icon>add</mat-icon>
            New Version
          </button>
        </div>
      </div>

      <!-- Filters Panel -->
      @if (showFilters()) {
        <div class="filters-panel">
          <mat-card>
            <mat-card-content>
              <div class="filters-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Branch</mat-label>
                  <mat-select [(value)]="filters.branch" (selectionChange)="applyFilters()">
                    <mat-option value="">All Branches</mat-option>
                    @for (branch of branches(); track branch.id) {
                      <mat-option [value]="branch.id">{{ branch.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Author</mat-label>
                  <mat-select [(value)]="filters.author" (selectionChange)="applyFilters()">
                    <mat-option value="">All Authors</mat-option>
                    @for (author of uniqueAuthors(); track author) {
                      <mat-option [value]="author">{{ author }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Status</mat-label>
                  <mat-select [(value)]="filters.status" (selectionChange)="applyFilters()">
                    <mat-option value="">All Status</mat-option>
                    <mat-option value="draft">Draft</mat-option>
                    <mat-option value="published">Published</mat-option>
                    <mat-option value="archived">Archived</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>From Date</mat-label>
                  <input matInput 
                         [matDatepicker]="fromPicker"
                         [(ngModel)]="filters.dateFrom"
                         (dateChange)="applyFilters()">
                  <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
                  <mat-datepicker #fromPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>To Date</mat-label>
                  <input matInput 
                         [matDatepicker]="toPicker"
                         [(ngModel)]="filters.dateTo"
                         (dateChange)="applyFilters()">
                  <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
                  <mat-datepicker #toPicker></mat-datepicker>
                </mat-form-field>

                <div class="filter-actions">
                  <button mat-stroked-button (click)="clearFilters()">
                    <mat-icon>clear</mat-icon>
                    Clear
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading version history...</p>
        </div>
      }

      <!-- History Timeline -->
      @if (!isLoading() && filteredVersions().length > 0) {
        <div class="history-timeline">
          @for (version of filteredVersions(); track version.id) {
            <div class="timeline-item" 
                 [class.selected]="selectedVersion()?.id === version.id"
                 (click)="selectVersion(version)">
              
              <!-- Timeline Connector -->
              <div class="timeline-connector">
                <div class="connector-dot" [class]="'status-' + version.status"></div>
                @if (!$last) {
                  <div class="connector-line"></div>
                }
              </div>

              <!-- Version Card -->
              <div class="version-card">
                <div class="card-header">
                  <div class="version-info">
                    <div class="version-title">
                      <span class="version-number">v{{ version.version }}</span>
                      @if (version.name) {
                        <span class="version-name">{{ version.name }}</span>
                      }
                    </div>
                    <div class="version-meta">
                      <span class="author">
                        @if (version.author.avatar) {
                          <img [src]="version.author.avatar" 
                               [alt]="version.author.name"
                               class="author-avatar">
                        } @else {
                          <div class="author-placeholder">
                            {{ version.author.name.charAt(0).toUpperCase() }}
                          </div>
                        }
                        {{ version.author.name }}
                      </span>
                      <span class="timestamp">{{ version.relativeTime }}</span>
                    </div>
                  </div>

                  <div class="card-actions">
                    <mat-chip class="status-chip" [class]="'status-' + version.status">
                      {{ version.status | titlecase }}
                    </mat-chip>
                    
                    <button mat-icon-button 
                            [matMenuTriggerFor]="versionMenu"
                            (click)="$event.stopPropagation(); setContextVersion(version)">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                  </div>
                </div>

                <div class="card-content">
                  @if (version.description) {
                    <p class="version-description">{{ version.description }}</p>
                  }
                  
                  <div class="changes-summary">
                    <mat-icon>summarize</mat-icon>
                    <span>{{ version.changesSummary }}</span>
                  </div>

                  @if (version.tags && version.tags.length > 0) {
                    <div class="version-tags">
                      @for (tag of version.tags; track tag) {
                        <mat-chip class="tag-chip">{{ tag }}</mat-chip>
                      }
                    </div>
                  }
                </div>

                <div class="card-footer">
                  <div class="version-stats">
                    @if (version.branch) {
                      <div class="stat-item">
                        <mat-icon>account_tree</mat-icon>
                        <span>{{ getBranchName(version.branch) }}</span>
                      </div>
                    }
                    
                    @if (version.filesChanged) {
                      <div class="stat-item">
                        <mat-icon>insert_drive_file</mat-icon>
                        <span>{{ version.filesChanged }} files</span>
                      </div>
                    }
                    
                    @if (version.linesAdded || version.linesRemoved) {
                      <div class="stat-item">
                        <mat-icon>code</mat-icon>
                        <span class="additions">+{{ version.linesAdded || 0 }}</span>
                        <span class="deletions">-{{ version.linesRemoved || 0 }}</span>
                      </div>
                    }
                  </div>

                  <div class="card-actions">
                    <button mat-stroked-button 
                            size="small"
                            (click)="$event.stopPropagation(); compareVersion(version)">
                      <mat-icon>compare_arrows</mat-icon>
                      Compare
                    </button>
                    
                    <button mat-stroked-button 
                            size="small"
                            (click)="$event.stopPropagation(); restoreVersion(version)">
                      <mat-icon>restore</mat-icon>
                      Restore
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && filteredVersions().length === 0) {
        <div class="empty-state">
          <mat-icon>history</mat-icon>
          <h3>No Version History</h3>
          <p>No versions found matching your criteria. Create your first version to get started.</p>
          <button mat-flat-button color="primary" (click)="createVersion()">
            <mat-icon>add</mat-icon>
            Create First Version
          </button>
        </div>
      }

      <!-- Load More -->
      @if (hasMoreVersions() && !isLoading()) {
        <div class="load-more">
          <button mat-stroked-button (click)="loadMore()">
            <mat-icon>expand_more</mat-icon>
            Load More Versions
          </button>
        </div>
      }
    </div>

    <!-- Version Context Menu -->
    <mat-menu #versionMenu="matMenu">
      <button mat-menu-item (click)="viewVersion(contextVersion())">
        <mat-icon>visibility</mat-icon>
        View Version
      </button>
      <button mat-menu-item (click)="editVersion(contextVersion())">
        <mat-icon>edit</mat-icon>
        Edit Version
      </button>
      <button mat-menu-item (click)="duplicateVersion(contextVersion())">
        <mat-icon>content_copy</mat-icon>
        Duplicate
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="compareVersion(contextVersion())">
        <mat-icon>compare_arrows</mat-icon>
        Compare
      </button>
      <button mat-menu-item (click)="restoreVersion(contextVersion())">
        <mat-icon>restore</mat-icon>
        Restore
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="downloadVersion(contextVersion())">
        <mat-icon>download</mat-icon>
        Download
      </button>
      <button mat-menu-item (click)="shareVersion(contextVersion())">
        <mat-icon>share</mat-icon>
        Share
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="deleteVersion(contextVersion())" class="danger">
        <mat-icon>delete</mat-icon>
        Delete
      </button>
    </mat-menu>
  `,
  styles: [`
    .version-history-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f8f9fa;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      background: #ffffff;
      border-bottom: 1px solid #e9ecef;
    }

    .header-info h3 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 500;
    }

    .header-info p {
      margin: 4px 0 0 0;
      color: #6c757d;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .filter-active {
      color: #007bff !important;
      font-size: 8px !important;
      width: 8px !important;
      height: 8px !important;
      margin-left: 4px;
    }

    .filters-panel {
      padding: 16px 24px;
      background: #ffffff;
      border-bottom: 1px solid #e9ecef;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: end;
    }

    .filter-actions {
      display: flex;
      justify-content: flex-end;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      gap: 16px;
    }

    .history-timeline {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    .timeline-item {
      display: flex;
      margin-bottom: 24px;
      cursor: pointer;
    }

    .timeline-item:last-child {
      margin-bottom: 0;
    }

    .timeline-item.selected .version-card {
      border-color: #007bff;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
    }

    .timeline-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .connector-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #6c757d;
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 2px #e9ecef;
      z-index: 1;
    }

    .connector-dot.status-draft {
      background: #ffc107;
    }

    .connector-dot.status-published {
      background: #28a745;
    }

    .connector-dot.status-archived {
      background: #dc3545;
    }

    .connector-line {
      width: 2px;
      height: 100%;
      background: #e9ecef;
      margin-top: -3px;
      min-height: 40px;
    }

    .version-card {
      flex: 1;
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .version-card:hover {
      border-color: #6c757d;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px 20px 12px 20px;
      border-bottom: 1px solid #f8f9fa;
    }

    .version-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .version-number {
      font-weight: 600;
      color: #007bff;
      font-family: monospace;
      font-size: 16px;
    }

    .version-name {
      font-weight: 500;
      color: #495057;
    }

    .version-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: #6c757d;
    }

    .author {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .author-avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }

    .author-placeholder {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #007bff;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-chip {
      font-size: 11px;
      height: 20px;
      font-weight: 500;
    }

    .status-chip.status-draft {
      background-color: #fff3cd !important;
      color: #856404 !important;
    }

    .status-chip.status-published {
      background-color: #d1e7dd !important;
      color: #0f5132 !important;
    }

    .status-chip.status-archived {
      background-color: #f8d7da !important;
      color: #721c24 !important;
    }

    .card-content {
      padding: 0 20px 12px 20px;
    }

    .version-description {
      margin: 0 0 12px 0;
      color: #495057;
      line-height: 1.5;
    }

    .changes-summary {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #6c757d;
      margin-bottom: 12px;
    }

    .changes-summary mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .version-tags {
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

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px 16px 20px;
      border-top: 1px solid #f8f9fa;
      background: #fafbfc;
    }

    .version-stats {
      display: flex;
      gap: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #6c757d;
    }

    .stat-item mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .additions {
      color: #28a745;
      font-weight: 500;
    }

    .deletions {
      color: #dc3545;
      font-weight: 500;
    }

    .card-footer .card-actions {
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

    .load-more {
      padding: 16px 24px;
      text-align: center;
      background: #ffffff;
      border-top: 1px solid #e9ecef;
    }

    .danger {
      color: #dc3545 !important;
    }

    .danger mat-icon {
      color: #dc3545 !important;
    }

    @media (max-width: 768px) {
      .history-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .card-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .version-stats {
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  `]
})
export class VersionHistoryComponent implements OnInit {
  private readonly versioningService = inject(AIVersioningService);
  private readonly notificationService = inject(NotificationService);

  // Inputs
  readonly componentId = input<string>('');
  readonly selectedVersion = input<ComponentVersion | null>(null);

  // Outputs
  readonly onVersionSelect = output<ComponentVersion>();
  readonly onVersionCompare = output<ComponentVersion>();
  readonly onVersionRestore = output<ComponentVersion>();

  // State
  readonly isLoading = signal<boolean>(false);
  readonly showFilters = signal<boolean>(false);
  readonly versions = signal<VersionHistoryItem[]>([]);
  readonly branches = signal<VersionBranch[]>([]);
  readonly contextVersion = signal<VersionHistoryItem | null>(null);
  readonly hasMoreVersions = signal<boolean>(false);

  // Filters
  filters: HistoryFilter = {};

  // Computed
  readonly filteredVersions = computed(() => {
    let filtered = this.versions();

    if (this.filters.branch) {
      filtered = filtered.filter(v => v.branch === this.filters.branch);
    }

    if (this.filters.author) {
      filtered = filtered.filter(v => v.author.name === this.filters.author);
    }

    if (this.filters.status) {
      filtered = filtered.filter(v => v.status === this.filters.status);
    }

    if (this.filters.dateFrom) {
      filtered = filtered.filter(v => new Date(v.createdAt) >= this.filters.dateFrom!);
    }

    if (this.filters.dateTo) {
      filtered = filtered.filter(v => new Date(v.createdAt) <= this.filters.dateTo!);
    }

    return filtered;
  });

  readonly uniqueAuthors = computed(() => {
    const authors = new Set(this.versions().map(v => v.author.name));
    return Array.from(authors).sort();
  });

  readonly hasActiveFilters = computed(() => {
    return !!(this.filters.branch || this.filters.author || this.filters.status || 
              this.filters.dateFrom || this.filters.dateTo);
  });

  ngOnInit() {
    this.loadVersionHistory();
    this.loadBranches();
  }

  private loadVersionHistory() {
    if (!this.componentId()) return;

    this.isLoading.set(true);
    this.versioningService.getVersionHistory(this.componentId()).subscribe({
      next: (versions) => {
        const historyItems = versions.map(version => ({
          ...version,
          relativeTime: this.getRelativeTime(version.createdAt),
          changesSummary: this.generateChangesSummary(version),
          author: {
            name: 'John Doe', // Mock data
            avatar: undefined
          }
        }));
        
        this.versions.set(historyItems);
        this.hasMoreVersions.set(versions.length >= 20); // Mock pagination
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notificationService.showError('Failed to load version history');
        this.isLoading.set(false);
      }
    });
  }

  private loadBranches() {
    if (!this.componentId()) return;

    this.versioningService.getBranches(this.componentId()).subscribe({
      next: (branches) => {
        this.branches.set(branches);
      },
      error: (error) => {
        console.error('Failed to load branches:', error);
      }
    });
  }

  toggleFilters() {
    this.showFilters.update(show => !show);
  }

  applyFilters() {
    // Filters are automatically applied via computed property
  }

  clearFilters() {
    this.filters = {};
    this.applyFilters();
  }

  selectVersion(version: VersionHistoryItem) {
    // Convert VersionHistoryItem to ComponentVersion for output
    const componentVersion: ComponentVersion = {
      ...version,
      author: version.author.name // Convert author object to string
    };
    this.onVersionSelect.emit(componentVersion);
  }

  setContextVersion(version: VersionHistoryItem) {
    this.contextVersion.set(version);
  }

  createVersion() {
    // TODO: Open create version dialog
    this.notificationService.showInfo('Create version dialog coming soon');
  }

  loadMore() {
    // TODO: Implement pagination
    this.notificationService.showInfo('Load more functionality coming soon');
  }

  viewVersion(version: VersionHistoryItem | null) {
    if (version) {
      this.selectVersion(version);
    }
  }

  editVersion(version: VersionHistoryItem | null) {
    if (version) {
      console.log('Editing version:', version.version);
      
      // Enable inline editing mode
      version.isEditing = true;
      
      // Store original values for potential cancellation
      version.originalName = version.name;
      version.originalDescription = version.description;
      
      this.notificationService.showInfo(`Editing version ${version.version}. Click save when done.`);
    }
  }

  saveVersionEdit(version: VersionHistoryItem) {
    console.log('Saving version edit:', version.version);
    
    // Validate required fields
    if (!version.name?.trim()) {
      this.notificationService.showError('Version name is required');
      return;
    }
    
    // Exit editing mode
    version.isEditing = false;
    delete version.originalName;
    delete version.originalDescription;
    
    // Update last modified
    version.lastModified = new Date();
    
    this.notificationService.showSuccess(`Version ${version.version} updated successfully`);
    
    // Here you would typically call a service to persist the changes
    // this.versioningService.updateVersion(version);
  }

  cancelVersionEdit(version: VersionHistoryItem) {
    console.log('Cancelling version edit:', version.version);
    
    // Restore original values
    if (version.originalName !== undefined) {
      version.name = version.originalName;
    }
    if (version.originalDescription !== undefined) {
      version.description = version.originalDescription;
    }
    
    // Exit editing mode
    version.isEditing = false;
    delete version.originalName;
    delete version.originalDescription;
  }

  duplicateVersion(version: VersionHistoryItem | null) {
    if (version) {
      // TODO: Implement version duplication
      this.notificationService.showSuccess('Version duplicated');
    }
  }

  compareVersion(version: VersionHistoryItem) {
    // Convert VersionHistoryItem to ComponentVersion for output
    const componentVersion: ComponentVersion = {
      ...version,
      author: version.author.name // Convert author object to string
    };
    this.onVersionCompare.emit(componentVersion);
  }

  restoreVersion(version: VersionHistoryItem) {
    // Convert VersionHistoryItem to ComponentVersion for output
    const componentVersion: ComponentVersion = {
      ...version,
      author: version.author.name // Convert author object to string
    };
    this.onVersionRestore.emit(componentVersion);
    this.notificationService.showSuccess('Version restored');
  }

  downloadVersion(version: VersionHistoryItem | null) {
    if (version) {
      // TODO: Implement version download
      this.notificationService.showSuccess('Version download started');
    }
  }

  shareVersion(version: VersionHistoryItem | null) {
    if (version) {
      // TODO: Open share version dialog
      this.notificationService.showInfo('Share version dialog coming soon');
    }
  }

  deleteVersion(version: VersionHistoryItem | null) {
    if (version) {
      // TODO: Show confirmation dialog
      this.notificationService.showInfo('Delete confirmation dialog coming soon');
    }
  }

  getBranchName(branchId: string): string {
    const branch = this.branches().find(b => b.id === branchId);
    return branch ? branch.name : branchId;
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  private generateChangesSummary(version: ComponentVersion): string {
    // Generate changes summary from version changes
    const changes = [];
    
    if (version.changes && version.changes.length > 0) {
      const changeTypes = version.changes.map(change => change.type);
      const uniqueTypes = [...new Set(changeTypes)];
      
      if (uniqueTypes.includes('feature')) {
        changes.push('New features');
      }
      if (uniqueTypes.includes('bugfix')) {
        changes.push('Bug fixes');
      }
      if (uniqueTypes.includes('improvement')) {
        changes.push('Improvements');
      }
      if (uniqueTypes.includes('breaking')) {
        changes.push('Breaking changes');
      }
      
      changes.push(`${version.changes.length} total changes`);
    }

    return changes.length > 0 ? changes.join(', ') : 'No changes recorded';
  }
}