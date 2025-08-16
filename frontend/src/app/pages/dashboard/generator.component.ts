import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SidebarComponent } from '@app/components/layout/sidebar/sidebar.component';
import { EnhancedPreviewComponent } from '@app/components/shared/enhanced-preview.component';
import { SeoService } from '@app/services/seo/seo.service';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';
import { FRAMEWORKS, COMPONENT_CATEGORIES, GENERATION_STYLES } from '@shared/constants/app-config';

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    SidebarComponent,
    EnhancedPreviewComponent
  ],
  template: `
    <div class="generator-layout">
      <app-sidebar></app-sidebar>
      
      <main class="generator-content">
        <div class="generator-header">
          <h1>
            <mat-icon>auto_awesome</mat-icon>
            Component Generator
          </h1>
          <p>Transform your ideas into production-ready components with AI</p>
        </div>

        <div class="generator-container">
          <div class="generator-form-section">
            <mat-card class="generator-card">
              <mat-card-header>
                <mat-card-title>Generate New Component</mat-card-title>
                <mat-card-subtitle>Describe what you want to build</mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <mat-horizontal-stepper #stepper linear="false">
                  <!-- Step 1: Prompt -->
                  <mat-step [stepControl]="generatorForm.get('prompt')!" label="Describe Component">
                    <form [formGroup]="generatorForm">
                      <mat-form-field appearance="outline" class="w-100">
                        <mat-label>Component Description</mat-label>
                        <textarea matInput 
                                  formControlName="prompt"
                                  placeholder="Describe the component you want to create... (e.g., 'A responsive user profile card with avatar, name, bio, and social media links')"
                                  rows="4"
                                  (input)="onPromptChange()"
                                  maxlength="2000"></textarea>
                        <mat-hint align="end">{{ promptLength() }}/2000</mat-hint>
                        <mat-error *ngIf="generatorForm.get('prompt')?.hasError('required')">
                          Please describe the component you want to create
                        </mat-error>
                        <mat-error *ngIf="generatorForm.get('prompt')?.hasError('minlength')">
                          Please provide a more detailed description (at least 10 characters)
                        </mat-error>
                      </mat-form-field>

                      <div class="prompt-suggestions">
                        <p class="suggestions-label">Need inspiration? Try these examples:</p>
                        <div class="suggestion-chips">
                          <mat-chip-set>
                            <mat-chip *ngFor="let suggestion of promptSuggestions" 
                                      (click)="selectSuggestion(suggestion)">
                              {{ suggestion }}
                            </mat-chip>
                          </mat-chip-set>
                        </div>
                      </div>

                      <div class="step-actions">
                        <button mat-raised-button 
                                color="primary" 
                                matStepperNext
                                [disabled]="generatorForm.get('prompt')?.invalid">
                          Next: Choose Framework
                          <mat-icon>arrow_forward</mat-icon>
                        </button>
                      </div>
                    </form>
                  </mat-step>

                  <!-- Step 2: Framework & Settings -->
                  <mat-step [stepControl]="generatorForm.get('framework')!" label="Framework & Settings">
                    <form [formGroup]="generatorForm">
                      <div class="framework-selection">
                        <h3>Choose Framework</h3>
                        <div class="framework-grid">
                          <div class="framework-option" 
                               *ngFor="let fw of frameworks"
                               [class.selected]="generatorForm.get('framework')?.value === fw.value"
                               (click)="selectFramework(fw.value)">
                            <div class="framework-icon">
                              <img [src]="fw.icon" [alt]="fw.label" />
                            </div>
                            <h4>{{ fw.label }}</h4>
                            <p>{{ fw.description }}</p>
                          </div>
                        </div>
                      </div>

                      <div class="design-framework-selection">
                        <h3>Design Framework</h3>
                        <p class="section-subtitle">Choose how your component should be styled</p>
                        <div class="design-framework-grid">
                          <div class="design-framework-option" 
                               *ngFor="let design of designFrameworks"
                               [class.selected]="generatorForm.get('designFramework')?.value === design.value"
                               (click)="selectDesignFramework(design.value)">
                            <div class="design-framework-header">
                              <div class="design-framework-icon" [style.background-color]="design.color">
                                <mat-icon>{{ design.icon }}</mat-icon>
                              </div>
                              <div class="design-framework-info">
                                <h4>{{ design.label }}</h4>
                                <p>{{ design.description }}</p>
                              </div>
                            </div>
                            <div class="design-framework-features">
                              <mat-chip *ngFor="let feature of design.features">{{ feature }}</mat-chip>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="component-settings">
                        <h3>Component Settings</h3>
                        <div class="settings-grid">
                          <mat-form-field appearance="outline">
                            <mat-label>Category</mat-label>
                            <mat-select formControlName="category">
                              <mat-option *ngFor="let cat of categories" [value]="cat.value">
                                {{ cat.label }}
                              </mat-option>
                            </mat-select>
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Style Theme</mat-label>
                            <mat-select formControlName="styleTheme">
                              <mat-option *ngFor="let style of styleThemes" [value]="style.value">
                                {{ style.label }}
                              </mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>

                        <div class="options-section">
                          <h4>Component Options</h4>
                          <div class="options-grid">
                            <mat-checkbox formControlName="responsive">
                              <mat-icon>devices</mat-icon>
                              Responsive Design
                            </mat-checkbox>
                            <mat-checkbox formControlName="accessibility">
                              <mat-icon>accessibility</mat-icon>
                              Accessibility Features
                            </mat-checkbox>
                            <mat-checkbox formControlName="darkMode">
                              <mat-icon>dark_mode</mat-icon>
                              Dark Mode Support
                            </mat-checkbox>
                            <mat-checkbox formControlName="animations">
                              <mat-icon>animation</mat-icon>
                              Smooth Animations
                            </mat-checkbox>
                            <mat-checkbox formControlName="typescript">
                              <mat-icon>code</mat-icon>
                              TypeScript
                            </mat-checkbox>
                            <mat-checkbox formControlName="tests">
                              <mat-icon>bug_report</mat-icon>
                              Include Tests
                            </mat-checkbox>
                          </div>
                        </div>
                      </div>

                      <div class="step-actions">
                        <button mat-button matStepperPrevious>
                          <mat-icon>arrow_back</mat-icon>
                          Back
                        </button>
                        <button mat-raised-button 
                                color="primary" 
                                matStepperNext
                                [disabled]="generatorForm.get('framework')?.invalid">
                          Next: Review & Generate
                          <mat-icon>arrow_forward</mat-icon>
                        </button>
                      </div>
                    </form>
                  </mat-step>

                  <!-- Step 3: Review & Generate -->
                  <mat-step label="Review & Generate">
                    <div class="review-section">
                      <h3>Review Your Component</h3>
                      
                      <div class="review-summary">
                        <div class="summary-item">
                          <strong>Description:</strong>
                          <p>{{ generatorForm.get('prompt')?.value }}</p>
                        </div>
                        
                        <div class="summary-item">
                          <strong>Framework:</strong>
                          <mat-chip>{{ getFrameworkLabel(generatorForm.get('framework')?.value) }}</mat-chip>
                        </div>
                        
                        <div class="summary-item">
                          <strong>Category:</strong>
                          <mat-chip>{{ getCategoryLabel(generatorForm.get('category')?.value) }}</mat-chip>
                        </div>
                        
                        <div class="summary-item">
                          <strong>Design Framework:</strong>
                          <mat-chip [style.background-color]="getDesignFrameworkColor(generatorForm.get('designFramework')?.value)">
                            {{ getDesignFrameworkLabel(generatorForm.get('designFramework')?.value) }}
                          </mat-chip>
                        </div>
                        
                        <div class="summary-item">
                          <strong>Options:</strong>
                          <div class="selected-options">
                            <mat-chip *ngIf="generatorForm.get('responsive')?.value">Responsive</mat-chip>
                            <mat-chip *ngIf="generatorForm.get('accessibility')?.value">Accessible</mat-chip>
                            <mat-chip *ngIf="generatorForm.get('darkMode')?.value">Dark Mode</mat-chip>
                            <mat-chip *ngIf="generatorForm.get('animations')?.value">Animations</mat-chip>
                            <mat-chip *ngIf="generatorForm.get('typescript')?.value">TypeScript</mat-chip>
                            <mat-chip *ngIf="generatorForm.get('tests')?.value">Tests</mat-chip>
                          </div>
                        </div>
                      </div>

                      <div class="generation-actions">
                        <button mat-button matStepperPrevious [disabled]="isGenerating()">
                          <mat-icon>arrow_back</mat-icon>
                          Back
                        </button>
                        <button mat-raised-button 
                                color="primary" 
                                (click)="generateComponent()"
                                [disabled]="isGenerating() || generatorForm.invalid"
                                class="generate-btn">
                          @if (isGenerating()) {
                            <mat-spinner diameter="20"></mat-spinner>
                            <span>Generating...</span>
                          } @else {
                            <mat-icon>auto_awesome</mat-icon>
                            <span>Generate Component</span>
                          }
                        </button>
                      </div>
                    </div>
                  </mat-step>
                </mat-horizontal-stepper>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Preview & Playground Section -->
          <div class="preview-section" [class.has-result]="generatedComponent()">
            <mat-card class="preview-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>preview</mat-icon>
                  Component Preview
                </mat-card-title>
              </mat-card-header>

              <mat-card-content class="preview-content">
                @if (isGenerating()) {
                  <div class="generation-progress">
                    <div class="progress-animation">
                      <mat-spinner diameter="60"></mat-spinner>
                    </div>
                    <h3>Generating Your Component</h3>
                    <p>Creating {{ getDesignFrameworkLabel(generatorForm.get('designFramework')?.value) }} component...</p>
                    <div class="progress-steps">
                      <div class="progress-step active">
                        <mat-icon>psychology</mat-icon>
                        <span>Analyzing prompt</span>
                      </div>
                      <div class="progress-step" [class.active]="generationStep() >= 2">
                        <mat-icon>code</mat-icon>
                        <span>Generating code</span>
                      </div>
                      <div class="progress-step" [class.active]="generationStep() >= 3">
                        <mat-icon>palette</mat-icon>
                        <span>Applying design framework</span>
                      </div>
                      <div class="progress-step" [class.active]="generationStep() >= 4">
                        <mat-icon>preview</mat-icon>
                        <span>Creating preview</span>
                      </div>
                    </div>
                  </div>
                } @else {
                  <app-enhanced-preview 
                    [component]="generatedComponent()" 
                    [enablePlayground]="true">
                  </app-enhanced-preview>
                }
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .generator-layout {
      display: flex;
      min-height: 100vh;
      padding-top: 70px;
    }

    .generator-content {
      flex: 1;
      margin-left: 280px;
      padding: 2rem;
      background: #f8f9fa;
    }

    .generator-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .generator-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin: 0 0 0.5rem 0;
    }

    .generator-header p {
      font-size: 1.2rem;
      color: #666;
      margin: 0;
    }

    .generator-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .generator-card, .preview-card {
      height: fit-content;
    }

    .w-100 {
      width: 100%;
    }

    .prompt-suggestions {
      margin: 1.5rem 0;
    }

    .suggestions-label {
      font-weight: 500;
      color: #666;
      margin-bottom: 1rem;
    }

    .suggestion-chips mat-chip {
      cursor: pointer;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
    }

    .framework-selection h3,
    .component-settings h3 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 1.5rem 0;
    }

    .framework-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .framework-option {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .framework-option:hover {
      border-color: #667eea;
      transform: translateY(-2px);
    }

    .framework-option.selected {
      border-color: #667eea;
      background: #f0f4ff;
    }

    .framework-icon {
      width: 50px;
      height: 50px;
      margin: 0 auto 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .framework-icon img {
      max-width: 100%;
      max-height: 100%;
    }

    .framework-option h4 {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }

    .framework-option p {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }

    /* Design Framework Selection Styles */
    .design-framework-selection {
      margin: 2rem 0;
    }

    .design-framework-selection h3 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .section-subtitle {
      color: #666;
      font-size: 0.95rem;
      margin: 0 0 1.5rem 0;
    }

    .design-framework-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .design-framework-option {
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .design-framework-option:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }

    .design-framework-option.selected {
      border-color: #667eea;
      background: #f0f4ff;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .design-framework-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .design-framework-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .design-framework-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .design-framework-info {
      flex: 1;
    }

    .design-framework-info h4 {
      margin: 0 0 0.25rem 0;
      font-weight: 600;
      font-size: 1.1rem;
      color: #333;
    }

    .design-framework-info p {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }

    .design-framework-features {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .design-framework-features mat-chip {
      font-size: 0.8rem;
      height: 24px;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .options-section h4 {
      font-weight: 600;
      color: #333;
      margin: 0 0 1rem 0;
    }

    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .options-grid mat-checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .review-section {
      padding: 1rem 0;
    }

    .review-section h3 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 1.5rem 0;
    }

    .review-summary {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .summary-item {
      margin-bottom: 1.5rem;
    }

    .summary-item:last-child {
      margin-bottom: 0;
    }

    .summary-item strong {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .summary-item p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }

    .selected-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .generation-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .generate-btn {
      padding: 0.75rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .preview-section {
      position: sticky;
      top: 2rem;
    }

    .preview-section.has-result {
      position: relative;
    }

    .generation-progress {
      text-align: center;
      padding: 3rem 2rem;
    }

    .progress-animation {
      margin-bottom: 2rem;
    }

    .generation-progress h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .generation-progress p {
      color: #666;
      margin: 0 0 2rem 0;
    }

    .progress-steps {
      display: flex;
      justify-content: center;
      gap: 2rem;
    }

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }

    .progress-step.active {
      opacity: 1;
      color: #667eea;
    }

    .empty-preview {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-preview mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ddd;
      margin-bottom: 1rem;
    }

    .empty-preview h3 {
      font-size: 1.5rem;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .component-result {
      padding: 1rem 0;
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .result-header h3 {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .result-actions {
      display: flex;
      gap: 0.5rem;
    }

    .preview-content {
      height: 800px;
      padding: 0 !important;
    }

    .preview-content app-enhanced-preview {
      height: 100%;
      display: block;
    }



    @media (max-width: 1200px) {
      .generator-content {
        margin-left: 64px;
      }

      .generator-container {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .preview-section {
        position: relative;
        top: auto;
      }
    }

    @media (max-width: 768px) {
      .generator-content {
        margin-left: 0;
        padding: 1rem;
      }

      .generator-header h1 {
        font-size: 2rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .framework-grid {
        grid-template-columns: 1fr;
      }

      .settings-grid {
        grid-template-columns: 1fr;
      }

      .options-grid {
        grid-template-columns: 1fr;
      }

      .progress-steps {
        flex-direction: column;
        gap: 1rem;
      }

      .progress-step {
        flex-direction: row;
        justify-content: center;
      }


    }
  `]
})
export class GeneratorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);
  private readonly route = inject(ActivatedRoute);

  // Signals for reactive state
  public readonly isGenerating = signal(false);
  public readonly generationStep = signal(1);
  public readonly generatedComponent = signal<any>(null);
  public readonly promptLength = signal(0);
  


  public generatorForm: FormGroup = this.fb.group({
    prompt: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    framework: ['react', [Validators.required]],
    category: ['custom'],
    styleTheme: ['modern'],
    designFramework: ['plain', [Validators.required]],
    responsive: [true],
    accessibility: [true],
    darkMode: [false],
    animations: [false],
    typescript: [true],
    tests: [false],
    includeBootstrap: [false],
    includeMaterialDesign: [false]
  });

  public readonly frameworks = [
    { value: FRAMEWORKS.REACT, label: 'React', icon: 'assets/images/frameworks/react.svg', description: 'Modern React with hooks' },
    { value: FRAMEWORKS.ANGULAR, label: 'Angular', icon: 'assets/images/frameworks/angular.svg', description: 'Angular 17+ standalone' },
    { value: FRAMEWORKS.VUE, label: 'Vue.js', icon: 'assets/images/frameworks/vue.svg', description: 'Vue 3 Composition API' },
    { value: FRAMEWORKS.SVELTE, label: 'Svelte', icon: 'assets/images/frameworks/svelte.png', description: 'Lightweight Svelte 4+' }
  ];

  public readonly designFrameworks = [
    { 
      value: 'plain', 
      label: 'Plain CSS', 
      icon: 'css',
      description: 'Clean, custom CSS without external frameworks',
      color: '#1976d2',
      features: ['Custom Styling', 'Lightweight', 'Full Control']
    },
    { 
      value: 'bootstrap', 
      label: 'Bootstrap 5', 
      icon: 'grid_3x3',
      description: 'Modern Bootstrap 5 with utilities and components',
      color: '#7952b3',
      features: ['Responsive Grid', 'Pre-built Components', 'Utility Classes']
    },
    { 
      value: 'bootstrap-material', 
      label: 'Bootstrap + Material', 
      icon: 'palette',
      description: 'Bootstrap 5 enhanced with Material Design principles',
      color: '#4caf50',
      features: ['Material Design', 'Bootstrap Grid', 'Google Guidelines']
    }
  ];

  public readonly categories = [
    { value: COMPONENT_CATEGORIES.LAYOUT, label: 'Layout' },
    { value: COMPONENT_CATEGORIES.NAVIGATION, label: 'Navigation' },
    { value: COMPONENT_CATEGORIES.FORMS, label: 'Forms' },
    { value: COMPONENT_CATEGORIES.BUTTONS, label: 'Buttons' },
    { value: COMPONENT_CATEGORIES.CARDS, label: 'Cards' },
    { value: COMPONENT_CATEGORIES.MODALS, label: 'Modals' },
    { value: COMPONENT_CATEGORIES.TABLES, label: 'Tables' },
    { value: COMPONENT_CATEGORIES.CHARTS, label: 'Charts' },
    { value: COMPONENT_CATEGORIES.MEDIA, label: 'Media' },
    { value: COMPONENT_CATEGORIES.UTILITY, label: 'Utility' },
    { value: COMPONENT_CATEGORIES.CUSTOM, label: 'Custom' }
  ];

  public readonly styleThemes = [
    { value: GENERATION_STYLES.MODERN, label: 'Modern' },
    { value: GENERATION_STYLES.CLASSIC, label: 'Classic' },
    { value: GENERATION_STYLES.MINIMAL, label: 'Minimal' },
    { value: GENERATION_STYLES.BOLD, label: 'Bold' }
  ];

  public readonly promptSuggestions = [
    'A responsive user profile card with avatar and social links',
    'Navigation menu with dropdown and mobile hamburger',
    'Data table with sorting, filtering, and pagination',
    'Modal dialog with form validation',
    'Dashboard widget with charts and metrics',
    'Image gallery with lightbox functionality',
    'Pricing table with multiple tiers',
    'Contact form with validation and success state'
  ];

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'Component Generator - Frontuna.ai',
      description: 'Generate frontend components with AI. Create React, Angular, Vue, and Svelte components from natural language descriptions.',
      url: 'https://frontuna.ai/dashboard/generate',
      robots: 'noindex, nofollow'
    });

    this.analyticsService.trackPageView({
      page_title: 'Generator - Frontuna.ai',
      page_location: window.location.href
    });

    // Handle template query parameters
    this.route.queryParams.subscribe(params => {
      if (params['template']) {
        this.analyticsService.trackEvent({
          action: 'template_load',
          category: 'generator',
          label: params['template']
        });

        // Pre-fill form with template data
        if (params['prompt']) {
          this.generatorForm.patchValue({
            prompt: params['prompt']
          });
          this.onPromptChange();
        }

        if (params['framework']) {
          this.selectFramework(params['framework']);
        }

        if (params['category']) {
          this.generatorForm.patchValue({
            category: params['category']
          });
        }

        if (params['designFramework']) {
          this.selectDesignFramework(params['designFramework']);
        }

        // Show a notification that template was loaded
        console.log(`✨ Template "${params['name']}" loaded successfully!`);
      }
    });
  }

  onPromptChange(): void {
    const prompt = this.generatorForm.get('prompt')?.value || '';
    this.promptLength.set(prompt.length);
  }

  selectSuggestion(suggestion: string): void {
    this.generatorForm.get('prompt')?.setValue(suggestion);
    this.onPromptChange();
    
    this.analyticsService.trackEvent({
      action: 'prompt_suggestion_selected',
      category: 'component_generator',
      label: suggestion.substring(0, 50)
    });
  }

  selectFramework(framework: string): void {
    this.generatorForm.get('framework')?.setValue(framework);
    
    this.analyticsService.trackEvent({
      action: 'framework_selected',
      category: 'component_generator',
      label: framework
    });
  }

  selectDesignFramework(designFramework: string): void {
    this.generatorForm.get('designFramework')?.setValue(designFramework);
    
    // Auto-set bootstrap/material design options based on selection
    if (designFramework === 'bootstrap') {
      this.generatorForm.patchValue({ 
        includeBootstrap: true, 
        includeMaterialDesign: false 
      });
    } else if (designFramework === 'bootstrap-material') {
      this.generatorForm.patchValue({ 
        includeBootstrap: true, 
        includeMaterialDesign: true 
      });
    } else {
      this.generatorForm.patchValue({ 
        includeBootstrap: false, 
        includeMaterialDesign: false 
      });
    }

    this.analyticsService.trackEvent({
      action: 'design_framework_selected',
      category: 'component_generator',
      label: designFramework
    });
  }

  getFrameworkLabel(value: string): string {
    return this.frameworks.find(fw => fw.value === value)?.label || value;
  }

  getCategoryLabel(value: string): string {
    return this.categories.find(cat => cat.value === value)?.label || value;
  }

  getDesignFrameworkLabel(value: string): string {
    return this.designFrameworks.find(df => df.value === value)?.label || value;
  }

  getDesignFrameworkColor(value: string): string {
    return this.designFrameworks.find(df => df.value === value)?.color || '#1976d2';
  }

  previewUrl(): string {
    // This would return a safe URL for the iframe preview
    return 'about:blank'; // Placeholder
  }

  private createMockComponent(formValue: any): any {
    const componentName = this.generateComponentName(formValue.prompt);
    const designFramework = formValue.designFramework || 'plain';
    
    return {
      id: 'comp_' + Date.now(),
      name: componentName,
      description: formValue.prompt.substring(0, 100) + '...',
      prompt: formValue.prompt,
      framework: formValue.framework,
      category: formValue.category,
      styleTheme: formValue.styleTheme,
      designFramework: designFramework,
      code: this.generateMockCode(designFramework, componentName),
      dependencies: [],
      designDependencies: this.generateDesignDependencies(designFramework),
      props: [],
      features: this.getSelectedFeatures(formValue),
      usage: 'Import and use this component in your application',
      options: {
        responsive: formValue.responsive || false,
        accessibility: formValue.accessibility || false,
        darkMode: formValue.darkMode || false,
        animations: formValue.animations || false,
        typescript: formValue.typescript || false,
        tests: formValue.tests || false,
        includeBootstrap: formValue.includeBootstrap || false,
        includeMaterialDesign: formValue.includeMaterialDesign || false
      },
      preview: this.generateMockPreview(designFramework, componentName),
      generationMetadata: {
        model: 'gpt-4',
        tokensUsed: 1200,
        generationTime: 4000,
        completionId: 'mock_' + Date.now(),
        temperature: 0.7
      },
      status: 'generated',
      isPublic: false,
      isSaved: false,
      tags: [formValue.framework, formValue.category, designFramework],
      views: 0,
      likes: 0,
      downloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private generateComponentName(prompt: string): string {
    const words = prompt.split(' ').slice(0, 3);
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') + ' Component';
  }

  private generateMockCode(designFramework: string, componentName: string): any {
    const baseCode = {
      html: `<div class="custom-component">
  <div class="component-header">
    <h2>${componentName}</h2>
  </div>
  <div class="component-content">
    <p>This is a dynamically generated component with ${designFramework} styling.</p>
    <button class="btn-primary">Action Button</button>
  </div>
</div>`,
      css: `.custom-component {
  max-width: 400px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.component-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  text-align: center;
}

.component-content {
  padding: 1.5rem;
  background: white;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #5a6fd8;
}`,
      javascript: `// ${componentName} functionality
document.addEventListener('DOMContentLoaded', function() {
  const button = document.querySelector('.btn-primary');
  if (button) {
    button.addEventListener('click', function() {
      alert('${componentName} button clicked!');
    });
  }
});`
    };

    // Enhance code based on design framework
    if (designFramework === 'bootstrap') {
      baseCode.html = `<div class="card">
  <div class="card-header bg-primary text-white">
    <h2 class="card-title mb-0">${componentName}</h2>
  </div>
  <div class="card-body">
    <p class="card-text">This is a dynamically generated component using Bootstrap 5 classes.</p>
    <button class="btn btn-primary">Action Button</button>
  </div>
</div>`;
      baseCode.css = `/* Bootstrap Enhanced Styles */
.card {
  max-width: 400px;
  margin: 0 auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%) !important;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}`;
    } else if (designFramework === 'bootstrap-material') {
      baseCode.html = `<div class="card material-card">
  <div class="card-header bg-primary text-white material-header">
    <h2 class="card-title mb-0 material-title">${componentName}</h2>
  </div>
  <div class="card-body material-body">
    <p class="card-text material-text">This is a dynamically generated component using Bootstrap 5 with Material Design principles.</p>
    <button class="btn btn-primary material-button">
      <i class="material-icons">check_circle</i>
      Action Button
    </button>
  </div>
</div>`;
      baseCode.css = `/* Bootstrap + Material Design Enhanced Styles */
.material-card {
  max-width: 400px;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.material-header {
  background: linear-gradient(135deg, #4caf50 0%, #2196f3 100%) !important;
  padding: 1.5rem;
}

.material-title {
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.material-body {
  padding: 1.5rem;
}

.material-text {
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.6;
}

.material-button {
  background: linear-gradient(135deg, #4caf50 0%, #2196f3 100%);
  border: none;
  border-radius: 24px;
  padding: 0.75rem 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.material-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(76, 175, 80, 0.3);
}

.material-icons {
  font-size: 18px;
}`;
    }

    return baseCode;
  }

  private generateDesignDependencies(designFramework: string): any {
    const dependencies: any = {};

    if (designFramework === 'bootstrap' || designFramework === 'bootstrap-material') {
      dependencies.bootstrap = {
        version: '5.3.0',
        cdnUrl: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        required: true
      };
    }

    if (designFramework === 'bootstrap-material') {
      dependencies.materialDesign = {
        version: '14.0.0',
        cdnUrl: 'https://fonts.googleapis.com/icon?family=Material+Icons',
        required: true
      };
    }

    return dependencies;
  }

  private generateMockPreview(designFramework: string, componentName: string): string {
    const basePreview = `<div style="padding: 20px; font-family: 'Roboto', Arial, sans-serif;">`;
    
    if (designFramework === 'bootstrap') {
      return basePreview + `
        <div class="card" style="max-width: 400px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div class="card-header" style="background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%); color: white;">
            <h5 class="card-title mb-0">${componentName}</h5>
          </div>
          <div class="card-body">
            <p class="card-text">Bootstrap-styled component with enhanced design</p>
            <button class="btn btn-primary" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none;">Action Button</button>
          </div>
        </div>
      </div>`;
    } else if (designFramework === 'bootstrap-material') {
      return basePreview + `
        <div class="card" style="max-width: 400px; margin: 0 auto; border-radius: 16px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12); overflow: hidden;">
          <div class="card-header" style="background: linear-gradient(135deg, #4caf50 0%, #2196f3 100%); color: white; padding: 1.5rem;">
            <h5 class="card-title mb-0" style="font-weight: 500; letter-spacing: 0.5px;">${componentName}</h5>
          </div>
          <div class="card-body" style="padding: 1.5rem;">
            <p class="card-text" style="color: rgba(0, 0, 0, 0.87); line-height: 1.6;">Material Design + Bootstrap component</p>
            <button class="btn btn-primary" style="background: linear-gradient(135deg, #4caf50 0%, #2196f3 100%); border: none; border-radius: 24px; padding: 0.75rem 1.5rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
              ✓ Action Button
            </button>
          </div>
        </div>
      </div>`;
    } else {
      return basePreview + `
        <div style="max-width: 400px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; text-align: center;">
            <h2 style="margin: 0;">${componentName}</h2>
          </div>
          <div style="padding: 1.5rem; background: white;">
            <p>Clean, custom CSS component with modern styling</p>
            <button style="background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">Action Button</button>
          </div>
        </div>
      </div>`;
    }
  }

  private getSelectedFeatures(formValue: any): string[] {
    const features = [];
    if (formValue.responsive) features.push('Responsive Design');
    if (formValue.accessibility) features.push('Accessibility Ready');
    if (formValue.darkMode) features.push('Dark Mode Support');
    if (formValue.animations) features.push('Smooth Animations');
    if (formValue.typescript) features.push('TypeScript Support');
    if (formValue.tests) features.push('Unit Tests Included');
    return features;
  }

  async generateComponent(): Promise<void> {
    if (this.generatorForm.invalid || this.isGenerating()) {
      return;
    }

    this.isGenerating.set(true);
    this.generationStep.set(1);

    try {
      const formValue = this.generatorForm.value;

      // Track generation start
      this.analyticsService.trackComponentGeneration(
        formValue.framework,
        formValue.category
      );

      // Simulate generation steps
      setTimeout(() => this.generationStep.set(2), 1000);
      setTimeout(() => this.generationStep.set(3), 2000);
      setTimeout(() => this.generationStep.set(4), 3000);

      // TODO: Call actual generation service
      // const result = await this.generatorService.generateComponent(formValue);
      
      // Enhanced mock result with design framework support
      setTimeout(() => {
        const mockResult = this.createMockComponent(formValue);
        this.generatedComponent.set(mockResult);
        this.isGenerating.set(false);

        this.analyticsService.trackEvent({
          action: 'component_generated',
          category: 'component_generator',
          label: `${formValue.framework}_${formValue.designFramework}`
        });
      }, 4000);

    } catch (error) {
      console.error('Generation failed:', error);
      this.isGenerating.set(false);
      
      this.analyticsService.trackError(`Component generation failed: ${error}`);
    }
  }


}