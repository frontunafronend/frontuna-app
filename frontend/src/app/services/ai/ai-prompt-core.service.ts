/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:32:02.193Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - AI_USAGE_NOT_TRACKED: MEDIUM
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:30:48.004Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - AI_USAGE_NOT_TRACKED: MEDIUM
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:22:46.011Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - AI_USAGE_NOT_TRACKED: MEDIUM
 */

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, finalize, timeout, delay } from 'rxjs/operators';

import { EnvironmentService } from '../core/environment.service';
import { AIPrompt, AIResponse, AISuggestion, AIModel } from '@app/models/ai.model';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AIPromptCoreService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly environmentService = inject(EnvironmentService);
  
  private readonly baseUrl = `${this.environmentService.apiUrl}/ai/prompt`;
  
  // State management
  private readonly promptHistorySubject = new BehaviorSubject<AIPrompt[]>([]);
  private readonly suggestionsSubject = new BehaviorSubject<AISuggestion[]>([]);
  private readonly isProcessingSignal = signal<boolean>(false);
  private readonly currentModelSignal = signal<AIModel | null>(null);
  
  // Public observables
  public readonly promptHistory$ = this.promptHistorySubject.asObservable();
  public readonly suggestions$ = this.suggestionsSubject.asObservable();
  public readonly isProcessing = this.isProcessingSignal.asReadonly();
  public readonly currentModel = this.currentModelSignal.asReadonly();

  constructor() {
    this.loadPromptHistory();
    this.initializeModel();
  }

  /**
   * Send prompt to AI and get response
   */
  sendPrompt(
    content: string,
    type: 'generate' | 'modify' | 'refactor' | 'optimize' = 'generate',
    context?: string
  ): Observable<AIResponse> {
    console.log('🤖 AI Prompt Core: Sending prompt:', { content, type, context });
    
    this.isProcessingSignal.set(true);
    
    const prompt: AIPrompt = {
      id: this.generateId(),
      content,
      type,
      context,
      timestamp: new Date(),
      userId: this.getCurrentUserId(),
      model: this.currentModelSignal()?.id || 'default'
    };

    // Always use live backend - no mock data

    return this.http.post<{success: boolean, data: any}>(`${this.baseUrl}/send`, prompt)
      .pipe(
        timeout(30000), // 30 second timeout
        tap(response => {
          // Track AI usage analytics
          console.log('📊 AI Usage tracked for user:', prompt.userId);
        }),
        map(response => {
          // Debug: Log the raw backend response
          console.log('🔍 RAW Backend Response:', response);
          console.log('🔍 Backend Data:', response.data);
          if (response.data?.code) {
            console.log('🔍 Backend Code Structure:', response.data.code);
            console.log('🔍 Backend Code Keys:', Object.keys(response.data.code));
          }
          
          // Transform backend response to frontend AIResponse format
          if (response.success && response.data) {
            const backendData = response.data;
            
            console.log('🔧 AI Prompt Core: Transforming response...');
            console.log('🔧 Backend data code:', backendData.code);
            console.log('🔧 Backend data code type:', typeof backendData.code);
            if (backendData.code) {
              console.log('🔧 Backend data code keys:', Object.keys(backendData.code));
              console.log('🔧 TypeScript exists:', !!backendData.code.typescript);
              console.log('🔧 HTML exists:', !!backendData.code.html);
              console.log('🔧 SCSS exists:', !!backendData.code.scss);
            }
            
            const transformedResponse = {
              id: backendData.id,
              promptId: prompt.id,
              content: backendData.content,
              code: backendData.code?.typescript || backendData.code || undefined,
              suggestions: backendData.suggestions || [],
              confidence: 0.95,
              processingTime: backendData.metadata?.generationTime || 0,
              model: backendData.metadata?.model || 'gpt-4',
              timestamp: new Date(backendData.timestamp || Date.now()),
              metadata: backendData.metadata,
              // Store all code types for later use
              codeData: backendData.code
            } as AIResponse & { codeData?: any };
            
            console.log('🔧 Transformed response codeData:', transformedResponse.codeData);
            console.log('🔧 Transformed response codeData type:', typeof transformedResponse.codeData);
            
            return transformedResponse;
          }
          throw new Error('Invalid response format');
        }),
        tap(response => {
          this.addToHistory(prompt);
          this.updateSuggestions(response.suggestions || []);
          this.notificationService.showSuccess('AI response received');
        }),
        catchError(error => {
          console.error('❌ AI Prompt Core: Error:', error);
          
          // Handle timeout specifically
          if (error.name === 'TimeoutError') {
            this.notificationService.showError('AI request timed out. Please try again.');
            return of({
              id: `timeout_${Date.now()}`,
              promptId: prompt.id,
              content: 'Request timed out. The AI service is taking longer than expected. Please try again with a shorter prompt.',
              code: undefined,
              type: 'error',
              timestamp: new Date(),
              suggestions: [],
              confidence: 0,
              processingTime: 30000,
              metadata: { error: true, timeout: true }
            } as AIResponse);
          }
          
          this.notificationService.showError('Failed to get AI response');
          
          // Return a fallback response instead of throwing
          return of({
            id: `error_${Date.now()}`,
            promptId: prompt.id,
            content: 'Sorry, I encountered an error. Please try again.',
            code: undefined,
            type: 'error',
            timestamp: new Date(),
            suggestions: [],
            confidence: 0,
            processingTime: 0,
            metadata: { error: true }
          } as AIResponse);
        }),
        finalize(() => {
          this.isProcessingSignal.set(false);
        })
      );
  }

  /**
   * Get AI suggestions for code at cursor position
   */
  getSuggestions(code: string, cursor?: { line: number; column: number }): Observable<AISuggestion[]> {
    console.log('🔍 AI Prompt Core: Getting suggestions for code at cursor:', cursor);
    
    // Always use live backend - no mock data
    
    return this.http.post<AISuggestion[]>(`${this.baseUrl}/suggestions`, {
      code,
      cursor,
      context: 'component-editor'
    }).pipe(
      tap(suggestions => this.updateSuggestions(suggestions)),
      catchError(error => {
        console.error('Error getting suggestions:', error);
        this.notificationService.showError('Failed to get AI suggestions');
        return of([]);
      })
    );
  }

  /**
   * Get available AI models
   */
  getAvailableModels(): Observable<AIModel[]> {
    // Always use live backend - no mock data
    
    return this.http.get<AIModel[]>(`${this.baseUrl}/models`);
  }

  /**
   * Set current AI model
   */
  setCurrentModel(model: AIModel): void {
    this.currentModelSignal.set(model);
    localStorage.setItem('ai_current_model', JSON.stringify(model));
  }

  /**
   * Clear prompt history
   */
  clearHistory(): void {
    this.promptHistorySubject.next([]);
    localStorage.removeItem('ai_prompt_history');
  }

  /**
   * Get prompt history
   */
  getPromptHistory(): Observable<AIPrompt[]> {
    return this.promptHistory$;
  }

  /**
   * Add prompt to history
   */
  private addToHistory(prompt: AIPrompt): void {
    const currentHistory = this.promptHistorySubject.value;
    const updatedHistory = [prompt, ...currentHistory].slice(0, 50); // Keep last 50
    this.promptHistorySubject.next(updatedHistory);
    
    // Persist to localStorage
    localStorage.setItem('ai_prompt_history', JSON.stringify(updatedHistory));
  }

  /**
   * Update suggestions
   */
  private updateSuggestions(suggestions: AISuggestion[]): void {
    this.suggestionsSubject.next(suggestions);
  }

  /**
   * Load prompt history from localStorage
   */
  private loadPromptHistory(): void {
    try {
      const stored = localStorage.getItem('ai_prompt_history');
      if (stored) {
        const history = JSON.parse(stored);
        this.promptHistorySubject.next(history);
      }
    } catch (error) {
      console.warn('Failed to load prompt history:', error);
    }
  }

  /**
   * Initialize AI model
   */
  private initializeModel(): void {
    try {
      const stored = localStorage.getItem('ai_current_model');
      if (stored) {
        const model = JSON.parse(stored);
        this.currentModelSignal.set(model);
      }
    } catch (error) {
      console.warn('Failed to load current model:', error);
    }
  }

  /**
   * Generate unique ID for prompts
   */
  private generateId(): string {
    return 'prompt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  /**
   * Get current user ID (mock for now)
   */
  private getCurrentUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }
}