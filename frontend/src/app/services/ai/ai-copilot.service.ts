import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, switchMap, timeout, finalize } from 'rxjs/operators';
import { AISuggestion, AICodeEdit, AITestingResult } from '@app/models/ai.model';
import { EnvironmentService } from '../core/environment.service';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AICopilotService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly environmentService = inject(EnvironmentService);
  
  private readonly baseUrl = `${this.environmentService.apiUrl}/ai/copilot`;
  
  private readonly suggestionsSubject = new BehaviorSubject<AISuggestion[]>([]);
  private readonly activeSuggestionSubject = new BehaviorSubject<AISuggestion | null>(null);
  private readonly codeEditsSubject = new BehaviorSubject<AICodeEdit[]>([]);
  private readonly testingResultsSubject = new BehaviorSubject<AITestingResult[]>([]);
  
  // Chat functionality
  private readonly currentSessionSubject = new BehaviorSubject<string | null>(null);
  private readonly chatHistorySubject = new BehaviorSubject<any[]>([]);
  private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);
  
  // Public observables for chat
  readonly currentSession$ = this.currentSessionSubject.asObservable();
  readonly chatHistory$ = this.chatHistorySubject.asObservable();
  readonly isLoading$ = this.isLoadingSubject.asObservable();

  // Public observables
  readonly suggestions$ = this.suggestionsSubject.asObservable();
  readonly activeSuggestion$ = this.activeSuggestionSubject.asObservable();
  readonly codeEdits$ = this.codeEditsSubject.asObservable();
  readonly testingResults$ = this.testingResultsSubject.asObservable();

  constructor() {
    // Load initial data from backend
    this.loadSuggestions();
    // Initialize a new chat session
    this.startNewSession();
  }

  // Get all suggestions from backend
  getSuggestions(): Observable<AISuggestion[]> {
    return this.http.get<AISuggestion[]>(`${this.baseUrl}/suggestions`)
      .pipe(
        tap(suggestions => this.suggestionsSubject.next(suggestions)),
        catchError(error => {
          console.error('Error loading suggestions:', error);
          this.notificationService.showError('Failed to load AI suggestions');
          return of([]);
        })
      );
  }

  // Get suggestion by ID from backend
  getSuggestionById(id: string): Observable<AISuggestion | null> {
    return this.http.get<AISuggestion>(`${this.baseUrl}/suggestions/${id}`)
      .pipe(
        tap(suggestion => this.activeSuggestionSubject.next(suggestion)),
        catchError(error => {
          console.error('Error loading suggestion:', error);
          this.notificationService.showError('Failed to load suggestion');
          return of(null);
        })
      );
  }

  // Apply suggestion to code
  applySuggestion(suggestionId: string, targetCode: string): Observable<AICodeEdit> {
    return this.http.post<AICodeEdit>(`${this.baseUrl}/suggestions/${suggestionId}/apply`, {
      targetCode
    }).pipe(
      tap(codeEdit => {
        const currentEdits = this.codeEditsSubject.value;
        this.codeEditsSubject.next([...currentEdits, codeEdit]);
      }),
      catchError(error => {
        console.error('Error applying suggestion:', error);
        this.notificationService.showError('Failed to apply suggestion');
        throw error;
      })
    );
  }

  // Update suggestion rating
  updateSuggestionRating(suggestionId: string, rating: number, comment?: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/suggestions/${suggestionId}/rating`, {
        rating,
      comment
    }).pipe(
      catchError(error => {
        console.error('Error updating rating:', error);
        this.notificationService.showError('Failed to update rating');
        throw error;
      })
    );
  }

  // Search suggestions
  searchSuggestions(query: string): Observable<AISuggestion[]> {
    return this.http.get<AISuggestion[]>(`${this.baseUrl}/suggestions/search`, {
      params: { q: query }
    }).pipe(
      tap(suggestions => this.suggestionsSubject.next(suggestions)),
              catchError(error => {
          console.error('Error searching suggestions:', error);
          this.notificationService.showError('Failed to search suggestions');
          return of([]);
        })
    );
  }

  // Filter suggestions by type
  filterSuggestionsByType(type: string): Observable<AISuggestion[]> {
    return this.http.get<AISuggestion[]>(`${this.baseUrl}/suggestions`, {
      params: { type }
    }).pipe(
      tap(suggestions => this.suggestionsSubject.next(suggestions)),
              catchError(error => {
          console.error('Error filtering suggestions:', error);
          this.notificationService.showError('Failed to filter suggestions');
          return of([]);
        })
    );
  }

  // Get suggestions by category
  getSuggestionsByCategory(category: string): Observable<AISuggestion[]> {
    return this.http.get<AISuggestion[]>(`${this.baseUrl}/suggestions`, {
      params: { category }
    }).pipe(
      tap(suggestions => this.suggestionsSubject.next(suggestions)),
              catchError(error => {
          console.error('Error loading category suggestions:', error);
          this.notificationService.showError('Failed to load suggestions');
          return of([]);
        })
    );
  }

  // Private helper methods
  private loadSuggestions(): void {
    this.getSuggestions().subscribe();
  }

  // ===== CHAT FUNCTIONALITY =====

  /**
   * Start a new chat session
   */
  startNewSession(title?: string, context?: string): Observable<any> {
    console.log('🤖 Starting new copilot session');
    
    this.isLoadingSubject.next(true);
    
    return this.http.post<any>(`${this.baseUrl}/session/start`, { title, context })
      .pipe(
        tap(response => {
          if (response.success) {
            this.currentSessionSubject.next(response.data.sessionId);
            this.chatHistorySubject.next([]);
            console.log('✅ New copilot session started:', response.data.sessionId);
          }
        }),
        catchError(error => {
          console.error('❌ Failed to start copilot session:', error);
          this.notificationService.showError('Failed to start AI chat session');
          return of({ success: false, error: error.message });
        }),
        tap(() => this.isLoadingSubject.next(false))
      );
  }

  /**
   * Send message to AI copilot with timeout and error handling
   */
  sendMessage(message: string, context?: string): Observable<any> {
    console.log('🤖 Sending message to copilot:', message);
    
    const currentSession = this.currentSessionSubject.value;
    if (!currentSession) {
      console.error('❌ No active session');
      return this.startNewSession().pipe(
        switchMap(() => this.sendMessage(message, context))
      );
    }

    console.log('🚀 STARTING REQUEST - Setting loading to TRUE');
    this.isLoadingSubject.next(true);

    const requestPayload = {
      sessionId: currentSession,
      message,
      context
    };

    // FORCE STOP loading after 10 seconds MAX
    setTimeout(() => {
      console.log('⏰ TIMEOUT FORCE STOP - Setting loading to FALSE');
      this.isLoadingSubject.next(false);
    }, 10000);

    // Add timeout handling (10 seconds)
    return this.http.post<any>(`${this.baseUrl}/chat`, requestPayload)
      .pipe(
        timeout(10000), // 10 second timeout
        tap(response => {
          console.log('🔄 Service received response:', response);
          if (response.success) {
            // Add both user message and AI response to chat history
            const currentHistory = this.chatHistorySubject.value;
            const newHistory = [
              ...currentHistory,
              {
                type: 'user',
                content: message,
                timestamp: new Date().toISOString()
              },
              {
                type: 'assistant',
                content: response.data.message,
                tokensUsed: response.data.tokensUsed,
                model: response.data.model,
                responseTime: response.data.responseTime,
                timestamp: new Date().toISOString()
              }
            ];
            this.chatHistorySubject.next(newHistory);
            console.log('✅ Message sent successfully, tokens used:', response.data.tokensUsed);
          }
        }),
        catchError(error => {
          console.error('❌ Failed to send message:', error);
          
          // Implement fallback response
          const fallbackResponse = this.generateFallbackResponse(message, error);
          const currentHistory = this.chatHistorySubject.value;
          const newHistory = [
            ...currentHistory,
            {
              type: 'user',
              content: message,
              timestamp: new Date().toISOString()
            },
            fallbackResponse
          ];
          this.chatHistorySubject.next(newHistory);
          
          // Show appropriate error message
          if (error.name === 'TimeoutError') {
            this.notificationService.showWarning('AI response timed out. Please try again.');
          } else {
            this.notificationService.showError('Failed to get AI response. Using fallback.');
          }
          
          return of({ success: false, error: error.message, fallback: true });
        }),
        finalize(() => {
          console.log('🔄 Finalizing - setting loading to false');
          this.isLoadingSubject.next(false);
        })
      );
  }

  /**
   * Generate fallback response when AI service fails
   */
  private generateFallbackResponse(message: string, error: any): any {
    const lowerMessage = message.toLowerCase();
    let fallbackContent = '';

    if (lowerMessage.includes('code') || lowerMessage.includes('function')) {
      fallbackContent = `I apologize, but I'm currently unable to process your coding request due to a temporary issue. Here's what I suggest:\n\n1. Try refreshing the page and sending your message again\n2. Check your internet connection\n3. If the problem persists, please try again in a few minutes\n\nYour request: "${message}" will be processed once the connection is restored.`;
    } else if (lowerMessage.includes('error') || lowerMessage.includes('debug')) {
      fallbackContent = `I'm sorry, but I can't help debug your issue right now due to a connection problem. In the meantime:\n\n1. Check the browser console for error messages\n2. Verify your code syntax and imports\n3. Try restarting your development server\n4. Please retry your request in a moment\n\nI'll be ready to help once the service is available again.`;
    } else {
      fallbackContent = `I apologize, but I'm temporarily unable to respond to your message due to a service issue. Please try again in a few moments.\n\nYour message: "${message}"\n\nThis is likely a temporary connectivity issue that should resolve shortly.`;
    }

    return {
      type: 'assistant',
      content: fallbackContent,
      tokensUsed: 0,
      model: 'fallback-response',
      responseTime: 0,
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }

  /**
   * Clear current session and start fresh
   */
  clearSession(): void {
    console.log('🧹 Clearing current session');
    this.currentSessionSubject.next(null);
    this.chatHistorySubject.next([]);
    this.startNewSession().subscribe();
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionSubject.value;
  }

  /**
   * Check if copilot is currently processing
   */
  isProcessing(): boolean {
    return this.isLoadingSubject.value;
  }
}