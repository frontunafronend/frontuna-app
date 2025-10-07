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
        class="code-tabs preview-only-tabs">
        
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

    // 🔧 HIDE TAB HEADERS - Show only preview content
    .preview-only-tabs {
      ::ng-deep .mat-mdc-tab-header {
        display: none !important; // Hide tab headers completely
      }
      
      ::ng-deep .mat-mdc-tab-body-wrapper {
        height: 100% !important;
        min-height: 800px !important; // 🔧 ENSURE 800px minimum height
      }
      
      ::ng-deep .mat-mdc-tab-body-content {
        height: 100% !important;
        min-height: 800px !important; // 🔧 ENSURE 800px minimum height
        overflow: visible !important; // Allow content to expand
      }
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
      align-items: stretch; // 🔧 CHANGED: stretch instead of center for full height
      justify-content: center;
      min-height: 800px; // 🔧 ENSURE 800px minimum height
    }

    .preview-frame {
      width: 100%;
      height: 100%;
      min-height: 800px; // 🔧 ENSURE 800px minimum height for iframe
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
  activeTabIndex = 3; // 🔧 DEFAULT TO PREVIEW TAB (index 3) instead of TypeScript (index 0)
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
    
    if (scssCode && scssCode.trim().length > 0) {
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
    
    // 🎯 PROCESS ANGULAR TEMPLATE TO RENDER ACTUAL DATA
    const processedHtml = this.processAngularTemplateNew(html, js);
    
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>AI Generated Preview</title>
          
          <!-- 🎨 MATERIAL DESIGN & BOOTSTRAP INTEGRATION -->
          
          <!-- Google Fonts for Material Design -->
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
          
          <!-- Bootstrap 5.3 CSS -->
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
          
          <!-- Angular Material Theme (Indigo-Pink) -->
          <link href="https://cdn.jsdelivr.net/npm/@angular/material@17/prebuilt-themes/indigo-pink.css" rel="stylesheet">
          
          <!-- Material Design Web Components -->
          <link href="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css" rel="stylesheet">
          
          <!-- Font Awesome Icons -->
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
          
          <!-- 🎯 ENHANCED BASE STYLES FOR COMPONENTS -->
          <style>
            /* Material Design Base */
            * {
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              margin: 0;
              padding: 20px;
              background: #fafafa;
              color: rgba(0, 0, 0, 0.87);
              line-height: 1.5;
            }
            
            /* Material Design Colors */
            :root {
              --mdc-theme-primary: #1976d2;
              --mdc-theme-secondary: #dc004e;
              --mdc-theme-surface: #ffffff;
              --mdc-theme-background: #fafafa;
              --mdc-theme-error: #b00020;
              --mdc-theme-on-primary: #ffffff;
              --mdc-theme-on-secondary: #ffffff;
              --mdc-theme-on-surface: rgba(0, 0, 0, 0.87);
              --mdc-theme-on-background: rgba(0, 0, 0, 0.87);
              --mdc-theme-on-error: #ffffff;
            }
            
            /* Bootstrap Enhancement */
            .container, .container-fluid {
              max-width: 100%;
            }
            
            /* Material Design Card Enhancement */
            .mat-card, .mdc-card, .card {
              border-radius: 8px !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1) !important;
              transition: box-shadow 0.3s ease !important;
            }
            
            .mat-card:hover, .mdc-card:hover, .card:hover {
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15), 0 16px 32px rgba(0, 0, 0, 0.15) !important;
            }
            
            /* Material Design Button Enhancement */
            .mat-button, .mat-raised-button, .mat-fab, .mat-mini-fab,
            .mdc-button, .btn {
              border-radius: 8px !important;
              font-weight: 500 !important;
              text-transform: none !important;
              transition: all 0.3s ease !important;
            }
            
            .mat-raised-button, .btn-primary {
              background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
              box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3) !important;
            }
            
            .mat-raised-button:hover, .btn-primary:hover {
              background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%) !important;
              box-shadow: 0 4px 8px rgba(25, 118, 210, 0.4) !important;
              transform: translateY(-1px) !important;
            }
            
            /* Material Design Form Fields */
            .mat-form-field, .form-control {
              width: 100% !important;
            }
            
            .mat-input-element, .form-control {
              border-radius: 8px !important;
              border: 2px solid #e0e0e0 !important;
              transition: border-color 0.3s ease !important;
            }
            
            .mat-input-element:focus, .form-control:focus {
              border-color: #1976d2 !important;
              box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1) !important;
            }
            
            /* Material Design Icons */
            .material-icons, .fa, .fas, .far, .fab {
              vertical-align: middle;
              margin-right: 8px;
            }
            
            /* Responsive Grid Enhancement */
            .row {
              margin: 0 -12px;
            }
            
            .col, [class*="col-"] {
              padding: 0 12px;
            }
            
            /* Animation Enhancements */
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes slideIn {
              from { transform: translateX(-20px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            
            .fade-in { animation: fadeIn 0.5s ease-out; }
            .slide-in { animation: slideIn 0.5s ease-out; }
            
            /* Component Container */
            .component-preview {
              background: white;
              border-radius: 12px;
              padding: 24px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              margin: 20px 0;
              animation: fadeIn 0.5s ease-out;
            }
            
            /* Custom Generated Styles */
            ${css}
            ${this.generateSmartCryptoStyles(html)}
          </style>
        </head>
        <body>
          <!-- 🚀 ENHANCED PREVIEW CONTAINER -->
          <div class="component-preview">
            ${processedHtml}
          </div>
          
          <!-- 🔧 FRAMEWORK SCRIPTS -->
          
          <!-- Bootstrap 5.3 JavaScript -->
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
          
          <!-- Material Design Web Components -->
          <script src="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"></script>
          
          <!-- Initialize Material Components -->
          <script>
            // Initialize Material Design Components
            if (window.mdc) {
              // Auto-initialize all MDC components
              window.mdc.autoInit();
              
              // Initialize specific components
              const buttons = document.querySelectorAll('.mdc-button');
              buttons.forEach(button => {
                if (!button.mdcButton) {
                  new mdc.ripple.MDCRipple(button);
                }
              });
              
              const cards = document.querySelectorAll('.mdc-card');
              cards.forEach(card => {
                if (!card.mdcCard) {
                  new mdc.card.MDCCard(card);
                }
              });
              
              const textFields = document.querySelectorAll('.mdc-text-field');
              textFields.forEach(textField => {
                if (!textField.mdcTextField) {
                  new mdc.textField.MDCTextField(textField);
                }
              });
            }
            
            // Initialize Bootstrap components
            if (window.bootstrap) {
              // Initialize tooltips
              const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
              tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
              });
              
              // Initialize popovers
              const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
              popoverTriggerList.map(function (popoverTriggerEl) {
                return new bootstrap.Popover(popoverTriggerEl);
              });
            }
            
            // Custom component JavaScript
            ${js}
            
            // Add smooth animations to new elements
            document.addEventListener('DOMContentLoaded', function() {
              const elements = document.querySelectorAll('.component-preview > *');
              elements.forEach((el, index) => {
                el.style.animationDelay = (index * 0.1) + 's';
                el.classList.add('fade-in');
              });
            });
          </script>
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
  
  // 🎯 OLD METHOD REMOVED - Using new comprehensive processAngularTemplate method
  
  // 🎯 OLD HELPER METHOD REMOVED
  
  // 🎯 GENERATE GENERIC MOCK DATA - Based on template analysis
  private generateGenericMockData(html: string): any[] {
    console.log('🔧 Generating generic mock data based on template');
    
    // Analyze template to determine data structure
    const properties = new Set<string>();
    
    // Extract property names from template bindings
    const bindingMatches = html.match(/\{\{\s*\w+\.(\w+)\s*\}\}/g);
    if (bindingMatches) {
      bindingMatches.forEach(match => {
        const prop = match.match(/\{\{\s*\w+\.(\w+)\s*\}\}/)?.[1];
        if (prop) properties.add(prop);
      });
    }
    
    // Extract property names from property bindings
    const propBindingMatches = html.match(/\[\w+\]="?\w+\.(\w+)"?/g);
    if (propBindingMatches) {
      propBindingMatches.forEach(match => {
        const prop = match.match(/\[\w+\]="?\w+\.(\w+)"?/)?.[1];
        if (prop) properties.add(prop);
      });
    }
    
    console.log('📊 Detected properties:', Array.from(properties));
    
    // Generate mock data based on detected properties
    const mockItems = [];
    for (let i = 0; i < 4; i++) {
      const item: any = {};
      
      properties.forEach(prop => {
        switch (prop.toLowerCase()) {
          case 'name':
          case 'title':
            item[prop] = `Item ${i + 1}`;
            break;
          case 'symbol':
          case 'code':
            item[prop] = `SYM${i + 1}`;
            break;
          case 'price':
          case 'amount':
          case 'value':
            item[prop] = `${(Math.random() * 1000 + 100).toFixed(2)}`;
            break;
          case 'change':
          case 'percentage':
            const change = (Math.random() * 10 - 5).toFixed(1);
            const changeNum = parseFloat(change);
            item[prop] = `${changeNum > 0 ? '+' : ''}${change}%`;
            item.changeClass = changeNum > 0 ? 'positive' : 'negative';
            break;
          case 'description':
          case 'text':
            item[prop] = `This is a description for ${item.name || `item ${i + 1}`}`;
            break;
          case 'icon':
          case 'image':
          case 'src':
            item[prop] = `https://via.placeholder.com/64x64/4f46e5/ffffff?text=${i + 1}`;
            break;
          default:
            item[prop] = `Value ${i + 1}`;
        }
      });
      
      mockItems.push(item);
    }
    
    console.log('✅ Generated generic mock data:', mockItems);
    return mockItems;
  }
  
  // 🎯 PROCESS NGFOR DIRECTIVES - Universal ngFor processing
  private processNgForDirectives(html: string, mockData: any[]): string {
    const ngForPattern = /<(\w+)[^>]*\*ngFor="let\s+(\w+)\s+of\s+(\w+)"[^>]*>([\s\S]*?)<\/\1>/g;
    
    return html.replace(ngForPattern, (match, elementTag, itemVar, arrayVar, elementContent) => {
      console.log(`🔧 Processing *ngFor: let ${itemVar} of ${arrayVar}`);
      
      let repeatedElements = '';
      mockData.forEach((item, index) => {
        let processedContent = elementContent;
        
        // Replace all template bindings for this item
        Object.keys(item).forEach(key => {
          const value = item[key];
          processedContent = processedContent
            .replace(new RegExp(`\\{\\{\\s*${itemVar}\\.${key}\\s*\\}\\}`, 'g'), value)
            .replace(new RegExp(`\\[src\\]="${itemVar}\\.${key}"`, 'g'), `src="${value}"`)
            .replace(new RegExp(`\\[alt\\]="${itemVar}\\.${key}"`, 'g'), `alt="${value}"`)
            .replace(new RegExp(`\\[class\\]="${itemVar}\\.${key}"`, 'g'), `class="${value}"`);
        });
        
        // Handle pipes
        processedContent = processedContent
          .replace(new RegExp(`\\{\\{\\s*${itemVar}\\.(\\w+)\\s*\\|\\s*currency\\s*\\}\\}`, 'g'), (match: string, prop: string) => `$${item[prop] || '0'}`)
          .replace(new RegExp(`\\{\\{\\s*${itemVar}\\.(\\w+)\\s*\\|\\s*number:'1\\.0-2'\\s*\\}\\}`, 'g'), (match: string, prop: string) => `${item[prop] || '0'}.00`);
        
        repeatedElements += `<${elementTag} class="dynamic-item item-${index + 1}">${processedContent}</${elementTag}>`;
      });
      
      return repeatedElements;
    });
  }
  
  // 🎯 PROCESS TEMPLATE BINDINGS - Universal binding processing
  private processTemplateBindings(html: string, mockData: any[]): string {
    if (mockData.length === 0) return html;
    
    const firstItem = mockData[0];
    
    // Process remaining template bindings with first item data
    Object.keys(firstItem).forEach(key => {
      const value = firstItem[key];
      html = html
        .replace(new RegExp(`\\{\\{\\s*\\w+\\.${key}\\s*\\}\\}`, 'g'), value)
        .replace(new RegExp(`\\[src\\]="\\w+\\.${key}"`, 'g'), `src="${value}"`)
        .replace(new RegExp(`\\[alt\\]="\\w+\\.${key}"`, 'g'), `alt="${value}"`);
    });
    
    return html;
  }
  
  // 🎯 UNIVERSAL DYNAMIC STYLES GENERATOR - Generate CSS based on HTML content
  private generateSmartCryptoStyles(html: string): string {
    if (!html) return '';
    
    console.log('🎨 Generating universal dynamic styles based on content');
    
    // Detect what kind of components we have
    const hasDynamicItems = html.includes('dynamic-item') || html.includes('item-') || html.includes('*ngFor');
    const hasCards = html.includes('card') || html.includes('crypto-card');
    
    if (!hasDynamicItems && !hasCards) {
      return '';
    }
    
    return `
      /* 🎯 UNIVERSAL DYNAMIC COMPONENT STYLES - Auto-generated based on content */
      .dynamic-item,
      .crypto-card,
      .item-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 24px;
        margin: 16px 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        min-width: 280px;
        max-width: 320px;
      }
      
      .dynamic-item::before,
      .crypto-card::before,
      .item-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      }
      
      .dynamic-item:hover,
      .crypto-card:hover,
      .item-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        border-color: #667eea;
      }
      
      /* Universal text styling */
      .dynamic-item h3,
      .dynamic-item h4,
      .crypto-card h3,
      .item-card h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: #1a202c;
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .dynamic-item p,
      .crypto-card p,
      .item-card p {
        margin: 8px 0;
        line-height: 1.5;
        color: #4a5568;
      }
      
      .dynamic-item strong,
      .crypto-card strong,
      .item-card strong {
        font-weight: 600;
        color: #2d3748;
      }
      
      /* Status indicators */
      .positive {
        background: #c6f6d5;
        color: #22543d;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        display: inline-block;
      }
      
      .negative {
        background: #fed7d7;
        color: #742a2a;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        display: inline-block;
      }
      
      /* Responsive grid for dynamic items */
      .component-preview {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      /* Mobile responsive */
      @media (max-width: 768px) {
        .component-preview {
          grid-template-columns: 1fr;
          padding: 16px;
        }
        
        .dynamic-item,
        .crypto-card,
        .item-card {
          margin: 8px 0;
          min-width: auto;
          max-width: none;
        }
      }
      
      /* Staggered animations for dynamic items */
      .dynamic-item,
      .crypto-card,
      .item-card {
        animation: dynamicItemFadeIn 0.6s ease-out forwards;
      }
      
      .item-1 { animation-delay: 0.1s; }
      .item-2 { animation-delay: 0.2s; }
      .item-3 { animation-delay: 0.3s; }
      .item-4 { animation-delay: 0.4s; }
      
      @keyframes dynamicItemFadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Image styling */
      .dynamic-item img,
      .crypto-card img,
      .item-card img {
        border-radius: 8px;
        max-width: 100%;
        height: auto;
      }
    `;
  }



  private generateHTML(typescriptCode: string): string {
    // Extract HTML from TypeScript code or generate basic structure
    const htmlMatch = typescriptCode.match(/template\s*=\s*`([^`]*)`/);
    if (htmlMatch) {
      let html = htmlMatch[1];
      // 🎯 SMART DETECTION: Check if this needs Angular template processing
      const needsAngularProcessing = 
        html.includes('crypto') || 
        html.includes('{{crypto.') || 
        html.includes('*ngFor') ||
        html.includes('{{ crypto') ||
        html.includes('{{item.') ||
        html.includes('*ngFor="let');
      
      if (needsAngularProcessing) {
        console.log('🎯 SMART PREVIEW: Detected Angular template syntax, processing...');
        html = this.processAngularTemplateNew(html, typescriptCode);
      }
      return html;
    }
    
    // Generate enhanced HTML structure based on component type
    if (typescriptCode.includes('@Component')) {
      // Check for specific component types
      // 🎯 UNIVERSAL COMPONENT DETECTION - Generate based on keywords
      if (this.detectComponentType(typescriptCode)) {
        return this.generateUniversalComponentHTML(typescriptCode);
      }
      
      if (typescriptCode.toLowerCase().includes('card')) {
        return `
          <div class="container mt-4">
            <div class="row justify-content-center">
              <div class="col-md-6">
                <div class="card shadow-sm">
                  <div class="card-body">
                    <h5 class="card-title">
                      <i class="material-icons">credit_card</i>
                      Responsive Card Component
                    </h5>
                    <p class="card-text">This is a beautiful, responsive card component with Material Design and Bootstrap styling.</p>
                    <button class="btn btn-primary">
                      <i class="material-icons">arrow_forward</i>
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }
      
      if (typescriptCode.toLowerCase().includes('button')) {
        return `
          <div class="container mt-4">
            <div class="row">
              <div class="col-12">
                <h4 class="mb-3">Button Components</h4>
                <div class="d-flex flex-wrap gap-3">
                  <button class="btn btn-primary">Primary Button</button>
                  <button class="btn btn-secondary">Secondary</button>
                  <button class="btn btn-success">Success</button>
                  <button class="btn btn-outline-primary">
                    <i class="material-icons">favorite</i>
                    With Icon
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }
      
      if (typescriptCode.toLowerCase().includes('form')) {
        return `
          <div class="container mt-4">
            <div class="row justify-content-center">
              <div class="col-md-8">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">
                      <i class="material-icons">assignment</i>
                      Form Component
                    </h5>
                  </div>
                  <div class="card-body">
                    <form>
                      <div class="mb-3">
                        <label for="name" class="form-label">Name</label>
                        <input type="text" class="form-control" id="name" placeholder="Enter your name">
                      </div>
                      <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email" placeholder="Enter your email">
                      </div>
                      <div class="mb-3">
                        <label for="message" class="form-label">Message</label>
                        <textarea class="form-control" id="message" rows="3" placeholder="Your message"></textarea>
                      </div>
                      <button type="submit" class="btn btn-primary">
                        <i class="material-icons">send</i>
                        Submit
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }
      
      if (typescriptCode.toLowerCase().includes('table')) {
        return `
          <div class="container mt-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="material-icons">table_chart</i>
                  Data Table Component
                </h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-dark">
                      <tr>
                        <th>Name</th>
                        <th>Symbol</th>
                        <th>Price</th>
                        <th>Change</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Bitcoin</td>
                        <td>BTC</td>
                        <td>$34,000</td>
                        <td class="text-success">+2.5%</td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary">View</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Ethereum</td>
                        <td>ETH</td>
                        <td>$2,400</td>
                        <td class="text-danger">-1.2%</td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary">View</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        `;
      }
      
      // Default component
      return `
        <div class="container mt-4">
          <div class="row justify-content-center">
            <div class="col-md-8">
              <div class="card">
                <div class="card-body text-center">
                  <i class="material-icons" style="font-size: 48px; color: #1976d2;">psychology</i>
                  <h3 class="mt-3">AI Generated Component</h3>
                  <p class="text-muted">This component was generated by AI with Material Design and Bootstrap styling.</p>
                  <button class="btn btn-primary">
                    <i class="material-icons">explore</i>
                    Explore Features
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="container mt-4">
        <div class="alert alert-info" role="alert">
          <i class="material-icons">info</i>
          No HTML template found. Please provide HTML code or generate a component.
        </div>
      </div>
    `;
  }

  private generateCSS(typescriptCode: string): string {
    // Extract CSS from TypeScript code or generate basic styles
    const stylesMatch = typescriptCode.match(/styles\s*:\s*\[`([^`]*)`\]/);
    if (stylesMatch) {
      return stylesMatch[1];
    }
    
    // Generate enhanced CSS based on component type
    if (typescriptCode.includes('@Component')) {
      
      // Card component styles
      if (typescriptCode.toLowerCase().includes('card')) {
        return `
          .card {
            transition: all 0.3s ease !important;
            border: none !important;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
          }
          
          .card:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
          }
          
          .card-title {
            color: #1976d2 !important;
            font-weight: 500 !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
          }
          
          .btn {
            border-radius: 25px !important;
            padding: 8px 20px !important;
            font-weight: 500 !important;
            transition: all 0.3s ease !important;
          }
          
          .btn:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
          }
        `;
      }
      
      // Button component styles
      if (typescriptCode.toLowerCase().includes('button')) {
        return `
          .btn {
            border-radius: 8px !important;
            font-weight: 500 !important;
            padding: 12px 24px !important;
            transition: all 0.3s ease !important;
            margin: 4px !important;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
            border: none !important;
            box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3) !important;
          }
          
          .btn-primary:hover {
            background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4) !important;
          }
          
          .btn-outline-primary {
            border: 2px solid #1976d2 !important;
            color: #1976d2 !important;
          }
          
          .btn-outline-primary:hover {
            background: #1976d2 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
          }
          
          .gap-3 {
            gap: 1rem !important;
          }
        `;
      }
      
      // Form component styles
      if (typescriptCode.toLowerCase().includes('form')) {
        return `
          .form-control {
            border-radius: 8px !important;
            border: 2px solid #e0e0e0 !important;
            padding: 12px 16px !important;
            transition: all 0.3s ease !important;
          }
          
          .form-control:focus {
            border-color: #1976d2 !important;
            box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1) !important;
          }
          
          .form-label {
            font-weight: 500 !important;
            color: #333 !important;
            margin-bottom: 8px !important;
          }
          
          .card-header {
            background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
            color: white !important;
            border-radius: 8px 8px 0 0 !important;
          }
          
          .btn[type="submit"] {
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%) !important;
            border: none !important;
            border-radius: 25px !important;
            padding: 12px 30px !important;
            font-weight: 500 !important;
          }
          
          .btn[type="submit"]:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3) !important;
          }
        `;
      }
      
      // Table component styles
      if (typescriptCode.toLowerCase().includes('table')) {
        return `
          .table {
            border-radius: 8px !important;
            overflow: hidden !important;
          }
          
          .table thead th {
            background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
            color: white !important;
            border: none !important;
            font-weight: 500 !important;
            padding: 16px !important;
          }
          
          .table tbody tr {
            transition: all 0.3s ease !important;
          }
          
          .table tbody tr:hover {
            background: rgba(25, 118, 210, 0.05) !important;
            transform: scale(1.01) !important;
          }
          
          .table tbody td {
            padding: 16px !important;
            border-color: #f0f0f0 !important;
            vertical-align: middle !important;
          }
          
          .btn-sm {
            border-radius: 20px !important;
            padding: 6px 16px !important;
            font-size: 0.875rem !important;
          }
          
          .text-success {
            color: #4caf50 !important;
            font-weight: 500 !important;
          }
          
          .text-danger {
            color: #f44336 !important;
            font-weight: 500 !important;
          }
        `;
      }
      
      // Default component styles
      return `
        /* Enhanced Material Design Styles */
        .card {
          border: none !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          transition: all 0.3s ease !important;
        }
        
        .card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
        
        .card-body {
          padding: 2rem !important;
        }
        
        .material-icons {
          color: #1976d2 !important;
          transition: all 0.3s ease !important;
        }
        
        .btn {
          border-radius: 25px !important;
          padding: 12px 24px !important;
          font-weight: 500 !important;
          transition: all 0.3s ease !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
          border: none !important;
          box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3) !important;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4) !important;
        }
        
        h3 {
          color: #333 !important;
          font-weight: 500 !important;
          margin-bottom: 1rem !important;
        }
        
        .text-muted {
          color: #666 !important;
          line-height: 1.6 !important;
        }
        
        /* Animation enhancements */
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .material-icons:hover {
          animation: pulse 0.6s ease-in-out !important;
        }
      `;
    }
    
    return `
      /* Default preview styles */
      .alert {
        border-radius: 8px !important;
        border: none !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      }
      
      .alert-info {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
        color: #0d47a1 !important;
      }
    `;
  }
  
  // 🎯 UNIVERSAL COMPONENT TYPE DETECTION
  private detectComponentType(typescriptCode: string): boolean {
    const keywords = [
      'crypto', 'currency', 'card', 'list', 'table', 'grid', 
      'dashboard', 'profile', 'user', 'product', 'item'
    ];
    
    return keywords.some(keyword => 
      typescriptCode.toLowerCase().includes(keyword)
    );
  }
  
  // 🎯 UNIVERSAL COMPONENT HTML GENERATOR
  private generateUniversalComponentHTML(typescriptCode: string): string {
    console.log('🔧 Generating universal component HTML');
    
    // Detect if it's a list/array component
    if (typescriptCode.includes('[]') || typescriptCode.includes('Array') || 
        typescriptCode.includes('*ngFor') || typescriptCode.includes('items')) {
      
      return `
        <div class="component-container">
          <div class="dynamic-item">
            <h3>Item 1</h3>
            <p>This is the first dynamic item with sample content.</p>
            <strong>Value: $123.45</strong>
            <span class="positive">+2.5%</span>
          </div>
          <div class="dynamic-item">
            <h3>Item 2</h3>
            <p>This is the second dynamic item with sample content.</p>
            <strong>Value: $234.56</strong>
            <span class="negative">-1.2%</span>
          </div>
          <div class="dynamic-item">
            <h3>Item 3</h3>
            <p>This is the third dynamic item with sample content.</p>
            <strong>Value: $345.67</strong>
            <span class="positive">+4.8%</span>
          </div>
          <div class="dynamic-item">
            <h3>Item 4</h3>
            <p>This is the fourth dynamic item with sample content.</p>
            <strong>Value: $456.78</strong>
            <span class="positive">+1.9%</span>
          </div>
        </div>
      `;
    }
    
    // Default single component
    return `
      <div class="component-container">
        <div class="dynamic-item">
          <h3>Dynamic Component</h3>
          <p>This is a dynamically generated component based on your code structure.</p>
          <strong>Generated from AI response</strong>
        </div>
      </div>
    `;
  }

  /**
   * 🎯 PROCESS ANGULAR TEMPLATE TO RENDER ACTUAL DATA
   * Converts Angular template syntax to actual HTML with mock data
   */
  private processAngularTemplateNew(html: string, typescript: string): string {
    if (!html || !typescript) {
      console.log('❌ Missing HTML or TypeScript for processing');
      return html;
    }

    try {
      console.log('🚀 Starting Angular template processing...');
      console.log('📝 Original HTML:', html.substring(0, 300));
      console.log('📝 TypeScript code:', typescript.substring(0, 500));
      
      // Extract mock data from TypeScript component
      const mockData = this.extractMockDataFromTypeScript(typescript);
      
      if (Object.keys(mockData).length === 0) {
        console.log('⚠️ No mock data extracted, returning original HTML');
        return html;
      }
      
      // Process Angular template syntax in the correct order
      let processedHtml = html;

      processedHtml = this.processNgFor(processedHtml, mockData);
      processedHtml = this.processMatTableDirectives(processedHtml, mockData);
      processedHtml = this.processInterpolation(processedHtml, mockData);
      processedHtml = this.processPropertyBinding(processedHtml, mockData);
      processedHtml = this.processStyleBinding(processedHtml, mockData);
      processedHtml = this.cleanAngularAttributes(processedHtml);
      
      // Final cleanup: Remove any remaining brackets around unresolved expressions
      processedHtml = processedHtml.replace(/\[([^\]]+)\]/g, '$1');

      return processedHtml;
      
    } catch (error) {
      console.error('❌ Error processing Angular template:', error);
      return html; // Return original HTML if processing fails
    }
  }

  /**
   * Extract mock data from TypeScript component
   */
  private extractMockDataFromTypeScript(typescript: string): any {
    const mockData: any = {};
    
    try {
      console.log('🔍 Extracting mock data from TypeScript:', typescript.substring(0, 500));
      
      // Extract arrays (like products: Product[] = [...])
      const arrayMatches = typescript.match(/(\w+):\s*\w+\[\]\s*=\s*\[([\s\S]*?)\];/g);
      if (arrayMatches) {
        arrayMatches.forEach(match => {
          const nameMatch = match.match(/(\w+):/);
          if (nameMatch) {
            const arrayName = nameMatch[1];
            console.log(`🎯 Found array: ${arrayName}`);
            
            // Extract objects from the array
            const objectMatches = match.match(/\{[\s\S]*?\}/g);
            if (objectMatches) {
              mockData[arrayName] = objectMatches.map(objStr => {
                return this.parseObjectString(objStr);
              });
              console.log(`✅ Parsed ${arrayName}:`, mockData[arrayName]);
            }
          }
        });
      }

      // If no arrays found, create sample data based on the interface
      if (Object.keys(mockData).length === 0) {
        console.log('🔧 No arrays found, generating sample data...');
        
        // Look for interface definitions to understand structure
        const interfaceMatch = typescript.match(/interface\s+(\w+)\s*\{([^}]+)\}/);
        if (interfaceMatch) {
          const [, interfaceName, interfaceBody] = interfaceMatch;
          console.log(`📋 Found interface: ${interfaceName}`);
          
          // Generate sample array based on interface
          const sampleItems = this.generateSampleDataFromInterface(interfaceBody);
          
          // Try to find the array property name (usually plural of interface name)
          const arrayName = interfaceName.toLowerCase() + 's';
          mockData[arrayName] = sampleItems;
          console.log(`✅ Generated sample data for ${arrayName}:`, mockData[arrayName]);
        }
      }

      console.log('🎯 Final extracted mock data:', mockData);
      return mockData;
      
    } catch (error) {
      console.error('❌ Error extracting mock data:', error);
      return {};
    }
  }

  /**
   * Generate sample data from interface definition
   */
  private generateSampleDataFromInterface(interfaceBody: string): any[] {
    const sampleItems = [];
    
    // Parse interface properties
    const properties: any = {};
    const propMatches = interfaceBody.match(/(\w+):\s*(string|number|boolean)/g);
    
    if (propMatches) {
      propMatches.forEach(prop => {
        const match = prop.match(/(\w+):\s*(string|number|boolean)/);
        if (match) {
          const [, name, type] = match;
          properties[name] = type;
        }
      });
    }
    
    // Generate 3 sample items
    for (let i = 0; i < 3; i++) {
      const item: any = {};
      
      Object.keys(properties).forEach(prop => {
        const type = properties[prop];
        
        switch (prop.toLowerCase()) {
          case 'id':
            item[prop] = i + 1;
            break;
          case 'name':
          case 'title':
            item[prop] = ['Eco-friendly Water Bottle', 'Wireless Charging Pad', 'Bluetooth Headphones'][i] || `Product ${i + 1}`;
            break;
          case 'description':
            item[prop] = ['A sustainable water bottle for everyday use.', 'Fast charging with sleek design.', 'Premium sound quality with noise cancellation.'][i] || `Description for item ${i + 1}`;
            break;
          case 'price':
            item[prop] = [25, 45, 150][i] || (Math.random() * 100 + 10);
            break;
          case 'imageurl':
          case 'image':
            item[prop] = `https://via.placeholder.com/300x200/4f46e5/ffffff?text=Product+${i + 1}`;
            break;
          default:
            if (type === 'number') {
              item[prop] = Math.floor(Math.random() * 100) + 1;
            } else {
              item[prop] = `Value ${i + 1}`;
            }
        }
      });
      
      sampleItems.push(item);
    }
    
    return sampleItems;
  }

  /**
   * Parse object string to actual object
   */
  private parseObjectString(objStr: string): any {
    try {
      // Simple object parsing for common patterns
      const obj: any = {};
      const props = objStr.match(/(\w+):\s*['"`]?([^'"`\n,}]+)['"`]?/g);
      if (props) {
        props.forEach(prop => {
          const match = prop.match(/(\w+):\s*['"`]?([^'"`\n,}]+)['"`]?/);
          if (match) {
            const [, key, value] = match;
            // Try to parse as number, otherwise keep as string
            obj[key] = isNaN(Number(value)) ? value.replace(/['"`]/g, '') : Number(value);
          }
        });
      }
      return obj;
    } catch (error) {
      return {};
    }
  }

  /**
   * Process Angular Material table directives
   */
  private processMatTableDirectives(html: string, mockData: any): string {
    // Check if this is a mat-table
    if (!html.includes('mat-table') && !html.includes('matColumnDef')) {
      return html;
    }
    
    // Find the dataSource array in mockData
    let dataSourceArray: any[] = [];
    const availableArrays = Object.keys(mockData).filter(key => Array.isArray(mockData[key]));
    if (availableArrays.length > 0) {
      dataSourceArray = mockData[availableArrays[0]];
    }
    
    if (dataSourceArray.length === 0) {
      return html;
    }
    
    // Get column names from the first item or from matColumnDef
    let columns: string[] = [];
    const columnMatches = html.match(/matColumnDef="(\w+)"/g);
    if (columnMatches) {
      columns = columnMatches.map(match => {
        const colMatch = match.match(/matColumnDef="(\w+)"/);
        return colMatch ? colMatch[1] : '';
      }).filter(col => col);
    } else {
      columns = Object.keys(dataSourceArray[0]);
    }
    
    // Replace the entire table with a simple, working HTML table
    const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/g;
    
    let processedHtml = html.replace(tableRegex, () => {
      let tableHtml = '<table class="mat-table mat-elevation-z8" style="width: 100%;">\n';
      
      // Generate header row
      tableHtml += '  <thead>\n    <tr class="mat-header-row">\n';
      columns.forEach(column => {
        tableHtml += `      <th class="mat-header-cell" style="padding: 16px; text-align: left; font-weight: 500;">${column.toUpperCase()}</th>\n`;
      });
      tableHtml += '    </tr>\n  </thead>\n';
      
      // Generate data rows
      tableHtml += '  <tbody>\n';
      dataSourceArray.forEach((item, index) => {
        tableHtml += `    <tr class="mat-row" style="border-bottom: 1px solid #e0e0e0;">\n`;
        columns.forEach(column => {
          const value = item[column] || '';
          tableHtml += `      <td class="mat-cell" style="padding: 16px;">${value}</td>\n`;
        });
        tableHtml += '    </tr>\n';
      });
      tableHtml += '  </tbody>\n</table>';
      
      return tableHtml;
    });
    
    return processedHtml;
  }

  /**
   * Process *ngFor directives
   */
  private processNgFor(html: string, mockData: any): string {
    // More robust pattern that handles nested tags better
    let processedHtml = html;
    let match;
    const ngForPattern = /<(\w+)([^>]*)\*ngFor="let\s+(\w+)\s+of\s+(\w+)"([^>]*)>/g;
    
    // Find all *ngFor starting tags first
    const ngForMatches = [];
    while ((match = ngForPattern.exec(html)) !== null) {
      ngForMatches.push({
        fullMatch: match[0],
        tagName: match[1],
        beforeNgFor: match[2],
        itemVar: match[3],
        arrayVar: match[4],
        afterNgFor: match[5],
        startIndex: match.index
      });
    }
    
    // Process each *ngFor from end to start to avoid index shifting
    for (let i = ngForMatches.length - 1; i >= 0; i--) {
      const ngForMatch = ngForMatches[i];
      
      // Find the corresponding closing tag
      const openTag = ngForMatch.fullMatch;
      const tagName = ngForMatch.tagName;
      const startIndex = ngForMatch.startIndex;
      
      // Find the matching closing tag
      let tagDepth = 1;
      let currentIndex = startIndex + openTag.length;
      let closingTagIndex = -1;
      
      while (tagDepth > 0 && currentIndex < html.length) {
        const openTagMatch = html.substring(currentIndex).match(new RegExp(`<${tagName}[^>]*>`, 'i'));
        const closeTagMatch = html.substring(currentIndex).match(new RegExp(`</${tagName}>`, 'i'));
        
        let nextOpenIndex = openTagMatch && openTagMatch.index !== undefined ? currentIndex + openTagMatch.index : Infinity;
        let nextCloseIndex = closeTagMatch && closeTagMatch.index !== undefined ? currentIndex + closeTagMatch.index : Infinity;
        
        if (nextCloseIndex < nextOpenIndex) {
          tagDepth--;
          if (tagDepth === 0) {
            closingTagIndex = nextCloseIndex;
          }
          currentIndex = nextCloseIndex + (closeTagMatch?.[0]?.length || 0);
        } else if (nextOpenIndex < Infinity) {
          tagDepth++;
          currentIndex = nextOpenIndex + (openTagMatch?.[0]?.length || 0);
        } else {
          break;
        }
      }
      
      if (closingTagIndex === -1) continue;
      
      // Extract the content between tags
      const content = html.substring(startIndex + openTag.length, closingTagIndex);
      const closeTag = `</${tagName}>`;
      
      // Get array data
      let array = mockData[ngForMatch.arrayVar];
      if (!array) {
        const possibleNames = [ngForMatch.arrayVar, ngForMatch.arrayVar + 's', ngForMatch.arrayVar.slice(0, -1)];
        for (const name of possibleNames) {
          if (mockData[name] && Array.isArray(mockData[name])) {
            array = mockData[name];
            break;
          }
        }
      }
      
      if (!Array.isArray(array) || array.length === 0) {
        // Replace the entire *ngFor block with empty comment
        processedHtml = processedHtml.substring(0, startIndex) + 
                      `<!-- No data for ${ngForMatch.arrayVar} -->` + 
                      processedHtml.substring(closingTagIndex + closeTag.length);
        continue;
      }
      
      // Generate repeated content
      const repeatedContent = array.map((item, index) => {
        let itemContent = content;
        
        // Replace item properties
        Object.keys(item).forEach(key => {
          const regex = new RegExp(`${ngForMatch.itemVar}\\.${key}`, 'g');
          const value = item[key];
          itemContent = itemContent.replace(regex, value);
          
          // Also handle interpolation brackets {{ item.property }}
          const interpolationRegex = new RegExp(`\\{\\{\\s*${ngForMatch.itemVar}\\.${key}\\s*\\}\\}`, 'g');
          itemContent = itemContent.replace(interpolationRegex, value);
        });
        
        // Create clean opening tag (remove *ngFor)
        const cleanAttributes = (ngForMatch.beforeNgFor + ngForMatch.afterNgFor)
          .replace(/\s*\*ngFor="[^"]*"\s*/, ' ')
          .trim();
        const cleanOpenTag = cleanAttributes ? 
          `<${tagName} ${cleanAttributes}>` : 
          `<${tagName}>`;
        
        return cleanOpenTag + itemContent + closeTag;
      }).join('\n');
      
      // Replace the original *ngFor block with repeated content
      processedHtml = processedHtml.substring(0, startIndex) + 
                    repeatedContent + 
                    processedHtml.substring(closingTagIndex + closeTag.length);
    }
    
    return processedHtml;
  }

  /**
   * Process interpolation {{ }}
   */
  private processInterpolation(html: string, mockData: any): string {
    const availableArrays = Object.keys(mockData).filter(key => Array.isArray(mockData[key]));
    
    return html.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, expression) => {
      const trimmed = expression.trim();
      
      // Handle pipes (e.g., element.price | currency)
      if (trimmed.includes('|')) {
        const [propertyPart, pipePart] = trimmed.split('|').map((s: string) => s.trim());
        
        // Get the base value first
        let baseValue = this.resolvePropertyValue(propertyPart, mockData, availableArrays);
        
        // Apply pipe transformation
        if (pipePart === 'currency') {
          baseValue = typeof baseValue === 'number' ? `$${baseValue.toFixed(2)}` : `$${baseValue}`;
        } else if (pipePart.startsWith('number')) {
          baseValue = typeof baseValue === 'number' ? baseValue.toFixed(2) : baseValue;
        }
        
        return baseValue;
      }
      
      // Handle regular property access
      return this.resolvePropertyValue(trimmed, mockData, availableArrays);
    });
  }

  /**
   * Helper method to resolve property values
   */
  private resolvePropertyValue(expression: string, mockData: any, availableArrays: string[]): any {
    // Handle simple property access
    if (mockData[expression]) {
      return mockData[expression];
    }
    
    // Handle object property access (e.g., product.name, product.id, product.price)
    const parts = expression.split('.');
    if (parts.length === 2) {
      const [obj, prop] = parts;
      
      // For Angular Material tables, we need to use the first item from the array
      // since we can't actually iterate in static HTML
      for (const arrayName of availableArrays) {
        const arrayData = mockData[arrayName];
        if (arrayData && arrayData.length > 0) {
          const firstItem = arrayData[0];
          if (firstItem && firstItem.hasOwnProperty(prop)) {
            return firstItem[prop];
          }
        }
      }
      
      // Check if we have an array with this name
      const arrayData = mockData[obj + 's'] || mockData[obj]; // Try both singular and plural
      if (Array.isArray(arrayData) && arrayData.length > 0) {
        return arrayData[0][prop]; // Use first item for template processing
      }
      
      // Check direct object access
      if (mockData[obj] && mockData[obj][prop]) {
        return mockData[obj][prop];
      }
    }
    
    return expression; // Return the expression without brackets if not resolved
  }

  /**
   * Process property binding [src], [alt], etc.
   */
  private processPropertyBinding(html: string, mockData: any): string {
    return html.replace(/\[(\w+)\]="([^"]+)"/g, (match, attr, expression) => {
      // Handle simple expressions like product.imageUrl
      const parts = expression.split('.');
      if (parts.length === 2) {
        const [obj, prop] = parts;
        if (mockData[obj] && mockData[obj][prop]) {
          return `${attr}="${mockData[obj][prop]}"`;
        }
      }
      
      // Handle string concatenation like "'url(' + product.imageUrl + ')'"
      if (expression.includes('+')) {
        let result = expression;
        Object.keys(mockData).forEach(key => {
          if (typeof mockData[key] === 'object') {
            Object.keys(mockData[key]).forEach(subKey => {
              result = result.replace(`${key}.${subKey}`, mockData[key][subKey]);
            });
          }
        });
        // Evaluate simple string concatenation
        result = result.replace(/'/g, '').replace(/\s*\+\s*/g, '');
        return `${attr}="${result}"`;
      }
      
      return `${attr}="[${expression}]"`;
    });
  }

  /**
   * Process style binding [style.property]
   */
  private processStyleBinding(html: string, mockData: any): string {
    return html.replace(/\[style\.([^\]]+)\]="([^"]+)"/g, (match, styleProp, expression) => {
      // Handle expressions like "'url(' + product.imageUrl + ')'"
      if (expression.includes('+')) {
        let result = expression;
        Object.keys(mockData).forEach(key => {
          if (typeof mockData[key] === 'object') {
            Object.keys(mockData[key]).forEach(subKey => {
              result = result.replace(`${key}.${subKey}`, mockData[key][subKey]);
            });
          }
        });
        // Clean up the expression
        result = result.replace(/'/g, '').replace(/\s*\+\s*/g, '');
        return `style="${styleProp}: ${result}"`;
      }
      
      return `style="${styleProp}: [${expression}]"`;
    });
  }

  /**
   * Clean up Angular-specific attributes
   */
  private cleanAngularAttributes(html: string): string {
    return html
      .replace(/\*ngFor="[^"]*"/g, '')
      .replace(/\*ngIf="[^"]*"/g, '')
      .replace(/\*matHeaderRowDef="[^"]*"/g, '')
      .replace(/\*matRowDef="[^"]*"/g, '')
      .replace(/\*matCellDef="[^"]*"/g, '')
      .replace(/\*matHeaderCellDef[^>]*>/g, '>')
      .replace(/\(click\)="[^"]*"/g, '')
      .replace(/\(change\)="[^"]*"/g, '')
      .replace(/\[dataSource\]="[^"]*"/g, '')
      .replace(/matColumnDef="[^"]*"/g, '')
      .replace(/mat-card-avatar/g, 'class="mat-card-avatar"')
      .replace(/mat-card-image/g, 'class="mat-card-image"')
      .replace(/mat-table/g, 'class="mat-table"')
      .replace(/mat-header-cell/g, 'class="mat-header-cell"')
      .replace(/mat-cell/g, 'class="mat-cell"')
      .replace(/mat-header-row/g, 'class="mat-header-row"')
      .replace(/mat-row/g, 'class="mat-row"')
      .replace(/mat-button/g, 'class="mat-button"')
      .replace(/\s+/g, ' ')
      .replace(/\s>/g, '>');
  }
}
