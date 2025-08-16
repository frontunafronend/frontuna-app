import { Component, Input, Output, EventEmitter, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { CodeDisplayComponent } from '@app/components/shared/code-display/code-display.component';
import { EditorStateService } from '@app/services/editor-state.service';
import { AIResponse } from '@app/models/ai.model';

export interface CodeChangeEvent {
  type: 'typescript' | 'javascript' | 'html' | 'css';
  code: string;
}

@Component({
  selector: 'app-enhanced-ai-preview',
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    CodeDisplayComponent
  ],
  template: `
    <div class="enhanced-preview-container">
      <!-- Header -->
      <div class="preview-header">
        <div class="header-left">
          <h3>Live Preview</h3>
          <div class="preview-controls">
            <mat-checkbox 
              [(ngModel)]="autoRefresh" 
              (change)="onAutoRefreshChange()"
              color="primary">
              Auto-refresh
            </mat-checkbox>
            <button 
              mat-icon-button 
              (click)="refreshPreview()"
              [disabled]="isRefreshing"
              matTooltip="Refresh preview">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </div>
        <div class="header-right">
          <button 
            mat-button 
            color="primary"
            (click)="exportCode()"
            matTooltip="Export all code">
            <mat-icon>download</mat-icon>
            Export
          </button>
        </div>
      </div>

      <!-- Code Editor Tabs -->
      <mat-tab-group 
        [(selectedIndex)]="activeTabIndex" 
        (selectedIndexChange)="onTabChange($event)"
        class="code-tabs">
        
        <!-- TypeScript/JavaScript Tab -->
        <mat-tab label="TypeScript/JS">
          <div class="tab-content">
            <div class="code-header">
              <mat-form-field appearance="outline" class="language-selector">
                <mat-label>Language</mat-label>
                <mat-select [(ngModel)]="selectedLanguage" (selectionChange)="onLanguageChange()">
                  <mat-option value="typescript">TypeScript</mat-option>
                  <mat-option value="javascript">JavaScript</mat-option>
                </mat-select>
              </mat-form-field>
              <div class="code-actions">
                <button 
                  mat-button 
                  color="accent"
                  (click)="formatCode()"
                  matTooltip="Format code">
                  <mat-icon>format_indent_increase</mat-icon>
                  Format
                </button>
                <button 
                  mat-button 
                  color="warn"
                  (click)="resetCode()"
                  matTooltip="Reset to original">
                  <mat-icon>restore</mat-icon>
                  Reset
                </button>
              </div>
            </div>
            <app-code-display
              [code]="currentCode()"
              [language]="selectedLanguage"
              [readonly]="false"
              (codeChange)="onCodeChange($event)">
            </app-code-display>
          </div>
        </mat-tab>

        <!-- HTML Tab -->
        <mat-tab label="HTML">
          <div class="tab-content">
            <div class="code-header">
              <div class="code-actions">
                <button 
                  mat-button 
                  color="accent"
                  (click)="formatCode()"
                  matTooltip="Format code">
                  <mat-icon>format_indent_increase</mat-icon>
                  Format
                </button>
                <button 
                  mat-button 
                  color="warn"
                  (click)="resetCode()"
                  matTooltip="Reset to original">
                  <mat-icon>restore</mat-icon>
                  Reset
                </button>
              </div>
            </div>
            <app-code-display
              [code]="htmlCode()"
              language="html"
              [readonly]="false"
              (codeChange)="onCodeChange($event)">
            </app-code-display>
          </div>
        </mat-tab>

        <!-- CSS Tab -->
        <mat-tab label="CSS">
          <div class="tab-content">
            <div class="code-header">
              <div class="code-actions">
                <button 
                  mat-button 
                  color="accent"
                  (click)="formatCode()"
                  matTooltip="Format code">
                  <mat-icon>format_indent_increase</mat-icon>
                  Format
                </button>
                <button 
                  mat-button 
                  color="warn"
                  (click)="resetCode()"
                  matTooltip="Reset to original">
                  <mat-icon>restore</mat-icon>
                  Reset
                </button>
              </div>
            </div>
            <app-code-display
              [code]="cssCode()"
              language="css"
              [readonly]="false"
              (codeChange)="onCodeChange($event)">
            </app-code-display>
          </div>
        </mat-tab>

        <!-- Preview Tab -->
        <mat-tab label="Preview">
          <div class="tab-content">
            <div class="preview-frame-container">
              <iframe 
                #previewFrame
                class="preview-frame"
                [src]="previewUrl()"
                (load)="onPreviewLoad()">
              </iframe>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Status Bar -->
      <div class="status-bar">
        <div class="status-left">
          <span class="status-item">
            <mat-icon class="status-icon">code</mat-icon>
            {{ selectedLanguage | titlecase }}
          </span>
          <span class="status-item">
            <mat-icon class="status-icon">schedule</mat-icon>
            Last updated: {{ lastUpdated() | date:'shortTime' }}
          </span>
        </div>
        <div class="status-right">
          <span class="status-item" [class.success]="previewStatus() === 'success'" [class.error]="previewStatus() === 'error'">
            <mat-icon class="status-icon">{{ previewStatus() === 'success' ? 'check_circle' : previewStatus() === 'error' ? 'error' : 'pending' }}</mat-icon>
            {{ previewStatus() | titlecase }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .enhanced-preview-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--surface-color, #ffffff);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: var(--primary-color, #1976d2);
      color: white;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header-left h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .preview-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .preview-controls mat-checkbox {
      color: white;
    }

    .preview-controls button {
      color: white;
    }

    .header-right button {
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .code-tabs {
      flex: 1;
      overflow: hidden;
    }

    .tab-content {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--surface-variant, #f5f5f5);
      border-bottom: 1px solid var(--outline, #e0e0e0);
    }

    .language-selector {
      width: 150px;
    }

    .code-actions {
      display: flex;
      gap: 8px;
    }

    .code-actions button {
      font-size: 12px;
      padding: 4px 12px;
      min-width: auto;
    }

    .preview-frame-container {
      flex: 1;
      padding: 16px;
      background: var(--surface-variant, #f5f5f5);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preview-frame {
      width: 100%;
      height: 100%;
      border: 1px solid var(--outline, #e0e0e0);
      border-radius: 4px;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: var(--surface-variant, #f5f5f5);
      border-top: 1px solid var(--outline, #e0e0e0);
      font-size: 12px;
      color: var(--on-surface-variant, #666);
    }

    .status-left, .status-right {
      display: flex;
      gap: 16px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .status-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .status-item.success {
      color: var(--success, #4caf50);
    }

    .status-item.error {
      color: var(--error, #f44336);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .preview-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .header-left {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .preview-controls {
        justify-content: center;
      }

      .header-right {
        display: flex;
        justify-content: center;
      }
    }
  `]
})
export class EnhancedAIPreviewComponent {
  @Input() aiResponse: AIResponse | null = null;
  @Output() codeChange = new EventEmitter<CodeChangeEvent>();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly editorState = inject(EditorStateService);

  // State
  activeTabIndex = 0;
  selectedLanguage: 'typescript' | 'javascript' = 'typescript';
  autoRefresh = true;
  isRefreshing = false;
  
  // Reactive signals
  readonly lastUpdated = signal<Date>(new Date());
  readonly previewStatus = signal<'loading' | 'success' | 'error'>('success');

  constructor() {
    // Auto-refresh when editor state changes
    effect(() => {
      const buffers = this.editorState.buffers();
      if (this.autoRefresh && this.editorState.hasCode()) {
        this.refreshPreview();
        this.lastUpdated.set(new Date());
      }
    });
  }

  // Computed values - now reactive to EditorStateService
  readonly currentCode = computed(() => {
    const buffers = this.editorState.buffers();
    const tsCode = buffers.typescript;
    
    if (!tsCode) {
      // Fallback to aiResponse if no editor code
      if (!this.aiResponse?.code) return '';
      return this.selectedLanguage === 'typescript' 
        ? this.aiResponse.code 
        : this.convertToJavaScript(this.aiResponse.code);
    }
    
    return this.selectedLanguage === 'typescript' 
      ? tsCode 
      : this.convertToJavaScript(tsCode);
  });

  readonly htmlCode = computed(() => {
    const buffers = this.editorState.buffers();
    const htmlCode = buffers.html;
    
    if (htmlCode) {
      return htmlCode;
    }
    
    // Fallback to generated HTML from TypeScript
    const tsCode = buffers.typescript || this.aiResponse?.code || '';
    return tsCode ? this.generateHTML(tsCode) : '';
  });

  readonly cssCode = computed(() => {
    const buffers = this.editorState.buffers();
    const scssCode = buffers.scss;
    
    if (scssCode) {
      // Convert SCSS to CSS (simplified)
      return this.convertSCSSToCSS(scssCode);
    }
    
    // Fallback to generated CSS from TypeScript
    const tsCode = buffers.typescript || this.aiResponse?.code || '';
    return tsCode ? this.generateCSS(tsCode) : '';
  });

  readonly previewUrl = computed(() => {
    const html = this.htmlCode();
    const css = this.cssCode();
    const js = this.currentCode();
    
    if (!html && !css && !js) return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>AI Generated Preview</title>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });



  // Lifecycle
  ngOnInit() {
    this.updateLastUpdated();
  }

  // Event handlers
  onTabChange(index: number) {
    this.activeTabIndex = index;
    if (index === 3 && this.autoRefresh) { // Preview tab
      this.refreshPreview();
    }
  }

  onLanguageChange() {
    this.updateLastUpdated();
    this.emitCodeChange();
  }

  onCodeChange(code: string) {
    this.updateLastUpdated();
    this.emitCodeChange();
  }

  onAutoRefreshChange() {
    if (this.autoRefresh && this.activeTabIndex === 3) {
      this.refreshPreview();
    }
  }

  onPreviewLoad() {
    this.previewStatus.set('success');
  }

  // Actions
  refreshPreview() {
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    this.previewStatus.set('loading');
    
    // Simulate refresh delay
    setTimeout(() => {
      this.isRefreshing = false;
      this.previewStatus.set('success');
      this.updateLastUpdated();
    }, 500);
  }

  formatCode() {
    // Basic code formatting logic
    const currentCode = this.currentCode();
    if (currentCode) {
      // Simple formatting - in a real app, you'd use a proper formatter
      const formatted = currentCode
        .replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, ' {\n  ')
        .replace(/\s*}\s*/g, '\n}\n')
        .replace(/\s*;\s*/g, ';\n  ');
      
      this.emitCodeChange();
    }
  }

  resetCode() {
    if (this.aiResponse) {
      this.updateLastUpdated();
      this.emitCodeChange();
    }
  }

  exportCode() {
    if (!this.aiResponse?.code) return;
    
    const codeData = {
      typescript: this.aiResponse.code,
      javascript: this.convertToJavaScript(this.aiResponse.code),
      html: this.htmlCode(),
      css: this.cssCode()
    };
    
    const blob = new Blob([JSON.stringify(codeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-generated-code.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Helper methods
  private updateLastUpdated() {
    this.lastUpdated.set(new Date());
  }

  private emitCodeChange() {
    if (!this.aiResponse) return;
    
    const event: CodeChangeEvent = {
      type: this.selectedLanguage,
      code: this.currentCode()
    };
    
    this.codeChange.emit(event);
  }

  private convertToJavaScript(typescriptCode: string): string {
    // Basic TypeScript to JavaScript conversion
    return typescriptCode
      .replace(/: [a-zA-Z<>[\]|&]+/g, '') // Remove type annotations
      .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove interfaces
      .replace(/type\s+\w+\s*=\s*[^;]+;/g, '') // Remove type aliases
      .replace(/import\s+{[^}]*}\s+from\s+['"][^'"]*['"];?/g, '') // Remove imports
      .replace(/export\s+/g, ''); // Remove exports
  }

  // New method to convert SCSS to CSS (simplified)
  private convertSCSSToCSS(scssCode: string): string {
    // This is a simplified SCSS to CSS converter
    // In a real implementation, you'd use a proper SCSS compiler
    return scssCode
      .replace(/\$[\w-]+:\s*[^;]+;/g, '') // Remove variables
      .replace(/&/g, '') // Remove parent selectors
      .replace(/@mixin\s+[\w-]+[^{]*{[^}]*}/g, '') // Remove mixins
      .replace(/@include\s+[\w-]+[^;]*;/g, ''); // Remove includes
  }



  private generateHTML(typescriptCode: string): string {
    // Extract HTML from TypeScript code or generate basic structure
    const htmlMatch = typescriptCode.match(/template\s*=\s*`([^`]*)`/);
    if (htmlMatch) {
      return htmlMatch[1];
    }
    
    // Generate basic HTML structure based on component type
    if (typescriptCode.includes('@Component')) {
      return `
        <div class="component-container">
          <h2>Generated Component</h2>
          <p>This is a dynamically generated component.</p>
        </div>
      `;
    }
    
    return '<div>No HTML template found</div>';
  }

  private generateCSS(typescriptCode: string): string {
    // Extract CSS from TypeScript code or generate basic styles
    const stylesMatch = typescriptCode.match(/styles\s*:\s*\[`([^`]*)`\]/);
    if (stylesMatch) {
      return stylesMatch[1];
    }
    
    // Generate basic CSS based on component type
    if (typescriptCode.includes('@Component')) {
      return `
        .component-container {
          padding: 20px;
          margin: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #ffffff;
        }
        
        .component-container h2 {
          color: #333;
          margin-bottom: 10px;
        }
        
        .component-container p {
          color: #666;
          line-height: 1.5;
        }
      `;
    }
    
    return '';
  }
}
