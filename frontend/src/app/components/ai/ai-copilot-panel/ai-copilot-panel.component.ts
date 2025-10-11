import { Component, OnInit, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AIPromptService } from '@app/services/ai/ai-prompt.service';
import { AISuggestion, AIPrompt, AIResponse } from '@app/models/ai.model';
import { LoadingService } from '@app/services/ui/loading.service';
import { InPageActionsService } from '@app/services/ui/in-page-actions.service';
import { OptimizedAIChatService } from '@app/services/ai/optimized-ai-chat.service';
import { ProfessionalLoaderComponent } from '@app/components/ui/professional-loader/professional-loader.component';
import { Router } from '@angular/router';
import { SuggestionPreviewDialog } from './suggestion-preview-dialog/suggestion-preview-dialog.component';
import { ConfirmDialogComponent } from '@app/components/ui';

@Component({
  selector: 'app-ai-copilot-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule,
    ProfessionalLoaderComponent,
    MatDialogModule
  ],
  template: `
    <div class="ai-copilot-panel" [class.collapsed]="isCollapsed()">
      <!-- Header -->
      <div class="copilot-header">
        <div class="header-content">
          <mat-icon class="copilot-icon">psychology</mat-icon>
          <h3>AI Copilot</h3>
          <span class="status-indicator" [class.active]="isActive()"></span>
        </div>
        <div class="header-actions">
          <button mat-icon-button 
                  [matTooltip]="suggestions().length + ' suggestions'"
                  [matBadge]="suggestions().length"
                  [matBadgeHidden]="suggestions().length === 0"
                  matBadgeColor="accent"
                  (click)="showSuggestions = !showSuggestions">
            <mat-icon>lightbulb</mat-icon>
          </button>
          <button mat-icon-button 
                  [matTooltip]="isCollapsed() ? 'Expand' : 'Collapse'"
                  (click)="toggleCollapse()">
            <mat-icon>{{ isCollapsed() ? 'expand_more' : 'expand_less' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="copilot-content" *ngIf="!isCollapsed()">
        <!-- Quick Actions -->
        <div class="quick-actions">
          <mat-chip-listbox>
            <mat-chip-option 
              *ngFor="let action of quickActions" 
              (click)="executeQuickAction(action.prompt, action.type, $event)"
              [disabled]="isProcessing()">
              <mat-icon>{{ action.icon }}</mat-icon>
              {{ action.label }}
            </mat-chip-option>
          </mat-chip-listbox>
        </div>

        <!-- Prompt Input -->
        <form class="prompt-section" (ngSubmit)="sendPrompt()" (submit)="$event.preventDefault()">
          <mat-form-field appearance="outline" class="prompt-input">
            <mat-label>Ask AI Copilot...</mat-label>
            <textarea 
              matInput
              [(ngModel)]="currentPrompt"
              name="prompt"
              (keydown)="onKeyDown($event)"
              [disabled]="isProcessing()"
              placeholder="💭 Describe what you want to create... (Enter to send, Shift+Enter for new line)"
              rows="3">
            </textarea>
            <button type="submit"
                    mat-icon-button 
                    matSuffix 
                    [disabled]="!currentPrompt.trim() || isProcessing()">
              <mat-icon>{{ isProcessing() ? 'hourglass_empty' : 'send' }}</mat-icon>
            </button>
          </mat-form-field>
        </form>

        <!-- Professional Loading Indicator -->
        <div *ngIf="copilotState.isLoading()">
          <app-professional-loader 
            [type]="getLoaderType()"
            [message]="'Processing your request...'"
            [subMessage]="'Please wait while we generate your code'"
            [progress]="0"
            [showProgress]="copilotState.isLoading()"
            size="normal">
          </app-professional-loader>
        </div>

        <!-- Suggestions Panel -->
        <div class="suggestions-panel" *ngIf="showSuggestions && suggestions().length > 0">
          <div class="suggestions-header">
            <h4>AI Suggestions</h4>
            <button mat-icon-button (click)="showSuggestions = false">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <div class="suggestions-list">
            <div 
              *ngFor="let suggestion of suggestions()" 
              class="suggestion-item"
              [class]="'priority-' + suggestion.priority"
              (click)="applySuggestion(suggestion)">
              
              <div class="suggestion-header">
                <mat-icon class="suggestion-icon">{{ getSuggestionIcon(suggestion.type) }}</mat-icon>
                <span class="suggestion-title">{{ suggestion.title }}</span>
                <span class="confidence-badge">{{ (suggestion.confidence * 100).toFixed(0) }}%</span>
              </div>
              
              <p class="suggestion-description">{{ suggestion.description }}</p>
              
              <div class="suggestion-actions" *ngIf="suggestion.code">
                <button mat-stroked-button size="small" (click)="openSuggestionPreview(suggestion)">
                  <mat-icon>visibility</mat-icon>
                  Preview
                </button>
                <button mat-flat-button size="small" color="primary" (click)="applySuggestion(suggestion)">
                  <mat-icon>check</mat-icon>
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent History -->
        <div class="history-section" *ngIf="recentPrompts().length > 0">
          <div class="history-header">
            <h4>Recent Prompts</h4>
            <button mat-icon-button [matMenuTriggerFor]="historyMenu">
              <mat-icon>more_vert</mat-icon>
            </button>
          </div>
          
          <div class="history-list">
            <div 
              *ngFor="let prompt of recentPrompts().slice(0, 3)" 
              class="history-item"
              (click)="reusePrompt(prompt)">
              
              <div class="prompt-preview">{{ prompt.content | slice:0:60 }}...</div>
              <div class="prompt-meta">
                <span class="prompt-type">{{ prompt.type }}</span>
                <span class="prompt-time">{{ getRelativeTime(prompt.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- History Menu -->
      <mat-menu #historyMenu="matMenu">
        <button mat-menu-item (click)="viewFullHistory()">
          <mat-icon>history</mat-icon>
          View Full History
        </button>
        <button mat-menu-item (click)="clearHistory()">
          <mat-icon>clear_all</mat-icon>
          Clear History
        </button>
        <button mat-menu-item (click)="exportHistory()">
          <mat-icon>download</mat-icon>
          Export History
        </button>
      </mat-menu>
    </div>
  `,
  styles: [`
    .ai-copilot-panel {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: all 0.3s ease;
      min-width: 320px;
      max-width: 400px;
    }

    .ai-copilot-panel.collapsed {
      max-height: 64px;
    }

    .copilot-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .copilot-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .header-content h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
      transition: all 0.3s ease;
    }

    .status-indicator.active {
      background: #4caf50;
      box-shadow: 0 0 8px rgba(76,175,80,0.6);
    }

    .header-actions {
      display: flex;
      gap: 4px;
    }

    .header-actions button {
      color: white;
    }

    .copilot-content {
      padding: 16px;
      max-height: 600px;
      overflow-y: auto;
    }

    .quick-actions {
      margin-bottom: 16px;
    }

    .quick-actions mat-chip-listbox {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .quick-actions mat-chip-option {
      font-size: 12px;
      min-height: 32px;
    }

    .quick-actions mat-chip-option mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    .prompt-section {
      margin-bottom: 16px;
    }

    .prompt-input {
      width: 100%;
    }

    /* Old loader styles removed - using professional loader component now */

    .suggestions-panel {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .suggestions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }

    .suggestions-header h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }

    .suggestions-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .suggestion-item {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .suggestion-item:hover {
      background: #f8f9fa;
    }

    .suggestion-item:last-child {
      border-bottom: none;
    }

    .suggestion-item.priority-high {
      border-left: 3px solid #f44336;
    }

    .suggestion-item.priority-medium {
      border-left: 3px solid #ff9800;
    }

    .suggestion-item.priority-low {
      border-left: 3px solid #4caf50;
    }

    .suggestion-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .suggestion-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #666;
    }

    .suggestion-title {
      font-weight: 500;
      flex: 1;
    }

    .confidence-badge {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .suggestion-description {
      color: #666;
      font-size: 13px;
      margin: 4px 0 8px 24px;
    }

    .suggestion-actions {
      display: flex;
      gap: 8px;
      margin-left: 24px;
    }

    .suggestion-actions button {
      font-size: 12px;
      padding: 4px 12px;
      min-width: auto;
    }

    .history-section {
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .history-header h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }

    .history-item {
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      margin-bottom: 4px;
    }

    .history-item:hover {
      background: #f5f5f5;
    }

    .prompt-preview {
      font-size: 13px;
      color: #333;
      margin-bottom: 4px;
    }

    .prompt-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .prompt-type {
      background: #e8f5e8;
      color: #2e7d32;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      text-transform: uppercase;
    }

    .prompt-time {
      color: #999;
      font-size: 11px;
    }

    @media (max-width: 768px) {
      .ai-copilot-panel {
        min-width: 280px;
        max-width: 100%;
      }
      
      .copilot-content {
        padding: 12px;
      }
    }
  `]
})
export class AICopilotPanelComponent implements OnInit {
  private readonly aiPromptService = inject(AIPromptService);
  private readonly loadingService = inject(LoadingService);
  private readonly inPageActions = inject(InPageActionsService);
  protected readonly copilotState = inject(OptimizedAIChatService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // Inputs
  readonly context = input<string>('');
  readonly isActive = input<boolean>(true);

  // Outputs
  readonly onPromptSent = output<AIPrompt>();
  readonly onResponseReceived = output<AIResponse>();
  readonly onSuggestionApplied = output<AISuggestion>();

  // State
  readonly isCollapsed = signal<boolean>(false);
  readonly isProcessing = computed(() => this.aiPromptService.isProcessing() || this.copilotState.isLoading());
  readonly suggestions = signal<AISuggestion[]>([]);
  readonly recentPrompts = signal<AIPrompt[]>([]);

  // Component state
  currentPrompt = '';
  showSuggestions = false;

  // Quick actions configuration
  quickActions = [
    { label: 'Card Component', icon: 'credit_card', prompt: 'Create a responsive card component with image, title, description, and action buttons', type: 'generate' as const },
    { label: 'Form with Validation', icon: 'dynamic_form', prompt: 'Build a reactive form with validation, error handling, and loading states', type: 'generate' as const },
    { label: 'Data Table', icon: 'table_view', prompt: 'Generate a data table with sorting, filtering, pagination, and row selection', type: 'generate' as const },
    { label: 'Modal Dialog', icon: 'open_in_new', prompt: 'Create a modal dialog with animations, backdrop, and customizable content', type: 'generate' as const },
    { label: 'Navigation Menu', icon: 'menu', prompt: 'Build a responsive navigation menu with dropdowns and mobile hamburger menu', type: 'generate' as const },
    { label: 'Button Component', icon: 'smart_button', prompt: 'Create a custom button component with variants, sizes, and loading states', type: 'generate' as const },
    { label: 'Optimize Code', icon: 'speed', prompt: 'Optimize this code for better performance and bundle size', type: 'optimize' as const },
    { label: 'Fix Issues', icon: 'build_circle', prompt: 'Fix any TypeScript errors, accessibility issues, and code problems', type: 'modify' as const },
    { label: 'Add Documentation', icon: 'description', prompt: 'Add comprehensive JSDoc comments and usage examples', type: 'modify' as const },
    { label: 'Generate Tests', icon: 'verified', prompt: 'Create comprehensive unit tests with mocking and edge cases', type: 'generate' as const }
  ];

  ngOnInit() {
    // Load initial suggestions if context is provided
    if (this.context()) {
      this.loadContextSuggestions();
    }

    // Subscribe to suggestions updates
    this.aiPromptService.suggestions$.subscribe(suggestions => {
      this.suggestions.set(suggestions);
      if (suggestions.length > 0) {
        this.showSuggestions = true;
      }
    });

    // Subscribe to prompt history updates
    this.aiPromptService.promptHistory$.subscribe(history => {
      this.recentPrompts.set(history);
    });
  }

  toggleCollapse() {
    this.isCollapsed.update(collapsed => !collapsed);
  }

  sendPrompt(event?: Event) {
    // Always prevent form submission and page refresh
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!this.currentPrompt.trim() || this.copilotState.isLoading()) return;

    const prompt = this.currentPrompt.trim();
    this.currentPrompt = '';

    // Emit prompt sent event
    const aiPrompt: AIPrompt = {
      id: this.generateId(),
      content: prompt,
      type: 'generate',
      context: this.context(),
      timestamp: new Date(),
      userId: 'current-user',
      model: 'gpt-4'
    };
    
    this.onPromptSent.emit(aiPrompt);

    // Make the API call directly (simplified)
    this.aiPromptService.sendPrompt(prompt, 'generate', this.context()).subscribe({
      next: (response) => {
        console.log('✅ Code generated successfully!');
        this.onResponseReceived.emit(response);
      },
      error: (error) => {
        console.error('❌ AI Copilot: Error:', error);
        console.error('Failed to generate response. Please try again.');
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    // Enter key sends the prompt (like clicking send button)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      this.sendPrompt();
    }
    // Shift+Enter creates new line (default behavior)
  }

  executeQuickAction(prompt: string, type: 'generate' | 'modify' | 'refactor' | 'optimize', event?: Event) {
    // Prevent any navigation or page refresh
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (this.copilotState.isLoading()) return;
    
    const fullPrompt = this.context() ? `${prompt} for: ${this.context()}` : prompt;

    // Create AI prompt object
    const aiPrompt: AIPrompt = {
      id: this.generateId(),
      content: fullPrompt,
      type,
      context: this.context(),
      timestamp: new Date(),
      userId: 'current-user',
      model: 'gpt-4'
    };

    // Make the actual API call directly (simplified)
    this.aiPromptService.sendPrompt(fullPrompt, type, this.context()).subscribe({
      next: (response) => {
        console.log(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} completed successfully!`);
        this.onResponseReceived.emit(response);
      },
      error: (error) => {
        console.error('❌ Quick Action Error:', error);
        // Simple error handling without state service
        console.error(`Failed to ${type} code. Please try again.`);
      }
    });
  }

  applySuggestion(suggestion: AISuggestion) {
    this.onSuggestionApplied.emit(suggestion);
    
    // Remove applied suggestion from the list
    const currentSuggestions = this.suggestions();
    // Note: In a real implementation, you'd update the suggestions through the service
  }

  openSuggestionPreview(suggestion: AISuggestion): void {
    const dialogRef = this.dialog.open(SuggestionPreviewDialog, {
      data: { suggestion },
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '90vh',
      panelClass: 'ai-suggestion-dialog',
      disableClose: false,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'apply') {
        this.handleSolutionApplication(result);
      }
    });
  }

  private handleSolutionApplication(result: any): void {
    const { code, language, originalCode } = result;
    
    // Show confirmation dialog
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Apply AI Solution',
        message: `Are you sure you want to apply the modified ${language.toUpperCase()} solution?`,
        confirmText: 'Apply Solution',
        cancelText: 'Cancel',
        showDiff: true,
        originalCode,
        modifiedCode: code
      },
      width: '600px'
    });

    confirmDialog.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.applySolutionToWorkspace(code, language);
      }
    });
  }

  private applySolutionToWorkspace(code: string, language: string): void {
    // Implementation for applying the solution to the workspace
    // This could involve:
    // 1. Creating a new file
    // 2. Updating existing file
    // 3. Inserting code at cursor position
    // 4. Opening in editor
    
    this.snackBar.open(
      `AI solution applied successfully! Opening in ${language.toUpperCase()} editor...`, 
      'OK', 
      { duration: 4000 }
    );

    // For now, just open the code in a new editor tab
    this.openCodeInEditor(code, language);
  }

  private openCodeInEditor(code: string, language: string): void {
    // This would integrate with your editor service
    // For now, we'll show a success message
    console.log('Opening code in editor:', { code, language });
    
    // You could implement:
    // this.editorService.openNewTab(code, language);
    // or
    // this.editorService.insertAtCursor(code);
  }

  reusePrompt(prompt: AIPrompt) {
    this.currentPrompt = prompt.content;
  }

  getSuggestionIcon(type: string): string {
    const icons = {
      completion: 'auto_fix_high',
      improvement: 'trending_up',
      fix: 'build',
      feature: 'add_circle'
    };
    return icons[type as keyof typeof icons] || 'lightbulb';
  }

  getRelativeTime(timestamp: Date | string | undefined): string {
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
    return `${days}d ago`;
  }

  viewFullHistory() {
    this.router.navigate(['/ai/history']);
  }

  clearHistory() {
    this.aiPromptService.clearHistory();
  }

  exportHistory() {
    this.aiPromptService.getPromptHistory().subscribe(history => {
      const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-copilot-history.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  private loadContextSuggestions() {
    if (this.context()) {
      this.aiPromptService.getSuggestions(this.context(), { line: 0, column: 0 }).subscribe();
    }
  }

  getLoaderType(): 'thinking' | 'generating' | 'processing' | 'pulse' {
    // Simplified loader type based on loading state
    return this.copilotState.isLoading() ? 'thinking' : 'pulse';
  }

  private generateId(): string {
    return `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}