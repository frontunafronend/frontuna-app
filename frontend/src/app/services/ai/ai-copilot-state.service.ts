import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AIResponse, AIPrompt, AISuggestion } from '@app/models/ai.model';

export interface AICopilotState {
  isProcessing: boolean;
  currentStep: 'idle' | 'thinking' | 'generating' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  subMessage?: string;
  error?: string;
  response?: AIResponse;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  sender: string;
  content: string;
  code?: {
    typescript?: string;
    html?: string;
    css?: string;
    javascript?: string;
  };
  timestamp: Date;
  isEditable?: boolean;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AICopilotStateService {
  
  // Core state signals
  private readonly stateSignal = signal<AICopilotState>({
    isProcessing: false,
    currentStep: 'idle',
    progress: 0,
    message: 'Ready to help'
  });

  // Chat state
  private readonly chatMessagesSignal = signal<ChatMessage[]>([]);
  private readonly currentContextSignal = signal<string>('');
  
  // History and suggestions
  private readonly promptHistorySignal = signal<AIPrompt[]>([]);
  private readonly suggestionsSignal = signal<AISuggestion[]>([]);
  
  // Generated content
  private readonly generatedCodeSignal = signal<string>('');
  private readonly lastResponseSignal = signal<AIResponse | null>(null);

  // Public readonly signals
  public readonly state = this.stateSignal.asReadonly();
  public readonly chatMessages = this.chatMessagesSignal.asReadonly();
  public readonly currentContext = this.currentContextSignal.asReadonly();
  public readonly promptHistory = this.promptHistorySignal.asReadonly();
  public readonly suggestions = this.suggestionsSignal.asReadonly();
  public readonly generatedCode = this.generatedCodeSignal.asReadonly();
  public readonly lastResponse = this.lastResponseSignal.asReadonly();

  // Computed properties
  public readonly isProcessing = computed(() => this.stateSignal().isProcessing);
  public readonly currentStep = computed(() => this.stateSignal().currentStep);
  public readonly progress = computed(() => this.stateSignal().progress);
  public readonly currentMessage = computed(() => this.stateSignal().message);
  public readonly hasError = computed(() => !!this.stateSignal().error);
  public readonly errorMessage = computed(() => this.stateSignal().error);
  
  // Chat computed properties
  public readonly messageCount = computed(() => this.chatMessagesSignal().length);
  public readonly lastMessage = computed(() => {
    const messages = this.chatMessagesSignal();
    return messages.length > 0 ? messages[messages.length - 1] : null;
  });
  public readonly hasConversation = computed(() => this.chatMessagesSignal().length > 0);

  constructor() {
    this.initializeWelcomeMessage();
  }

  /**
   * Start a new AI processing session
   */
  startProcessing(step: 'thinking' | 'generating' | 'processing', message: string, subMessage?: string) {
    this.stateSignal.update(state => ({
      ...state,
      isProcessing: true,
      currentStep: step,
      progress: 0,
      message,
      subMessage,
      error: undefined
    }));
  }

  /**
   * Update processing progress
   */
  updateProgress(progress: number, message?: string, subMessage?: string) {
    this.stateSignal.update(state => ({
      ...state,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || state.message,
      subMessage: subMessage || state.subMessage
    }));
  }

  /**
   * Complete processing with success
   */
  completeProcessing(response: AIResponse, message: string = 'Completed successfully') {
    this.stateSignal.update(state => ({
      ...state,
      isProcessing: false,
      currentStep: 'completed',
      progress: 100,
      message,
      subMessage: undefined,
      error: undefined,
      response
    }));

    this.lastResponseSignal.set(response);

    // Auto-reset to idle after 3 seconds
    setTimeout(() => {
      this.resetToIdle();
    }, 3000);
  }

  /**
   * Handle processing error
   */
  handleError(error: string, shouldRetry: boolean = false) {
    this.stateSignal.update(state => ({
      ...state,
      isProcessing: false,
      currentStep: 'error',
      progress: 0,
      message: shouldRetry ? 'Retrying...' : 'Error occurred',
      subMessage: undefined,
      error
    }));

    if (!shouldRetry) {
      // Auto-reset to idle after 5 seconds
      setTimeout(() => {
        this.resetToIdle();
      }, 5000);
    }
  }

  /**
   * Reset to idle state
   */
  resetToIdle() {
    this.stateSignal.update(state => ({
      ...state,
      isProcessing: false,
      currentStep: 'idle',
      progress: 0,
      message: 'Ready to help',
      subMessage: undefined,
      error: undefined
    }));
  }

  /**
   * Add a chat message
   */
  addChatMessage(type: 'user' | 'ai' | 'system', sender: string, content: string, code?: any, metadata?: any) {
    const message: ChatMessage = {
      id: this.generateId(),
      type,
      sender,
      content,
      code,
      timestamp: new Date(),
      metadata
    };

    this.chatMessagesSignal.update(messages => [...messages, message]);
    
    // Keep only last 100 messages for performance
    if (this.chatMessagesSignal().length > 100) {
      this.chatMessagesSignal.update(messages => messages.slice(-100));
    }

    return message;
  }

  /**
   * Update a chat message
   */
  updateChatMessage(messageId: string, updates: Partial<ChatMessage>) {
    this.chatMessagesSignal.update(messages =>
      messages.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    );
  }

  /**
   * Remove a chat message
   */
  removeChatMessage(messageId: string) {
    this.chatMessagesSignal.update(messages =>
      messages.filter(msg => msg.id !== messageId)
    );
  }

  /**
   * Clear chat history
   */
  clearChatHistory() {
    this.chatMessagesSignal.set([]);
    this.initializeWelcomeMessage();
  }

  /**
   * Add to prompt history
   */
  addToPromptHistory(prompt: AIPrompt) {
    this.promptHistorySignal.update(history => {
      const newHistory = [prompt, ...history];
      return newHistory.slice(0, 50); // Keep only last 50 prompts
    });
  }

  /**
   * Update suggestions
   */
  updateSuggestions(suggestions: AISuggestion[]) {
    this.suggestionsSignal.set(suggestions);
  }

  /**
   * Set generated code
   */
  setGeneratedCode(code: string) {
    this.generatedCodeSignal.set(code);
  }

  /**
   * Update current context
   */
  setCurrentContext(context: string) {
    this.currentContextSignal.set(context);
  }

  /**
   * Get processing step message for display
   */
  getStepMessage(step: string): { message: string; subMessage?: string } {
    switch (step) {
      case 'thinking':
        return {
          message: 'AI is analyzing your request',
          subMessage: 'Understanding context and requirements'
        };
      case 'generating':
        return {
          message: 'Generating code solution',
          subMessage: 'Creating optimized components'
        };
      case 'processing':
        return {
          message: 'Processing your request',
          subMessage: 'Please wait while we work on this'
        };
      case 'completed':
        return {
          message: 'Task completed successfully',
          subMessage: 'Your code is ready'
        };
      case 'error':
        return {
          message: 'Something went wrong',
          subMessage: 'Please try again or check your request'
        };
      default:
        return {
          message: 'Ready to help',
          subMessage: 'Ask me anything about coding'
        };
    }
  }

  /**
   * Simulate realistic processing steps
   */
  simulateProcessingSteps(totalDuration: number = 3000): Observable<AICopilotState> {
    return new Observable(observer => {
      const steps = [
        { step: 'thinking', duration: 0.3, message: 'Analyzing your request' },
        { step: 'processing', duration: 0.4, message: 'Understanding requirements' },
        { step: 'generating', duration: 0.3, message: 'Creating solution' }
      ];

      let currentTime = 0;
      let stepIndex = 0;

      const processStep = () => {
        if (stepIndex >= steps.length) {
          observer.complete();
          return;
        }

        const currentStepInfo = steps[stepIndex];
        const stepDuration = totalDuration * currentStepInfo.duration;
        const progressStart = stepIndex * (100 / steps.length);
        const progressEnd = (stepIndex + 1) * (100 / steps.length);

        this.stateSignal.update(state => ({
          ...state,
          currentStep: currentStepInfo.step as any,
          message: currentStepInfo.message
        }));

        // Animate progress within this step
        const animateProgress = () => {
          currentTime += 100;
          const stepProgress = Math.min(currentTime / stepDuration, 1);
          const overallProgress = progressStart + (stepProgress * (progressEnd - progressStart));

          this.updateProgress(overallProgress);
          observer.next(this.stateSignal());

          if (stepProgress < 1) {
            setTimeout(animateProgress, 100);
          } else {
            stepIndex++;
            currentTime = 0;
            setTimeout(processStep, 100);
          }
        };

        animateProgress();
      };

      processStep();
    });
  }

  private initializeWelcomeMessage() {
    // Add welcome message only if no messages exist
    if (this.chatMessagesSignal().length === 0) {
      // Use setTimeout to defer welcome message initialization
      setTimeout(() => {
        this.addChatMessage(
          'ai',
          'AI Copilot',
          '👋 Welcome to your professional AI coding assistant!\n\n🚀 I can help you:\n• Generate React, Angular, Vue components\n• Debug and optimize your code\n• Refactor and improve code structure\n• Answer programming questions\n• Create responsive UI components\n\n💡 Try clicking a starter prompt below or ask me anything!',
          undefined,
          { isWelcome: true }
        );
      }, 200);
    }
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
