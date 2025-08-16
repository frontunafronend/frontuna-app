import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';

import { AICopilotStateService, ChatMessage } from '@app/services/ai/ai-copilot-state.service';
import { AIPromptService } from '@app/services/ai/ai-prompt.service';
import { AIPrompt, AIResponse, AISuggestion } from '@app/models/ai.model';
import { CodeDisplayComponent } from '@app/components/shared/code-display/code-display.component';
import { ProfessionalLoaderComponent } from '@app/components/ui/professional-loader/professional-loader.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ai-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatBadgeModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatExpansionModule,
    CodeDisplayComponent,
    ProfessionalLoaderComponent
  ],
  template: `
    <div class="ai-history-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <button mat-icon-button (click)="goBack()" class="back-button">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <h1>
              <mat-icon class="page-icon">history</mat-icon>
              AI Interaction History
            </h1>
            <p>Complete history of your AI copilot interactions and suggestions</p>
          </div>
          
          <div class="header-stats">
            <div class="stat-card">
              <div class="stat-value">{{ totalInteractions() }}</div>
              <div class="stat-label">Total Interactions</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ totalSuggestions() }}</div>
              <div class="stat-label">Suggestions</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ successRate() }}%</div>
              <div class="stat-label">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="page-content">
        <div class="history-layout">
          <!-- Filters and Search -->
          <div class="filters-section">
            <mat-card>
              <mat-card-content>
                <div class="filters-row">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Search interactions...</mat-label>
                    <input matInput [(ngModel)]="searchQuery" (input)="onSearchChange()" placeholder="Search by prompt, response, or code...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="type-filter">
                    <mat-label>Type</mat-label>
                    <mat-select [(ngModel)]="selectedType" (selectionChange)="onFilterChange()">
                      <mat-option value="">All Types</mat-option>
                      <mat-option value="prompt">Prompts</mat-option>
                      <mat-option value="suggestion">Suggestions</mat-option>
                      <mat-option value="response">Responses</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="date-filter">
                    <mat-label>Date Range</mat-label>
                    <mat-select [(ngModel)]="selectedDateRange" (selectionChange)="onFilterChange()">
                      <mat-option value="all">All Time</mat-option>
                      <mat-option value="today">Today</mat-option>
                      <mat-option value="week">This Week</mat-option>
                      <mat-option value="month">This Month</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- History Tabs -->
          <mat-tab-group [(selectedIndex)]="activeTab" (selectedIndexChange)="onTabChange($event)">
            <!-- Chat History Tab -->
            <mat-tab label="Chat History">
              <div class="tab-content">
                <div class="history-list">
                  <mat-expansion-panel 
                    *ngFor="let message of filteredChatMessages(); trackBy: trackByMessage"
                    class="history-item">
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <div class="message-header">
                          <mat-icon [class]="'message-icon ' + message.type">
                            {{ getMessageIcon(message.type) }}
                          </mat-icon>
                          <span class="message-sender">{{ message.sender }}</span>
                          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                        </div>
                      </mat-panel-title>
                      <mat-panel-description>
                        <span class="message-preview">{{ getMessagePreview(message.content) }}</span>
                      </mat-panel-description>
                    </mat-expansion-panel-header>
                    
                    <div class="message-content">
                      <div class="message-text">{{ message.content }}</div>
                      
                      <div class="message-code" *ngIf="message.code">
                        <h4>Code:</h4>
                        <div class="code-tabs">
                          <div class="code-tab" 
                               *ngFor="let lang of getCodeLanguages(message.code)"
                               [class.active]="getActiveLanguage(message.id) === lang"
                               (click)="setActiveLanguage(message.id, lang)">
                            {{ lang.toUpperCase() }}
                          </div>
                        </div>
                        
                        <div class="code-display">
                          <app-code-display
                            [code]="getCodeForLanguage(message.code, getActiveLanguage(message.id))"
                            [language]="getActiveLanguage(message.id)"
                            [showLineNumbers]="true"
                            [showCopyButton]="true">
                          </app-code-display>
                        </div>
                      </div>
                      
                      <div class="message-actions">
                        <button mat-button color="primary" (click)="reuseMessage(message)">
                          <mat-icon>replay</mat-icon>
                          Reuse
                        </button>
                        <button mat-button color="accent" (click)="copyMessage(message)">
                          <mat-icon>content_copy</mat-icon>
                          Copy
                        </button>
                        <button mat-button color="warn" (click)="deleteMessage(message)">
                          <mat-icon>delete</mat-icon>
                          Delete
                        </button>
                      </div>
                    </div>
                  </mat-expansion-panel>
                </div>
                
                <!-- Pagination -->
                <mat-paginator 
                  [length]="totalChatMessages()"
                  [pageSize]="pageSize"
                  [pageSizeOptions]="[10, 25, 50, 100]"
                  (page)="onPageChange($event)"
                  showFirstLastButtons>
                </mat-paginator>
              </div>
            </mat-tab>

            <!-- Suggestions Tab -->
            <mat-tab label="AI Suggestions">
              <div class="tab-content">
                <div class="suggestions-grid">
                  <mat-card 
                    *ngFor="let suggestion of filteredSuggestions(); trackBy: trackBySuggestion"
                    class="suggestion-card">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon class="suggestion-icon">{{ getSuggestionIcon(suggestion.type) }}</mat-icon>
                        {{ suggestion.title }}
                      </mat-card-title>
                      <mat-card-subtitle>
                        <mat-chip-set>
                          <mat-chip [color]="getChipColor(suggestion.type)" selected>
                            {{ suggestion.type }}
                          </mat-chip>
                          <mat-chip *ngIf="suggestion.confidence" color="accent" selected>
                            {{ (suggestion.confidence * 100).toFixed(0) }}%
                          </mat-chip>
                        </mat-chip-set>
                      </mat-card-subtitle>
                    </mat-card-header>
                    
                    <mat-card-content>
                      <p>{{ suggestion.description }}</p>
                      
                      <div class="suggestion-code" *ngIf="suggestion.code">
                        <h4>Code:</h4>
                        <app-code-display
                          [code]="getSuggestionCode(suggestion.code)"
                          [language]="'typescript'"
                          [showLineNumbers]="true"
                          [showCopyButton]="true">
                        </app-code-display>
                      </div>
                    </mat-card-content>
                    
                    <mat-card-actions>
                      <button mat-button color="primary" (click)="applySuggestion(suggestion)">
                        <mat-icon>check</mat-icon>
                        Apply
                      </button>
                      <button mat-button color="accent" (click)="copySuggestion(suggestion)">
                        <mat-icon>content_copy</mat-icon>
                        Copy
                      </button>
                    </mat-card-actions>
                  </mat-card>
                </div>
              </div>
            </mat-tab>

            <!-- Prompts Tab -->
            <mat-tab label="Prompt History">
              <div class="tab-content">
                <div class="prompts-list">
                  <mat-card 
                    *ngFor="let prompt of filteredPrompts(); trackBy: trackByPrompt"
                    class="prompt-card">
                    <mat-card-header>
                      <mat-card-title>{{ prompt.title || 'Untitled Prompt' }}</mat-card-title>
                      <mat-card-subtitle>
                        {{ formatTime(prompt.timestamp) }} • {{ prompt.type }}
                      </mat-card-subtitle>
                    </mat-card-header>
                    
                    <mat-card-content>
                      <p>{{ prompt.content }}</p>
                      
                      <div class="prompt-metadata" *ngIf="prompt.metadata">
                        <h4>Context:</h4>
                        <pre>{{ JSON.stringify(prompt.metadata, null, 2) }}</pre>
                      </div>
                    </mat-card-content>
                    
                    <mat-card-actions>
                      <button mat-button color="primary" (click)="reusePrompt(prompt)">
                        <mat-icon>replay</mat-icon>
                        Reuse
                      </button>
                      <button mat-button color="accent" (click)="copyPrompt(prompt)">
                        <mat-icon>content_copy</mat-icon>
                        Copy
                      </button>
                      <button mat-button color="warn" (click)="deletePrompt(prompt)">
                        <mat-icon>delete</mat-icon>
                        Delete
                      </button>
                    </mat-card-actions>
                  </mat-card>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-history-page {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-button {
      color: white;
    }

    .page-icon {
      margin-right: 12px;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .header-info h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .header-info p {
      margin: 8px 0 0 0;
      opacity: 0.9;
      font-size: 16px;
    }

    .header-stats {
      display: flex;
      gap: 16px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      min-width: 100px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .page-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    .history-layout {
      max-width: 1200px;
      margin: 0 auto;
    }

    .filters-section {
      margin-bottom: 24px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .type-filter,
    .date-filter {
      min-width: 150px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .history-list,
    .prompts-list {
      margin-bottom: 24px;
    }

    .history-item {
      margin-bottom: 16px;
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .message-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .message-icon.user {
      color: #1976d2;
    }

    .message-icon.ai {
      color: #4caf50;
    }

    .message-icon.system {
      color: #ff9800;
    }

    .message-sender {
      font-weight: 600;
      color: #333;
    }

    .message-time {
      color: #666;
      font-size: 12px;
    }

    .message-preview {
      color: #666;
      font-style: italic;
    }

    .message-content {
      padding: 16px 0;
    }

    .message-text {
      margin-bottom: 16px;
      line-height: 1.6;
      color: #333;
    }

    .message-code h4 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .code-tabs {
      display: flex;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 16px;
    }

    .code-tab {
      padding: 8px 16px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      font-weight: 500;
    }

    .code-tab:hover {
      background-color: #f5f5f5;
    }

    .code-tab.active {
      border-bottom-color: #1976d2;
      color: #1976d2;
    }

    .code-display {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 16px;
    }

    .message-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .suggestion-card,
    .prompt-card {
      height: fit-content;
    }

    .suggestion-icon {
      margin-right: 8px;
      color: #1976d2;
    }

    .suggestion-code h4 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .prompt-metadata h4 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .prompt-metadata pre {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      font-size: 12px;
      overflow-x: auto;
    }

    mat-paginator {
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 16px;
      }

      .header-stats {
        justify-content: center;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field,
      .type-filter,
      .date-filter {
        min-width: auto;
      }

      .suggestions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AIHistoryComponent implements OnInit {
  private readonly copilotState = inject(AICopilotStateService);
  private readonly aiPromptService = inject(AIPromptService);
  private readonly router = inject(Router);

  // State
  activeTab = 0;
  searchQuery = '';
  selectedType = '';
  selectedDateRange = 'all';
  pageSize = 25;
  currentPage = 0;

  // Data
  readonly chatMessages = this.copilotState.chatMessages;
  readonly promptHistory = this.copilotState.promptHistory;
  readonly suggestions = this.copilotState.suggestions;

  // Computed properties
  readonly totalChatMessages = computed(() => this.chatMessages().length);
  readonly totalInteractions = computed(() => this.chatMessages().length);
  readonly totalSuggestions = computed(() => this.suggestions().length);
  readonly successRate = signal<number>(95);

  // Filtered data
  readonly filteredChatMessages = computed(() => {
    let messages = this.chatMessages();
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      messages = messages.filter(msg => 
        msg.content.toLowerCase().includes(query) ||
        msg.sender.toLowerCase().includes(query)
      );
    }
    
    if (this.selectedType) {
      messages = messages.filter(msg => msg.type === this.selectedType);
    }
    
    if (this.selectedDateRange !== 'all') {
      messages = this.filterByDateRange(messages, this.selectedDateRange);
    }
    
    return messages;
  });

  readonly filteredSuggestions = computed(() => {
    let suggestions = this.suggestions();
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      suggestions = suggestions.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }
    
    if (this.selectedType === 'suggestion') {
      return suggestions;
    }
    
    return suggestions;
  });

  readonly filteredPrompts = computed(() => {
    let prompts = this.promptHistory();
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      prompts = prompts.filter(p => 
        p.content.toLowerCase().includes(query) ||
        (p.title && p.title.toLowerCase().includes(query))
      );
    }
    
    if (this.selectedType === 'prompt') {
      return prompts;
    }
    
    return prompts;
  });

  // Language state for each message
  private activeLanguages = new Map<string, string>();

  ngOnInit() {
    this.loadStats();
  }

  goBack() {
    this.router.navigate(['/dashboard/ai-copilot']);
  }

  onTabChange(index: number) {
    this.activeTab = index;
  }

  onSearchChange() {
    this.currentPage = 0;
  }

  onFilterChange() {
    this.currentPage = 0;
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getMessageIcon(type: string): string {
    const icons = {
      user: 'person',
      ai: 'psychology',
      system: 'settings'
    };
    return icons[type as keyof typeof icons] || 'message';
  }

  getSuggestionIcon(type: string): string {
    const icons = {
      completion: 'auto_fix_high',
      improvement: 'trending_up',
      fix: 'build',
      feature: 'add_circle',
      refactor: 'refresh',
      optimize: 'speed'
    };
    return icons[type as keyof typeof icons] || 'lightbulb';
  }

  getChipColor(type: string): string {
    const colors = {
      completion: 'primary',
      improvement: 'accent',
      fix: 'warn',
      feature: 'primary',
      refactor: 'accent',
      optimize: 'primary'
    };
    return colors[type as keyof typeof colors] || 'primary';
  }

  getMessagePreview(content: string): string {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }

  formatTime(timestamp: Date | string | undefined): string {
    if (!timestamp) return '--:--';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(date.getTime())) return '--:--';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  }

  getCodeLanguages(code: any): string[] {
    if (!code) return ['typescript'];
    
    const languages = [];
    if (code.typescript) languages.push('typescript');
    if (code.html) languages.push('html');
    if (code.css) languages.push('css');
    if (code.javascript) languages.push('javascript');
    
    return languages.length > 0 ? languages : ['typescript'];
  }

  getActiveLanguage(messageId: string): string {
    return this.activeLanguages.get(messageId) || 'typescript';
  }

  setActiveLanguage(messageId: string, language: string) {
    this.activeLanguages.set(messageId, language);
  }

  getCodeForLanguage(code: any, language: string): string {
    if (!code) return '';
    
    switch (language) {
      case 'typescript':
        return code.typescript || code.javascript || '';
      case 'html':
        return code.html || '';
      case 'css':
        return code.css || '';
      case 'javascript':
        return code.javascript || code.typescript || '';
      default:
        return code.typescript || code.javascript || '';
    }
  }

  getSuggestionCode(code: any): string {
    if (!code) return '';
    return code.typescript || code.javascript || code.html || code.css || '';
  }

  filterByDateRange(messages: ChatMessage[], range: string): ChatMessage[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return messages.filter(msg => {
          const msgDate = new Date(msg.timestamp);
          return msgDate >= today;
        });
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return messages.filter(msg => {
          const msgDate = new Date(msg.timestamp);
          return msgDate >= weekAgo;
        });
      case 'month':
        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        return messages.filter(msg => {
          const msgDate = new Date(msg.timestamp);
          return msgDate >= monthAgo;
        });
      default:
        return messages;
    }
  }

  reuseMessage(message: ChatMessage) {
    // Navigate back to copilot with the message content
    this.router.navigate(['/dashboard/ai-copilot'], { 
      queryParams: { prompt: message.content } 
    });
  }

  copyMessage(message: ChatMessage) {
    navigator.clipboard.writeText(message.content);
  }

  deleteMessage(message: ChatMessage) {
    // Implementation would depend on your service
    console.log('Delete message:', message.id);
  }

  applySuggestion(suggestion: AISuggestion) {
    // Navigate back to copilot with the suggestion
    this.router.navigate(['/dashboard/ai-copilot'], { 
      queryParams: { suggestion: suggestion.id } 
    });
  }

  copySuggestion(suggestion: AISuggestion) {
    const code = this.getSuggestionCode(suggestion.code);
    navigator.clipboard.writeText(code);
  }

  reusePrompt(prompt: AIPrompt) {
    // Navigate back to copilot with the prompt
    this.router.navigate(['/dashboard/ai-copilot'], { 
      queryParams: { prompt: prompt.content } 
    });
  }

  copyPrompt(prompt: AIPrompt) {
    navigator.clipboard.writeText(prompt.content);
  }

  deletePrompt(prompt: AIPrompt) {
    // Implementation would depend on your service
    console.log('Delete prompt:', prompt.id);
  }

  private loadStats() {
    // Load real stats from service
    // TODO: Load real stats from service
  }

  trackByMessage(index: number, message: ChatMessage): string {
    return message.id;
  }

  trackBySuggestion(index: number, suggestion: AISuggestion): string {
    return suggestion.id;
  }

  trackByPrompt(index: number, prompt: AIPrompt): string {
    return prompt.id;
  }
}
