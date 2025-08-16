import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

import { SeoService } from '@app/services/seo/seo.service';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';
import { EnhancedPreviewComponent } from '@app/components/shared/enhanced-preview.component';
import { GeneratedComponent } from '@app/models/component.model';
import { upgradeComponentToV2, createDesignFrameworkOptions, upgradeComponentsToV2 } from '../../utils/component-upgrade.util';

@Component({
  selector: 'app-history',
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
    MatTableModule,
    MatPaginatorModule,
    EnhancedPreviewComponent
  ],
  template: `
    <div class="history-layout">
      <div class="history-header">
        <div class="header-content">
          <h1>
            <mat-icon>history</mat-icon>
            Generation History
          </h1>
          <p>View and manage your component generation history</p>
        </div>
        <div class="header-actions">
          <mat-form-field appearance="outline">
            <mat-label>Framework</mat-label>
            <mat-select [(value)]="selectedFramework">
              <mat-option value="all">All Frameworks</mat-option>
              <mat-option value="react">React</mat-option>
              <mat-option value="angular">Angular</mat-option>
              <mat-option value="vue">Vue</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div class="history-content">
        <div class="history-list">
          @for (item of filteredHistory; track item.id) {
            <mat-card class="history-item">
              <mat-card-content>
                <div class="item-header">
                  <div class="item-info">
                    <h3>{{ item.name }}</h3>
                    <p class="item-description">{{ item.description }}</p>
                    <div class="item-meta">
                      <mat-chip class="framework-chip">{{ item.framework }}</mat-chip>
                      <mat-chip class="category-chip">{{ item.category }}</mat-chip>
                      <mat-chip class="design-chip" [style.background-color]="getDesignFrameworkColor(item.designFramework)">
                        {{ getDesignFrameworkLabel(item.designFramework) }}
                      </mat-chip>
                      <span class="item-date">{{ item.createdAt | date:'medium' }}</span>
                    </div>
                  </div>
                  <div class="item-actions">
                    <button mat-icon-button (click)="showPreview(item.id)" matTooltip="Preview Component">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button (click)="viewComponent(item.id)" matTooltip="View Details">
                      <mat-icon>open_in_new</mat-icon>
                    </button>
                    <button mat-icon-button (click)="regenerateComponent(item.id)" matTooltip="Regenerate">
                      <mat-icon>refresh</mat-icon>
                    </button>
                    <button mat-icon-button (click)="saveToLibrary(item.id)" matTooltip="Save to Library" [disabled]="item.isSaved">
                      <mat-icon>{{ item.isSaved ? 'bookmark' : 'bookmark_border' }}</mat-icon>
                    </button>
                    <button mat-icon-button (click)="downloadComponent(item.id)" matTooltip="Download">
                      <mat-icon>download</mat-icon>
                    </button>
                  </div>
                </div>
                
                <div class="item-stats">
                  <div class="stat">
                    <mat-icon>code</mat-icon>
                    <span>{{ item.code.html.length || 0 }} chars</span>
                  </div>
                  <div class="stat">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ item.generationMetadata.generationTime || 0 }}s</span>
                  </div>
                  @if (item.isSaved) {
                    <div class="stat saved">
                      <mat-icon>bookmark</mat-icon>
                      <span>Saved</span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        @if (filteredHistory.length === 0) {
          <div class="empty-state">
            <mat-icon>history</mat-icon>
            <h3>No generation history</h3>
            <p>Start generating components to see your history here</p>
            <button mat-raised-button color="primary" routerLink="/dashboard/generate">
              <mat-icon>add</mat-icon>
              Generate Component
            </button>
          </div>
        }
      </div>

      <!-- Preview Modal -->
      @if (previewComponent()) {
        <div class="preview-overlay" (click)="closePreview()">
          <div class="preview-modal" (click)="$event.stopPropagation()">
            <div class="preview-header">
              <h3>{{ previewComponent()?.name }}</h3>
              <button mat-icon-button (click)="closePreview()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="preview-content">
              <app-enhanced-preview 
                  [component]="previewComponent()" 
                  [enablePlayground]="true">
                </app-enhanced-preview>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .history-layout {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .history-header {
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

    .history-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 0 0 0.5rem 0;
    }

    .history-header p {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .history-item {
      transition: all var(--transition-normal);
    }

    .history-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .item-info h3 {
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #2c2c2c;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .item-description {
      color: #4a4a4a;
      line-height: 1.5;
      margin: 0 0 1rem 0;
      font-weight: 500;
    }

    .item-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .framework-chip {
      background: var(--secondary-color) !important;
      color: white !important;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    .category-chip {
      background: var(--primary-color) !important;
      color: #2c2c2c !important;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .design-chip {
      color: white !important;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0,0,0,0.4);
    }

    .item-date {
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
    }

    .item-actions {
      display: flex;
      gap: 0.5rem;
    }

    .item-stats {
      display: flex;
      gap: 2rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #666;
    }

    .stat.saved {
      color: var(--secondary-color);
    }

    .stat mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
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

    .empty-state p {
      margin: 0 0 2rem 0;
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

    .preview-content {
      padding: 0;
      max-height: 80vh;
      overflow-y: auto;
    }

    .preview-frame {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 2rem;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .history-layout {
        padding: 1rem;
      }

      .history-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
        padding: 1.5rem;
      }

      .history-header h1 {
        font-size: 2rem;
      }

      .item-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .item-actions {
        justify-content: flex-end;
      }

      .item-stats {
        gap: 1rem;
        flex-wrap: wrap;
      }

      .preview-overlay {
        padding: 1rem;
      }

      .preview-modal {
        max-height: 95vh;
      }

      .preview-header {
        padding: 1rem 1.5rem;
      }

      .preview-content {
        padding: 1.5rem;
      }

      .preview-frame {
        padding: 1rem;
        min-height: 200px;
      }
    }
  `]
})
export class HistoryComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);
  private readonly router = inject(Router);

  selectedFramework = 'all';
  previewComponent = signal<GeneratedComponent | null>(null);
  public readonly designFrameworkOptions = createDesignFrameworkOptions();

  private legacyHistory = [
    {
      id: 'hist_1',
      name: 'User Profile Card',
      description: 'A responsive user profile card with avatar and social links',
      framework: 'react',
      category: 'UI',
      createdAt: new Date(),
      linesOfCode: 85,
      generationTime: 12,
      isSaved: true,
      preview: `
        <div style="max-width: 300px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">👤</div>
            <h3 style="margin: 0 0 5px 0; color: #333;">John Doe</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">Frontend Developer</p>
          </div>
          <div style="text-align: center;">
            <button style="background: #667eea; color: white; border: none; padding: 8px 20px; border-radius: 20px; margin: 0 5px; cursor: pointer;">Follow</button>
            <button style="background: transparent; color: #667eea; border: 1px solid #667eea; padding: 8px 20px; border-radius: 20px; margin: 0 5px; cursor: pointer;">Message</button>
          </div>
        </div>
      `
    },
    {
      id: 'hist_2', 
      name: 'Navigation Menu',
      description: 'Mobile-friendly navigation menu with dropdown support',
      framework: 'angular',
      category: 'Navigation',
      createdAt: new Date(Date.now() - 86400000),
      linesOfCode: 142,
      generationTime: 18,
      isSaved: false,
      preview: `
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #e0e0e0;">
            <div style="font-weight: 600; font-size: 18px; color: #333;">My App</div>
            <div style="display: flex; gap: 20px;">
              <a href="#" style="color: #667eea; text-decoration: none; font-size: 14px;">Home</a>
              <a href="#" style="color: #666; text-decoration: none; font-size: 14px;">About</a>
              <a href="#" style="color: #666; text-decoration: none; font-size: 14px;">Services</a>
              <a href="#" style="color: #666; text-decoration: none; font-size: 14px;">Contact</a>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'hist_3',
      name: 'Data Table',
      description: 'Sortable and filterable data table component',
      framework: 'vue',
      category: 'Data',
      createdAt: new Date(Date.now() - 172800000),
      linesOfCode: 203,
      generationTime: 25,
      isSaved: true,
      preview: `
        <div style="max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e0e0e0;">
            <h4 style="margin: 0; color: #333; font-size: 16px;">User Data</h4>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="background: #f1f3f4;">
              <tr>
                <th style="padding: 12px; text-align: left; font-size: 14px; color: #555; border-bottom: 1px solid #e0e0e0;">Name</th>
                <th style="padding: 12px; text-align: left; font-size: 14px; color: #555; border-bottom: 1px solid #e0e0e0;">Email</th>
                <th style="padding: 12px; text-align: left; font-size: 14px; color: #555; border-bottom: 1px solid #e0e0e0;">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0;">John Doe</td>
                <td style="padding: 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0;">john@example.com</td>
                <td style="padding: 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0;"><span style="background: #e8f5e8; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Active</span></td>
              </tr>
              <tr>
                <td style="padding: 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0;">Jane Smith</td>
                <td style="padding: 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0;">jane@example.com</td>
                <td style="padding: 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0;"><span style="background: #fff3e0; color: #f57c00; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Pending</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      `
    },
    {
      id: 'hist_4',
      name: 'Modal Dialog',
      description: 'Customizable modal with smooth animations',
      framework: 'react',
      category: 'UI',
      createdAt: new Date(Date.now() - 259200000),
      linesOfCode: 67,
      generationTime: 8,
      isSaved: false,
      preview: `
        <div style="max-width: 400px; margin: 0 auto; position: relative;">
          <div style="background: rgba(0,0,0,0.5); padding: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 300px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; text-align: center;">Confirm Action</h3>
              <p style="margin: 0 0 25px 0; color: #666; font-size: 14px; text-align: center; line-height: 1.5;">Are you sure you want to delete this item? This action cannot be undone.</p>
              <div style="display: flex; gap: 10px; justify-content: center;">
                <button style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;">Delete</button>
                <button style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      `
    }
  ];

  // Upgrade legacy history to support new design framework system
  history: GeneratedComponent[] = upgradeComponentsToV2(this.legacyHistory);

  get filteredHistory() {
    if (this.selectedFramework === 'all') {
      return this.history;
    }
    return this.history.filter(item => item.framework === this.selectedFramework);
  }

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'Generation History - Frontuna.ai',
      description: 'View and manage your component generation history.',
      url: 'https://frontuna.ai/dashboard/history',
      robots: 'noindex, nofollow'
    });

    this.analyticsService.trackPageView({
      page_title: 'History - Frontuna.ai',
      page_location: window.location.href
    });
  }

  showPreview(componentId: string): void {
    const component = this.history.find(h => h.id === componentId);
    if (component) {
      this.previewComponent.set(component);
      this.analyticsService.trackEvent({
        action: 'preview_component',
        category: 'history',
        label: componentId
      });
    }
  }

  closePreview(): void {
    this.previewComponent.set(null);
  }

  getDesignFrameworkLabel(framework: string): string {
    const option = this.designFrameworkOptions.find((opt: any) => opt.value === framework);
    return option?.label || framework || 'Plain CSS';
  }

  getDesignFrameworkColor(framework: string): string {
    const option = this.designFrameworkOptions.find((opt: any) => opt.value === framework);
    return option?.color || '#1976d2';
  }

  viewComponent(componentId: string): void {
    this.analyticsService.trackEvent({
      action: 'view_component',
      category: 'history',
      label: componentId
    });
    
    // Navigate to component detail view
    this.router.navigate(['/dashboard/component', componentId]);
  }

  regenerateComponent(componentId: string): void {
    this.analyticsService.trackEvent({
      action: 'regenerate_component',
      category: 'history',
      label: componentId
    });
    
    // Navigate to generator with pre-filled data
    console.log('Regenerate component:', componentId);
  }

  saveToLibrary(componentId: string): void {
    const item = this.history.find(h => h.id === componentId);
    if (item && !item.isSaved) {
      item.isSaved = true;
      
      this.analyticsService.trackEvent({
        action: 'save_to_library',
        category: 'history',
        label: componentId
      });
      
      console.log('Saved to library:', item.name);
    }
  }

  downloadComponent(componentId: string): void {
    this.analyticsService.trackEvent({
      action: 'download_component',
      category: 'history',
      label: componentId
    });
    
    // Trigger download
    console.log('Download component:', componentId);
  }
}