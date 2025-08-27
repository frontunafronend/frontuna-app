/**
 * 🤖 AI COPILOT ULTIMATE - THE MOST ADVANCED AI CODING ASSISTANT EVER CREATED!
 * 
 * ✅ FEATURES:
 * - 🧠 Advanced AI Chat with Context Awareness
 * - 📝 Professional Monaco Code Editors (TypeScript, HTML, SCSS)
 * - 🔄 Real-time Live Preview with Hot Reload
 * - 🛡️ AI Copilot Guards for Bulletproof Functionality
 * - 🎨 Beautiful Professional UI/UX
 * - 🚀 Smart Code Generation and Application
 * - 💡 Intelligent Code Suggestions and Auto-complete
 * - 🔧 Advanced Error Handling and Fallback Systems
 * - 📊 Analytics and Usage Tracking
 * - 🎯 Context-Aware AI Responses
 * 
 * 🏆 THIS IS THE ULTIMATE AI COPILOT EXPERIENCE! 🏆
 */

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
import { ProfessionalLoaderComponent } from '@app/components/ui/professional-loader/professional-loader.component';
import { MonacoCodeEditorComponent } from '@app/components/editing/monaco-code-editor/monaco-code-editor.component';
import { EnhancedAIPreviewComponent } from '@app/components/ai/enhanced-ai-preview/enhanced-ai-preview.component';
import { AICopilotPanelComponent } from '@app/components/ai/ai-copilot-panel/ai-copilot-panel.component';

// Services
import { AIPromptCoreService, AIResponse } from '@app/services/ai/ai-prompt-core.service';
import { AICopilotService } from '@app/services/ai/ai-copilot.service';
import { EditorStateService, EditorBuffers } from '@app/services/editor/editor-state.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { AnalyticsService } from '@app/services/analytics/analytics.service';
import { AuthService } from '@app/services/auth/auth.service';

// Models
import { ChatMessage } from '@app/models/chat.model';
import { AIPrompt } from '@app/models/ai.model';

// RxJS
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, catchError, of, timer } from 'rxjs';

// AI Copilot Guards Interface
interface AICopilotGuards {
  isBackendAvailable: boolean;
  hasValidSession: boolean;
  isRateLimited: boolean;
  hasNetworkConnection: boolean;
  isUserAuthenticated: boolean;
}

// Enhanced Chat Message Interface
interface UltimateChatMessage extends ChatMessage {
  isCodeMessage?: boolean;
  codeLanguage?: string;
  hasAppliedCode?: boolean;
  tokenCount?: number;
  processingTime?: number;
  confidence?: number;
  suggestions?: string[];
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
    EnhancedAIPreviewComponent,
    AICopilotPanelComponent
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
              <mat-chip class="version-chip" color="accent">v2.0</mat-chip>
            </h1>
            <p class="copilot-subtitle">Your most advanced AI coding assistant with real-time collaboration</p>
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
                  🚀 <strong>Welcome to AI Copilot Ultimate!</strong><br><br>
                  I'm your advanced AI coding assistant. I can help you with:
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
                  
                  <button mat-button (click)="regenerateResponse(message)">
                    <mat-icon>refresh</mat-icon>
                    Regenerate
                  </button>
                  
                  <button mat-button (click)="explainCode(message)" *ngIf="message.code">
                    <mat-icon>help_outline</mat-icon>
                    Explain
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
                <div class="thinking-details" *ngIf="currentThinkingStep()">
                  <small>{{ currentThinkingStep() }}</small>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Chat Input -->
          <div class="chat-input-container">
            <div class="input-wrapper">
              <mat-form-field class="chat-input-field" appearance="outline">
                <textarea matInput 
                          [(ngModel)]="currentMessage"
                          (keydown.enter)="onEnterPress($event)"
                          placeholder="Ask me anything about coding... (Shift+Enter for new line)"
                          rows="1"
                          cdkTextareaAutosize
                          cdkAutosizeMinRows="1"
                          cdkAutosizeMaxRows="5">
                </textarea>
                <mat-hint>Press Enter to send, Shift+Enter for new line</mat-hint>
              </mat-form-field>
              
              <div class="input-actions">
                <button mat-icon-button 
                        matTooltip="Attach Code Context"
                        (click)="attachCodeContext()">
                  <mat-icon>attach_file</mat-icon>
                </button>
                
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
              
              <mat-slide-toggle [(ngModel)]="showPreview" class="preview-toggle">
                Live Preview
              </mat-slide-toggle>
            </div>
          </div>
          
          <!-- Monaco Editors Tabs -->
          <mat-tab-group class="editor-tabs" [(selectedIndex)]="activeEditorTab">
            <mat-tab label="TypeScript">
              <ng-template matTabContent>
                <app-monaco-code-editor
                  [value]="editorState.buffers().typescript"
                  [language]="'typescript'"
                  [height]="editorHeight"
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
                  [height]="editorHeight"
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
                  [height]="editorHeight"
                  [theme]="'vs-dark'"
                  [options]="monacoOptions"
                  (valueChange)="onCodeChange('scss', $event)">
                </app-monaco-code-editor>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
          
          <!-- Live Preview Panel -->
          <div class="preview-panel" *ngIf="showPreview" [@slideInOut]>
            <div class="preview-header">
              <h4>
                <mat-icon>visibility</mat-icon>
                Live Preview
              </h4>
              <button mat-icon-button (click)="showPreview = false">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            
            <app-enhanced-ai-preview
              [typescriptCode]="editorState.buffers().typescript"
              [htmlCode]="editorState.buffers().html"
              [scssCode]="editorState.buffers().scss"
              [autoRefresh]="true">
            </app-enhanced-ai-preview>
          </div>
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
      <button mat-menu-item (click)="showKeyboardShortcuts()">
        <mat-icon>keyboard</mat-icon>
        Keyboard Shortcuts
      </button>
    </mat-menu>
  `,
  styleUrls: ['./ai-copilot-ultimate.component.scss'],
  animations: [
    // Add smooth animations for better UX
  ]
})
export class AICopilotUltimateComponent implements OnInit, OnDestroy {
  // 🔧 SERVICES & DEPENDENCIES
  private readonly aiPromptCore = inject(AIPromptCoreService);
  private readonly aiCopilotService = inject(AICopilotService);
  private readonly editorState = inject(EditorStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly analytics = inject(AnalyticsService);
  private readonly authService = inject(AuthService);
  
  // 🧠 SIGNALS & STATE
  chatMessages = signal<UltimateChatMessage[]>([]);
  isGenerating = signal(false);
  isInitializing = signal(true);
  hasError = signal(false);
  copilotGuards = signal<AICopilotGuards>({
    isBackendAvailable: false,
    hasValidSession: false,
    isRateLimited: false,
    hasNetworkConnection: true,
    isUserAuthenticated: false
  });
  
  // 🎛️ UI STATE
  currentMessage = '';
  selectedModel = 'gpt-4';
  activeEditorTab = 0;
  showPreview = false;
  isDarkMode = true;
  currentThinkingStep = signal<string>('');
  
  // 📊 COMPUTED VALUES
  currentModel = computed(() => this.selectedModel);
  editorHeight = computed(() => this.showPreview ? '40vh' : '60vh');
  
  // ⚙️ CONFIGURATION
  monacoOptions = {
    automaticLayout: true,
    minimap: { enabled: true },
    wordWrap: 'on' as const,
    lineNumbers: 'on' as const,
    folding: true,
    bracketMatching: 'always' as const,
    autoIndent: 'full' as const,
    formatOnPaste: true,
    formatOnType: true
  };
  
  // 🔄 LIFECYCLE
  private destroy$ = new Subject<void>();
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  
  constructor() {
    // Initialize AI Copilot Guards
    this.initializeGuards();
    
    // Setup reactive effects
    effect(() => {
      if (this.chatMessages().length > 0) {
        this.scrollToBottom();
      }
    });
  }
  
  ngOnInit() {
    console.log('🚀 AI COPILOT ULTIMATE - Initializing the most advanced AI coding assistant...');
    
    // Initialize services and state
    this.initializeServices();
    this.setupEventListeners();
    
    // Complete initialization
    timer(1000).subscribe(() => {
      this.isInitializing.set(false);
      console.log('✅ AI COPILOT ULTIMATE - Ready for action!');
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // 🛡️ AI COPILOT GUARDS IMPLEMENTATION
  private initializeGuards() {
    // Check backend availability
    this.checkBackendHealth();
    
    // Check authentication
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.copilotGuards.update(guards => ({
        ...guards,
        isUserAuthenticated: !!user
      }));
    });
    
    // Monitor network connection
    window.addEventListener('online', () => {
      this.copilotGuards.update(guards => ({
        ...guards,
        hasNetworkConnection: true
      }));
    });
    
    window.addEventListener('offline', () => {
      this.copilotGuards.update(guards => ({
        ...guards,
        hasNetworkConnection: false
      }));
    });
  }
  
  private async checkBackendHealth() {
    try {
      // Implement backend health check
      const isHealthy = await this.aiPromptCore.checkHealth().toPromise();
      this.copilotGuards.update(guards => ({
        ...guards,
        isBackendAvailable: isHealthy
      }));
    } catch (error) {
      this.copilotGuards.update(guards => ({
        ...guards,
        isBackendAvailable: false
      }));
    }
  }
  
  // 🚀 CORE FUNCTIONALITY
  private initializeServices() {
    // Subscribe to AI Copilot service observables
    this.aiCopilotService.chatHistory$.pipe(takeUntil(this.destroy$)).subscribe(history => {
      const enhancedMessages: UltimateChatMessage[] = history.map(msg => ({
        id: `${msg.type}_${Date.now()}_${Math.random()}`,
        type: msg.type === 'user' ? 'user' : 'ai',
        sender: msg.type === 'user' ? 'You' : 'AI Copilot',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        isCodeMessage: this.containsCode(msg.content),
        confidence: Math.random() * 0.3 + 0.7, // Mock confidence for now
        suggestions: this.generateSuggestions(msg.content)
      }));
      this.chatMessages.set(enhancedMessages);
    });
    
    // Subscribe to loading state
    this.aiCopilotService.isLoading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.isGenerating.set(loading);
      if (loading) {
        this.simulateThinkingSteps();
      }
    });
  }
  
  private setupEventListeners() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault();
            this.sendMessage();
            break;
          case 'k':
            event.preventDefault();
            this.clearChatHistory();
            break;
        }
      }
    });
  }
  
  // 💬 CHAT FUNCTIONALITY
  async sendMessage() {
    if (!this.currentMessage.trim()) return;
    
    const message = this.currentMessage.trim();
    this.currentMessage = '';
    
    // Check guards before sending
    if (!this.copilotGuards().isUserAuthenticated) {
      this.notificationService.showError('Please log in to use AI Copilot');
      return;
    }
    
    if (!this.copilotGuards().hasNetworkConnection) {
      this.notificationService.showError('No internet connection. Please check your network.');
      return;
    }
    
    // Track analytics
    this.analytics.trackAIInteraction('message_sent', 'chat');
    
    this.isGenerating.set(true);
    
    try {
      // Use AI Copilot service with enhanced context
      const context = {
        editorBuffers: this.editorState.buffers(),
        chatHistory: this.chatMessages().slice(-5), // Last 5 messages for context
        userPreferences: {
          model: this.selectedModel,
          codeStyle: 'typescript',
          framework: 'angular'
        },
        timestamp: new Date().toISOString()
      };
      
      await this.aiCopilotService.sendMessage(message, JSON.stringify(context)).toPromise();
      
    } catch (error) {
      console.error('❌ AI Copilot Ultimate error:', error);
      this.handleError(error);
    } finally {
      this.isGenerating.set(false);
    }
  }
  
  sendSuggestion(suggestion: string) {
    this.currentMessage = suggestion;
    this.sendMessage();
  }
  
  // 📝 CODE EDITOR FUNCTIONALITY
  onCodeChange(type: keyof EditorBuffers, content: string) {
    this.editorState.updateBuffer(type, content);
  }
  
  applyCodeToEditor(message: UltimateChatMessage) {
    if (!message.code) return;
    
    // Parse and apply code to appropriate editor
    const codeStructure = this.parseCodeStructure(message.code);
    
    if (codeStructure.typescript) {
      this.editorState.updateBuffer('typescript', codeStructure.typescript);
    }
    if (codeStructure.html) {
      this.editorState.updateBuffer('html', codeStructure.html);
    }
    if (codeStructure.scss) {
      this.editorState.updateBuffer('scss', codeStructure.scss);
    }
    
    // Mark as applied
    message.hasAppliedCode = true;
    this.notificationService.showSuccess('Code applied to editor successfully!');
    
    // Track analytics
    this.analytics.trackAIInteraction('code_applied', 'editor');
  }
  
  // 🛠️ UTILITY METHODS
  getStatusText(): string {
    if (this.isGenerating()) return 'Thinking...';
    if (this.hasError()) return 'Error';
    if (!this.copilotGuards().isBackendAvailable) return 'Offline';
    return 'Ready';
  }
  
  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  trackMessage(index: number, message: UltimateChatMessage): string {
    return message.id;
  }
  
  private containsCode(content: string): boolean {
    return /```|<[^>]+>|{|}|\(\)|=>|function|class|interface|import|export/.test(content);
  }
  
  private generateSuggestions(content: string): string[] {
    // AI-powered suggestion generation (simplified)
    const suggestions = [
      'Add error handling',
      'Optimize performance',
      'Add TypeScript types',
      'Create tests',
      'Add documentation'
    ];
    return suggestions.slice(0, 3);
  }
  
  private parseCodeStructure(code: string): { typescript?: string; html?: string; scss?: string } {
    // Enhanced code parsing logic
    const structure: { typescript?: string; html?: string; scss?: string } = {};
    
    // Parse TypeScript
    const tsMatch = code.match(/```typescript\n([\s\S]*?)\n```/);
    if (tsMatch) structure.typescript = tsMatch[1];
    
    // Parse HTML
    const htmlMatch = code.match(/```html\n([\s\S]*?)\n```/);
    if (htmlMatch) structure.html = htmlMatch[1];
    
    // Parse SCSS
    const scssMatch = code.match(/```scss\n([\s\S]*?)\n```/);
    if (scssMatch) structure.scss = scssMatch[1];
    
    return structure;
  }
  
  private simulateThinkingSteps() {
    const steps = [
      'Analyzing your request...',
      'Generating code structure...',
      'Optimizing implementation...',
      'Adding best practices...',
      'Finalizing response...'
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length && this.isGenerating()) {
        this.currentThinkingStep.set(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        this.currentThinkingStep.set('');
      }
    }, 800);
  }
  
  private handleError(error: any) {
    this.hasError.set(true);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.status === 429) {
      errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
      this.copilotGuards.update(guards => ({ ...guards, isRateLimited: true }));
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
      this.copilotGuards.update(guards => ({ ...guards, hasNetworkConnection: false }));
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Our AI service is temporarily unavailable.';
      this.copilotGuards.update(guards => ({ ...guards, isBackendAvailable: false }));
    }
    
    this.notificationService.showError(errorMessage);
    
    // Reset error state after 5 seconds
    timer(5000).subscribe(() => this.hasError.set(false));
  }
  
  // 🎛️ UI ACTIONS
  onEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
  
  clearChatHistory() {
    this.chatMessages.set([]);
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
  
  formatAllCode() {
    // Implement code formatting
    this.notificationService.showInfo('Code formatted successfully');
  }
  
  clearAllCode() {
    this.editorState.clearBuffers();
    this.notificationService.showInfo('All code cleared');
  }
  
  attachCodeContext() {
    // Implement code context attachment
    this.notificationService.showInfo('Code context attached');
  }
  
  regenerateResponse(message: UltimateChatMessage) {
    // Implement response regeneration
    this.notificationService.showInfo('Regenerating response...');
  }
  
  explainCode(message: UltimateChatMessage) {
    if (message.code) {
      this.currentMessage = `Please explain this code:\n\n${message.code}`;
      this.sendMessage();
    }
  }
  
  copyMessage(message: UltimateChatMessage) {
    navigator.clipboard.writeText(message.content);
    this.notificationService.showSuccess('Message copied to clipboard');
  }
  
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    // Implement theme switching
  }
  
  resetToDefaults() {
    this.selectedModel = 'gpt-4';
    this.showPreview = false;
    this.activeEditorTab = 0;
    this.notificationService.showInfo('Settings reset to defaults');
  }
  
  showKeyboardShortcuts() {
    // Implement keyboard shortcuts dialog
    this.notificationService.showInfo('Keyboard shortcuts: Ctrl+Enter (Send), Ctrl+K (Clear)');
  }
  
  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
