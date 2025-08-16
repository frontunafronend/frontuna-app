import { Component, OnInit, inject, signal, computed, input, output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { FrameworkPreview, CompileError } from '@app/models/preview.model';
import { NotificationService } from '@app/services/notification/notification.service';

@Component({
  selector: 'app-framework-preview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="framework-preview-container">
      <!-- Header -->
      <div class="preview-header">
        <div class="framework-selector">
          <mat-form-field appearance="outline">
            <mat-label>Framework</mat-label>
            <mat-select 
              [(value)]="selectedFramework" 
              (selectionChange)="handleFrameworkChange()"
              [disabled]="isCompiling()">
              <mat-option value="angular">
                <div class="framework-option">
                  <img src="assets/images/frameworks/angular.svg" alt="Angular" class="framework-icon">
                  Angular
                </div>
              </mat-option>
              <mat-option value="react">
                <div class="framework-option">
                  <img src="assets/images/frameworks/react.svg" alt="React" class="framework-icon">
                  React
                </div>
              </mat-option>
              <mat-option value="vue">
                <div class="framework-option">
                  <img src="assets/images/frameworks/vue.svg" alt="Vue" class="framework-icon">
                  Vue
                </div>
              </mat-option>
              <mat-option value="svelte">
                <div class="framework-option">
                  <img src="assets/images/frameworks/svelte.png" alt="Svelte" class="framework-icon">
                  Svelte
                </div>
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="preview-actions">
          <button mat-icon-button 
                  matTooltip="Refresh Preview"
                  [disabled]="isCompiling()"
                  (click)="refreshPreview()">
            <mat-icon>refresh</mat-icon>
          </button>
          <button mat-icon-button 
                  matTooltip="Toggle Auto-compile"
                  [color]="autoCompile() ? 'accent' : ''"
                  (click)="toggleAutoCompile()">
            <mat-icon>{{ autoCompile() ? 'sync' : 'sync_disabled' }}</mat-icon>
          </button>
          <button mat-stroked-button 
                  [disabled]="isCompiling() || hasErrors()"
                  (click)="exportPreview()">
            <mat-icon>download</mat-icon>
            Export
          </button>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="status-bar" *ngIf="compileErrors().length > 0 || isCompiling()">
        <div class="status-content">
          <mat-spinner *ngIf="isCompiling()" diameter="16"></mat-spinner>
          <mat-icon *ngIf="!isCompiling() && hasErrors()" color="warn">error</mat-icon>
          <mat-icon *ngIf="!isCompiling() && !hasErrors()" color="primary">check_circle</mat-icon>
          
          <span class="status-text">
            <ng-container *ngIf="isCompiling()">Compiling {{ selectedFramework }} code...</ng-container>
            <ng-container *ngIf="!isCompiling() && hasErrors()">
              {{ compileErrors().length }} error(s) found
            </ng-container>
            <ng-container *ngIf="!isCompiling() && !hasErrors()">
              Compilation successful
            </ng-container>
          </span>
        </div>
        
        <div class="dependencies-info" *ngIf="currentPreview()?.dependencies?.length">
          <mat-chip-listbox>
            <mat-chip-option *ngFor="let dep of currentPreview()?.dependencies" disabled>
              {{ dep }}
            </mat-chip-option>
          </mat-chip-listbox>
        </div>
      </div>

      <!-- Main Content -->
      <div class="preview-content">
        <mat-tab-group [(selectedIndex)]="activeTab" (selectedTabChange)="onTabChange($event)">
          <!-- Code Tab -->
          <mat-tab label="Code">
            <div class="code-editor-container">
              <div class="editor-toolbar">
                <div class="file-info">
                  <mat-icon>code</mat-icon>
                  <span>{{ getFileName() }}</span>
                </div>
                <div class="editor-actions">
                  <button mat-icon-button matTooltip="Format Code" (click)="formatCode()">
                    <mat-icon>auto_fix_high</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Copy Code" (click)="copyCode()">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </div>
              </div>
              
              <div class="code-editor" #codeEditor>
                <textarea 
                  [(ngModel)]="code"
                  (ngModelChange)="handleCodeChange()"
                  placeholder="Enter your {{ selectedFramework }} code here..."
                  spellcheck="false">
                </textarea>
              </div>
            </div>
          </mat-tab>

          <!-- Preview Tab -->
          <mat-tab label="Preview" [disabled]="hasErrors()">
            <div class="preview-container">
              <div class="preview-iframe-container" *ngIf="!isCompiling() && !hasErrors()">
                <iframe 
                  #previewFrame
                  [srcdoc]="getPreviewHTML()"
                  class="preview-iframe"
                  sandbox="allow-scripts allow-same-origin">
                </iframe>
              </div>
              
              <div class="preview-placeholder" *ngIf="isCompiling()">
                <mat-spinner diameter="48"></mat-spinner>
                <p>Compiling {{ selectedFramework }} code...</p>
              </div>
              
              <div class="preview-error" *ngIf="hasErrors()">
                <mat-icon color="warn">error_outline</mat-icon>
                <p>Fix compilation errors to see preview</p>
              </div>
            </div>
          </mat-tab>

          <!-- Compiled Tab -->
          <mat-tab label="Compiled" *ngIf="currentPreview()?.compiledCode">
            <div class="compiled-code-container">
              <div class="compiled-toolbar">
                <div class="compiled-info">
                  <mat-icon>build</mat-icon>
                  <span>Compiled {{ selectedFramework }} Code</span>
                </div>
                <button mat-icon-button matTooltip="Copy Compiled Code" (click)="copyCompiledCode()">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
              
              <div class="compiled-code">
                <pre><code>{{ currentPreview()?.compiledCode }}</code></pre>
              </div>
            </div>
          </mat-tab>

          <!-- Errors Tab -->
          <mat-tab label="Errors" *ngIf="compileErrors().length > 0">
            <div class="errors-container">
              <div class="errors-header">
                <h3>Compilation Errors</h3>
                <button mat-button color="accent" (click)="clearErrors()">
                  <mat-icon>clear_all</mat-icon>
                  Clear All
                </button>
              </div>
              
              <div class="errors-list">
                <div 
                  *ngFor="let error of compileErrors(); trackBy: trackError" 
                  class="error-item"
                  [class]="'severity-' + error.severity">
                  
                  <div class="error-header">
                    <mat-icon [color]="error.severity === 'error' ? 'warn' : 'accent'">
                      {{ getErrorIcon(error.severity) }}
                    </mat-icon>
                    <span class="error-location">Line {{ error.line }}:{{ error.column }}</span>
                    <span class="error-severity">{{ error.severity.toUpperCase() }}</span>
                  </div>
                  
                  <div class="error-message">{{ error.message }}</div>
                  
                  <div class="error-source" *ngIf="error.source">
                    <code>{{ error.source }}</code>
                  </div>
                  
                  <div class="error-actions">
                    <button mat-stroked-button size="small" (click)="goToError(error)">
                      <mat-icon>my_location</mat-icon>
                      Go to Line
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .framework-preview-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .framework-selector mat-form-field {
      min-width: 150px;
    }

    .framework-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .framework-icon {
      width: 20px;
      height: 20px;
    }

    .preview-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .status-bar {
      padding: 12px 16px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-text {
      font-size: 14px;
      color: #666;
    }

    .dependencies-info {
      display: flex;
      gap: 4px;
    }

    .dependencies-info mat-chip-option {
      font-size: 11px;
      min-height: 24px;
    }

    .preview-content {
      flex: 1;
      overflow: hidden;
    }

    .preview-content ::ng-deep .mat-mdc-tab-body-wrapper {
      height: 100%;
    }

    .preview-content ::ng-deep .mat-mdc-tab-body-content {
      height: 100%;
      overflow: hidden;
    }

    .code-editor-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .editor-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
    }

    .editor-actions {
      display: flex;
      gap: 4px;
    }

    .code-editor {
      flex: 1;
      position: relative;
    }

    .code-editor textarea {
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      padding: 16px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.5;
      resize: none;
      background: #fff;
    }

    .preview-container {
      height: 100%;
      position: relative;
    }

    .preview-iframe-container {
      width: 100%;
      height: 100%;
    }

    .preview-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    }

    .preview-placeholder,
    .preview-error {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #666;
      gap: 16px;
    }

    .preview-error mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .compiled-code-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .compiled-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .compiled-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
    }

    .compiled-code {
      flex: 1;
      overflow: auto;
      padding: 16px;
      background: #fafafa;
    }

    .compiled-code pre {
      margin: 0;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      line-height: 1.4;
    }

    .errors-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .errors-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .errors-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .errors-list {
      flex: 1;
      overflow: auto;
      padding: 8px;
    }

    .error-item {
      margin-bottom: 12px;
      padding: 12px;
      border-radius: 6px;
      border-left: 4px solid #f44336;
    }

    .error-item.severity-warning {
      border-left-color: #ff9800;
      background: #fff8e1;
    }

    .error-item.severity-info {
      border-left-color: #2196f3;
      background: #e3f2fd;
    }

    .error-item.severity-error {
      border-left-color: #f44336;
      background: #ffebee;
    }

    .error-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .error-location {
      font-weight: 500;
      color: #333;
    }

    .error-severity {
      background: rgba(0,0,0,0.1);
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 500;
    }

    .error-message {
      color: #666;
      margin-bottom: 8px;
    }

    .error-source {
      background: rgba(0,0,0,0.05);
      padding: 8px;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .error-source code {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
    }

    .error-actions {
      display: flex;
      gap: 8px;
    }

    .error-actions button {
      font-size: 12px;
      padding: 4px 8px;
    }

    @media (max-width: 768px) {
      .preview-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .framework-selector {
        width: 100%;
      }

      .framework-selector mat-form-field {
        width: 100%;
      }

      .preview-actions {
        justify-content: center;
      }

      .status-bar {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
      }
    }
  `]
})
export class FrameworkPreviewComponent implements OnInit, AfterViewInit {
  @ViewChild('codeEditor') codeEditor!: ElementRef;
  @ViewChild('previewFrame') previewFrame!: ElementRef;

  private readonly notificationService = inject(NotificationService);

  // Inputs
  readonly initialCode = input<string>('');
  readonly initialFramework = input<'angular' | 'react' | 'vue' | 'svelte'>('angular');

  // Outputs
  readonly onCodeChangeEvent = output<string>();
  readonly onFrameworkChangeEvent = output<'angular' | 'react' | 'vue' | 'svelte'>();
  readonly onPreviewReady = output<FrameworkPreview>();

  // State
  selectedFramework: 'angular' | 'react' | 'vue' | 'svelte' = 'angular';
  code = '';
  activeTab = 0;
  
  // Signals
  readonly isCompiling = signal<boolean>(false);
  readonly autoCompile = signal<boolean>(true);
  readonly currentPreview = signal<FrameworkPreview | null>(null);
  readonly compileErrors = signal<CompileError[]>([]);
  readonly hasErrors = computed(() => this.compileErrors().length > 0);

  // Compile timeout
  private compileTimeout?: any;

  ngOnInit() {
    this.selectedFramework = this.initialFramework();
    this.code = this.initialCode() || this.getDefaultCode();
    
    if (this.autoCompile()) {
      this.compileCode();
    }
  }

  ngAfterViewInit() {
    // Setup code editor enhancements if needed
    this.setupCodeEditor();
  }

  handleFrameworkChange() {
    this.onFrameworkChangeEvent.emit(this.selectedFramework);
    this.code = this.getDefaultCode();
    
    if (this.autoCompile()) {
      this.compileCode();
    }
  }

  handleCodeChange() {
    this.onCodeChangeEvent.emit(this.code);
    
    if (this.autoCompile()) {
      this.debounceCompile();
    }
  }

  onTabChange(event: any) {
    this.activeTab = event.index;
  }

  refreshPreview() {
    this.compileCode();
  }

  toggleAutoCompile() {
    this.autoCompile.update(auto => !auto);
    
    if (this.autoCompile()) {
      this.compileCode();
    }
  }

  formatCode() {
    // TODO: Implement code formatting
    this.notificationService.showInfo('Code formatting coming soon!');
  }

  copyCode() {
    navigator.clipboard.writeText(this.code).then(() => {
      this.notificationService.showSuccess('Code copied to clipboard!');
    });
  }

  copyCompiledCode() {
    const compiled = this.currentPreview()?.compiledCode;
    if (compiled) {
      navigator.clipboard.writeText(compiled).then(() => {
        this.notificationService.showSuccess('Compiled code copied to clipboard!');
      });
    }
  }

  exportPreview() {
    // TODO: Implement export functionality
    this.notificationService.showInfo('Export functionality coming soon!');
  }

  clearErrors() {
    this.compileErrors.set([]);
  }

  goToError(error: CompileError) {
    // TODO: Implement go to line functionality
    console.log('Go to error:', error);
  }

  trackError(index: number, error: CompileError): string {
    return `${error.line}-${error.column}-${error.message}`;
  }

  getErrorIcon(severity: string): string {
    const icons = {
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[severity as keyof typeof icons] || 'error';
  }

  getFileName(): string {
    const extensions = {
      angular: 'component.ts',
      react: 'component.jsx',
      vue: 'component.vue',
      svelte: 'component.svelte'
    };
    return `MyComponent.${extensions[this.selectedFramework]}`;
  }

  getPreviewHTML(): string {
    const preview = this.currentPreview();
    if (!preview?.preview) {
      return '<div>No preview available</div>';
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Preview</title>
        <style>
          body { 
            margin: 0; 
            padding: 16px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        </style>
      </head>
      <body>
        ${preview.preview}
      </body>
      </html>
    `;
  }

  private debounceCompile() {
    if (this.compileTimeout) {
      clearTimeout(this.compileTimeout);
    }
    
    this.compileTimeout = setTimeout(() => {
      this.compileCode();
    }, 1000);
  }

  private compileCode() {
    if (!this.code.trim()) return;

    this.isCompiling.set(true);
    this.compileErrors.set([]);

    // Simulate compilation process
    setTimeout(() => {
      try {
        const preview = this.mockCompileCode();
        this.currentPreview.set(preview);
        this.onPreviewReady.emit(preview);
      } catch (error) {
        console.error('Compilation error:', error);
      } finally {
        this.isCompiling.set(false);
      }
    }, 1500);
  }

  private mockCompileCode(): FrameworkPreview {
    // Mock compilation - in real implementation, this would call a compilation service
    const errors: CompileError[] = [];
    
    // Simple validation
    if (!this.code.includes('export')) {
      errors.push({
        line: 1,
        column: 1,
        message: 'Component must have an export statement',
        severity: 'error',
        source: this.code.split('\n')[0] || ''
      });
    }

    this.compileErrors.set(errors);

    const preview: FrameworkPreview = {
      framework: this.selectedFramework,
      code: this.code,
      compiledCode: this.generateCompiledCode(),
      dependencies: this.extractDependencies(),
      isCompiling: false,
      compileErrors: errors,
      preview: errors.length === 0 ? this.generatePreviewHTML() : undefined
    };

    return preview;
  }

  private generateCompiledCode(): string {
    // Mock compiled code generation
    switch (this.selectedFramework) {
      case 'angular':
        return `// Compiled Angular Component\n${this.code}\n// Additional Angular runtime code...`;
      case 'react':
        return `// Compiled React Component\n${this.code}\n// JSX transformed to React.createElement calls...`;
      case 'vue':
        return `// Compiled Vue Component\n${this.code}\n// Template compiled to render function...`;
      case 'svelte':
        return `// Compiled Svelte Component\n${this.code}\n// Svelte compiler output...`;
      default:
        return this.code;
    }
  }

  private extractDependencies(): string[] {
    const deps: string[] = [];
    const lines = this.code.split('\n');
    
    lines.forEach(line => {
      const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        deps.push(importMatch[1]);
      }
    });

    return deps;
  }

  private generatePreviewHTML(): string {
    // Mock preview HTML generation
    return `
      <div style="padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h3>🎉 ${this.selectedFramework.charAt(0).toUpperCase() + this.selectedFramework.slice(1)} Component Preview</h3>
        <p>This is a mock preview of your ${this.selectedFramework} component.</p>
        <button style="padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Sample Button
        </button>
      </div>
    `;
  }

  private getDefaultCode(): string {
    const templates = {
      angular: `import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  template: \`
    <div class="example-component">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <button (click)="onClick()">Click me!</button>
    </div>
  \`,
  styles: [\`
    .example-component {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
  \`]
})
export class ExampleComponent {
  title = 'Hello Angular!';
  description = 'This is an example component.';

  onClick() {
    alert('Button clicked!');
  }
}`,

      react: `import React, { useState } from 'react';

export default function ExampleComponent() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Hello React!</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,

      vue: `<template>
  <div class="example-component">
    <h2>{{ title }}</h2>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  name: 'ExampleComponent',
  data() {
    return {
      title: 'Hello Vue!',
      count: 0
    };
  },
  methods: {
    increment() {
      this.count++;
    }
  }
};
</script>

<style scoped>
.example-component {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>`,

      svelte: `<script>
  let title = 'Hello Svelte!';
  let count = 0;

  function increment() {
    count += 1;
  }
</script>

<div class="example-component">
  <h2>{title}</h2>
  <p>Count: {count}</p>
  <button on:click={increment}>Increment</button>
</div>

<style>
  .example-component {
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
</style>`
    };

    return templates[this.selectedFramework];
  }

  private setupCodeEditor() {
    // TODO: Integrate with Monaco Editor or similar for better code editing experience
  }
}