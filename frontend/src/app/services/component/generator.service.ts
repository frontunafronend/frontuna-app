import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { BaseApiService } from '@app/services/api/base-api.service';
import { GenerationRequest, GenerationResponse, GeneratedComponent, ComponentHistory } from '@app/models/component.model';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';
import { NotificationService } from '@app/services/notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class GeneratorService extends BaseApiService {
  private readonly analyticsService = inject(GoogleAnalyticsService);
  private readonly notificationService = inject(NotificationService);

  /**
   * Generate a new component
   */
  generateComponent(request: GenerationRequest): Observable<GenerationResponse> {
    console.log('🚀 Generating component:', request);
    
    return this.post<GenerationResponse>('/generate/component', request)
      .pipe(
        map(response => {
          console.log('✅ Component generated successfully:', response);
          
          if (response.success && response.data?.component) {
            this.analyticsService.trackComponentGeneration(
              request.framework,
              request.category || 'custom'
            );
            
            this.notificationService.showSuccess(
              `Component "${response.data.component.name}" generated successfully!`
            );
          }
          
          return response;
        }),
        catchError(error => {
          console.error('❌ Component generation failed:', error);
          
          let errorMessage = 'Failed to generate component';
          
          if (error.error?.error?.code === 'GENERATION_LIMIT_EXCEEDED') {
            errorMessage = 'You have reached your generation limit for this billing period';
          } else if (error.error?.error?.message) {
            errorMessage = error.error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.notificationService.showError(errorMessage);
          
          return throwError(() => error);
        })
      );
  }

  /**
   * Get generation history
   */
  getGenerationHistory(filters: any = {}, pagination: any = {}): Observable<ComponentHistory> {
    const params = {
      ...filters,
      page: pagination.page || 1,
      limit: pagination.limit || 10
    };
    
    return this.get<any>('/generate/history', params)
      .pipe(
        map(response => {
          console.log('📜 Generation history retrieved:', response);
          return response.data || response;
        }),
        catchError(error => {
          console.error('❌ Failed to get generation history:', error);
          this.notificationService.showError('Failed to load generation history');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get component by ID
   */
  getComponentById(id: string): Observable<GeneratedComponent> {
    return this.get<{ data: GeneratedComponent }>(`/generate/component/${id}`)
      .pipe(
        map(response => {
          console.log('🔍 Component retrieved:', response);
          return response.data;
        }),
        catchError(error => {
          console.error('❌ Failed to get component:', error);
          this.notificationService.showError('Component not found');
          return throwError(() => error);
        })
      );
  }

  /**
   * Save component to library
   */
  saveToLibrary(id: string, metadata: any = {}): Observable<GeneratedComponent> {
    return this.post<{ data: GeneratedComponent }>(`/generate/component/${id}/save`, metadata)
      .pipe(
        map(response => {
          console.log('💾 Component saved to library:', response);
          this.notificationService.showSuccess('Component saved to library!');
          return response.data;
        }),
        catchError(error => {
          console.error('❌ Failed to save component:', error);
          this.notificationService.showError('Failed to save component to library');
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete component
   */
  deleteComponent(id: string): Observable<boolean> {
    return this.delete<{ success: boolean }>(`/generate/component/${id}`)
      .pipe(
        map(response => {
          console.log('🗑️ Component deleted:', response);
          this.notificationService.showSuccess('Component deleted successfully');
          return response.success;
        }),
        catchError(error => {
          console.error('❌ Failed to delete component:', error);
          this.notificationService.showError('Failed to delete component');
          return throwError(() => error);
        })
      );
  }

  /**
   * Export component
   */
  exportComponent(id: string, format: string = 'zip'): Observable<any> {
    return this.get<any>(`/generate/component/${id}/export?format=${format}`)
      .pipe(
        tap(() => {
          console.log('📦 Component exported');
          this.notificationService.showSuccess('Component exported successfully!');
        }),
        catchError(error => {
          console.error('❌ Failed to export component:', error);
          this.notificationService.showError('Failed to export component');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get user usage stats
   */
  getUserUsage(): Observable<any> {
    return this.get<any>('/generate/usage')
      .pipe(
        map(response => response.data || response),
        catchError(error => {
          console.error('❌ Failed to get usage stats:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get specific generation by ID
   */
  getGeneration(id: string): Observable<GeneratedComponent> {
    return this.get<GeneratedComponent>(`/generate/history/${id}`);
  }

  /**
   * Regenerate component with same prompt
   */
  regenerateComponent(id: string): Observable<GenerationResponse> {
    return this.post<GenerationResponse>(`/generate/regenerate/${id}`, {});
  }



  /**
   * Delete generation
   */
  deleteGeneration(id: string): Observable<void> {
    return this.delete<void>(`/generate/history/${id}`);
  }

  /**
   * Get component templates
   */
  getTemplates(framework?: string, category?: string): Observable<GeneratedComponent[]> {
    const params: any = {};
    if (framework) params.framework = framework;
    if (category) params.category = category;

    return this.get<GeneratedComponent[]>('/templates', { params: this.buildParams(params) });
  }

  /**
   * Get prompt suggestions
   */
  getPromptSuggestions(category?: string): Observable<string[]> {
    const params: any = {};
    if (category) params.category = category;

    return this.get<string[]>('/generate/suggestions', { params: this.buildParams(params) });
  }
}