import { Component, OnInit, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';

import { AIVersioningService } from '@app/services/ai/ai-versioning.service';
import { ComponentVersion, VersionBranch } from '@app/models/ai.model';
import { NotificationService } from '@app/services/notification/notification.service';

interface VersionAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-version-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatChipsModule
  ],
  template: `
    <mat-toolbar class="version-toolbar">
      <!-- Version Info -->
      <div class="version-info">
        <div class="current-version">
          <mat-icon>history</mat-icon>
          <span class="version-label">Version:</span>
          @if (currentVersion()) {
            <span class="version-number">v{{ currentVersion()!.version }}</span>
            <mat-chip class="status-chip" [class]="'status-' + currentVersion()!.status">
              {{ currentVersion()!.status | titlecase }}
            </mat-chip>
          } @else {
            <span class="no-version">No version selected</span>
          }
        </div>
        
        @if (hasUnsavedChanges()) {
          <div class="unsaved-indicator">
            <mat-icon color="warn">edit</mat-icon>
            <span>Unsaved changes</span>
          </div>
        }
      </div>

      <!-- Branch Selector -->
      <div class="branch-section">
        <mat-form-field appearance="outline" class="branch-selector">
          <mat-label>Branch</mat-label>
          <mat-select [value]="selectedBranch()?.id" 
                      (selectionChange)="onBranchChange($event.value)"
                      [disabled]="isLoading()">
            @for (branch of branches(); track branch.id) {
              <mat-option [value]="branch.id">
                <div class="branch-option">
                  <mat-icon [class]="'branch-' + branch.type">
                    {{ getBranchIcon(branch.type) }}
                  </mat-icon>
                  <span class="branch-name">{{ branch.name }}</span>
                  @if (branch.isActive) {
                    <mat-chip class="active-chip">Active</mat-chip>
                  }
                </div>
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <button mat-icon-button 
                matTooltip="Create New Branch"
                [disabled]="isLoading()"
                (click)="createBranch()">
          <mat-icon>add</mat-icon>
        </button>

        <button mat-icon-button 
                matTooltip="Merge Branch"
                [disabled]="isLoading() || !canMerge()"
                (click)="mergeBranch()">
          <mat-icon>merge_type</mat-icon>
        </button>
      </div>

      <!-- Version Actions -->
      <div class="version-actions">
        <!-- Undo/Redo -->
        <div class="undo-redo-group">
          <button mat-icon-button 
                  [matTooltip]="'Undo (' + (undoStack().length) + ')'"
                  [disabled]="!canUndo()"
                  (click)="undo()">
            <mat-icon [matBadge]="undoStack().length" 
                      [matBadgeHidden]="undoStack().length === 0"
                      matBadgeSize="small"
                      matBadgeColor="primary">
              undo
            </mat-icon>
          </button>
          
          <button mat-icon-button 
                  [matTooltip]="'Redo (' + (redoStack().length) + ')'"
                  [disabled]="!canRedo()"
                  (click)="redo()">
            <mat-icon [matBadge]="redoStack().length" 
                      [matBadgeHidden]="redoStack().length === 0"
                      matBadgeSize="small"
                      matBadgeColor="primary">
              redo
            </mat-icon>
          </button>
        </div>

        <mat-divider vertical></mat-divider>

        <!-- Save Actions -->
        <div class="save-group">
          <button mat-stroked-button 
                  [disabled]="!hasUnsavedChanges() || isLoading()"
                  (click)="saveVersion()">
            <mat-icon>save</mat-icon>
            Save
          </button>
          
          <button mat-button 
                  [matMenuTriggerFor]="saveMenu"
                  [disabled]="isLoading()">
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
        </div>

        <mat-divider vertical></mat-divider>

        <!-- Version Actions -->
        <div class="action-group">
          <button mat-icon-button 
                  matTooltip="Compare Versions"
                  [disabled]="isLoading()"
                  (click)="compareVersions()">
            <mat-icon>compare_arrows</mat-icon>
          </button>
          
          <button mat-icon-button 
                  matTooltip="Version History"
                  [disabled]="isLoading()"
                  (click)="showHistory()">
            <mat-icon>history</mat-icon>
          </button>
          
          <button mat-icon-button 
                  matTooltip="Create Tag"
                  [disabled]="isLoading()"
                  (click)="createTag()">
            <mat-icon>local_offer</mat-icon>
          </button>
          
          <button mat-button 
                  [matMenuTriggerFor]="actionsMenu"
                  [disabled]="isLoading()">
            <mat-icon>more_vert</mat-icon>
          </button>
        </div>
      </div>

      <!-- Collaboration Info -->
      @if (collaborators().length > 0) {
        <div class="collaboration-section">
          <mat-divider vertical></mat-divider>
          
          <div class="collaborators">
            <mat-icon matTooltip="Active collaborators">people</mat-icon>
            <div class="collaborator-avatars">
              @for (collaborator of collaborators().slice(0, 3); track collaborator.id) {
                <div class="collaborator-avatar" 
                     [matTooltip]="collaborator.name + ' - ' + collaborator.status">
                  @if (collaborator.avatar) {
                    <img [src]="collaborator.avatar" [alt]="collaborator.name">
                  } @else {
                    <div class="avatar-placeholder">
                      {{ collaborator.name.charAt(0).toUpperCase() }}
                    </div>
                  }
                  <div class="status-indicator" [class]="'status-' + collaborator.status"></div>
                </div>
              }
              @if (collaborators().length > 3) {
                <div class="more-collaborators" 
                     [matTooltip]="'+' + (collaborators().length - 3) + ' more'">
                  +{{ collaborators().length - 3 }}
                </div>
              }
            </div>
          </div>
        </div>
      }
    </mat-toolbar>

    <!-- Save Menu -->
    <mat-menu #saveMenu="matMenu">
      <button mat-menu-item (click)="saveVersion()">
        <mat-icon>save</mat-icon>
        Save Version
      </button>
      <button mat-menu-item (click)="saveAsNew()">
        <mat-icon>save_as</mat-icon>
        Save as New Version
      </button>
      <button mat-menu-item (click)="autoSaveToggle()">
        <mat-icon>{{ autoSave() ? 'check_box' : 'check_box_outline_blank' }}</mat-icon>
        Auto-save
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="exportVersion()">
        <mat-icon>download</mat-icon>
        Export Version
      </button>
    </mat-menu>

    <!-- Actions Menu -->
    <mat-menu #actionsMenu="matMenu">
      <button mat-menu-item (click)="duplicateVersion()" [disabled]="!currentVersion()">
        <mat-icon>content_copy</mat-icon>
        Duplicate Version
      </button>
      <button mat-menu-item (click)="revertToVersion()" [disabled]="!currentVersion()">
        <mat-icon>restore</mat-icon>
        Revert to This Version
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="shareVersion()" [disabled]="!currentVersion()">
        <mat-icon>share</mat-icon>
        Share Version
      </button>
      <button mat-menu-item (click)="publishVersion()" [disabled]="!currentVersion()">
        <mat-icon>publish</mat-icon>
        Publish Version
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="deleteVersion()" [disabled]="!currentVersion()" class="danger">
        <mat-icon>delete</mat-icon>
        Delete Version
      </button>
    </mat-menu>
  `,
  styles: [`
    .version-toolbar {
      background: #ffffff;
      border-bottom: 1px solid #e9ecef;
      padding: 8px 16px;
      min-height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .version-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .current-version {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .version-label {
      font-weight: 500;
      color: #6c757d;
    }

    .version-number {
      font-weight: 600;
      color: #007bff;
      font-family: monospace;
    }

    .no-version {
      color: #6c757d;
      font-style: italic;
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

    .unsaved-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #dc3545;
      font-size: 14px;
    }

    .branch-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .branch-selector {
      min-width: 200px;
    }

    .branch-option {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .branch-name {
      flex: 1;
    }

    .active-chip {
      font-size: 10px;
      height: 18px;
      background-color: #28a745 !important;
      color: #ffffff !important;
    }

    .branch-main mat-icon {
      color: #007bff;
    }

    .branch-feature mat-icon {
      color: #28a745;
    }

    .branch-hotfix mat-icon {
      color: #dc3545;
    }

    .branch-release mat-icon {
      color: #ffc107;
    }

    .version-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .undo-redo-group,
    .save-group,
    .action-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .collaboration-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .collaborators {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .collaborator-avatars {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .collaborator-avatar {
      position: relative;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }

    .collaborator-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: #007bff;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }

    .status-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid #ffffff;
    }

    .status-indicator.status-online {
      background-color: #28a745;
    }

    .status-indicator.status-away {
      background-color: #ffc107;
    }

    .status-indicator.status-offline {
      background-color: #6c757d;
    }

    .more-collaborators {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
      color: #6c757d;
    }

    .danger {
      color: #dc3545 !important;
    }

    .danger mat-icon {
      color: #dc3545 !important;
    }

    mat-divider[vertical] {
      height: 32px;
      margin: 0 8px;
    }

    @media (max-width: 1200px) {
      .version-toolbar {
        flex-wrap: wrap;
        min-height: auto;
        padding: 12px 16px;
      }

      .collaboration-section {
        order: 1;
        width: 100%;
        justify-content: center;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #e9ecef;
      }
    }

    @media (max-width: 768px) {
      .version-toolbar {
        gap: 8px;
      }

      .branch-selector {
        min-width: 150px;
      }

      .version-actions {
        gap: 4px;
      }

      .undo-redo-group,
      .save-group,
      .action-group {
        gap: 2px;
      }
    }
  `]
})
export class VersionToolbarComponent implements OnInit {
  private readonly versioningService = inject(AIVersioningService);
  private readonly notificationService = inject(NotificationService);

  // Inputs
  readonly componentId = input<string>('');
  readonly currentVersion = input<ComponentVersion | null>(null);
  readonly hasUnsavedChanges = input<boolean>(false);

  // Outputs
  readonly onVersionChange = output<ComponentVersion>();
  readonly onBranchChange = output<VersionBranch>();
  readonly onSave = output<void>();
  readonly onUndo = output<void>();
  readonly onRedo = output<void>();
  readonly onCompare = output<void>();
  readonly onHistory = output<void>();

  // State
  readonly isLoading = signal<boolean>(false);
  readonly branches = signal<VersionBranch[]>([]);
  readonly selectedBranch = signal<VersionBranch | null>(null);
  readonly undoStack = signal<any[]>([]);
  readonly redoStack = signal<any[]>([]);
  readonly autoSave = signal<boolean>(true);
  readonly collaborators = signal<any[]>([]);

  // Computed
  readonly canUndo = computed(() => this.undoStack().length > 0);
  readonly canRedo = computed(() => this.redoStack().length > 0);
  readonly canMerge = computed(() => {
    const branch = this.selectedBranch();
    return branch && branch.type !== 'main' && branch.canMerge;
  });

  ngOnInit() {
    this.loadBranches();
    this.loadCollaborators();
    
    // Mock undo/redo stack
    this.undoStack.set([1, 2, 3]); // Mock data
    this.redoStack.set([1]); // Mock data
  }

  private loadBranches() {
    if (!this.componentId()) return;

    this.isLoading.set(true);
    this.versioningService.getBranches(this.componentId()).subscribe({
      next: (branches) => {
        this.branches.set(branches);
        const activeBranch = branches.find(b => b.isActive);
        if (activeBranch) {
          this.selectedBranch.set(activeBranch);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notificationService.showError('Failed to load branches');
        this.isLoading.set(false);
      }
    });
  }

  private loadCollaborators() {
    // Mock collaborators data
    this.collaborators.set([
      {
        id: '1',
        name: 'John Doe',
        avatar: null,
        status: 'online'
      },
      {
        id: '2',
        name: 'Jane Smith',
        avatar: null,
        status: 'away'
      },
      {
        id: '3',
        name: 'Bob Johnson',
        avatar: null,
        status: 'online'
      }
    ]);
  }

  handleBranchChange(branchId: string) {
    const branch = this.branches().find(b => b.id === branchId);
    if (branch) {
      this.selectedBranch.set(branch);
      this.onBranchChange.emit(branch);
    }
  }

  createBranch() {
    // TODO: Open create branch dialog
    this.notificationService.showInfo('Create branch dialog coming soon');
  }

  mergeBranch() {
    const branch = this.selectedBranch();
    if (branch && this.canMerge()) {
      // TODO: Open merge dialog
      this.notificationService.showInfo('Merge branch dialog coming soon');
    }
  }

  undo() {
    if (this.canUndo()) {
      this.onUndo.emit();
      // Update undo/redo stacks
      const undoStack = this.undoStack();
      const redoStack = this.redoStack();
      
      if (undoStack.length > 0) {
        const lastAction = undoStack[undoStack.length - 1];
        this.undoStack.set(undoStack.slice(0, -1));
        this.redoStack.set([...redoStack, lastAction]);
      }
    }
  }

  redo() {
    if (this.canRedo()) {
      this.onRedo.emit();
      // Update undo/redo stacks
      const undoStack = this.undoStack();
      const redoStack = this.redoStack();
      
      if (redoStack.length > 0) {
        const lastAction = redoStack[redoStack.length - 1];
        this.redoStack.set(redoStack.slice(0, -1));
        this.undoStack.set([...undoStack, lastAction]);
      }
    }
  }

  saveVersion() {
    this.onSave.emit();
    this.notificationService.showSuccess('Version saved successfully');
  }

  saveAsNew() {
    // TODO: Open save as new dialog
    this.notificationService.showInfo('Save as new version dialog coming soon');
  }

  autoSaveToggle() {
    this.autoSave.update(enabled => !enabled);
    const message = this.autoSave() ? 'Auto-save enabled' : 'Auto-save disabled';
    this.notificationService.showInfo(message);
  }

  exportVersion() {
    const version = this.currentVersion();
    if (version) {
      // TODO: Implement version export
      this.notificationService.showSuccess('Version export started');
    }
  }

  compareVersions() {
    this.onCompare.emit();
  }

  showHistory() {
    this.onHistory.emit();
  }

  createTag() {
    // TODO: Open create tag dialog
    this.notificationService.showInfo('Create tag dialog coming soon');
  }

  duplicateVersion() {
    const version = this.currentVersion();
    if (version) {
      // TODO: Implement version duplication
      this.notificationService.showSuccess('Version duplicated');
    }
  }

  revertToVersion() {
    const version = this.currentVersion();
    if (version) {
      // TODO: Show confirmation dialog
      this.notificationService.showInfo('Revert confirmation dialog coming soon');
    }
  }

  shareVersion() {
    const version = this.currentVersion();
    if (version) {
      // TODO: Open share dialog
      this.notificationService.showInfo('Share version dialog coming soon');
    }
  }

  publishVersion() {
    const version = this.currentVersion();
    if (version) {
      // TODO: Implement version publishing
      this.notificationService.showSuccess('Version published');
    }
  }

  deleteVersion() {
    const version = this.currentVersion();
    if (version) {
      // TODO: Show confirmation dialog
      this.notificationService.showInfo('Delete confirmation dialog coming soon');
    }
  }

  getBranchIcon(type: string): string {
    switch (type) {
      case 'main': return 'account_tree';
      case 'feature': return 'new_releases';
      case 'hotfix': return 'build';
      case 'release': return 'local_offer';
      default: return 'account_tree';
    }
  }
}