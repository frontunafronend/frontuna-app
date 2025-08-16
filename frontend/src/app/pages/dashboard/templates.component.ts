import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { SeoService } from '@app/services/seo/seo.service';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';
import { EnhancedPreviewComponent } from '@app/components/shared/enhanced-preview.component';
import { GeneratedComponent } from '@app/models/component.model';
import { createDesignFrameworkOptions } from '../../utils/component-upgrade.util';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    EnhancedPreviewComponent
  ],
  template: `
    <div class="templates-layout">
      <div class="templates-header">
        <div class="header-content">
          <h1>
            <mat-icon>view_module</mat-icon>
            Component Templates
          </h1>
          <p>Browse our collection of pre-built component templates</p>
        </div>
        <div class="header-actions">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select [(value)]="selectedCategory">
              <mat-option value="all">All Categories</mat-option>
              <mat-option value="ui">UI Components</mat-option>
              <mat-option value="forms">Forms</mat-option>
              <mat-option value="navigation">Navigation</mat-option>
              <mat-option value="layout">Layout</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div class="templates-grid">
        @for (template of filteredTemplates; track template.id) {
          <mat-card class="template-card">
            <div class="template-preview">
              <div class="preview-content">
                <div class="template-preview-frame" [innerHTML]="getSafePreviewHtml(template.previewHtml)"></div>
              </div>
            </div>
            <mat-card-content>
              <div class="template-info">
                <h3>{{ template.name }}</h3>
                <p>{{ template.description }}</p>
                <div class="template-meta">
                  <mat-chip class="framework-chip">{{ template.framework }}</mat-chip>
                  <mat-chip class="category-chip">{{ template.category }}</mat-chip>
                  <mat-chip class="design-chip" [style.background-color]="getDesignFrameworkColor(template.designFramework)">
                    {{ getDesignFrameworkLabel(template.designFramework) }}
                  </mat-chip>
                </div>
              </div>
              <div class="template-actions">
                <button mat-button color="primary" (click)="previewTemplate(template.id)">
                  <mat-icon>visibility</mat-icon>
                  Preview
                </button>
                <button mat-raised-button color="primary" (click)="useTemplate(template.id)">
                  <mat-icon>add</mat-icon>
                  Use Template
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      @if (filteredTemplates.length === 0) {
        <div class="empty-state">
          <mat-icon>search_off</mat-icon>
          <h3>No templates found</h3>
          <p>Try changing your filter criteria</p>
        </div>
      }

      <!-- Preview Modal -->
      @if (previewedTemplate()) {
        <div class="preview-overlay" (click)="closePreview()">
          <div class="preview-modal" (click)="$event.stopPropagation()">
            <div class="preview-header">
              <h3>{{ previewedTemplate()?.name }}</h3>
              <div class="preview-header-actions">
                <button mat-raised-button color="primary" (click)="useTemplate(previewedTemplate()?.id || '')" class="use-template-btn">
                  <mat-icon>add</mat-icon>
                  Use Template
                </button>
                <button mat-icon-button (click)="closePreview()">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>
            <div class="preview-content">
              <app-enhanced-preview 
                  [component]="getTemplateAsComponent(previewedTemplate()!)" 
                  [enablePlayground]="true">
                </app-enhanced-preview>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .templates-layout {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .templates-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding: 2rem;
      background: rgba(255,255,255,0.95);
      border-radius: var(--border-radius-xl);
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      backdrop-filter: blur(10px);
    }

    .templates-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 0 0 0.5rem 0;
    }

    .templates-header p {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }

    .template-card {
      transition: all var(--transition-normal);
      cursor: pointer;
    }

    .template-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }

    .template-preview {
      height: 200px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: -16px -16px 0 -16px;
      border-radius: var(--border-radius) var(--border-radius) 0 0;
      border-bottom: 1px solid #e0e0e0;
      overflow: hidden;
    }

    .preview-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
    }

    .template-preview-frame {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .template-info {
      margin-bottom: 1.5rem;
    }

    .template-info h3 {
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .template-info p {
      color: #666;
      line-height: 1.5;
      margin: 0 0 1rem 0;
    }

    .template-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .framework-chip {
      background: var(--secondary-color);
      color: white;
    }

    .category-chip {
      background: var(--primary-color);
      color: #333;
    }

    .design-chip {
      color: white;
      font-weight: 500;
    }

    .template-actions {
      display: flex;
      gap: 1rem;
    }

    .template-actions button .mdc-button__label {
      color: white !important;
    }

    .template-actions button mat-icon {
      color: white !important;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    @media (max-width: 768px) {
      .templates-layout {
        padding: 1rem;
      }

      .templates-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
        padding: 1.5rem;
      }

      .templates-header h1 {
        font-size: 2rem;
      }

      .templates-grid {
        grid-template-columns: 1fr;
      }
    }

    .preview-overlay {
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
      padding: 2rem;
    }

    .preview-modal {
      background: white;
      border-radius: 12px;
      max-width: 1200px;
      max-height: 95vh;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .preview-header h3 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
    }

    .preview-header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .use-template-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .use-template-btn .mdc-button__label {
      color: white !important;
    }

    .preview-header-actions button .mdc-button__label {
      color: white !important;
    }

    .preview-header-actions button mat-icon {
      color: white !important;
    }

    .preview-content {
      padding: 0;
      max-height: 80vh;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .preview-overlay {
        padding: 1rem;
      }

      .preview-modal {
        max-height: 95vh;
      }

      .preview-header {
        padding: 1rem 1.5rem;
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .preview-header-actions {
        justify-content: space-between;
      }
    }
  `]
})
export class TemplatesComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  selectedCategory = 'all';
  previewedTemplate = signal<any>(null);
  public readonly designFrameworkOptions = createDesignFrameworkOptions();

  templates = [
    {
      id: 'template_1',
      name: 'User Profile Card',
      description: 'Clean user profile card with avatar, name, and social links',
      framework: 'React',
      category: 'ui',
      designFramework: 'bootstrap-material',
      icon: 'person',
      previewHtml: `
        <div style="width: 200px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 16px; text-align: center; font-family: system-ui;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">👤</div>
          <h4 style="margin: 0 0 4px 0; color: #333; font-size: 16px; font-weight: 600;">Sarah Johnson</h4>
          <p style="margin: 0 0 12px 0; color: #666; font-size: 12px;">UI/UX Designer</p>
          <div style="display: flex; gap: 6px; justify-content: center;">
            <button style="background: #667eea; color: white; border: none; padding: 6px 12px; border-radius: 16px; font-size: 12px;">Follow</button>
            <button style="background: transparent; color: #667eea; border: 1px solid #667eea; padding: 6px 12px; border-radius: 16px; font-size: 12px;">Message</button>
          </div>
        </div>
      `
    },
    {
      id: 'template_2',
      name: 'Navigation Bar',
      description: 'Responsive navigation bar with dropdown menus',
      framework: 'Angular',
      category: 'navigation',
      designFramework: 'bootstrap',
      icon: 'menu',
      previewHtml: `
        <div style="width: 240px; background: #343a40; padding: 8px 16px; border-radius: 6px; color: white; font-family: system-ui;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 16px; font-weight: bold;">Brand</div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <a href="#" style="color: white; text-decoration: none; font-size: 12px;">Home</a>
              <a href="#" style="color: white; text-decoration: none; font-size: 12px;">About</a>
              <a href="#" style="color: white; text-decoration: none; font-size: 12px;">Contact</a>
            </div>
            <button style="background: #007bff; color: white; border: none; padding: 4px 12px; border-radius: 4px; font-size: 12px;">Sign In</button>
          </div>
        </div>
      `
    },
    {
      id: 'template_3',
      name: 'Contact Form',
      description: 'Contact form with validation and success states',
      framework: 'Vue',
      category: 'forms',
      designFramework: 'plain',
      icon: 'contact_mail',
      previewHtml: `
        <div style="width: 220px; background: white; padding: 16px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-family: system-ui;">
          <h4 style="margin: 0 0 12px 0; color: #333; text-align: center; font-size: 14px;">Contact Us</h4>
          <div style="margin-bottom: 8px;">
            <input type="text" placeholder="Your Name" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
          </div>
          <div style="margin-bottom: 8px;">
            <input type="email" placeholder="your@email.com" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
          </div>
          <div style="margin-bottom: 10px;">
            <textarea placeholder="Your message..." rows="2" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; resize: none; box-sizing: border-box;"></textarea>
          </div>
          <button type="submit" style="width: 100%; background: #007bff; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 12px;">Send Message</button>
        </div>
      `
    },
    {
      id: 'template_4',
      name: 'Product Card',
      description: 'E-commerce product card with image, price, and actions',
      framework: 'React',
      category: 'ui',
      designFramework: 'bootstrap',
      icon: 'shopping_bag',
      previewHtml: `
        <div style="width: 180px; background: white; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; font-family: system-ui;">
          <div style="height: 100px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;">📱</div>
          <div style="padding: 12px;">
            <h4 style="margin: 0 0 4px 0; color: #333; font-size: 14px; font-weight: 600;">iPhone 15 Pro</h4>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 11px; line-height: 1.3;">Latest iPhone with pro camera system.</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 16px; font-weight: bold; color: #007bff;">$999</span>
              <span style="font-size: 11px; color: #999; text-decoration: line-through;">$1,199</span>
            </div>
            <button style="width: 100%; background: #007bff; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 11px;">Add to Cart</button>
          </div>
        </div>
      `
    },
    {
      id: 'template_5',
      name: 'Dashboard Layout',
      description: 'Complete dashboard layout with sidebar and main content',
      framework: 'Angular',
      category: 'layout',
      designFramework: 'bootstrap-material',
      icon: 'dashboard',
      previewHtml: `
        <div style="display: flex; width: 240px; height: 140px; font-family: system-ui; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="width: 80px; background: #263238; color: white; padding: 8px;">
            <h5 style="margin: 0 0 8px 0; font-size: 12px;">Dashboard</h5>
            <nav style="display: flex; flex-direction: column; gap: 4px;">
              <a href="#" style="color: white; text-decoration: none; padding: 4px 6px; border-radius: 3px; background: rgba(255,255,255,0.1); font-size: 10px;">Overview</a>
              <a href="#" style="color: rgba(255,255,255,0.7); text-decoration: none; padding: 4px 6px; font-size: 10px;">Analytics</a>
              <a href="#" style="color: rgba(255,255,255,0.7); text-decoration: none; padding: 4px 6px; font-size: 10px;">Users</a>
            </nav>
          </div>
          <div style="flex: 1; padding: 8px; background: #f5f5f5;">
            <h5 style="margin: 0 0 8px 0; color: #333; font-size: 11px;">Welcome back!</h5>
            <div style="display: grid; gap: 6px;">
              <div style="background: white; padding: 8px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 2px 0; color: #666; font-size: 9px;">Users</p>
                <p style="margin: 0; font-size: 16px; font-weight: bold; color: #333;">1,234</p>
              </div>
              <div style="background: white; padding: 8px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 2px 0; color: #666; font-size: 9px;">Revenue</p>
                <p style="margin: 0; font-size: 16px; font-weight: bold; color: #4caf50;">$45,678</p>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'template_6',
      name: 'Login Form',
      description: 'Secure login form with email and password validation',
      framework: 'Vue',
      category: 'forms',
      designFramework: 'bootstrap-material',
      icon: 'login',
      previewHtml: `
        <div style="width: 200px; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); font-family: system-ui;">
          <div style="text-align: center; margin-bottom: 16px;">
            <h4 style="margin: 0 0 4px 0; color: #333; font-weight: 600; font-size: 16px;">Welcome Back</h4>
            <p style="margin: 0; color: #666; font-size: 12px;">Sign in to your account</p>
          </div>
          <div>
            <div style="margin-bottom: 10px;">
              <input type="email" placeholder="Enter your email" style="width: 100%; padding: 8px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 12px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 12px;">
              <input type="password" placeholder="Enter your password" style="width: 100%; padding: 8px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 12px; box-sizing: border-box;">
            </div>
            <button type="submit" style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 8px;">Sign In</button>
            <div style="text-align: center;">
              <a href="#" style="color: #667eea; text-decoration: none; font-size: 10px;">Forgot password?</a>
            </div>
          </div>
        </div>
      `
    }
  ];

  get filteredTemplates() {
    if (this.selectedCategory === 'all') {
      return this.templates;
    }
    return this.templates.filter(template => template.category === this.selectedCategory);
  }

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'Component Templates - Frontuna.ai',
      description: 'Browse our collection of pre-built component templates for React, Angular, and Vue.',
      url: 'https://frontuna.ai/dashboard/templates',
      robots: 'noindex, nofollow'
    });

    this.analyticsService.trackPageView({
      page_title: 'Templates - Frontuna.ai',
      page_location: window.location.href
    });
  }

  previewTemplate(templateId: string): void {
    this.analyticsService.trackEvent({
      action: 'template_preview',
      category: 'templates',
      label: templateId
    });
    
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      this.previewedTemplate.set(template);
    }
  }

  useTemplate(templateId: string): void {
    this.analyticsService.trackEvent({
      action: 'template_use',
      category: 'templates',
      label: templateId
    });
    
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      // Navigate to generator with pre-filled template data
      this.router.navigate(['/dashboard/generate'], {
        queryParams: {
          template: templateId,
          name: template.name,
          framework: template.framework.toLowerCase(),
          category: template.category,
          designFramework: template.designFramework,
          prompt: `Create a ${template.name.toLowerCase()} similar to the template`
        }
      });
    }
  }

  closePreview(): void {
    this.previewedTemplate.set(null);
  }

  getDesignFrameworkLabel(framework: string): string {
    const option = this.designFrameworkOptions.find((opt: any) => opt.value === framework);
    return option?.label || framework || 'Plain CSS';
  }

  getDesignFrameworkColor(framework: string): string {
    const option = this.designFrameworkOptions.find((opt: any) => opt.value === framework);
    return option?.color || '#1976d2';
  }

  getTemplateAsComponent(template: any): GeneratedComponent {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      prompt: `Template: ${template.name}`,
      framework: template.framework.toLowerCase(),
      category: template.category,
      styleTheme: 'modern',
      designFramework: template.designFramework,
      code: {
        html: template.previewHtml,
        css: '',
        javascript: '',
        typescript: ''
      },
      dependencies: [],
      designDependencies: this.getDesignDependencies(template.designFramework),
      props: [],
      features: ['Template', 'Ready to use'],
      usage: 'Use this template as a starting point for your component development',
      options: {
        responsive: true,
        accessibility: true,
        darkMode: false,
        animations: false,
        typescript: template.framework === 'Angular',
        tests: false,
        includeBootstrap: template.designFramework.includes('bootstrap'),
        includeMaterialDesign: template.designFramework === 'bootstrap-material'
      },
      preview: template.previewHtml,
      previewWithDesign: template.previewHtml,
      generationMetadata: {
        model: 'template',
        tokensUsed: 0,
        generationTime: 0,
        completionId: `template_${template.id}`,
        temperature: 0
      },
      status: 'generated',
      isPublic: true,
      isSaved: false,
      tags: [template.framework, template.category, 'template'],
      views: 0,
      likes: 0,
      downloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private getDesignDependencies(designFramework: string): any {
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

  getSafePreviewHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}