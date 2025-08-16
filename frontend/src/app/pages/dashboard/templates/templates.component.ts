import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ComponentStateService, GeneratedComponent } from '../../../services/component-state/component-state.service';
import { EnhancedPreviewComponent } from '../../../components/shared/enhanced-preview/enhanced-preview.component';
import { DashboardNavComponent } from '../../../components/shared/dashboard-nav/dashboard-nav.component';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  designFramework: string;
  preview: string;
  code: string;
  tags: string[];
  downloads: number;
  rating: number;
}

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    EnhancedPreviewComponent,
    DashboardNavComponent
  ],
  template: `
    <app-dashboard-nav currentPage="Templates"></app-dashboard-nav>
    
    <div class="templates-layout">
      <div class="templates-header">
        <h1>
          <mat-icon>view_module</mat-icon>
          Component Templates
        </h1>
        <p>Browse and use pre-built component templates to speed up your development</p>
        
        <div class="search-filters">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search templates</mat-label>
            <input matInput 
                   [(ngModel)]="searchQuery"
                   (ngModelChange)="filterTemplates()"
                   placeholder="Search by name, description, or tags">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="selectedCategory" (selectionChange)="filterTemplates()">
              <mat-option value="">All Categories</mat-option>
              <mat-option value="ui">UI Components</mat-option>
              <mat-option value="forms">Forms</mat-option>
              <mat-option value="navigation">Navigation</mat-option>
              <mat-option value="data">Data Display</mat-option>
              <mat-option value="layout">Layout</mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Framework</mat-label>
            <mat-select [(ngModel)]="selectedFramework" (selectionChange)="filterTemplates()">
              <mat-option value="">All Frameworks</mat-option>
              <mat-option value="react">React</mat-option>
              <mat-option value="angular">Angular</mat-option>
              <mat-option value="vue">Vue.js</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div class="templates-grid">
        @for (template of filteredTemplates(); track template.id) {
          <mat-card class="template-card">
            <div class="template-preview">
              <div class="preview-content" [innerHTML]="template.preview"></div>
              <div class="template-overlay">
                <button mat-fab 
                        color="primary"
                        (click)="useTemplate(template)"
                        matTooltip="Use Template">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>
            
            <mat-card-content>
              <div class="template-header">
                <h3>{{ template.name }}</h3>
                <div class="template-stats">
                  <span class="downloads">
                    <mat-icon>download</mat-icon>
                    {{ template.downloads }}
                  </span>
                  <span class="rating">
                    <mat-icon>star</mat-icon>
                    {{ template.rating }}
                  </span>
                </div>
              </div>
              
              <p class="template-description">{{ template.description }}</p>
              
              <div class="template-meta">
                <mat-chip-set>
                  <mat-chip class="framework-chip">
                    {{ template.framework }}
                  </mat-chip>
                  <mat-chip class="design-chip">
                    {{ template.designFramework }}
                  </mat-chip>
                  <mat-chip class="category-chip">
                    {{ template.category }}
                  </mat-chip>
                </mat-chip-set>
              </div>
              
              <div class="template-tags">
                @for (tag of template.tags; track tag) {
                  <span class="tag">{{ tag }}</span>
                }
              </div>
            </mat-card-content>
            
            <mat-card-actions>
              <button mat-button (click)="previewTemplate(template)">
                <mat-icon>visibility</mat-icon>
                Enhanced Preview
              </button>
              <button mat-button (click)="viewCode(template)">
                <mat-icon>code</mat-icon>
                View & Edit Code
              </button>
              <button mat-raised-button 
                      color="primary"
                      (click)="useTemplate(template)">
                <mat-icon>auto_awesome</mat-icon>
                Use Template
              </button>
            </mat-card-actions>
          </mat-card>
        } @empty {
          <div class="empty-state">
            <mat-icon class="empty-icon">search_off</mat-icon>
            <h3>No templates found</h3>
            <p>Try adjusting your search criteria or browse all templates.</p>
            <button mat-raised-button 
                    color="primary"
                    (click)="clearFilters()">
              Clear Filters
            </button>
          </div>
        }
      </div>
    </div>

    <!-- Enhanced Preview Modal -->
    @if (selectedTemplateForPreview()) {
      <div class="preview-modal-overlay" (click)="closePreview()">
        <div class="preview-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ selectedTemplateForPreview()?.name }} - Enhanced Preview</h2>
            <div class="modal-actions">
              <button mat-raised-button 
                      color="primary"
                      (click)="useTemplateFromPreview()">
                <mat-icon>auto_awesome</mat-icon>
                Use Template
              </button>
              <button mat-icon-button (click)="closePreview()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
          <div class="modal-content">
            <app-enhanced-preview 
              [component]="convertTemplateToComponent(selectedTemplateForPreview()!)"
              [enableEditing]="true">
            </app-enhanced-preview>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .templates-layout {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .templates-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .templates-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .templates-header p {
      margin: 0 0 24px 0;
      font-size: 16px;
      color: #666;
    }

    .search-filters {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
      max-width: 800px;
      margin: 0 auto;
    }

    .search-field {
      flex: 2;
      min-width: 300px;
    }

    .search-filters mat-form-field {
      flex: 1;
      min-width: 150px;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .template-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .template-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }

    .template-preview {
      position: relative;
      height: 200px;
      background: #f8f9fa;
      overflow: hidden;
    }

    .preview-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      color: #ddd;
    }

    .template-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .template-card:hover .template-overlay {
      opacity: 1;
    }

    .template-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .template-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .template-stats {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #666;
    }

    .template-stats span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .template-stats mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .template-description {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #555;
      line-height: 1.4;
    }

    .template-meta {
      margin-bottom: 12px;
    }

    .framework-chip {
      background: #667eea !important;
      color: white !important;
    }

    .design-chip {
      background: #4ecdc4 !important;
      color: white !important;
    }

    .category-chip {
      background: #45b7d1 !important;
      color: white !important;
    }

    .template-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;
    }

    .tag {
      background: #f1f3f4;
      color: #5f6368;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #666;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ddd;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 24px 0;
    }

    @media (max-width: 768px) {
      .templates-layout {
        padding: 16px;
      }

      .search-filters {
        flex-direction: column;
      }

      .search-field,
      .search-filters mat-form-field {
        width: 100%;
        min-width: auto;
      }

      .templates-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Preview Modal */
    .preview-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .preview-modal {
      background: white;
      border-radius: 12px;
      max-width: 1200px;
      max-height: 90vh;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      flex: 1;
    }

    .modal-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-content {
      max-height: calc(90vh - 80px);
      overflow: auto;
    }

    @media (max-width: 768px) {
      .preview-modal {
        margin: 10px;
        max-height: calc(100vh - 20px);
      }

      .modal-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
        text-align: center;
      }

      .modal-actions {
        justify-content: center;
      }
    }
  `]
})
export class TemplatesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly componentStateService = inject(ComponentStateService);

  public searchQuery = '';
  public selectedCategory = '';
  public selectedFramework = '';

  // Selected template for enhanced preview
  public selectedTemplateForPreview = signal<Template | null>(null);

  public readonly templates = signal<Template[]>([
    {
      id: 'btn-1',
      name: 'Modern Button',
      description: 'Sleek button component with multiple variants and hover effects',
      category: 'ui',
      framework: 'react',
      designFramework: 'tailwind',
      preview: '<div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600;">Click Me</div>',
      code: 'button-code-here',
      tags: ['button', 'interactive', 'modern'],
      downloads: 1247,
      rating: 4.8
    },
    {
      id: 'card-1',
      name: 'Product Card',
      description: 'Beautiful product card with image, title, price, and actions',
      category: 'ui',
      framework: 'angular',
      designFramework: 'bootstrap',
      preview: '<div style="background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">📦 Product</div>',
      code: 'card-code-here',
      tags: ['card', 'product', 'ecommerce'],
      downloads: 892,
      rating: 4.6
    },
    {
      id: 'nav-1',
      name: 'Responsive Navbar',
      description: 'Mobile-friendly navigation bar with hamburger menu',
      category: 'navigation',
      framework: 'vue',
      designFramework: 'bootstrap',
      preview: '<div style="background: #333; color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;"><span>Logo</span><span>☰</span></div>',
      code: 'navbar-code-here',
      tags: ['navigation', 'responsive', 'menu'],
      downloads: 2156,
      rating: 4.9
    },
    {
      id: 'form-1',
      name: 'Contact Form',
      description: 'Elegant contact form with validation and animations',
      category: 'forms',
      framework: 'react',
      designFramework: 'material-ui',
      preview: '<div style="background: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">📝 Contact Form</div>',
      code: 'form-code-here',
      tags: ['form', 'contact', 'validation'],
      downloads: 756,
      rating: 4.7
    },
    {
      id: 'table-1',
      name: 'Data Table',
      description: 'Sortable data table with pagination and filtering',
      category: 'data',
      framework: 'angular',
      designFramework: 'material-ui',
      preview: '<div style="background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px;">📊 Data Table</div>',
      code: 'table-code-here',
      tags: ['table', 'data', 'sorting', 'pagination'],
      downloads: 1834,
      rating: 4.5
    },
    {
      id: 'modal-1',
      name: 'Modal Dialog',
      description: 'Customizable modal with backdrop and animations',
      category: 'ui',
      framework: 'vue',
      designFramework: 'tailwind',
      preview: '<div style="background: rgba(0,0,0,0.5); padding: 40px; display: flex; align-items: center; justify-content: center;">🪟 Modal</div>',
      code: 'modal-code-here',
      tags: ['modal', 'dialog', 'overlay'],
      downloads: 1445,
      rating: 4.8
    }
  ]);

  public readonly filteredTemplates = signal<Template[]>([]);

  ngOnInit(): void {
    this.filteredTemplates.set(this.templates());
  }

  filterTemplates(): void {
    let filtered = this.templates();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(template => template.category === this.selectedCategory);
    }

    if (this.selectedFramework) {
      filtered = filtered.filter(template => template.framework === this.selectedFramework);
    }

    this.filteredTemplates.set(filtered);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedFramework = '';
    this.filteredTemplates.set(this.templates());
  }

  useTemplate(template: Template): void {
    // Navigate to generate page with template pre-loaded
    this.router.navigate(['/dashboard/generate'], { 
      queryParams: { template: template.id }
    });
  }

  previewTemplate(template: Template): void {
    this.selectedTemplateForPreview.set(template);
    console.log('🔍 Opening enhanced preview for:', template.name);
  }

  viewCode(template: Template): void {
    this.selectedTemplateForPreview.set(template);
    console.log('👀 Opening enhanced code editor for:', template.name);
  }

  closePreview(): void {
    this.selectedTemplateForPreview.set(null);
  }

  useTemplateFromPreview(): void {
    const template = this.selectedTemplateForPreview();
    if (template) {
      this.useTemplate(template);
      this.closePreview();
    }
  }

  convertTemplateToComponent(template: Template): GeneratedComponent {
    // Convert template to GeneratedComponent format for enhanced preview
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      prompt: `Generate a ${template.name} component with ${template.description}`,
      framework: template.framework,
      category: template.category,
      styleTheme: 'modern',
      designFramework: template.designFramework,
      code: {
        html: template.preview,
        css: this.generateTemplateCode(template, 'styles'),
        javascript: this.generateTemplateCode(template, 'component'),
        typescript: this.generateTemplateCode(template, 'typescript')
      },
      dependencies: this.getTemplateDependencies(template),
      designDependencies: {},
      props: [],
      features: template.tags,
      usage: `Use this ${template.name} template to quickly create a ${template.category} component.`,
      options: {
        responsive: true,
        accessibility: true,
        darkMode: false,
        animations: true,
        typescript: true,
        tests: false,
        includeBootstrap: template.designFramework === 'bootstrap',
        includeMaterialDesign: template.designFramework === 'material-ui'
      },
      preview: template.preview,
      previewWithDesign: template.preview,
      generationMetadata: {
        model: 'template',
        tokensUsed: 0,
        generationTime: 0,
        completionId: `template_${template.id}`,
        temperature: 0.7
      },
      status: 'generated',
      isPublic: true,
      isSaved: false,
      tags: template.tags,
      views: template.downloads,
      likes: Math.floor(template.rating * 10),
      downloads: template.downloads,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private generateTemplateCode(template: Template, type: 'component' | 'styles' | 'typescript' | 'tests'): string {
    const componentName = template.name.replace(/\s+/g, '');
    
    switch (type) {
      case 'component':
        return this.getTemplateComponentCode(template, componentName);
      case 'styles':
        return this.getTemplateStylesCode(template);
      case 'typescript':
        return this.getTemplateTypesCode(componentName);
      case 'tests':
        return this.getTemplateTestsCode(template, componentName);
      default:
        return '';
    }
  }

  private getTemplateComponentCode(template: Template, componentName: string): string {
    if (template.framework === 'react') {
      return `import React from 'react';
import './${componentName}.css';

interface ${componentName}Props {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  children,
  onClick
}) => {
  return (
    <button 
      className={\`\${componentName.toLowerCase()} \${componentName.toLowerCase()}--\${variant} \${componentName.toLowerCase()}--\${size}\`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default ${componentName};`;
    } else if (template.framework === 'angular') {
      return `import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-${componentName.toLowerCase()}',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <button 
      [class]="getButtonClasses()"
      [disabled]="disabled"
      (click)="handleClick()">
      <ng-content></ng-content>
    </button>
  \`,
  styleUrls: ['./${componentName.toLowerCase()}.component.css']
})
export class ${componentName}Component {
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
  @Output() clicked = new EventEmitter<void>();

  getButtonClasses(): string {
    return \`\${componentName.toLowerCase()} \${componentName.toLowerCase()}--\${this.variant} \${componentName.toLowerCase()}--\${this.size}\`;
  }

  handleClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}`;
    } else {
      return `<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled"
    @click="handleClick">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: '${componentName}',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'outline'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    buttonClasses() {
      return [
        '${componentName.toLowerCase()}',
        \`\${componentName.toLowerCase()}--\${this.variant}\`,
        \`\${componentName.toLowerCase()}--\${this.size}\`
      ];
    }
  },
  methods: {
    handleClick() {
      if (!this.disabled) {
        this.$emit('click');
      }
    }
  }
};
</script>

<style scoped src="./${componentName}.css"></style>`;
    }
  }

  private getTemplateStylesCode(template: Template): string {
    const componentName = template.name.replace(/\s+/g, '').toLowerCase();
    
    return `.${componentName} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-family: inherit;
}

.${componentName}:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.${componentName}:active:not(:disabled) {
  transform: translateY(0);
}

.${componentName}:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Variants */
.${componentName}--primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.${componentName}--secondary {
  background: #6c757d;
  color: white;
}

.${componentName}--outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.${componentName}--outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

/* Sizes */
.${componentName}--small {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 32px;
}

.${componentName}--medium {
  padding: 12px 24px;
  font-size: 16px;
  min-height: 40px;
}

.${componentName}--large {
  padding: 16px 32px;
  font-size: 18px;
  min-height: 48px;
}`;
  }

  private getTemplateTypesCode(componentName: string): string {
    return `// Type definitions for ${componentName}

export interface ${componentName}Props {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  id?: string;
}

export interface ${componentName}Ref {
  focus: () => void;
  blur: () => void;
  click: () => void;
}

export type ${componentName}Variant = ${componentName}Props['variant'];
export type ${componentName}Size = ${componentName}Props['size'];

// Event types
export interface ${componentName}ClickEvent {
  type: 'click';
  target: HTMLButtonElement;
  preventDefault: () => void;
  stopPropagation: () => void;
}

// Configuration types
export interface ${componentName}Config {
  defaultVariant: ${componentName}Variant;
  defaultSize: ${componentName}Size;
  enableAnimations: boolean;
  enableRipple: boolean;
}`;
  }

  private getTemplateTestsCode(template: Template, componentName: string): string {
    if (template.framework === 'react') {
      return `import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders correctly with default props', () => {
    render(<${componentName}>Click me</${componentName}>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('${componentName.toLowerCase()}');
    expect(button).toHaveClass('${componentName.toLowerCase()}--primary');
    expect(button).toHaveClass('${componentName.toLowerCase()}--medium');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<${componentName} onClick={handleClick}>Click me</${componentName}>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes correctly', () => {
    render(<${componentName} variant="secondary">Secondary</${componentName}>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('${componentName.toLowerCase()}--secondary');
  });

  it('applies size classes correctly', () => {
    render(<${componentName} size="large">Large Button</${componentName}>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('${componentName.toLowerCase()}--large');
  });

  it('disables correctly', () => {
    const handleClick = jest.fn();
    render(<${componentName} disabled onClick={handleClick}>Disabled</${componentName}>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('supports custom className', () => {
    render(<${componentName} className="custom-class">Custom</${componentName}>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});`;
    } else {
      return `// Test file for ${componentName}
// Add your test framework specific tests here

describe('${componentName}', () => {
  it('should render correctly', () => {
    // Add test implementation
    expect(true).toBe(true);
  });

  it('should handle click events', () => {
    // Add test implementation
    expect(true).toBe(true);
  });

  it('should apply variants correctly', () => {
    // Add test implementation
    expect(true).toBe(true);
  });

  it('should handle disabled state', () => {
    // Add test implementation
    expect(true).toBe(true);
  });
});`;
    }
  }

  private getTemplateDependencies(template: Template): string[] {
    const baseDeps = [];
    
    if (template.framework === 'react') {
      baseDeps.push('react', 'react-dom');
    } else if (template.framework === 'angular') {
      baseDeps.push('@angular/core', '@angular/common');
    } else if (template.framework === 'vue') {
      baseDeps.push('vue');
    }

    if (template.designFramework === 'bootstrap') {
      baseDeps.push('bootstrap');
    } else if (template.designFramework === 'material-ui') {
      baseDeps.push('@mui/material', '@emotion/react', '@emotion/styled');
    } else if (template.designFramework === 'tailwind') {
      baseDeps.push('tailwindcss');
    }

    return baseDeps;
  }


}