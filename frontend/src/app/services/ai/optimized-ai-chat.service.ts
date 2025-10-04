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
  codeBlocks?: Array<{language: string, code: string}>; // Multiple code blocks
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
    codeBlocks?: Array<{language: string, code: string}>; // Multiple code blocks
    suggestions?: string[];
    tokensUsed: number;
    model: string;
    responseTime: number;
    sessionId: string;
    timestamp: string;
    confidence: number;
    hasCode: boolean;
    codeBlockCount?: number;
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
  private readonly TIMEOUT_MS = 45000; // 45 seconds for complex requests
  private readonly MAX_RETRIES = 1; // Reduce retries to avoid long waits
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
            // Handle specific error cases
            const errorData = response.error as any;
            const errorCode = errorData?.code;
            if (errorCode === 'MISSING_API_KEY') {
              throw new Error('MISSING_API_KEY: ' + (errorData?.details || 'OpenAI API key required'));
            } else if (errorCode === 'OPENAI_API_ERROR') {
              throw new Error('OPENAI_API_ERROR: ' + (errorData?.details || 'OpenAI service error'));
            } else {
              throw new Error(response.error?.message || 'AI response failed');
            }
          }
        }),
        catchError(error => {
          console.error('❌ Chat request failed:', error);
          
          // Check if error response has data (like API key missing)
          if (error.error?.data?.message) {
            // Show the backend's error message directly
            const errorMessage: ChatMessage = {
              id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'ai',
              sender: 'AI Copilot',
              content: error.error.data.message,
              timestamp: new Date(),
              confidence: 0
            };
            
            this._messages.update(messages => [...messages, errorMessage]);
            
            // Show appropriate notification
            if (error.error.data.requiresApiKey) {
              this.notificationService.showWarning('OpenAI API Key Required');
            } else {
              this.notificationService.showError('AI Service Error');
            }
          } else {
            this.handleFailedResponse(error, message);
          }
          
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
   * ✅ HANDLE SUCCESSFUL RESPONSE - ENHANCED FORMATTING & CODE EXTRACTION
   */
  private handleSuccessfulResponse(response: AIResponse): void {
    let extractedCode = null;
    let extractedLanguage = 'typescript';
    let content = response.data?.message || 'Response received';
    let formattedContent = content;

    // 🎨 ENHANCED CODE EXTRACTION WITH MULTIPLE BLOCKS
    const codeBlocks: Array<{language: string, code: string}> = [];
    
    // Method 1: Check if response has structured code blocks from backend
    if (response.data?.codeBlocks && Array.isArray(response.data.codeBlocks)) {
      // Use backend-provided code blocks directly
      codeBlocks.push(...response.data.codeBlocks);
      if (codeBlocks.length > 0 && !extractedCode) {
        extractedCode = codeBlocks[0].code;
        extractedLanguage = codeBlocks[0].language;
      }
    }
    // Fallback: Check if response has single structured code object
    else if (response.data?.code) {
      if (typeof response.data.code === 'string') {
        extractedCode = response.data.code;
        codeBlocks.push({ language: 'typescript', code: response.data.code });
      } else if (response.data.code.code) {
        extractedCode = response.data.code.code;
        extractedLanguage = response.data.code.language || 'typescript';
        codeBlocks.push({ language: extractedLanguage, code: response.data.code.code });
      }
    }
    
    // Method 2: Extract ALL code blocks from markdown content
    if (content) {
      const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
      let match;
      
      while ((match = codeBlockRegex.exec(content)) !== null) {
        const language = match[1] || 'typescript';
        const code = match[2].trim();
        
        if (code.length > 10) { // Only extract substantial code blocks
          codeBlocks.push({ language, code });
          
          // Use the first substantial code block as the main extracted code
          if (!extractedCode) {
            extractedCode = code;
            extractedLanguage = language;
          }
        }
      }
      
      // 🎨 CLEAN UP CONTENT - Remove code blocks for cleaner text display
      formattedContent = content
        .replace(/```[\w]*\n?[\s\S]*?```/g, '\n**[Code generated - see Monaco editor]**\n')
        .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
        .trim();
      
      // 📝 FORMAT TEXT CONTENT FOR BETTER READABILITY
      formattedContent = this.formatTextContent(formattedContent);
    }

    const aiMessage: ChatMessage = {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'ai',
      sender: 'AI Copilot',
      content: formattedContent, // Use formatted content instead of raw content
      timestamp: new Date(),
      code: extractedCode || undefined,
      codeLanguage: extractedLanguage,
      suggestions: response.data?.suggestions || [],
      confidence: response.data?.confidence || 0.95,
      hasAppliedCode: false,
      isCodeMessage: !!extractedCode,
      codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined // Store all code blocks
    };

    this._messages.update(messages => [...messages, aiMessage]);
    
    // 🔧 LOG CODE EXTRACTION for debugging
    if (extractedCode) {
      const codeLength = typeof extractedCode === 'string' ? extractedCode.length : 'unknown';
      console.log('🤖 Code extracted from AI response:', extractedLanguage, codeLength, 'characters');
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
    let errorContent = '';
    let notificationMessage = '';
    
    // Handle specific error types
    if (error.message?.includes('MISSING_API_KEY')) {
      errorContent = `🚫 **OpenAI API Key Required**

To get real ChatGPT responses, the OpenAI API key must be configured:

**Steps to Fix:**
1. Get your API key from: https://platform.openai.com/api-keys
2. Add to environment: \`OPENAI_API_KEY="sk-your-key-here"\`
3. Restart the server

**Your Request:** "${originalMessage}"

**No mock responses will be provided.** Only real AI responses are supported.`;
      
      notificationMessage = 'OpenAI API Key Required - Configure in environment variables';
      
    } else if (error.message?.includes('OPENAI_API_ERROR')) {
      errorContent = `🚫 **OpenAI API Error**

The OpenAI service encountered an error while processing your request.

**Your Request:** "${originalMessage}"

**Possible Solutions:**
1. Check your OpenAI API key is valid
2. Verify you have sufficient credits
3. Try again in a moment
4. Check OpenAI service status

**Error Details:** ${error.message.split('OPENAI_API_ERROR: ')[1] || 'Unknown error'}`;
      
      notificationMessage = 'OpenAI API Error - Please try again';
      
    } else if (error.name === 'TimeoutError') {
      errorContent = `⏰ **Request Timeout**

Your request "${originalMessage}" timed out while waiting for the AI response.

**Please try again with:**
- A shorter message
- Simpler request
- Check your internet connection`;
      
      notificationMessage = 'AI response timed out. Please try again.';
      
    } else {
      errorContent = `❌ **Service Error**

I encountered an error processing your request: "${originalMessage}"

**Error:** ${error.message || 'Unknown error'}

Please try again in a moment. If the problem persists, check the server logs.`;
      
      notificationMessage = 'AI service error - Please try again';
    }

    const errorMessage: ChatMessage = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'ai',
      sender: 'AI Copilot',
      content: errorContent,
      timestamp: new Date(),
      confidence: 0
    };

    this._messages.update(messages => [...messages, errorMessage]);
    
    // Show user-friendly notification
    if (error.message?.includes('MISSING_API_KEY')) {
      this.notificationService.showWarning(notificationMessage);
    } else {
      this.notificationService.showError(notificationMessage);
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

  /**
   * 🎨 BULLETPROOF TEXT FORMATTING - Final solution that ALWAYS works
   */
  private formatTextContent(content: string): string {
    console.log('🔧 Original content:', content.substring(0, 200));
    
    // 🧹 STEP 1: ULTRA AGGRESSIVE cleanup - remove ALL markdown artifacts
    let formatted = content
      .replace(/\*+/g, '') // Remove ALL asterisks
      .replace(/#+\s*/g, '') // Remove ALL hash headers
      .replace(/`+/g, '') // Remove ALL backticks
      .replace(/_{2,}/g, '') // Remove underscores
      .replace(/\[|\]/g, '') // Remove brackets
      .replace(/\s+/g, ' ') // Normalize all whitespace
      .trim();
    
    console.log('🧹 After cleanup:', formatted.substring(0, 200));
    
    // 🔧 STEP 2: Split into sentences and process each one
    const sentences = formatted.split(/([.!?])\s+/);
    let processedSentences = [];
    
    for (let i = 0; i < sentences.length; i++) {
      let sentence = sentences[i];
      
      // Skip punctuation marks
      if (sentence.match(/^[.!?]$/)) {
        if (processedSentences.length > 0) {
          processedSentences[processedSentences.length - 1] += sentence;
        }
        continue;
      }
      
      // 🔢 BULLETPROOF: Handle numbered items with FORCED line breaks
      if (sentence.match(/\b(\d+)\.\s+/)) {
        sentence = sentence.replace(/\b(\d+)\.\s+([^.]+)/g, (match, num, text) => {
          return `\n\n\n**${num}. ${text.trim()}**\n\n`;
        });
      }
      
      // 🔧 Handle Step indicators
      if (sentence.match(/Step\s+\d+/i)) {
        sentence = sentence.replace(/Step\s+(\d+):\s*/gi, '\n\n\n🔧 **Step $1:**\n\n');
      }
      
      // 📋 Handle bullet points
      if (sentence.match(/^\s*•/) || sentence.match(/^\s*-\s/)) {
        sentence = '\n\n• ' + sentence.replace(/^\s*[•-]\s*/, '').trim() + '\n';
      }
      
      processedSentences.push(sentence);
    }
    
    formatted = processedSentences.join(' ');
    
    // 🔧 STEP 3: FORCE numbered item formatting with HTML structure
    for (let pass = 0; pass < 3; pass++) {
      // Pass 1: Handle "1. Something" patterns with HTML wrapper
      formatted = formatted.replace(/(\s|^)(\d+)\.\s+([^.\n]+)/g, '\n\n\n<div class="numbered-item-wrapper"><strong data-starts-with-number="true">$2. $3</strong></div>\n\n');
      
      // Pass 2: Handle "• 1. Something" patterns
      formatted = formatted.replace(/•\s*(\d+)\.\s+([^.\n]+)/g, '\n\n\n<div class="numbered-item-wrapper"><strong data-starts-with-number="true">$1. $2</strong></div>\n\n');
      
      // Pass 3: Handle any remaining numbered patterns
      formatted = formatted.replace(/(\d+)\s*\.\s*([A-Z][^.\n]{10,})/g, '\n\n\n<div class="numbered-item-wrapper"><strong data-starts-with-number="true">$1. $2</strong></div>\n\n');
    }
    
    // 📝 STEP 4: Handle code mentions
    formatted = formatted
      .replace(/Code generated - see Monaco editor/gi, '\n\n📝 **Code generated - see Monaco editor**\n\n')
      .replace(/see Monaco editor/gi, '\n\n📝 **Code generated - see Monaco editor**\n\n');
    
    // 📋 STEP 5: Handle file names and sections
    formatted = formatted
      .replace(/(component\.(ts|html|scss))/gi, '\n\n📋 **$1**\n\n')
      .replace(/(Setup|Create|Using|Example|Conclusion)/gi, '\n\n📋 **$1**\n\n');
    
    // 🎨 STEP 6: Format technical terms
    formatted = formatted
      .replace(/\b(Angular|Material|Component|TypeScript|HTML|SCSS)\b/g, '**$1**');
    
    // 🧹 STEP 7: Final cleanup and normalization
    formatted = formatted
      .replace(/\n{4,}/g, '\n\n\n') // Max 3 line breaks
      .replace(/^\n+/, '') // Remove leading newlines
      .replace(/\n+$/, '') // Remove trailing newlines
      .replace(/\s{2,}/g, ' ') // Multiple spaces to single
      .trim();
    
    console.log('✅ Final formatted:', formatted.substring(0, 300));
    
    return formatted;
  }
}
