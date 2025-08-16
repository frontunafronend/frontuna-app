import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { CodeDisplayComponent } from '@app/components/shared/code-display/code-display.component';
import { EditorBuffers } from '@app/services/editor-state.service';

export interface DiffData {
  before: EditorBuffers;
  after: Partial<EditorBuffers>;
  changes: Array<{
    type: keyof EditorBuffers;
    before: string;
    after: string;
    hasChanges: boolean;
  }>;
  hasAnyChanges: boolean;
  changedTypes: Array<keyof EditorBuffers>;
}

export interface DiffApplyEvent {
  applyAll: boolean;
  selectedChanges: Array<keyof EditorBuffers>;
}

@Component({
  selector: 'app-ai-diff-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressBarModule,
    MatCheckboxModule,
    CodeDisplayComponent
  ],
  template: `
    <div class="diff-viewer-container">
      <!-- Header -->
      <div class="diff-header">
        <div class="header-left">
          <h2>
            <mat-icon>compare_arrows</mat-icon>
            Code Changes Review
          </h2>
          <p>Review the AI-generated changes before applying them to your code</p>
        </div>
        <div class="header-right">
          <!-- View Mode Toggle -->
          <div class="view-toggle">
            <button mat-icon-button 
                    [class.active]="viewMode() === 'side-by-side'"
                    (click)="setViewMode('side-by-side')"
                    matTooltip="Side-by-side view">
              <mat-icon>view_column</mat-icon>
            </button>
            <button mat-icon-button 
                    [class.active]="viewMode() === 'inline'"
                    (click)="setViewMode('inline')"
                    matTooltip="Inline view">
              <mat-icon>view_agenda</mat-icon>
            </button>
        </div>
        
          <button mat-icon-button 
                  (click)="onCancel()"
                  matTooltip="Cancel">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Summary -->
      <div class="diff-summary">
        <div class="summary-stats">
          <div class="stat-item">
            <mat-icon class="stat-icon">edit</mat-icon>
            <span class="stat-value">{{ diffData().changedTypes.length }}</span>
            <span class="stat-label">Files Changed</span>
          </div>
          <div class="stat-item">
            <mat-icon class="stat-icon" [class.success]="hasSelectedChanges()">check_circle</mat-icon>
            <span class="stat-value">{{ selectedChanges().length }}</span>
            <span class="stat-label">Selected</span>
          </div>
        </div>
        
        <div class="summary-actions">
          <button mat-button 
                  (click)="selectAll()"
                  [disabled]="!diffData().hasAnyChanges">
            <mat-icon>select_all</mat-icon>
            Select All
          </button>
          <button mat-button 
                  (click)="selectNone()"
                  [disabled]="selectedChanges().length === 0">
            <mat-icon>deselect</mat-icon>
            Select None
          </button>
        </div>
      </div>

      <!-- Diff Tabs -->
      <mat-tab-group class="diff-tabs" 
                     [(selectedIndex)]="activeTab"
                     (selectedIndexChange)="onTabChange($event)">
        
        <mat-tab *ngFor="let change of diffData().changes; trackBy: trackChange" 
                 [label]="getTabLabel(change.type)"
                 [disabled]="!change.hasChanges">
          
          <div class="diff-content" *ngIf="change.hasChanges">
            <!-- Change Header -->
            <div class="change-header">
              <div class="change-info">
                <mat-icon class="file-icon">{{ getFileIcon(change.type) }}</mat-icon>
                <h3>{{ getFileName(change.type) }}</h3>
                <mat-chip class="change-chip" 
                          [class.added]="!change.before"
                          [class.modified]="change.before && change.after">
                  {{ !change.before ? 'Added' : 'Modified' }}
            </mat-chip>
        </div>
              
              <div class="change-actions">
                <mat-checkbox 
                  [checked]="isChangeSelected(change.type)"
                  (change)="toggleChange(change.type, $event)"
                  color="primary">
                  Apply this change
                </mat-checkbox>
                
                <button mat-button 
                        (click)="copyUpdatedCode(change.after)"
                        matTooltip="Copy updated code to clipboard">
                  <mat-icon>content_copy</mat-icon>
                  Copy Updated Code
                </button>
              </div>
        </div>

            <!-- Side-by-side Diff -->
            <div class="diff-panels" 
                 [class.side-by-side]="viewMode() === 'side-by-side'"
                 [class.inline]="viewMode() === 'inline'">
              
              <!-- Side-by-side View -->
              <ng-container *ngIf="viewMode() === 'side-by-side'">
                <!-- Before Panel -->
                <div class="diff-panel before-panel">
                  <div class="panel-header">
                    <h4>
                    <mat-icon>history</mat-icon>
                      Before
                    </h4>
                    <span class="line-count">{{ getLineCount(change.before) }} lines</span>
                  </div>
                  <div class="panel-content">
                    <app-code-display
                      [code]="change.before || '// No existing code'"
                      [language]="getLanguageForType(change.type)"
                      [showLineNumbers]="true">
                    </app-code-display>
                  </div>
                </div>
                
                <!-- After Panel -->
                <div class="diff-panel after-panel">
                  <div class="panel-header">
                    <h4>
                      <mat-icon>auto_fix_high</mat-icon>
                      After (AI Generated)
                    </h4>
                    <span class="line-count">{{ getLineCount(change.after) }} lines</span>
                  </div>
                  <div class="panel-content">
                    <app-code-display
                      [code]="change.after"
                      [language]="getLanguageForType(change.type)"
                      [showLineNumbers]="true">
                    </app-code-display>
                  </div>
                </div>
              </ng-container>

              <!-- Inline View -->
              <ng-container *ngIf="viewMode() === 'inline'">
                <div class="inline-diff">
                  <!-- Before Section -->
                  <div class="inline-section before-section">
                    <div class="inline-header">
                      <h4>
                        <mat-icon>remove</mat-icon>
                        Before ({{ getLineCount(change.before) }} lines)
                      </h4>
                    </div>
                    <div class="inline-content removed">
                      <app-code-display
                        [code]="change.before || '// No existing code'"
                        [language]="getLanguageForType(change.type)"
                        [showLineNumbers]="true">
                      </app-code-display>
                </div>
              </div>

                  <!-- After Section -->
                  <div class="inline-section after-section">
                    <div class="inline-header">
                      <h4>
                        <mat-icon>add</mat-icon>
                        After ({{ getLineCount(change.after) }} lines)
                      </h4>
                      </div>
                    <div class="inline-content added">
                      <app-code-display
                        [code]="change.after"
                        [language]="getLanguageForType(change.type)"
                        [showLineNumbers]="true">
                      </app-code-display>
                    </div>
                  </div>
                </div>
              </ng-container>
                    </div>
                    
            <!-- Change Statistics -->
            <div class="change-stats">
              <div class="stat-item additions">
                <mat-icon>add</mat-icon>
                <span>+{{ getAdditions(change.before, change.after) }} additions</span>
                        </div>
              <div class="stat-item deletions">
                <mat-icon>remove</mat-icon>
                <span>-{{ getDeletions(change.before, change.after) }} deletions</span>
                      </div>
                    </div>
                  </div>

          <!-- No Changes Message -->
          <div class="no-changes" *ngIf="!change.hasChanges">
            <mat-icon>check_circle</mat-icon>
            <h3>No Changes</h3>
            <p>This file has no modifications</p>
              </div>
            </mat-tab>
          </mat-tab-group>

      <!-- Actions Footer -->
      <div class="diff-footer">
        <div class="footer-left">
          <button mat-button 
                  (click)="onCancel()"
                  class="cancel-button">
            <mat-icon>cancel</mat-icon>
            Cancel
          </button>
        </div>
        
        <div class="footer-right">
          <!-- Quick Actions -->
          <div class="quick-actions">
            <button mat-button 
                    color="primary"
                    (click)="onQuickApply()"
                    [disabled]="!hasSelectedChanges()"
                    matTooltip="Apply immediately without confirmation">
              <mat-icon>flash_on</mat-icon>
              Quick Apply
            </button>
            
            <button mat-button 
                    color="warn"
                    (click)="onRollback()"
                    matTooltip="Undo to previous code state">
              <mat-icon>undo</mat-icon>
              Rollback
            </button>
          </div>
          
          <!-- Main Actions -->
          <div class="main-actions">
            <button mat-raised-button 
                    color="primary"
                    (click)="onApplySelected()"
                    [disabled]="!hasSelectedChanges()"
                    class="apply-button">
              <mat-icon>check</mat-icon>
              Apply Selected ({{ selectedChanges().length }})
            </button>
            
            <button mat-raised-button 
                    color="accent"
                    (click)="onApplyAll()"
                    [disabled]="!diffData().hasAnyChanges"
                    class="apply-all-button">
              <mat-icon>done_all</mat-icon>
              Apply All
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./ai-diff-viewer.component.scss']
})
export class AIDiffViewerComponent {
  @Input() diffData = signal<DiffData>({
    before: { typescript: '', html: '', scss: '' },
    after: {},
    changes: [],
    hasAnyChanges: false,
    changedTypes: []
  });

  @Output() applyChanges = new EventEmitter<DiffApplyEvent>();
  @Output() cancel = new EventEmitter<void>();

  // Component state
  activeTab = 0;
  readonly selectedChanges = signal<Array<keyof EditorBuffers>>([]);
  readonly viewMode = signal<'side-by-side' | 'inline'>('side-by-side');

  // Computed values
  readonly hasSelectedChanges = computed(() => this.selectedChanges().length > 0);

  constructor() {
    // Auto-select all changes by default
    this.selectAll();
  }

  // Event handlers
  onTabChange(index: number) {
    this.activeTab = index;
  }

  onApplySelected() {
    this.applyChanges.emit({
      applyAll: false,
      selectedChanges: this.selectedChanges()
    });
  }

  onApplyAll() {
    this.applyChanges.emit({
      applyAll: true,
      selectedChanges: this.diffData().changedTypes
    });
  }

  onQuickApply() {
    // Quick apply without confirmation
    this.applyChanges.emit({
      applyAll: false,
      selectedChanges: this.selectedChanges()
    });
  }

  onRollback() {
    // Emit rollback event - parent component will handle the actual rollback
    this.cancel.emit();
    // Could emit a specific rollback event if needed
  }

  onCancel() {
    this.cancel.emit();
  }

  // View mode methods
  setViewMode(mode: 'side-by-side' | 'inline') {
    this.viewMode.set(mode);
  }

  // Copy functionality
  async copyUpdatedCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      // Could add a toast notification here
      console.log('Code copied to clipboard');
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  // Selection methods
  selectAll() {
    this.selectedChanges.set([...this.diffData().changedTypes]);
  }

  selectNone() {
    this.selectedChanges.set([]);
  }

  toggleChange(type: keyof EditorBuffers, event: any) {
    const selected = event.checked;
    const current = this.selectedChanges();
    if (selected) {
      if (!current.includes(type)) {
        this.selectedChanges.set([...current, type]);
      }
    } else {
      this.selectedChanges.set(current.filter(t => t !== type));
    }
  }

  isChangeSelected(type: keyof EditorBuffers): boolean {
    return this.selectedChanges().includes(type);
  }

  // Utility methods
  trackChange(index: number, change: any): string {
    return change.type;
  }

  getTabLabel(type: keyof EditorBuffers): string {
    const labels = {
      typescript: 'TypeScript',
      html: 'HTML',
      scss: 'SCSS'
    };
    return labels[type];
  }

  getFileName(type: keyof EditorBuffers): string {
    const names = {
      typescript: 'component.ts',
      html: 'component.html',
      scss: 'component.scss'
    };
    return names[type];
  }

  getFileIcon(type: keyof EditorBuffers): string {
    const icons = {
      typescript: 'code',
      html: 'html',
      scss: 'style'
    };
    return icons[type];
  }

  getLanguageForType(type: keyof EditorBuffers): string {
    const languages = {
      typescript: 'typescript',
      html: 'html',
      scss: 'scss'
    };
    return languages[type];
  }

  getLineCount(code: string): number {
    return code ? code.split('\n').length : 0;
  }

  getAdditions(before: string, after: string): number {
    const beforeLines = before ? before.split('\n') : [];
    const afterLines = after ? after.split('\n') : [];
    
    // Simple addition count (lines in after but not in before)
    return Math.max(0, afterLines.length - beforeLines.length);
  }

  getDeletions(before: string, after: string): number {
    const beforeLines = before ? before.split('\n') : [];
    const afterLines = after ? after.split('\n') : [];
    
    // Simple deletion count (lines in before but not in after)
    return Math.max(0, beforeLines.length - afterLines.length);
  }
}