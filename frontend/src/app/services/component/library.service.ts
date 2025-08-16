import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseApiService } from '@app/services/api/base-api.service';
import { GeneratedComponent, ComponentLibraryFilter, ComponentExport } from '@app/models/component.model';
import { PaginatedResponse } from '@app/models/api-response.model';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';

@Injectable({
  providedIn: 'root'
})
export class LibraryService extends BaseApiService {
  private readonly analyticsService = inject(GoogleAnalyticsService);

  /**
   * Get user's component library
   */
  getLibrary(
    page: number = 1, 
    limit: number = 20, 
    filter?: ComponentLibraryFilter
  ): Observable<PaginatedResponse<GeneratedComponent>> {
    const params: any = { page, limit };
    
    if (filter) {
      if (filter.framework) params.framework = filter.framework;
      if (filter.category) params.category = filter.category;
      if (filter.complexity) params.complexity = filter.complexity;
      if (filter.search) params.search = filter.search;
      if (filter.tags) params.tags = filter.tags.join(',');
      if (filter.sortBy) params.sortBy = filter.sortBy;
      if (filter.sortOrder) params.sortOrder = filter.sortOrder;
    }

    return this.get<PaginatedResponse<GeneratedComponent>>('/library', { 
      params: this.buildParams(params) 
    });
  }

  /**
   * Get component by ID
   */
  getComponent(id: string): Observable<GeneratedComponent> {
    return this.get<GeneratedComponent>(`/library/${id}`);
  }

  /**
   * Update component
   */
  updateComponent(id: string, updates: Partial<GeneratedComponent>): Observable<GeneratedComponent> {
    return this.put<GeneratedComponent>(`/library/${id}`, updates);
  }

  /**
   * Delete component from library
   */
  deleteComponent(id: string): Observable<void> {
    return this.delete<void>(`/library/${id}`);
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(id: string): Observable<GeneratedComponent> {
    return this.post<GeneratedComponent>(`/library/${id}/favorite`, {});
  }

  /**
   * Rate component
   */
  rateComponent(id: string, rating: number): Observable<GeneratedComponent> {
    return this.post<GeneratedComponent>(`/library/${id}/rate`, { rating })
      .pipe(
        map(response => {
          this.analyticsService.trackEvent({
            action: 'rate_component',
            category: 'component_library',
            label: rating.toString(),
            value: rating
          });
          return response;
        })
      );
  }

  /**
   * Download component
   */
  downloadComponent(id: string, format: 'zip' | 'json' = 'zip'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/library/${id}/download`, {
      params: { format },
      responseType: 'blob'
    }).pipe(
      map(blob => {
        this.analyticsService.trackComponentDownload(id, format);
        return blob;
      })
    );
  }

  /**
   * Share component (make public)
   */
  shareComponent(id: string, isPublic: boolean): Observable<GeneratedComponent> {
    return this.post<GeneratedComponent>(`/library/${id}/share`, { isPublic });
  }

  /**
   * Search components
   */
  searchComponents(
    query: string, 
    filters?: ComponentLibraryFilter,
    page: number = 1,
    limit: number = 20
  ): Observable<PaginatedResponse<GeneratedComponent>> {
    const params: any = { 
      q: query, 
      page, 
      limit 
    };

    if (filters) {
      if (filters.framework) params.framework = filters.framework;
      if (filters.category) params.category = filters.category;
      if (filters.tags) params.tags = filters.tags.join(',');
    }

    this.analyticsService.trackSearch(query, 'component_library');

    return this.get<PaginatedResponse<GeneratedComponent>>('/library/search', {
      params: this.buildParams(params)
    });
  }

  /**
   * Get component categories
   */
  getCategories(): Observable<{ value: string; label: string; count: number; }[]> {
    return this.get<any[]>('/library/categories');
  }

  /**
   * Get popular tags
   */
  getTags(): Observable<{ name: string; count: number; }[]> {
    return this.get<any[]>('/library/tags');
  }

  /**
   * Export components
   */
  exportComponents(componentIds: string[], format: 'zip' | 'json' = 'zip'): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/export/bulk`, {
      componentIds,
      format
    }, {
      responseType: 'blob'
    }).pipe(
      map(blob => {
        this.analyticsService.trackEvent({
          action: 'bulk_export',
          category: 'component_library',
          label: format,
          value: componentIds.length
        });
        return blob;
      })
    );
  }

  /**
   * Import components from file
   */
  importComponents(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post('/upload/bulk', formData);
  }

  /**
   * Get library statistics
   */
  getLibraryStats(): Observable<{
    totalComponents: number;
    favoriteComponents: number;
    publicComponents: number;
    frameworkDistribution: { framework: string; count: number; }[];
    categoryDistribution: { category: string; count: number; }[];
  }> {
    return this.get('/library/stats');
  }

  /**
   * Get recently viewed components
   */
  getRecentlyViewed(limit: number = 5): Observable<GeneratedComponent[]> {
    return this.get<GeneratedComponent[]>('/library/recent', {
      params: this.buildParams({ limit })
    });
  }

  /**
   * Mark component as viewed
   */
  markAsViewed(id: string): Observable<void> {
    return this.post<void>(`/library/${id}/view`, {});
  }

  /**
   * Get similar components
   */
  getSimilarComponents(id: string, limit: number = 5): Observable<GeneratedComponent[]> {
    return this.get<GeneratedComponent[]>(`/library/${id}/similar`, {
      params: this.buildParams({ limit })
    });
  }

  /**
   * Duplicate component
   */
  duplicateComponent(id: string, name?: string): Observable<GeneratedComponent> {
    return this.post<GeneratedComponent>(`/library/${id}/duplicate`, { name });
  }
}