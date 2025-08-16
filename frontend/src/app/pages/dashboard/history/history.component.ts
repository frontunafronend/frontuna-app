import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { ComponentStateService, GeneratedComponent } from '../../../services/component-state/component-state.service';
import { SeoService } from '../../../services/seo/seo.service';
import { GoogleAnalyticsService } from '../../../services/analytics/google-analytics.service';
import { MonacoEditorComponent } from '../../../components/shared/monaco-editor/monaco-editor.component';
import { EnhancedPreviewComponent } from '../../../components/shared/enhanced-preview/enhanced-preview.component';
import { DashboardNavComponent } from '../../../components/shared/dashboard-nav/dashboard-nav.component';

interface GenerationHistory {
  id: string;
  name: string;
  description: string;
  framework: string;
  designFramework: string;
  createdAt: Date;
  status: 'completed' | 'failed' | 'in-progress';
  codePreview: string;
  filesGenerated: number;
  isSaved: boolean;
}

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
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MonacoEditorComponent,
    EnhancedPreviewComponent,
    DashboardNavComponent
  ],
  template: `
    <app-dashboard-nav currentPage="History"></app-dashboard-nav>
    
    <div class="history-layout">
      <div class="history-header">
        <h1>
          <mat-icon>history</mat-icon>
          Generation History
        </h1>
        <p>View and manage all your generated components</p>
        
        <div class="history-filters">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search history</mat-label>
            <input matInput 
                   [(ngModel)]="searchQuery"
                   (ngModelChange)="filterHistory()"
                   placeholder="Search by name or description">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Framework</mat-label>
            <mat-select [(ngModel)]="selectedFramework" (selectionChange)="filterHistory()">
              <mat-option value="">All Frameworks</mat-option>
              <mat-option value="react">React</mat-option>
              <mat-option value="angular">Angular</mat-option>
              <mat-option value="vue">Vue.js</mat-option>
            </mat-select>
          </mat-form-field>
          
          <button mat-raised-button 
                  color="warn"
                  (click)="clearAllHistory()"
                  [disabled]="filteredHistory().length === 0">
            <mat-icon>delete_sweep</mat-icon>
            Clear All
          </button>
        </div>
      </div>

      <div class="history-list">
        @for (item of filteredHistory(); track item.id) {
          <mat-card class="history-item" [class.failed]="item.status === 'failed'">
            <mat-card-content>
              <div class="history-item-header">
                <div class="item-info">
                  <h3>{{ item.name }}</h3>
                  <p class="item-description">{{ item.description }}</p>
                  <div class="item-meta">
                    <mat-chip class="framework-chip">{{ item.framework }}</mat-chip>
                    <mat-chip class="design-chip">{{ item.designFramework }}</mat-chip>
                    <mat-chip [class]="'status-chip status-' + item.status">
                      {{ item.status | titlecase }}
                    </mat-chip>
                    <span class="item-date">{{ item.createdAt | date:'medium' }}</span>
                  </div>
                </div>
                
                <div class="item-actions">
                  <button mat-icon-button (click)="toggleCodeView(item.id)">
                    <mat-icon>{{ showingCode === item.id ? 'visibility_off' : 'code' }}</mat-icon>
                  </button>
                </div>
              </div>
              
              @if (item.status === 'completed' && showingCode === item.id) {
                <div class="code-editor-container">
                  <app-monaco-editor
                    [value]="item.codePreview"
                    [language]="getLanguageForFramework(item.framework)"
                    [height]="300"
                    [title]="'Component Code - ' + item.name"
                    [readonly]="false"
                    (valueChange)="onCodeChange(item.id, $event)">
                  </app-monaco-editor>
                </div>
              }
              
              @if (item.status === 'failed') {
                <div class="error-info">
                  <mat-icon class="error-icon">error</mat-icon>
                  <span>Generation failed. Click retry to try again.</span>
                </div>
              }
              
              @if (item.status === 'in-progress') {
                <div class="progress-info">
                  <mat-icon class="progress-icon">refresh</mat-icon>
                  <span>Generation in progress...</span>
                </div>
              }
            </mat-card-content>
            
            <mat-card-actions>
              @if (item.status === 'completed') {
                <button mat-button (click)="copyCode(item)">
                  <mat-icon>content_copy</mat-icon>
                  Copy
                </button>
                <button mat-button (click)="downloadFiles(item)">
                  <mat-icon>download</mat-icon>
                  Download
                </button>
                @if (!item.isSaved) {
                  <button mat-button (click)="saveToLibrary(item)">
                    <mat-icon>bookmark_border</mat-icon>
                    Save
                  </button>
                } @else {
                  <button mat-button disabled>
                    <mat-icon>bookmark</mat-icon>
                    Saved
                  </button>
                }
              }
              
              @if (item.status === 'failed') {
                <button mat-button color="primary" (click)="retryGeneration(item)">
                  <mat-icon>refresh</mat-icon>
                  Retry
                </button>
              }
              
              <button mat-button (click)="regenerateComponent(item)">
                <mat-icon>auto_awesome</mat-icon>
                Regenerate
              </button>
              
              <button mat-button color="warn" (click)="deleteItem(item)">
                <mat-icon>delete</mat-icon>
                Delete
              </button>
            </mat-card-actions>
          </mat-card>
        } @empty {
          <div class="empty-state">
            <mat-icon class="empty-icon">history</mat-icon>
            <h3>No generation history</h3>
            <p>Start generating components to see your history here.</p>
            <button mat-raised-button 
                    color="primary"
                    routerLink="/dashboard/generate">
              <mat-icon>auto_awesome</mat-icon>
              Generate Component
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .history-layout {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      min-height: calc(100vh - 200px);
    }

    .history-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .history-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .history-filters {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
      max-width: 900px;
      margin: 24px auto 0;
    }

    .search-field {
      flex: 2;
      min-width: 250px;
    }

    .history-filters mat-form-field {
      flex: 1;
      min-width: 120px;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-bottom: 60px;
    }

    .history-item {
      transition: all 0.2s ease;
    }

    .history-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .history-item.failed {
      border-left: 4px solid #f44336;
    }

    .history-item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .item-info h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .item-description {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }

    .item-meta {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .framework-chip {
      background: #667eea !important;
      color: white !important;
    }

    .design-chip {
      background: #4ecdc4 !important;
      color: white !important;
    }

    .status-chip {
      font-weight: 600 !important;
    }

    .status-completed {
      background: #4caf50 !important;
      color: white !important;
    }

    .status-failed {
      background: #f44336 !important;
      color: white !important;
    }

    .status-in-progress {
      background: #ff9800 !important;
      color: white !important;
    }

    .item-date {
      font-size: 12px;
      color: #999;
      margin-left: auto;
    }

    .code-editor-container {
      margin: 16px 0;
      border-radius: 8px;
      overflow: hidden;
    }

    .error-info,
    .progress-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .error-info {
      background: #ffebee;
      color: #c62828;
    }

    .progress-info {
      background: #fff3e0;
      color: #e65100;
    }

    .empty-state {
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

    @media (max-width: 768px) {
      .history-layout {
        padding: 16px;
        min-height: calc(100vh - 150px);
      }

      .history-filters {
        flex-direction: column;
      }

      .search-field,
      .history-filters mat-form-field {
        width: 100%;
        min-width: auto;
      }

      .history-item-header {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class HistoryComponent implements OnInit {
  private readonly componentStateService = inject(ComponentStateService);
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);
  
  public searchQuery = '';
  public selectedFramework = '';
  public showingCode = '';
  
  // Private properties
  private autoSaveTimeout: any;

  public readonly historyItems = signal<GenerationHistory[]>([
    {
      id: 'hist-1',
      name: 'Button Component',
      description: 'A modern button component with multiple variants and hover effects',
      framework: 'react',
      designFramework: 'tailwind',
      createdAt: new Date(),
      status: 'completed',
      codePreview: `const Button = ({ variant = 'primary', children, ...props }) => {
  return (
    <button 
      className={\`btn btn-\${variant}\`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;`,
      filesGenerated: 3,
      isSaved: true
    },
    {
      id: 'hist-2',
      name: 'Card Component',
      description: 'Responsive card component with image and content areas',
      framework: 'angular',
      designFramework: 'bootstrap',
      createdAt: new Date(Date.now() - 86400000),
      status: 'completed',
      codePreview: `@Component({
  selector: 'app-card',
  template: \`
    <div class="card">
      <ng-content></ng-content>
    </div>
  \`
})
export class CardComponent {}`,
      filesGenerated: 4,
      isSaved: false
    }
  ]);

  public readonly filteredHistory = signal<GenerationHistory[]>([]);

  ngOnInit(): void {
    this.filteredHistory.set(this.historyItems());
  }

  filterHistory(): void {
    let filtered = this.historyItems();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    if (this.selectedFramework) {
      filtered = filtered.filter(item => item.framework === this.selectedFramework);
    }

    this.filteredHistory.set(filtered);
  }

  toggleCodeView(itemId: string): void {
    this.showingCode = this.showingCode === itemId ? '' : itemId;
  }

  getLanguageForFramework(framework: string): string {
    const languageMap: Record<string, string> = {
      'react': 'typescript',
      'angular': 'typescript',
      'vue': 'vue',
      'javascript': 'javascript'
    };
    return languageMap[framework] || 'typescript';
  }

  onCodeChange(itemId: string, newCode: string): void {
    console.log('History code change:', itemId, newCode.length + ' characters');
    
    const items = this.historyItems();
    const updatedItems = items.map(item => 
      item.id === itemId ? { 
        ...item, 
        codePreview: newCode,
        lastModified: new Date(),
        hasUnsavedChanges: true 
      } : item
    );
    
    this.historyItems.set(updatedItems);
    this.filterHistory();
    
    // Auto-save after 2 seconds of no changes
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveHistoryItem(itemId);
    }, 2000);
  }

  copyCode(item: GenerationHistory): void {
    navigator.clipboard.writeText(item.codePreview);
    console.log('📋 Code copied to clipboard!');
  }

  saveHistoryItem(itemId: string): void {
    console.log('Auto-saving history item:', itemId);
    
    const items = this.historyItems();
    const updatedItems = items.map(item => 
      item.id === itemId ? { 
        ...item, 
        hasUnsavedChanges: false,
        lastSaved: new Date()
      } : item
    );
    
    this.historyItems.set(updatedItems);
    
    // Here you would typically call a service to persist the changes
    // this.componentStateService.saveHistoryItem(itemId, updatedItem);
  }

  downloadFiles(item: GenerationHistory): void {
    console.log('📥 Downloading files for:', item.name);
  }

  saveToLibrary(item: GenerationHistory): void {
    item.isSaved = true;
    console.log('💾 Component saved to library:', item.name);
  }

  retryGeneration(item: GenerationHistory): void {
    item.status = 'in-progress';
    console.log('🔄 Retrying generation for:', item.name);
    
    setTimeout(() => {
      item.status = 'completed';
      item.codePreview = `// Regenerated code for ${item.name}
const ${item.name.replace(/\s+/g, '')} = () => {
  return <div>Regenerated component</div>;
};`;
      item.filesGenerated = 3;
    }, 3000);
  }

  regenerateComponent(item: GenerationHistory): void {
    console.log('🚀 Regenerating component:', item.name);
  }

  deleteItem(item: GenerationHistory): void {
    const current = this.historyItems();
    const filtered = current.filter(h => h.id !== item.id);
    this.historyItems.set(filtered);
    this.filterHistory();
    console.log('🗑️ Item deleted:', item.name);
  }

  clearAllHistory(): void {
    if (confirm('Are you sure you want to clear all generation history?')) {
      this.historyItems.set([]);
      this.filteredHistory.set([]);
      console.log('🧹 All history cleared!');
    }
  }
}