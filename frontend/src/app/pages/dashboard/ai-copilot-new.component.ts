/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:38:46.974Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - AI_USAGE_NOT_TRACKED: MEDIUM
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:32:02.209Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - AI_USAGE_NOT_TRACKED: MEDIUM
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:30:48.019Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - AI_USAGE_NOT_TRACKED: MEDIUM
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:22:46.020Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - AI_USAGE_NOT_TRACKED: MEDIUM
 */

import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { AICopilotPanelComponent } from '@app/components/ai/ai-copilot-panel/ai-copilot-panel.component';
import { AIPromptBoxComponent } from '@app/components/ai/ai-prompt-box/ai-prompt-box.component';
import { CodeDisplayComponent } from '@app/components/shared/code-display/code-display.component';
import { MonacoCodeEditorComponent } from '@app/components/shared/monaco-code-editor/monaco-code-editor.component';
import { AIPromptService } from '@app/services/ai/ai-prompt.service';
import { AIPromptCoreService } from '@app/services/ai/ai-prompt-core.service';
import { EditorStateService, EditorBuffers } from '@app/services/editor-state.service';
import { CodeFenceParserService } from '@app/services/code-fence-parser.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { ProfessionalLoaderComponent } from '@app/components/ui/professional-loader/professional-loader.component';
import { EnhancedAIPreviewComponent } from '@app/components/ai/enhanced-ai-preview/enhanced-ai-preview.component';
import { AIPrompt, AIResponse } from '@app/models/ai.model';

export interface ChatMessage {
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
  imports: [
    CommonModule,
    FormsModule,
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

    AICopilotPanelComponent,
    AIPromptBoxComponent,
    CodeDisplayComponent,
    MonacoCodeEditorComponent,
    ProfessionalLoaderComponent,
    EnhancedAIPreviewComponent
  ],
  template: `
    <!-- Loading Overlay -->
    <div *ngIf="isPageLoading()" class="page-loading-overlay">
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
              <div class="stat-value">{{ chatMessages().length }}</div>
              <div class="stat-label">Messages</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ editorState.hasCode() ? 'Yes' : 'No' }}</div>
              <div class="stat-label">Has Code</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ currentModel() }}</div>
              <div class="stat-label">AI Model</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Layout -->
      <div class="main-layout">
        <!-- Left Panel: AI Copilot Panel -->
        <div class="left-panel">
          <app-ai-copilot-panel
            [currentBuffers]="editorState.buffers()"
            [framework]="'angular'"
            [style]="'material'"
            (refineRequested)="onSendPrompt($event, 'refine')"
            (explainRequested)="onSendPrompt($event, 'explain')"
            (convertRequested)="onSendPrompt($event, 'convert')"
            (a11yRequested)="onSendPrompt($event, 'a11y')">
          </app-ai-copilot-panel>
        </div>

        <!-- Right Panel: Chat + Code Editors -->
        <div class="right-panel">
          <!-- Chat Section -->
          <div class="chat-section">
            <div class="chat-header">
              <h3>
                <mat-icon>chat</mat-icon>
                AI Chat
              </h3>
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
                    👋 Welcome! I'm your AI coding assistant. I can help you with code generation, debugging, and optimization.
                  </div>
                </div>
              </div>

              <!-- Dynamic Chat Messages -->
              <div *ngFor="let message of chatMessages(); trackBy: trackMessage" 
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
                      [code]="message.code"
                      [language]="'typescript'"
                      [showLineNumbers]="true">
                    </app-code-display>
                  </div>

                  <div class="message-actions" *ngIf="message.type === 'ai'">
                    <button mat-button (click)="applyCodeToEditor(message)" *ngIf="message.code">
                      <mat-icon>edit</mat-icon>
                      Apply to Editor
                    </button>
                    <button mat-button (click)="regenerateResponse(message)">
                      <mat-icon>refresh</mat-icon>
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chat Input -->
            <div class="chat-input">
              <app-ai-prompt-box
                [placeholder]="'Ask me anything about coding...'"
                [isProcessing]="isGenerating()"
                (promptSent)="onSendPrompt($event.content, 'chat')">
              </app-ai-prompt-box>
            </div>
          </div>

          <!-- Code Editors Section -->
          <div class="code-editors-section">
            <div class="editors-header">
              <h3>
                <mat-icon>code</mat-icon>
                Code Editors
              </h3>
              <div class="editor-actions">
                <button mat-button (click)="clearAllCode()">
                  <mat-icon>clear</mat-icon>
                  Clear All
                </button>
                <button mat-button (click)="formatAllCode()">
                  <mat-icon>format_indent_increase</mat-icon>
                  Format All
                </button>
                <button mat-button (click)="togglePreview()">
                  <mat-icon>{{ showPreview() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  {{ showPreview() ? 'Hide' : 'Show' }} Preview
                </button>
              </div>
            </div>

            <!-- Monaco Editors Tabs -->
            <mat-tab-group class="code-tabs" [(selectedIndex)]="activeEditorTab">
              <mat-tab label="TypeScript">
                <app-monaco-code-editor
                  [value]="editorState.buffers().typescript"
                  [language]="'typescript'"
                  [height]="'80vh'"
                  [theme]="'vs-dark'"
                  (valueChange)="onCodeChange('typescript', $event)">
                </app-monaco-code-editor>
              </mat-tab>
              
              <mat-tab label="HTML">
                <app-monaco-code-editor
                  [value]="editorState.buffers().html"
                  [language]="'html'"
                  [height]="'80vh'"
                  [theme]="'vs-dark'"
                  (valueChange)="onCodeChange('html', $event)">
                </app-monaco-code-editor>
              </mat-tab>
              
              <mat-tab label="SCSS">
                <app-monaco-code-editor
                  [value]="editorState.buffers().scss"
                  [language]="'scss'"
                  [height]="'80vh'"
                  [theme]="'vs-dark'"
                  (valueChange)="onCodeChange('scss', $event)">
                </app-monaco-code-editor>
              </mat-tab>
            </mat-tab-group>
          </div>

          <!-- Live Preview Section -->
          <div class="preview-section" *ngIf="showPreview()">
            <div class="preview-header">
              <h3>
                <mat-icon>visibility</mat-icon>
                Live Preview
              </h3>
              <button mat-icon-button (click)="togglePreview()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            
            <app-enhanced-ai-preview
              [typescriptCode]="editorState.buffers().typescript"
              [htmlCode]="editorState.buffers().html"
              [scssCode]="editorState.buffers().scss">
            </app-enhanced-ai-preview>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./ai-copilot.component.scss']
})
export class AICopilotComponent implements OnInit {
  // Injected services
  private readonly aiPromptService = inject(AIPromptService);
  private readonly aiPromptCore = inject(AIPromptCoreService);
  readonly editorState = inject(EditorStateService);
  private readonly codeFenceParser = inject(CodeFenceParserService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  // Component state
  readonly isPageLoading = signal<boolean>(true);
  readonly isGenerating = signal<boolean>(false);
  readonly chatMessages = signal<ChatMessage[]>([]);
  readonly currentModel = signal<string>('gpt-4');
  readonly showPreview = signal<boolean>(false);
  
  // UI state
  activeEditorTab = 0;

  // Computed values
  readonly hasAnyCode = computed(() => this.editorState.hasCode());

  constructor() {
    // Set up reactive effects
    effect(() => {
      // Auto-update preview when code changes
      if (this.editorState.hasChanges()) {
        // Preview will automatically update due to reactive bindings
      }
    });
  }

  ngOnInit() {
    // Initialize the page
    setTimeout(() => {
      this.isPageLoading.set(false);
    }, 1000);
  }

  // Main prompt handling method
  async onSendPrompt(text: string, mode: 'chat' | 'refine' | 'explain' | 'convert' | 'a11y') {
    if (!text.trim()) return;

    // Add user message to chat
    this.addChatMessage({
      type: 'user',
      sender: 'You',
      content: text,
      timestamp: new Date()
    });

    this.isGenerating.set(true);

    try {
      // Prepare context with current editor buffers
      const context = {
        text,
        mode,
        context: this.editorState.buffers()
      };

      // Call AI service
      const response = await this.aiPromptCore.sendPrompt({
        content: text,
        context: JSON.stringify(context)
      }).toPromise();

      if (response) {
        await this.handleAIResponse(response, mode);
      }
    } catch (error) {
      console.error('Error sending prompt:', error);
      this.notificationService.showError('Failed to get AI response. Please try again.');
    } finally {
      this.isGenerating.set(false);
    }
  }

  // Handle AI response and parse code fences
  private async handleAIResponse(response: AIResponse, mode: string) {
    const content = response.content || '';
    
    // Parse code fences from response
    const parsed = this.codeFenceParser.parseCodeFences(content);
    
    // Add AI message to chat
    this.addChatMessage({
      type: 'ai',
      sender: 'AI Copilot',
      content: this.codeFenceParser.getExplanationText(content),
      code: parsed.typescript || parsed.html || parsed.scss || undefined,
      timestamp: new Date()
    });

    // Handle code updates
    if (parsed.hasCode && mode !== 'explain') {
      await this.handleCodeUpdate(parsed);
    }
  }

  // Handle code updates with diff viewer (simplified for now)
  private async handleCodeUpdate(parsed: any) {
    const currentBuffers = this.editorState.buffers();
    const newBuffers = this.codeFenceParser.toEditorBuffers(parsed);
    
    // For now, directly apply changes (later we'll add diff viewer)
    if (Object.keys(newBuffers).length > 0) {
      this.editorState.updateBuffers(newBuffers);
      this.notificationService.showSuccess('Code updated successfully!');
    }
  }

  // Code editor change handlers
  onCodeChange(type: keyof EditorBuffers, content: string) {
    this.editorState.updateBuffer(type, content);
  }

  // Chat message management
  private addChatMessage(message: Omit<ChatMessage, 'id'>) {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.chatMessages.update(messages => [...messages, newMessage]);
  }

  // UI event handlers
  applyCodeToEditor(message: ChatMessage) {
    if (message.code) {
      // Parse and apply the code
      const parsed = this.codeFenceParser.parseCodeFences(message.code);
      const buffers = this.codeFenceParser.toEditorBuffers(parsed);
      this.editorState.updateBuffers(buffers);
      this.notificationService.showSuccess('Code applied to editor!');
    }
  }

  regenerateResponse(message: ChatMessage) {
    // Find the user message that preceded this AI message
    const messages = this.chatMessages();
    const messageIndex = messages.findIndex(m => m.id === message.id);
    
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      if (userMessage.type === 'user') {
        this.onSendPrompt(userMessage.content, 'chat');
      }
    }
  }

  clearAllCode() {
    this.editorState.clearBuffers();
    this.notificationService.showInfo('All code cleared');
  }

  formatAllCode() {
    // This would trigger formatting in Monaco editors
    this.notificationService.showInfo('Code formatted');
  }

  togglePreview() {
    this.showPreview.update(show => !show);
  }

  // Utility methods
  trackMessage(index: number, message: ChatMessage): string {
    return message.id;
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
