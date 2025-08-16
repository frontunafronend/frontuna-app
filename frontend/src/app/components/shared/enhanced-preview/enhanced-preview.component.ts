import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { MonacoEditorComponent } from '../monaco-editor/monaco-editor.component';
import { GeneratedComponent } from '../../../services/component-state/component-state.service';

@Component({
  selector: 'app-enhanced-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    FormsModule,
    MonacoEditorComponent
  ],
  template: `
    <div class="enhanced-preview-container">
      <!-- Preview Controls -->
      <div class="preview-controls" *ngIf="enablePlayground">
        <div class="control-group">
          <mat-slide-toggle 
            [(ngModel)]="darkMode" 
            (change)="updatePreview()"
            matTooltip="Toggle dark mode">
            Dark Mode
          </mat-slide-toggle>
          
          <mat-slide-toggle 
            [(ngModel)]="responsive" 
            (change)="updatePreview()"
            matTooltip="Toggle responsive view">
            Responsive
          </mat-slide-toggle>
          
          <mat-form-field appearance="outline" class="device-selector">
            <mat-label>Device</mat-label>
            <mat-select [(value)]="selectedDevice" (selectionChange)="updatePreview()">
              <mat-option value="desktop">Desktop</mat-option>
              <mat-option value="tablet">Tablet</mat-option>
              <mat-option value="mobile">Mobile</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-icon-button 
                  (click)="refreshPreview()" 
                  matTooltip="Refresh preview">
            <mat-icon>refresh</mat-icon>
          </button>

          <button mat-icon-button 
                  (click)="toggleFullscreen()" 
                  matTooltip="Toggle fullscreen">
            <mat-icon>{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Main Preview Area -->
      <div class="preview-main" [class.fullscreen]="isFullscreen()">
        <mat-tab-group class="preview-tabs" animationDuration="300ms">
          
          <!-- Live Preview Tab -->
          <mat-tab label="Live Preview">
            <div class="preview-viewport" [ngClass]="getViewportClass()">
              <div class="preview-frame" 
                   [class.dark-mode]="darkMode"
                   [innerHTML]="safePreviewHtml()">
              </div>
              
              <!-- Preview Overlay with Info -->
              <div class="preview-overlay" *ngIf="showOverlay()">
                <div class="overlay-content">
                  <mat-icon>info</mat-icon>
                  <p>{{ overlayMessage() }}</p>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Code Editor Tabs -->
          <mat-tab label="Component" *ngIf="component?.code?.html || component?.code?.javascript || component?.code?.typescript">
            <div class="code-editor-container">
              <app-monaco-editor
                [value]="getComponentCode()"
                [language]="getEditorLanguage()"
                [height]="editorHeight()"
                [minHeight]="400"
                [maxHeight]="1200"
                [title]="'Component Code'"
                [readonly]="!enableEditing"
                (valueChange)="onCodeChange('component', $event)">
              </app-monaco-editor>
            </div>
          </mat-tab>

          <mat-tab label="Styles" *ngIf="component?.code?.css">
            <div class="code-editor-container">
              <app-monaco-editor
                [value]="component?.code?.css || ''"
                [language]="'css'"
                [height]="editorHeight()"
                [minHeight]="400"
                [maxHeight]="1200"
                [title]="'Stylesheet'"
                [readonly]="!enableEditing"
                (valueChange)="onCodeChange('styles', $event)">
              </app-monaco-editor>
            </div>
          </mat-tab>

          <mat-tab label="Types" *ngIf="component?.code?.typescript">
            <div class="code-editor-container">
              <app-monaco-editor
                [value]="component?.code?.typescript || ''"
                [language]="'typescript'"
                [height]="editorHeight()"
                [minHeight]="400"
                [maxHeight]="1200"
                [title]="'Type Definitions'"
                [readonly]="!enableEditing"
                (valueChange)="onCodeChange('types', $event)">
              </app-monaco-editor>
            </div>
          </mat-tab>

          <!-- Component Info Tab -->
          <mat-tab label="Info">
            <div class="component-info">
              <div class="info-section">
                <h3>Component Details</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Name:</span>
                    <span class="info-value">{{ component?.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Framework:</span>
                    <span class="info-value">{{ component?.framework }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Category:</span>
                    <span class="info-value">{{ component?.category }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Design System:</span>
                    <span class="info-value">{{ component?.designFramework }}</span>
                  </div>
                </div>
              </div>

              <div class="info-section" *ngIf="component?.features?.length">
                <h3>Features</h3>
                <div class="features-list">
                  <span class="feature-tag" *ngFor="let feature of component?.features || []">
                    {{ feature }}
                  </span>
                </div>
              </div>

              <div class="info-section" *ngIf="component?.dependencies?.length">
                <h3>Dependencies</h3>
                <div class="dependencies-list">
                  <code class="dependency" *ngFor="let dep of component?.dependencies || []">
                    {{ dep }}
                  </code>
                </div>
              </div>

              <div class="info-section" *ngIf="component?.usage">
                <h3>Usage</h3>
                <p class="usage-text">{{ component?.usage || '' }}</p>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <!-- Action Bar -->
      <div class="action-bar" *ngIf="showActions">
        <div class="action-group">
          <button mat-button (click)="copyCode()" matTooltip="Copy all code">
            <mat-icon>content_copy</mat-icon>
            Copy Code
          </button>
          
          <button mat-button (click)="downloadComponent()" matTooltip="Download as files">
            <mat-icon>download</mat-icon>
            Download
          </button>
          
          <button mat-button (click)="shareComponent()" matTooltip="Share component">
            <mat-icon>share</mat-icon>
            Share
          </button>
        </div>

        <div class="action-group" *ngIf="enablePlayground">
          <button mat-raised-button 
                  color="primary" 
                  (click)="regenerateComponent()" 
                  matTooltip="Generate variations">
            <mat-icon>auto_awesome</mat-icon>
            Regenerate
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .enhanced-preview-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #fafafa;
    }

    .preview-controls {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 16px 20px;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .device-selector {
      width: 120px;
    }

    .preview-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .preview-main.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      background: white;
    }

    .preview-tabs {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .preview-tabs ::ng-deep .mat-mdc-tab-group {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .preview-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
      flex: 1;
      overflow: hidden;
    }

    .preview-tabs ::ng-deep .mat-mdc-tab-body-content {
      height: 100%;
      overflow: hidden;
    }

    .preview-viewport {
      position: relative;
      height: auto;
      min-height: 400px;
      max-height: calc(100vh - 250px);
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin: 20px;
      overflow: auto;
    }

    .preview-viewport.desktop {
      max-width: none;
    }

    .preview-viewport.tablet {
      max-width: 768px;
      margin: 20px auto;
    }

    .preview-viewport.mobile {
      max-width: 375px;
      margin: 20px auto;
    }

    .preview-frame {
      padding: 20px;
      min-height: 100%;
      transition: background-color 0.3s ease;
    }

    .preview-frame.dark-mode {
      background: #1e1e1e;
      color: #e0e0e0;
    }

    .preview-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .overlay-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      max-width: 300px;
    }

    .overlay-content mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #2196f3;
      margin-bottom: 10px;
    }

    .code-editor-container {
      height: auto;
      margin: 20px;
      display: flex;
      flex-direction: column;
      min-height: 400px;
      max-height: calc(100vh - 200px);
    }

    .component-info {
      padding: 20px;
      max-height: 500px;
      overflow-y: auto;
    }

    .info-section {
      margin-bottom: 30px;
    }

    .info-section h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 15px 0;
      color: #333;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .info-label {
      font-weight: 500;
      color: #666;
      font-size: 0.9rem;
    }

    .info-value {
      font-weight: 600;
      color: #333;
    }

    .features-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .feature-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .dependencies-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .dependency {
      background: #f5f5f5;
      color: #d32f2f;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 0.85rem;
    }

    .usage-text {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    .action-bar {
      background: white;
      border-top: 1px solid #e0e0e0;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .action-group {
      display: flex;
      gap: 12px;
    }

    .action-group button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .control-group {
        flex-wrap: wrap;
        gap: 12px;
      }

      .preview-viewport {
        margin: 10px;
        height: auto;
        min-height: 300px;
        max-height: calc(100vh - 200px);
      }

      .preview-viewport.tablet,
      .preview-viewport.mobile {
        margin: 10px;
      }

      .code-editor-container {
        height: auto;
        margin: 10px;
        min-height: 300px;
        max-height: calc(100vh - 150px);
      }

      .action-bar {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .action-group {
        justify-content: center;
      }
    }
  `]
})
export class EnhancedPreviewComponent implements OnInit, OnDestroy {
  @Input() component: GeneratedComponent | null = null;
  @Input() enablePlayground: boolean = false;
  @Input() enableEditing: boolean = false;
  @Input() showActions: boolean = true;
  @Input() initialHeight: number = 700;
  
  @Output() onComponentChange = new EventEmitter<GeneratedComponent>();
  @Output() onRegenerate = new EventEmitter<void>();

  private readonly sanitizer = inject(DomSanitizer);

  // Component state
  public readonly isFullscreen = signal(false);
  public readonly showOverlay = signal(false);
  public readonly overlayMessage = signal('');
  public readonly windowHeight = signal(window.innerHeight);

  // Preview settings
  public darkMode = false;
  public responsive = true;
  public selectedDevice = 'desktop';
  
  // Private properties
  private previewUpdateTimeout: any;

  // Computed properties
  public readonly safePreviewHtml = computed(() => {
    if (!this.component?.preview) return '';
    return this.sanitizer.bypassSecurityTrustHtml(this.component.preview);
  });

  public readonly editorHeight = computed(() => {
    const currentWindowHeight = this.windowHeight();
    
    if (this.isFullscreen()) {
      return currentWindowHeight - 200;
    }
    
    // Use more of the available viewport height for better screen utilization
    const availableHeight = currentWindowHeight - 300; // Account for header, controls, tabs, etc.
    const minHeight = 400; // Minimum readable height
    const maxHeight = 1200; // Maximum practical height
    
    return Math.min(Math.max(availableHeight, minHeight), maxHeight);
  });

  private resizeListener?: () => void;

  ngOnInit(): void {
    // Initialize component
    if (this.component) {
      this.updatePreview();
    }
    
    // Add window resize listener to update editor height dynamically
    this.resizeListener = () => {
      this.windowHeight.set(window.innerHeight);
    };
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    // Cleanup resize listener
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    
    // Cleanup fullscreen
    if (this.isFullscreen()) {
      document.body.style.overflow = '';
    }
  }

  // Preview Controls
  updatePreview(): void {
    // Update preview based on current settings
    this.showOverlay.set(false);
    
    // Simulate responsive/dark mode changes
    if (this.component) {
      // In a real implementation, you might regenerate the preview HTML
      // with different styles based on darkMode and responsive settings
    }
  }

  refreshPreview(): void {
    this.showOverlay.set(true);
    this.overlayMessage.set('Refreshing preview...');
    
    setTimeout(() => {
      this.showOverlay.set(false);
      this.updatePreview();
    }, 1000);
  }

  toggleFullscreen(): void {
    const newFullscreen = !this.isFullscreen();
    this.isFullscreen.set(newFullscreen);
    
    if (newFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // Viewport Management
  getViewportClass(): string {
    return `${this.selectedDevice}${this.responsive ? ' responsive' : ''}`;
  }

  // Code Management
  getComponentCode(): string {
    if (!this.component) return '';
    
    // Return appropriate code based on framework
    if (this.component.framework.toLowerCase() === 'react') {
      return this.component.code.javascript || this.component.code.typescript || '';
    } else if (this.component.framework.toLowerCase() === 'angular') {
      return this.component.code.typescript || '';
    } else if (this.component.framework.toLowerCase() === 'vue') {
      return this.component.code.javascript || '';
    }
    
    return this.component.code.html || '';
  }

  getEditorLanguage(): string {
    if (!this.component) return 'javascript';
    
    const framework = this.component.framework.toLowerCase();
    if (framework === 'angular' || this.component.code.typescript) {
      return 'typescript';
    } else if (framework === 'react' || framework === 'vue') {
      return 'javascript';
    }
    
    return 'html';
  }

  onCodeChange(codeType: string, newValue: string): void {
    if (!this.component || !this.enableEditing) return;
    
    console.log('Code change detected:', codeType, newValue.length + ' characters');
    
    // Update the component code
    switch (codeType) {
      case 'component':
        if (this.component.framework.toLowerCase() === 'react') {
          this.component.code.javascript = newValue;
        } else if (this.component.framework.toLowerCase() === 'angular') {
          this.component.code.typescript = newValue;
        } else if (this.component.framework.toLowerCase() === 'vue') {
          this.component.code.javascript = newValue;
        } else {
          // Default to HTML for other frameworks
          this.component.code.html = newValue;
        }
        break;
      case 'styles':
        this.component.code.css = newValue;
        break;
      case 'types':
        this.component.code.typescript = newValue;
        break;
      case 'html':
        this.component.code.html = newValue;
        break;
    }
    
    // Emit change event for parent components to save
    this.onComponentChange.emit(this.component);
    
    // Update preview after a delay
    clearTimeout(this.previewUpdateTimeout);
    this.previewUpdateTimeout = setTimeout(() => {
      this.updatePreview();
    }, 500);
  }

  // Actions
  copyCode(): void {
    if (!this.component) return;
    
    const allCode = [
      '// Component Code',
      this.getComponentCode(),
      '',
      '// Styles',
      this.component.code.css,
      '',
      '// Types (if applicable)',
      this.component.code.typescript || ''
    ].join('\n');
    
    navigator.clipboard.writeText(allCode).then(() => {
      this.showToast('Code copied to clipboard!');
    });
  }

  downloadComponent(): void {
    if (!this.component) return;
    
    // Create downloadable files
    const files = [];
    
    if (this.component.code.html) {
      files.push({
        name: `${this.component.name.replace(/\s+/g, '-').toLowerCase()}.html`,
        content: this.component.code.html
      });
    }
    
    if (this.component.code.css) {
      files.push({
        name: `${this.component.name.replace(/\s+/g, '-').toLowerCase()}.css`,
        content: this.component.code.css
      });
    }
    
    if (this.component.code.javascript) {
      files.push({
        name: `${this.component.name.replace(/\s+/g, '-').toLowerCase()}.js`,
        content: this.component.code.javascript
      });
    }
    
    if (this.component.code.typescript) {
      files.push({
        name: `${this.component.name.replace(/\s+/g, '-').toLowerCase()}.ts`,
        content: this.component.code.typescript
      });
    }
    
    // In a real implementation, you'd create a ZIP file or individual downloads
    this.showToast(`Would download ${files.length} files`);
  }

  shareComponent(): void {
    if (!this.component) return;
    
    // Generate share URL
    const shareUrl = `${window.location.origin}/component/${this.component.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: this.component.name,
        text: this.component.description,
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.showToast('Share URL copied to clipboard!');
      });
    }
  }

  regenerateComponent(): void {
    this.showOverlay.set(true);
    this.overlayMessage.set('Generating variations...');
    
    // Simulate regeneration
    setTimeout(() => {
      this.showOverlay.set(false);
      this.showToast('Component regenerated with variations!');
    }, 2000);
  }

  private showToast(message: string): void {
    // In a real implementation, you'd use a proper toast service
    console.log('Toast:', message);
  }
}