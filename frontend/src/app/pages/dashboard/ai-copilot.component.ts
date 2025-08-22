/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:38:46.969Z
 * Issues detected: 2
 * 
 * This file is protected against common bugs:
 * - AI_USAGE_NOT_TRACKED: MEDIUM
 * - GENERIC_ERROR_MESSAGE: MEDIUM
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:32:02.202Z
 * Issues detected: 2
 * 
 * This file is protected against common bugs:
 * - AI_USAGE_NOT_TRACKED: MEDIUM
 * - GENERIC_ERROR_MESSAGE: MEDIUM
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:30:48.010Z
 * Issues detected: 2
 * 
 * This file is protected against common bugs:
 * - AI_USAGE_NOT_TRACKED: MEDIUM
 * - GENERIC_ERROR_MESSAGE: MEDIUM
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:22:46.016Z
 * Issues detected: 2
 * 
 * This file is protected against common bugs:
 * - AI_USAGE_NOT_TRACKED: MEDIUM
 * - GENERIC_ERROR_MESSAGE: MEDIUM
 */

import { Component, OnInit, ViewChild, ElementRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification/notification.service';
import { AIPromptCoreService } from '../../services/ai/ai-prompt-core.service';
import { EditorStateService } from '../../services/editor-state.service';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { ProfessionalLoaderComponent } from '../../components/ui/professional-loader/professional-loader.component';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  sender: string;
  content: string;
  code?: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-copilot',
  standalone: true,
  imports: [CommonModule, ProfessionalLoaderComponent],
  template: `


    <div class="ai-copilot-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>
              <span class="page-icon">🤖</span>
              AI Copilot
            </h1>
            <p>Transform your ideas into code with the help of AI</p>
          </div>
          
          <div class="header-stats">
            <div class="stat-card">
              <div class="stat-value">{{ chatMessages().length }}</div>
              <div class="stat-label">Messages</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ isGenerating() ? 'Working...' : 'Ready' }}</div>
              <div class="stat-label">Status</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Layout: Chat Left, Editor Right -->
      <div class="main-layout">
        
        <!-- LEFT PANEL: Chat Interface -->
        <div class="left-panel chat-interface">
          <div class="chat-header">
            <div class="chat-title">
              <span>💬</span>
              <h3>AI Chat</h3>
                      </div>
            
            <!-- Status Indicator -->
            <div class="status-indicator" 
                 [class.ready]="!isGenerating() && !hasError()"
                 [class.processing]="isGenerating()"
                 [class.error]="hasError()">
              <div class="status-dot"></div>
              <span class="status-text">{{ getStatusText() }}</span>
                      </div>
                    </div>
                    
                    <!-- Chat Messages -->
          <div class="chat-messages-container" #chatMessagesContainer>
                      <!-- Welcome Message -->
            <div class="chat-message ai-message welcome-message" *ngIf="chatMessages().length === 0">
              <div class="message-avatar">
                <span>🤖</span>
                          </div>
                        <div class="message-content">
                          <div class="message-text">
                  👋 Welcome! I'm your AI coding assistant. I can help you with code generation, debugging, and optimization.
                  <br><br>
                  Try asking me to:
                  <br>• Create a button component
                  <br>• Build a responsive navbar
                  <br>• Generate TypeScript interfaces
                  <br>• Fix CSS styling issues
                          </div>
                <div class="message-time">Just now</div>
                        </div>
                      </div>

            <!-- Dynamic Chat Messages -->
            <div *ngFor="let message of chatMessages(); trackBy: trackMessage" 
                           class="chat-message" 
                           [class.user-message]="message.type === 'user'"
                           [class.ai-message]="message.type === 'ai'">
              <div class="message-avatar">
                <span>{{ message.type === 'user' ? '👤' : '🤖' }}</span>
                          </div>
              <div class="message-content">
                          <div class="message-text" [innerHTML]="message.content"></div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                          
                                <!-- Apply to Editor Button -->
                <div class="message-actions" *ngIf="message.type === 'ai'">
                  <button class="apply-button" (click)="applyCodeToEditor(message)">
                    <span class="apply-icon">📝</span>
                    <span class="apply-text">Apply to Editor</span>
                  </button>
                </div>
                        </div>
                      </div>

            <!-- Professional AI Thinking Loader -->
            <div *ngIf="isGenerating()" class="chat-message ai-message loading-message">
              <div class="message-content">
                <app-professional-loader 
                  type="thinking" 
                  message="AI is thinking..." 
                  size="small">
                </app-professional-loader>
              </div>
            </div>
                    </div>

                    <!-- Chat Input -->
          <div class="chat-input-container">
            <div class="chat-input-wrapper">
              <textarea 
                [value]="currentMessage"
                (input)="currentMessage = $any($event.target).value"
                (keydown.enter)="onEnterPress($any($event))"
                placeholder="Send a message..."
                class="chat-input"
                rows="1"></textarea>
              <button 
                class="send-button" 
                (click)="sendMessage()"
                [disabled]="isGenerating() || !currentMessage.trim()">
                <span>🚀</span>
              </button>
            </div>
                    </div>
                  </div>

        <!-- Resize Handle -->
        <div class="resize-handle">
          <div class="resize-line"></div>
                </div>

        <!-- RIGHT PANEL: Code Editor -->
        <div class="right-panel code-editor-panel">
          <div class="editor-header">
            <div class="editor-title">
              <span>📝</span>
              <h3>Code Editor</h3>
            </div>
            <div class="editor-tabs">
              <button class="editor-tab" 
                      [class.active]="activeEditorLanguage() === 'typescript'"
                      (click)="setActiveEditorLanguage('typescript')">
                <span>📝</span>
                TypeScript
                        </button>
              <button class="editor-tab"
                      [class.active]="activeEditorLanguage() === 'html'"
                      (click)="setActiveEditorLanguage('html')">
                <span>🌐</span>
                HTML
                        </button>
              <button class="editor-tab"
                      [class.active]="activeEditorLanguage() === 'scss'"
                      (click)="setActiveEditorLanguage('scss')">
                <span>🎨</span>
                SCSS
              </button>
              <button class="editor-tab" (click)="runCode()">
                <span>▶️</span>
                Run
                        </button>
                      </div>
                    </div>

          <!-- Monaco Editor -->
          <div class="monaco-editor-container">
            <div class="simple-editor">
              <textarea 
              [value]="currentEditorValue()"
                (input)="onCurrentCodeChange($any($event.target).value)"
                class="code-textarea"
                placeholder="Generated code will appear here...">
              </textarea>
            </div>
                  </div>

                    <!-- Preview Panels -->
          <div class="preview-panels">
            <div class="preview-panel">
              <div class="preview-header">PREVIEW</div>
              <div class="preview-content">
                <button class="preview-button">Sample Button</button>
                </div>
              </div>
            </div>
      </div>
    </div>
    </div>
  `,
  styleUrls: ['./ai-copilot.component.scss']
})
export class AICopilotComponent implements OnInit {
  // Services
  private notificationService = inject(NotificationService);
  private aiPromptCore = inject(AIPromptCoreService);
  private editorState = inject(EditorStateService);
  private analytics = inject(AnalyticsService);

  // Signals
  chatMessages = signal<ChatMessage[]>([]);
  isGenerating = signal(false);
  hasError = signal(false);
  
  // Additional properties
  currentMessage = '';
  activeEditorLanguage = signal<'typescript' | 'html' | 'scss'>('typescript');

  // Computed values
  currentEditorValue = computed(() => {
    const buffers = this.editorState.buffers();
    const language = this.activeEditorLanguage();
    return buffers[language] || '';
  });

  @ViewChild('chatMessagesContainer') chatMessagesContainer!: ElementRef;

  ngOnInit() {
    console.log('AI Copilot Component initialized');
  }

  // Helper methods

  getStatusText(): string {
    if (this.isGenerating()) return 'Processing...';
    if (this.hasError()) return 'Error';
    return 'Ready';
  }

  trackMessage(index: number, message: ChatMessage): string {
    return message.id;
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  sendMessage() {
    if (this.currentMessage.trim()) {
      this.onSendPrompt(this.currentMessage, 'chat');
      this.currentMessage = '';
    }
  }

  onEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  setActiveEditorLanguage(language: 'typescript' | 'html' | 'scss') {
    this.activeEditorLanguage.set(language);
    console.log(`✅ Setting active editor language to: ${language}`);
  }

  onCurrentCodeChange(value: string) {
    const buffers = { ...this.editorState.buffers() };
    const language = this.activeEditorLanguage();
    buffers[language] = value;
    this.editorState.updateBuffers(buffers);
  }

  runCode() {
    this.notificationService.showInfo('Preview', 'Code preview functionality');
  }

  applyCodeToEditor(message: ChatMessage) {
    // Apply guaranteed code to editor
    this.applyGuaranteedCode({ content: message.content });
  }

  // BULLETPROOF: Clean and simple onSendPrompt method
  async onSendPrompt(content: string, mode: 'chat' | 'refine' | 'explain' | 'convert' | 'a11y' | 'copilot') {
    if (!content.trim()) {
      this.notificationService.showWarning('Empty message', 'Please enter a message');
      return;
    }

    this.analytics.trackAIInteraction('prompt_sent', mode);
      this.isGenerating.set(true);
    this.scrollToBottom();

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      sender: 'You',
      content: content,
      timestamp: new Date()
    };
    this.chatMessages.update(messages => [...messages, userMessage]);
    this.scrollToBottom();

    try {
      const response = await this.aiPromptCore.sendPrompt(content, 'generate', JSON.stringify({
        context: this.editorState.buffers(),
        mode: mode,
        timestamp: new Date().toISOString()
      })).toPromise();

      if (response) {
        console.log('✅ AI Response received:', response);
        // Add AI response to chat
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          sender: 'AI Assistant',
          content: response.content || 'Code generated successfully!',
      timestamp: new Date()
    };
        this.chatMessages.update(messages => [...messages, aiMessage]);
        this.scrollToBottom();

        // Apply code to editor
        this.applyGuaranteedCode(response);
        
        // Debug the actual response.code structure
        if (response.code) {
          console.log('🔍 response.code type:', typeof response.code);
          console.log('🔍 response.code content:', response.code);
          if (typeof response.code === 'object') {
            console.log('🔍 response.code keys:', Object.keys(response.code));
          }
        }
      } else {
        // Handle case when no response is received
        console.log('⚠️ No response received from AI service');
        this.notificationService.showError('No Response', 'AI service did not return a response');
        
        const errorMessage: ChatMessage = {
          id: `error_${Date.now()}`,
          type: 'ai',
          sender: 'AI Assistant',
          content: 'I apologize, but I did not receive a response. Please try again.',
          timestamp: new Date()
        };
        
        this.chatMessages.update(messages => [...messages, errorMessage]);
        this.scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending prompt:', error);
      
      this.hasError.set(true);
      
      // Track chat error
      this.analytics.trackError(
        error instanceof Error ? error.message : 'Unknown error',
        'copilot_chat_error',
        'high'
      );
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'ai',
        sender: 'AI Copilot',
        content: 'I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };

      this.chatMessages.update(messages => [...messages, errorMessage]);
      this.scrollToBottom();
      
      // Clear error after 5 seconds
      setTimeout(() => this.hasError.set(false), 5000);
    } finally {
      this.isGenerating.set(false);
    }
  }

  private applyGuaranteedCode(response: any) {
    console.log('🔧 Applying guaranteed code system', response);
    
    // Try to extract code from various response formats
    let codeData: any = null;
    
    // Strategy 1: Direct codeData property
    if (response?.codeData) {
      codeData = response.codeData;
      console.log('✅ Strategy 1: Using response.codeData', codeData);
    }
    // Strategy 2: Code object property
    else if (response?.code && typeof response.code === 'object') {
      codeData = response.code;
      console.log('✅ Strategy 2: Using response.code object', codeData);
    }
    // Strategy 3: Code string property (assume TypeScript)
    else if (response?.code && typeof response.code === 'string') {
      codeData = { typescript: response.code };
      console.log('✅ Strategy 3: Using response.code string as TypeScript');
    }
    // Strategy 4: Parse from content/message text
    else if (response?.content || response?.message) {
      const content = response.content || response.message;
      codeData = this.extractCodeFromText(content);
      console.log('✅ Strategy 4: Extracted code from text content', codeData);
    }
    // Strategy 5: Parse from response text directly
    else if (typeof response === 'string') {
      codeData = this.extractCodeFromText(response);
      console.log('✅ Strategy 5: Extracted code from response string', codeData);
    }
    
    // Only use fallback if no code was found at all
    if (!codeData || Object.keys(codeData).length === 0) {
      console.log('⚠️ No code found in response, using minimal fallback');
      codeData = {
        typescript: `// No code generated from AI response
// Please try a different prompt
console.log('AI response did not contain code');`
      };
    }
    
    // Apply the code to editor
    this.applyCodeDataToEditor(codeData);
    this.setActiveEditorLanguage('typescript');
    this.notificationService.showSuccess('Code Applied!', 'Code has been added to the editor');
  }

  private extractCodeFromText(text: string): any {
    const codeData: any = {};
    
    // Extract TypeScript/JavaScript code blocks
    const tsMatches = text.match(/```(?:typescript|ts|javascript|js)\n([\s\S]*?)```/gi);
    if (tsMatches && tsMatches.length > 0) {
      const code = tsMatches[0].replace(/```(?:typescript|ts|javascript|js)\n/, '').replace(/```$/, '');
      codeData.typescript = code.trim();
    }
    
    // Extract HTML code blocks
    const htmlMatches = text.match(/```html\n([\s\S]*?)```/gi);
    if (htmlMatches && htmlMatches.length > 0) {
      const code = htmlMatches[0].replace(/```html\n/, '').replace(/```$/, '');
      codeData.html = code.trim();
    }
    
    // Extract CSS/SCSS code blocks
    const cssMatches = text.match(/```(?:css|scss)\n([\s\S]*?)```/gi);
    if (cssMatches && cssMatches.length > 0) {
      const code = cssMatches[0].replace(/```(?:css|scss)\n/, '').replace(/```$/, '');
      codeData.scss = code.trim();
    }
    
    // If no code blocks found, try to extract any code-like content
    if (Object.keys(codeData).length === 0) {
      const codeBlocks = text.match(/```\n([\s\S]*?)```/g);
      if (codeBlocks && codeBlocks.length > 0) {
        const code = codeBlocks[0].replace(/```\n/, '').replace(/```$/, '');
        codeData.typescript = code.trim();
      }
    }
    
    return codeData;
  }

  private applyCodeDataToEditor(codeData: any) {
    // Apply code to editor state service
    if (codeData) {
      const buffers: any = {};
      if (codeData.typescript) buffers.typescript = codeData.typescript;
      if (codeData.html) buffers.html = codeData.html;
      if (codeData.scss) buffers.scss = codeData.scss;
      if (codeData.javascript) buffers.javascript = codeData.javascript;
      
      this.editorState.updateBuffers(buffers);
      console.log('✅ Code applied to editor buffers');
    }
  }

  private scrollToBottom() {
        setTimeout(() => {
      if (this.chatMessagesContainer) {
        const element = this.chatMessagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }
}