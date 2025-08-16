import { Component, inject, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { GeneratedComponent } from '@app/models/component.model';
import { MonacoPlaygroundComponent, PlaygroundCode } from './monaco-playground/monaco-playground.component';

@Component({
  selector: 'app-enhanced-preview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MonacoPlaygroundComponent
  ],
  template: `
    <div class="enhanced-preview-container" [class.compact]="isCompact">
      @if (!isCompact) {
        <div class="preview-header">
          <div class="preview-title">
            <mat-icon>preview</mat-icon>
            <h3>Enhanced Preview</h3>
          </div>
          <div class="preview-controls">
            @if (enablePlayground) {
              <mat-slide-toggle 
                [(ngModel)]="playgroundEnabled"
                (change)="togglePlayground()"
                matTooltip="Toggle Code Editor">
                <mat-icon>code</mat-icon>
              </mat-slide-toggle>
            }
            <button mat-button 
                    (click)="togglePreviewMode()"
                    [class.active]="showEnhancedPreview()">
              <mat-icon>{{ showEnhancedPreview() ? 'visibility' : 'visibility_off' }}</mat-icon>
              {{ showEnhancedPreview() ? 'Enhanced' : 'Basic' }}
            </button>
            <button mat-icon-button 
                    (click)="refreshPreview()"
                    matTooltip="Refresh Preview">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </div>
      }

      @if (component) {
        <div class="preview-content" [class.playground-mode]="showPlayground()">
          @if (showPlayground()) {
            <!-- Playground Mode -->
            <div class="playground-container">
              <div class="playground-pane">
                <app-monaco-playground
                  [initialCode]="getPlaygroundCode()"
                  (codeChange)="onPlaygroundCodeChange($event)"
                  (themeChange)="onPlaygroundThemeChange($event)">
                </app-monaco-playground>
              </div>
              <div class="preview-pane">
                <div class="preview-header">
                  <mat-icon>preview</mat-icon>
                  <span>Live Preview</span>
                </div>
                <div class="live-preview">
                  <div class="preview-frame" #previewFrame>
                    @if (showEnhancedPreview() || isCompact) {
                      <iframe #enhancedIframe 
                              [src]="livePreviewUrl" 
                              frameborder="0"
                              sandbox="allow-scripts allow-same-origin"
                              (load)="onIframeLoad()">
                      </iframe>
                    } @else {
                      <div class="basic-preview" [innerHTML]="livePreviewHtml"></div>
                    }
                  </div>
                </div>
              </div>
            </div>
          } @else {
            <!-- Normal Preview Mode -->
            @if (!isCompact) {
              <!-- Design Framework Info -->
              <div class="design-framework-info">
                <div class="framework-badge" [style.background-color]="getDesignFrameworkColor()">
                  <mat-icon>{{ getDesignFrameworkIcon() }}</mat-icon>
                  <span>{{ getDesignFrameworkLabel() }}</span>
                </div>
                
                @if ((component.designDependencies && component.designDependencies.bootstrap) || (component.designDependencies && component.designDependencies.materialDesign)) {
                  <div class="dependencies-info">
                    <h4>Required Dependencies:</h4>
                    <div class="dependency-list">
                      @if (component.designDependencies && component.designDependencies.bootstrap) {
                        <div class="dependency-item bootstrap">
                          <mat-icon>grid_3x3</mat-icon>
                          <div class="dependency-details">
                            <strong>Bootstrap {{ component.designDependencies.bootstrap.version }}</strong>
                            <small>{{ component.designDependencies.bootstrap.cdnUrl }}</small>
                          </div>
                        </div>
                      }
                      @if (component.designDependencies && component.designDependencies.materialDesign) {
                        <div class="dependency-item material">
                          <mat-icon>palette</mat-icon>
                          <div class="dependency-details">
                            <strong>Material Design {{ component.designDependencies.materialDesign.version }}</strong>
                            <small>{{ component.designDependencies.materialDesign.cdnUrl }}</small>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Preview Iframe -->
            <div class="preview-frame-container">
              @if (!isCompact) {
                <div class="preview-frame-header">
                  <div class="frame-controls">
                    <div class="frame-dot red"></div>
                    <div class="frame-dot yellow"></div>
                    <div class="frame-dot green"></div>
                  </div>
                  <div class="frame-title">Component Preview</div>
                  <div class="frame-actions">
                    <button mat-icon-button 
                            (click)="copyPreviewCode()"
                            matTooltip="Copy Preview HTML">
                      <mat-icon>content_copy</mat-icon>
                    </button>
                  </div>
                </div>
              }
              
              <div class="preview-frame" #previewFrame>
                @if (showEnhancedPreview() || isCompact) {
                  <iframe #enhancedIframe 
                          [src]="enhancedPreviewUrl" 
                          frameborder="0"
                          sandbox="allow-scripts allow-same-origin"
                          (load)="onIframeLoad()">
                  </iframe>
                } @else {
                  <div class="basic-preview" [innerHTML]="basicPreviewHtml"></div>
                }
              </div>
            </div>

            @if (!isCompact) {
              <!-- Preview Options -->
              <div class="preview-options">
                <mat-chip-set>
                  <mat-chip (click)="setViewportSize('mobile')" 
                            [class.selected]="viewportSize() === 'mobile'">
                    <mat-icon>smartphone</mat-icon>
                    Mobile
                  </mat-chip>
                  <mat-chip (click)="setViewportSize('tablet')" 
                            [class.selected]="viewportSize() === 'tablet'">
                    <mat-icon>tablet</mat-icon>
                    Tablet
                  </mat-chip>
                  <mat-chip (click)="setViewportSize('desktop')" 
                            [class.selected]="viewportSize() === 'desktop'">
                    <mat-icon>desktop_windows</mat-icon>
                    Desktop
                  </mat-chip>
                </mat-chip-set>
              </div>
            }
          }
        </div>
      } @else {
        <div class="empty-preview">
          <mat-icon>code</mat-icon>
          <h3>No Component to Preview</h3>
          <p>Generate a component to see the enhanced preview</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .enhanced-preview-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #f8f9fa;
      border-radius: 12px;
      overflow: hidden;
    }

    .enhanced-preview-container.compact {
      height: 100%;
      background: transparent;
      border-radius: 0;
    }

    .enhanced-preview-container.compact .preview-content {
      padding: 0;
      height: 100%;
    }

    .enhanced-preview-container.compact .preview-frame-container {
      height: 100%;
      border: none;
      border-radius: 0;
    }

    .enhanced-preview-container.compact .preview-frame {
      min-height: 100%;
      border-radius: 0;
    }

    .enhanced-preview-container.compact .preview-frame iframe {
      transform: scale(0.8);
      transform-origin: top left;
      width: 125%;
      height: 125%;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: white;
      border-bottom: 1px solid #e0e0e0;
    }

    .preview-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .preview-title h3 {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .preview-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .preview-controls button.active {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .preview-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    /* Playground Mode Styles */
    .preview-content.playground-mode {
      padding: 0;
      gap: 0;
    }

    .playground-container {
      display: flex;
      height: 100%;
      gap: 1rem;
      padding: 1rem;
    }

    .playground-pane {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .preview-pane {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
    }

    .preview-pane .preview-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
      font-weight: 600;
      color: #333;
    }

    .preview-pane .preview-header mat-icon {
      color: #667eea;
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .live-preview {
      flex: 1;
      overflow: hidden;
    }

    .live-preview .preview-frame {
      height: 100%;
    }

    .live-preview .preview-frame iframe {
      width: 100%;
      height: 100%;
    }

    .design-framework-info {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid #e0e0e0;
    }

    .framework-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .dependencies-info h4 {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #333;
    }

    .dependency-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .dependency-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .dependency-item.bootstrap {
      border-left-color: #7952b3;
    }

    .dependency-item.material {
      border-left-color: #4caf50;
    }

    .dependency-details {
      flex: 1;
    }

    .dependency-details strong {
      display: block;
      font-size: 0.9rem;
      color: #333;
    }

    .dependency-details small {
      font-size: 0.8rem;
      color: #666;
      font-family: monospace;
    }

    .preview-frame-container {
      flex: 1;
      background: white;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .preview-frame-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .frame-controls {
      display: flex;
      gap: 0.5rem;
    }

    .frame-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .frame-dot.red { background: #ff5f56; }
    .frame-dot.yellow { background: #ffbd2e; }
    .frame-dot.green { background: #27ca3f; }

    .frame-title {
      font-size: 0.9rem;
      font-weight: 500;
      color: #666;
    }

    .preview-frame {
      flex: 1;
      position: relative;
      min-height: 600px;
    }

    .preview-frame iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .basic-preview {
      width: 100%;
      height: 100%;
      padding: 2rem;
      overflow: auto;
    }

    .preview-options {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid #e0e0e0;
    }

    .preview-options mat-chip {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .preview-options mat-chip.selected {
      background: #667eea;
      color: white;
    }

    .preview-options mat-chip:hover {
      background: rgba(102, 126, 234, 0.1);
    }

    .empty-preview {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #666;
      text-align: center;
    }

    .empty-preview mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #ddd;
      margin-bottom: 1rem;
    }

    /* Responsive viewport sizes */
    .preview-frame.mobile iframe,
    .preview-frame.mobile .basic-preview {
      max-width: 375px;
      margin: 0 auto;
    }

    .preview-frame.tablet iframe,
    .preview-frame.tablet .basic-preview {
      max-width: 768px;
      margin: 0 auto;
    }

    /* Responsive Playground Styles */
    @media (max-width: 768px) {
      .playground-container {
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem;
      }

      .playground-pane,
      .preview-pane {
        min-height: 400px;
      }

      .preview-pane .preview-header {
        padding: 0.75rem 1rem;
      }
    }
  `]
})
export class EnhancedPreviewComponent implements OnChanges {
  @Input() component: GeneratedComponent | null = null;
  @Input() isCompact: boolean = false;
  @Input() enablePlayground: boolean = false;
  @ViewChild('enhancedIframe') enhancedIframe?: ElementRef<HTMLIFrameElement>;
  @ViewChild('previewFrame') previewFrame?: ElementRef;

  private readonly sanitizer = inject(DomSanitizer);

  // Signals for reactive state
  public readonly showEnhancedPreview = signal(true);
  public readonly viewportSize = signal<'mobile' | 'tablet' | 'desktop'>('desktop');
  public readonly showPlayground = signal(false);
  public readonly playgroundCode = signal<PlaygroundCode>({
    html: '',
    typescript: '',
    scss: ''
  });
  public readonly livePreviewComponent = signal<GeneratedComponent | null>(null);
  
  public enhancedPreviewUrl: string = 'about:blank';
  public basicPreviewHtml: SafeHtml = '';
  public livePreviewUrl: string = 'about:blank';
  public livePreviewHtml: SafeHtml = '';
  public playgroundEnabled = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['component'] && this.component) {
      this.updatePreview();
    }
  }

  togglePreviewMode(): void {
    this.showEnhancedPreview.set(!this.showEnhancedPreview());
    this.updatePreview();
  }

  setViewportSize(size: 'mobile' | 'tablet' | 'desktop'): void {
    this.viewportSize.set(size);
    if (this.previewFrame) {
      this.previewFrame.nativeElement.className = `preview-frame ${size}`;
    }
  }

  refreshPreview(): void {
    this.updatePreview();
  }

  private updatePreview(): void {
    if (!this.component) return;

    if (this.showEnhancedPreview()) {
      this.createEnhancedPreview();
    } else {
      this.createBasicPreview();
    }
  }

  private createEnhancedPreview(): void {
    if (!this.component) return;

    const htmlContent = this.generateEnhancedHTML();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    this.enhancedPreviewUrl = URL.createObjectURL(blob);
  }

  private createBasicPreview(): void {
    if (!this.component) return;
    
    const preview = this.component.preview || this.component.code.html || '<p>No preview available</p>';
    this.basicPreviewHtml = this.sanitizer.bypassSecurityTrustHtml(preview);
  }

  private generateEnhancedHTML(): string {
    if (!this.component) return '';

    const bootstrap = this.component.designDependencies && this.component.designDependencies.bootstrap;
    const material = this.component.designDependencies && this.component.designDependencies.materialDesign;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Preview</title>
    
    ${bootstrap ? `
    <!-- Bootstrap CSS -->
    <link href="${bootstrap.cdnUrl}" rel="stylesheet">
    ` : ''}
    
    ${material ? `
    <!-- Material Design Icons -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <!-- Material Components Web -->
    <link href="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css" rel="stylesheet">
    ` : ''}
    
    <!-- Component CSS -->
    <style>
      body {
        margin: 0;
        padding: 20px;
        font-family: 'Roboto', Arial, sans-serif;
        background: #f8f9fa;
      }
      
      .preview-container {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      ${this.component.code.css || ''}
    </style>
</head>
<body>
    <div class="preview-container">
        ${this.component.code.html || ''}
    </div>
    
    ${bootstrap ? `
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    ` : ''}
    
    ${material ? `
    <!-- Material Components Web JS -->
    <script src="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"></script>
    <script>mdc.autoInit();</script>
    ` : ''}
    
    <!-- Component JavaScript -->
    <script>
      ${this.component.code.javascript || ''}
    </script>
</body>
</html>`;
  }

  onIframeLoad(): void {
    // Handle iframe load event if needed
  }

  copyPreviewCode(): void {
    const htmlContent = this.generateEnhancedHTML();
    navigator.clipboard.writeText(htmlContent).then(() => {
      // Could show a toast notification here
      console.log('Preview HTML copied to clipboard');
    });
  }

  getDesignFrameworkColor(): string {
    switch (this.component?.designFramework) {
      case 'bootstrap': return '#7952b3';
      case 'bootstrap-material': return '#4caf50';
      default: return '#1976d2';
    }
  }

  getDesignFrameworkIcon(): string {
    switch (this.component?.designFramework) {
      case 'bootstrap': return 'grid_3x3';
      case 'bootstrap-material': return 'palette';
      default: return 'css';
    }
  }

  getDesignFrameworkLabel(): string {
    switch (this.component?.designFramework) {
      case 'bootstrap': return 'Bootstrap 5';
      case 'bootstrap-material': return 'Bootstrap + Material';
      default: return 'Plain CSS';
    }
  }

  // Playground Methods
  public togglePlayground(): void {
    this.playgroundEnabled = !this.playgroundEnabled;
    this.showPlayground.set(this.playgroundEnabled);
    
    if (this.playgroundEnabled && this.component) {
      // Initialize playground with current component code
      this.initializePlaygroundCode();
      this.livePreviewComponent.set({ ...this.component });
    }
  }

  public getPlaygroundCode(): PlaygroundCode {
    return this.playgroundCode();
  }

  public onPlaygroundCodeChange(newCode: PlaygroundCode): void {
    this.playgroundCode.set(newCode);
    
    // Update live preview with new code
    if (this.component) {
      const updatedComponent = {
        ...this.component,
        code: {
          ...this.component.code,
          html: newCode.html,
          typescript: newCode.typescript,
          javascript: newCode.typescript, // For backward compatibility
          css: newCode.scss,
          scss: newCode.scss
        },
        preview: newCode.html,
        previewWithDesign: this.generatePreviewWithDesign(newCode.html, newCode.scss, this.component.designFramework)
      };
      
      this.livePreviewComponent.set(updatedComponent);
      this.updateLivePreview(updatedComponent);
    }
  }

  public onPlaygroundThemeChange(isDarkMode: boolean): void {
    // Handle theme change for the playground
    console.log('Playground theme changed to:', isDarkMode ? 'dark' : 'light');
  }

  private initializePlaygroundCode(): void {
    if (!this.component) return;
    
    this.playgroundCode.set({
      html: this.component.code?.html || this.component.preview || '',
      typescript: this.component.code?.typescript || this.component.code?.javascript || this.generateDefaultTypeScript(),
      scss: this.component.code?.css || this.generateDefaultCSS()
    });
  }

  private updateLivePreview(component: GeneratedComponent): void {
    const htmlContent = this.generateLivePreviewHTML(component);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    this.livePreviewUrl = URL.createObjectURL(blob);
    
    // Also update basic preview HTML
    this.livePreviewHtml = this.sanitizer.bypassSecurityTrustHtml(component.preview || component.code?.html || '');
  }

  private generateLivePreviewHTML(component: GeneratedComponent): string {
    const bootstrap = component.designDependencies?.bootstrap;
    const material = component.designDependencies?.materialDesign;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    
    ${bootstrap ? `
    <!-- Bootstrap CSS -->
    <link href="${bootstrap.cdnUrl}" rel="stylesheet">
    ` : ''}
    
    ${material ? `
    <!-- Material Design Icons -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <!-- Material Components Web -->
    <link href="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css" rel="stylesheet">
    ` : ''}
    
    <!-- Component CSS -->
    <style>
      body {
        margin: 0;
        padding: 20px;
        font-family: 'Roboto', Arial, sans-serif;
        background: #f8f9fa;
      }
      
      .preview-container {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      ${component.code?.css || ''}
    </style>
</head>
<body>
    <div class="preview-container">
        ${component.code?.html || component.preview || '<p>No content to preview</p>'}
    </div>
    
    ${bootstrap ? `
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    ` : ''}
    
    ${material ? `
    <!-- Material Components Web JS -->
    <script src="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"></script>
    ` : ''}
</body>
</html>`;
  }

  private generatePreviewWithDesign(html: string, scss: string, designFramework?: string): string {
    // This method generates preview HTML with embedded styles for live updates
    return `
      <div class="live-component">
        <style>
          .live-component {
            padding: 1rem;
            background: white;
            border-radius: 8px;
          }
          ${scss}
        </style>
        ${html}
      </div>
    `;
  }

  private generateDefaultTypeScript(): string {
    return `import { Component } from '@angular/core';

@Component({
  selector: 'app-component',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class ComponentClass {
  // Add your component logic here
  constructor() {}
}`;
  }

  private generateDefaultCSS(): string {
    return `/* Component Styles */
.component {
  /* Add your styles here */
}`;
  }
}