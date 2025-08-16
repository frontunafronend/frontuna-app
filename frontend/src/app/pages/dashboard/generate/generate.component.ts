import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

import { MonacoEditorComponent } from '../../../components/shared/monaco-editor/monaco-editor.component';
import { DashboardNavComponent } from '../../../components/shared/dashboard-nav/dashboard-nav.component';

@Component({
  selector: 'app-generate',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MonacoEditorComponent,
    DashboardNavComponent
  ],
  template: `
    <div class="generate-container">
      <app-dashboard-nav currentPage="Generate Component"></app-dashboard-nav>
      
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1>
            <mat-icon class="hero-icon">auto_awesome</mat-icon>
            AI Component Generator
          </h1>
          <p class="hero-subtitle">Transform your ideas into production-ready components instantly</p>
        </div>
      </div>
      
      <div class="generate-layout">
        <!-- Configuration Sidebar -->
        <div class="generate-sidebar">
          <mat-card class="config-card" elevation="3">
            <mat-card-header class="card-header">
              <div class="header-content">
                <mat-icon class="header-icon">tune</mat-icon>
                <div class="header-text">
                  <mat-card-title>Configuration</mat-card-title>
                  <mat-card-subtitle>Customize your component</mat-card-subtitle>
                </div>
              </div>
            </mat-card-header>
            
            <mat-card-content class="config-content">
              <form [formGroup]="generateForm" class="config-form">
                <!-- Quick Examples -->
                <div class="quick-examples">
                  <label class="section-label">
                    <mat-icon class="label-icon">lightbulb</mat-icon>
                    Quick Examples
                  </label>
                  <div class="example-chips">
                    <button type="button" 
                            mat-stroked-button 
                            class="example-chip"
                            (click)="useExamplePrompt('A modern login form with email, password fields and social login buttons')">
                      Login Form
                    </button>
                    <button type="button" 
                            mat-stroked-button 
                            class="example-chip"
                            (click)="useExamplePrompt('A responsive product card with image, title, price, and add to cart button')">
                      Product Card
                    </button>
                    <button type="button" 
                            mat-stroked-button 
                            class="example-chip"
                            (click)="useExamplePrompt('A navigation header with logo, menu items, and mobile hamburger menu')">
                      Navigation
                    </button>
                  </div>
                </div>

                <!-- Component Description -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Describe your component</mat-label>
                  <textarea matInput 
                           formControlName="description"
                           placeholder="Be specific about functionality, appearance, and behavior..."
                           rows="4"
                           maxlength="500"></textarea>
                  <mat-hint align="end">{{generateForm.get('description')?.value?.length || 0}}/500</mat-hint>
                  @if (generateForm.get('description')?.errors?.['required']) {
                    <mat-error>Component description is required</mat-error>
                  }
                  @if (generateForm.get('description')?.errors?.['minlength']) {
                    <mat-error>Please provide more detail (minimum 10 characters)</mat-error>
                  }
                </mat-form-field>

                <!-- Framework & Style -->
                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Framework</mat-label>
                    <mat-select formControlName="framework">
                      <mat-option value="react">
                        <span class="option-content">
                          <span class="option-text">React</span>
                          <span class="option-badge">Popular</span>
                        </span>
                      </mat-option>
                      <mat-option value="angular">
                        <span class="option-content">
                          <span class="option-text">Angular</span>
                          <span class="option-badge">Enterprise</span>
                        </span>
                      </mat-option>
                      <mat-option value="vue">
                        <span class="option-content">
                          <span class="option-text">Vue.js</span>
                          <span class="option-badge">Progressive</span>
                        </span>
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Design System</mat-label>
                    <mat-select formControlName="designFramework">
                      <mat-option value="bootstrap">Bootstrap</mat-option>
                      <mat-option value="tailwind">Tailwind CSS</mat-option>
                      <mat-option value="material-ui">Material Design</mat-option>
                      <mat-option value="ant-design">Ant Design</mat-option>
                      <mat-option value="chakra-ui">Chakra UI</mat-option>
                      <mat-option value="plain">Custom CSS</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <!-- Features -->
                <div class="features-section">
                  <label class="section-label">
                    <mat-icon class="label-icon">star</mat-icon>
                    Features
                  </label>
                  <div class="feature-grid">
                    <mat-slide-toggle formControlName="responsive" class="feature-toggle">
                      <span class="toggle-content">
                        <span class="toggle-text">Responsive</span>
                        <span class="toggle-desc">Mobile-first design</span>
                      </span>
                    </mat-slide-toggle>
                    
                    <mat-slide-toggle formControlName="animations" class="feature-toggle">
                      <span class="toggle-content">
                        <span class="toggle-text">Animations</span>
                        <span class="toggle-desc">Smooth transitions</span>
                      </span>
                    </mat-slide-toggle>
                    
                    <mat-slide-toggle formControlName="darkMode" class="feature-toggle">
                      <span class="toggle-content">
                        <span class="toggle-text">Dark Mode</span>
                        <span class="toggle-desc">Theme switching</span>
                      </span>
                    </mat-slide-toggle>
                    
                    <mat-slide-toggle formControlName="accessibility" class="feature-toggle">
                      <span class="toggle-content">
                        <span class="toggle-text">Accessibility</span>
                        <span class="toggle-desc">WCAG compliant</span>
                      </span>
                    </mat-slide-toggle>
                    
                    <mat-slide-toggle formControlName="typescript" class="feature-toggle">
                      <span class="toggle-content">
                        <span class="toggle-text">TypeScript</span>
                        <span class="toggle-desc">Type safety</span>
                      </span>
                    </mat-slide-toggle>
                  </div>
                </div>

                <!-- Generate Button -->
                <div class="generate-section">
                  <button mat-raised-button 
                          color="primary" 
                          class="generate-btn"
                          [disabled]="generateForm.invalid || isGenerating()"
                          (click)="generateComponent()">
                    @if (isGenerating()) {
                      <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
                      <span>Generating Component...</span>
                    } @else {
                      <mat-icon>auto_awesome</mat-icon>
                      <span>Generate Component</span>
                    }
                  </button>
                  
                  @if (generateForm.invalid) {
                    <div class="form-validation-hint">
                      <mat-icon class="hint-icon">info</mat-icon>
                      <span>Please fill in the component description to continue</span>
                    </div>
                  }
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Main Content Area -->
        <div class="generate-main">
          <mat-card class="preview-card" elevation="3">
            <mat-card-header class="card-header">
              <div class="header-content">
                <mat-icon class="header-icon">code</mat-icon>
                <div class="header-text">
                  <mat-card-title>Generated Component</mat-card-title>
                  <mat-card-subtitle>Live preview and editable code</mat-card-subtitle>
                </div>
              </div>
              <div class="header-actions">
                <button mat-icon-button 
                        [disabled]="!generatedCode()"
                        (click)="copyCode()"
                        matTooltip="Copy to Clipboard">
                  <mat-icon>content_copy</mat-icon>
                </button>
                <button mat-icon-button 
                        [disabled]="!generatedCode()"
                        (click)="downloadCode()"
                        matTooltip="Download Files">
                  <mat-icon>download</mat-icon>
                </button>
                <button mat-icon-button 
                        [disabled]="!generatedCode()"
                        (click)="saveToLibrary()"
                        matTooltip="Save to Library">
                  <mat-icon>bookmark_add</mat-icon>
                </button>
              </div>
            </mat-card-header>
            
            <mat-card-content class="preview-content">
              @if (generatedCode()) {
                <mat-tab-group class="code-tabs" animationDuration="300ms">
                  <mat-tab>
                    <ng-template mat-tab-label>
                      <mat-icon class="tab-icon">visibility</mat-icon>
                      <span class="tab-text">Preview</span>
                    </ng-template>
                    <div class="preview-container">
                      <div class="preview-frame" [innerHTML]="previewHtml()"></div>
                    </div>
                  </mat-tab>
                  
                  <mat-tab>
                    <ng-template mat-tab-label>
                      <mat-icon class="tab-icon">code</mat-icon>
                      <span class="tab-text">Component</span>
                    </ng-template>
                    <div class="editor-container">
                      <app-monaco-editor
                        [value]="generatedCode().component"
                        [language]="getEditorLanguage(generateForm.value.framework)"
                        [height]="'auto'"
                        [minHeight]="400"
                        [maxHeight]="800"
                        [title]="'Component Code'"
                        [readonly]="false"
                        (valueChange)="onCodeChange('component', $event)">
                      </app-monaco-editor>
                    </div>
                  </mat-tab>
                  
                  <mat-tab>
                    <ng-template mat-tab-label>
                      <mat-icon class="tab-icon">palette</mat-icon>
                      <span class="tab-text">Styles</span>
                    </ng-template>
                    <div class="editor-container">
                      <app-monaco-editor
                        [value]="generatedCode().styles"
                        [language]="'css'"
                        [height]="'auto'"
                        [minHeight]="400"
                        [maxHeight]="800"
                        [title]="'Stylesheet'"
                        [readonly]="false"
                        (valueChange)="onCodeChange('styles', $event)">
                      </app-monaco-editor>
                    </div>
                  </mat-tab>
                  
                  @if (generatedCode().types) {
                    <mat-tab>
                      <ng-template mat-tab-label>
                        <mat-icon class="tab-icon">integration_instructions</mat-icon>
                        <span class="tab-text">Types</span>
                      </ng-template>
                      <div class="editor-container">
                        <app-monaco-editor
                          [value]="generatedCode().types"
                          [language]="'typescript'"
                          [height]="'auto'"
                          [minHeight]="400"
                          [maxHeight]="800"
                          [title]="'Type Definitions'"
                          [readonly]="false"
                          (valueChange)="onCodeChange('types', $event)">
                        </app-monaco-editor>
                      </div>
                    </mat-tab>
                  }
                  
                  @if (generatedCode().tests) {
                    <mat-tab>
                      <ng-template mat-tab-label>
                        <mat-icon class="tab-icon">bug_report</mat-icon>
                        <span class="tab-text">Tests</span>
                      </ng-template>
                      <div class="editor-container">
                        <app-monaco-editor
                          [value]="generatedCode().tests"
                          [language]="getEditorLanguage(generateForm.value.framework)"
                          [height]="'auto'"
                          [minHeight]="400"
                          [maxHeight]="800"
                          [title]="'Test Cases'"
                          [readonly]="false"
                          (valueChange)="onCodeChange('tests', $event)">
                        </app-monaco-editor>
                      </div>
                    </mat-tab>
                  }
                </mat-tab-group>
              } @else {
                <div class="empty-state">
                  <div class="empty-state-content">
                    <mat-icon class="empty-icon">rocket_launch</mat-icon>
                    <h2>Ready to Build Something Amazing?</h2>
                    <p class="empty-description">
                      Describe your component idea and watch our AI transform it into professional, 
                      production-ready code in seconds.
                    </p>
                    <div class="empty-features">
                      <div class="feature-item">
                        <mat-icon class="feature-icon">speed</mat-icon>
                        <span>Instant Generation</span>
                      </div>
                      <div class="feature-item">
                        <mat-icon class="feature-icon">edit</mat-icon>
                        <span>Live Code Editor</span>
                      </div>
                      <div class="feature-item">
                        <mat-icon class="feature-icon">download</mat-icon>
                        <span>Export Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .generate-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      padding: 32px 0;
      margin-bottom: 24px;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      text-align: center;
    }

    .hero-content h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .hero-icon {
      font-size: 3rem !important;
      width: 3rem;
      height: 3rem;
      color: #667eea;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      color: #718096;
      margin: 0;
      font-weight: 400;
    }

    /* Main Layout */
    .generate-layout {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 32px;
      min-height: calc(100vh - 200px);
    }

    .generate-sidebar {
      position: sticky;
      top: 24px;
      height: fit-content;
    }

    .generate-main {
      min-height: 600px;
    }

    /* Card Styles */
    .config-card, .preview-card {
      border-radius: 16px !important;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
      border: 1px solid rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.95) !important;
    }

    .card-header {
      padding: 24px 24px 16px 24px !important;
      border-bottom: 1px solid #f1f5f9;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .header-icon {
      color: #667eea;
      font-size: 24px !important;
      width: 24px;
      height: 24px;
    }

    .header-text mat-card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a202c;
      margin: 0;
    }

    .header-text mat-card-subtitle {
      font-size: 0.875rem;
      color: #718096;
      margin: 2px 0 0 0;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .header-actions button {
      color: #667eea;
    }

    /* Configuration Form */
    .config-content {
      padding: 0 24px 24px 24px !important;
    }

    .config-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Quick Examples */
    .quick-examples {
      margin-bottom: 24px;
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 12px;
      font-size: 0.95rem;
    }

    .label-icon {
      font-size: 18px !important;
      width: 18px;
      height: 18px;
      color: #667eea;
    }

    .example-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .example-chip {
      font-size: 0.8rem !important;
      padding: 6px 12px !important;
      min-width: auto !important;
      height: 32px !important;
      border-radius: 16px !important;
      border-color: #e2e8f0 !important;
      color: #4a5568 !important;
      transition: all 0.2s ease;
    }

    .example-chip:hover {
      background: #667eea !important;
      color: white !important;
      border-color: #667eea !important;
    }

    /* Form Fields */
    .full-width {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 12px;
    }

    .half-width {
      flex: 1;
    }

    .option-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .option-badge {
      font-size: 0.7rem;
      padding: 2px 6px;
      background: #f0f4f8;
      color: #667eea;
      border-radius: 8px;
      font-weight: 500;
    }

    /* Features Section */
    .features-section {
      margin: 20px 0;
    }

    .feature-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .feature-toggle {
      margin: 0 !important;
    }

    .toggle-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .toggle-text {
      font-weight: 500;
      color: #2d3748;
      font-size: 0.9rem;
    }

    .toggle-desc {
      font-size: 0.75rem;
      color: #718096;
    }

    /* Generate Button */
    .generate-section {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
    }

    .generate-btn {
      width: 100%;
      height: 52px !important;
      font-size: 1rem !important;
      font-weight: 600 !important;
      border-radius: 12px !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
      transition: all 0.3s ease !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .generate-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5) !important;
    }

    .generate-btn:disabled {
      opacity: 0.6;
      transform: none !important;
      box-shadow: none !important;
    }

    .btn-spinner {
      color: white !important;
    }

    .form-validation-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 12px;
      background: #f7fafc;
      border-radius: 8px;
      color: #4a5568;
      font-size: 0.875rem;
    }

    .hint-icon {
      color: #667eea;
      font-size: 18px !important;
      width: 18px;
      height: 18px;
    }

    /* Preview Section */
    .preview-content {
      padding: 0 !important;
      height: calc(100vh - 300px);
      min-height: 600px;
      display: flex;
      flex-direction: column;
    }

    .code-tabs {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .code-tabs ::ng-deep .mat-mdc-tab-group {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .code-tabs ::ng-deep .mat-mdc-tab-header {
      border-bottom: 1px solid #f1f5f9;
      margin: 0 24px;
    }

    .code-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
      flex: 1;
      overflow: hidden;
      padding: 0 24px 24px 24px;
    }

    .code-tabs ::ng-deep .mat-mdc-tab-body-content {
      height: 100%;
      overflow: hidden;
    }

    .tab-icon {
      font-size: 18px !important;
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }

    .tab-text {
      font-weight: 500;
    }

    /* Preview Container */
    .preview-container {
      height: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: auto;
      background: #fafafa;
    }

    .preview-frame {
      padding: 24px;
      background: white;
      min-height: 100%;
    }

    /* Editor Container */
    .editor-container {
      height: 100%;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    /* Empty State */
    .empty-state {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .empty-state-content {
      text-align: center;
      max-width: 500px;
    }

    .empty-icon {
      font-size: 80px !important;
      width: 80px;
      height: 80px;
      color: #667eea;
      margin-bottom: 24px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .empty-state h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 16px 0;
    }

    .empty-description {
      font-size: 1.1rem;
      color: #718096;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    .empty-features {
      display: flex;
      justify-content: center;
      gap: 32px;
      flex-wrap: wrap;
    }

    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: rgba(102, 126, 234, 0.05);
      border-radius: 12px;
      min-width: 120px;
    }

    .feature-icon {
      font-size: 32px !important;
      width: 32px;
      height: 32px;
      color: #667eea;
    }

    .feature-item span {
      font-size: 0.9rem;
      font-weight: 500;
      color: #4a5568;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .generate-layout {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .generate-sidebar {
        position: relative;
        top: 0;
      }

      .hero-content h1 {
        font-size: 2rem;
        flex-direction: column;
        gap: 8px;
      }

      .hero-icon {
        font-size: 2.5rem !important;
        width: 2.5rem;
        height: 2.5rem;
      }

      .preview-content {
        height: 500px;
        min-height: 500px;
      }
    }

    @media (max-width: 768px) {
      .generate-layout {
        padding: 0 16px;
      }

      .hero-content {
        padding: 0 16px;
      }

      .hero-content h1 {
        font-size: 1.75rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .form-row {
        flex-direction: column;
        gap: 16px;
      }

      .example-chips {
        flex-direction: column;
      }

      .example-chip {
        width: 100%;
      }

      .empty-features {
        gap: 16px;
      }

      .feature-item {
        min-width: 100px;
      }
    }
  `]
})
export class GenerateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  public readonly isGenerating = signal(false);
  public readonly generatedCode = signal<any>(null);
  public readonly previewHtml = signal('');

  public generateForm: FormGroup;

  constructor() {
    this.generateForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]],
      framework: ['react', Validators.required],
      designFramework: ['bootstrap', Validators.required],
      responsive: [true],
      animations: [false],
      darkMode: [false],
      accessibility: [true],
      typescript: [true]
    });
  }

  ngOnInit(): void {
    // Set up form with sensible defaults - no auto-generation for better UX
    this.generateForm.patchValue({
      description: '',
      framework: 'angular',
      designFramework: 'material-ui',
      responsive: true,
      animations: false,
      accessibility: true,
      typescript: true,
      darkMode: false
    });
  }

  generateSampleComponent(): void {
    const sampleCode = {
      component: `import React from 'react';
import './Button.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  onClick, 
  disabled = false 
}) => {
  return (
    <button 
      className={\`btn btn-\${variant} btn-\${size}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;`,
      styles: `.btn {
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-small {
  padding: 8px 16px;
  font-size: 14px;
}

.btn-medium {
  padding: 12px 24px;
  font-size: 16px;
}

.btn-large {
  padding: 16px 32px;
  font-size: 18px;
}`,
      types: `export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';`,
      tests: `import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies correct variant class', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-danger');
  });

  test('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});`
    };

    this.generatedCode.set(sampleCode);
    this.updatePreview(sampleCode);
  }

  generateComponent(): void {
    if (this.generateForm.invalid) return;

    this.isGenerating.set(true);

    // Simulate API call
    setTimeout(() => {
      const formValue = this.generateForm.value;
      const mockCode = this.generateMockCode(formValue);
      
      this.generatedCode.set(mockCode);
      this.updatePreview(mockCode);
      this.isGenerating.set(false);
    }, 2000);
  }

  private generateMockCode(config: any): any {
    const framework = config.framework;
    const componentName = this.extractComponentName(config.description);
    
    // Generate different code based on framework
    switch (framework) {
      case 'react':
        return this.generateReactCode(componentName, config);
      case 'angular':
        return this.generateAngularCode(componentName, config);
      case 'vue':
        return this.generateVueCode(componentName, config);
      default:
        return this.generateReactCode(componentName, config);
    }
  }

  private generateReactCode(name: string, config: any): any {
    return {
      component: `import React${config.typescript ? ', { FC }' : ''} from 'react';
import './${name}.css';

${config.typescript ? `interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

const ${name}: FC<${name}Props> = ({ className, children }) => {` : `const ${name} = ({ className, children }) => {`}
  return (
    <div className={\`${name.toLowerCase()}\${className ? \` \${className}\` : ''}\`}>
      {children || '${config.description}'}
    </div>
  );
};

export default ${name};`,
      styles: `.${name.toLowerCase()} {
  padding: 20px;
  border-radius: 8px;
  background: ${config.designFramework === 'material-ui' ? '#fff' : '#f8f9fa'};
  border: 1px solid #e9ecef;
  ${config.responsive ? `
  @media (max-width: 768px) {
    padding: 16px;
  }` : ''}
  ${config.animations ? `
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }` : ''}
  ${config.darkMode ? `
  
  @media (prefers-color-scheme: dark) {
    background: #2d3748;
    border-color: #4a5568;
    color: #fff;
  }` : ''}
}`
    };
  }

  private generateAngularCode(name: string, config: any): any {
    return {
      component: `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-${name.toLowerCase()}',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="${name.toLowerCase()}" [class]="className">
      <ng-content>{{ defaultContent }}</ng-content>
    </div>
  \`,
  styleUrls: ['./${name.toLowerCase()}.component.scss']
})
export class ${name}Component {
  @Input() className?: string;
  
  public readonly defaultContent = '${config.description}';
}`,
      styles: `.${name.toLowerCase()} {
  padding: 20px;
  border-radius: 8px;
  background: ${config.designFramework === 'material-ui' ? '#fff' : '#f8f9fa'};
  border: 1px solid #e9ecef;
  ${config.responsive ? `
  @media (max-width: 768px) {
    padding: 16px;
  }` : ''}
  ${config.animations ? `
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }` : ''}
  ${config.darkMode ? `
  
  @media (prefers-color-scheme: dark) {
    background: #2d3748;
    border-color: #4a5568;
    color: #fff;
  }` : ''}
}`
    };
  }

  private generateVueCode(name: string, config: any): any {
    return {
      component: `<template>
  <div :class="[\`${name.toLowerCase()}\`, className]">
    <slot>{{ defaultContent }}</slot>
  </div>
</template>

<script${config.typescript ? ' lang="ts"' : ''}>
import { defineComponent } from 'vue';

export default defineComponent({
  name: '${name}',
  props: {
    className: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      defaultContent: '${config.description}'
    };
  }
});
</script>

<style scoped>
.${name.toLowerCase()} {
  padding: 20px;
  border-radius: 8px;
  background: ${config.designFramework === 'material-ui' ? '#fff' : '#f8f9fa'};
  border: 1px solid #e9ecef;
  ${config.responsive ? `
  @media (max-width: 768px) {
    padding: 16px;
  }` : ''}
  ${config.animations ? `
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }` : ''}
  ${config.darkMode ? `
  
  @media (prefers-color-scheme: dark) {
    background: #2d3748;
    border-color: #4a5568;
    color: #fff;
  }` : ''}
}
</style>`,
      styles: ''
    };
  }

  private extractComponentName(description: string): string {
    // Extract a reasonable component name from description
    const words = description.split(' ').filter(word => 
      word.length > 2 && 
      !['the', 'and', 'with', 'for', 'that', 'this'].includes(word.toLowerCase())
    );
    
    if (words.length === 0) return 'Component';
    
    return words.slice(0, 2)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  public getEditorLanguage(framework: string): string {
    const languageMap: Record<string, string> = {
      'react': 'typescript',
      'angular': 'typescript', 
      'vue': 'vue',
      'javascript': 'javascript'
    };
    return languageMap[framework] || 'typescript';
  }

  public onCodeChange(codeType: string, newValue: string): void {
    const currentCode = this.generatedCode();
    if (currentCode) {
      const updatedCode = { ...currentCode, [codeType]: newValue };
      this.generatedCode.set(updatedCode);
      this.updatePreview(updatedCode);
    }
  }

  private updatePreview(code: any): void {
    // Create a professional preview HTML
    const formValue = this.generateForm.value;
    const componentName = this.extractComponentName(formValue.description || 'Sample');
    
    const previewHtml = `
      <div style="min-height: 500px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Preview Header -->
        <div style="background: white; padding: 20px; margin: 0; border-bottom: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 18px; font-weight: bold;">${componentName.charAt(0)}</span>
            </div>
            <div>
              <h2 style="margin: 0; color: #1a202c; font-size: 1.5rem; font-weight: 700;">${componentName}</h2>
              <p style="margin: 2px 0 0 0; color: #718096; font-size: 0.9rem;">${formValue.framework} • ${formValue.designFramework}</p>
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${formValue.responsive ? '<span style="background: #e6fffa; color: #047857; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">Responsive</span>' : ''}
            ${formValue.animations ? '<span style="background: #fef3e2; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">Animated</span>' : ''}
            ${formValue.accessibility ? '<span style="background: #ede9fe; color: #6b46c1; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">A11y</span>' : ''}
            ${formValue.typescript ? '<span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">TypeScript</span>' : ''}
            ${formValue.darkMode ? '<span style="background: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">Dark Mode</span>' : ''}
          </div>
        </div>
        
        <!-- Component Preview Area -->
        <div style="padding: 40px; display: flex; align-items: center; justify-content: center; min-height: 300px;">
          <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px); max-width: 400px; text-align: center;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">🎨</span>
            </div>
            <h3 style="margin: 0 0 8px 0; color: #1a202c; font-size: 1.25rem; font-weight: 600;">Live Component Preview</h3>
            <p style="margin: 0 0 16px 0; color: #718096; line-height: 1.5; font-size: 0.9rem;">Your ${componentName.toLowerCase()} component will appear here with full interactivity and styling.</p>
            <div style="background: #f7fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 0.8rem; color: #4a5568; text-align: left;">
              Framework: ${formValue.framework}<br>
              Design: ${formValue.designFramework}<br>
              Features: ${[formValue.responsive && 'responsive', formValue.animations && 'animated', formValue.accessibility && 'accessible'].filter(Boolean).join(', ')}
            </div>
          </div>
        </div>
        
        <!-- Generation Info -->
        <div style="background: rgba(255,255,255,0.9); margin: 20px; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #10b981; font-size: 16px;">✅</span>
              <span style="color: #059669; font-weight: 500; font-size: 0.9rem;">Component Generated Successfully</span>
            </div>
            <span style="color: #6b7280; font-size: 0.8rem;">${new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
    this.previewHtml.set(previewHtml);
  }

  useExamplePrompt(prompt: string): void {
    this.generateForm.patchValue({ description: prompt });
  }

  copyCode(): void {
    const code = this.generatedCode();
    if (code) {
      navigator.clipboard.writeText(code.component);
      console.log('✅ Code copied to clipboard!');
    }
  }

  downloadCode(): void {
    const code = this.generatedCode();
    if (code) {
      // In a real app, this would trigger file downloads
      console.log('📥 Download started!');
    }
  }

  saveToLibrary(): void {
    const code = this.generatedCode();
    if (code) {
      console.log('💾 Component saved to library!');
    }
  }
}