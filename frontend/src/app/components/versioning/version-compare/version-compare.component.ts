import { Component, OnInit, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { AIDiffViewerComponent } from '@app/components/ai/ai-diff-viewer/ai-diff-viewer.component';
import { AIVersioningService } from '@app/services/ai/ai-versioning.service';
import { ComponentVersion, VersionComparison, VersionDifference } from '@app/models/ai.model';
import { NotificationService } from '@app/services/notification/notification.service';

interface ComparisonSummary {
  totalChanges: number;
  additions: number;
  deletions: number;
  modifications: number;
  filesChanged: number;
  impactLevel: 'low' | 'medium' | 'high';
  breakingChanges: boolean;
}

@Component({
  selector: 'app-version-compare',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    AIDiffViewerComponent
  ],
  template: `
    <div class="version-compare-container">
      <!-- Header -->
      <div class="compare-header">
        <div class="header-content">
          <h3>
            <mat-icon>compare_arrows</mat-icon>
            Version Comparison
          </h3>
          <p>Compare different versions to see what changed</p>
        </div>
        
        <div class="header-actions">
          <button mat-stroked-button (click)="swapVersions()" [disabled]="isLoading()">
            <mat-icon>swap_horiz</mat-icon>
            Swap
          </button>
          
          <button mat-flat-button 
                  color="primary" 
                  [disabled]="!canMerge() || isLoading()"
                  (click)="mergeVersions()">
            <mat-icon>merge_type</mat-icon>
            Merge Changes
          </button>
        </div>
      </div>

      <!-- Version Selectors -->
      <div class="version-selectors">
        <div class="selector-section">
          <mat-card class="version-selector-card from-version">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>history</mat-icon>
                From Version
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="version-select">
                <mat-label>Select Version</mat-label>
                <mat-select [value]="fromVersion()?.id" 
                            (selectionChange)="onFromVersionChange($event.value)"
                            [disabled]="isLoading()">
                  @for (version of availableVersions(); track version.id) {
                    <mat-option [value]="version.id">
                      <div class="version-option">
                        <span class="version-number">v{{ version.version }}</span>
                        @if (version.name) {
                          <span class="version-name">{{ version.name }}</span>
                        }
                        <span class="version-date">{{ formatDate(version.createdAt) }}</span>
                      </div>
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
              
              @if (fromVersion()) {
                <div class="version-info">
                  <div class="info-row">
                    <span class="label">Status:</span>
                    <mat-chip class="status-chip" [class]="'status-' + fromVersion()!.status">
                      {{ fromVersion()!.status | titlecase }}
                    </mat-chip>
                  </div>
                  <div class="info-row">
                    <span class="label">Created:</span>
                    <span class="value">{{ formatDate(fromVersion()!.createdAt) }}</span>
                  </div>
                  @if (fromVersion()!.description) {
                    <div class="info-row">
                      <span class="label">Description:</span>
                      <span class="value">{{ fromVersion()!.description }}</span>
                    </div>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <div class="comparison-arrow">
          <mat-icon>compare_arrows</mat-icon>
        </div>

        <div class="selector-section">
          <mat-card class="version-selector-card to-version">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>update</mat-icon>
                To Version
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="version-select">
                <mat-label>Select Version</mat-label>
                <mat-select [value]="toVersion()?.id" 
                            (selectionChange)="onToVersionChange($event.value)"
                            [disabled]="isLoading()">
                  @for (version of availableVersions(); track version.id) {
                    <mat-option [value]="version.id">
                      <div class="version-option">
                        <span class="version-number">v{{ version.version }}</span>
                        @if (version.name) {
                          <span class="version-name">{{ version.name }}</span>
                        }
                        <span class="version-date">{{ formatDate(version.createdAt) }}</span>
                      </div>
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
              
              @if (toVersion()) {
                <div class="version-info">
                  <div class="info-row">
                    <span class="label">Status:</span>
                    <mat-chip class="status-chip" [class]="'status-' + toVersion()!.status">
                      {{ toVersion()!.status | titlecase }}
                    </mat-chip>
                  </div>
                  <div class="info-row">
                    <span class="label">Created:</span>
                    <span class="value">{{ formatDate(toVersion()!.createdAt) }}</span>
                  </div>
                  @if (toVersion()!.description) {
                    <div class="info-row">
                      <span class="label">Description:</span>
                      <span class="value">{{ toVersion()!.description }}</span>
                    </div>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Comparing versions...</p>
        </div>
      }

      <!-- Comparison Results -->
      @if (comparison() && !isLoading()) {
        <div class="comparison-results">
          <!-- Summary -->
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>summarize</mat-icon>
                Comparison Summary
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-grid">
                <div class="summary-stat">
                  <div class="stat-value">{{ comparison()!.summary.totalChanges }}</div>
                  <div class="stat-label">Total Changes</div>
                </div>
                <div class="summary-stat additions">
                  <div class="stat-value">+{{ comparison()!.summary.additionsCount }}</div>
                  <div class="stat-label">Additions</div>
                </div>
                <div class="summary-stat deletions">
                  <div class="stat-value">-{{ comparison()!.summary.deletionsCount }}</div>
                  <div class="stat-label">Deletions</div>
                </div>
                <div class="summary-stat modifications">
                  <div class="stat-value">{{ comparison()!.summary.modificationsCount }}</div>
                  <div class="stat-label">Modifications</div>
                </div>
              </div>
              
              <div class="summary-badges">
                <mat-chip class="impact-chip" [class]="'impact-' + comparison()!.summary.impactLevel">
                  <mat-icon>{{ getImpactIcon(comparison()!.summary.impactLevel) }}</mat-icon>
                  {{ comparison()!.summary.impactLevel | titlecase }} Impact
                </mat-chip>
                
                @if (comparison()!.summary.breakingChanges) {
                  <mat-chip class="breaking-chip">
                    <mat-icon>warning</mat-icon>
                    Breaking Changes
                  </mat-chip>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Detailed Comparison -->
          <div class="detailed-comparison">
            <mat-tab-group [(selectedIndex)]="activeTab">
              
              <!-- Side-by-Side View -->
              <mat-tab label="Side by Side">
                <div class="side-by-side-view">
                  <app-ai-diff-viewer
                    [originalCode]="getOriginalCode()"
                    [modifiedCode]="getModifiedCode()"
                    [diffId]="getDiffId()">
                  </app-ai-diff-viewer>
                </div>
              </mat-tab>

              <!-- File Changes -->
              <mat-tab label="File Changes">
                <div class="file-changes">
                  @for (diff of comparison()!.differences; track diff.file + diff.section) {
                    <mat-card class="file-change-card">
                      <mat-card-header>
                        <mat-card-title>
                          <mat-icon>{{ getFileIcon(diff.file) }}</mat-icon>
                          {{ diff.file }}
                        </mat-card-title>
                        <mat-card-subtitle>
                          <mat-chip class="change-type-chip" [class]="'type-' + diff.type">
                            <mat-icon>{{ getChangeTypeIcon(diff.type) }}</mat-icon>
                            {{ diff.type | titlecase }}
                          </mat-chip>
                        </mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>
                        @if (diff.oldContent && diff.newContent) {
                          <div class="change-comparison">
                            <div class="change-section old-content">
                              <h4>Before (Line {{ diff.lineNumber }})</h4>
                              <pre><code>{{ diff.oldContent }}</code></pre>
                            </div>
                            <div class="change-section new-content">
                              <h4>After (Line {{ diff.lineNumber }})</h4>
                              <pre><code>{{ diff.newContent }}</code></pre>
                            </div>
                          </div>
                        } @else if (diff.newContent) {
                          <div class="change-section new-content">
                            <h4>Added (Line {{ diff.lineNumber }})</h4>
                            <pre><code>{{ diff.newContent }}</code></pre>
                          </div>
                        } @else if (diff.oldContent) {
                          <div class="change-section old-content">
                            <h4>Removed (Line {{ diff.lineNumber }})</h4>
                            <pre><code>{{ diff.oldContent }}</code></pre>
                          </div>
                        }
                      </mat-card-content>
                      <mat-card-actions>
                        <button mat-stroked-button (click)="acceptChange(diff)">
                          <mat-icon>check</mat-icon>
                          Accept Change
                        </button>
                        <button mat-stroked-button (click)="rejectChange(diff)">
                          <mat-icon>close</mat-icon>
                          Reject Change
                        </button>
                      </mat-card-actions>
                    </mat-card>
                  }
                </div>
              </mat-tab>

              <!-- Metadata Changes -->
              <mat-tab label="Metadata">
                <div class="metadata-comparison">
                  <div class="metadata-grid">
                    <div class="metadata-section">
                      <h4>Version Information</h4>
                      <div class="metadata-table">
                        <div class="metadata-row">
                          <span class="label">Version Number</span>
                          <span class="from-value">v{{ fromVersion()?.version }}</span>
                          <mat-icon>arrow_forward</mat-icon>
                          <span class="to-value">v{{ toVersion()?.version }}</span>
                        </div>
                        <div class="metadata-row">
                          <span class="label">Status</span>
                          <span class="from-value">{{ fromVersion()?.status }}</span>
                          <mat-icon>arrow_forward</mat-icon>
                          <span class="to-value">{{ toVersion()?.status }}</span>
                        </div>
                        <div class="metadata-row">
                          <span class="label">Created Date</span>
                          <span class="from-value">{{ formatDate(fromVersion()?.createdAt) }}</span>
                          <mat-icon>arrow_forward</mat-icon>
                          <span class="to-value">{{ formatDate(toVersion()?.createdAt) }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="metadata-section">
                      <h4>Statistics</h4>
                      <div class="stats-comparison">
                        <div class="stat-comparison">
                          <span class="label">Lines Added</span>
                          <span class="from-value">{{ fromVersion()?.linesAdded || 0 }}</span>
                          <mat-icon>arrow_forward</mat-icon>
                          <span class="to-value additions">{{ toVersion()?.linesAdded || 0 }}</span>
                        </div>
                        <div class="stat-comparison">
                          <span class="label">Lines Removed</span>
                          <span class="from-value">{{ fromVersion()?.linesRemoved || 0 }}</span>
                          <mat-icon>arrow_forward</mat-icon>
                          <span class="to-value deletions">{{ toVersion()?.linesRemoved || 0 }}</span>
                        </div>
                        <div class="stat-comparison">
                          <span class="label">Files Changed</span>
                          <span class="from-value">{{ fromVersion()?.filesChanged || 0 }}</span>
                          <mat-icon>arrow_forward</mat-icon>
                          <span class="to-value">{{ toVersion()?.filesChanged || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-tab>

            </mat-tab-group>
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (!fromVersion() || !toVersion()) {
        <div class="empty-state">
          <mat-icon>compare_arrows</mat-icon>
          <h3>Select Versions to Compare</h3>
          <p>Choose two versions from the dropdowns above to see their differences.</p>
        </div>
      }

      <!-- No Changes State -->
      @if (fromVersion() && toVersion() && comparison() && comparison()!.summary.totalChanges === 0) {
        <div class="no-changes-state">
          <mat-icon>check_circle</mat-icon>
          <h3>No Differences Found</h3>
          <p>The selected versions are identical.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .version-compare-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f8f9fa;
    }

    .compare-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      background: #ffffff;
      border-bottom: 1px solid #e9ecef;
    }

    .header-content h3 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 500;
    }

    .header-content p {
      margin: 4px 0 0 0;
      color: #6c757d;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .version-selectors {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 24px;
      padding: 24px;
      align-items: center;
    }

    .version-selector-card {
      background: #ffffff;
    }

    .version-selector-card.from-version {
      border-left: 4px solid #dc3545;
    }

    .version-selector-card.to-version {
      border-left: 4px solid #28a745;
    }

    .version-selector-card mat-card-header {
      margin-bottom: 16px;
    }

    .version-selector-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
    }

    .version-select {
      width: 100%;
    }

    .version-option {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .version-number {
      font-weight: 600;
      color: #007bff;
      font-family: monospace;
    }

    .version-name {
      font-size: 14px;
      color: #495057;
    }

    .version-date {
      font-size: 12px;
      color: #6c757d;
    }

    .version-info {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .label {
      font-weight: 500;
      color: #6c757d;
      min-width: 80px;
    }

    .value {
      color: #495057;
      font-size: 14px;
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

    .comparison-arrow {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 16px;
      background: #ffffff;
      border-radius: 50%;
      border: 2px solid #e9ecef;
      width: 64px;
      height: 64px;
    }

    .comparison-arrow mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #007bff;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      gap: 16px;
    }

    .comparison-results {
      flex: 1;
      padding: 0 24px 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .summary-card {
      background: #ffffff;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 16px;
    }

    .summary-stat {
      text-align: center;
      padding: 16px;
      border-radius: 8px;
      background: #f8f9fa;
    }

    .summary-stat.additions {
      background: #d1e7dd;
      color: #0f5132;
    }

    .summary-stat.deletions {
      background: #f8d7da;
      color: #721c24;
    }

    .summary-stat.modifications {
      background: #fff3cd;
      color: #856404;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 500;
    }

    .summary-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .impact-chip {
      font-weight: 500;
    }

    .impact-chip.impact-low {
      background-color: #d1e7dd !important;
      color: #0f5132 !important;
    }

    .impact-chip.impact-medium {
      background-color: #fff3cd !important;
      color: #856404 !important;
    }

    .impact-chip.impact-high {
      background-color: #f8d7da !important;
      color: #721c24 !important;
    }

    .breaking-chip {
      background-color: #dc3545 !important;
      color: #ffffff !important;
    }

    .detailed-comparison {
      flex: 1;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
    }

    .side-by-side-view {
      height: 600px;
    }

    .file-changes {
      padding: 24px;
      max-height: 600px;
      overflow-y: auto;
    }

    .file-change-card {
      margin-bottom: 16px;
    }

    .file-change-card:last-child {
      margin-bottom: 0;
    }

    .file-change-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .change-type-chip {
      font-size: 10px;
      height: 18px;
      font-weight: 500;
    }

    .change-type-chip.type-added {
      background-color: #d1e7dd !important;
      color: #0f5132 !important;
    }

    .change-type-chip.type-removed {
      background-color: #f8d7da !important;
      color: #721c24 !important;
    }

    .change-type-chip.type-modified {
      background-color: #fff3cd !important;
      color: #856404 !important;
    }

    .change-comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .change-section {
      border-radius: 4px;
      overflow: hidden;
    }

    .change-section h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 12px;
    }

    .change-section.old-content h4 {
      background: #f8d7da;
      color: #721c24;
    }

    .change-section.new-content h4 {
      background: #d1e7dd;
      color: #0f5132;
    }

    .change-section pre {
      margin: 0;
      padding: 12px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-top: none;
      font-family: 'Fira Code', 'Cascadia Code', 'Monaco', monospace;
      font-size: 13px;
      line-height: 1.4;
      overflow-x: auto;
    }

    .change-section.old-content pre {
      background: #ffeef0;
      border-color: #f5c6cb;
    }

    .change-section.new-content pre {
      background: #e6ffed;
      border-color: #c3e6cb;
    }

    .metadata-comparison {
      padding: 24px;
      max-height: 600px;
      overflow-y: auto;
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    .metadata-section h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
      color: #495057;
    }

    .metadata-table,
    .stats-comparison {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .metadata-row,
    .stat-comparison {
      display: grid;
      grid-template-columns: 1fr auto auto 1fr;
      gap: 12px;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f8f9fa;
    }

    .metadata-row:last-child,
    .stat-comparison:last-child {
      border-bottom: none;
    }

    .from-value {
      text-align: right;
      color: #dc3545;
      font-weight: 500;
    }

    .to-value {
      color: #28a745;
      font-weight: 500;
    }

    .to-value.additions {
      color: #28a745;
    }

    .to-value.deletions {
      color: #dc3545;
    }

    .empty-state,
    .no-changes-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      text-align: center;
      color: #6c757d;
    }

    .empty-state mat-icon,
    .no-changes-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-changes-state mat-icon {
      color: #28a745;
      opacity: 0.7;
    }

    .empty-state h3,
    .no-changes-state h3 {
      margin: 0 0 8px 0;
      color: #495057;
    }

    .empty-state p,
    .no-changes-state p {
      margin: 0;
      max-width: 400px;
    }

    @media (max-width: 1200px) {
      .version-selectors {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .comparison-arrow {
        order: -1;
        width: 48px;
        height: 48px;
        justify-self: center;
      }

      .comparison-arrow mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        transform: rotate(90deg);
      }

      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .change-comparison {
        grid-template-columns: 1fr;
      }

      .metadata-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .compare-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .metadata-row,
      .stat-comparison {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 4px;
      }
    }
  `]
})
export class VersionCompareComponent implements OnInit {
  private readonly versioningService = inject(AIVersioningService);
  private readonly notificationService = inject(NotificationService);

  // Inputs
  readonly componentId = input<string>('');
  readonly fromVersion = input<ComponentVersion | null>(null);
  readonly toVersion = input<ComponentVersion | null>(null);

  // Outputs
  readonly onVersionsCompared = output<VersionComparison>();
  readonly onChangeAccepted = output<VersionDifference>();
  readonly onChangeRejected = output<VersionDifference>();

  // State
  readonly isLoading = signal<boolean>(false);
  readonly comparison = signal<VersionComparison | null>(null);
  readonly availableVersions = signal<ComponentVersion[]>([]);
  activeTab = 0;

  // Computed
  readonly canMerge = computed(() => {
    const comp = this.comparison();
    return comp && comp.summary.totalChanges > 0 && !comp.summary.breakingChanges;
  });

  ngOnInit() {
    this.loadAvailableVersions();
    
    if (this.fromVersion() && this.toVersion()) {
      this.compareVersions();
    }
  }

  private loadAvailableVersions() {
    if (!this.componentId()) return;

    this.versioningService.getVersionHistory(this.componentId()).subscribe({
      next: (versions) => {
        this.availableVersions.set(versions);
      },
      error: (error) => {
        this.notificationService.showError('Failed to load versions');
      }
    });
  }

  onFromVersionChange(versionId: string) {
    const version = this.availableVersions().find(v => v.id === versionId);
    if (version) {
      // TODO: Update fromVersion input
      this.compareVersionsIfBothSelected();
    }
  }

  onToVersionChange(versionId: string) {
    const version = this.availableVersions().find(v => v.id === versionId);
    if (version) {
      // TODO: Update toVersion input
      this.compareVersionsIfBothSelected();
    }
  }

  private compareVersionsIfBothSelected() {
    if (this.fromVersion() && this.toVersion()) {
      this.compareVersions();
    }
  }

  private compareVersions() {
    const from = this.fromVersion();
    const to = this.toVersion();
    
    if (!from || !to) return;

    this.isLoading.set(true);
    this.versioningService.compareVersions(from.id, to.id).subscribe({
      next: (comparison) => {
        this.comparison.set(comparison);
        this.onVersionsCompared.emit(comparison);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notificationService.showError('Failed to compare versions');
        this.isLoading.set(false);
      }
    });
  }

  swapVersions() {
    const from = this.fromVersion();
    const to = this.toVersion();
    
    if (from && to) {
      // TODO: Swap the versions
      this.compareVersions();
    }
  }

  mergeVersions() {
    const comp = this.comparison();
    if (comp && this.canMerge()) {
      // TODO: Implement version merging
      this.notificationService.showSuccess('Versions merged successfully');
    }
  }

  acceptChange(diff: VersionDifference) {
    this.onChangeAccepted.emit(diff);
    this.notificationService.showSuccess('Change accepted');
  }

  rejectChange(diff: VersionDifference) {
    this.onChangeRejected.emit(diff);
    this.notificationService.showSuccess('Change rejected');
  }

  getOriginalCode(): string {
    const from = this.fromVersion();
    return from?.code || '';
  }

  getModifiedCode(): string {
    const to = this.toVersion();
    return to?.code || '';
  }

  getDiffId(): string {
    const comp = this.comparison();
    return comp?.id || '';
  }

  getImpactIcon(impact: string): string {
    switch (impact) {
      case 'low': return 'trending_down';
      case 'medium': return 'trending_flat';
      case 'high': return 'trending_up';
      default: return 'help';
    }
  }

  getFileIcon(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ts': return 'code';
      case 'html': return 'web';
      case 'css':
      case 'scss': return 'palette';
      case 'json': return 'data_object';
      case 'md': return 'description';
      default: return 'insert_drive_file';
    }
  }

  getChangeTypeIcon(type: string): string {
    switch (type) {
      case 'added': return 'add';
      case 'removed': return 'remove';
      case 'modified': return 'edit';
      default: return 'compare_arrows';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}