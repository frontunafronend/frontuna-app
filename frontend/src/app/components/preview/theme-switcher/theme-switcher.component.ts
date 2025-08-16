import { Component, OnInit, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';

import { PreviewTheme, DEFAULT_THEMES } from '@app/models/preview.model';
import { NotificationService } from '@app/services/notification/notification.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule
  ],
  template: `
    <div class="theme-switcher">
      <!-- Theme Selector Button -->
      <button mat-button 
              [matMenuTriggerFor]="themeMenu"
              class="theme-trigger"
              [style.background]="currentTheme().colors.primary"
              [style.color]="getContrastColor(currentTheme().colors.primary)">
        <div class="theme-preview">
          <div class="theme-colors">
            <div class="color-dot" [style.background]="currentTheme().colors.primary"></div>
            <div class="color-dot" [style.background]="currentTheme().colors.secondary"></div>
            <div class="color-dot" [style.background]="currentTheme().colors.background"></div>
          </div>
          <span>{{ currentTheme().name }}</span>
        </div>
        <mat-icon>expand_more</mat-icon>
      </button>

      <!-- Theme Menu -->
      <mat-menu #themeMenu="matMenu" class="theme-menu">
        <!-- Preset Themes -->
        <div class="menu-section">
          <div class="section-header">
            <mat-icon>palette</mat-icon>
            <span>Preset Themes</span>
          </div>
          
          <button mat-menu-item 
                  *ngFor="let theme of availableThemes()" 
                  (click)="selectTheme(theme)"
                  [class.active]="currentTheme().id === theme.id">
            <div class="theme-option">
              <div class="theme-colors">
                <div class="color-dot" [style.background]="theme.colors.primary"></div>
                <div class="color-dot" [style.background]="theme.colors.secondary"></div>
                <div class="color-dot" [style.background]="theme.colors.background"></div>
              </div>
              <div class="theme-info">
                <span class="theme-name">{{ theme.name }}</span>
                <span class="theme-type">{{ theme.type }}</span>
              </div>
              <mat-icon *ngIf="currentTheme().id === theme.id" color="primary">check</mat-icon>
            </div>
          </button>
        </div>

        <mat-divider></mat-divider>

        <!-- Quick Actions -->
        <div class="menu-section">
          <button mat-menu-item (click)="openCustomizer()" [matMenuTriggerFor]="customizerMenu">
            <mat-icon>tune</mat-icon>
            <span>Customize Theme</span>
            <mat-icon class="submenu-arrow">chevron_right</mat-icon>
          </button>
          
          <button mat-menu-item (click)="resetToDefault()">
            <mat-icon>refresh</mat-icon>
            <span>Reset to Default</span>
          </button>
          
          <button mat-menu-item (click)="exportTheme()">
            <mat-icon>download</mat-icon>
            <span>Export Theme</span>
          </button>
        </div>
      </mat-menu>

      <!-- Theme Customizer Submenu -->
      <mat-menu #customizerMenu="matMenu" class="customizer-menu">
        <div class="customizer-content" (click)="$event.stopPropagation()">
          <div class="customizer-header">
            <h3>Customize Theme</h3>
            <button mat-icon-button (click)="closeCustomizer()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Color Customization -->
          <div class="customizer-section">
            <h4>Colors</h4>
            <div class="color-controls">
              <div class="color-control">
                <label>Primary</label>
                <input type="color" 
                       [(ngModel)]="customTheme.colors.primary"
                       (ngModelChange)="onCustomThemeChange()">
                <span>{{ customTheme.colors.primary }}</span>
              </div>
              
              <div class="color-control">
                <label>Secondary</label>
                <input type="color" 
                       [(ngModel)]="customTheme.colors.secondary"
                       (ngModelChange)="onCustomThemeChange()">
                <span>{{ customTheme.colors.secondary }}</span>
              </div>
              
              <div class="color-control">
                <label>Background</label>
                <input type="color" 
                       [(ngModel)]="customTheme.colors.background"
                       (ngModelChange)="onCustomThemeChange()">
                <span>{{ customTheme.colors.background }}</span>
              </div>
              
              <div class="color-control">
                <label>Text</label>
                <input type="color" 
                       [(ngModel)]="customTheme.colors.text"
                       (ngModelChange)="onCustomThemeChange()">
                <span>{{ customTheme.colors.text }}</span>
              </div>
            </div>
          </div>

          <!-- Typography -->
          <div class="customizer-section">
            <h4>Typography</h4>
            <div class="typography-controls">
              <mat-form-field appearance="outline">
                <mat-label>Font Family</mat-label>
                <mat-select [(value)]="customTheme.typography.fontFamily" 
                           (selectionChange)="onCustomThemeChange()">
                  <mat-option value="Roboto, sans-serif">Roboto</mat-option>
                  <mat-option value="Inter, sans-serif">Inter</mat-option>
                  <mat-option value="Poppins, sans-serif">Poppins</mat-option>
                  <mat-option value="Montserrat, sans-serif">Montserrat</mat-option>
                  <mat-option value="Open Sans, sans-serif">Open Sans</mat-option>
                </mat-select>
              </mat-form-field>
              
              <div class="slider-control">
                <label>Font Size</label>
                <mat-slider min="12" max="18" step="1" discrete>
                  <input matSliderThumb 
                         [(ngModel)]="fontSizeValue"
                         (ngModelChange)="onFontSizeChange($event)">
                </mat-slider>
                <span>{{ fontSizeValue }}px</span>
              </div>
            </div>
          </div>

          <!-- Spacing -->
          <div class="customizer-section">
            <h4>Spacing</h4>
            <div class="slider-control">
              <label>Base Spacing</label>
              <mat-slider min="4" max="16" step="2" discrete>
                <input matSliderThumb 
                       [(ngModel)]="spacingValue"
                       (ngModelChange)="onSpacingChange($event)">
              </mat-slider>
              <span>{{ spacingValue }}px</span>
            </div>
          </div>

          <!-- Border Radius -->
          <div class="customizer-section">
            <h4>Border Radius</h4>
            <div class="slider-control">
              <label>Corner Roundness</label>
              <mat-slider min="0" max="16" step="2" discrete>
                <input matSliderThumb 
                       [(ngModel)]="borderRadiusValue"
                       (ngModelChange)="onBorderRadiusChange($event)">
              </mat-slider>
              <span>{{ borderRadiusValue }}px</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="customizer-actions">
            <button mat-stroked-button (click)="resetCustomTheme()">
              <mat-icon>refresh</mat-icon>
              Reset
            </button>
            <button mat-flat-button color="primary" (click)="applyCustomTheme()">
              <mat-icon>check</mat-icon>
              Apply Theme
            </button>
          </div>
        </div>
      </mat-menu>

      <!-- Theme Preview Card (when expanded) -->
      <mat-card *ngIf="showPreview()" class="theme-preview-card">
        <mat-card-header>
          <mat-card-title>Theme Preview</mat-card-title>
          <button mat-icon-button (click)="togglePreview()">
            <mat-icon>close</mat-icon>
          </button>
        </mat-card-header>
        
        <mat-card-content>
          <div class="preview-demo" 
               [style.background]="currentTheme().colors.background"
               [style.color]="currentTheme().colors.text"
               [style.font-family]="currentTheme().typography.fontFamily"
               [style.font-size]="currentTheme().typography.fontSize"
               [style.border-radius]="currentTheme().borderRadius">
            
            <h3 [style.color]="currentTheme().colors.primary">Sample Heading</h3>
            <p>This is how text will look with the current theme settings.</p>
            
            <div class="preview-buttons">
              <button class="preview-btn primary" 
                      [style.background]="currentTheme().colors.primary"
                      [style.color]="getContrastColor(currentTheme().colors.primary)"
                      [style.border-radius]="currentTheme().borderRadius">
                Primary Button
              </button>
              
              <button class="preview-btn secondary" 
                      [style.background]="currentTheme().colors.secondary"
                      [style.color]="getContrastColor(currentTheme().colors.secondary)"
                      [style.border-radius]="currentTheme().borderRadius">
                Secondary Button
              </button>
            </div>
            
            <div class="preview-card" 
                 [style.background]="currentTheme().colors.surface"
                 [style.border]="'1px solid ' + currentTheme().colors.border"
                 [style.border-radius]="currentTheme().borderRadius">
              <h4>Sample Card</h4>
              <p>Card content with surface background.</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .theme-switcher {
      position: relative;
    }

    .theme-trigger {
      min-width: 160px;
      padding: 8px 12px;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .theme-preview {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .theme-colors {
      display: flex;
      gap: 2px;
    }

    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.3);
    }

    .theme-menu {
      min-width: 280px;
    }

    .menu-section {
      padding: 8px 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 500;
      color: #666;
      text-transform: uppercase;
    }

    .theme-option {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .theme-option .theme-colors {
      flex-shrink: 0;
    }

    .theme-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .theme-name {
      font-weight: 500;
    }

    .theme-type {
      font-size: 12px;
      color: #666;
      text-transform: capitalize;
    }

    .submenu-arrow {
      margin-left: auto;
      font-size: 18px;
    }

    .customizer-menu {
      min-width: 320px;
      max-width: 400px;
    }

    .customizer-content {
      padding: 16px;
      max-height: 500px;
      overflow-y: auto;
    }

    .customizer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .customizer-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .customizer-section {
      margin-bottom: 20px;
    }

    .customizer-section h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 500;
      color: #666;
    }

    .color-controls {
      display: grid;
      gap: 12px;
    }

    .color-control {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-control label {
      min-width: 80px;
      font-size: 13px;
      color: #666;
    }

    .color-control input[type="color"] {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .color-control span {
      font-family: monospace;
      font-size: 12px;
      color: #666;
    }

    .typography-controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .slider-control {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .slider-control label {
      min-width: 100px;
      font-size: 13px;
      color: #666;
    }

    .slider-control mat-slider {
      flex: 1;
    }

    .slider-control span {
      min-width: 40px;
      font-size: 12px;
      color: #666;
    }

    .customizer-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .theme-preview-card {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 8px;
      z-index: 10;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .theme-preview-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .preview-demo {
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .preview-demo h3 {
      margin: 0 0 12px 0;
    }

    .preview-demo p {
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .preview-buttons {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .preview-btn {
      padding: 8px 16px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.2s ease;
    }

    .preview-btn:hover {
      opacity: 0.9;
    }

    .preview-card {
      padding: 16px;
      margin-top: 12px;
    }

    .preview-card h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
    }

    .preview-card p {
      margin: 0;
      font-size: 14px;
      opacity: 0.8;
    }

    ::ng-deep .mat-mdc-menu-panel.theme-menu {
      max-height: 400px;
    }

    ::ng-deep .mat-mdc-menu-panel.customizer-menu {
      max-height: 500px;
    }

    @media (max-width: 768px) {
      .theme-trigger {
        min-width: 120px;
      }
      
      .theme-preview span {
        display: none;
      }
      
      .customizer-menu {
        min-width: 300px;
      }
      
      .theme-preview-card {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90vw;
        max-width: 400px;
        z-index: 1000;
      }
    }
  `]
})
export class ThemeSwitcherComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  // Inputs
  readonly initialTheme = input<PreviewTheme>();
  readonly showPreviewCard = input<boolean>(false);

  // Outputs
  readonly onThemeChange = output<PreviewTheme>();
  readonly onThemeCustomized = output<PreviewTheme>();

  // State
  readonly availableThemes = signal<PreviewTheme[]>(DEFAULT_THEMES);
  readonly currentTheme = signal<PreviewTheme>(DEFAULT_THEMES[0]);
  readonly showPreview = signal<boolean>(false);

  // Custom theme state
  customTheme: PreviewTheme = { ...DEFAULT_THEMES[0] };
  fontSizeValue = 14;
  spacingValue = 8;
  borderRadiusValue = 4;

  ngOnInit() {
    if (this.initialTheme()) {
      this.currentTheme.set(this.initialTheme()!);
    }
    
    this.showPreview.set(this.showPreviewCard());
    this.initializeCustomTheme();
    this.loadSavedTheme();
  }

  selectTheme(theme: PreviewTheme) {
    this.currentTheme.set(theme);
    this.onThemeChange.emit(theme);
    this.saveTheme(theme);
    this.notificationService.showSuccess(`Applied ${theme.name} theme`);
  }

  openCustomizer() {
    this.initializeCustomTheme();
  }

  closeCustomizer() {
    // Menu will close automatically
  }

  togglePreview() {
    this.showPreview.update(show => !show);
  }

  resetToDefault() {
    const defaultTheme = DEFAULT_THEMES[0];
    this.selectTheme(defaultTheme);
  }

  exportTheme() {
    const themeJson = JSON.stringify(this.currentTheme(), null, 2);
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentTheme().name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.notificationService.showSuccess('Theme exported successfully!');
  }

  onCustomThemeChange() {
    // Update custom theme in real-time
    this.updateCustomTheme();
  }

  onFontSizeChange(value: number) {
    this.customTheme.typography.fontSize = `${value}px`;
    this.updateCustomTheme();
  }

  onSpacingChange(value: number) {
    this.customTheme.spacing.base = `${value}px`;
    this.updateCustomTheme();
  }

  onBorderRadiusChange(value: number) {
    this.customTheme.borderRadius = `${value}px`;
    this.updateCustomTheme();
  }

  resetCustomTheme() {
    this.initializeCustomTheme();
    this.fontSizeValue = 14;
    this.spacingValue = 8;
    this.borderRadiusValue = 4;
  }

  applyCustomTheme() {
    const customizedTheme: PreviewTheme = {
      ...this.customTheme,
      id: 'custom-' + Date.now(),
      name: 'Custom Theme'
    };

    this.currentTheme.set(customizedTheme);
    this.onThemeChange.emit(customizedTheme);
    this.onThemeCustomized.emit(customizedTheme);
    this.saveTheme(customizedTheme);
    
    this.notificationService.showSuccess('Custom theme applied!');
  }

  getContrastColor(backgroundColor: string): string {
    // Simple contrast calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? '#000000' : '#ffffff';
  }

  private initializeCustomTheme() {
    this.customTheme = JSON.parse(JSON.stringify(this.currentTheme()));
    this.fontSizeValue = parseInt(this.customTheme.typography.fontSize);
    this.spacingValue = parseInt(this.customTheme.spacing.base);
    this.borderRadiusValue = parseInt(this.customTheme.borderRadius);
  }

  private updateCustomTheme() {
    // Trigger change detection and preview update
    this.customTheme = { ...this.customTheme };
  }

  private saveTheme(theme: PreviewTheme) {
    localStorage.setItem('frontuna_current_theme', JSON.stringify(theme));
  }

  private loadSavedTheme() {
    const saved = localStorage.getItem('frontuna_current_theme');
    if (saved) {
      try {
        const theme: PreviewTheme = JSON.parse(saved);
        this.currentTheme.set(theme);
      } catch (error) {
        console.error('Failed to load saved theme:', error);
      }
    }
  }
}