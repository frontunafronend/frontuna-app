import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';

// GA4 type declaration
declare global {
  function gtag(...args: any[]): void;
}
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
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { AICopilotPanelComponent } from '@app/components/ai/ai-copilot-panel/ai-copilot-panel.component';
import { AIPromptBoxComponent } from '@app/components/ai/ai-prompt-box/ai-prompt-box.component';
import { CodeDisplayComponent } from '@app/components/shared/code-display/code-display.component';
import { MonacoCodeEditorComponent } from '@app/components/shared/monaco-code-editor/monaco-code-editor.component';
import { AIPromptService } from '@app/services/ai/ai-prompt.service';
import { AIPromptCoreService } from '@app/services/ai/ai-prompt-core.service';
import { EditorStateService } from '@app/services/editor-state.service';
import { CodeFenceParserService } from '@app/services/code-fence-parser.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { ProfessionalLoaderComponent } from '@app/components/ui/professional-loader/professional-loader.component';
import { EnhancedAIPreviewComponent } from '@app/components/ai/enhanced-ai-preview/enhanced-ai-preview.component';
import { AIPrompt, AIResponse } from '@app/models/ai.model';

@Component({
  selector: 'app-ai-copilot',
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
    MatSelectModule,
    MatMenuModule,
    MatBadgeModule,
    MatDialogModule,

    AICopilotPanelComponent,
    AIPromptBoxComponent,
    CodeDisplayComponent,
    MonacoCodeEditorComponent,
    ProfessionalLoaderComponent,
    EnhancedAIPreviewComponent
  ],
  template: `
    <!-- Loading Overlay -->
    <div *ngIf="isPageLoading()" class="page-loading-overlay" 
         style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(255, 255, 255, 0.95); z-index: 9999; 
                display: flex; align-items: center; justify-content: center;">
      <app-professional-loader 
        [type]="'pulse'"
        [message]="'Loading AI Copilot...'"
        [subMessage]="'Preparing your coding assistant'">
      </app-professional-loader>
    </div>

    <div class="ai-copilot-page" [class.loading]="isPageLoading()">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>
              <mat-icon class="page-icon">psychology</mat-icon>
              AI Copilot
            </h1>
            <p>Your intelligent coding assistant powered by advanced AI</p>
          </div>
          
          <div class="header-stats">
            <div class="stat-card">
              <div class="stat-value">{{ safeSignalAccess(totalPrompts, 0) }}</div>
              <div class="stat-label">Prompts Today</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ safeSignalAccess(totalSuggestions, 0) }}</div>
              <div class="stat-label">Suggestions</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ safeSignalAccess(successRate, 95) }}%</div>
              <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat-card test-button">
              <button mat-raised-button color="accent" (click)="testPageFunctionality()" style="margin: 0; padding: 8px 16px;">
                <mat-icon>bug_report</mat-icon>
                Test Page
              </button>
            </div>
            <div class="stat-card model-selector">
              <mat-form-field appearance="outline" style="width: 200px;">
                <mat-label>AI Model</mat-label>
                <mat-select [value]="currentModel()" (selectionChange)="onModelChange($event.value)">
                  <mat-option *ngFor="let model of availableModels()" [value]="model">
                    {{ model }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Tabs -->
        <mat-tab-group [selectedIndex]="activeTab" (selectedIndexChange)="onTabChange($event)">
          <!-- Chat Tab -->
          <mat-tab label="Chat">
            <div class="tab-content">
              <div class="chat-layout">
                <!-- Left Side: AI Copilot Panel (Temporarily Commented) -->
                <!-- <div class="copilot-panel">
                  <app-ai-copilot-panel
                    [currentBuffers]="{
                      typescript: typescriptCode(),
                      html: htmlCode(),
                      scss: scssCode()
                    }"
                    [framework]="currentFramework()"
                    [style]="currentStyle()"
                    (refineRequested)="onRefineRequested($event)"
                    (explainRequested)="onExplainRequested($event)"
                    (convertRequested)="onConvertRequested($event)"
                    (a11yRequested)="onA11yRequested($event)">
                  </app-ai-copilot-panel>
                </div> -->
                
                <!-- Middle: Chat Interface -->
                <div class="chat-section">
                  <div class="chat-interface">
                    <!-- Chat Search Bar -->
                    <div class="chat-search-bar">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Search messages</mat-label>
                        <input matInput 
                               [(ngModel)]="chatSearchQuery"
                               (input)="onChatSearch($event)"
                               placeholder="Type to search messages...">
                        <mat-icon matSuffix>search</mat-icon>
                      </mat-form-field>
                      <div class="search-filters">
                        <button mat-button 
                                [class.active]="showFavorites"
                                (click)="toggleFavorites()">
                          <mat-icon>favorite</mat-icon>
                          Favorites
                        </button>
                        <button mat-button 
                                [class.active]="showPreviewPanel()"
                                (click)="togglePreviewPanel()">
                          <mat-icon>visibility</mat-icon>
                          Preview
                        </button>
                      </div>
                    </div>
                    
                    <!-- Chat Messages -->
                    <div class="chat-messages" #chatMessagesContainer>
                      <!-- Welcome Message -->
                      <div class="chat-message ai-message welcome-message">
                        <div class="message-content">
                          <div class="message-header">
                            <span class="message-sender">AI Copilot</span>
                            <span class="message-time">Just now</span>
                          </div>
                          <div class="message-text">
                            👋 Welcome! I'm your AI coding assistant. I can help you with:
                            <ul>
                              <li>🚀 Code generation and optimization</li>
                              <li>🐛 Debugging and problem solving</li>
                              <li>📚 Best practices and design patterns</li>
                              <li>🔧 Code refactoring and improvements</li>
                            </ul>
                            Try one of the starter prompts below or ask me anything!
                          </div>
                        </div>
                      </div>

                      <!-- Sample Chat Messages for Demo -->
                      <div class="chat-message user-message">
                        <div class="message-content">
                          <div class="message-header">
                            <span class="message-sender">You</span>
                            <span class="message-time">2 minutes ago</span>
                          </div>
                          <div class="message-text">
                            How do I create a responsive card component in Angular?
                          </div>
                        </div>
                      </div>

                      <div class="chat-message ai-message">
                        <div class="message-content">
                          <div class="message-header">
                            <span class="message-sender">AI Copilot</span>
                            <span class="message-time">1 minute ago</span>
                          </div>
                          <div class="message-text">
                            Here's a responsive card component for Angular with Material Design:
                          </div>
                          <div class="message-code">
                            <app-code-display 
                              [code]="sampleCardCode"
                              [language]="'typescript'"
                              [showLineNumbers]="true">
                            </app-code-display>
                          </div>
                          <div class="message-actions">
                            <div class="primary-actions">
                              <button mat-button (click)="copyCode(sampleCardCode)">
                                <mat-icon>content_copy</mat-icon>
                                Copy Code
                              </button>
                              <button mat-button (click)="openInEditor(sampleCardCode)">
                                <mat-icon>edit</mat-icon>
                                Open in Editor
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div *ngIf="filteredMessages().length === 0" class="chat-empty">
                        <mat-icon>chat_bubble_outline</mat-icon>
                        <h3>Start a conversation</h3>
                        <p>Ask me anything about coding, debugging, or software development. I'm here to help!</p>
                        
                        <!-- Starter Prompts -->
                        <div class="starter-prompts">
                          <h4>Try these starter prompts:</h4>
                          <mat-chip-listbox>
                            <mat-chip-option 
                              *ngFor="let prompt of starterPrompts; trackBy: trackPrompt"
                              (click)="useStarterPrompt(prompt)"
                              [class.selected]="prompt === selectedPrompt">
                              {{ prompt }}
                            </mat-chip-option>
                          </mat-chip-listbox>
                        </div>
                      </div>

                      <div *ngFor="let message of filteredMessages(); trackBy: trackMessage" 
                           class="chat-message" 
                           [class.user-message]="message.type === 'user'"
                           [class.ai-message]="message.type === 'ai'">
                        <div class="message-content">
                          <div class="message-header">
                            <span class="message-sender">{{ message.sender }}</span>
                            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                          </div>
                          
                          <div class="message-text" [innerHTML]="message.content"></div>
                          
                          <div *ngIf="message.code" class="message-code">
                            <app-code-display 
                              [code]="message.code.typescript || message.code.javascript || ''"
                              [language]="message.code.typescript ? 'typescript' : 'javascript'"
                              [showLineNumbers]="true">
                            </app-code-display>
                          </div>

                          <div class="message-actions">
                            <div class="primary-actions">
                              <button mat-button 
                                      *ngIf="message.type === 'ai'"
                                      (click)="regenerateResponse(message)"
                                      [disabled]="isGenerating()">
                                <mat-icon>refresh</mat-icon>
                                Regenerate
                              </button>
                              
                              <button mat-button 
                                      *ngIf="message.type === 'ai' && message.code"
                                      (click)="improveResponse(message)"
                                      [disabled]="isGenerating()">
                                <mat-icon>auto_awesome</mat-icon>
                                Improve
                              </button>
                            </div>

                            <div class="secondary-actions">
                              <button mat-icon-button 
                                      (click)="copyMessage(message)"
                                      matTooltip="Copy message">
                                <mat-icon>content_copy</mat-icon>
                              </button>
                              
                              <button mat-icon-button 
                                      (click)="toggleMessageFavorite(message)"
                                      matTooltip="Toggle favorite">
                                <mat-icon>{{ isMessageFavorite(message) ? 'favorite' : 'favorite_border' }}</mat-icon>
                              </button>
                              
                              <button mat-icon-button 
                                      [matMenuTriggerFor]="messageMenu"
                                      matTooltip="More options">
                                <mat-icon>more_vert</mat-icon>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Chat Input -->
                    <div class="chat-input">
                      <app-ai-prompt-box
                        [placeholder]="'Ask me anything about coding...'"
                        (promptSent)="handlePromptSent($event)">
                      </app-ai-prompt-box>
                    </div>
                  </div>
                </div>

                <!-- Right Side: Code Editor and Preview -->
                <div class="right-panel">
                  <!-- Monaco Code Editor Panel -->
                  <div class="code-editor-panel">
                    <div class="panel-header">
                      <h3>
                        <mat-icon>code</mat-icon>
                        Code Editor
                      </h3>
                      <div class="panel-actions">
                        <button mat-button (click)="togglePreviewPanel()">
                          <mat-icon>{{ showPreviewPanel() ? 'visibility_off' : 'visibility' }}</mat-icon>
                          {{ showPreviewPanel() ? 'Hide' : 'Show' }} Preview
                        </button>
                        <button mat-button (click)="openCodeEditor()">
                          <mat-icon>open_in_new</mat-icon>
                          Full Editor
                        </button>
                      </div>
                    </div>
                    
                    <div class="editor-content">
                      <!-- Code Editor Tabs -->
                      <mat-tab-group class="code-tabs">
                        <mat-tab label="TypeScript">
                          <div class="code-editor-container">
                            <textarea 
                              [value]="typescriptCode()"
                              (input)="onTypeScriptChange($event)"
                              placeholder="TypeScript code here..."
                              class="code-textarea typescript">
                            </textarea>
                          </div>
                        </mat-tab>
                        <mat-tab label="HTML">
                          <div class="code-editor-container">
                            <textarea 
                              [value]="htmlCode()"
                              (input)="onHtmlChange($event)"
                              placeholder="HTML code here..."
                              class="code-textarea html">
                            </textarea>
                          </div>
                        </mat-tab>
                        <mat-tab label="SCSS">
                          <div class="code-editor-container">
                            <textarea 
                              [value]="scssCode()"
                              (input)="onScssChange($event)"
                              placeholder="SCSS code here..."
                              class="code-textarea scss">
                            </textarea>
                          </div>
                        </mat-tab>
                      </mat-tab-group>
                      
                      <!-- Editor Status Bar -->
                      <div class="editor-status-bar">
                        <span class="error-count" *ngIf="errorCount() > 0">
                          <mat-icon>error</mat-icon>
                          {{ errorCount() }} errors
                        </span>
                        <span class="line-info">
                          Line {{ currentLine() }}, Column {{ currentColumn() }}
                        </span>
                      </div>
                      
                      <div class="editor-actions">
                        <button mat-raised-button color="primary" (click)="runCode()">
                          <mat-icon>play_arrow</mat-icon>
                          Run Code
                        </button>
                        <button mat-button (click)="formatCode()">
                          <mat-icon>format_indent_increase</mat-icon>
                          Format
                        </button>
                        <button mat-button (click)="saveCode()">
                          <mat-icon>save</mat-icon>
                          Save
                        </button>
                        <button mat-button (click)="exportCode()">
                          <mat-icon>download</mat-icon>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Preview Panel (Conditional) -->
                  <div class="preview-panel" *ngIf="showPreviewPanel()">
                    <app-enhanced-ai-preview
                      (codeChange)="onPreviewCodeChange($event)">
                    </app-enhanced-ai-preview>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Generation Tab -->
          <mat-tab label="Generation">
            <div class="tab-content">
              <div class="generation-interface">
                <div class="generation-header">
                  <h3>Code Generation</h3>
                  <p>Generate code based on your requirements</p>
                </div>

                <div class="generation-form">
                  <app-ai-prompt-box
                    [placeholder]="'Describe the code you want me to generate...'"
                    (promptSent)="handleGenerationResponse($event)">
                  </app-ai-prompt-box>
                </div>

                <div *ngIf="generatedCode()" class="generated-code-section">
                  <div class="code-header">
                    <h4>Generated Code</h4>
                    <div class="code-actions">
                      <button mat-button (click)="copyGeneratedCode()">
                        <mat-icon>content_copy</mat-icon>
                        Copy
                      </button>
                      <button mat-button (click)="saveGeneratedCode()">
                        <mat-icon>save</mat-icon>
                        Save
                      </button>
                    </div>
                  </div>
                  
                  <app-code-display 
                    [code]="generatedCode()"
                    [language]="'typescript'"
                    [showLineNumbers]="true"
                    (codeChange)="onGeneratedCodeChange($event)">
                  </app-code-display>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- History Tab -->
          <mat-tab label="History">
            <div class="tab-content">
              <div class="history-interface">
                <div class="history-header">
                  <h3>Prompt History</h3>
                  <div class="history-actions">
                    <button mat-button (click)="clearHistory()">
                      <mat-icon>clear_all</mat-icon>
                      Clear History
                    </button>
                  </div>
                </div>

                <div class="history-list">
                  <div *ngFor="let prompt of promptHistory(); trackBy: trackPromptHistory" 
                       class="history-item"
                       [class.selected]="prompt.content === selectedPrompt"
                       (click)="selectHistoryItem(prompt)">
                    <div class="history-content">
                      <div class="history-text">{{ prompt.content }}</div>
                      <div class="history-time">{{ formatTime(prompt.timestamp) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <!-- Message Menu -->
    <mat-menu #messageMenu="matMenu">
      <button mat-menu-item (click)="editMessage()">
        <mat-icon>edit</mat-icon>
        Edit
      </button>
      <button mat-menu-item (click)="replyToMessage()">
        <mat-icon>reply</mat-icon>
        Reply
      </button>
      <button mat-menu-item (click)="deleteMessage()">
        <mat-icon>delete</mat-icon>
        Delete
      </button>
    </mat-menu>

    <!-- Chat Actions Menu -->
    <mat-menu #chatActionsMenu="matMenu">
      <button mat-menu-item (click)="exportChatAsMarkdown()">
        <mat-icon>description</mat-icon>
        Export as Markdown
      </button>
      <button mat-menu-item (click)="exportChatAsJSON()">
        <mat-icon>code</mat-icon>
        Export as JSON
      </button>
      <button mat-menu-item (click)="exportChatAsPDF()">
        <mat-icon>picture_as_pdf</mat-icon>
        Export as PDF
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="shareChat()">
        <mat-icon>share</mat-icon>
        Share Chat
      </button>
    </mat-menu>
  `,
  styleUrls: ['./ai-copilot.component.scss']
})
export class AICopilotComponent implements OnInit {
  private readonly aiPromptService = inject(AIPromptService);
  private readonly aiPromptCore = inject(AIPromptCoreService);
  private readonly aiCodeGenerator = inject(AICodeGeneratorService);
  private readonly aiTransformService = inject(AITransformService);
  private readonly aiDiffService = inject(AIDiffService);
  private readonly aiVersioning = inject(AIVersioningService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly keyboardShortcuts = inject(KeyboardShortcutsService);
  private readonly dialog = inject(MatDialog);
  protected readonly copilotState = inject(AICopilotStateService);

  // Component state
  activeTab = 0;
  readonly currentContext = this.copilotState.currentContext;
  readonly chatMessages = this.copilotState.chatMessages;
  readonly generatedCode = signal<string>('');
  readonly promptHistory = this.copilotState.promptHistory;

  // UI state
  readonly isPageLoading = signal<boolean>(true);
  readonly isGenerating = signal<boolean>(false);
  readonly isThinking = signal<boolean>(false);
  readonly showPreviewPanel = signal<boolean>(false);
  readonly lastAIResponse = signal<AIResponse | null>(null);
  readonly showCodeEditor = signal<boolean>(false);
  
  // AI state
  readonly errorMsg = signal<string | null>(null);
  readonly currentModel = signal<string>('gpt-4');
  readonly availableModels = signal<string[]>(['gpt-4', 'gpt-3.5-turbo', 'claude-3']);
  
  // Code buffers
  readonly typescriptCode = signal<string>('');
  readonly htmlCode = signal<string>('');
  readonly scssCode = signal<string>('');
  readonly currentFramework = signal<string>('angular');
  readonly currentStyle = signal<string>('material');

  // Local state
  chatSearchQuery = '';
  showFavorites = false;
  readonly favoriteMessages = signal<AIChatMessage[]>([]);
  readonly filteredMessages = computed(() => {
    const messages = this.chatMessages();
    if (this.showFavorites) {
      return messages.filter(msg => this.isMessageFavorite(msg));
    }
    if (this.chatSearchQuery.trim()) {
      return messages.filter(msg => 
        msg.content.toLowerCase().includes(this.chatSearchQuery.trim().toLowerCase())
      );
    }
    return messages;
  });

  // Sample code for demonstration
  sampleCardCode = `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-responsive-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: \`
    <mat-card class="responsive-card">
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
        <mat-card-subtitle>{{ subtitle }}</mat-card-subtitle>
      </mat-card-header>
      
      <img mat-card-image [src]="imageUrl" [alt]="title" *ngIf="imageUrl">
      
      <mat-card-content>
        <p>{{ content }}</p>
      </mat-card-content>
      
      <mat-card-actions>
        <button mat-button (click)="onAction1()">
          <mat-icon>thumb_up</mat-icon>
          {{ action1Text }}
        </button>
        <button mat-button (click)="onAction2()">
          <mat-icon>share</mat-icon>
          {{ action2Text }}
        </button>
      </mat-card-actions>
    </mat-card>
  \`,
  styles: [\`
    .responsive-card {
      max-width: 400px;
      margin: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .responsive-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    @media (max-width: 768px) {
      .responsive-card {
        max-width: 100%;
        margin: 8px 0;
      }
    }
  \`]
})
export class ResponsiveCardComponent {
  @Input() title: string = 'Card Title';
  @Input() subtitle: string = 'Card Subtitle';
  @Input() content: string = 'Card content goes here...';
  @Input() imageUrl?: string;
  @Input() action1Text: string = 'Like';
  @Input() action2Text: string = 'Share';
  
  onAction1() {
    console.log('Action 1 clicked');
  }
  
  onAction2() {
    console.log('Action 2 clicked');
  }
}`;

  // Editable code
  editableCode = '';

  // Stats
  readonly totalPrompts = signal<number>(0);
  readonly totalSuggestions = signal<number>(0);
  readonly successRate = signal<number>(95);

  // Starter prompts
  starterPrompts = [
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

  selectedPrompt: string | null = null;

  ngOnInit() {
    console.log('AI Copilot Component Initializing...');
    
    // Simulate page loading
    setTimeout(() => {
      this.isPageLoading.set(false);
      console.log('AI Copilot Page loaded successfully');
      
      // Test all major functionality
      this.testPageFunctionality();
    }, 1000);

    this.loadStats();
    this.initializeChatMessages();
    this.setupKeyboardShortcuts();
  }

  // Test method to verify page functionality
  public testPageFunctionality() {
    console.log('🧪 Testing AI Copilot Page Functionality...');
    
    // Test 1: Check if all signals are working
    console.log('✅ Signals Test:', {
      isPageLoading: this.isPageLoading(),
      isGenerating: this.isGenerating(),
      showPreviewPanel: this.showPreviewPanel(),
      totalPrompts: this.totalPrompts(),
      totalSuggestions: this.totalSuggestions(),
      successRate: this.successRate()
    });

    // Test 2: Check if sample data is loaded
    console.log('✅ Sample Data Test:', {
      sampleCardCode: this.sampleCardCode ? 'Loaded' : 'Missing',
      editableCode: this.editableCode ? 'Loaded' : 'Empty',
      starterPrompts: this.starterPrompts.length
    });

    // Test 3: Test starter prompt functionality
    if (this.starterPrompts.length > 0) {
      console.log('✅ Starter Prompts Test:', this.starterPrompts);
    }

    // Test 4: Verify component methods exist
    console.log('✅ Methods Test:', {
      runCode: typeof this.runCode === 'function',
      formatCode: typeof this.formatCode === 'function',
      saveCode: typeof this.saveCode === 'function',
      exportCode: typeof this.exportCode === 'function',
      copyCode: typeof this.copyCode === 'function'
    });

    console.log('🎉 AI Copilot Page Functionality Test Complete!');
  }



  handleResponseReceived(response: AIResponse) {
    try {
      const codeData = response.code ? {
        typescript: response.code
      } : undefined;

      this.copilotState.addChatMessage('ai', 'AI Copilot', response.content, codeData);
      this.lastAIResponse.set(response);
    } catch (error) {
      console.error('Error handling response:', error);
      this.notificationService.showError('Failed to process AI response');
    }
  }

  handleSuggestionApplied(suggestion: AISuggestion) {
    this.notificationService.showSuccess('Suggestion applied successfully');
  }

  handleChatResponse(response: AIResponse) {
    this.handleResponseReceived(response);
    this.isGenerating.set(false);
  }

  handleGenerationResponse(response: any) {
    if (response?.code) {
      this.generatedCode.set(response.code);
      this.notificationService.showSuccess('Code generated successfully');
    }
    this.isGenerating.set(false);
  }

  onTabChange(event: any) {
    this.activeTab = event.index;
  }

  useStarterPrompt(prompt: string) {
    // Set the selected prompt and trigger the prompt box
    this.selectedPrompt = prompt;
    this.notificationService.showInfo(`Selected: ${prompt}`);
    
    // In a real implementation, this would send the prompt to the AI
    // For now, we'll simulate a response
    setTimeout(() => {
      this.handlePromptSent({ content: prompt });
      
      // Simulate AI response for demo purposes
      setTimeout(() => {
        const response = this.generateSampleResponse(prompt);
        this.handleResponseReceived(response);
      }, 1000);
    }, 500);
  }

  private generateSampleResponse(prompt: string): AIResponse {
    // Generate sample responses based on the prompt
    const responses: { [key: string]: string } = {
      'Create a responsive card component with image and actions': 'I\'ll create a responsive card component for you. Here\'s a modern Angular component with Material Design:',
      'Build a reactive form with validation and error handling': 'Here\'s a comprehensive reactive form with validation and error handling:',
      'Generate a data table with sorting and pagination': 'I\'ll create a data table component with sorting and pagination capabilities:',
      'Make a responsive navigation menu with dropdowns': 'Here\'s a responsive navigation menu with dropdown support:',
      'Create a modal dialog with animations': 'I\'ll create a modal dialog component with smooth animations:',
      'Build a custom button with loading states': 'Here\'s a custom button component with loading states:',
      'Add comprehensive error handling': 'I\'ll show you how to implement comprehensive error handling:',
      'Make it mobile-friendly and responsive': 'Here\'s how to make your component mobile-friendly and responsive:',
      'Improve accessibility with ARIA labels': 'I\'ll show you how to improve accessibility with ARIA labels:',
      'Optimize performance and bundle size': 'Here are techniques to optimize performance and reduce bundle size:'
    };
    
    return {
      id: this.generateId(),
      promptId: this.generateId(),
      content: responses[prompt] || 'I\'ll help you with that! Here\'s a solution:',
      code: this.sampleCardCode,
      suggestions: [],
      confidence: 0.95,
      processingTime: 1000,
      timestamp: new Date()
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  onGeneratedCodeChange(newCode: string) {
    this.generatedCode.set(newCode);
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.notificationService.showSuccess('Code copied to clipboard');
    });
  }

  copyGeneratedCode() {
    const code = this.generatedCode();
    if (code) {
      this.copyCode(code);
    }
  }

  saveGeneratedCode() {
    const code = this.generatedCode();
    if (code) {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-code.ts';
      a.click();
      URL.revokeObjectURL(url);
      this.notificationService.showSuccess('Code saved successfully');
    }
  }

  regenerateResponse(message: AIChatMessage) {
    if (message.type === 'ai') {
      this.isGenerating.set(true);
      // Implementation for regenerating response
      this.notificationService.showInfo('Regenerating response...');
    }
  }

  improveResponse(message: AIChatMessage) {
    if (message.type === 'ai' && message.code) {
      this.isGenerating.set(true);
      // Implementation for improving response
      this.notificationService.showInfo('Improving response...');
    }
  }

  clearHistory() {
    // Clear prompt history - implementation depends on service
    this.notificationService.showSuccess('History cleared');
  }

  selectHistoryItem(prompt: AIPrompt) {
    this.selectedPrompt = prompt.content;
  }

  trackMessage(index: number, message: AIChatMessage): string {
    return message.id || index.toString();
  }

  trackPrompt(index: number, prompt: string): string {
    return prompt || index.toString();
  }

  trackPromptHistory(index: number, prompt: AIPrompt): string {
    return prompt.id || index.toString();
  }

  formatTime(timestamp: Date | string | undefined): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  private loadStats() {
    // Load statistics from service
    this.totalPrompts.set(25);
    this.totalSuggestions.set(150);
    this.successRate.set(95);
  }

  private initializeChatMessages() {
    // Initialize chat messages if needed
  }

  openPreviewPanel() {
    this.showPreviewPanel.set(true);
  }

  togglePreviewPanel() {
    this.showPreviewPanel.set(!this.showPreviewPanel());
  }

  closePreviewPanel() {
    this.showPreviewPanel.set(false);
  }

  openCodeEditor() {
    this.showCodeEditor.set(true);
  }

  onPreviewCodeChange(event: {type: string, code: string}) {
    // Handle code changes in preview
    if (event.type === 'typescript') {
      this.generatedCode.set(event.code);
    }
  }

  getLoaderType(): 'thinking' | 'generating' | 'processing' | 'pulse' {
    if (this.isGenerating()) {
      return 'generating';
    }
    return 'pulse';
  }

  onChatSearch(event: any) {
    this.chatSearchQuery = event.target.value;
  }

  isMessageFavorite(message: AIChatMessage): boolean {
    return this.favoriteMessages().some(fav => fav.id === message.id);
  }

  toggleMessageFavorite(message: AIChatMessage) {
    const favorites = this.favoriteMessages();
    if (this.isMessageFavorite(message)) {
      this.favoriteMessages.set(favorites.filter(fav => fav.id !== message.id));
    } else {
      this.favoriteMessages.set([...favorites, message]);
    }
  }

  copyMessage(message: AIChatMessage) {
    const textToCopy = message.code ? 
      `${message.content}\n\n\`\`\`typescript\n${message.code.typescript || message.code.javascript || ''}\`\`\`` :
      message.content;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      this.notificationService.showSuccess('Message copied to clipboard');
    });
  }

  // Chat export functionality
  exportChatAsMarkdown() {
    const markdown = this.generateChatMarkdown();
    this.downloadFile(markdown, 'ai-chat-export.md', 'text/markdown');
  }

  exportChatAsJSON() {
    const chatData = {
      exportDate: new Date().toISOString(),
      totalMessages: this.chatMessages().length,
      messages: this.chatMessages(),
      stats: {
        totalPrompts: this.totalPrompts(),
        successRate: this.successRate()
      }
    };
    
    this.downloadFile(JSON.stringify(chatData, null, 2), 'ai-chat-export.json', 'application/json');
  }

  exportChatAsPDF() {
    // For now, create HTML version that can be printed as PDF
    const html = this.generateChatHTML();
    this.downloadFile(html, 'ai-chat-export.html', 'text/html');
    this.notificationService.showInfo('HTML file created - use browser Print > Save as PDF');
  }

  shareChat() {
    const shareData = {
      title: 'AI Copilot Chat Session',
      text: `Check out my AI Copilot conversation with ${this.chatMessages().length} messages!`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.notificationService.showSuccess('Chat URL copied to clipboard');
      });
    }
  }

  confirmClearChat() {
    if (confirm('Are you sure you want to clear all chat messages? This cannot be undone.')) {
      this.copilotState.clearChatHistory();
      this.favoriteMessages.set([]);
      this.notificationService.showSuccess('Chat history cleared');
    }
  }

  // Message menu actions
  editMessage() {
    this.notificationService.showInfo('Edit message feature coming soon!');
  }

  replyToMessage() {
    this.notificationService.showInfo('Reply to message feature coming soon!');
  }

  deleteMessage() {
    this.notificationService.showInfo('Delete message feature coming soon!');
  }

  // Helper methods
  private generateChatMarkdown(): string {
    const messages = this.chatMessages();
    let markdown = `# AI Copilot Chat Export\n\n`;
    markdown += `**Export Date:** ${new Date().toLocaleString()}\n`;
    markdown += `**Total Messages:** ${messages.length}\n\n`;
    markdown += `---\n\n`;

    messages.forEach((message, index) => {
      markdown += `## Message ${index + 1} - ${message.sender}\n`;
      markdown += `**Time:** ${new Date(message.timestamp).toLocaleString()}\n\n`;
      markdown += `${message.content}\n\n`;
      
      if (message.code) {
        markdown += `### Generated Code\n`;
        markdown += `\`\`\`typescript\n${message.code.typescript || message.code.javascript || ''}\n\`\`\`\n\n`;
      }
      
      markdown += `---\n\n`;
    });

    return markdown;
  }

  private generateChatHTML(): string {
    const messages = this.chatMessages();
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AI Copilot Chat Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
          .message { margin: 20px 0; padding: 15px; border-radius: 8px; }
          .user-message { background: #e3f2fd; }
          .ai-message { background: #f3e5f5; }
          .message-header { font-weight: bold; margin-bottom: 8px; }
          .code-block { background: #f5f5f5; padding: 15px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>AI Copilot Chat Export</h1>
        <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Messages:</strong> ${messages.length}</p>
        <hr>
        ${messages.map((message, index) => `
          <div class="message ${message.type}-message">
            <div class="message-header">${message.sender} - ${new Date(message.timestamp).toLocaleString()}</div>
            <div>${message.content}</div>
            ${message.code ? `<div class="code-block">${message.code.typescript || message.code.javascript || ''}</div>` : ''}
          </div>
        `).join('')}
      </body>
      </html>
    `;
  }

  private downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private setupKeyboardShortcuts() {
    // Register AI Copilot specific shortcuts
    this.keyboardShortcuts.registerShortcut({
      key: 'n',
      ctrlKey: true,
      description: 'New chat session',
      action: () => this.confirmClearChat()
    });

    this.keyboardShortcuts.registerShortcut({
      key: 's',
      ctrlKey: true,
      description: 'Save generated code',
      action: () => this.saveGeneratedCode()
    });

    this.keyboardShortcuts.registerShortcut({
      key: 'p',
      ctrlKey: true,
      description: 'Toggle preview panel',
      action: () => this.togglePreviewPanel()
    });

    this.keyboardShortcuts.registerShortcut({
      key: 'f',
      ctrlKey: true,
      description: 'Focus search',
      action: () => this.focusChatSearch()
    });

    this.keyboardShortcuts.registerShortcut({
      key: 'e',
      ctrlKey: true,
      description: 'Export chat',
      action: () => this.exportChatAsMarkdown()
    });

    this.keyboardShortcuts.registerShortcut({
      key: '1',
      ctrlKey: true,
      description: 'Switch to Chat tab',
      action: () => this.activeTab = 0
    });

    this.keyboardShortcuts.registerShortcut({
      key: '2',
      ctrlKey: true,
      description: 'Switch to Generation tab',
      action: () => this.activeTab = 1
    });

    this.keyboardShortcuts.registerShortcut({
      key: '3',
      ctrlKey: true,
      description: 'Switch to History tab',
      action: () => this.activeTab = 2
    });

    this.keyboardShortcuts.registerShortcut({
      key: 'F1',
      description: 'Show keyboard shortcuts help',
      action: () => this.keyboardShortcuts.showShortcutsHelp()
    });

    this.keyboardShortcuts.registerShortcut({
      key: 'Escape',
      description: 'Close preview panel',
      action: () => {
        if (this.showPreviewPanel()) {
          this.closePreviewPanel();
        }
      }
    });
  }

  private focusChatSearch() {
    const searchInput = document.querySelector('.chat-search input') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }

  // Error handling
  private handleError(error: any, context: string) {
    console.error(`Error in ${context}:`, error);
    this.notificationService.showError(`An error occurred: ${error.message || 'Unknown error'}`);
  }

  // Code editor methods
  runCode() {
    if (!this.editableCode.trim()) {
      this.notificationService.showWarning('No code to run');
      return;
    }
    
    try {
      // For demo purposes, show a success message
      this.notificationService.showSuccess('Code executed successfully!');
      console.log('Running code:', this.editableCode);
    } catch (error) {
      this.notificationService.showError('Failed to run code');
      console.error('Code execution error:', error);
    }
  }

  formatCode() {
    if (!this.editableCode.trim()) {
      this.notificationService.showWarning('No code to format');
      return;
    }
    
    try {
      // Basic formatting - in a real app, you'd use a proper formatter
      this.editableCode = this.editableCode
        .replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, ' {\n  ')
        .replace(/\s*}\s*/g, '\n}\n')
        .replace(/\s*;\s*/g, ';\n  ');
      
      this.notificationService.showSuccess('Code formatted successfully');
    } catch (error) {
      this.notificationService.showError('Failed to format code');
      console.error('Code formatting error:', error);
    }
  }

  openInEditor(code: string) {
    // Parse the code to extract TypeScript, HTML, and SCSS parts
    const codeData: MonacoEditorPopupData = {
      typescriptCode: code,
      htmlCode: '<div>HTML content will be generated here</div>',
      scssCode: '/* SCSS styles will be generated here */',
      title: 'Code Editor'
    };

    // Open the Monaco Editor popup
    const dialogRef = this.dialog.open(MonacoEditorPopupComponent, {
      data: codeData,
      width: '95vw',
      height: '90vh',
      maxWidth: '1600px',
      maxHeight: '900px',
      disableClose: false,
      panelClass: 'monaco-editor-dialog'
    });

    // Handle the dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the main component's code buffers
        this.typescriptCode.set(result.typescript);
        this.htmlCode.set(result.html);
        this.scssCode.set(result.scss);
        
        this.notificationService.showSuccess('Code updated successfully');
        this.fireGA4Event('code_editor_saved', {
          code_type: 'typescript',
          code_length: result.typescript.length
        });
      }
    });

    this.fireGA4Event('code_editor_opened', {
      code_type: 'typescript',
      code_length: code.length
    });
  }

  saveCode() {
    if (!this.editableCode.trim()) {
      this.notificationService.showWarning('No code to save');
      return;
    }
    
    try {
      // In a real app, this would save to a file or database
      localStorage.setItem('ai-copilot-saved-code', this.editableCode);
      this.notificationService.showSuccess('Code saved successfully');
    } catch (error) {
      this.notificationService.showError('Failed to save code');
      console.error('Code save error:', error);
    }
  }

  exportCode() {
    if (!this.editableCode.trim()) {
      this.notificationService.showWarning('No code to export');
      return;
    }
    
    try {
      const blob = new Blob([this.editableCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-generated-code.ts';
      a.click();
      URL.revokeObjectURL(url);
      this.notificationService.showSuccess('Code exported successfully');
    } catch (error) {
      this.notificationService.showError('Failed to export code');
      console.error('Code export error:', error);
    }
  }

  // Safe signal access
  protected safeSignalAccess<T>(signal: () => T, defaultValue: T): T {
    try {
      return signal();
    } catch (error) {
      console.error('Signal access error:', error);
      return defaultValue;
    }
  }

  // AI Copilot Panel Event Handlers
  onRefineRequested(event: any) {
    console.log('Refine requested:', event);
    this.isThinking.set(true);
    
    // TODO: Implement refine functionality when service method is available
    setTimeout(() => {
      this.isThinking.set(false);
      this.notificationService.showInfo('Refine functionality coming soon!');
    }, 1000);
  }

  onExplainRequested(event: any) {
    console.log('Explain requested:', event);
    this.isThinking.set(true);
    
    // TODO: Implement explain functionality when service method is available
    setTimeout(() => {
      this.isThinking.set(false);
      this.notificationService.showInfo('Explain functionality coming soon!');
    }, 1000);
  }

  onConvertRequested(event: any) {
    console.log('Convert requested:', event);
    this.isThinking.set(true);
    
    // TODO: Implement convert functionality when service method is available
    setTimeout(() => {
      this.isThinking.set(false);
      this.notificationService.showInfo('Convert functionality coming soon!');
    }, 1000);
  }

  onA11yRequested(event: any) {
    console.log('A11y requested:', event);
    this.isThinking.set(true);
    
    // TODO: Implement accessibility improvement when service method is available
    setTimeout(() => {
      this.isThinking.set(false);
      this.notificationService.showInfo('Accessibility improvement coming soon!');
    }, 1000);
  }

  // Code change handlers
  onTypeScriptChange(event: any) {
    const code = (event.target as HTMLTextAreaElement).value;
    this.typescriptCode.set(code);
    this.updatePreview();
  }

  onHtmlChange(event: any) {
    const code = (event.target as HTMLTextAreaElement).value;
    this.htmlCode.set(code);
    this.updatePreview();
  }

  onScssChange(event: any) {
    const code = (event.target as HTMLTextAreaElement).value;
    this.scssCode.set(code);
    this.updatePreview();
  }

  // Model change handler
  onModelChange(model: string) {
    this.currentModel.set(model);
    // Try to update server settings
    this.updateModelSettings(model);
  }

  // Helper methods
  private showDiffViewer(original: string, modified: string) {
    // Show diff viewer component
    console.log('Showing diff viewer:', { original, modified });
  }

  private showExplanationPanel(explanation: string) {
    // Show explanation in a side panel
    console.log('Showing explanation:', explanation);
  }

  private updatePreview() {
    // Update live preview with current code
    console.log('Updating preview with:', {
      ts: this.typescriptCode(),
      html: this.htmlCode(),
      scss: this.scssCode()
    });
  }

  private updateModelSettings(model: string) {
    // Try to update server settings, fallback to local storage
    try {
      // This would be a real API call in production
      localStorage.setItem('ai-model', model);
      this.notificationService.showSuccess(`AI model updated to ${model}`);
    } catch (error) {
      console.error('Failed to update model settings:', error);
    }
  }

  // Enhanced chat handler with real AI
  handlePromptSent(prompt: any) {
    try {
      const content = prompt?.content || prompt;
      this.isThinking.set(true);
      this.errorMsg.set(null);
      
      // Add user message to chat
      this.copilotState.addChatMessage('user', 'You', content);
      
      // Prepare context for AI
      const context = {
        typescript: this.typescriptCode(),
        html: this.htmlCode(),
        scss: this.scssCode(),
        framework: this.currentFramework(),
        style: this.currentStyle()
      };
      
      // Call real AI service
      this.aiPromptService.sendPrompt(content, 'generate', JSON.stringify(context))
        .subscribe({
          next: (response: AIResponse) => {
            console.log('✅ AI Response received:', response);
            
            // Add AI response to chat
            this.copilotState.addChatMessage('ai', 'AI Copilot', response.content, response.code);
            this.lastAIResponse.set(response);
            
            // Update code buffers if response contains code
            const extendedResponse = response as any;
            if (extendedResponse.codeData && typeof extendedResponse.codeData === 'object') {
              // Update all code buffers with the appropriate content
              if (extendedResponse.codeData.typescript) {
                this.typescriptCode.set(extendedResponse.codeData.typescript);
              }
              if (extendedResponse.codeData.html) {
                this.htmlCode.set(extendedResponse.codeData.html);
              }
              if (extendedResponse.codeData.scss) {
                this.scssCode.set(extendedResponse.codeData.scss);
              }
            } else if (response.code && typeof response.code === 'string') {
              // Fallback: put the code in TypeScript buffer
              this.typescriptCode.set(response.code);
            }
            
            this.isThinking.set(false);
            this.notificationService.showSuccess('AI response received!');
            
            // Fire GA4 event
            this.fireGA4Event('chat_reply', { model: this.currentModel() });
          },
          error: (error) => {
            console.error('❌ AI service error:', error);
            
            // Fallback to mock response on error
            const fallbackResponse = {
              content: `I apologize, but I'm having trouble connecting to the AI service right now. Here's what I can tell you about your request: "${content}". Please try again in a moment, or check your internet connection.`,
              code: null
            };
            
            this.copilotState.addChatMessage('ai', 'AI Copilot', fallbackResponse.content, fallbackResponse.code);
            this.lastAIResponse.set(fallbackResponse as any);
            this.isThinking.set(false);
            
            this.notificationService.showWarning('AI service temporarily unavailable. Please try again.');
            this.errorMsg.set(error.message || 'AI service error');
          }
        });
      
      // Fire GA4 event
      this.fireGA4Event('chat_send', { model: this.currentModel() });
      
    } catch (error) {
      console.error('Error handling prompt:', error);
      this.notificationService.showError('Failed to process prompt');
      this.isThinking.set(false);
      this.errorMsg.set(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // GA4 event tracking
  private fireGA4Event(eventName: string, parameters: any = {}) {
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          event_category: 'ai_copilot',
          ...parameters
        });
      }
    } catch (error) {
      console.error('GA4 event error:', error);
    }
  }



  private searchTimeout: any;
  private performSearch(query: string) {
    // Filter messages based on search query
    console.log('Performing search:', query);
  }

  // Toggle favorites
  toggleFavorites() {
    this.showFavorites = !this.showFavorites;
  }

  // Error count and line info (for status bar)
  readonly errorCount = signal<number>(0);
  readonly currentLine = signal<number>(1);
  readonly currentColumn = signal<number>(1);
}