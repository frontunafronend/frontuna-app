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
          </style>
        </head>
        <body>
          <!-- 🚀 ENHANCED PREVIEW CONTAINER -->
          <div class="component-preview">
            ${html}
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



  private generateHTML(typescriptCode: string): string {
    // Extract HTML from TypeScript code or generate basic structure
    const htmlMatch = typescriptCode.match(/template\s*=\s*`([^`]*)`/);
    if (htmlMatch) {
      return htmlMatch[1];
    }
    
    // Generate enhanced HTML structure based on component type
    if (typescriptCode.includes('@Component')) {
      // Check for specific component types
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
}
