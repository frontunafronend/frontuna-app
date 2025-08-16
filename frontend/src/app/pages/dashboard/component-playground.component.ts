import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import { FrameworkPreviewComponent } from '@app/components/preview/framework-preview/framework-preview.component';
import { ThemeSwitcherComponent } from '@app/components/preview/theme-switcher/theme-switcher.component';
import { AICopilotPanelComponent } from '@app/components/ai/ai-copilot-panel/ai-copilot-panel.component';
import { PreviewTheme, ViewportSize, DEFAULT_VIEWPORT_SIZES, DEFAULT_THEMES } from '@app/models/preview.model';
import { NotificationService } from '@app/services/notification/notification.service';

@Component({
  selector: 'app-component-playground',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSliderModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    FrameworkPreviewComponent,
    ThemeSwitcherComponent,
    AICopilotPanelComponent
  ],
  template: `
    <div class="playground-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>
              <mat-icon class="page-icon">code</mat-icon>
              Component Playground
            </h1>
            <p>Interactive environment for building and testing components</p>
          </div>
          
          <div class="header-controls">
            <!-- Theme Switcher -->
            <app-theme-switcher
              [initialTheme]="currentTheme()"
              (onThemeChange)="handleThemeChange($event)">
            </app-theme-switcher>
            
            <!-- Viewport Selector -->
            <mat-form-field appearance="outline">
              <mat-label>Viewport</mat-label>
              <mat-select [(value)]="selectedViewport" (selectionChange)="onViewportChange()">
                <mat-option *ngFor="let viewport of viewportSizes" [value]="viewport">
                  {{ viewport.name }} ({{ viewport.width }}x{{ viewport.height }})
                </mat-option>
              </mat-select>
            </mat-form-field>
            
            <!-- Zoom Control -->
            <div class="zoom-control">
              <mat-icon>zoom_in</mat-icon>
              <mat-slider min="25" max="200" step="25" discrete>
                <input matSliderThumb [(ngModel)]="zoomLevel" (ngModelChange)="onZoomChange()">
              </mat-slider>
              <span class="zoom-value">{{ zoomLevel }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="page-content">
        <div class="playground-layout">
          <!-- Left Panel - Code Editor -->
          <div class="editor-panel">
            <app-framework-preview
              [initialCode]="initialCode"
              [initialFramework]="selectedFramework"
              (onCodeChangeEvent)="handleCodeChange($event)"
              (onFrameworkChangeEvent)="handleFrameworkChange($event)"
              (onPreviewReady)="handlePreviewReady($event)">
            </app-framework-preview>
          </div>

          <!-- Center Panel - Live Preview -->
          <div class="preview-panel">
            <div class="preview-header">
              <div class="preview-title">
                <mat-icon>visibility</mat-icon>
                <span>Live Preview</span>
              </div>
              
              <div class="preview-controls">
                <button mat-icon-button 
                        matTooltip="Toggle Grid"
                        [color]="showGrid() ? 'accent' : ''"
                        (click)="toggleGrid()">
                  <mat-icon>grid_on</mat-icon>
                </button>
                
                <button mat-icon-button 
                        matTooltip="Toggle Rulers"
                        [color]="showRulers() ? 'accent' : ''"
                        (click)="toggleRulers()">
                  <mat-icon>straighten</mat-icon>
                </button>
                
                <button mat-icon-button 
                        matTooltip="Fullscreen Preview"
                        (click)="toggleFullscreen()">
                  <mat-icon>fullscreen</mat-icon>
                </button>
                
                <button mat-icon-button [matMenuTriggerFor]="exportMenu" matTooltip="Export">
                  <mat-icon>download</mat-icon>
                </button>
              </div>
            </div>
            
            <div class="preview-container" 
                 [class.show-grid]="showGrid()"
                 [class.show-rulers]="showRulers()">
              
              <!-- Rulers -->
              <div class="ruler ruler-horizontal" *ngIf="showRulers()">
                <div class="ruler-marks"></div>
              </div>
              <div class="ruler ruler-vertical" *ngIf="showRulers()">
                <div class="ruler-marks"></div>
              </div>
              
              <!-- Preview Viewport -->
              <div class="preview-viewport" 
                   [style.width.px]="selectedViewport.width"
                   [style.height.px]="selectedViewport.height"
                   [style.transform]="'scale(' + (zoomLevel / 100) + ')'">
                
                <div class="viewport-content" 
                     [style.background]="currentTheme().colors.background"
                     [style.color]="currentTheme().colors.text"
                     [style.font-family]="currentTheme().typography.fontFamily">
                  
                  <!-- Dynamic Component Preview -->
                  <div class="component-preview" [innerHTML]="previewHTML()"></div>
                </div>
                
                <!-- Viewport Label -->
                <div class="viewport-label">
                  {{ selectedViewport.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- Right Panel - AI Copilot -->
          <div class="copilot-panel" [class.collapsed]="isCopilotCollapsed()">
            <div class="panel-header">
              <h3>AI Assistant</h3>
              <button mat-icon-button (click)="toggleCopilot()">
                <mat-icon>{{ isCopilotCollapsed() ? 'chevron_left' : 'chevron_right' }}</mat-icon>
              </button>
            </div>
            
            <div class="panel-content" *ngIf="!isCopilotCollapsed()">
              <app-ai-copilot-panel
                [context]="currentCode()"
                [isActive]="true"
                (onResponseReceived)="handleAIResponse($event)">
              </app-ai-copilot-panel>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Menu -->
      <mat-menu #exportMenu="matMenu">
        <button mat-menu-item (click)="exportAs('codesandbox')">
          <mat-icon>launch</mat-icon>
          <span>Open in CodeSandbox</span>
        </button>
        <button mat-menu-item (click)="exportAs('stackblitz')">
          <mat-icon>launch</mat-icon>
          <span>Open in StackBlitz</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="exportAs('zip')">
          <mat-icon>folder_zip</mat-icon>
          <span>Download as ZIP</span>
        </button>
        <button mat-menu-item (click)="exportAs('github')">
          <mat-icon>code</mat-icon>
          <span>Export to GitHub</span>
        </button>
      </mat-menu>

      <!-- Fullscreen Overlay -->
      <div class="fullscreen-overlay" *ngIf="isFullscreen()" (click)="toggleFullscreen()">
        <div class="fullscreen-content" (click)="$event.stopPropagation()">
          <div class="fullscreen-header">
            <h2>Fullscreen Preview</h2>
            <button mat-icon-button (click)="toggleFullscreen()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="fullscreen-preview" [innerHTML]="previewHTML()"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .playground-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
    }

    .page-header {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 16px 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1600px;
      margin: 0 auto;
    }

    .header-info h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 500;
    }

    .page-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #4caf50;
    }

    .header-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .zoom-control {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 150px;
    }

    .zoom-control mat-slider {
      flex: 1;
    }

    .zoom-value {
      font-size: 12px;
      color: #666;
      min-width: 35px;
    }

    .page-content {
      flex: 1;
      overflow: hidden;
      padding: 16px;
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
    }

    .playground-layout {
      display: grid;
      grid-template-columns: 1fr 2fr 350px;
      gap: 16px;
      height: 100%;
    }

    .editor-panel,
    .preview-panel {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .preview-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .preview-controls {
      display: flex;
      gap: 4px;
    }

    .preview-container {
      flex: 1;
      position: relative;
      overflow: auto;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .preview-container.show-grid {
      background-image: 
        linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px);
      background-size: 20px 20px;
    }

    .ruler {
      position: absolute;
      background: #fff;
      border: 1px solid #ddd;
      z-index: 10;
    }

    .ruler-horizontal {
      top: 0;
      left: 25px;
      right: 0;
      height: 25px;
    }

    .ruler-vertical {
      top: 25px;
      left: 0;
      bottom: 0;
      width: 25px;
    }

    .preview-viewport {
      position: relative;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      transform-origin: center;
      transition: transform 0.3s ease;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .viewport-content {
      width: 100%;
      height: 100%;
      padding: 16px;
      overflow: auto;
    }

    .component-preview {
      width: 100%;
      height: 100%;
    }

    .viewport-label {
      position: absolute;
      top: -30px;
      left: 0;
      background: #333;
      color: white;
      padding: 4px 8px;
      font-size: 11px;
      border-radius: 4px;
    }

    .copilot-panel {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .copilot-panel.collapsed {
      width: 60px;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .collapsed .panel-header h3 {
      display: none;
    }

    .panel-content {
      height: calc(100% - 60px);
      overflow: hidden;
    }

    .fullscreen-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.9);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .fullscreen-content {
      width: 90vw;
      height: 90vh;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .fullscreen-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .fullscreen-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }

    .fullscreen-preview {
      flex: 1;
      padding: 20px;
      overflow: auto;
    }

    @media (max-width: 1400px) {
      .playground-layout {
        grid-template-columns: 1fr 1.5fr 300px;
      }
    }

    @media (max-width: 1200px) {
      .playground-layout {
        grid-template-columns: 1fr;
        grid-template-rows: 400px 1fr auto;
      }
      
      .copilot-panel {
        max-height: 300px;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }
      
      .header-controls {
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .zoom-control {
        min-width: 120px;
      }
      
      .page-content {
        padding: 8px;
      }
    }
  `]
})
export class ComponentPlaygroundComponent implements OnInit {
  @ViewChild('previewContainer') previewContainer!: ElementRef;

  private readonly notificationService = inject(NotificationService);

  // State
  selectedFramework: 'angular' | 'react' | 'vue' | 'svelte' = 'angular';
  selectedViewport: ViewportSize = DEFAULT_VIEWPORT_SIZES[2]; // Desktop
  zoomLevel = 100;
  
  readonly currentTheme = signal<PreviewTheme>(DEFAULT_THEMES[0]);
  readonly currentCode = signal<string>('');
  readonly previewHTML = signal<string>('');
  readonly showGrid = signal<boolean>(false);
  readonly showRulers = signal<boolean>(false);
  readonly isFullscreen = signal<boolean>(false);
  readonly isCopilotCollapsed = signal<boolean>(false);

  // Viewport sizes
  viewportSizes = DEFAULT_VIEWPORT_SIZES;

  // Initial code
  initialCode = `import { Component } from '@angular/core';

@Component({
  selector: 'app-playground',
  template: \`
    <div class="playground-component">
      <h2>Welcome to the Playground!</h2>
      <p>Start building your component here.</p>
      <button class="demo-button">Click me</button>
    </div>
  \`,
  styles: [\`
    .playground-component {
      padding: 24px;
      text-align: center;
      font-family: 'Roboto', sans-serif;
    }
    
    .demo-button {
      background: #1976d2;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.3s ease;
    }
    
    .demo-button:hover {
      background: #1565c0;
    }
  \`]
})
export class PlaygroundComponent {
  
}`;

  ngOnInit() {
    this.currentCode.set(this.initialCode);
    this.updatePreview();
  }

  handleThemeChange(theme: PreviewTheme) {
    this.currentTheme.set(theme);
    this.updatePreview();
  }

  handleCodeChange(code: string) {
    this.currentCode.set(code);
    this.updatePreview();
  }

  handleFrameworkChange(framework: 'angular' | 'react' | 'vue' | 'svelte') {
    this.selectedFramework = framework;
    this.updatePreview();
  }

  handlePreviewReady(preview: any) {
    if (preview.preview) {
      this.previewHTML.set(preview.preview);
    }
  }

  handleAIResponse(response: any) {
    if (response.code) {
      this.currentCode.set(response.code);
      this.updatePreview();
    }
  }

  onViewportChange() {
    this.updatePreview();
  }

  onZoomChange() {
    // Zoom is handled by CSS transform
  }

  toggleGrid() {
    this.showGrid.update(show => !show);
  }

  toggleRulers() {
    this.showRulers.update(show => !show);
  }

  toggleFullscreen() {
    this.isFullscreen.update(fullscreen => !fullscreen);
  }

  toggleCopilot() {
    this.isCopilotCollapsed.update(collapsed => !collapsed);
  }

  exportAs(format: 'codesandbox' | 'stackblitz' | 'zip' | 'github') {
    switch (format) {
      case 'codesandbox':
        this.exportToCodeSandbox();
        break;
      case 'stackblitz':
        this.exportToStackBlitz();
        break;
      case 'zip':
        this.exportToZip();
        break;
      case 'github':
        this.exportToGitHub();
        break;
    }
  }

  private updatePreview() {
    // Generate preview HTML based on current code and theme
    const theme = this.currentTheme();
    const mockHTML = `
      <div style="padding: 20px; font-family: ${theme.typography.fontFamily}">
        <h2 style="color: ${theme.colors.primary}">
          Component Preview
        </h2>
        <p>This is a preview of your ${this.selectedFramework} component.</p>
        <button style="
          background: ${theme.colors.primary};
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
        ">
          Demo Button
        </button>
      </div>
    `;
    
    this.previewHTML.set(mockHTML);
  }

  private exportToCodeSandbox() {
    this.notificationService.showInfo('Opening in CodeSandbox...');
    // TODO: Implement CodeSandbox export
  }

  private exportToStackBlitz() {
    this.notificationService.showInfo('Opening in StackBlitz...');
    // TODO: Implement StackBlitz export
  }

  private exportToZip() {
    this.notificationService.showInfo('Preparing ZIP download...');
    // TODO: Implement ZIP export
  }

  private exportToGitHub() {
    this.notificationService.showInfo('Exporting to GitHub...');
    // TODO: Implement GitHub export
  }
}