import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { ScaffoldTemplate, ScaffoldCategory, ScaffoldRequest } from '@app/models/scaffold.model';
import { NotificationService } from '@app/services/notification/notification.service';

@Component({
  selector: 'app-scaffold',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatStepperModule,
    MatProgressBarModule,
    MatTabsModule
  ],
  template: `
    <div class="scaffold-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>
              <mat-icon class="page-icon">construction</mat-icon>
              Scaffold Generator
            </h1>
            <p>Generate complete project structures and components with AI</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="page-content">
        <div class="scaffold-layout">
          <!-- Sidebar - Categories -->
          <div class="categories-sidebar">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Categories</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="category-list">
                  <button 
                    *ngFor="let category of categories" 
                    class="category-item"
                    [class.active]="selectedCategory() === category.id"
                    (click)="selectCategory(category.id)">
                    <mat-icon>{{ category.icon }}</mat-icon>
                    <div class="category-info">
                      <span class="category-name">{{ category.name }}</span>
                      <span class="category-count">{{ category.count }} templates</span>
                    </div>
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Main Area -->
          <div class="main-area">
            <mat-tab-group [(selectedIndex)]="activeTab">
              <!-- Browse Templates -->
              <mat-tab label="Browse Templates">
                <div class="templates-grid">
                  <mat-card 
                    *ngFor="let template of filteredTemplates()" 
                    class="template-card"
                    (click)="selectTemplate(template)">
                    
                    <mat-card-header>
                      <mat-card-title>{{ template.name }}</mat-card-title>
                      <mat-card-subtitle>{{ template.framework }} • {{ template.type }}</mat-card-subtitle>
                    </mat-card-header>
                    
                    <mat-card-content>
                      <p>{{ template.description }}</p>
                      
                      <div class="template-meta">
                        <div class="template-stats">
                          <span class="stat">
                            <mat-icon>download</mat-icon>
                            {{ template.downloads }}
                          </span>
                          <span class="stat">
                            <mat-icon>star</mat-icon>
                            {{ template.rating.toFixed(1) }}
                          </span>
                        </div>
                        
                        <div class="template-tags">
                          <mat-chip-listbox>
                            <mat-chip-option *ngFor="let tag of template.tags.slice(0, 3)" disabled>
                              {{ tag }}
                            </mat-chip-option>
                          </mat-chip-listbox>
                        </div>
                      </div>
                    </mat-card-content>
                    
                    <mat-card-actions>
                      <button mat-stroked-button (click)="previewTemplate(template, $event)">
                        <mat-icon>visibility</mat-icon>
                        Preview
                      </button>
                      <button mat-flat-button color="primary" (click)="useTemplate(template, $event)">
                        <mat-icon>rocket_launch</mat-icon>
                        Use Template
                      </button>
                    </mat-card-actions>
                  </mat-card>
                </div>
              </mat-tab>

              <!-- Generate Custom -->
              <mat-tab label="Generate Custom">
                <div class="custom-generator">
                  <mat-stepper [linear]="true" #stepper>
                    <!-- Step 1: Project Details -->
                    <mat-step [stepControl]="projectForm" label="Project Details">
                      <div class="step-content">
                        <h3>Project Configuration</h3>
                        
                        <div class="form-grid">
                          <mat-form-field appearance="outline">
                            <mat-label>Project Name</mat-label>
                            <input matInput [(ngModel)]="projectName" placeholder="my-awesome-project">
                          </mat-form-field>
                          
                          <mat-form-field appearance="outline">
                            <mat-label>Framework</mat-label>
                            <mat-select [(value)]="selectedFramework">
                              <mat-option value="angular">Angular</mat-option>
                              <mat-option value="react">React</mat-option>
                              <mat-option value="vue">Vue</mat-option>
                              <mat-option value="svelte">Svelte</mat-option>
                            </mat-select>
                          </mat-form-field>
                          
                          <mat-form-field appearance="outline">
                            <mat-label>Project Type</mat-label>
                            <mat-select [(value)]="projectType">
                              <mat-option value="component">Component</mat-option>
                              <mat-option value="page">Page</mat-option>
                              <mat-option value="module">Module</mat-option>
                              <mat-option value="full-app">Full Application</mat-option>
                            </mat-select>
                          </mat-form-field>
                          
                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Description</mat-label>
                            <textarea matInput [(ngModel)]="projectDescription" 
                                     placeholder="Describe what you want to build..."
                                     rows="3"></textarea>
                          </mat-form-field>
                        </div>
                        
                        <div class="step-actions">
                          <button mat-flat-button color="primary" matStepperNext>
                            Next
                          </button>
                        </div>
                      </div>
                    </mat-step>

                    <!-- Step 2: Features -->
                    <mat-step label="Features & Configuration">
                      <div class="step-content">
                        <h3>Select Features</h3>
                        
                        <div class="features-grid">
                          <mat-card *ngFor="let feature of availableFeatures" 
                                   class="feature-card"
                                   [class.selected]="isFeatureSelected(feature.id)"
                                   (click)="toggleFeature(feature.id)">
                            <mat-card-content>
                              <div class="feature-header">
                                <mat-icon>{{ feature.icon }}</mat-icon>
                                <h4>{{ feature.name }}</h4>
                              </div>
                              <p>{{ feature.description }}</p>
                            </mat-card-content>
                          </mat-card>
                        </div>
                        
                        <div class="step-actions">
                          <button mat-stroked-button matStepperPrevious>
                            Back
                          </button>
                          <button mat-flat-button color="primary" matStepperNext>
                            Next
                          </button>
                        </div>
                      </div>
                    </mat-step>

                    <!-- Step 3: Generate -->
                    <mat-step label="Generate">
                      <div class="step-content">
                        <h3>Ready to Generate</h3>
                        
                        <div class="generation-summary">
                          <mat-card>
                            <mat-card-header>
                              <mat-card-title>Project Summary</mat-card-title>
                            </mat-card-header>
                            <mat-card-content>
                              <div class="summary-item">
                                <strong>Name:</strong> {{ projectName }}
                              </div>
                              <div class="summary-item">
                                <strong>Framework:</strong> {{ selectedFramework }}
                              </div>
                              <div class="summary-item">
                                <strong>Type:</strong> {{ projectType }}
                              </div>
                              <div class="summary-item">
                                <strong>Features:</strong> {{ selectedFeatures().join(', ') }}
                              </div>
                            </mat-card-content>
                          </mat-card>
                        </div>
                        
                        <div class="generation-progress" *ngIf="isGenerating()">
                          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                          <p>Generating your project structure...</p>
                        </div>
                        
                        <div class="step-actions">
                          <button mat-stroked-button matStepperPrevious [disabled]="isGenerating()">
                            Back
                          </button>
                          <button mat-flat-button color="primary" 
                                 (click)="generateProject()" 
                                 [disabled]="isGenerating()">
                            <mat-icon>construction</mat-icon>
                            Generate Project
                          </button>
                        </div>
                      </div>
                    </mat-step>
                  </mat-stepper>
                </div>
              </mat-tab>

              <!-- History -->
              <mat-tab label="History">
                <div class="history-container">
                  <div class="history-header">
                    <h3>Generation History</h3>
                  </div>
                  
                  <div class="history-list">
                    <mat-card *ngFor="let item of generationHistory" class="history-item">
                      <mat-card-content>
                        <div class="history-item-header">
                          <h4>{{ item.name }}</h4>
                          <span class="history-date">{{ formatDate(item.date) }}</span>
                        </div>
                        <p>{{ item.framework }} • {{ item.type }}</p>
                        <div class="history-actions">
                          <button mat-stroked-button>
                            <mat-icon>download</mat-icon>
                            Download
                          </button>
                          <button mat-stroked-button>
                            <mat-icon>launch</mat-icon>
                            Open
                          </button>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scaffold-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
    }

    .page-header {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 24px;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-info h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 500;
    }

    .page-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #ff9800;
    }

    .header-info p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .page-content {
      flex: 1;
      overflow: hidden;
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .scaffold-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
      height: 100%;
    }

    .categories-sidebar {
      height: fit-content;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s ease;
      text-align: left;
      width: 100%;
    }

    .category-item:hover {
      background: #f5f5f5;
    }

    .category-item.active {
      background: #e3f2fd;
      color: #1976d2;
    }

    .category-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .category-name {
      font-weight: 500;
      margin-bottom: 2px;
    }

    .category-count {
      font-size: 12px;
      color: #666;
    }

    .main-area {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      padding: 20px;
    }

    .template-card {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .template-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }

    .template-meta {
      margin-top: 12px;
    }

    .template-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #666;
    }

    .stat mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .template-tags mat-chip-listbox {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .template-tags mat-chip-option {
      font-size: 11px;
      min-height: 24px;
    }

    .custom-generator {
      padding: 20px;
      height: calc(100vh - 250px);
      overflow-y: auto;
    }

    .step-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .step-content h3 {
      margin: 0 0 24px 0;
      font-size: 20px;
      font-weight: 500;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .form-grid .full-width {
      grid-column: 1 / -1;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .feature-card {
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid transparent;
    }

    .feature-card:hover {
      border-color: #e0e0e0;
    }

    .feature-card.selected {
      border-color: #1976d2;
      background: #e3f2fd;
    }

    .feature-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .feature-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .feature-card p {
      margin: 0;
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }

    .step-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .generation-summary {
      margin-bottom: 24px;
    }

    .summary-item {
      margin-bottom: 8px;
    }

    .generation-progress {
      text-align: center;
      margin: 24px 0;
    }

    .generation-progress p {
      margin-top: 16px;
      color: #666;
    }

    .history-container {
      padding: 20px;
      height: calc(100vh - 250px);
      overflow-y: auto;
    }

    .history-header {
      margin-bottom: 20px;
    }

    .history-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .history-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .history-item-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .history-date {
      font-size: 12px;
      color: #666;
    }

    .history-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    @media (max-width: 1200px) {
      .scaffold-layout {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
      }
    }

    @media (max-width: 768px) {
      .templates-grid {
        grid-template-columns: 1fr;
        padding: 16px;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ScaffoldComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  // State
  activeTab = 0;
  readonly selectedCategory = signal<ScaffoldCategory>('basic');
  readonly filteredTemplates = signal<ScaffoldTemplate[]>([]);
  readonly selectedFeatures = signal<string[]>([]);
  readonly isGenerating = signal<boolean>(false);

  // Form data
  projectName = '';
  selectedFramework: 'angular' | 'react' | 'vue' | 'svelte' = 'angular';
  projectType: 'component' | 'page' | 'module' | 'full-app' = 'component';
  projectDescription = '';
  projectForm: any = {}; // For stepper validation

  // Mock data
  categories = [
    { id: 'basic' as ScaffoldCategory, name: 'Basic Components', icon: 'widgets', count: 12 },
    { id: 'forms' as ScaffoldCategory, name: 'Forms', icon: 'assignment', count: 8 },
    { id: 'data-display' as ScaffoldCategory, name: 'Data Display', icon: 'table_chart', count: 15 },
    { id: 'navigation' as ScaffoldCategory, name: 'Navigation', icon: 'menu', count: 6 },
    { id: 'layout' as ScaffoldCategory, name: 'Layout', icon: 'dashboard', count: 10 },
    { id: 'e-commerce' as ScaffoldCategory, name: 'E-commerce', icon: 'shopping_cart', count: 7 },
    { id: 'dashboard' as ScaffoldCategory, name: 'Dashboard', icon: 'analytics', count: 9 }
  ];

  availableFeatures = [
    { id: 'routing', name: 'Routing', description: 'Add navigation and routing', icon: 'route' },
    { id: 'testing', name: 'Testing', description: 'Include unit tests', icon: 'verified' },
    { id: 'styling', name: 'Styling', description: 'CSS framework integration', icon: 'palette' },
    { id: 'state', name: 'State Management', description: 'Add state management', icon: 'storage' },
    { id: 'auth', name: 'Authentication', description: 'User authentication', icon: 'security' },
    { id: 'i18n', name: 'Internationalization', description: 'Multi-language support', icon: 'language' }
  ];

  mockTemplates: ScaffoldTemplate[] = [
    {
      id: '1',
      name: 'Modern Card Component',
      description: 'Responsive card with image, title, and actions',
      category: 'basic',
      framework: 'angular',
      type: 'component',
      files: [],
      dependencies: [],
      devDependencies: [],
      scripts: {},
      configuration: { styling: 'scss' },
      tags: ['card', 'responsive', 'modern'],
      author: 'Frontuna Team',
      version: '1.0.0',
      isPublic: true,
      downloads: 1250,
      rating: 4.8,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    // Add more mock templates...
  ];

  generationHistory = [
    {
      name: 'User Dashboard',
      framework: 'Angular',
      type: 'Full Application',
      date: new Date(Date.now() - 86400000)
    },
    {
      name: 'Product Card',
      framework: 'React',
      type: 'Component',
      date: new Date(Date.now() - 172800000)
    }
  ];

  ngOnInit() {
    this.loadTemplates();
  }

  selectCategory(category: ScaffoldCategory) {
    this.selectedCategory.set(category);
    this.loadTemplates();
  }

  selectTemplate(template: ScaffoldTemplate) {
    console.log('Selected template:', template);
  }

  previewTemplate(template: ScaffoldTemplate, event: Event) {
    event.stopPropagation();
    console.log('Preview template:', template);
  }

  useTemplate(template: ScaffoldTemplate, event: Event) {
    event.stopPropagation();
    console.log('Use template:', template);
    this.notificationService.showSuccess(`Using template: ${template.name}`);
  }

  toggleFeature(featureId: string) {
    this.selectedFeatures.update(features => {
      if (features.includes(featureId)) {
        return features.filter(id => id !== featureId);
      } else {
        return [...features, featureId];
      }
    });
  }

  isFeatureSelected(featureId: string): boolean {
    return this.selectedFeatures().includes(featureId);
  }

  generateProject() {
    this.isGenerating.set(true);
    
    // Simulate generation process
    setTimeout(() => {
      this.isGenerating.set(false);
      this.notificationService.showSuccess('Project generated successfully!');
    }, 3000);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  private loadTemplates() {
    // Filter templates by category
    const filtered = this.mockTemplates.filter(t => t.category === this.selectedCategory());
    this.filteredTemplates.set(filtered);
  }
}