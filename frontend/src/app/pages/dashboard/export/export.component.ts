import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DashboardNavComponent } from '../../../components/shared/dashboard-nav/dashboard-nav.component';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    DashboardNavComponent
  ],
  template: `
    <app-dashboard-nav currentPage="Export"></app-dashboard-nav>
    
    <div class="export-layout">
      <div class="export-header">
        <h1>
          <mat-icon>download</mat-icon>
          Export Projects
        </h1>
        <p>Download your generated components as complete projects or individual files</p>
      </div>

      <div class="export-content">
        <mat-card class="export-options">
          <mat-card-header>
            <mat-card-title>Export Options</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="option-group">
              <h3>Export Format</h3>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Export Type</mat-label>
                <mat-select [(ngModel)]="exportType">
                  <mat-option value="project">Complete Project</mat-option>
                  <mat-option value="components">Components Only</mat-option>
                  <mat-option value="individual">Individual Files</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="option-group">
              <h3>Components to Export</h3>
              <div class="component-list">
                @for (component of availableComponents(); track component.id) {
                  <mat-checkbox 
                    [(ngModel)]="component.selected"
                    class="component-checkbox">
                    <div class="component-info">
                      <span class="component-name">{{ component.name }}</span>
                      <span class="component-framework">{{ component.framework }}</span>
                    </div>
                  </mat-checkbox>
                }
              </div>
            </div>

            <div class="option-group">
              <h3>Project Settings</h3>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Project Name</mat-label>
                <input matInput [(ngModel)]="projectName" placeholder="my-components">
              </mat-form-field>

              <div class="project-options">
                <mat-checkbox [(ngModel)]="includeTests">Include Tests</mat-checkbox>
                <mat-checkbox [(ngModel)]="includeStorybook">Include Storybook</mat-checkbox>
                <mat-checkbox [(ngModel)]="includeDocumentation">Include Documentation</mat-checkbox>
                <mat-checkbox [(ngModel)]="includePackageJson">Include package.json</mat-checkbox>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button 
                    color="primary"
                    (click)="exportProject()"
                    [disabled]="!hasSelectedComponents()">
              <mat-icon>download</mat-icon>
              Export Project ({{ getSelectedCount() }} components)
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="export-preview">
          <mat-card-header>
            <mat-card-title>Preview</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="preview-structure">
              <div class="folder-structure">
                <div class="folder-item">
                  <mat-icon>folder</mat-icon>
                  <span>{{ projectName || 'my-components' }}/</span>
                </div>
                <div class="folder-children">
                  <div class="folder-item">
                    <mat-icon>folder</mat-icon>
                    <span>src/</span>
                  </div>
                  <div class="folder-children">
                    <div class="folder-item">
                      <mat-icon>folder</mat-icon>
                      <span>components/</span>
                    </div>
                    <div class="folder-children">
                      @for (component of selectedComponents(); track component.id) {
                        <div class="folder-item">
                          <mat-icon>folder</mat-icon>
                          <span>{{ component.name }}/</span>
                        </div>
                        <div class="folder-children">
                          <div class="file-item">
                            <mat-icon>description</mat-icon>
                            <span>{{ component.name }}.{{ getFileExtension(component.framework) }}</span>
                          </div>
                          <div class="file-item">
                            <mat-icon>style</mat-icon>
                            <span>{{ component.name }}.css</span>
                          </div>
                          @if (includeTests) {
                            <div class="file-item">
                              <mat-icon>bug_report</mat-icon>
                              <span>{{ component.name }}.test.{{ getFileExtension(component.framework) }}</span>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </div>
                  @if (includePackageJson) {
                    <div class="file-item">
                      <mat-icon>description</mat-icon>
                      <span>package.json</span>
                    </div>
                  }
                  @if (includeDocumentation) {
                    <div class="file-item">
                      <mat-icon>description</mat-icon>
                      <span>README.md</span>
                    </div>
                  }
                  @if (includeStorybook) {
                    <div class="folder-item">
                      <mat-icon>folder</mat-icon>
                      <span>.storybook/</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .export-layout {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .export-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .export-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .export-header p {
      margin: 0;
      font-size: 16px;
      color: #666;
    }

    .export-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .export-options,
    .export-preview {
      height: fit-content;
    }

    .option-group {
      margin-bottom: 24px;
    }

    .option-group h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .full-width {
      width: 100%;
    }

    .component-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 12px;
    }

    .component-checkbox {
      width: 100%;
    }

    .component-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .component-name {
      font-weight: 500;
    }

    .component-framework {
      font-size: 12px;
      color: #666;
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 10px;
    }

    .project-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }

    .preview-structure {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
    }

    .folder-structure {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      line-height: 1.6;
    }

    .folder-item,
    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 2px 0;
    }

    .folder-children {
      margin-left: 20px;
      border-left: 1px solid #ddd;
      padding-left: 12px;
    }

    .folder-item mat-icon {
      color: #ffa726;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .file-item mat-icon {
      color: #42a5f5;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    @media (max-width: 968px) {
      .export-content {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .export-layout {
        padding: 16px;
      }
    }
  `]
})
export class ExportComponent implements OnInit {
  public exportType = 'project';
  public projectName = 'my-components';
  public includeTests = true;
  public includeStorybook = false;
  public includeDocumentation = true;
  public includePackageJson = true;

  public readonly availableComponents = signal([
    { id: '1', name: 'Button', framework: 'react', selected: true },
    { id: '2', name: 'Card', framework: 'angular', selected: true },
    { id: '3', name: 'Modal', framework: 'vue', selected: false },
    { id: '4', name: 'Navigation', framework: 'react', selected: true },
    { id: '5', name: 'Form', framework: 'angular', selected: false }
  ]);

  public readonly selectedComponents = signal<any[]>([]);

  ngOnInit(): void {
    this.updateSelectedComponents();
  }

  private updateSelectedComponents(): void {
    const selected = this.availableComponents().filter(c => c.selected);
    this.selectedComponents.set(selected);
  }

  hasSelectedComponents(): boolean {
    return this.availableComponents().some(c => c.selected);
  }

  getSelectedCount(): number {
    return this.availableComponents().filter(c => c.selected).length;
  }

  getFileExtension(framework: string): string {
    const extensions: Record<string, string> = {
      'react': 'jsx',
      'angular': 'ts',
      'vue': 'vue'
    };
    return extensions[framework] || 'js';
  }

  exportProject(): void {
    this.updateSelectedComponents();
    const selected = this.selectedComponents();
    
    if (selected.length === 0) {
      console.log('❌ No components selected for export');
      return;
    }

    console.log('📦 Exporting project:', {
      name: this.projectName,
      type: this.exportType,
      components: selected.map(c => c.name),
      options: {
        tests: this.includeTests,
        storybook: this.includeStorybook,
        docs: this.includeDocumentation,
        packageJson: this.includePackageJson
      }
    });

    // In a real app, this would trigger the actual export/download
    console.log('✅ Export started! Download will begin shortly...');
  }
}