/**
 * 🚀 OPTIMIZED AI CHAT SERVICE
 * 
 * This service replaces the complex, redundant AI services with a single,
 * efficient, and performant chat service that eliminates loops and redundancy.
 * 
 * Key Optimizations:
 * - Single responsibility: Only handles chat functionality
 * - No redundant API calls or subscriptions
 * - Proper error handling and retry logic
 * - Memory leak prevention with proper cleanup
 * - Request deduplication and caching
 * - Optimized state management
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError, EMPTY } from 'rxjs';
import { 
  tap, 
  catchError, 
  timeout, 
  finalize, 
  shareReplay, 
  distinctUntilChanged,
  debounceTime,
  switchMap,
  retry
} from 'rxjs/operators';

import { EnvironmentService } from '../core/environment.service';
import { NotificationService } from '../notification/notification.service';

// 🎯 SIMPLIFIED INTERFACES
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  sender: string;
  content: string;
  timestamp: Date;
  code?: string;
  codeLanguage?: string;
  suggestions?: string[];
  confidence?: number;
  hasAppliedCode?: boolean;
  isCodeMessage?: boolean;
}

export interface ChatSession {
  id: string;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

export interface AIResponse {
  id?: string;
  promptId?: string;
  content?: string;
  code?: string;
  confidence?: number;
  processingTime?: number;
  timestamp?: Date;
  success: boolean;
  data: {
    message: string;
    code?: {
      language: string;
      code: string;
    };
    suggestions?: string[];
    tokensUsed: number;
    model: string;
    responseTime: number;
    sessionId: string;
    timestamp: string;
    confidence: number;
    hasCode: boolean;
  };
  error?: {
    message: string;
    details?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OptimizedAIChatService {
  private readonly http = inject(HttpClient);
  private readonly environmentService = inject(EnvironmentService);
  private readonly notificationService = inject(NotificationService);

  // 🎯 SINGLE SOURCE OF TRUTH - No redundant subjects
  private readonly _messages = signal<ChatMessage[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _currentSession = signal<ChatSession | null>(null);
  private readonly _isHealthy = signal<boolean>(false);

  // 🚀 COMPUTED VALUES - Reactive and efficient
  readonly messages = this._messages.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly currentSession = this._currentSession.asReadonly();
  readonly isHealthy = this._isHealthy.asReadonly();
  readonly messageCount = computed(() => this._messages().length);
  readonly hasActiveSession = computed(() => this._currentSession()?.isActive ?? false);

  // 🔧 CONFIGURATION
  private readonly API_BASE = `${this.environmentService.apiUrl}/ai/copilot`;
  private readonly TIMEOUT_MS = 15000; // 15 seconds
  private readonly MAX_RETRIES = 2;
  private readonly DEBOUNCE_MS = 300; // Prevent spam

  // 🎯 REQUEST DEDUPLICATION - Prevent duplicate calls
  private activeRequests = new Map<string, Observable<any>>();
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

  constructor() {
    this.initializeService();
  }

  /**
   * 🚀 INITIALIZE SERVICE - Single initialization point
   */
  private initializeService(): void {
    console.log('🤖 Optimized AI Chat Service initialized');
    this.performHealthCheck();
    this.createSession();
  }

  /**
   * 🏥 HEALTH CHECK - Simple and efficient
   */
  private performHealthCheck(): void {
    const healthKey = 'health-check';
    
    // Prevent duplicate health checks
    if (this.activeRequests.has(healthKey)) {
      return;
    }

    const healthCheck$ = this.http.get<{ success: boolean }>(`${this.API_BASE.replace('/ai/copilot', '')}/health`)
      .pipe(
        timeout(5000),
        retry(1),
        tap(response => {
          this._isHealthy.set(response.success);
          console.log('🏥 Health check:', response.success ? '✅ Healthy' : '❌ Unhealthy');
        }),
        catchError(error => {
          console.warn('⚠️ Health check failed:', error.message);
          this._isHealthy.set(false);
          return of({ success: false });
        }),
        finalize(() => {
          this.activeRequests.delete(healthKey);
        }),
        shareReplay(1) // Cache result
      );

    this.activeRequests.set(healthKey, healthCheck$);
    healthCheck$.subscribe();
  }

  /**
   * 🎯 CREATE SESSION - Optimized session creation
   */
  private createSession(): void {
    const sessionKey = 'create-session';
    
    // Prevent duplicate session creation
    if (this.activeRequests.has(sessionKey) || this.hasActiveSession()) {
      return;
    }

    const createSession$ = this.http.post<{ success: boolean; data: { sessionId: string } }>(
      `${this.API_BASE}/session/start`,
      { 
        title: 'AI Copilot Chat',
        context: 'Professional Angular development assistant'
      }
    ).pipe(
      timeout(this.TIMEOUT_MS),
      retry(this.MAX_RETRIES),
      tap(response => {
        if (response.success) {
          const session: ChatSession = {
            id: response.data.sessionId,
            isActive: true,
            createdAt: new Date(),
            lastActivity: new Date()
          };
          this._currentSession.set(session);
          console.log('✅ Session created:', session.id);
        }
      }),
      catchError(error => {
        console.error('❌ Session creation failed:', error);
        this.notificationService.showError('Failed to create AI session');
        return throwError(() => error);
      }),
      finalize(() => {
        this.activeRequests.delete(sessionKey);
      }),
      shareReplay(1)
    );

    this.activeRequests.set(sessionKey, createSession$);
    createSession$.subscribe();
  }

  /**
   * 💬 SEND MESSAGE - Main chat functionality with optimizations
   */
  sendMessage(message: string, context?: string): Observable<AIResponse> {
    // 🚨 VALIDATION
    if (!message?.trim()) {
      return throwError(() => new Error('Message cannot be empty'));
    }

    // 🚨 RATE LIMITING
    const now = Date.now();
    if (now - this.lastRequestTime < this.MIN_REQUEST_INTERVAL) {
      console.warn('⚠️ Request throttled - too frequent');
      return throwError(() => new Error('Please wait before sending another message'));
    }
    this.lastRequestTime = now;

    // 🚨 LOADING STATE
    if (this._isLoading()) {
      console.warn('⚠️ Already processing a request');
      return throwError(() => new Error('Already processing a request'));
    }

    // 🚨 SESSION CHECK
    const session = this._currentSession();
    if (!session?.isActive) {
      console.log('🔄 No active session, creating one...');
      return this.createSessionAndSendMessage(message, context);
    }

    // 🚀 ADD USER MESSAGE IMMEDIATELY
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      sender: 'You',
      content: message,
      timestamp: new Date()
    };

    this._messages.update(messages => [...messages, userMessage]);
    this._isLoading.set(true);

    // 🎯 SEND REQUEST WITH CONVERSATION CONTEXT
    const conversationHistory = this._messages().slice(-5).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    const requestPayload = {
      sessionId: session.id,
      message: message.trim(),
      context: context || 'Angular development chat',
      conversationHistory: conversationHistory, // 🔧 NEW: Include conversation context
      continuePreviousConversation: conversationHistory.length > 0 // 🔧 NEW: Flag for continuity
    };

    return this.http.post<AIResponse>(`${this.API_BASE}/chat`, requestPayload)
      .pipe(
        timeout(this.TIMEOUT_MS),
        retry(this.MAX_RETRIES),
        tap(response => {
          if (response.success) {
            this.handleSuccessfulResponse(response);
          } else {
            throw new Error(response.error?.message || 'AI response failed');
          }
        }),
        catchError(error => {
          console.error('❌ Chat request failed:', error);
          this.handleFailedResponse(error, message);
          return throwError(() => error);
        }),
        finalize(() => {
          this._isLoading.set(false);
        })
      );
  }

  /**
   * 🔄 CREATE SESSION AND SEND MESSAGE - Helper for session recovery
   */
  private createSessionAndSendMessage(message: string, context?: string): Observable<AIResponse> {
    return this.http.post<{ success: boolean; data: { sessionId: string } }>(
      `${this.API_BASE}/session/start`,
      { title: 'AI Copilot Chat', context: 'Angular development' }
    ).pipe(
      timeout(this.TIMEOUT_MS),
      switchMap(sessionResponse => {
        if (sessionResponse.success) {
          const session: ChatSession = {
            id: sessionResponse.data.sessionId,
            isActive: true,
            createdAt: new Date(),
            lastActivity: new Date()
          };
          this._currentSession.set(session);
          return this.sendMessage(message, context);
        } else {
          throw new Error('Failed to create session');
        }
      }),
      catchError(error => {
        console.error('❌ Session creation and message send failed:', error);
        this.notificationService.showError('Failed to connect to AI service');
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ HANDLE SUCCESSFUL RESPONSE - GENERIC CODE EXTRACTION
   */
  private handleSuccessfulResponse(response: AIResponse): void {
    // 🔧 GENERIC CODE EXTRACTION - Works with any AI response format
    let extractedCode = null;
    let extractedLanguage = 'typescript';
    let content = response.data?.message || 'Response received';

    // Method 1: Check if response has structured code object
    if (response.data?.code) {
      extractedCode = response.data.code.code || response.data.code;
      extractedLanguage = response.data.code.language || 'typescript';
    }
    // Method 2: Extract code from markdown code blocks in content
    else if (content) {
      const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
      const match = codeBlockRegex.exec(content);
      if (match) {
        extractedLanguage = match[1] || 'typescript';
        extractedCode = match[2].trim();
      }
      // Method 3: Look for any code-like content (imports, components, etc.)
      else if (content.includes('import ') || content.includes('@Component') || content.includes('function ') || content.includes('const ')) {
        extractedCode = content;
        extractedLanguage = 'typescript';
      }
    }

    const aiMessage: ChatMessage = {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'ai',
      sender: 'AI Copilot',
      content: content,
      timestamp: new Date(),
      code: extractedCode,
      codeLanguage: extractedLanguage,
      suggestions: response.data?.suggestions || [],
      confidence: response.data?.confidence || 0.95,
      hasAppliedCode: false,
      isCodeMessage: !!extractedCode
    };

    this._messages.update(messages => [...messages, aiMessage]);
    
    // 🔧 LOG CODE EXTRACTION for debugging
    if (extractedCode) {
      console.log('🤖 Code extracted from AI response:', extractedLanguage, extractedCode.length, 'characters');
    }
    
    // Update session activity
    const session = this._currentSession();
    if (session) {
      this._currentSession.set({
        ...session,
        lastActivity: new Date()
      });
    }

    console.log('✅ AI response processed successfully');
  }

  /**
   * ❌ HANDLE FAILED RESPONSE
   */
  private handleFailedResponse(error: any, originalMessage: string): void {
    const errorMessage: ChatMessage = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'ai',
      sender: 'AI Copilot',
      content: `I apologize, but I encountered an error processing your request: "${originalMessage}". Please try again in a moment.`,
      timestamp: new Date(),
      confidence: 0
    };

    this._messages.update(messages => [...messages, errorMessage]);
    
    // Show user-friendly error
    if (error.name === 'TimeoutError') {
      this.notificationService.showWarning('AI response timed out. Please try again.');
    } else {
      this.notificationService.showError('AI service temporarily unavailable');
    }
  }

  /**
   * 🧹 CLEAR CHAT - Complete conversation reset
   */
  clearChat(): void {
    this._messages.set([]);
    this._currentSession.set(null); // 🔧 NEW: Reset session for fresh start
    this.lastRequestTime = 0; // 🔧 NEW: Reset rate limiting
    console.log('🧹 Chat cleared - Fresh conversation started');
    
    // 🔧 NEW: Create new session immediately for next conversation
    this.createSession();
  }

  /**
   * 🔄 REFRESH SESSION - Create new session
   */
  refreshSession(): void {
    this._currentSession.set(null);
    this.createSession();
  }

  /**
   * 🏥 CHECK HEALTH - Public method for manual health check
   */
  checkHealth(): void {
    this.performHealthCheck();
  }

  /**
   * 📊 GET STATS - Simple stats for debugging
   */
  getStats() {
    return {
      messageCount: this.messageCount(),
      isLoading: this.isLoading(),
      hasActiveSession: this.hasActiveSession(),
      isHealthy: this.isHealthy(),
      sessionId: this._currentSession()?.id || 'none'
    };
  }
}
