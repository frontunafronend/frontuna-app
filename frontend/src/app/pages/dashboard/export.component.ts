import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { SeoService } from '@app/services/seo/seo.service';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule
  ],
  template: `
    <div class="export-layout">
      <div class="export-header">
        <div class="header-content">
          <h1>
            <mat-icon>download</mat-icon>
            Export Components
          </h1>
          <p>Export your components as files, projects, or integrate with your repositories</p>
        </div>
      </div>

      <div class="export-content">
        <!-- Component Selection -->
        <mat-card class="selection-card">
          <mat-card-header>
            <mat-card-title>Select Components to Export</mat-card-title>
            <mat-card-subtitle>Choose which components you want to export</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="components-list">
              @for (component of components; track component.id) {
                <div class="component-item">
                  <mat-checkbox [(ngModel)]="component.selected">
                    <div class="component-info">
                      <h4>{{ component.name }}</h4>
                      <p>{{ component.framework }} • {{ component.category }}</p>
                    </div>
                  </mat-checkbox>
                </div>
              }
            </div>
            
            <div class="selection-actions">
              <button mat-button (click)="selectAll()">Select All</button>
              <button mat-button (click)="selectNone()">Select None</button>
              <span class="selection-count">{{ selectedCount }} of {{ components.length }} selected</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Export Options -->
        <mat-card class="options-card">
          <mat-card-header>
            <mat-card-title>Export Options</mat-card-title>
            <mat-card-subtitle>Configure your export settings</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="export-formats">
              <h3>Export Format</h3>
              <div class="format-options">
                <mat-card class="format-card" [class.selected]="selectedFormat === 'zip'" (click)="selectedFormat = 'zip'">
                  <div class="format-icon">
                    <mat-icon>archive</mat-icon>
                  </div>
                  <h4>ZIP Archive</h4>
                  <p>Download as a compressed zip file</p>
                </mat-card>

                <mat-card class="format-card" [class.selected]="selectedFormat === 'project'" (click)="selectedFormat = 'project'">
                  <div class="format-icon">
                    <mat-icon>folder</mat-icon>
                  </div>
                  <h4>Project Structure</h4>
                  <p>Complete project with dependencies</p>
                </mat-card>

                <mat-card class="format-card" [class.selected]="selectedFormat === 'individual'" (click)="selectedFormat = 'individual'">
                  <div class="format-icon">
                    <mat-icon>description</mat-icon>
                  </div>
                  <h4>Individual Files</h4>
                  <p>Separate files for each component</p>
                </mat-card>
              </div>
            </div>

            <div class="additional-options">
              <h3>Additional Options</h3>
              <div class="options-grid">
                <mat-checkbox [(ngModel)]="includeTests">Include Tests</mat-checkbox>
                <mat-checkbox [(ngModel)]="includeStories">Include Storybook Stories</mat-checkbox>
                <mat-checkbox [(ngModel)]="includeDocumentation">Include Documentation</mat-checkbox>
                <mat-checkbox [(ngModel)]="includeDependencies">Include Dependencies</mat-checkbox>
              </div>
            </div>

            @if (selectedFormat === 'project') {
              <div class="project-options">
                <mat-form-field appearance="outline">
                  <mat-label>Project Name</mat-label>
                  <input matInput [(ngModel)]="projectName" placeholder="my-components-project">
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Package Manager</mat-label>
                  <mat-select [(value)]="packageManager">
                    <mat-option value="npm">npm</mat-option>
                    <mat-option value="yarn">Yarn</mat-option>
                    <mat-option value="pnpm">pnpm</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <!-- Export Actions -->
        <mat-card class="actions-card">
          <mat-card-content>
            <div class="export-actions">
              <div class="export-info">
                <h3>Ready to Export</h3>
                <p>{{ selectedCount }} components selected • {{ selectedFormat }} format</p>
                @if (isExporting) {
                  <mat-progress-bar mode="determinate" [value]="exportProgress"></mat-progress-bar>
                  <p class="progress-text">Exporting... {{ exportProgress }}%</p>
                }
              </div>
              
              <div class="action-buttons">
                <button mat-button routerLink="/dashboard">Cancel</button>
                <button mat-raised-button 
                        color="primary" 
                        (click)="exportComponents()" 
                        [disabled]="selectedCount === 0 || isExporting"
                        class="export-btn">
                  @if (isExporting) {
                    <span>
                      <mat-icon>hourglass_empty</mat-icon>
                      Exporting...
                    </span>
                  } @else {
                    <span>
                      <mat-icon>download</mat-icon>
                      Export Components
                    </span>
                  }
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .export-layout {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .export-header {
      margin-bottom: 2rem;
      padding: 2rem;
      background: rgba(255,255,255,0.95);
      border-radius: var(--border-radius-xl);
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      backdrop-filter: blur(10px);
      text-align: center;
    }

    .export-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin: 0 0 0.5rem 0;
    }

    .export-header p {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    .export-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .components-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 1rem;
    }

    .component-item {
      padding: 0.5rem;
      border-radius: var(--border-radius);
      transition: background-color var(--transition-fast);
    }

    .component-item:hover {
      background-color: #f5f5f5;
    }

    .component-info h4 {
      margin: 0 0 0.25rem 0;
      font-weight: 600;
    }

    .component-info p {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }

    .selection-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .selection-count {
      margin-left: auto;
      font-size: 0.9rem;
      color: #666;
    }

    .export-formats h3,
    .additional-options h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
      color: #333;
    }

    .format-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .format-card {
      cursor: pointer;
      transition: all var(--transition-normal);
      text-align: center;
      padding: 1.5rem;
      border: 2px solid transparent;
    }

    .format-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .format-card.selected {
      border-color: var(--primary-color);
      background: rgba(255, 193, 7, 0.1);
    }

    .format-icon {
      width: 60px;
      height: 60px;
      background: var(--secondary-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      color: white;
    }

    .format-icon mat-icon {
      font-size: 1.8rem;
      width: 1.8rem;
      height: 1.8rem;
    }

    .format-card h4 {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }

    .format-card p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .project-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .export-actions {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 2rem;
    }

    .export-info h3 {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }

    .export-info p {
      margin: 0;
      color: #666;
    }

    .progress-text {
      font-size: 0.9rem;
      margin-top: 0.5rem !important;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
    }

    .export-btn {
      padding: 0.75rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .export-layout {
        padding: 1rem;
      }

      .export-header h1 {
        font-size: 2rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .format-options {
        grid-template-columns: 1fr;
      }

      .project-options {
        grid-template-columns: 1fr;
      }

      .export-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .action-buttons {
        justify-content: stretch;
      }

      .action-buttons button {
        flex: 1;
      }
    }
  `]
})
export class ExportComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);

  selectedFormat = 'zip';
  projectName = 'my-components-project';
  packageManager = 'npm';
  
  includeTests = true;
  includeStories = false;
  includeDependencies = true;
  includeDocumentation = true;

  isExporting = false;
  exportProgress = 0;

  components = [
    { id: '1', name: 'User Profile Card', framework: 'React', category: 'UI', selected: true },
    { id: '2', name: 'Navigation Menu', framework: 'Angular', category: 'Navigation', selected: false },
    { id: '3', name: 'Data Table', framework: 'Vue', category: 'Data', selected: true },
    { id: '4', name: 'Modal Dialog', framework: 'React', category: 'UI', selected: false },
    { id: '5', name: 'Loading Spinner', framework: 'Angular', category: 'UI', selected: true }
  ];

  get selectedCount(): number {
    return this.components.filter(c => c.selected).length;
  }

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'Export Components - Frontuna.ai',
      description: 'Export your generated components as files, projects, or integrate with repositories.',
      url: 'https://frontuna.ai/dashboard/export',
      robots: 'noindex, nofollow'
    });

    this.analyticsService.trackPageView({
      page_title: 'Export - Frontuna.ai',
      page_location: window.location.href
    });
  }

  selectAll(): void {
    this.components.forEach(c => c.selected = true);
  }

  selectNone(): void {
    this.components.forEach(c => c.selected = false);
  }

  exportComponents(): void {
    if (this.selectedCount === 0) return;

    this.analyticsService.trackEvent({
      action: 'export_components',
      category: 'export',
      label: `${this.selectedFormat}_${this.selectedCount}_components`
    });

    this.isExporting = true;
    this.exportProgress = 0;

    // Simulate export progress
    const interval = setInterval(() => {
      this.exportProgress += 10;
      if (this.exportProgress >= 100) {
        clearInterval(interval);
        this.completeExport();
      }
    }, 200);
  }

  private completeExport(): void {
    this.isExporting = false;
    this.exportProgress = 0;

    // In a real app, this would trigger the actual download
    const selectedComponents = this.components.filter(c => c.selected);
    console.log('✅ Export completed:', {
      format: this.selectedFormat,
      components: selectedComponents,
      options: {
        includeTests: this.includeTests,
        includeStories: this.includeStories,
        includeDependencies: this.includeDependencies,
        includeDocumentation: this.includeDocumentation,
        projectName: this.projectName,
        packageManager: this.packageManager
      }
    });

    alert(`🎉 Export completed!\n\n${selectedComponents.length} components exported as ${this.selectedFormat}.`);
  }
}