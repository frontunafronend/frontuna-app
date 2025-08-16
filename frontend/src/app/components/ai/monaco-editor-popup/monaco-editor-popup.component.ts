import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SafePipe } from '@app/pipes/safe.pipe';

export interface MonacoEditorPopupData {
  typescriptCode: string;
  htmlCode: string;
  scssCode: string;
  title?: string;
}

@Component({
  selector: 'app-monaco-editor-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule,
    SafePipe
  ],
  template: `
    <div class="monaco-editor-popup">
      <!-- Header -->
      <div class="popup-header">
        <div class="header-content">
          <h2>
            <mat-icon>code</mat-icon>
            {{ data.title || 'Code Editor' }}
          </h2>
          <div class="header-actions">
            <button mat-icon-button matTooltip="Run Code" (click)="runCode()">
              <mat-icon>play_arrow</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Format Code" (click)="formatCode()">
              <mat-icon>format_indent_increase</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Save Code" (click)="saveCode()">
              <mat-icon>save</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Close" (click)="close()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="popup-content">
        <div class="editor-section">
          <!-- Code Editor Tabs -->
          <mat-tab-group class="code-tabs" (selectedTabChange)="onTabChange($event)">
            <mat-tab label="TypeScript">
              <div class="tab-content">
                <mat-form-field class="full-width">
                  <textarea 
                    matInput 
                    [value]="typescriptCode" 
                    (input)="onTypeScriptChange($event)"
                    placeholder="TypeScript code here..."
                    rows="15"
                    class="code-textarea">
                  </textarea>
                </mat-form-field>
              </div>
            </mat-tab>
            
            <mat-tab label="HTML">
              <div class="tab-content">
                <mat-form-field class="full-width">
                  <textarea 
                    matInput 
                    [value]="htmlCode" 
                    (input)="onHtmlChange($event)"
                    placeholder="HTML code here..."
                    rows="15"
                    class="code-textarea">
                  </textarea>
                </mat-form-field>
              </div>
            </mat-tab>
            
            <mat-tab label="SCSS">
              <div class="tab-content">
                <mat-form-field class="full-width">
                  <textarea 
                    matInput 
                    [value]="scssCode" 
                    (input)="onScssChange($event)"
                    placeholder="SCSS code here..."
                    rows="15"
                    class="code-textarea">
                  </textarea>
                </mat-form-field>
              </div>
            </mat-tab>
          </mat-tab-group>

          <!-- Editor Status Bar -->
          <div class="editor-status-bar">
            <div class="status-item">
              <mat-icon>error_outline</mat-icon>
              <span>{{ errorCount() }} errors</span>
            </div>
            <div class="status-item">
              <mat-icon>code</mat-icon>
              <span>Ln {{ currentLine() }}, Col {{ currentColumn() }}</span>
            </div>
            <div class="status-item">
              <mat-icon>language</mat-icon>
              <span>TypeScript</span>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="preview-section">
          <div class="preview-header">
            <h3>
              <mat-icon>preview</mat-icon>
              Live Preview
            </h3>
            <div class="preview-actions">
              <button mat-button (click)="refreshPreview()" [disabled]="isPreviewLoading()">
                <mat-icon>refresh</mat-icon>
                Refresh
              </button>
            </div>
          </div>
          
          <div class="preview-content">
            <div *ngIf="isPreviewLoading()" class="preview-loading">
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
              <p>Loading preview...</p>
            </div>
            
            <div *ngIf="!isPreviewLoading() && !previewError()" class="preview-frame-container">
              <iframe 
                #previewFrame
                [src]="previewUrl() | safe:'resourceUrl'"
                class="preview-frame"
                sandbox="allow-scripts allow-same-origin"
                (load)="onPreviewLoad()">
              </iframe>
            </div>
            
            <div *ngIf="previewError()" class="preview-error">
              <mat-icon>error</mat-icon>
              <p>{{ previewError() }}</p>
              <button mat-button (click)="refreshPreview()">Try Again</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="popup-footer">
        <div class="footer-actions">
          <button mat-button (click)="close()">
            <mat-icon>close</mat-icon>
            Cancel
          </button>
          <button mat-raised-button color="primary" (click)="saveAndClose()">
            <mat-icon>save</mat-icon>
            Save & Close
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./monaco-editor-popup.component.scss']
})
export class MonacoEditorPopupComponent implements OnInit, OnDestroy {
  @Output() codeSaved = new EventEmitter<{typescript: string, html: string, scss: string}>();

  // Code buffers
  typescriptCode = '';
  htmlCode = '';
  scssCode = '';

  // Editor state
  readonly errorCount = signal<number>(0);
  readonly currentLine = signal<number>(1);
  readonly currentColumn = signal<number>(1);
  
  // Preview state
  readonly isPreviewLoading = signal<boolean>(false);
  readonly previewError = signal<string | null>(null);
  readonly previewUrl = signal<string>('');

  private previewRefreshTimeout: any;

  constructor(
    private dialogRef: MatDialogRef<MonacoEditorPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MonacoEditorPopupData
  ) {}

  ngOnInit() {
    this.typescriptCode = this.data.typescriptCode || '';
    this.htmlCode = this.data.htmlCode || '';
    this.scssCode = this.data.scssCode || '';
    
    // Generate initial preview
    this.generatePreview();
    
    // Setup auto-refresh
    this.setupAutoRefresh();
  }

  ngOnDestroy() {
    if (this.previewRefreshTimeout) {
      clearTimeout(this.previewRefreshTimeout);
    }
  }

  onTabChange(event: any) {
    // Handle tab change if needed
    console.log('Tab changed to:', event.index);
  }

  onTypeScriptChange(event: any) {
    const code = (event.target as HTMLTextAreaElement).value;
    this.typescriptCode = code;
    this.updatePreview();
  }

  onHtmlChange(event: any) {
    const code = (event.target as HTMLTextAreaElement).value;
    this.htmlCode = code;
    this.updatePreview();
  }

  onScssChange(event: any) {
    const code = (event.target as HTMLTextAreaElement).value;
    this.scssCode = code;
    this.updatePreview();
  }

  runCode() {
    this.generatePreview();
  }

  formatCode() {
    // Format TypeScript code
    try {
      // Basic formatting - in production, use a proper formatter
      this.typescriptCode = this.typescriptCode
        .replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, ' {\n  ')
        .replace(/\s*}\s*/g, '\n}\n');
      
      this.htmlCode = this.htmlCode
        .replace(/>\s*</g, '>\n<')
        .replace(/\s+/g, ' ');
      
      this.scssCode = this.scssCode
        .replace(/\s*{\s*/g, ' {\n  ')
        .replace(/\s*}\s*/g, '\n}\n');
        
      this.updatePreview();
    } catch (error) {
      console.error('Error formatting code:', error);
    }
  }

  saveCode() {
    this.codeSaved.emit({
      typescript: this.typescriptCode,
      html: this.htmlCode,
      scss: this.scssCode
    });
  }

  saveAndClose() {
    this.saveCode();
    this.close();
  }

  close() {
    this.dialogRef.close();
  }

  refreshPreview() {
    this.generatePreview();
  }

  private generatePreview() {
    this.isPreviewLoading.set(true);
    this.previewError.set(null);

    try {
      // Create a complete HTML document with the code
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code Preview</title>
          <style>
            ${this.scssCode}
          </style>
        </head>
        <body>
          ${this.htmlCode}
          <script>
            try {
              ${this.typescriptCode}
            } catch (error) {
              console.error('Runtime error:', error);
              document.body.innerHTML += '<div style="color: red; padding: 10px; border: 1px solid red; margin: 10px;">Runtime Error: ' + error.message + '</div>';
            }
          </script>
        </body>
        </html>
      `;

      // Create blob URL for preview
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      this.previewUrl.set(url);
      
      // Clear loading after a short delay
      setTimeout(() => {
        this.isPreviewLoading.set(false);
      }, 500);

    } catch (error) {
      this.previewError.set(`Error generating preview: ${error}`);
      this.isPreviewLoading.set(false);
    }
  }

  private updatePreview() {
    // Debounce preview updates
    if (this.previewRefreshTimeout) {
      clearTimeout(this.previewRefreshTimeout);
    }
    
    this.previewRefreshTimeout = setTimeout(() => {
      this.generatePreview();
    }, 1000);
  }

  private setupAutoRefresh() {
    // Auto-refresh preview every 30 seconds
    setInterval(() => {
      if (!this.isPreviewLoading()) {
        this.generatePreview();
      }
    }, 30000);
  }

  onPreviewLoad() {
    // Preview iframe loaded successfully
    console.log('Preview loaded successfully');
  }
}
