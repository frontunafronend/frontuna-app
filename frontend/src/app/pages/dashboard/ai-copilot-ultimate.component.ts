/**
 * 🤖 AI COPILOT ULTIMATE - RESTORED AND ENHANCED!
 */

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
import { MonacoCodeEditorComponent } from '@app/components/shared/monaco-code-editor/monaco-code-editor.component';
import { EnhancedAIPreviewComponent } from '@app/components/ai/enhanced-ai-preview/enhanced-ai-preview.component';

// Services
import { AIPromptCoreService } from '@app/services/ai/ai-prompt-core.service';
import { AIResponse } from '@app/models/ai.model';
import { AICopilotService } from '@app/services/ai/ai-copilot.service';
import { EditorStateService, EditorBuffers } from '@app/services/editor-state.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { AnalyticsService } from '@app/services/analytics/analytics.service';
import { AuthService } from '@app/services/auth/auth.service';

// Models
import { ChatMessage } from '@app/models/chat.model';

// RxJS
import { Subject, takeUntil, timer } from 'rxjs';

// Interfaces
interface AICopilotGuards {
  isBackendAvailable: boolean;
  hasValidSession: boolean;
  isRateLimited: boolean;
  hasNetworkConnection: boolean;
  isUserAuthenticated: boolean;
}

interface UltimateChatMessage extends ChatMessage {
  isCodeMessage?: boolean;
  codeLanguage?: string;
  hasAppliedCode?: boolean;
  hasCode?: boolean;
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
                </div>
                
                <div class="message-text" [innerHTML]="message.content"></div>
                
                <!-- Code Preview -->
                <div *ngIf="message.code" class="code-preview">
                  <div class="code-header">
                    <mat-icon>code</mat-icon>
                    <span>Generated Code</span>
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
                  [height]="editorHeight()"
                  [theme]="'vs-dark'"
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
                  (valueChange)="onCodeChange('scss', $event)">
                </app-monaco-code-editor>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
          
          <!-- Live Preview Panel -->
          <div class="preview-panel" *ngIf="showPreview">
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
              [aiResponse]="createPreviewResponse()">
            </app-enhanced-ai-preview>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./ai-copilot-ultimate.component.scss']
})
export class AICopilotUltimateComponent implements OnInit, OnDestroy {
  // 🔧 SERVICES & DEPENDENCIES
  private readonly aiPromptCore = inject(AIPromptCoreService);
  private readonly aiCopilotService = inject(AICopilotService);
  readonly editorState = inject(EditorStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly analytics = inject(AnalyticsService);
  private readonly authService = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);
  
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
  currentThinkingStep = signal<string>('');
  
  // 🔄 LIFECYCLE
  private destroy$ = new Subject<void>();
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 2000;
  private isUserInitiatedScroll = false;
  
  // 📊 COMPUTED VALUES
  editorHeight = computed(() => this.showPreview ? '40vh' : '60vh');
  
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

  // 🛡️ AI COPILOT GUARDS IMPLEMENTATION
  private initializeGuards() {
    console.log('🛡️ Initializing AI Copilot Guards...');
    
    // Check backend availability
    this.aiPromptCore.checkHealth().subscribe({
      next: (isHealthy) => {
        console.log('🏥 Backend health check:', isHealthy ? '✅ Healthy' : '❌ Unhealthy');
        this.updateGuards({ isBackendAvailable: isHealthy });
      },
      error: (error) => {
        console.error('🚨 Backend health check failed:', error);
        this.updateGuards({ isBackendAvailable: false });
      }
    });

    // Check authentication status
    const user = this.authService.currentUser();
    const isAuthenticated = !!user;
    console.log('🔐 Authentication check:', isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated');
    this.updateGuards({ 
      isUserAuthenticated: isAuthenticated,
      hasValidSession: isAuthenticated 
    });

    // Check network connection
    const hasNetwork = navigator.onLine;
    console.log('🌐 Network check:', hasNetwork ? '✅ Online' : '❌ Offline');
    this.updateGuards({ hasNetworkConnection: hasNetwork });
  }

  private updateGuards(updates: Partial<AICopilotGuards>) {
    const currentGuards = this.copilotGuards();
    const newGuards = { ...currentGuards, ...updates };
    this.copilotGuards.set(newGuards);
    console.log('🛡️ Guards updated:', newGuards);
  }
  
  ngOnInit() {
    console.log('🚀 AI COPILOT ULTIMATE - Initializing...');
    
    // Reset all states to ensure clean initialization
    this.isGenerating.set(false);
    this.hasError.set(false);
    this.currentThinkingStep.set('');
    
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
  
  // 🚀 CORE FUNCTIONALITY
  private initializeServices() {
    console.log('🔧 Initializing AI Copilot services...');
    
    // Subscribe to AI Copilot service observables
    this.aiCopilotService.chatHistory$.pipe(takeUntil(this.destroy$)).subscribe(history => {
      console.log('💬 Chat history updated:', history.length, 'messages');
      const enhancedMessages: UltimateChatMessage[] = history.map(msg => ({
        id: `${msg.type}_${Date.now()}_${Math.random()}`,
        type: msg.type === 'user' ? 'user' : 'ai',
        sender: msg.type === 'user' ? 'You' : 'AI Copilot',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        isCodeMessage: this.containsCode(msg.content),
        confidence: Math.random() * 0.3 + 0.7
      }));
      this.chatMessages.set(enhancedMessages);
    });
    
    // Subscribe to loading state with safety checks
    this.aiCopilotService.isLoading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      console.log('⏳ Loading state changed:', loading);
      this.isGenerating.set(loading);
      
      if (loading) {
        this.simulateThinkingSteps();
      } else {
        this.currentThinkingStep.set('');
      }
    });

    // Initialize with empty chat if no history
    if (this.chatMessages().length === 0) {
      console.log('📝 Initializing empty chat history');
      this.chatMessages.set([]);
    }
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
    
    // Throttle requests
    const now = Date.now();
    if (now - this.lastRequestTime < this.MIN_REQUEST_INTERVAL) {
      this.notificationService.showWarning('Please wait a moment before sending another message.');
      return;
    }
    this.lastRequestTime = now;
    
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
    
    // Add user message to chat
    const userMessage: UltimateChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      sender: 'You',
      content: message,
      timestamp: new Date()
    };
    
    this.chatMessages.update(messages => [...messages, userMessage]);
    
    // Track analytics
    this.analytics.trackAIInteraction('prompt_sent', 'chat');
    
    this.isGenerating.set(true);
    
    try {
      // Use AI Copilot service
      const context = {
        editorBuffers: this.editorState.buffers(),
        chatHistory: this.chatMessages().slice(-5),
        userPreferences: {
          model: this.selectedModel,
          codeStyle: 'typescript',
          framework: 'angular'
        },
        timestamp: new Date().toISOString()
      };
      
      await this.aiCopilotService.sendMessage(message, JSON.stringify(context)).toPromise();
      
      // Always scroll to bottom after sending a message
      console.log('📤 Message sent - scrolling to bottom');
      this.isUserInitiatedScroll = true;
      this.scrollToBottom();
      
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
  
  private parseCodeStructure(code: string): { typescript?: string; html?: string; scss?: string } {
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
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Our AI service is temporarily unavailable.';
    }
    
    this.notificationService.showError(errorMessage);
    
    // Reset error state after 5 seconds
    timer(5000).subscribe(() => this.hasError.set(false));
  }
  
  // 🎛️ UI ACTIONS
  onEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.isUserInitiatedScroll = true;
      this.sendMessage();
    }
  }
  
  clearChatHistory() {
    this.chatMessages.set([]);
    this.notificationService.showInfo('Chat history cleared');
  }
  
  clearAllCode() {
    this.editorState.clearBuffers();
    this.notificationService.showInfo('All code cleared');
  }
  
  copyMessage(message: UltimateChatMessage) {
    navigator.clipboard.writeText(message.content);
    this.notificationService.showSuccess('Message copied to clipboard');
  }
  
  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer?.nativeElement) {
        const container = this.chatContainer.nativeElement;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        
        const shouldScroll = isNearBottom || this.isUserInitiatedScroll;
        
        if (shouldScroll) {
          container.scrollTop = container.scrollHeight;
          console.log('📜 Scrolled to bottom');
        }
        
        this.isUserInitiatedScroll = false;
      }
    }, 100);
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
}
