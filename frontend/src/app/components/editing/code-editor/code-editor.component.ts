import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AICodeGeneratorService, CodeGenerationRequest } from '@app/services/ai/ai-code-generator.service';
import { AICopilotService } from '@app/services/ai/ai-copilot.service';
import { AIPromptService } from '@app/services/ai/ai-prompt.service';
import { AITransformService } from '@app/services/ai/ai-transform.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { ProfessionalLoaderComponent } from '@app/components/ui/professional-loader/professional-loader.component';
import { CodeDisplayComponent } from '@app/components/shared/code-display/code-display.component';
import { AIPromptBoxComponent } from '@app/components/ai/ai-prompt-box/ai-prompt-box.component';
import { AIPrompt, AIResponse, AISuggestion } from '@app/models/ai.model';
import { SafePipe } from '@app/pipes/safe.pipe';

@Component({
  selector: 'app-code-editor',
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
    MatSelectModule,
    MatSliderModule,
    MatCheckboxModule,
    ProfessionalLoaderComponent,
    CodeDisplayComponent,
    AIPromptBoxComponent,
    SafePipe
  ],
  template: `
    <div class="code-editor-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>
              <mat-icon class="page-icon">code</mat-icon>
              AI Code Editor
            </h1>
            <p>Intelligent code generation and editing with AI assistance</p>
          </div>
          
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="generateCode()" [disabled]="isGenerating()">
              <mat-icon>auto_fix_high</mat-icon>
              Generate Code
            </button>
            <button mat-button (click)="saveCode()" [disabled]="!hasCode()">
              <mat-icon>save</mat-icon>
              Save
            </button>
            <button mat-button (click)="exportCode()" [disabled]="!hasCode()">
              <mat-icon>download</mat-icon>
              Export
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="page-content">
        <div class="editor-layout">
          <!-- Left Panel - AI Controls -->
          <div class="ai-controls-panel">
            <mat-card class="control-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>psychology</mat-icon>
                  AI Code Generation
                </mat-card-title>
              </mat-card-header>
              
              <mat-card-content>
                <!-- Language Selection -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Programming Language</mat-label>
                  <mat-select [(ngModel)]="selectedLanguage" (selectionChange)="onLanguageChange()">
                    <mat-option *ngFor="let lang of supportedLanguages" [value]="lang.value">
                      {{ lang.label }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Framework Selection -->
                <mat-form-field appearance="outline" class="full-width" *ngIf="selectedLanguage === 'typescript' || selectedLanguage === 'javascript'">
                  <mat-label>Framework</mat-label>
                  <mat-select [(ngModel)]="selectedFramework">
                    <mat-option *ngFor="let framework of getFrameworksForLanguage()" [value]="framework.value">
                      {{ framework.label }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Code Type -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Code Type</mat-label>
                  <mat-select [(ngModel)]="selectedCodeType">
                    <mat-option *ngFor="let type of codeTypes" [value]="type.value">
                      {{ type.label }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Complexity Level -->
                <div class="complexity-control">
                  <label>Complexity Level: {{ complexityLevel }}</label>
                  <mat-slider [(ngModel)]="complexityLevel" min="1" max="5" step="1" class="full-width">
                  </mat-slider>
                  <div class="complexity-labels">
                    <span>Simple</span>
                    <span>Advanced</span>
                  </div>
                </div>

                <!-- Additional Options -->
                <div class="options-section">
                  <h4>Options</h4>
                  <mat-checkbox [(ngModel)]="includeTests">Include Tests</mat-checkbox>
                  <mat-checkbox [(ngModel)]="includeDocumentation">Include Documentation</mat-checkbox>
                  <mat-checkbox [(ngModel)]="followBestPractices">Follow Best Practices</mat-checkbox>
                </div>

                <!-- AI Prompt Box -->
                <div class="prompt-section">
                  <h4>Custom Instructions</h4>
                  <app-ai-prompt-box
                    [placeholder]="'Describe what you want to generate...'"
                    [showSuggestions]="true"
                    (promptSent)="handleCustomPrompt($event)">
                  </app-ai-prompt-box>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Main Editor Area -->
          <div class="editor-main-area">
            <!-- Editor Tabs -->
            <mat-tab-group [(selectedIndex)]="activeTab" (selectedIndexChange)="onTabChange($event)">
              <!-- Code Editor Tab -->
              <mat-tab label="Code Editor">
                <div class="editor-container">
                  <div class="editor-toolbar">
                    <div class="toolbar-left">
                      <button mat-icon-button (click)="undo()" [disabled]="!canUndo()">
                        <mat-icon>undo</mat-icon>
                      </button>
                      <button mat-icon-button (click)="redo()" [disabled]="!canRedo()">
                        <mat-icon>redo</mat-icon>
                      </button>
                      <mat-divider vertical></mat-divider>
                      <button mat-icon-button (click)="formatCode()">
                        <mat-icon>format_indent_increase</mat-icon>
                      </button>
                      <button mat-icon-button (click)="minifyCode()">
                        <mat-icon>compress</mat-icon>
                      </button>
                    </div>
                    
                    <div class="toolbar-right">
                      <button mat-icon-button (click)="copyCode()" [disabled]="!hasCode()">
                        <mat-icon>content_copy</mat-icon>
                      </button>
                      <button mat-icon-button (click)="clearCode()" [disabled]="!hasCode()">
                        <mat-icon>clear</mat-icon>
                      </button>
                    </div>
                  </div>
                  
                  <div class="code-editor-wrapper">
                    <textarea
                      #codeEditor
                      class="code-editor"
                      [(ngModel)]="currentCode"
                      (ngModelChange)="onCodeChange($event)"
                      placeholder="Your code will appear here..."
                      spellcheck="false">
                    </textarea>
                  </div>
                </div>
              </mat-tab>

              <!-- Preview Tab -->
              <mat-tab label="Live Preview">
                <div class="preview-container">
                  <div class="preview-toolbar">
                    <button mat-button (click)="refreshPreview()">
                      <mat-icon>refresh</mat-icon>
                      Refresh
                    </button>
                    <button mat-button (click)="openInNewTab()">
                      <mat-icon>open_in_new</mat-icon>
                      Open in New Tab
                    </button>
                  </div>
                  
                  <div class="preview-frame">
                    <iframe
                      #previewFrame
                      [src]="previewUrl() | safe:'resourceUrl'"
                      class="preview-iframe"
                      title="Code Preview">
                    </iframe>
                  </div>
                </div>
              </mat-tab>

              <!-- Generated Code Tab -->
              <mat-tab label="Generated Code">
                <div class="generated-code-container">
                  <div class="generated-code-header">
                    <h3>AI Generated Code</h3>
                    <div class="generation-actions">
                      <button mat-button (click)="regenerateCode()" [disabled]="isGenerating()">
                        <mat-icon>refresh</mat-icon>
                        Regenerate
                      </button>
                      <button mat-button (click)="applyToEditor()" [disabled]="!hasGeneratedCode()">
                        <mat-icon>edit</mat-icon>
                        Apply to Editor
                      </button>
                    </div>
                  </div>
                  
                  <div class="generated-code-content">
                    <app-code-display
                      [code]="generatedCode()"
                      [language]="selectedLanguage"
                      [showLineNumbers]="true">
                    </app-code-display>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>

          <!-- Right Panel - AI Suggestions -->
          <div class="ai-suggestions-panel">
            <mat-card class="suggestions-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>lightbulb</mat-icon>
                  AI Suggestions
                </mat-card-title>
              </mat-card-header>
              
              <mat-card-content>
                <div class="suggestions-list">
                  <div *ngFor="let suggestion of aiSuggestions()" class="suggestion-item">
                    <div class="suggestion-header">
                      <mat-icon class="suggestion-icon">lightbulb</mat-icon>
                      <span class="suggestion-title">{{ suggestion.title }}</span>
                    </div>
                    <p class="suggestion-description">{{ suggestion.description }}</p>
                    <div class="suggestion-actions">
                      <button mat-button size="small" (click)="applySuggestion(suggestion)">
                        Apply
                      </button>
                      <button mat-button size="small" (click)="viewSuggestion(suggestion)">
                        View
                      </button>
                    </div>
                  </div>
                  
                  <div *ngIf="aiSuggestions().length === 0" class="no-suggestions">
                    <mat-icon>lightbulb_outline</mat-icon>
                    <p>No suggestions yet. Generate some code to get started!</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div *ngIf="isGenerating()" class="loading-overlay">
        <app-professional-loader [type]="'generating'"></app-professional-loader>
        <p>Generating code with AI...</p>
      </div>
    </div>
  `,
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('codeEditor') codeEditor!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;
  
  @Input() initialCode: string = '';

  // Services
  private readonly aiCodeGenerator = inject(AICodeGeneratorService);
  private readonly aiCopilot = inject(AICopilotService);
  private readonly aiPrompt = inject(AIPromptService);
  private readonly aiTransform = inject(AITransformService);
  private readonly notification = inject(NotificationService);

  // State
  readonly isGenerating = signal<boolean>(false);
  readonly currentCode = signal<string>('');
  readonly generatedCode = signal<string>('');
  readonly aiSuggestions = signal<AISuggestion[]>([]);
  
  // UI State
  activeTab = 0;
  selectedLanguage = 'typescript';
  selectedFramework = 'angular';
  selectedCodeType = 'component';
  complexityLevel = 3;
  includeTests = true;
  includeDocumentation = true;
  followBestPractices = true;

  // Editor History
  private codeHistory: string[] = [];
  private historyIndex = -1;

  // Supported Languages and Types
  supportedLanguages = [
    { value: 'typescript', label: 'TypeScript' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'scss', label: 'SCSS' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' }
  ];

  codeTypes = [
    { value: 'component', label: 'Component' },
    { value: 'service', label: 'Service' },
    { value: 'directive', label: 'Directive' },
    { value: 'pipe', label: 'Pipe' },
    { value: 'guard', label: 'Guard' },
    { value: 'interceptor', label: 'Interceptor' },
    { value: 'utility', label: 'Utility Function' },
    { value: 'class', label: 'Class' },
    { value: 'interface', label: 'Interface' }
  ];

  ngOnInit() {
    this.initializeEditor();
    this.loadSavedCode();
  }

  ngAfterViewInit() {
    this.setupEditor();
  }

  // Editor Setup
  private initializeEditor() {
    this.currentCode.set('// Welcome to the AI Code Editor!\n// Start typing or use AI to generate code.\n\n');
    this.updateCodeHistory();
  }

  private setupEditor() {
    if (this.codeEditor) {
      this.codeEditor.nativeElement.focus();
      this.setupAutoResize();
    }
  }

  private setupAutoResize() {
    const textarea = this.codeEditor.nativeElement;
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  }

  // Code Generation
  async generateCode() {
    if (!this.canGenerateCode()) {
      this.notification.showError('Please provide more details about what you want to generate.');
      return;
    }

    this.isGenerating.set(true);
    
    try {
      const request = this.buildCodeGenerationRequest();
      const response = await this.aiCodeGenerator.generateCode(request).toPromise();
      
      if (response && response.files && response.files.length > 0) {
        // Get the main component file content
        const mainFile = response.files.find(f => f.type === 'component') || response.files[0];
        this.generatedCode.set(mainFile.content);
        this.generateSuggestions(mainFile.content);
        this.notification.showSuccess('Code generated successfully!');
        this.activeTab = 2; // Switch to generated code tab
      } else {
        this.notification.showError('Failed to generate code. Please try again.');
      }
    } catch (error) {
      console.error('Code generation error:', error);
      this.notification.showError('An error occurred during code generation.');
    } finally {
      this.isGenerating.set(false);
    }
  }

  private buildCodeGenerationRequest(): CodeGenerationRequest {
    return {
      type: this.selectedCodeType as 'component' | 'service' | 'directive' | 'pipe' | 'guard' | 'interceptor',
      framework: this.selectedFramework as 'angular' | 'react' | 'vue' | 'svelte',
      name: `${this.selectedCodeType}-${Date.now()}`,
      description: this.buildGenerationPrompt(),
      features: this.getFeaturesFromOptions(),
      styling: 'scss',
      dependencies: []
    };
  }

  private getFeaturesFromOptions(): string[] {
    const features: string[] = [];
    if (this.includeTests) features.push('test');
    if (this.includeDocumentation) features.push('documentation');
    if (this.followBestPractices) features.push('best-practices');
    return features;
  }

  private buildGenerationPrompt(): string {
    const basePrompt = `Generate ${this.selectedCodeType} code in ${this.selectedLanguage}`;
    const frameworkPrompt = this.selectedFramework ? ` using ${this.selectedFramework} framework` : '';
    const complexityPrompt = ` with complexity level ${this.complexityLevel}/5`;
    const optionsPrompt = this.buildOptionsPrompt();
    
    return `${basePrompt}${frameworkPrompt}${complexityPrompt}.${optionsPrompt}`;
  }

  private buildOptionsPrompt(): string {
    const options = [];
    if (this.includeTests) options.push('include unit tests');
    if (this.includeDocumentation) options.push('include comprehensive documentation');
    if (this.followBestPractices) options.push('follow industry best practices');
    
    return options.length > 0 ? ` Requirements: ${options.join(', ')}.` : '';
  }

  private canGenerateCode(): boolean {
    return !!(this.selectedLanguage && this.selectedCodeType);
  }

  // AI Suggestions
  private generateSuggestions(code: string) {
    // This would integrate with your AI suggestion service
    const suggestions: AISuggestion[] = [
      {
        id: '1',
        title: 'Code Optimization',
        description: 'This code could be optimized for better performance.',
        type: 'optimization',
        confidence: 0.85
      },
      {
        id: '2',
        title: 'Security Enhancement',
        description: 'Consider adding input validation for security.',
        type: 'security',
        confidence: 0.92
      }
    ];
    
    this.aiSuggestions.set(suggestions);
  }

  // Editor Actions
  onCodeChange(code: string) {
    this.currentCode.set(code);
    this.updateCodeHistory();
  }

  private updateCodeHistory() {
    const currentCode = this.currentCode();
    if (this.codeHistory[this.historyIndex] !== currentCode) {
      this.codeHistory = this.codeHistory.slice(0, this.historyIndex + 1);
      this.codeHistory.push(currentCode);
      this.historyIndex = this.codeHistory.length - 1;
    }
  }

  undo() {
    if (this.canUndo()) {
      this.historyIndex--;
      this.currentCode.set(this.codeHistory[this.historyIndex]);
    }
  }

  redo() {
    if (this.canRedo()) {
      this.historyIndex++;
      this.currentCode.set(this.codeHistory[this.historyIndex]);
    }
  }

  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.codeHistory.length - 1;
  }

  formatCode() {
    // Implement code formatting logic
    this.notification.showInfo('Code formatting feature coming soon!');
  }

  minifyCode() {
    // Implement code minification logic
    this.notification.showInfo('Code minification feature coming soon!');
  }

  copyCode() {
    navigator.clipboard.writeText(this.currentCode());
    this.notification.showSuccess('Code copied to clipboard!');
  }

  clearCode() {
    this.currentCode.set('');
    this.updateCodeHistory();
  }

  // Preview Functions
  previewUrl() {
    if (this.selectedLanguage === 'html') {
      const blob = new Blob([this.currentCode()], { type: 'text/html' });
      return URL.createObjectURL(blob);
    }
    return '';
  }

  refreshPreview() {
    if (this.previewFrame) {
      this.previewFrame.nativeElement.src = this.previewUrl();
    }
  }

  openInNewTab() {
    const url = this.previewUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Generated Code Actions
  regenerateCode() {
    this.generateCode();
  }

  applyToEditor() {
    if (this.generatedCode()) {
      this.currentCode.set(this.generatedCode());
      this.updateCodeHistory();
      this.activeTab = 0; // Switch to editor tab
      this.notification.showSuccess('Generated code applied to editor!');
    }
  }

  hasGeneratedCode(): boolean {
    return !!this.generatedCode();
  }

  // Utility Functions
  hasCode(): boolean {
    return !!this.currentCode() && this.currentCode().trim().length > 0;
  }

  getFrameworksForLanguage(): Array<{value: string, label: string}> {
    if (this.selectedLanguage === 'typescript' || this.selectedLanguage === 'javascript') {
      return [
        { value: 'angular', label: 'Angular' },
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue.js' },
        { value: 'node', label: 'Node.js' }
      ];
    }
    return [];
  }

  getPromptSuggestions(): string[] {
    return [
      'Create a responsive navigation component',
      'Generate a data service with CRUD operations',
      'Build a form validation directive',
      'Create a custom pipe for data formatting'
    ];
  }

  // Event Handlers
  onLanguageChange() {
    this.selectedFramework = '';
    this.generatedCode.set('');
    this.aiSuggestions.set([]);
  }

  onTabChange(index: number) {
    this.activeTab = index;
  }

  handleCustomPrompt(prompt: AIPrompt) {
    // Handle custom AI prompts
    this.notification.showInfo('Custom prompt feature coming soon!');
  }

  applySuggestion(suggestion: AISuggestion) {
    this.notification.showInfo(`Applying suggestion: ${suggestion.title}`);
  }

  viewSuggestion(suggestion: AISuggestion) {
    this.notification.showInfo(`Viewing suggestion: ${suggestion.title}`);
  }

  // File Operations
  saveCode() {
    const code = this.currentCode();
    if (code) {
      localStorage.setItem('savedCode', code);
      this.notification.showSuccess('Code saved successfully!');
    }
  }

  private loadSavedCode() {
    const savedCode = localStorage.getItem('savedCode');
    if (savedCode) {
      this.currentCode.set(savedCode);
      this.updateCodeHistory();
    }
  }

  exportCode() {
    const code = this.currentCode();
    if (code) {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code.${this.getFileExtension()}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  private getFileExtension(): string {
    const extensions: { [key: string]: string } = {
      'typescript': 'ts',
      'javascript': 'js',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'python': 'py',
      'java': 'java',
      'csharp': 'cs'
    };
    return extensions[this.selectedLanguage] || 'txt';
  }
}
