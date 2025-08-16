import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { CodeDisplayComponent } from '@app/components/shared/code-display/code-display.component';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showDiff?: boolean;
  originalCode?: string;
  modifiedCode?: string;
  warning?: string;
  details?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatDividerModule,
    CodeDisplayComponent
  ],
  template: `
    <div class="confirm-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon class="header-icon" *ngIf="data.warning">warning</mat-icon>
          <mat-icon class="header-icon" *ngIf="!data.warning">help</mat-icon>
          {{ data.title }}
        </h2>
      </div>

      <!-- Content -->
      <mat-dialog-content class="dialog-content">
        <div class="message-section">
          <p class="message-text">{{ data.message }}</p>
          
          <div class="warning-banner" *ngIf="data.warning">
            <mat-icon>warning</mat-icon>
            <span>{{ data.warning }}</span>
          </div>
          
          <div class="details-section" *ngIf="data.details">
            <p class="details-text">{{ data.details }}</p>
          </div>
        </div>

        <!-- Code Diff Section -->
        <div class="diff-section" *ngIf="data.showDiff && data.originalCode && data.modifiedCode">
          <mat-divider></mat-divider>
          
          <div class="diff-header">
            <h4>Code Changes</h4>
            <p>Review the modifications made to the AI-generated solution:</p>
          </div>
          
          <mat-tab-group class="diff-tabs" animationDuration="300ms">
            <!-- Diff View Tab -->
            <mat-tab label="Diff View">
              <div class="diff-content">
                <div class="diff-panel">
                  <div class="diff-original">
                    <h5>Original AI Solution</h5>
                    <app-code-display
                      [code]="data.originalCode"
                      [language]="'typescript'"
                      [showLineNumbers]="true"
                      [theme]="'light'">
                    </app-code-display>
                  </div>
                  
                  <div class="diff-modified">
                    <h5>Modified Solution</h5>
                    <app-code-display
                      [code]="data.modifiedCode"
                      [language]="'typescript'"
                      [showLineNumbers]="true"
                      [theme]="'light'">
                    </app-code-display>
                  </div>
                </div>
              </div>
            </mat-tab>
            
            <!-- Side by Side Tab -->
            <mat-tab label="Side by Side">
              <div class="side-by-side-content">
                <div class="code-panel original-panel">
                  <div class="panel-header">
                    <mat-icon class="panel-icon">code</mat-icon>
                    <span>Original AI Solution</span>
                  </div>
                  <app-code-display
                    [code]="data.originalCode"
                    [language]="'typescript'"
                    [showLineNumbers]="true"
                    [theme]="'light'">
                  </app-code-display>
                </div>
                
                <div class="code-panel modified-panel">
                  <div class="panel-header">
                    <mat-icon class="panel-icon">edit</mat-icon>
                    <span>Modified Solution</span>
                  </div>
                  <app-code-display
                    [code]="data.modifiedCode"
                    [language]="'typescript'"
                    [showLineNumbers]="true"
                    [theme]="'light'">
                  </app-code-display>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </mat-dialog-content>

      <!-- Actions -->
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button 
                (click)="onCancel()" 
                class="cancel-button">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onConfirm()"
                class="confirm-button">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      display: flex;
      flex-direction: column;
      min-height: 400px;
      max-height: 80vh;
      width: 100%;
      max-width: 800px;
    }

    .dialog-header {
      padding: 20px 24px 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .header-icon {
      color: #ff9800;
      margin-right: 12px;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .header-icon:not(.warning) {
      color: #2196f3;
    }

    .dialog-content {
      flex: 1;
      padding: 0;
      overflow-y: auto;
    }

    .message-section {
      padding: 20px 24px;
    }

    .message-text {
      color: #333;
      font-size: 1rem;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }

    .warning-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #fff3e0;
      border: 1px solid #ffcc02;
      border-radius: 6px;
      color: #ef6c00;
      font-weight: 500;
    }

    .warning-banner mat-icon {
      color: #ff9800;
    }

    .details-section {
      margin-top: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }

    .details-text {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0;
    }

    .diff-section {
      padding: 0 24px 20px;
    }

    .diff-header {
      margin: 20px 0 16px 0;
    }

    .diff-header h4 {
      color: #333;
      font-size: 1.2rem;
      margin: 0 0 8px 0;
    }

    .diff-header p {
      color: #666;
      font-size: 0.9rem;
      margin: 0;
    }

    .diff-tabs {
      margin-top: 16px;
    }

    .diff-content {
      padding: 16px 0;
    }

    .diff-panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      max-height: 400px;
      overflow-y: auto;
    }

    .diff-original,
    .diff-modified {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
    }

    .diff-original h5,
    .diff-modified h5 {
      margin: 0;
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
      font-size: 1rem;
      color: #333;
    }

    .diff-original h5 {
      color: #d32f2f;
    }

    .diff-modified h5 {
      color: #388e3c;
    }

    .side-by-side-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      max-height: 400px;
      overflow-y: auto;
    }

    .code-panel {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
      font-weight: 500;
      color: #333;
    }

    .panel-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .original-panel .panel-icon {
      color: #d32f2f;
    }

    .modified-panel .panel-icon {
      color: #388e3c;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .cancel-button {
      color: #666;
    }

    .confirm-button {
      background: #2196f3;
      color: white;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .confirm-dialog {
        max-width: 95vw;
        max-height: 95vh;
      }

      .dialog-header {
        padding: 16px 20px 12px;
      }

      .message-section {
        padding: 16px 20px;
      }

      .diff-section {
        padding: 0 20px 16px;
      }

      .diff-panel,
      .side-by-side-content {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .dialog-actions {
        padding: 16px 20px;
        flex-direction: column;
        align-items: stretch;
      }

      .cancel-button,
      .confirm-button {
        width: 100%;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  protected readonly data = inject(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
