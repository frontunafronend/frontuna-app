import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
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

  // Public observables
  readonly suggestions$ = this.suggestionsSubject.asObservable();
  readonly activeSuggestion$ = this.activeSuggestionSubject.asObservable();
  readonly codeEdits$ = this.codeEditsSubject.asObservable();
  readonly testingResults$ = this.testingResultsSubject.asObservable();

  constructor() {
    // Load initial data from backend
    this.loadSuggestions();
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
}