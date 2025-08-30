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
import { UltimateAIGuardService } from '@app/services/ai/ultimate-ai-guard.service';
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
  showLivePreview?: boolean;
  livePreviewHtml?: SafeHtml;
  extractedHtml?: string;
  extractedCss?: string;
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
            
            <!-- 🛡️ ULTIMATE AI GUARD DIAGNOSTICS -->
            <div class="stat-card diagnostic-card" [class.healthy]="ultimateAIGuard.isHealthy()">
              <mat-icon>{{ ultimateAIGuard.isHealthy() ? 'security' : 'warning' }}</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ ultimateAIGuard.successRate() | number:'1.0-1' }}%</div>
                <div class="stat-label">Success Rate</div>
              </div>
            </div>
            
            <div class="stat-card session-card" [class.active]="ultimateAIGuard.hasActiveSession()">
              <mat-icon>{{ ultimateAIGuard.hasActiveSession() ? 'link' : 'link_off' }}</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ ultimateAIGuard.hasActiveSession() ? 'Active' : 'Inactive' }}</div>
                <div class="stat-label">Session</div>
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
                    <div class="code-actions">
                      <button mat-icon-button (click)="togglePreview(message)" [class.active]="message.showLivePreview">
                        <mat-icon>{{ message.showLivePreview ? 'code_off' : 'visibility' }}</mat-icon>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Live Preview of Generated Component -->
                  <div *ngIf="message.showLivePreview" class="live-preview-container">
                    <div class="live-preview-header">
                      <mat-icon>play_circle</mat-icon>
                      <span>Live Preview</span>
                    </div>
                    <div class="live-preview-content" [innerHTML]="message.livePreviewHtml"></div>
                  </div>
                  
                  <!-- Code Block -->
                  <div [class.collapsed]="message.showLivePreview">
                    <pre class="code-block"><code [innerHTML]="message.code"></code></pre>
                  </div>
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
                  message="AI is processing..."
                  size="small">
                </app-professional-loader>
                <div class="thinking-details" *ngIf="currentThinkingStep()">
                  <small>{{ currentThinkingStep() }}</small>
                </div>
                <!-- 🚨 EMERGENCY STOP BUTTON -->
                <button mat-button 
                        color="warn" 
                        (click)="forceStopThinking()"
                        class="emergency-stop-btn">
                  <mat-icon>stop</mat-icon>
                  Stop Processing
                </button>
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
  readonly ultimateAIGuard = inject(UltimateAIGuardService);
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
    
    // 🛡️ USE ULTIMATE AI GUARD HEALTH MONITORING
    this.ultimateAIGuard.healthStatus$.subscribe({
      next: (healthStatus) => {
        console.log('🛡️ Ultimate AI Guard health:', healthStatus.isHealthy ? '✅ Healthy' : '❌ Unhealthy');
        this.updateGuards({ isBackendAvailable: healthStatus.isHealthy });
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
    this.currentThinkingStep.set('Preparing request...');
    
    // 🚨 AGGRESSIVE TIMEOUT - KILL THINKING STATE IMMEDIATELY
    const safetyTimeout = setTimeout(() => {
      console.warn('🚨 KILLING THINKING STATE NOW!');
      this.isGenerating.set(false);
      this.currentThinkingStep.set('');
      this.notificationService.showError('Request completed - try again if needed.');
    }, 10000); // 10 second aggressive timeout
    
    // 🔥 EMERGENCY BACKUP TIMEOUT
    const emergencyTimeout = setTimeout(() => {
      console.error('🔥 EMERGENCY: Force stopping all AI states');
      this.isGenerating.set(false);
      this.currentThinkingStep.set('');
    }, 5000); // 5 second emergency backup
    
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
      
      // 🚨 EMERGENCY FIX - Use direct AI Copilot service to get it working NOW!
      console.log('🚀 EMERGENCY: Using direct AI Copilot service');
      this.aiCopilotService.sendMessage(message, JSON.stringify(context)).subscribe({
        next: (response) => {
          console.log('✅ DIRECT AI Copilot SUCCESS:', response);
          clearTimeout(safetyTimeout);
          clearTimeout(emergencyTimeout);
          this.handleAIResponse(response, message);
        },
        error: (error) => {
          console.error('❌ DIRECT AI Copilot ERROR:', error);
          clearTimeout(safetyTimeout);
          clearTimeout(emergencyTimeout);
          this.handleError(error);
          this.isGenerating.set(false);
        },
        complete: () => {
          console.log('🏁 DIRECT AI Copilot completed');
        }
      });
      
    } catch (error) {
      console.error('❌ AI Copilot Ultimate error:', error);
      this.handleError(error);
      this.isGenerating.set(false);
    }
  }
  
  /**
   * 🤖 HANDLE AI RESPONSE - Process successful AI responses
   */
  private handleAIResponse(response: any, originalMessage: string) {
    console.log('🤖 Processing AI response:', response);
    
    // Clear any safety timeouts
    this.currentThinkingStep.set('');
    
    if (response && response.success) {
      // Add AI response to chat with live preview capability
      const aiMessage: UltimateChatMessage = {
        id: this.generateMessageId(),
        type: 'ai',
        sender: 'AI Copilot Ultimate',
        content: response.data.message,
        timestamp: new Date(),
        isCodeMessage: this.containsCode(response.data.message),
        code: this.extractCode(response.data.message),
        tokenCount: response.data.tokensUsed || 0,
        processingTime: response.data.responseTime || 0,
        confidence: 0.95,
        showLivePreview: false,
        livePreviewHtml: undefined,
        extractedHtml: '',
        extractedCss: ''
      };
      
      this.chatMessages.update(messages => [...messages, aiMessage]);
      
      // Auto-enable live preview if the response contains HTML/CSS
      if (this.containsHtmlOrCss(response.data.message)) {
        setTimeout(() => this.togglePreview(aiMessage), 500);
      }
      
      // Always scroll to bottom after adding AI response
      console.log('📤 AI response added - scrolling to bottom');
      this.isUserInitiatedScroll = true;
      this.scrollToBottom();
    }
    
    // Stop generating indicator
    this.isGenerating.set(false);
  }

  sendSuggestion(suggestion: string) {
    this.currentMessage = suggestion;
    this.sendMessage();
  }
  
  /**
   * 🚨 EMERGENCY FORCE STOP - Kill all thinking states immediately
   */
  forceStopThinking() {
    console.log('🚨 FORCE STOPPING ALL AI PROCESSING');
    this.isGenerating.set(false);
    this.currentThinkingStep.set('');
    this.notificationService.showInfo('AI processing stopped');
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

  /**
   * 👁️ TOGGLE LIVE PREVIEW - The amazing feature from yesterday!
   */
  togglePreview(message: UltimateChatMessage) {
    message.showLivePreview = !message.showLivePreview;
    
    if (message.showLivePreview && !message.livePreviewHtml) {
      // Extract and process HTML/CSS from the AI response
      this.generateLivePreview(message);
    }
    
    // Update the messages array to trigger change detection
    const messages = this.chatMessages();
    const index = messages.findIndex(m => m.id === message.id);
    if (index !== -1) {
      messages[index] = { ...message };
      this.chatMessages.set([...messages]);
    }
  }

  /**
   * 🎨 GENERATE LIVE PREVIEW - Extract HTML/CSS and create live preview
   */
  private generateLivePreview(message: UltimateChatMessage) {
    try {
      console.log('🎨 Generating live preview for message:', message.content);
      
      // Extract HTML from code blocks
      const htmlMatch = message.content.match(/```html\n([\s\S]*?)\n```/);
      const cssMatch = message.content.match(/```css\n([\s\S]*?)\n```/) || 
                      message.content.match(/```scss\n([\s\S]*?)\n```/);
      
      let html = '';
      let css = '';
      
      if (htmlMatch) {
        html = htmlMatch[1].trim();
      } else {
        // Try to extract HTML from template blocks
        const templateMatch = message.content.match(/template:\s*`\n([\s\S]*?)\n\s*`/);
        if (templateMatch) {
          html = templateMatch[1].trim();
        }
      }
      
      if (cssMatch) {
        css = cssMatch[1].trim();
      } else {
        // Try to extract CSS from styles blocks
        const stylesMatch = message.content.match(/styles:\s*\[\s*`\n([\s\S]*?)\n\s*`\s*\]/);
        if (stylesMatch) {
          css = stylesMatch[1].trim();
        }
      }
      
      // If no HTML found, try to generate a simple preview from the description
      if (!html && message.content.includes('component')) {
        html = this.generatePreviewFromDescription(message.content);
      }
      
      // Create the live preview HTML
      const previewHtml = this.createLivePreviewHtml(html, css);
      message.livePreviewHtml = this.sanitizer.bypassSecurityTrustHtml(previewHtml);
      message.extractedHtml = html;
      message.extractedCss = css;
      
      console.log('✅ Live preview generated successfully');
      
    } catch (error) {
      console.error('❌ Error generating live preview:', error);
      message.livePreviewHtml = this.sanitizer.bypassSecurityTrustHtml(
        '<div class="preview-error">⚠️ Could not generate preview</div>'
      );
    }
  }

  /**
   * 🏗️ CREATE LIVE PREVIEW HTML
   */
  private createLivePreviewHtml(html: string, css: string): string {
    const styleTag = css ? `<style>${css}</style>` : '';
    
    return `
      <div class="live-preview-wrapper">
        ${styleTag}
        <div class="preview-content">
          ${html || '<div class="no-preview">No HTML content to preview</div>'}
        </div>
      </div>
    `;
  }

  /**
   * 🤖 GENERATE PREVIEW FROM DESCRIPTION
   */
  private generatePreviewFromDescription(content: string): string {
    // Simple preview generation based on content description
    if (content.toLowerCase().includes('button')) {
      return '<button class="preview-btn">Sample Button</button>';
    }
    
    if (content.toLowerCase().includes('card')) {
      return `
        <div class="preview-card">
          <h3>Sample Card</h3>
          <p>This is a preview of the generated component.</p>
          <button>Action</button>
        </div>
      `;
    }
    
    if (content.toLowerCase().includes('form')) {
      return `
        <form class="preview-form">
          <input type="text" placeholder="Sample Input" />
          <button type="submit">Submit</button>
        </form>
      `;
    }
    
    return '<div class="preview-placeholder">🎨 Component Preview</div>';
  }

  /**
   * 🔍 CHECK IF CONTENT CONTAINS HTML OR CSS
   */
  private containsHtmlOrCss(content: string): boolean {
    return content.includes('```html') || 
           content.includes('```css') || 
           content.includes('```scss') ||
           content.includes('template:') ||
           content.includes('styles:');
  }

  /**
   * 🔍 CHECK IF CONTENT CONTAINS CODE
   */
  private containsCode(content: string): boolean {
    return content.includes('```') || 
           content.includes('template:') ||
           content.includes('styles:') ||
           content.includes('@Component');
  }

  /**
   * 📝 EXTRACT CODE FROM CONTENT
   */
  private extractCode(content: string): string {
    const codeBlocks = content.match(/```[\s\S]*?```/g);
    if (codeBlocks) {
      return codeBlocks.join('\n\n');
    }
    return '';
  }

  /**
   * 🆔 GENERATE MESSAGE ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
