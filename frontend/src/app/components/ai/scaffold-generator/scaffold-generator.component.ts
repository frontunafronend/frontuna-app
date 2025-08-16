import { Component, OnInit, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { 
  ScaffoldTemplate, 
  ScaffoldCategory, 
  ScaffoldConfig, 
  ScaffoldRequest,
  ScaffoldResult
} from '@app/models/scaffold.model';
import { NotificationService } from '@app/services/notification/notification.service';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  optional?: boolean;
}

interface CategoryInfo {
  id: ScaffoldCategory;
  name: string;
  description: string;
  icon: string;
  templates: ScaffoldTemplate[];
}

@Component({
  selector: 'app-scaffold-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatTooltipModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="scaffold-generator-container">
      <!-- Header -->
      <div class="generator-header">
        <div class="header-content">
          <h2>
            <mat-icon>construction</mat-icon>
            Scaffold Generator
          </h2>
          <p>Create complete project structures with AI-powered templates</p>
        </div>
        
        @if (isGenerating()) {
          <div class="generation-progress">
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            <span>Generating your project...</span>
          </div>
        }
      </div>

      <!-- Wizard Steps -->
      <div class="wizard-container">
        <mat-stepper #stepper [linear]="true" [selectedIndex]="currentStep()">
          
          <!-- Step 1: Category Selection -->
          <mat-step [stepControl]="categoryForm" [editable]="true">
            <form [formGroup]="categoryForm">
              <ng-template matStepLabel>Choose Category</ng-template>
              
              <div class="step-content">
                <h3>What type of project do you want to create?</h3>
                <p class="step-description">Select a category that best matches your project needs.</p>
                
                <div class="categories-grid">
                  @for (category of categories(); track category.id) {
                    <div class="category-card" 
                         [class.selected]="selectedCategory() === category.id"
                         (click)="selectCategory(category.id)">
                      <div class="category-icon">
                        <mat-icon>{{ category.icon }}</mat-icon>
                      </div>
                      <div class="category-info">
                        <h4>{{ category.name }}</h4>
                        <p>{{ category.description }}</p>
                        <span class="template-count">{{ category.templates.length }} templates</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
              
              <div class="step-actions">
                <button mat-flat-button 
                        color="primary" 
                        matStepperNext
                        [disabled]="!selectedCategory()">
                  Next: Choose Template
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Template Selection -->
          <mat-step [stepControl]="templateForm" [editable]="true">
            <form [formGroup]="templateForm">
              <ng-template matStepLabel>Select Template</ng-template>
              
              <div class="step-content">
                <h3>Choose a template</h3>
                <p class="step-description">Pick from {{ selectedCategoryTemplates().length }} available templates in {{ selectedCategoryInfo()?.name }}.</p>
                
                <div class="templates-grid">
                  @for (template of selectedCategoryTemplates(); track template.id) {
                    <div class="template-card"
                         [class.selected]="selectedTemplate()?.id === template.id"
                         (click)="selectTemplate(template)">
                      
                      <div class="template-header">
                        <div class="template-icon">
                          <img [src]="getFrameworkIcon(template.framework)" 
                               [alt]="template.framework"
                               class="framework-icon">
                        </div>
                        <div class="template-meta">
                          <h4>{{ template.name }}</h4>
                          <span class="template-type">{{ template.type | titlecase }}</span>
                        </div>
                        <div class="template-stats">
                          <mat-icon matTooltip="Downloads">download</mat-icon>
                          <span>{{ formatNumber(template.downloads) }}</span>
                        </div>
                      </div>
                      
                      <div class="template-content">
                        <p>{{ template.description }}</p>
                        
                        <div class="template-tags">
                          @for (tag of template.tags.slice(0, 3); track tag) {
                            <mat-chip>{{ tag }}</mat-chip>
                          }
                          @if (template.tags.length > 3) {
                            <mat-chip>+{{ template.tags.length - 3 }} more</mat-chip>
                          }
                        </div>
                      </div>
                      
                      <div class="template-footer">
                        <div class="template-info">
                          <span class="framework">{{ template.framework }}</span>
                          <span class="version">v{{ template.version }}</span>
                        </div>
                        <div class="template-rating">
                          @for (star of getStarArray(template.rating); track $index) {
                            <mat-icon [class.filled]="star">star</mat-icon>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
              
              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Back
                </button>
                <button mat-flat-button 
                        color="primary" 
                        matStepperNext
                        [disabled]="!selectedTemplate()">
                  Next: Configure Project
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 3: Project Configuration -->
          <mat-step [stepControl]="configForm" [editable]="true">
            <form [formGroup]="configForm">
              <ng-template matStepLabel>Configure</ng-template>
              
              <div class="step-content">
                <h3>Project Configuration</h3>
                <p class="step-description">Customize your project settings and options.</p>
                
                <div class="config-sections">
                  <!-- Basic Info -->
                  <mat-card class="config-section">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>info</mat-icon>
                        Basic Information
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="form-row">
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Project Name</mat-label>
                          <input matInput 
                                 formControlName="projectName"
                                 placeholder="my-awesome-project">
                          <mat-hint>This will be used as the folder name and package name</mat-hint>
                        </mat-form-field>
                      </div>
                      
                      <div class="form-row">
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Description</mat-label>
                          <textarea matInput 
                                    formControlName="description"
                                    rows="2"
                                    placeholder="Brief description of your project"></textarea>
                        </mat-form-field>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <!-- Framework Options -->
                  <mat-card class="config-section">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>settings</mat-icon>
                        Framework Options
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>Styling</mat-label>
                          <mat-select formControlName="styling">
                            <mat-option value="css">CSS</mat-option>
                            <mat-option value="scss">SCSS</mat-option>
                            <mat-option value="tailwind">Tailwind CSS</mat-option>
                            <mat-option value="styled-components">Styled Components</mat-option>
                          </mat-select>
                        </mat-form-field>
                        
                        <mat-form-field appearance="outline">
                          <mat-label>State Management</mat-label>
                          <mat-select formControlName="stateManagement">
                            <mat-option value="none">None</mat-option>
                            <mat-option value="rxjs">RxJS</mat-option>
                            <mat-option value="ngrx">NgRx</mat-option>
                            <mat-option value="redux">Redux</mat-option>
                            <mat-option value="vuex">Vuex</mat-option>
                            <mat-option value="pinia">Pinia</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <!-- Features -->
                  <mat-card class="config-section">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>extension</mat-icon>
                        Features
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="features-grid">
                        <mat-slide-toggle formControlName="routing">
                          <div class="feature-info">
                            <span class="feature-name">Routing</span>
                            <span class="feature-desc">Add navigation and routing</span>
                          </div>
                        </mat-slide-toggle>
                        
                        <mat-slide-toggle formControlName="testing">
                          <div class="feature-info">
                            <span class="feature-name">Testing Setup</span>
                            <span class="feature-desc">Include test configuration</span>
                          </div>
                        </mat-slide-toggle>
                        
                        <mat-slide-toggle formControlName="authentication">
                          <div class="feature-info">
                            <span class="feature-name">Authentication</span>
                            <span class="feature-desc">User login and auth guards</span>
                          </div>
                        </mat-slide-toggle>
                        
                        <mat-slide-toggle formControlName="pwa">
                          <div class="feature-info">
                            <span class="feature-name">PWA Support</span>
                            <span class="feature-desc">Progressive Web App features</span>
                          </div>
                        </mat-slide-toggle>
                        
                        <mat-slide-toggle formControlName="ssr">
                          <div class="feature-info">
                            <span class="feature-name">Server-Side Rendering</span>
                            <span class="feature-desc">SSR for better SEO</span>
                          </div>
                        </mat-slide-toggle>
                        
                        <mat-slide-toggle formControlName="internalization">
                          <div class="feature-info">
                            <span class="feature-name">Internationalization</span>
                            <span class="feature-desc">Multi-language support</span>
                          </div>
                        </mat-slide-toggle>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
              
              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Back
                </button>
                <button mat-flat-button 
                        color="primary" 
                        matStepperNext
                        [disabled]="configForm.invalid">
                  Next: Review & Generate
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 4: Review & Generate -->
          <mat-step>
            <ng-template matStepLabel>Generate</ng-template>
            
            <div class="step-content">
              <h3>Review & Generate</h3>
              <p class="step-description">Review your configuration and generate the project.</p>
              
              <!-- Summary -->
              <div class="generation-summary">
                <mat-card class="summary-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>summarize</mat-icon>
                      Project Summary
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="summary-grid">
                      <div class="summary-item">
                        <span class="label">Project Name:</span>
                        <span class="value">{{ configForm.get('projectName')?.value || 'Unnamed Project' }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">Template:</span>
                        <span class="value">{{ selectedTemplate()?.name }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">Framework:</span>
                        <span class="value">{{ selectedTemplate()?.framework | titlecase }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">Category:</span>
                        <span class="value">{{ selectedCategoryInfo()?.name }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">Styling:</span>
                        <span class="value">{{ configForm.get('styling')?.value | titlecase }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">Features:</span>
                        <span class="value">{{ getEnabledFeatures().join(', ') || 'None' }}</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Generation Preview -->
                <mat-card class="preview-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>preview</mat-icon>
                      Files to Generate
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="files-preview">
                      @for (file of getPreviewFiles(); track file.path) {
                        <div class="file-item">
                          <mat-icon>{{ getFileIcon(file.type) }}</mat-icon>
                          <span class="file-path">{{ file.path }}</span>
                          <span class="file-size">{{ formatFileSize(file.size) }}</span>
                        </div>
                      }
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
            
            <div class="step-actions">
              <button mat-stroked-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Back
              </button>
              <button mat-flat-button 
                      color="primary"
                      [disabled]="isGenerating()"
                      (click)="generateProject()">
                @if (isGenerating()) {
                  <mat-icon>hourglass_empty</mat-icon>
                  Generating...
                } @else {
                  <mat-icon>build</mat-icon>
                  Generate Project
                }
              </button>
            </div>
          </mat-step>
        </mat-stepper>
      </div>

      <!-- Generation Result -->
      @if (generationResult()) {
        <div class="generation-result">
          <mat-card class="result-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon [class.success]="generationResult()!.status === 'completed'"
                          [class.error]="generationResult()!.status === 'failed'">
                  {{ generationResult()!.status === 'completed' ? 'check_circle' : 'error' }}
                </mat-icon>
                Generation {{ generationResult()!.status === 'completed' ? 'Complete' : 'Failed' }}
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (generationResult()!.status === 'completed') {
                <p>Your project has been generated successfully!</p>
                <div class="result-actions">
                  <button mat-flat-button color="primary" (click)="downloadProject()">
                    <mat-icon>download</mat-icon>
                    Download Project
                  </button>
                  <button mat-stroked-button (click)="viewFiles()">
                    <mat-icon>folder_open</mat-icon>
                    View Files
                  </button>
                  <button mat-stroked-button (click)="startNew()">
                    <mat-icon>add</mat-icon>
                    Generate Another
                  </button>
                </div>
              } @else {
                <p>There was an error generating your project:</p>
                @for (error of generationResult()!.errors; track error) {
                  <div class="error-message">{{ error }}</div>
                }
                <div class="result-actions">
                  <button mat-flat-button color="primary" (click)="retryGeneration()">
                    <mat-icon>refresh</mat-icon>
                    Try Again
                  </button>
                  <button mat-stroked-button (click)="startNew()">
                    <mat-icon>arrow_back</mat-icon>
                    Start Over
                  </button>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .scaffold-generator-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f8f9fa;
    }

    .generator-header {
      padding: 24px;
      background: #ffffff;
      border-bottom: 1px solid #e9ecef;
    }

    .header-content h2 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
      font-weight: 500;
    }

    .header-content p {
      margin: 8px 0 0 0;
      color: #6c757d;
    }

    .generation-progress {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .generation-progress span {
      font-size: 14px;
      color: #6c757d;
    }

    .wizard-container {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    .step-content {
      padding: 24px 0;
    }

    .step-content h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 500;
    }

    .step-description {
      margin: 0 0 24px 0;
      color: #6c757d;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .category-card {
      display: flex;
      align-items: center;
      padding: 20px;
      background: #ffffff;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .category-card:hover {
      border-color: #6c757d;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .category-card.selected {
      border-color: #007bff;
      background: #f8f9ff;
    }

    .category-icon {
      margin-right: 16px;
      flex-shrink: 0;
    }

    .category-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #007bff;
    }

    .category-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .category-info p {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #6c757d;
    }

    .template-count {
      font-size: 12px;
      color: #007bff;
      font-weight: 500;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .template-card {
      background: #ffffff;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .template-card:hover {
      border-color: #6c757d;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .template-card.selected {
      border-color: #007bff;
      background: #f8f9ff;
    }

    .template-header {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e9ecef;
    }

    .template-icon {
      margin-right: 12px;
    }

    .framework-icon {
      width: 32px;
      height: 32px;
    }

    .template-meta {
      flex: 1;
    }

    .template-meta h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .template-type {
      font-size: 12px;
      color: #6c757d;
      text-transform: uppercase;
      font-weight: 500;
    }

    .template-stats {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #6c757d;
    }

    .template-stats mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .template-content {
      padding: 16px;
    }

    .template-content p {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #495057;
    }

    .template-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .template-tags mat-chip {
      font-size: 11px;
      height: 24px;
    }

    .template-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }

    .template-info {
      display: flex;
      gap: 8px;
      font-size: 12px;
    }

    .framework {
      color: #007bff;
      font-weight: 500;
    }

    .version {
      color: #6c757d;
    }

    .template-rating {
      display: flex;
      gap: 2px;
    }

    .template-rating mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #dee2e6;
    }

    .template-rating mat-icon.filled {
      color: #ffc107;
    }

    .config-sections {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .config-section {
      background: #ffffff;
    }

    .config-section mat-card-header {
      background: #f8f9fa;
      margin: -24px -24px 16px -24px;
      padding: 16px 24px;
    }

    .config-section mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .feature-info {
      display: flex;
      flex-direction: column;
      margin-left: 8px;
    }

    .feature-name {
      font-weight: 500;
    }

    .feature-desc {
      font-size: 12px;
      color: #6c757d;
    }

    .generation-summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .summary-card,
    .preview-card {
      background: #ffffff;
    }

    .summary-grid {
      display: grid;
      gap: 12px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f8f9fa;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #495057;
    }

    .value {
      color: #007bff;
      font-weight: 500;
    }

    .files-preview {
      max-height: 300px;
      overflow-y: auto;
    }

    .file-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f8f9fa;
    }

    .file-item mat-icon {
      margin-right: 12px;
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #6c757d;
    }

    .file-path {
      flex: 1;
      font-family: monospace;
      font-size: 13px;
    }

    .file-size {
      font-size: 12px;
      color: #6c757d;
    }

    .step-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e9ecef;
    }

    .generation-result {
      padding: 24px;
      background: #ffffff;
      border-top: 1px solid #e9ecef;
    }

    .result-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .result-card mat-icon.success {
      color: #28a745;
    }

    .result-card mat-icon.error {
      color: #dc3545;
    }

    .result-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .error-message {
      padding: 8px 12px;
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      margin: 8px 0;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .categories-grid,
      .templates-grid {
        grid-template-columns: 1fr;
      }

      .generation-summary {
        grid-template-columns: 1fr;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .step-actions {
        flex-direction: column;
      }

      .result-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ScaffoldGeneratorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);

  // Outputs
  readonly onProjectGenerated = output<ScaffoldResult>();
  readonly onStepChanged = output<number>();

  // Forms
  categoryForm: FormGroup;
  templateForm: FormGroup;
  configForm: FormGroup;

  // State
  readonly currentStep = signal<number>(0);
  readonly selectedCategory = signal<ScaffoldCategory | null>(null);
  readonly selectedTemplate = signal<ScaffoldTemplate | null>(null);
  readonly isGenerating = signal<boolean>(false);
  readonly generationResult = signal<ScaffoldResult | null>(null);

  // Data
  readonly categories = signal<CategoryInfo[]>([
    {
      id: 'basic',
      name: 'Basic Components',
      description: 'Simple, reusable UI components',
      icon: 'widgets',
      templates: this.getMockTemplates('basic')
    },
    {
      id: 'forms',
      name: 'Forms & Inputs',
      description: 'Form components with validation',
      icon: 'assignment',
      templates: this.getMockTemplates('forms')
    },
    {
      id: 'data-display',
      name: 'Data Display',
      description: 'Tables, lists, and data visualization',
      icon: 'table_chart',
      templates: this.getMockTemplates('data-display')
    },
    {
      id: 'navigation',
      name: 'Navigation',
      description: 'Menus, breadcrumbs, and navigation',
      icon: 'menu',
      templates: this.getMockTemplates('navigation')
    },
    {
      id: 'layout',
      name: 'Layout',
      description: 'Page layouts and containers',
      icon: 'view_quilt',
      templates: this.getMockTemplates('layout')
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Complete dashboard templates',
      icon: 'dashboard',
      templates: this.getMockTemplates('dashboard')
    },
    {
      id: 'e-commerce',
      name: 'E-Commerce',
      description: 'Shopping cart, product pages',
      icon: 'shopping_cart',
      templates: this.getMockTemplates('e-commerce')
    },
    {
      id: 'auth',
      name: 'Authentication',
      description: 'Login, signup, and auth flows',
      icon: 'security',
      templates: this.getMockTemplates('auth')
    }
  ]);

  // Computed
  readonly selectedCategoryInfo = computed(() => {
    const categoryId = this.selectedCategory();
    return categoryId ? this.categories().find(c => c.id === categoryId) : null;
  });

  readonly selectedCategoryTemplates = computed(() => {
    return this.selectedCategoryInfo()?.templates || [];
  });

  constructor() {
    // Initialize forms
    this.categoryForm = this.fb.group({
      category: ['', Validators.required]
    });

    this.templateForm = this.fb.group({
      template: ['', Validators.required]
    });

    this.configForm = this.fb.group({
      projectName: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      description: [''],
      styling: ['scss'],
      stateManagement: ['none'],
      routing: [true],
      testing: [true],
      authentication: [false],
      pwa: [false],
      ssr: [false],
      internalization: [false]
    });
  }

  ngOnInit() {
    // Watch for form changes to update step completion
    this.categoryForm.valueChanges.subscribe(() => {
      this.updateStepCompletion();
    });

    this.templateForm.valueChanges.subscribe(() => {
      this.updateStepCompletion();
    });

    this.configForm.valueChanges.subscribe(() => {
      this.updateStepCompletion();
    });
  }

  selectCategory(categoryId: ScaffoldCategory) {
    this.selectedCategory.set(categoryId);
    this.categoryForm.patchValue({ category: categoryId });
    this.selectedTemplate.set(null); // Reset template selection
    this.templateForm.patchValue({ template: '' });
  }

  selectTemplate(template: ScaffoldTemplate) {
    this.selectedTemplate.set(template);
    this.templateForm.patchValue({ template: template.id });
    
    // Auto-fill project name if empty
    if (!this.configForm.get('projectName')?.value) {
      const projectName = template.name.toLowerCase().replace(/\s+/g, '-');
      this.configForm.patchValue({ projectName });
    }
  }

  generateProject() {
    if (!this.selectedTemplate() || this.configForm.invalid) {
      this.notificationService.showError('Please complete all required fields');
      return;
    }

    this.isGenerating.set(true);
    this.generationResult.set(null);

    const request: ScaffoldRequest = {
      templateId: this.selectedTemplate()!.id,
      projectName: this.configForm.get('projectName')?.value,
      variables: {},
      configuration: this.buildScaffoldConfig()
    };

    // Mock generation process
    setTimeout(() => {
      const result: ScaffoldResult = {
        id: 'gen_' + Date.now(),
        requestId: 'req_' + Date.now(),
        status: 'completed',
        files: this.generateMockFiles(),
        progress: 100,
        downloadUrl: 'mock-download-url',
        createdAt: new Date()
      };

      this.generationResult.set(result);
      this.isGenerating.set(false);
      this.onProjectGenerated.emit(result);
      this.notificationService.showSuccess('Project generated successfully!');
    }, 3000);
  }

  downloadProject() {
    const result = this.generationResult();
    if (result?.downloadUrl) {
      // Mock download
      this.notificationService.showSuccess('Download started');
    }
  }

  viewFiles() {
    // TODO: Open file viewer modal
    this.notificationService.showInfo('File viewer coming soon');
  }

  startNew() {
    this.currentStep.set(0);
    this.selectedCategory.set(null);
    this.selectedTemplate.set(null);
    this.generationResult.set(null);
    this.isGenerating.set(false);
    
    // Reset forms
    this.categoryForm.reset();
    this.templateForm.reset();
    this.configForm.reset({
      styling: 'scss',
      stateManagement: 'none',
      routing: true,
      testing: true,
      authentication: false,
      pwa: false,
      ssr: false,
      internalization: false
    });
  }

  retryGeneration() {
    this.generateProject();
  }

  getFrameworkIcon(framework: string): string {
    return `assets/images/frameworks/${framework}.svg`;
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < Math.floor(rating));
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getEnabledFeatures(): string[] {
    const config = this.configForm.value;
    const features: string[] = [];
    
    if (config.routing) features.push('Routing');
    if (config.testing) features.push('Testing');
    if (config.authentication) features.push('Authentication');
    if (config.pwa) features.push('PWA');
    if (config.ssr) features.push('SSR');
    if (config.internalization) features.push('i18n');
    
    return features;
  }

  getPreviewFiles() {
    const template = this.selectedTemplate();
    if (!template) return [];

    // Mock file structure based on template
    return [
      { path: 'package.json', type: 'json', size: 1024 },
      { path: 'src/app/app.component.ts', type: 'typescript', size: 2048 },
      { path: 'src/app/app.component.html', type: 'html', size: 512 },
      { path: 'src/app/app.component.scss', type: 'scss', size: 768 },
      { path: 'src/styles.scss', type: 'scss', size: 1536 },
      { path: 'README.md', type: 'markdown', size: 2048 }
    ];
  }

  getFileIcon(type: string): string {
    switch (type) {
      case 'typescript': return 'code';
      case 'html': return 'web';
      case 'scss':
      case 'css': return 'palette';
      case 'json': return 'data_object';
      case 'markdown': return 'description';
      default: return 'insert_drive_file';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  private updateStepCompletion() {
    // Update step completion logic if needed
    this.onStepChanged.emit(this.currentStep());
  }

  private buildScaffoldConfig(): ScaffoldConfig {
    const formValue = this.configForm.value;
    return {
      routing: formValue.routing,
      testing: formValue.testing,
      styling: formValue.styling,
      stateManagement: formValue.stateManagement,
      authentication: formValue.authentication,
      internalization: formValue.internalization,
      pwa: formValue.pwa,
      ssr: formValue.ssr,
      customOptions: {}
    };
  }

  private getMockTemplates(category: ScaffoldCategory): ScaffoldTemplate[] {
    // Mock templates for each category
    const templates: Record<ScaffoldCategory, ScaffoldTemplate[]> = {
      'basic': [
        {
          id: 'basic-button',
          name: 'Button Component',
          description: 'Customizable button with variants and states',
          category: 'basic',
          framework: 'angular',
          type: 'component',
          files: [],
          dependencies: [],
          devDependencies: [],
          scripts: {},
          configuration: {},
          tags: ['button', 'ui', 'basic'],
          author: 'Frontuna',
          version: '1.0.0',
          isPublic: true,
          downloads: 15420,
          rating: 4.5,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      'forms': [
        {
          id: 'contact-form',
          name: 'Contact Form',
          description: 'Complete contact form with validation',
          category: 'forms',
          framework: 'angular',
          type: 'component',
          files: [],
          dependencies: [],
          devDependencies: [],
          scripts: {},
          configuration: {},
          tags: ['form', 'contact', 'validation'],
          author: 'Frontuna',
          version: '1.2.0',
          isPublic: true,
          downloads: 8930,
          rating: 4.7,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      'data-display': [],
      'navigation': [],
      'layout': [],
      'feedback': [],
      'charts': [],
      'e-commerce': [],
      'dashboard': [],
      'auth': [],
      'cms': [],
      'portfolio': [],
      'blog': [],
      'landing-page': [],
      'admin': [],
      'custom': []
    };

    return templates[category] || [];
  }

  private generateMockFiles() {
    return [
      {
        path: 'package.json',
        content: JSON.stringify({ name: this.configForm.get('projectName')?.value }, null, 2),
        size: 1024,
        type: 'application/json'
      },
      {
        path: 'src/app/app.component.ts',
        content: '// Generated Angular component',
        size: 2048,
        type: 'text/typescript'
      }
    ];
  }
}