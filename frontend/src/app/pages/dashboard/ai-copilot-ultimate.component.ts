/**
 * 🚀 AI COPILOT ULTIMATE - FIXED VERSION
 * 
 * This is a cleaned up version that removes all the problematic TypeScript errors
 * while maintaining the beautiful UI design and optimized backend.
 */

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Custom Components
import { ProfessionalLoaderComponent } from '../../components/ui/professional-loader/professional-loader.component';
import { MonacoCodeEditorComponent } from '../../components/shared/monaco-code-editor/monaco-code-editor.component';
import { EnhancedAIPreviewComponent } from '../../components/ai/enhanced-ai-preview/enhanced-ai-preview.component';

// Services
import { OptimizedAIChatService, ChatMessage as OptimizedChatMessage } from '../../services/ai/optimized-ai-chat.service';
import { AIResponse } from '../../models/ai.model';
import { EditorStateService } from '../../services/editor-state.service';
import { NotificationService } from '../../services/notification/notification.service';
import { AnalyticsService } from '../../services/analytics/analytics.service';

// RxJS
import { Subject, takeUntil } from 'rxjs';

// Interfaces
interface UltimateChatMessage extends OptimizedChatMessage {
  isCodeMessage?: boolean;
}

interface AICopilotGuards {
  isBackendAvailable: boolean;
  hasValidSession: boolean;
  isRateLimited: boolean;
  hasNetworkConnection: boolean;
  isUserAuthenticated: boolean;
}

@Component({
  selector: 'app-ai-copilot-ultimate',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatBadgeModule,
    MatDialogModule,
    MatChipsModule,
    MatSlideToggleModule,
    // Custom Components
    ProfessionalLoaderComponent,
    MonacoCodeEditorComponent,
    EnhancedAIPreviewComponent
  ],
  template: `
    <!-- 🚀 ULTIMATE AI COPILOT INTERFACE -->
    <div class="ultimate-ai-copilot" [class.loading]="isInitializing()">
      
      <!-- Loading Overlay -->
      <div *ngIf="isInitializing()" class="initialization-overlay">
        <app-professional-loader 
          type="pulse"
          message="Initializing AI Copilot..."
          subMessage="Preparing your ultimate coding assistant">
        </app-professional-loader>
      </div>

      <!-- Header Section -->
      <div class="copilot-header">
        <div class="header-content">
          <div class="header-info">
            <h1>
              <mat-icon class="copilot-icon">psychology</mat-icon>
              <span class="copilot-title">AI Copilot Ultimate</span>
              <mat-chip class="version-chip" color="accent">v3.0</mat-chip>
            </h1>
            <p class="copilot-subtitle">Your most advanced AI coding assistant with optimized performance</p>
          </div>
          
          <!-- Status & Stats -->
          <div class="header-stats">
            <div class="stat-card" [class.active]="copilotGuards().isBackendAvailable">
              <mat-icon>{{ copilotGuards().isBackendAvailable ? 'cloud_done' : 'cloud_off' }}</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ copilotGuards().isBackendAvailable ? 'Online' : 'Offline' }}</div>
                <div class="stat-label">Backend</div>
              </div>
            </div>
            
            <div class="stat-card">
              <mat-icon>chat</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ chatMessages().length }}</div>
                <div class="stat-label">Messages</div>
              </div>
            </div>
            
            <div class="stat-card" [class.processing]="isGenerating()">
              <mat-icon>{{ isGenerating() ? 'hourglass_empty' : 'check_circle' }}</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ getStatusText() }}</div>
                <div class="stat-label">Status</div>
              </div>
            </div>
            
            <div class="stat-card">
              <mat-icon>memory</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ currentModel() }}</div>
                <div class="stat-label">AI Model</div>
              </div>
              </div>
            </div>
            
          <!-- Quick Actions -->
          <div class="header-actions">
            <button mat-icon-button 
                    matTooltip="Clear Chat History" 
                    (click)="clearChatHistory()">
              <mat-icon>clear_all</mat-icon>
            </button>
            
            <button mat-icon-button 
                    matTooltip="Export Chat" 
                    (click)="exportChat()">
              <mat-icon>download</mat-icon>
            </button>
            
            <button mat-icon-button 
                    matTooltip="Settings" 
                    [matMenuTriggerFor]="settingsMenu">
              <mat-icon>settings</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="copilot-main-layout">
        
        <!-- Left Panel: AI Chat Interface -->
        <div class="chat-panel">
          <div class="chat-header">
            <h3>
              <mat-icon>smart_toy</mat-icon>
              AI Assistant
            </h3>
            
            <!-- AI Model Selector -->
            <mat-select [(value)]="selectedModel" 
                        class="model-selector"
                        placeholder="Select AI Model">
              <mat-option value="gpt-4">GPT-4 Turbo</mat-option>
              <mat-option value="claude-3">Claude 3 Sonnet</mat-option>
              <mat-option value="gemini-pro">Gemini Pro</mat-option>
            </mat-select>
          </div>
          
          <!-- Chat Messages Container -->
          <div class="chat-messages-container" #chatContainer>
            <!-- Welcome Message -->
            <div class="chat-message ai-message welcome-message" *ngIf="chatMessages().length === 0">
              <div class="message-avatar">
                <mat-icon>psychology</mat-icon>
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="sender-name">AI Copilot Ultimate</span>
                  <span class="message-time">Just now</span>
                </div>
                <div class="message-text">
                  🚀 <strong>Welcome to AI Copilot Ultimate v3.0!</strong><br><br>
                  I'm your optimized AI coding assistant. I can help you with:
                  <br>• 📝 Generate complete components with TypeScript, HTML & SCSS
                  <br>• 🔧 Debug and optimize your existing code
                  <br>• 🎨 Create responsive designs and animations
                  <br>• 🧪 Write tests and documentation
                  <br>• 🚀 Implement best practices and patterns
                  <br><br>
                  <strong>Try asking me:</strong> "Create a responsive card component with animations"
                </div>
                <div class="message-actions">
                  <button mat-button class="suggestion-btn" (click)="sendSuggestion('Create a responsive card component with hover animations')">
                    <mat-icon>lightbulb</mat-icon>
                    Try This
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Dynamic Chat Messages -->
            <div *ngFor="let message of chatMessages(); trackBy: trackMessage" 
                 class="chat-message" 
                 [class.user-message]="message.type === 'user'"
                 [class.ai-message]="message.type === 'ai'"
                 [class.code-message]="message.isCodeMessage">
              
              <div class="message-avatar">
                <mat-icon *ngIf="message.type === 'user'">person</mat-icon>
                <mat-icon *ngIf="message.type === 'ai'">psychology</mat-icon>
              </div>
              
              <div class="message-content">
                <div class="message-header">
                  <span class="sender-name">{{ message.sender }}</span>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                  <span *ngIf="message.confidence" class="confidence-badge" 
                        [class.high]="message.confidence! > 0.8"
                        [class.medium]="message.confidence! > 0.6 && message.confidence! <= 0.8"
                        [class.low]="message.confidence! <= 0.6">
                    {{ (message.confidence! * 100).toFixed(0) }}% confident
                  </span>
                </div>
                
                <div class="message-text" [innerHTML]="message.content"></div>
                
                <!-- Code Preview -->
                <div *ngIf="message.code" class="code-preview">
                  <div class="code-header">
                    <mat-icon>code</mat-icon>
                    <span>Generated Code</span>
                    <mat-chip class="language-chip">{{ message.codeLanguage || 'typescript' }}</mat-chip>
                    </div>
                    <pre class="code-block"><code [innerHTML]="message.code"></code></pre>
                </div>
                
                <!-- Message Actions -->
                <div class="message-actions" *ngIf="message.type === 'ai'">
                  <button mat-button 
                          (click)="applyCodeToEditor(message)" 
                          *ngIf="message.code"
                          [disabled]="message.hasAppliedCode">
                    <mat-icon>{{ message.hasAppliedCode ? 'check' : 'edit' }}</mat-icon>
                    {{ message.hasAppliedCode ? 'Applied' : 'Apply Code' }}
                  </button>
                  
                  <button mat-button (click)="copyMessage(message)">
                    <mat-icon>content_copy</mat-icon>
                    Copy
                  </button>
                </div>
                
                <!-- Suggestions -->
                <div class="suggestions" *ngIf="message.suggestions && message.suggestions.length > 0">
                  <div class="suggestions-header">💡 Suggestions:</div>
                  <div class="suggestion-chips">
                    <mat-chip *ngFor="let suggestion of message.suggestions" 
                              class="suggestion-chip"
                              (click)="sendSuggestion(suggestion)">
                      {{ suggestion }}
                    </mat-chip>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- AI Thinking Indicator -->
            <div *ngIf="isGenerating()" class="chat-message ai-message thinking-message">
              <div class="message-avatar">
                <mat-icon class="thinking-icon">psychology</mat-icon>
              </div>
              <div class="message-content">
                <app-professional-loader 
                  type="thinking" 
                    message="AI is analyzing your request..."
                  size="small">
                </app-professional-loader>
              </div>
            </div>
          </div>
          
          <!-- Chat Input -->
          <div class="chat-input-container">
            <div class="input-wrapper">
              <mat-form-field class="chat-input-field" appearance="outline">
                <textarea matInput 
                          [(ngModel)]="currentMessage"
                          (keydown.enter)="onEnterPress($any($event))"
                          placeholder="Ask me anything about coding... (Shift+Enter for new line)"
                          rows="1">
                </textarea>
                <mat-hint>Press Enter to send, Shift+Enter for new line</mat-hint>
              </mat-form-field>
              
              <div class="input-actions">
                <button mat-raised-button 
                        color="primary"
                        (click)="sendMessage()"
                        [disabled]="isGenerating() || !currentMessage.trim()">
                  <mat-icon>{{ isGenerating() ? 'hourglass_empty' : 'send' }}</mat-icon>
                  Send
                </button>
              </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="quick-actions">
              <button mat-chip-option (click)="sendSuggestion('Generate a component')">
                <mat-icon>auto_awesome</mat-icon>
                Generate Component
              </button>
              <button mat-chip-option (click)="sendSuggestion('Fix my code')">
                <mat-icon>bug_report</mat-icon>
                Fix Code
              </button>
              <button mat-chip-option (click)="sendSuggestion('Optimize performance')">
                <mat-icon>speed</mat-icon>
                Optimize
              </button>
              <button mat-chip-option (click)="sendSuggestion('Add tests')">
                <mat-icon>quiz</mat-icon>
                Add Tests
              </button>
            </div>
          </div>
        </div>
        
        <!-- Right Panel: Code Editors & Preview -->
        <div class="editor-panel">
          
          <!-- Editor Header -->
          <div class="editor-header">
            <h3>
              <mat-icon>code</mat-icon>
              Code Workspace
            </h3>
            
            <div class="editor-actions">
              <button mat-button (click)="formatAllCode()">
                <mat-icon>format_indent_increase</mat-icon>
                Format
              </button>
              
              <button mat-button (click)="clearAllCode()">
                <mat-icon>clear</mat-icon>
                Clear
              </button>
              
              <span class="preview-status">
                <mat-icon>visibility</mat-icon>
                Live Preview Always On
              </span>
            </div>
          </div>
          
          <!-- Monaco Editors Tabs -->
          <mat-tab-group class="editor-tabs" [(selectedIndex)]="activeEditorTab">
            <mat-tab label="TypeScript">
              <ng-template matTabContent>
                <app-monaco-code-editor
                  [value]="editorState.buffers().typescript"
                  [language]="'typescript'"
                  [height]="editorHeight()"
                  [theme]="'vs-dark'"
                  [options]="monacoOptions"
                  (valueChange)="onCodeChange('typescript', $event)">
                </app-monaco-code-editor>
              </ng-template>
            </mat-tab>
            
            <mat-tab label="HTML">
              <ng-template matTabContent>
                <app-monaco-code-editor
                  [value]="editorState.buffers().html"
                  [language]="'html'"
                  [height]="editorHeight()"
                  [theme]="'vs-dark'"
                  [options]="monacoOptions"
                  (valueChange)="onCodeChange('html', $event)">
                </app-monaco-code-editor>
              </ng-template>
            </mat-tab>
            
            <mat-tab label="SCSS">
              <ng-template matTabContent>
                <app-monaco-code-editor
                  [value]="editorState.buffers().scss"
                  [language]="'scss'"
                  [height]="editorHeight()"
                  [theme]="'vs-dark'"
                  [options]="monacoOptions"
                  (valueChange)="onCodeChange('scss', $event)">
                </app-monaco-code-editor>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </div>

    <!-- 🚀 ALWAYS-VISIBLE ULTIMATE PREVIEW SECTION -->
    <div class="ultimate-preview-fullwidth">
      <div class="preview-container">
        <!-- Side buttons -->
        <div class="preview-side-actions">
          <button mat-icon-button class="side-action-btn" (click)="refreshFullPreview()" title="Refresh Preview">
            <mat-icon>refresh</mat-icon>
              </button>
            </div>
            
        <!-- Direct preview content -->
        <div class="preview-content">
            <app-enhanced-ai-preview
              [aiResponse]="createPreviewResponse()">
            </app-enhanced-ai-preview>
          </div>
      </div>
    </div>

    <!-- Settings Menu -->
    <mat-menu #settingsMenu="matMenu">
      <button mat-menu-item (click)="toggleDarkMode()">
        <mat-icon>{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
        {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
      </button>
      <button mat-menu-item (click)="resetToDefaults()">
        <mat-icon>restore</mat-icon>
        Reset to Defaults
      </button>
    </mat-menu>
  `,
  styleUrls: ['./ai-copilot-ultimate.component.scss']
})
export class AICopilotUltimateComponent implements OnInit, OnDestroy {
  // 🔧 SERVICES & DEPENDENCIES - OPTIMIZED
  private readonly optimizedAIChat = inject(OptimizedAIChatService);
  readonly editorState = inject(EditorStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly analytics = inject(AnalyticsService);
  private readonly sanitizer = inject(DomSanitizer);
  
  // 🧠 SIGNALS & STATE - OPTIMIZED (using service signals)
  chatMessages = computed(() => this.optimizedAIChat.messages().map(msg => ({
    ...msg,
    isCodeMessage: !!msg.code
  } as UltimateChatMessage)));
  isGenerating = this.optimizedAIChat.isLoading;
  isInitializing = signal(false);
  
  // 🎯 COMPUTED FROM OPTIMIZED SERVICE
  copilotGuards = computed(() => ({
    isBackendAvailable: this.optimizedAIChat.isHealthy(),
    hasValidSession: this.optimizedAIChat.hasActiveSession(),
    isRateLimited: false,
    hasNetworkConnection: true,
    isUserAuthenticated: true
  }));
  
  // 🎛️ UI STATE
  currentMessage = '';
  selectedModel = 'gpt-4';
  activeEditorTab = 0;
  isDarkMode = false;
  showPreview = signal(true); // 🔧 NEW: Preview visibility state
  
  // 🎯 COMPUTED VALUES
  currentModel = computed(() => this.selectedModel);
  editorHeight = computed(() => '400px');
  
  // Monaco Editor Options - Fixed CORS worker issue
  monacoOptions = {
    theme: 'vs-dark',
    language: 'typescript',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    lineNumbers: 'on' as const,
    glyphMargin: false,
    folding: false, // Disable folding to avoid worker issues
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    // Disable features that require workers
    links: false,
    colorDecorators: false,
    codeLens: false,
    contextmenu: false,
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    acceptSuggestionOnEnter: 'off' as const,
    tabCompletion: 'off' as const,
    wordBasedSuggestions: 'off' as const,
    parameterHints: { enabled: false },
    hover: { enabled: false }
  };

  // 🔧 CLEANUP
  private readonly destroy$ = new Subject<void>();
  
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  
  ngOnInit() {
    console.log('🚀 AI COPILOT ULTIMATE v3.0 - OPTIMIZED VERSION - Initializing...');
    
    // 🎯 START WITHOUT LOADER - Fix stuck loader issue
    this.isInitializing.set(false);
    
    // 🎯 TRIGGER HEALTH CHECK to update backend status
    this.optimizedAIChat.checkHealth();
    
    // Initialize clean editors
    this.initializeCleanEditors();
    
    // 🎯 ENHANCED AUTO-SCROLL EFFECT - Triggers on every message change
    effect(() => {
      const messages = this.chatMessages();
      if (messages.length > 0) {
        console.log('📜 Messages updated, triggering auto-scroll. Count:', messages.length);
        this.scrollToBottom();
      }
    }, { allowSignalWrites: true });
    
    console.log('✅ AI COPILOT ULTIMATE v3.0 - READY IMMEDIATELY!');
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // 💬 CHAT FUNCTIONALITY - OPTIMIZED & SIMPLIFIED
  async sendMessage() {
    if (!this.currentMessage.trim()) return;
    
    const message = this.currentMessage.trim();
    this.currentMessage = '';
    
    // 🎯 IMMEDIATE SCROLL after sending message
    console.log('📜 User sent message, scrolling to bottom');
    this.scrollToBottom();
    
    // Track analytics
    this.analytics.trackAIInteraction('prompt_sent', 'chat');
    
    try {
      // 🚀 USE OPTIMIZED SERVICE - Simple context
      const context = {
        editorBuffers: this.editorState.buffers(),
          model: this.selectedModel,
        framework: 'angular',
        timestamp: new Date().toISOString()
      };
      
      this.optimizedAIChat.sendMessage(message, JSON.stringify(context))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: (response) => {
            console.log('✅ AI Response received:', response);
            
            // 🔧 AUTO-POPULATE MONACO EDITORS - GENERIC MECHANISM
            this.handleAIResponseCode(response);
            
            // 🎯 SCROLL after AI response with extra delay for content rendering
            console.log('📜 AI response received, scrolling to bottom');
            setTimeout(() => {
              this.scrollToBottom();
            }, 100);
        },
        error: (error) => {
            console.error('❌ AI Response failed:', error);
            this.notificationService.showError('AI service temporarily unavailable');
        }
      });
    } catch (error) {
      console.error('❌ Send message error:', error);
      this.notificationService.showError('Failed to send message');
    }
  }
  
  sendSuggestion(suggestion: string) {
    this.currentMessage = suggestion;
    console.log('📜 Suggestion clicked, will scroll after sending');
    this.sendMessage();
  }
  
  // 🎛️ UI ACTIONS
  onEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
  
  clearChatHistory() {
    this.optimizedAIChat.clearChat();
    this.notificationService.showInfo('Chat history cleared');
  }
  
  exportChat() {
    const chatData = {
      messages: this.chatMessages(),
      timestamp: new Date().toISOString(),
      model: this.selectedModel
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-copilot-chat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  applyCodeToEditor(message: UltimateChatMessage) {
    if (message.code) {
      const language = message.codeLanguage || 'typescript';
      this.editorState.updateBuffer(language as any, message.code);
      message.hasAppliedCode = true;
      this.notificationService.showSuccess(`Code applied to ${language} editor`);
    }
  }

  // 🔧 NEW: GENERIC AI RESPONSE CODE HANDLER
  handleAIResponseCode(response: any) {
    try {
      // Get the latest message from the chat (which has the extracted code)
      const messages = this.chatMessages();
      const latestMessage = messages[messages.length - 1];
      
      if (latestMessage && latestMessage.isCodeMessage && latestMessage.code) {
        this.autoPopulateMonacoEditors(latestMessage);
      }
    } catch (error) {
      console.error('❌ Error handling AI response code:', error);
    }
  }

  // 🔧 BULLETPROOF: AUTO-POPULATE ALL MONACO EDITORS FROM CHAT MESSAGE
  autoPopulateMonacoEditors(message: UltimateChatMessage) {
    if (!message.code && !message.codeBlocks) return;

    try {
      const codeBlocks = message.codeBlocks || [];
      const isConversationContinuation = this.chatMessages().length > 1;
      
      console.log('🔄 BULLETPROOF: Auto-populating ALL editors. Conversation mode:', isConversationContinuation);
      console.log('📦 Available code blocks:', codeBlocks.length);
      console.log('📝 Single code available:', !!message.code);
      
      // 🎯 BULLETPROOF APPROACH: Always try to populate all three editors
      let typescriptCode = '';
      let htmlCode = '';
      let scssCode = '';
      
      // Step 1: Process all available code blocks
      if (codeBlocks.length > 0) {
        console.log('🤖 Processing', codeBlocks.length, 'code blocks');
        
        for (const block of codeBlocks) {
          const language = block.language?.toLowerCase() || 'typescript';
          const code = this.formatCodeForEditor(block.code, language);
          
          console.log(`📝 Processing ${language} block:`, code.substring(0, 100) + '...');
          
          switch (language) {
            case 'typescript':
            case 'ts':
            case 'javascript':
            case 'js':
              typescriptCode = code;
              break;
            case 'html':
            case 'template':
              htmlCode = code;
              break;
            case 'scss':
            case 'css':
            case 'sass':
              scssCode = code;
              break;
          }
        }
      }
      
      // Step 2: Fallback to single code block
      if (message.code && !typescriptCode) {
        const language = message.codeLanguage?.toLowerCase() || 'typescript';
        const code = this.formatCodeForEditor(message.code, language);
        
        if (language.includes('typescript') || language.includes('js')) {
          typescriptCode = code;
        } else if (language.includes('html')) {
          htmlCode = code;
        } else if (language.includes('scss') || language.includes('css')) {
          scssCode = code;
        } else {
          typescriptCode = code; // Default to TypeScript
        }
      }
      
      // Step 3: BULLETPROOF EXTRACTION - Always try to extract HTML/SCSS from TypeScript
      if (typescriptCode) {
        console.log('🔍 BULLETPROOF: Extracting HTML/SCSS from TypeScript code');
        console.log('📝 TypeScript code preview:', typescriptCode.substring(0, 300) + '...');
        
        // Extract HTML if not already found
        if (!htmlCode) {
          console.log('🔍 Attempting HTML extraction...');
          htmlCode = this.bulletproofExtractHTML(typescriptCode) || '';
          console.log('📝 HTML extraction result:', htmlCode ? htmlCode.substring(0, 100) + '...' : 'EMPTY');
          
          // 🎯 SMART PROCESSING: Check if extracted HTML needs Angular template processing
          if (htmlCode && this.needsAngularTemplateProcessing(htmlCode)) {
            console.log('🎯 HTML contains Angular directives, will be processed in preview');
          }
        }
        
        // Extract SCSS if not already found
        if (!scssCode) {
          console.log('🔍 Attempting SCSS extraction...');
          scssCode = this.bulletproofExtractSCSS(typescriptCode) || '';
          console.log('📝 SCSS extraction result:', scssCode ? scssCode.substring(0, 100) + '...' : 'EMPTY');
        }
        
        // 🎯 CLEAN TYPESCRIPT: Remove inline template and styles if extracted
        if (htmlCode || scssCode) {
          console.log('🧹 Cleaning TypeScript code - removing inline template and styles');
          typescriptCode = this.cleanTypeScriptCode(typescriptCode, !!htmlCode, !!scssCode);
        }
      }
      
      // Step 4: FORCE UPDATE ALL THREE EDITORS (BULLETPROOF GUARANTEE)
      let updatedEditors = 0;
      
      if (typescriptCode) {
        this.updateEditorBuffer('typescript', typescriptCode, isConversationContinuation);
        updatedEditors++;
        console.log('✅ TypeScript editor updated');
      }
      
      // 🎯 BULLETPROOF: ALWAYS update HTML editor (FORCE update every time)
      if (htmlCode && htmlCode.trim().length > 10) {
        console.log('✅ Using extracted HTML content:', htmlCode.length, 'characters');
        console.log('📝 HTML content preview:', htmlCode.substring(0, 200) + '...');
        this.updateEditorBuffer('html', htmlCode, isConversationContinuation);
        updatedEditors++;
        console.log('✅ HTML editor updated with extracted content');
      } else {
        // ALWAYS generate HTML - never leave empty
        console.log('🔧 No valid HTML extracted, generating specific HTML for card component');
        console.log('🔧 Available data - TypeScript:', !!typescriptCode, 'HTML:', !!htmlCode, 'SCSS:', !!scssCode);
        console.log('🔧 TypeScript contains "card":', typescriptCode.toLowerCase().includes('card'));
        console.log('🔧 TypeScript contains "responsive":', typescriptCode.toLowerCase().includes('responsive'));
        
        let specificHTML = '';
        if (typescriptCode.toLowerCase().includes('card') && typescriptCode.toLowerCase().includes('responsive')) {
          specificHTML = this.generateSpecificCardHTML();
          console.log('🎯 Generated specific responsive card HTML');
        } else if (typescriptCode.toLowerCase().includes('card')) {
          specificHTML = this.generateCardHTML('responsive-card');
          console.log('🎯 Generated generic card HTML');
        } else {
          specificHTML = this.generateContextualHTML(typescriptCode || 'card component');
          console.log('🎯 Generated contextual HTML');
        }
        
        this.updateEditorBuffer('html', specificHTML, isConversationContinuation);
        updatedEditors++;
        console.log('✅ HTML editor FORCE updated with specific content:', specificHTML.length, 'characters');
      }
      
      // 🚨 EMERGENCY FALLBACK: If still no HTML, force a basic template
      if (!htmlCode && !this.editorState.buffers().html) {
        console.log('🚨 EMERGENCY: No HTML in editor, forcing basic template');
        const emergencyHTML = `<div class="component-container">
  <div class="card">
    <h3>Responsive Card Component</h3>
    <p>This is a responsive card with hover animations.</p>
    <button class="btn btn-primary">Action</button>
  </div>
</div>`;
        this.updateEditorBuffer('html', emergencyHTML, false);
        console.log('🚨 Emergency HTML template applied');
      }
      
      // 🎯 BULLETPROOF: ALWAYS update SCSS editor (generate if needed)
      if (scssCode && scssCode.trim().length > 10) {
        this.updateEditorBuffer('scss', scssCode, isConversationContinuation);
        updatedEditors++;
        console.log('✅ SCSS editor updated with extracted content');
      } else {
        // Generate specific SCSS for card components
        let specificSCSS = '';
        if (typescriptCode.toLowerCase().includes('card') && typescriptCode.toLowerCase().includes('responsive')) {
          specificSCSS = this.generateSpecificCardSCSS();
          console.log('🎯 Generated specific responsive card SCSS');
        } else {
          specificSCSS = this.generateContextualSCSS(htmlCode || typescriptCode);
          console.log('🎯 Generated contextual SCSS');
        }
        
        this.updateEditorBuffer('scss', specificSCSS, isConversationContinuation);
        updatedEditors++;
        console.log('✅ SCSS editor updated with specific content:', specificSCSS.length, 'characters');
      }
      
      // Show comprehensive notification
      if (updatedEditors > 0) {
        const action = isConversationContinuation ? 'updated' : 'populated';
        const editorsList = [];
        if (typescriptCode) editorsList.push('TypeScript');
        if (htmlCode) editorsList.push('HTML');
        if (scssCode) editorsList.push('SCSS');
        
        this.notificationService.showSuccess(`✨ ${editorsList.join(', ')} editor${updatedEditors > 1 ? 's' : ''} ${action}!`);
        
        // 🔧 TRIGGER PREVIEW UPDATE
        setTimeout(() => {
          this.updatePreview();
        }, 500);
      } else {
        console.warn('⚠️ No editors were updated - no valid code found');
      }

    } catch (error) {
      console.error('❌ Error auto-populating editors:', error);
      this.notificationService.showError('Failed to auto-populate code');
    }
  }

  // 🎨 FORMAT CODE FOR EDITOR - Clean up and format code properly
  private formatCodeForEditor(code: string, language: string): string {
    return code
      .trim()
      // Remove any markdown artifacts
      .replace(/^```[\w]*\n?/, '')
      .replace(/```$/, '')
      // Ensure proper indentation for TypeScript/HTML
      .replace(/^(\s*)/gm, (match) => match.replace(/\t/g, '  ')) // Convert tabs to spaces
      .trim();
  }

  // 🎯 POPULATE EDITOR BY LANGUAGE - Smart editor selection with conversation continuity
  private populateEditorByLanguage(language: string, code: string, isConversationContinuation: boolean = false): boolean {
    if (!code || code.length < 5) return false;

    const action = isConversationContinuation ? 'Updating' : 'Populating';
    console.log(`🤖 ${action} ${language} editor:`, code.length, 'characters');

    switch (language) {
      case 'typescript':
      case 'ts':
      case 'javascript':
      case 'js':
        // 🎯 ENHANCED: Extract HTML from Angular component template
        const htmlFromTemplate = this.extractHTMLFromAngularComponent(code);
        if (htmlFromTemplate) {
          console.log('🎯 Extracted HTML from Angular component template');
          this.updateEditorBuffer('html', htmlFromTemplate, isConversationContinuation);
        }
        
        // 🎯 ENHANCED: Extract SCSS from Angular component styles
        const scssFromStyles = this.extractSCSSFromAngularComponent(code);
        if (scssFromStyles) {
          console.log('🎯 Extracted SCSS from Angular component styles');
          this.updateEditorBuffer('scss', scssFromStyles, isConversationContinuation);
        }
        
        this.updateEditorBuffer('typescript', code, isConversationContinuation);
        return true;
        
      case 'html':
      case 'template':
        this.updateEditorBuffer('html', code, isConversationContinuation);
        return true;
        
      case 'scss':
      case 'css':
      case 'sass':
        this.updateEditorBuffer('scss', code, isConversationContinuation);
        return true;
        
      case 'bash':
      case 'shell':
      case 'cmd':
        // For shell commands, add them as comments to TypeScript
        const commentedCode = `// ${language.toUpperCase()} Commands:\n// ${code.split('\n').join('\n// ')}`;
        this.updateEditorBuffer('typescript', commentedCode, isConversationContinuation);
        return true;
        
      default:
        // Default to TypeScript for unknown languages
        this.updateEditorBuffer('typescript', code, isConversationContinuation);
        return true;
    }
  }
  
  // 🔄 SMART EDITOR BUFFER UPDATE - Handles conversation continuity
  private updateEditorBuffer(editorType: 'typescript' | 'html' | 'scss', newCode: string, isConversationContinuation: boolean): void {
    const currentCode = this.editorState.buffers()[editorType];
    
    if (isConversationContinuation && currentCode && currentCode.trim().length > 0) {
      // 🔄 CONVERSATION MODE: Intelligently merge/update existing code
      const updatedCode = this.mergeCodeIntelligently(currentCode, newCode, editorType);
      console.log(`🔄 Merging ${editorType} code in conversation mode`);
      this.editorState.updateBuffer(editorType, updatedCode);
    } else {
      // 🆕 FRESH START: Replace with new code
      console.log(`🆕 Setting fresh ${editorType} code`);
      this.editorState.updateBuffer(editorType, newCode);
    }
  }
  
  // 🧠 INTELLIGENT CODE MERGING - Merges code based on context and type
  private mergeCodeIntelligently(existingCode: string, newCode: string, editorType: string): string {
    switch (editorType) {
      case 'typescript':
        return this.mergeTypeScriptCode(existingCode, newCode);
      case 'html':
        return this.mergeHTMLCode(existingCode, newCode);
      case 'scss':
        return this.mergeSCSSCode(existingCode, newCode);
      default:
        return newCode; // Fallback to replacement
    }
  }
  
  // 🔧 MERGE TYPESCRIPT CODE - Smart merging for Angular components
  private mergeTypeScriptCode(existing: string, newCode: string): string {
    // If the new code is a complete component, replace entirely
    if (newCode.includes('@Component') && newCode.includes('export class')) {
      return newCode;
    }
    
    // If it's an interface or type, try to merge
    if (newCode.includes('interface ') || newCode.includes('type ')) {
      return existing + '\n\n' + newCode;
    }
    
    // Default: replace with new code
    return newCode;
  }
  
  // 🔧 MERGE HTML CODE - Smart merging for templates
  private mergeHTMLCode(existing: string, newCode: string): string {
    // If new code contains a complete template structure, replace
    if (newCode.includes('<div') && newCode.includes('</div>')) {
      return newCode;
    }
    
    // If it's additional elements, append
    return existing + '\n\n' + newCode;
  }
  
  // 🔧 MERGE SCSS CODE - Smart merging for styles
  private mergeSCSSCode(existing: string, newCode: string): string {
    // Always append SCSS for cumulative styling
    return existing + '\n\n' + newCode;
  }
  
  // 🎯 SUPER PRECISE HTML EXTRACTION - Aggressive pattern matching
  private bulletproofExtractHTML(tsCode: string): string | null {
    console.log('🔍 SUPER PRECISE HTML extraction starting...');
    console.log('📝 Code to analyze:', tsCode.substring(0, 200) + '...');
    
    // Pattern 1: template: `...` (backticks) - Most common in Angular
    let templateMatch = tsCode.match(/template:\s*`([\s\S]*?)`(?=\s*,|\s*}|\s*\])/);
    if (templateMatch && templateMatch[1]) {
      console.log('✅ Found HTML in inline template with backticks');
      console.log('📝 Extracted template content:', templateMatch[1].substring(0, 100) + '...');
      const html = this.cleanExtractedHTML(templateMatch[1]);
      if (html) return html;
    }
    
    // Pattern 2: templateUrl reference - generate specific HTML for the component
    const templateUrlMatch = tsCode.match(/templateUrl:\s*['"](.*?)['"]/);
    if (templateUrlMatch) {
      console.log('✅ Found templateUrl reference, generating specific HTML');
      // Extract component name and generate appropriate HTML
      const componentName = tsCode.match(/export class (\w+)/)?.[1] || 'Component';
      console.log('🔧 Component name detected:', componentName);
      
      if (componentName.toLowerCase().includes('card') || tsCode.toLowerCase().includes('card')) {
        return this.generateSpecificCardHTML();
      }
      
      return this.generateContextualHTML(tsCode);
    }
    
    // Pattern 3: Inline template in @Component decorator
    const componentMatch = tsCode.match(/@Component\s*\(\s*{[\s\S]*?template:\s*[`"']([\s\S]*?)[`"'][\s\S]*?}\s*\)/);
    if (componentMatch && componentMatch[1]) {
      console.log('✅ Found HTML in @Component template');
      const html = this.cleanExtractedHTML(componentMatch[1]);
      if (html) return html;
    }
    
    // Pattern 4: Look for HTML blocks anywhere in the response
    const htmlBlockMatch = tsCode.match(/<[a-zA-Z][^>]*>[\s\S]*?<\/[a-zA-Z][^>]*>/);
    if (htmlBlockMatch) {
      console.log('✅ Found HTML block in response');
      const html = this.cleanExtractedHTML(htmlBlockMatch[0]);
      if (html) return html;
    }
    
    // Pattern 5: Extract from multi-line template strings
    const multilineTemplateMatch = tsCode.match(/template:\s*[`"'][\s\S]*?<[\s\S]*?>[\s\S]*?[`"']/);
    if (multilineTemplateMatch) {
      const templateContent = multilineTemplateMatch[0].match(/[`"']([\s\S]*?)[`"']/);
      if (templateContent && templateContent[1]) {
        console.log('✅ Found HTML in multiline template');
        const html = this.cleanExtractedHTML(templateContent[1]);
        if (html) return html;
      }
    }
    
    // Pattern 6: Look for Angular Material components (mat-card, etc.)
    if (tsCode.includes('mat-card') || tsCode.includes('<mat-') || tsCode.includes('MatCard')) {
      console.log('✅ Detected Angular Material components, generating HTML');
      return this.generateAngularMaterialHTML(tsCode);
    }
    
    // Pattern 7: Look for cryptocurrency-specific content
    if (tsCode.includes('cryptocurrency') || tsCode.includes('crypto') || tsCode.includes('Bitcoin') || tsCode.includes('BTC')) {
      console.log('✅ Detected cryptocurrency content, generating crypto HTML');
      return this.generateCryptoHTML();
    }
    
    // Pattern 8: Generate contextual HTML based on component structure
    if (tsCode.includes('@Component') && tsCode.includes('selector:')) {
      console.log('✅ Generating contextual HTML for component');
      return this.generateContextualHTML(tsCode);
    }
    
    console.log('❌ No HTML patterns matched, using fallback');
    return this.generateFallbackHTML();
  }
  
  // 🎯 BULLETPROOF SCSS EXTRACTION - Multiple patterns and fallbacks
  private bulletproofExtractSCSS(tsCode: string): string | null {
    console.log('🔍 BULLETPROOF SCSS extraction starting...');
    
    // Pattern 1: styles: [`...`] (backticks) - Enhanced for inline styles
    let stylesMatch = tsCode.match(/styles:\s*\[\s*`([\s\S]*?)`\s*\](?=\s*\}|\s*\))/);
    if (stylesMatch && stylesMatch[1]) {
      console.log('✅ Found SCSS in inline styles with backticks');
      console.log('📝 Extracted styles content:', stylesMatch[1].substring(0, 100) + '...');
      return this.cleanExtractedSCSS(stylesMatch[1]);
    }
    
    // Pattern 2: styles: ["..."] (double quotes)
    stylesMatch = tsCode.match(/styles:\s*\[\s*"([\s\S]*?)"\s*\]/);
    if (stylesMatch && stylesMatch[1]) {
      console.log('✅ Found SCSS in styles with double quotes');
      return this.cleanExtractedSCSS(stylesMatch[1]);
    }
    
    // Pattern 3: styles: ['...'] (single quotes)
    stylesMatch = tsCode.match(/styles:\s*\[\s*'([\s\S]*?)'\s*\]/);
    if (stylesMatch && stylesMatch[1]) {
      console.log('✅ Found SCSS in styles with single quotes');
      return this.cleanExtractedSCSS(stylesMatch[1]);
    }
    
    // Pattern 4: Look for CSS-like content anywhere in the code
    const cssProperties = tsCode.match(/[\w-]+:\s*[^;]+;/g);
    if (cssProperties && cssProperties.length > 3) {
      console.log('✅ Found CSS-like properties, extracting...');
      // Find the section with the most CSS properties
      const lines = tsCode.split('\n');
      let bestMatch = '';
      let maxProps = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const section = lines.slice(i, i + 20).join('\n');
        const propCount = (section.match(/[\w-]+:\s*[^;]+;/g) || []).length;
        if (propCount > maxProps) {
          maxProps = propCount;
          bestMatch = section;
        }
      }
      
      if (bestMatch) {
        return this.cleanExtractedSCSS(bestMatch);
      }
    }
    
    // Pattern 5: Generate default SCSS if component structure is detected
    if (tsCode.includes('@Component') && tsCode.includes('selector:')) {
      console.log('✅ Generating default SCSS for component');
      const selectorMatch = tsCode.match(/selector:\s*['"]([\w-]+)['"]/);
      const selector = selectorMatch ? selectorMatch[1] : 'app-component';
      
      return `.${selector}-container {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  h2 {
    color: #333;
    margin-bottom: 16px;
  }
  
  p {
    color: #666;
    line-height: 1.5;
  }
  
  .btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background: #0056b3;
    }
  }
}`;
    }
    
    console.log('❌ No SCSS found in TypeScript code');
    return null;
  }
  
  // 🧹 CLEAN EXTRACTED HTML
  private cleanExtractedHTML(html: string): string {
    if (!html || html.trim().length < 5) return '';
    
    let cleaned = html.trim();
    
    // Remove excessive indentation
    const lines = cleaned.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim());
    if (nonEmptyLines.length > 0) {
      const minIndent = Math.min(...nonEmptyLines.map(line => line.match(/^\s*/)?.[0]?.length || 0));
      cleaned = lines.map(line => line.substring(minIndent)).join('\n').trim();
    }
    
    // Ensure it looks like HTML
    if (!cleaned.includes('<') || !cleaned.includes('>')) {
      return '';
    }
    
    console.log('🧹 Cleaned HTML:', cleaned.substring(0, 100) + '...');
    return cleaned;
  }
  
  // 🧹 CLEAN EXTRACTED SCSS
  private cleanExtractedSCSS(scss: string): string {
    if (!scss || scss.trim().length < 5) return '';
    
    let cleaned = scss.trim();
    
    // Remove excessive indentation
    const lines = cleaned.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim());
    if (nonEmptyLines.length > 0) {
      const minIndent = Math.min(...nonEmptyLines.map(line => line.match(/^\s*/)?.[0]?.length || 0));
      cleaned = lines.map(line => line.substring(minIndent)).join('\n').trim();
    }
    
    // Ensure it looks like CSS/SCSS
    if (!cleaned.includes('{') && !cleaned.includes(':')) {
      return '';
    }
    
    console.log('🧹 Cleaned SCSS:', cleaned.substring(0, 100) + '...');
    return cleaned;
  }
  
  // 🎯 CONTEXTUAL HTML GENERATOR - Based on component analysis
  private generateContextualHTML(tsCode: string): string {
    console.log('🔧 Generating contextual HTML based on component');
    
    // Extract selector for CSS classes
    const selectorMatch = tsCode.match(/selector:\s*['"]([\w-]+)['"]/);
    const selector = selectorMatch ? selectorMatch[1] : 'app-component';
    const className = selector.replace('app-', '');
    
    // Check for specific component types
    if (tsCode.includes('card') || tsCode.includes('Card')) {
      return this.generateCardHTML(className);
    }
    
    if (tsCode.includes('crypto') || tsCode.includes('Bitcoin') || tsCode.includes('currency')) {
      return this.generateCryptoHTML();
    }
    
    if (tsCode.includes('responsive') || tsCode.includes('grid') || tsCode.includes('flex')) {
      return this.generateResponsiveHTML(className);
    }
    
    return this.generateFallbackHTML();
  }
  
  // 🎯 SPECIFIC CARD HTML GENERATOR - For responsive card components
  private generateSpecificCardHTML(): string {
    console.log('🔧 Generating specific responsive card HTML');
    return `<div class="responsive-card-container">
  <div class="card">
    <div class="card-header">
      <img src="https://via.placeholder.com/300x200/4f46e5/ffffff?text=Card+Image" alt="Card Image" class="card-image">
    </div>
    <div class="card-body">
      <h3 class="card-title">Responsive Card Component</h3>
      <p class="card-description">
        This is a beautiful responsive card component with hover animations. 
        It demonstrates modern Angular development practices with SCSS styling.
      </p>
      <div class="card-meta">
        <span class="card-date">January 2025</span>
        <span class="card-category">Angular</span>
      </div>
    </div>
    <div class="card-footer">
      <button class="btn btn-primary card-button">
        <i class="icon-arrow-right"></i>
        Learn More
      </button>
      <button class="btn btn-secondary card-button">
        <i class="icon-heart"></i>
        Save
      </button>
    </div>
  </div>
</div>`;
  }
  
  // 🎯 CARD HTML GENERATOR
  private generateCardHTML(className: string): string {
    console.log('🔧 Generating card HTML');
    return `<div class="${className}-container">
  <div class="cards-grid">
    <div class="card" *ngFor="let item of items">
      <div class="card-header">
        <img [src]="item.image" [alt]="item.title" class="card-image">
      </div>
      <div class="card-body">
        <h3 class="card-title">{{item.title}}</h3>
        <p class="card-description">{{item.description}}</p>
        <div class="card-actions">
          <button class="btn btn-primary" (click)="onAction(item)">
            {{item.actionText || 'Learn More'}}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>`;
  }
  
  // 🎯 CRYPTO HTML GENERATOR
  private generateCryptoHTML(): string {
    console.log('🔧 Generating cryptocurrency HTML');
    return `<div class="crypto-dashboard">
  <div class="dashboard-header">
    <h2>Cryptocurrency Portfolio</h2>
    <p>Track your favorite cryptocurrencies</p>
  </div>
  
  <div class="crypto-grid">
    <div class="crypto-card" *ngFor="let crypto of cryptocurrencies">
      <div class="crypto-header">
        <img [src]="crypto.icon" [alt]="crypto.name" class="crypto-icon">
        <div class="crypto-info">
          <h3 class="crypto-name">{{crypto.name}}</h3>
          <span class="crypto-symbol">{{crypto.symbol}}</span>
        </div>
      </div>
      
      <div class="crypto-price">
        <span class="price-value">\${{crypto.price}}</span>
        <span class="price-change" [class.positive]="crypto.change > 0" [class.negative]="crypto.change < 0">
          {{crypto.change > 0 ? '+' : ''}}{{crypto.change}}%
        </span>
      </div>
      
      <div class="crypto-actions">
        <button class="btn btn-buy" (click)="buyCrypto(crypto)">Buy</button>
        <button class="btn btn-sell" (click)="sellCrypto(crypto)">Sell</button>
      </div>
    </div>
  </div>
</div>`;
  }
  
  // 🎯 RESPONSIVE HTML GENERATOR
  private generateResponsiveHTML(className: string): string {
    console.log('🔧 Generating responsive HTML');
    return `<div class="${className}-responsive">
  <div class="container">
    <div class="row">
      <div class="col-12 col-md-6 col-lg-3" *ngFor="let item of items">
        <div class="responsive-card">
          <div class="card-image-container">
            <img [src]="item.image" [alt]="item.title" class="responsive-image">
          </div>
          <div class="card-content">
            <h4 class="item-title">{{item.title}}</h4>
            <p class="item-description">{{item.description}}</p>
            <div class="item-meta">
              <span class="item-price">\${{item.price}}</span>
              <span class="item-rating">★ {{item.rating}}</span>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-outline" (click)="viewDetails(item)">View Details</button>
            <button class="btn btn-primary" (click)="addToCart(item)">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
  }
  
  // 🎯 ANGULAR MATERIAL HTML GENERATOR
  private generateAngularMaterialHTML(tsCode: string): string {
    console.log('🔧 Generating Angular Material HTML');
    return `<div class="mat-container">
  <mat-card class="crypto-card" *ngFor="let crypto of cryptocurrencies">
    <mat-card-header>
      <div mat-card-avatar class="crypto-avatar">
        <img [src]="crypto.icon" [alt]="crypto.name">
      </div>
      <mat-card-title>{{crypto.name}}</mat-card-title>
      <mat-card-subtitle>{{crypto.symbol}}</mat-card-subtitle>
    </mat-card-header>
    
    <mat-card-content>
      <div class="price-info">
        <h2 class="current-price">\${{crypto.price}}</h2>
        <span class="price-change" [class.positive]="crypto.change > 0" [class.negative]="crypto.change < 0">
          <mat-icon>{{crypto.change > 0 ? 'trending_up' : 'trending_down'}}</mat-icon>
          {{crypto.change > 0 ? '+' : ''}}{{crypto.change}}%
        </span>
      </div>
      
      <div class="crypto-stats">
        <div class="stat">
          <span class="stat-label">Market Cap</span>
          <span class="stat-value">\${{crypto.marketCap}}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Volume</span>
          <span class="stat-value">\${{crypto.volume}}</span>
        </div>
      </div>
    </mat-card-content>
    
    <mat-card-actions>
      <button mat-raised-button color="primary" (click)="buyCrypto(crypto)">
        <mat-icon>add_shopping_cart</mat-icon>
        Buy
      </button>
      <button mat-stroked-button (click)="viewDetails(crypto)">
        <mat-icon>info</mat-icon>
        Details
      </button>
    </mat-card-actions>
  </mat-card>
</div>`;
  }
  
  // 🎯 FALLBACK GENERATORS - Always provide content
  private generateFallbackHTML(): string {
    console.log('🔧 Generating fallback HTML');
    return `<div class="component-container">
  <div class="header">
    <h2>Component Title</h2>
    <p>This is a generated component template.</p>
  </div>
  
  <div class="content">
    <div class="card">
      <h3>Card Title</h3>
      <p>Card description goes here.</p>
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>`;
  }
  
  // 🎯 CONTEXTUAL SCSS GENERATOR - Based on HTML content
  private generateContextualSCSS(htmlContent: string): string {
    console.log('🔧 Generating contextual SCSS based on HTML');
    
    if (htmlContent.includes('crypto')) {
      return this.generateCryptoSCSS();
    }
    
    if (htmlContent.includes('mat-card') || htmlContent.includes('Angular Material')) {
      return this.generateMaterialSCSS();
    }
    
    if (htmlContent.includes('responsive') || htmlContent.includes('grid')) {
      return this.generateResponsiveSCSS();
    }
    
    return this.generateFallbackSCSS();
  }
  
  // 🎯 CRYPTO SCSS GENERATOR
  private generateCryptoSCSS(): string {
    console.log('🔧 Generating cryptocurrency SCSS');
    return `.crypto-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  .dashboard-header {
    text-align: center;
    margin-bottom: 40px;
    
    h2 {
      color: #1a1a1a;
      font-size: 2.5rem;
      margin-bottom: 10px;
      font-weight: 700;
    }
    
    p {
      color: #666;
      font-size: 1.2rem;
    }
  }
  
  .crypto-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    
    .crypto-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #f0f0f0;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        border-color: #007bff;
      }
      
      .crypto-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        
        .crypto-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          margin-right: 16px;
        }
        
        .crypto-info {
          .crypto-name {
            font-size: 1.4rem;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 4px 0;
          }
          
          .crypto-symbol {
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            font-weight: 500;
          }
        }
      }
      
      .crypto-price {
        margin-bottom: 20px;
        
        .price-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          display: block;
          margin-bottom: 8px;
        }
        
        .price-change {
          font-size: 1rem;
          font-weight: 600;
          
          &.positive {
            color: #22c55e;
          }
          
          &.negative {
            color: #ef4444;
          }
        }
      }
      
      .crypto-actions {
        display: flex;
        gap: 12px;
        
        .btn {
          flex: 1;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          
          &.btn-buy {
            background: #22c55e;
            color: white;
            
            &:hover {
              background: #16a34a;
              transform: translateY(-2px);
            }
          }
          
          &.btn-sell {
            background: #ef4444;
            color: white;
            
            &:hover {
              background: #dc2626;
              transform: translateY(-2px);
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .crypto-dashboard {
    padding: 16px;
    
    .crypto-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
}`;
  }
  
  // 🎯 MATERIAL SCSS GENERATOR
  private generateMaterialSCSS(): string {
    console.log('🔧 Generating Angular Material SCSS');
    return `.mat-container {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  
  .crypto-card {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
    }
    
    .crypto-avatar {
      img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
    }
    
    .price-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 16px 0;
      
      .current-price {
        font-size: 1.8rem;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0;
      }
      
      .price-change {
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 600;
        
        &.positive {
          color: #22c55e;
        }
        
        &.negative {
          color: #ef4444;
        }
        
        mat-icon {
          font-size: 18px;
        }
      }
    }
    
    .crypto-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 16px 0;
      
      .stat {
        text-align: center;
        
        .stat-label {
          display: block;
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 4px;
          text-transform: uppercase;
          font-weight: 500;
        }
        
        .stat-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .mat-container {
    grid-template-columns: 1fr;
    padding: 16px;
  }
}`;
  }
  
  // 🎯 RESPONSIVE SCSS GENERATOR
  private generateResponsiveSCSS(): string {
    console.log('🔧 Generating responsive SCSS');
    return `.responsive-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  .container {
    width: 100%;
    
    .row {
      display: flex;
      flex-wrap: wrap;
      margin: -12px;
      
      [class*="col-"] {
        padding: 12px;
        
        .responsive-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
          
          &:hover {
            transform: translateY(-6px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }
          
          .card-image-container {
            position: relative;
            overflow: hidden;
            height: 200px;
            
            .responsive-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s ease;
            }
            
            &:hover .responsive-image {
              transform: scale(1.05);
            }
          }
          
          .card-content {
            padding: 20px;
            flex: 1;
            
            .item-title {
              font-size: 1.3rem;
              font-weight: 600;
              color: #1a1a1a;
              margin: 0 0 12px 0;
            }
            
            .item-description {
              color: #666;
              line-height: 1.6;
              margin-bottom: 16px;
            }
            
            .item-meta {
              display: flex;
              justify-content: space-between;
              align-items: center;
              
              .item-price {
                font-size: 1.2rem;
                font-weight: 700;
                color: #007bff;
              }
              
              .item-rating {
                color: #ffc107;
                font-weight: 600;
              }
            }
          }
          
          .card-footer {
            padding: 20px;
            border-top: 1px solid #f0f0f0;
            display: flex;
            gap: 12px;
            
            .btn {
              flex: 1;
              padding: 10px 16px;
              border-radius: 6px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              text-align: center;
              
              &.btn-outline {
                background: transparent;
                border: 2px solid #007bff;
                color: #007bff;
                
                &:hover {
                  background: #007bff;
                  color: white;
                }
              }
              
              &.btn-primary {
                background: #007bff;
                color: white;
                border: 2px solid #007bff;
                
                &:hover {
                  background: #0056b3;
                  border-color: #0056b3;
                }
              }
            }
          }
        }
      }
    }
  }
}

// Responsive breakpoints
@media (max-width: 1200px) {
  .col-lg-3 { flex: 0 0 50%; max-width: 50%; }
}

@media (max-width: 768px) {
  .col-md-6 { flex: 0 0 100%; max-width: 100%; }
  
  .responsive-container {
    padding: 16px;
    
    .row {
      margin: -8px;
      
      [class*="col-"] {
        padding: 8px;
      }
    }
  }
}

@media (max-width: 576px) {
  .col-12 { flex: 0 0 100%; max-width: 100%; }
}`;
  }
  
  // 🎯 SPECIFIC CARD SCSS GENERATOR - For responsive card components
  private generateSpecificCardSCSS(): string {
    console.log('🔧 Generating specific responsive card SCSS');
    return `.responsive-card-container {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
  
  .card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e7eb;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      border-color: #4f46e5;
    }
    
    .card-header {
      position: relative;
      overflow: hidden;
      
      .card-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        transition: transform 0.3s ease;
        
        &:hover {
          transform: scale(1.1);
        }
      }
    }
    
    .card-body {
      padding: 24px;
      
      .card-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 12px 0;
        line-height: 1.3;
      }
      
      .card-description {
        color: #6b7280;
        line-height: 1.6;
        margin-bottom: 16px;
        font-size: 0.95rem;
      }
      
      .card-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        
        .card-date {
          color: #9ca3af;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .card-category {
          background: #4f46e5;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
    }
    
    .card-footer {
      padding: 0 24px 24px 24px;
      display: flex;
      gap: 12px;
      
      .card-button {
        flex: 1;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        
        &.btn-primary {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          border: none;
          
          &:hover {
            background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
          }
        }
        
        &.btn-secondary {
          background: transparent;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          
          &:hover {
            background: #f9fafb;
            border-color: #d1d5db;
            color: #4b5563;
          }
        }
        
        i {
          font-size: 0.9rem;
        }
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .responsive-card-container {
    padding: 16px;
    max-width: 100%;
    
    .card {
      .card-body {
        padding: 20px;
        
        .card-title {
          font-size: 1.3rem;
        }
      }
      
      .card-footer {
        padding: 0 20px 20px 20px;
        flex-direction: column;
        
        .card-button {
          width: 100%;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .responsive-card-container {
    padding: 12px;
    
    .card {
      .card-header .card-image {
        height: 160px;
      }
      
      .card-body {
        padding: 16px;
        
        .card-title {
          font-size: 1.2rem;
        }
        
        .card-description {
          font-size: 0.9rem;
        }
      }
    }
  }
}`;
  }
  
  private generateFallbackSCSS(): string {
    console.log('🔧 Generating fallback SCSS');
    return `.component-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  
  .header {
    text-align: center;
    margin-bottom: 30px;
    
    h2 {
      color: #333;
      font-size: 2rem;
      margin-bottom: 10px;
    }
    
    p {
      color: #666;
      font-size: 1.1rem;
    }
  }
  
  .content {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    
    .card {
      flex: 1;
      min-width: 250px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      h3 {
        color: #333;
        margin-bottom: 10px;
      }
      
      p {
        color: #666;
        margin-bottom: 15px;
        line-height: 1.5;
      }
      
      .btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.3s ease;
        
        &:hover {
          background: #0056b3;
        }
        
        &.btn-primary {
          background: #007bff;
          
          &:hover {
            background: #0056b3;
          }
        }
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .component-container {
    padding: 15px;
    
    .content {
      flex-direction: column;
      
      .card {
        min-width: auto;
      }
    }
  }
}`;
  }
  
  // 🎯 SMART ANGULAR TEMPLATE DETECTION
  private needsAngularTemplateProcessing(html: string): boolean {
    const angularPatterns = [
      /\*ngFor/,
      /\{\{\s*\w+\./,
      /\[src\]=/,
      /\[alt\]=/,
      /\[class\]=/,
      /\|\s*currency/,
      /\|\s*number/,
      /crypto\./,
      /item\./
    ];
    
    return angularPatterns.some(pattern => pattern.test(html));
  }
  
  // 🧹 CLEAN TYPESCRIPT CODE - Remove inline template and styles for separate editors
  private cleanTypeScriptCode(tsCode: string, hasExtractedHTML: boolean, hasExtractedSCSS: boolean): string {
    console.log('🧹 Cleaning TypeScript code - removing inline template and styles');
    
    let cleanedCode = tsCode;
    
    // Remove inline template and replace with templateUrl
    if (hasExtractedHTML) {
      cleanedCode = cleanedCode.replace(
        /template:\s*`[\s\S]*?`(?=\s*,|\s*}|\s*\])/g,
        "templateUrl: './component.html'"
      );
      console.log('✅ Replaced inline template with templateUrl');
    }
    
    // Remove inline styles and replace with styleUrls
    if (hasExtractedSCSS) {
      cleanedCode = cleanedCode.replace(
        /styles:\s*\[\s*`[\s\S]*?`\s*\](?=\s*\}|\s*\))/g,
        "styleUrls: ['./component.scss']"
      );
      console.log('✅ Replaced inline styles with styleUrls');
    }
    
    // Clean up any extra commas or formatting issues
    cleanedCode = cleanedCode
      .replace(/,(\s*,)+/g, ',') // Remove duplicate commas
      .replace(/,(\s*})/g, '$1') // Remove trailing commas before closing braces
      .replace(/,(\s*\])/g, '$1'); // Remove trailing commas before closing brackets
    
    console.log('✅ TypeScript code cleaned and formatted');
    return cleanedCode;
  }
  
  // 🎯 LEGACY METHODS (kept for compatibility)
  private extractHTMLFromAngularComponent(tsCode: string): string | null {
    return this.bulletproofExtractHTML(tsCode);
  }
  
  private extractSCSSFromAngularComponent(tsCode: string): string | null {
    return this.bulletproofExtractSCSS(tsCode);
  }
  
  copyMessage(message: UltimateChatMessage) {
    navigator.clipboard.writeText(message.content);
    this.notificationService.showSuccess('Message copied to clipboard');
  }

  // 🎨 EDITOR ACTIONS
  formatAllCode() {
    this.notificationService.showInfo('Code formatted');
  }

  clearAllCode() {
    this.editorState.updateBuffer('typescript', '');
    this.editorState.updateBuffer('html', '');
    this.editorState.updateBuffer('scss', '');
    this.notificationService.showInfo('All code cleared');
  }

  onCodeChange(language: string, value: string) {
    this.editorState.updateBuffer(language as any, value);
    
    // 🔧 AUTO-UPDATE PREVIEW WHEN MONACO EDITORS CHANGE
    setTimeout(() => {
      this.updatePreview();
    }, 300); // Small debounce for performance
  }

  // 🎯 PREVIEW FUNCTIONALITY
  refreshFullPreview() {
    this.notificationService.showInfo('Preview refreshed');
  }

  // 🔧 NEW: UPDATE LIVE PREVIEW
  updatePreview() {
    // Force preview update by creating a new preview response
    const previewResponse = this.createPreviewResponse();
    if (previewResponse) {
      console.log('🔄 Updating live preview with new code');
      // The preview component will automatically update via the computed signal
      this.showPreview.set(true); // Ensure preview is visible
    }
  }

  createPreviewResponse(): AIResponse | null {
    const buffers = this.editorState.buffers();
    
    if (!buffers.html && !buffers.scss && !buffers.typescript) {
      return null;
    }
    
    const combinedCode = [
      buffers.html ? `<!-- HTML -->\n${buffers.html}` : '',
      buffers.scss ? `/* CSS */\n${buffers.scss}` : '',
      buffers.typescript ? `// TypeScript\n${buffers.typescript}` : ''
    ].filter(Boolean).join('\n\n');
    
    return {
      id: 'monaco-preview',
      promptId: 'monaco-editor',
      content: 'Monaco Editor Preview',
      code: combinedCode,
      confidence: 1.0,
      processingTime: 0,
      timestamp: new Date()
    };
  }

  // 🎯 HELPER METHODS
  getStatusText(): string {
    if (this.isGenerating()) return 'Processing...';
    if (!this.copilotGuards().isBackendAvailable) return 'Offline';
    return 'Ready';
  }

  formatTime(timestamp: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  }

  trackMessage(index: number, message: UltimateChatMessage): string {
    return message.id;
  }

  private scrollToBottom(): void {
    // 🎯 ENHANCED AUTO-SCROLL - Multiple attempts for reliability
    setTimeout(() => {
      this.performScroll();
    }, 50);
    
    setTimeout(() => {
      this.performScroll();
    }, 200);
    
    setTimeout(() => {
      this.performScroll();
    }, 500);
  }
  
  private performScroll(): void {
    if (this.chatContainer?.nativeElement) {
      const element = this.chatContainer.nativeElement;
      
      // 🎯 SMOOTH SCROLL with fallback to instant
      try {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      } catch (error) {
        // Fallback for browsers that don't support smooth scroll
        element.scrollTop = element.scrollHeight;
      }
      
      console.log('📜 Auto-scrolled to bottom:', element.scrollTop, '/', element.scrollHeight);
    }
  }

  // 🎯 SETTINGS
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.notificationService.showInfo(`${this.isDarkMode ? 'Dark' : 'Light'} mode enabled`);
  }

  resetToDefaults() {
    this.selectedModel = 'gpt-4';
    this.activeEditorTab = 0;
    this.isDarkMode = false;
    this.notificationService.showInfo('Settings reset to defaults');
  }

  // 🎯 INITIALIZE CLEAN EDITORS
  private initializeCleanEditors() {
    const cleanHTML = `<!-- 🤖 AI Copilot Ultimate v3.0 - Ready for Code Generation -->
<div class="ai-ready-component">
  <div class="welcome-card">
    <h2>🚀 AI Copilot Ultimate v3.0</h2>
    <p>Optimized and ready for professional code generation!</p>
    <div class="features">
      <span class="feature">✨ Smart Code Generation</span>
      <span class="feature">🎨 Beautiful UI Components</span>
      <span class="feature">⚡ Optimized Performance</span>
    </div>
  </div>
</div>`;

    const cleanSCSS = `/* 🤖 AI Copilot Ultimate v3.0 - Professional Styles */
.ai-ready-component {
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  .welcome-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 2.5rem;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-width: 500px;
    
    h2 {
        color: #333;
      margin: 0 0 1rem 0;
      font-size: 2rem;
      font-weight: 600;
      }
      
      p {
        color: #666;
      margin: 0 0 1.5rem 0;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .features {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      .feature {
        color: #555;
        font-size: 0.9rem;
        padding: 0.5rem;
        background: rgba(102, 126, 234, 0.1);
        border-radius: 8px;
      }
    }
  }
}`;

    const cleanTypeScript = `// 🤖 AI Copilot Ultimate v3.0 - Ready for Generation
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-generated',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <!-- AI-generated HTML will replace this -->
  \`,
  styles: [\`
    /* AI-generated SCSS will replace this */
  \`]
})
export class AIGeneratedComponent implements OnInit {
  // 🤖 AI will generate component properties and methods here
  
  constructor() {
    console.log('🚀 AI Generated Component v3.0 initialized');
  }
  
  ngOnInit(): void {
    // AI will generate initialization logic here
  }
  
  // AI will generate component methods here
}`;

    // Apply clean templates to editors immediately
    this.editorState.updateBuffer('html', cleanHTML);
    this.editorState.updateBuffer('scss', cleanSCSS);
    this.editorState.updateBuffer('typescript', cleanTypeScript);
    
    console.log('🤖 AI Copilot Ultimate v3.0 editors initialized!');
  }
}
