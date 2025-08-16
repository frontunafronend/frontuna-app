import { Component, inject, signal, input, output, ViewChild, ElementRef, AfterViewInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';

import { AIPromptService } from '@app/services/ai/ai-prompt.service';
import { AIPrompt, AIResponse } from '@app/models/ai.model';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-ai-prompt-box',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatBadgeModule
  ],
  template: `
    <form class="ai-prompt-box" [class.focused]="isFocused()" [class.processing]="isProcessing()" (ngSubmit)="sendPrompt()" (submit)="$event.preventDefault()">
      <!-- Prompt Input -->
      <mat-form-field appearance="outline" class="prompt-field">
        <mat-label>{{ placeholder() || 'Ask AI to help...' }}</mat-label>
        <textarea 
          #promptInput
          matInput
          [formControl]="promptControl"
          [matAutocomplete]="auto"
          name="prompt"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
          [placeholder]="placeholder() || 'Describe what you want to create or modify...'"
          rows="3"
          cdkTextareaAutosize
          cdkAutosizeMinRows="2"
          cdkAutosizeMaxRows="8">
        </textarea>
        
        <!-- Smart Autocomplete -->
        <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onSuggestionSelected($event)">
          <mat-option *ngFor="let suggestion of filteredSuggestions | async" [value]="suggestion.text">
            <div class="suggestion-option">
              <mat-icon>{{ suggestion.icon }}</mat-icon>
              <div class="suggestion-content">
                <div class="suggestion-text">{{ suggestion.text }}</div>
                <div class="suggestion-category">{{ suggestion.category }}</div>
              </div>
            </div>
          </mat-option>
        </mat-autocomplete>
        
        <!-- Suffix Actions -->
        <div matSuffix class="prompt-actions">
          <button type="button"
                  mat-icon-button 
                  matTooltip="Templates"
                  [matMenuTriggerFor]="templatesMenu"
                  [disabled]="isProcessing()">
            <mat-icon>library_books</mat-icon>
          </button>
          
          <button type="button"
                  mat-icon-button 
                  matTooltip="Clear"
                  [disabled]="!promptText.trim() || isProcessing()"
                  (click)="clearPrompt()">
            <mat-icon>clear</mat-icon>
          </button>
          
          <button type="submit"
                  mat-icon-button 
                  matTooltip="{{ isProcessing() ? 'Processing...' : 'Send prompt' }}"
                  [disabled]="!promptText.trim() || isProcessing()"
                  color="primary">
            <mat-icon>{{ isProcessing() ? 'hourglass_empty' : 'send' }}</mat-icon>
          </button>
        </div>
      </mat-form-field>

      <!-- No loader here - parent component handles loading states -->

      <!-- Quick Suggestions -->
      <div class="quick-suggestions" *ngIf="showSuggestions() && quickSuggestions.length > 0">
        <mat-chip-listbox>
          <mat-chip-option 
            *ngFor="let suggestion of quickSuggestions" 
            (click)="applyQuickSuggestion(suggestion)"
            [disabled]="isProcessing()">
            {{ suggestion }}
          </mat-chip-option>
        </mat-chip-listbox>
      </div>

      <!-- Templates Menu -->
      <mat-menu #templatesMenu="matMenu" class="templates-menu">
        <div class="menu-header">
          <h3>Prompt Templates</h3>
        </div>
        
        <div class="template-categories">
          <div *ngFor="let category of promptTemplates" class="template-category">
            <div class="category-header">{{ category.category }}</div>
            <button mat-menu-item 
                    *ngFor="let template of category.templates" 
                    (click)="applyTemplate(template)">
              <mat-icon>auto_awesome</mat-icon>
              <span>{{ template }}</span>
            </button>
          </div>
        </div>
      </mat-menu>
    </form>
  `,
  styles: [`
    .ai-prompt-box {
      width: 100%;
      transition: all 0.3s ease;
    }

    .ai-prompt-box.focused {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .ai-prompt-box.processing {
      opacity: 0.8;
    }

    .prompt-field {
      width: 100%;
    }

    .prompt-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: 8px;
    }

    /* Smart Autocomplete Suggestions */
    .suggestion-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    .suggestion-option mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #666;
    }

    .suggestion-content {
      flex: 1;
    }

    .suggestion-text {
      font-size: 14px;
      line-height: 1.4;
      color: #333;
    }

    .suggestion-category {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      font-weight: 500;
    }

    .quick-suggestions {
      margin-top: 12px;
    }

    .quick-suggestions mat-chip-listbox {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .quick-suggestions mat-chip-option {
      font-size: 12px;
      min-height: 28px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .quick-suggestions mat-chip-option:hover {
      transform: translateY(-1px);
    }

    .templates-menu {
      min-width: 280px;
      max-height: 400px;
    }

    .menu-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .menu-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .template-categories {
      max-height: 300px;
      overflow-y: auto;
    }

    .template-category {
      padding: 8px 0;
    }

    .category-header {
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 500;
      color: #666;
      text-transform: uppercase;
      background: #f5f5f5;
    }

    .template-category button {
      width: 100%;
      text-align: left;
    }

    .template-category button span {
      white-space: normal;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .prompt-actions {
        flex-direction: column;
        gap: 2px;
      }
      
      .quick-suggestions mat-chip-option {
        font-size: 11px;
        min-height: 24px;
      }
    }
    
    /* Fix input text color to white */
    .prompt-field ::ng-deep .mat-mdc-input-element {
      color: #ffffff !important;
      caret-color: #ffffff;
    }
    
    .prompt-field ::ng-deep .mat-mdc-form-field-label {
      color: #cccccc !important;
    }
    
    .prompt-field ::ng-deep .mat-mdc-input-element::placeholder {
      color: #cccccc !important;
    }
    
    .prompt-field ::ng-deep .mat-mdc-form-field-outline {
      color: #3e3e42;
    }
    
    .prompt-field ::ng-deep .mat-mdc-form-field-outline-thick {
      color: #007acc;
    }
  `]
})
export class AIPromptBoxComponent implements AfterViewInit {
  @ViewChild('promptInput') promptInput!: ElementRef<HTMLTextAreaElement>;

  private readonly aiPromptService = inject(AIPromptService);

  // Inputs
  readonly placeholder = input<string>('');
  readonly context = input<string>('');
  readonly showSuggestions = input<boolean>(true);
  readonly promptType = input<'generate' | 'modify' | 'refactor' | 'optimize'>('generate');
  readonly externalIsProcessing = input<boolean | undefined>(undefined);

  // Outputs
  readonly promptSent = output<AIPrompt>();
  readonly onResponseReceived = output<AIResponse>();
  readonly onFocusChange = output<boolean>();

  // State
  promptText = '';
  readonly isFocused = signal<boolean>(false);
  readonly isProcessing = computed(() => {
    // Use external processing state if provided, otherwise fall back to service
    const external = this.externalIsProcessing();
    return external !== undefined ? external : this.aiPromptService.isProcessing();
  });

  // Form control for autocomplete
  promptControl = new FormControl({ value: '', disabled: false });
  filteredSuggestions!: Observable<{text: string, icon: string, category: string}[]>;

  constructor() {
    // Handle disabled state changes
    effect(() => {
      if (this.isProcessing()) {
        this.promptControl.disable();
      } else {
        this.promptControl.enable();
      }
    });
  }

  // Smart suggestions database
  smartSuggestions = [
    // Components
    { text: 'Create a responsive card component', icon: 'credit_card', category: 'Components' },
    { text: 'Build a data table with sorting', icon: 'table_view', category: 'Components' },
    { text: 'Make a navigation menu', icon: 'menu', category: 'Components' },
    { text: 'Create a modal dialog', icon: 'open_in_new', category: 'Components' },
    { text: 'Build a form with validation', icon: 'dynamic_form', category: 'Components' },
    { text: 'Design a button component', icon: 'smart_button', category: 'Components' },
    { text: 'Create a loading spinner', icon: 'refresh', category: 'Components' },
    { text: 'Build a progress bar', icon: 'linear_scale', category: 'Components' },
    
    // Styling
    { text: 'Make it responsive for mobile', icon: 'phone_android', category: 'Styling' },
    { text: 'Add hover effects and animations', icon: 'animation', category: 'Styling' },
    { text: 'Apply dark mode styling', icon: 'dark_mode', category: 'Styling' },
    { text: 'Add gradient backgrounds', icon: 'gradient', category: 'Styling' },
    { text: 'Create glassmorphism design', icon: 'blur_on', category: 'Styling' },
    { text: 'Add shadow and depth effects', icon: 'layers', category: 'Styling' },
    
    // Functionality
    { text: 'Add error handling and validation', icon: 'verified', category: 'Functionality' },
    { text: 'Implement loading states', icon: 'hourglass_empty', category: 'Functionality' },
    { text: 'Add keyboard shortcuts', icon: 'keyboard', category: 'Functionality' },
    { text: 'Create API integration', icon: 'api', category: 'Functionality' },
    { text: 'Add search and filtering', icon: 'search', category: 'Functionality' },
    { text: 'Implement drag and drop', icon: 'drag_indicator', category: 'Functionality' },
    
    // Optimization
    { text: 'Optimize for performance', icon: 'speed', category: 'Optimization' },
    { text: 'Reduce bundle size', icon: 'compress', category: 'Optimization' },
    { text: 'Add lazy loading', icon: 'schedule', category: 'Optimization' },
    { text: 'Improve accessibility', icon: 'accessibility', category: 'Optimization' },
    { text: 'Add TypeScript types', icon: 'code', category: 'Optimization' },
    { text: 'Generate unit tests', icon: 'verified', category: 'Optimization' }
  ];

  // Quick suggestions
  quickSuggestions = [
    'Create a responsive card component with image and actions',
    'Build a reactive form with validation and error handling',
    'Generate a data table with sorting and pagination',
    'Make a responsive navigation menu with dropdowns',
    'Create a modal dialog with animations',
    'Build a custom button with loading states',
    'Add comprehensive error handling',
    'Make it mobile-friendly and responsive',
    'Improve accessibility with ARIA labels',
    'Optimize performance and bundle size'
  ];

  // Prompt templates
  promptTemplates = [
    {
      category: 'Components',
      templates: [
        'Create a responsive card component with image, title, and description',
        'Build a data table with sorting, filtering, and pagination',
        'Design a form with validation and error handling',
        'Make a navigation menu with dropdown items',
        'Create a modal dialog with customizable content'
      ]
    },
    {
      category: 'Styling',
      templates: [
        'Make this component responsive for mobile devices',
        'Add hover effects and smooth transitions',
        'Apply a modern card design with shadows',
        'Create a dark mode variant',
        'Add loading animations and states'
      ]
    },
    {
      category: 'Functionality',
      templates: [
        'Add form validation with error messages',
        'Implement search and filter functionality',
        'Add drag and drop capability',
        'Create keyboard navigation support',
        'Add accessibility features (ARIA labels, focus management)'
      ]
    }
  ];

  ngAfterViewInit() {
    // Initialize smart autocomplete
    this.filteredSuggestions = this.promptControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(value => this.filterSuggestions(value || ''))
    );

    // Sync form control with promptText
    this.promptControl.valueChanges.subscribe(value => {
      this.promptText = value || '';
    });
  }

  onFocus() {
    this.isFocused.set(true);
    this.onFocusChange.emit(true);
  }

  onBlur() {
    this.isFocused.set(false);
    this.onFocusChange.emit(false);
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

  sendPrompt(event?: Event) {
    // Always prevent form submission and page refresh
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Get text from form control (more reliable)
    const promptValue = this.promptControl.value || this.promptText;
    if (!promptValue.trim() || this.isProcessing()) return;

    const prompt = promptValue.trim();
    const type = this.promptType();
    const context = this.context();

    // Create AIPrompt object to emit
    const aiPrompt = {
      id: `prompt_${Date.now()}`,
      content: prompt,
      type,
      context,
      timestamp: new Date(),
      userId: 'current-user',
      model: 'gpt-4'
    };

    // Emit the prompt sent event immediately
    this.promptSent.emit(aiPrompt);

    // Then send to AI service and handle response
    this.aiPromptService.sendPrompt(prompt, type, context).subscribe({
      next: (response) => {
        this.onResponseReceived.emit(response);
        this.clearPrompt();
      },
      error: (error) => {
        console.error('Prompt error:', error);
        this.clearPrompt();
      }
    });
  }

  clearPrompt() {
    this.promptText = '';
    this.promptControl.setValue('');
    this.focusInput();
  }

  applyQuickSuggestion(suggestion: string) {
    if (this.promptText.trim()) {
      this.promptText += '. ' + suggestion;
    } else {
      this.promptText = suggestion;
    }
    this.promptControl.setValue(this.promptText);
    this.focusInput();
  }

  filterSuggestions(value: string): {text: string, icon: string, category: string}[] {
    if (!value || value.length < 2) {
      return this.smartSuggestions.slice(0, 8); // Show top 8 when empty
    }

    const filterValue = value.toLowerCase();
    return this.smartSuggestions
      .filter(suggestion => 
        suggestion.text.toLowerCase().includes(filterValue) ||
        suggestion.category.toLowerCase().includes(filterValue)
      )
      .slice(0, 12); // Show top 12 matches
  }

  onSuggestionSelected(event: any) {
    const selectedText = event.option.value;
    this.promptText = selectedText;
    this.promptControl.setValue(selectedText);
    
    // Auto-focus back to textarea
    setTimeout(() => {
      if (this.promptInput?.nativeElement) {
        this.promptInput.nativeElement.focus();
      }
    }, 100);
  }

  applyTemplate(template: string) {
    this.promptText = template;
    this.promptControl.setValue(template);
    this.focusInput();
  }

  private focusInput() {
    setTimeout(() => {
      this.promptInput?.nativeElement?.focus();
    }, 100);
  }
}