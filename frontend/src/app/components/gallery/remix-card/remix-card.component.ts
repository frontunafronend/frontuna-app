import { Component, OnInit, OnDestroy, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';

import { GalleryComponent, ComponentProp } from '@app/services/gallery/component-gallery.service';
import { AITransformService } from '@app/services/ai/ai-transform.service';
import { CodeDisplayComponent } from '@app/components/shared/code-display/code-display.component';
import { NotificationService } from '@app/services/notification/notification.service';
import { Subject, takeUntil } from 'rxjs';

export interface RemixConfig {
  framework: 'angular' | 'react' | 'vue' | 'svelte';
  styleFramework: 'css' | 'scss' | 'tailwind' | 'styled-components' | 'emotion';
  theme: 'light' | 'dark' | 'auto';
  size: 'small' | 'medium' | 'large';
  variant: string;
  customProps: Record<string, any>;
  customStyles: string;
  animations: boolean;
  accessibility: boolean;
  responsive: boolean;
}

export interface RemixResult {
  originalComponent: GalleryComponent;
  remixConfig: RemixConfig;
  generatedCode: {
    template: string;
    styles: string;
    typescript: string;
    dependencies: string[];
  };
  preview?: string;
  timestamp: Date;
}

@Component({
  selector: 'app-remix-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTabsModule,
    MatDividerModule,
    MatExpansionModule,
    MatSliderModule,
    CodeDisplayComponent
  ],
  template: `
    <div class="remix-card-container">
      <!-- Header -->
      <div class="remix-header">
        <div class="header-content">
          <div class="component-info">
            <div class="component-icon">
              @if (component().preview.thumbnail) {
                <img [src]="component().preview.thumbnail" 
                     [alt]="component().displayName"
                     class="component-thumbnail">
              } @else {
                <mat-icon>widgets</mat-icon>
              }
            </div>
            <div class="component-details">
              <h2>Remix {{ component().displayName }}</h2>
              <p>{{ component().description }}</p>
              <div class="component-meta">
                <mat-chip class="framework-chip">{{ component().framework | titlecase }}</mat-chip>
                <mat-chip class="category-chip">{{ component().category | titlecase }}</mat-chip>
              </div>
            </div>
          </div>
          
          <div class="header-actions">
            <button mat-icon-button 
                    matTooltip="Reset to defaults"
                    (click)="resetToDefaults()">
              <mat-icon>refresh</mat-icon>
            </button>
            <button mat-icon-button 
                    matTooltip="Close"
                    (click)="closeDialog()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="remix-content">
        <div class="remix-layout">
          
          <!-- Configuration Panel -->
          <div class="config-panel">
            <div class="config-header">
              <h3>
                <mat-icon>tune</mat-icon>
                Remix Configuration
              </h3>
              <p>Customize the component to match your needs</p>
            </div>

            <form [formGroup]="remixForm" class="config-form">
              
              <!-- Framework Selection -->
              <mat-expansion-panel [expanded]="true">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>code</mat-icon>
                    Framework & Styling
                  </mat-panel-title>
                </mat-expansion-panel-header>
                
                <div class="form-section">
                  <mat-form-field appearance="outline">
                    <mat-label>Target Framework</mat-label>
                    <mat-select formControlName="framework" (selectionChange)="onFrameworkChange()">
                      @for (fw of frameworks; track fw.value) {
                        <mat-option [value]="fw.value">
                          <div class="framework-option">
                            <img [src]="getFrameworkIcon(fw.value)" 
                                 [alt]="fw.label"
                                 class="framework-icon">
                            <span>{{ fw.label }}</span>
                          </div>
                        </mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Style Framework</mat-label>
                    <mat-select formControlName="styleFramework" (selectionChange)="onStyleChange()">
                      @for (style of styleFrameworks; track style.value) {
                        <mat-option [value]="style.value">{{ style.label }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>
              </mat-expansion-panel>

              <!-- Appearance -->
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>palette</mat-icon>
                    Appearance
                  </mat-panel-title>
                </mat-expansion-panel-header>
                
                <div class="form-section">
                  <mat-form-field appearance="outline">
                    <mat-label>Theme</mat-label>
                    <mat-select formControlName="theme" (selectionChange)="onThemeChange()">
                      <mat-option value="light">Light</mat-option>
                      <mat-option value="dark">Dark</mat-option>
                      <mat-option value="auto">Auto</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Size</mat-label>
                    <mat-select formControlName="size" (selectionChange)="onSizeChange()">
                      <mat-option value="small">Small</mat-option>
                      <mat-option value="medium">Medium</mat-option>
                      <mat-option value="large">Large</mat-option>
                    </mat-select>
                  </mat-form-field>

                  @if (component().variants.length > 0) {
                    <mat-form-field appearance="outline">
                      <mat-label>Variant</mat-label>
                      <mat-select formControlName="variant" (selectionChange)="onVariantChange()">
                        @for (variant of component().variants; track variant.id) {
                          <mat-option [value]="variant.id">{{ variant.name }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  }
                </div>
              </mat-expansion-panel>

              <!-- Component Properties -->
              @if (component().props.length > 0) {
                <mat-expansion-panel>
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>settings</mat-icon>
                      Properties
                    </mat-panel-title>
                  </mat-expansion-panel-header>
                  
                  <div class="form-section">
                    @for (prop of component().props; track prop.name) {
                      <div class="prop-field">
                        @switch (prop.type) {
                          @case ('string') {
                            <mat-form-field appearance="outline">
                              <mat-label>{{ prop.name }}</mat-label>
                              <input matInput 
                                     [value]="getPropertyValue(prop.name)"
                                     (input)="updateProperty(prop.name, $any($event.target).value)"
                                     [placeholder]="prop.defaultValue">
                              <mat-hint>{{ prop.description }}</mat-hint>
                            </mat-form-field>
                          }
                          @case ('number') {
                            <mat-form-field appearance="outline">
                              <mat-label>{{ prop.name }}</mat-label>
                              <input matInput 
                                     type="number"
                                     [value]="getPropertyValue(prop.name)"
                                     (input)="updateProperty(prop.name, $any($event.target).value)"
                                     [placeholder]="prop.defaultValue">
                              <mat-hint>{{ prop.description }}</mat-hint>
                            </mat-form-field>
                          }
                          @case ('boolean') {
                            <div class="boolean-field">
                              <mat-slide-toggle 
                                [checked]="getPropertyValue(prop.name)"
                                (change)="updateProperty(prop.name, $event.checked)">
                                {{ prop.name }}
                              </mat-slide-toggle>
                              <span class="field-description">{{ prop.description }}</span>
                            </div>
                          }
                          @default {
                            @if (prop.options && prop.options.length > 0) {
                              <mat-form-field appearance="outline">
                                <mat-label>{{ prop.name }}</mat-label>
                                <mat-select [value]="getPropertyValue(prop.name)"
                                           (selectionChange)="updateProperty(prop.name, $event.value)">
                                  @for (option of prop.options; track option.value) {
                                    <mat-option [value]="option.value">{{ option.label }}</mat-option>
                                  }
                                </mat-select>
                                <mat-hint>{{ prop.description }}</mat-hint>
                              </mat-form-field>
                            } @else {
                              <mat-form-field appearance="outline">
                                <mat-label>{{ prop.name }}</mat-label>
                                <textarea matInput 
                                         [value]="getPropertyValue(prop.name)"
                                         (input)="updateProperty(prop.name, $any($event.target).value)"
                                         [placeholder]="prop.defaultValue">
                                </textarea>
                                <mat-hint>{{ prop.description }}</mat-hint>
                              </mat-form-field>
                            }
                          }
                        }
                      </div>
                    }
                  </div>
                </mat-expansion-panel>
              }

              <!-- Advanced Options -->
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>advanced</mat-icon>
                    Advanced Options
                  </mat-panel-title>
                </mat-expansion-panel-header>
                
                <div class="form-section">
                  <div class="toggle-options">
                    <mat-slide-toggle formControlName="animations">
                      <div class="toggle-info">
                        <span class="toggle-label">Animations</span>
                        <span class="toggle-description">Include smooth transitions and hover effects</span>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="accessibility">
                      <div class="toggle-info">
                        <span class="toggle-label">Accessibility</span>
                        <span class="toggle-description">Add ARIA labels and keyboard navigation</span>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="responsive">
                      <div class="toggle-info">
                        <span class="toggle-label">Responsive</span>
                        <span class="toggle-description">Optimize for mobile and tablet devices</span>
                      </div>
                    </mat-slide-toggle>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Custom Styles</mat-label>
                    <textarea matInput 
                             formControlName="customStyles"
                             rows="4"
                             placeholder="Add custom CSS/SCSS styles here..."></textarea>
                    <mat-hint>Custom styles will be merged with generated styles</mat-hint>
                  </mat-form-field>
                </div>
              </mat-expansion-panel>
            </form>

            <!-- Action Buttons -->
            <div class="config-actions">
              <button mat-stroked-button 
                      (click)="generatePreview()"
                      [disabled]="isGenerating()">
                <mat-icon>preview</mat-icon>
                Preview Changes
              </button>
              
              <button mat-flat-button 
                      color="primary"
                      (click)="generateRemix()"
                      [disabled]="isGenerating()">
                @if (isGenerating()) {
                  <mat-spinner diameter="20"></mat-spinner>
                  Generating...
                } @else {
                  <mat-icon>auto_fix_high</mat-icon>
                  Generate Remix
                }
              </button>
            </div>
          </div>

          <!-- Preview Panel -->
          <div class="preview-panel">
            <div class="preview-header">
              <h3>
                <mat-icon>visibility</mat-icon>
                Live Preview
              </h3>
              <div class="preview-actions">
                <button mat-icon-button 
                        matTooltip="Refresh preview"
                        (click)="refreshPreview()">
                  <mat-icon>refresh</mat-icon>
                </button>
                <button mat-icon-button 
                        matTooltip="Fullscreen preview"
                        (click)="fullscreenPreview()">
                  <mat-icon>fullscreen</mat-icon>
                </button>
              </div>
            </div>

            <div class="preview-content">
              @if (isGenerating()) {
                <div class="preview-loading">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Generating remix...</p>
                </div>
              } @else if (remixResult()) {
                <mat-tab-group>
                  <!-- Visual Preview -->
                  <mat-tab label="Preview">
                    <div class="visual-preview">
                      @if (remixResult()!.preview) {
                        <div class="preview-iframe-container">
                          <iframe [src]="getPreviewUrl()" 
                                  frameborder="0"
                                  class="preview-iframe">
                          </iframe>
                        </div>
                      } @else {
                        <div class="preview-placeholder">
                          <mat-icon>widgets</mat-icon>
                          <p>Preview will appear here after generation</p>
                        </div>
                      }
                    </div>
                  </mat-tab>

                  <!-- Generated Code -->
                  <mat-tab label="Code">
                    <div class="code-preview">
                      <mat-tab-group>
                        <mat-tab label="Template">
                          <app-code-display
                            [code]="remixResult()!.generatedCode.template"
                            [language]="getTemplateLanguage()"
                            [showLineNumbers]="true"
                            [showFormatButton]="true"
                            theme="vs-code"
                            filename="component.html">
                          </app-code-display>
                        </mat-tab>
                        
                        <mat-tab label="Styles">
                          <app-code-display
                            [code]="remixResult()!.generatedCode.styles"
                            [language]="getStyleLanguage()"
                            [showLineNumbers]="true"
                            [showFormatButton]="true"
                            theme="vs-code"
                            [filename]="getStyleFilename()">
                          </app-code-display>
                        </mat-tab>
                        
                        <mat-tab label="Logic">
                          <app-code-display
                            [code]="remixResult()!.generatedCode.typescript"
                            [language]="'typescript'"
                            [showLineNumbers]="true"
                            [showFormatButton]="true"
                            theme="vs-code"
                            [filename]="getLogicFilename()">
                          </app-code-display>
                        </mat-tab>
                      </mat-tab-group>
                    </div>
                  </mat-tab>

                  <!-- Dependencies -->
                  <mat-tab label="Dependencies">
                    <div class="dependencies-view">
                      <h4>Required Dependencies</h4>
                      <div class="dependencies-list">
                        @for (dep of remixResult()!.generatedCode.dependencies; track dep) {
                          <mat-chip class="dependency-chip">{{ dep }}</mat-chip>
                        }
                      </div>
                      
                      <div class="install-command">
                        <h4>Installation Command</h4>
                        <app-code-display
                          [code]="getInstallCommand()"
                          [language]="'bash'"
                          [showLineNumbers]="false"
                          [showFormatButton]="false"
                          [showDownloadButton]="false"
                          filename="install.sh">
                        </app-code-display>
                      </div>
                    </div>
                  </mat-tab>
                </mat-tab-group>
              } @else {
                <div class="preview-empty">
                  <mat-icon>auto_fix_high</mat-icon>
                  <h3>Ready to Remix</h3>
                  <p>Configure your options on the left and click "Generate Remix" to see the magic happen!</p>
                </div>
              }
            </div>

            <!-- Result Actions -->
            @if (remixResult()) {
              <div class="result-actions">
                <button mat-stroked-button (click)="downloadCode()">
                  <mat-icon>download</mat-icon>
                  Download
                </button>
                <button mat-stroked-button (click)="copyToClipboard()">
                  <mat-icon>content_copy</mat-icon>
                  Copy Code
                </button>
                <button mat-stroked-button (click)="saveToPlayground()">
                  <mat-icon>play_arrow</mat-icon>
                  Open in Playground
                </button>
                <button mat-flat-button color="primary" (click)="useRemix()">
                  <mat-icon>check</mat-icon>
                  Use This Remix
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .remix-card-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f8f9fa;
    }

    .remix-header {
      background: #ffffff;
      border-bottom: 1px solid #e9ecef;
      padding: 20px 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .component-info {
      display: flex;
      gap: 16px;
    }

    .component-icon {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .component-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }

    .component-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #6c757d;
    }

    .component-details h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .component-details p {
      margin: 0 0 12px 0;
      color: #6c757d;
      line-height: 1.5;
    }

    .component-meta {
      display: flex;
      gap: 8px;
    }

    .framework-chip {
      background-color: #007bff !important;
      color: #ffffff !important;
      font-size: 11px;
      height: 20px;
    }

    .category-chip {
      background-color: #28a745 !important;
      color: #ffffff !important;
      font-size: 11px;
      height: 20px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .remix-content {
      flex: 1;
      overflow: hidden;
    }

    .remix-layout {
      display: grid;
      grid-template-columns: 400px 1fr;
      height: 100%;
    }

    .config-panel {
      background: #ffffff;
      border-right: 1px solid #e9ecef;
      display: flex;
      flex-direction: column;
    }

    .config-header {
      padding: 20px 24px;
      border-bottom: 1px solid #f8f9fa;
    }

    .config-header h3 {
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
    }

    .config-header p {
      margin: 0;
      color: #6c757d;
      font-size: 14px;
    }

    .config-form {
      flex: 1;
      padding: 16px 24px;
      overflow-y: auto;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
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

    .prop-field {
      margin-bottom: 16px;
    }

    .boolean-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 16px;
    }

    .field-description {
      font-size: 12px;
      color: #6c757d;
    }

    .toggle-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 16px;
    }

    .toggle-info {
      display: flex;
      flex-direction: column;
      margin-left: 8px;
    }

    .toggle-label {
      font-weight: 500;
    }

    .toggle-description {
      font-size: 12px;
      color: #6c757d;
    }

    .full-width {
      width: 100%;
    }

    .config-actions {
      padding: 16px 24px;
      border-top: 1px solid #f8f9fa;
      display: flex;
      gap: 12px;
    }

    .config-actions button {
      flex: 1;
    }

    .preview-panel {
      display: flex;
      flex-direction: column;
      background: #ffffff;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #f8f9fa;
    }

    .preview-header h3 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
    }

    .preview-actions {
      display: flex;
      gap: 8px;
    }

    .preview-content {
      flex: 1;
      overflow: hidden;
    }

    .preview-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
    }

    .visual-preview {
      height: 400px;
      padding: 16px;
    }

    .preview-iframe-container {
      width: 100%;
      height: 100%;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }

    .preview-iframe {
      width: 100%;
      height: 100%;
    }

    .preview-placeholder,
    .preview-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #6c757d;
      text-align: center;
      gap: 16px;
    }

    .preview-placeholder mat-icon,
    .preview-empty mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.5;
    }

    .preview-empty h3 {
      margin: 0;
      color: #495057;
    }

    .preview-empty p {
      margin: 0;
      max-width: 300px;
    }

    .code-preview {
      height: 500px;
    }

    .dependencies-view {
      padding: 24px;
    }

    .dependencies-view h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .dependencies-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 24px;
    }

    .dependency-chip {
      background-color: #e9ecef !important;
      color: #495057 !important;
      font-family: monospace;
      font-size: 12px;
    }

    .install-command {
      margin-top: 24px;
    }

    .result-actions {
      padding: 16px 24px;
      border-top: 1px solid #f8f9fa;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    @media (max-width: 1200px) {
      .remix-layout {
        grid-template-columns: 350px 1fr;
      }
    }

    @media (max-width: 768px) {
      .remix-layout {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
      }

      .config-panel {
        border-right: none;
        border-bottom: 1px solid #e9ecef;
        max-height: 400px;
      }

      .result-actions {
        flex-direction: column;
      }
    }
  `]
})
export class RemixCardComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly aiTransformService = inject(AITransformService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<RemixCardComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly destroy$ = new Subject<void>();

  // Inputs
  readonly component = signal<GalleryComponent>(this.data.component);

  // Outputs
  readonly onRemixGenerated = output<RemixResult>();
  readonly onRemixUsed = output<RemixResult>();

  // State
  readonly isGenerating = signal<boolean>(false);
  readonly remixResult = signal<RemixResult | null>(null);
  readonly customProps = signal<Record<string, any>>({});

  // Form
  remixForm: FormGroup;

  // Static data
  readonly frameworks = [
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' }
  ];

  readonly styleFrameworks = [
    { value: 'css', label: 'CSS' },
    { value: 'scss', label: 'SCSS' },
    { value: 'tailwind', label: 'Tailwind CSS' },
    { value: 'styled-components', label: 'Styled Components' },
    { value: 'emotion', label: 'Emotion' }
  ];

  constructor() {
    // Initialize form
    this.remixForm = this.fb.group({
      framework: [this.component().framework, Validators.required],
      styleFramework: ['scss', Validators.required],
      theme: ['light', Validators.required],
      size: ['medium', Validators.required],
      variant: [this.component().variants[0]?.id || ''],
      animations: [true],
      accessibility: [true],
      responsive: [true],
      customStyles: ['']
    });

    // Initialize custom props with defaults
    this.initializeCustomProps();
  }

  ngOnInit() {
    // Watch form changes for live preview updates
    this.remixForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Auto-generate preview if remix has been generated
        if (this.remixResult()) {
          this.generatePreview();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeCustomProps() {
    const props: Record<string, any> = {};
    
    this.component().props.forEach(prop => {
      props[prop.name] = prop.defaultValue;
    });
    
    this.customProps.set(props);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  resetToDefaults() {
    this.remixForm.patchValue({
      framework: this.component().framework,
      styleFramework: 'scss',
      theme: 'light',
      size: 'medium',
      variant: this.component().variants[0]?.id || '',
      animations: true,
      accessibility: true,
      responsive: true,
      customStyles: ''
    });
    
    this.initializeCustomProps();
    this.remixResult.set(null);
  }

  onFrameworkChange() {
    // Update style framework options based on selected framework
    const framework = this.remixForm.get('framework')?.value;
    
    if (framework === 'react') {
      this.remixForm.patchValue({ styleFramework: 'styled-components' });
    } else if (framework === 'vue') {
      this.remixForm.patchValue({ styleFramework: 'scss' });
    }
  }

  onStyleChange() {
    // Trigger preview update if needed
  }

  onThemeChange() {
    // Trigger preview update if needed
  }

  onSizeChange() {
    // Trigger preview update if needed
  }

  onVariantChange() {
    const variantId = this.remixForm.get('variant')?.value;
    const variant = this.component().variants.find(v => v.id === variantId);
    
    if (variant) {
      // Update custom props with variant props
      this.customProps.update(current => ({
        ...current,
        ...variant.props
      }));
    }
  }

  getPropertyValue(propName: string): any {
    return this.customProps()[propName];
  }

  updateProperty(propName: string, value: any) {
    this.customProps.update(current => ({
      ...current,
      [propName]: value
    }));
  }

  generatePreview() {
    // Generate a quick preview without full AI transformation
    this.notificationService.showInfo('Preview updated');
  }

  generateRemix() {
    const config: RemixConfig = {
      ...this.remixForm.value,
      customProps: this.customProps()
    };

    this.isGenerating.set(true);
    
    // Use AI Transform Service to generate the remix
    this.aiTransformService.transformCode(
      this.component().code.template,
      'convert',
      config.framework,
      {
        style: config.styleFramework,
        theme: config.theme,
        size: config.size,
        animations: config.animations,
        accessibility: config.accessibility,
        responsive: config.responsive,
        customStyles: config.customStyles,
        props: config.customProps
      }
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (transformation: any) => {
        const result: RemixResult = {
          originalComponent: this.component(),
          remixConfig: config,
          generatedCode: {
            template: transformation.targetCode || '',
            styles: this.extractStyles(transformation.targetCode),
            typescript: this.extractTypeScript(transformation.targetCode),
            dependencies: this.extractDependencies(transformation.targetCode)
          },
          timestamp: new Date()
        };
        
        this.remixResult.set(result);
        this.onRemixGenerated.emit(result);
        this.isGenerating.set(false);
        this.notificationService.showSuccess('Remix generated successfully!');
      },
      error: (error: any) => {
        console.error('Failed to generate remix:', error);
        this.notificationService.showError('Failed to generate remix. Please try again.');
        this.isGenerating.set(false);
      }
    });
  }

  refreshPreview() {
    if (this.remixResult()) {
      this.generatePreview();
    }
  }

  fullscreenPreview() {
    // TODO: Open preview in fullscreen mode
    this.notificationService.showInfo('Fullscreen preview coming soon');
  }

  downloadCode() {
    const result = this.remixResult();
    if (!result) return;

    // Create a ZIP file with all the generated code
    const files = [
      {
        name: this.getTemplateFilename(),
        content: result.generatedCode.template
      },
      {
        name: this.getStyleFilename(),
        content: result.generatedCode.styles
      },
      {
        name: this.getLogicFilename(),
        content: result.generatedCode.typescript
      },
      {
        name: 'package.json',
        content: JSON.stringify({
          name: `${result.originalComponent.name}-remix`,
          version: '1.0.0',
          dependencies: result.generatedCode.dependencies.reduce((deps, dep) => {
            deps[dep] = 'latest';
            return deps;
          }, {} as Record<string, string>)
        }, null, 2)
      }
    ];

    // TODO: Implement actual ZIP download
    this.notificationService.showSuccess('Code download started');
  }

  copyToClipboard() {
    const result = this.remixResult();
    if (!result) return;

    const codeText = `
// Template
${result.generatedCode.template}

// Styles
${result.generatedCode.styles}

// TypeScript/JavaScript
${result.generatedCode.typescript}
    `.trim();

    navigator.clipboard.writeText(codeText).then(() => {
      this.notificationService.showSuccess('Code copied to clipboard');
    }).catch(() => {
      this.notificationService.showError('Failed to copy code');
    });
  }

  saveToPlayground() {
    const result = this.remixResult();
    if (result) {
      // TODO: Integration with component playground
      this.notificationService.showInfo('Opening in playground...');
      this.dialogRef.close({ action: 'playground', result });
    }
  }

  useRemix() {
    const result = this.remixResult();
    if (result) {
      this.onRemixUsed.emit(result);
      this.dialogRef.close({ action: 'use', result });
    }
  }

  getFrameworkIcon(framework: string): string {
    return `assets/images/frameworks/${framework}.svg`;
  }

  getPreviewUrl(): string {
    // TODO: Generate preview URL from remix result
    return 'about:blank';
  }

  getTemplateLanguage(): string {
    const framework = this.remixForm.get('framework')?.value;
    switch (framework) {
      case 'angular': return 'html';
      case 'react': return 'jsx';
      case 'vue': return 'html';
      case 'svelte': return 'html';
      default: return 'html';
    }
  }

  getStyleLanguage(): string {
    const styleFramework = this.remixForm.get('styleFramework')?.value;
    switch (styleFramework) {
      case 'scss': return 'scss';
      case 'css': return 'css';
      case 'styled-components': return 'javascript';
      case 'emotion': return 'javascript';
      case 'tailwind': return 'css';
      default: return 'css';
    }
  }

  getTemplateFilename(): string {
    const framework = this.remixForm.get('framework')?.value;
    const componentName = this.component().name;
    
    switch (framework) {
      case 'angular': return `${componentName}.component.html`;
      case 'react': return `${componentName}.tsx`;
      case 'vue': return `${componentName}.vue`;
      case 'svelte': return `${componentName}.svelte`;
      default: return `${componentName}.html`;
    }
  }

  getStyleFilename(): string {
    const styleFramework = this.remixForm.get('styleFramework')?.value;
    const componentName = this.component().name;
    
    switch (styleFramework) {
      case 'scss': return `${componentName}.component.scss`;
      case 'css': return `${componentName}.component.css`;
      case 'styled-components': return `${componentName}.styles.ts`;
      case 'emotion': return `${componentName}.styles.ts`;
      case 'tailwind': return `${componentName}.component.css`;
      default: return `${componentName}.component.css`;
    }
  }

  getLogicFilename(): string {
    const framework = this.remixForm.get('framework')?.value;
    const componentName = this.component().name;
    
    switch (framework) {
      case 'angular': return `${componentName}.component.ts`;
      case 'react': return `${componentName}.tsx`;
      case 'vue': return `${componentName}.vue`;
      case 'svelte': return `${componentName}.svelte`;
      default: return `${componentName}.ts`;
    }
  }

  getInstallCommand(): string {
    const result = this.remixResult();
    if (!result) return '';

    const deps = result.generatedCode.dependencies.join(' ');
    return `npm install ${deps}`;
  }

  /**
   * Extract CSS styles from transformed code
   */
  private extractStyles(code: string): string {
    // Simple extraction - in production, would use proper AST parsing
    const styleMatch = code.match(/\/\*\s*STYLES\s*\*\/([\s\S]*?)\/\*\s*END_STYLES\s*\*\//);
    if (styleMatch) {
      return styleMatch[1].trim();
    }
    
    // Fallback: look for CSS-like patterns
    const cssMatch = code.match(/\.[\w-]+\s*{[^}]*}/g);
    return cssMatch ? cssMatch.join('\n\n') : `
.${this.component().name.toLowerCase()}-remix {
  /* Generated styles */
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--background-color);
}`;
  }

  /**
   * Extract TypeScript/JavaScript from transformed code
   */
  private extractTypeScript(code: string): string {
    // Simple extraction - in production, would use proper AST parsing
    const tsMatch = code.match(/\/\*\s*TYPESCRIPT\s*\*\/([\s\S]*?)\/\*\s*END_TYPESCRIPT\s*\*\//);
    if (tsMatch) {
      return tsMatch[1].trim();
    }
    
    // Return the main code as TypeScript
    return code || `// Generated TypeScript code for ${this.component().name}
export interface ${this.component().name}Props {
  // Define your props here
}

export const ${this.component().name} = (props: ${this.component().name}Props) => {
  // Component logic here
  return null;
};`;
  }

  /**
   * Extract dependencies from transformed code
   */
  private extractDependencies(code: string): string[] {
    // Simple extraction - in production, would use proper AST parsing
    const imports = code.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
    const dependencies = imports
      .map(imp => {
        const match = imp.match(/from\s+['"]([^'"]+)['"]/);
        return match ? match[1] : null;
      })
      .filter((dep): dep is string => dep !== null && !dep.startsWith('.') && !dep.startsWith('/'))
      .filter((dep, index, arr) => arr.indexOf(dep) === index); // Remove duplicates

    // Add some common dependencies based on framework
    const framework = this.remixForm.get('framework')?.value;
    const baseDeps: string[] = [];
    
    switch (framework) {
      case 'react':
        baseDeps.push('react', 'react-dom');
        break;
      case 'vue':
        baseDeps.push('vue');
        break;
      case 'angular':
        baseDeps.push('@angular/core', '@angular/common');
        break;
      case 'svelte':
        baseDeps.push('svelte');
        break;
    }

    return [...new Set([...baseDeps, ...dependencies])];
  }
}