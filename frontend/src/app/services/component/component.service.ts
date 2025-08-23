import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, tap, throwError, map } from 'rxjs';
import { EnvironmentService } from '../core/environment.service';
import { NotificationService } from '../notification/notification.service';

export interface Component {
  id: string;
  userId: string;
  name: string;
  style: 'material' | 'bootstrap' | 'html';
  framework: 'angular' | 'react' | 'vue' | 'svelte' | 'vanilla';
  version: number;
  codeTs: string;
  codeHtml: string;
  codeScss: string;
  meta?: any;
  createdAt: string;
  versions?: ComponentVersion[];
}

export interface ComponentVersion {
  id: string;
  componentId: string;
  v: number;
  codeTs: string;
  codeHtml: string;
  codeScss: string;
  notes?: string;
  createdAt: string;
}

export interface CreateComponentRequest {
  name: string;
  style: 'material' | 'bootstrap' | 'html';
  framework: 'angular' | 'react' | 'vue' | 'svelte' | 'vanilla';
  codeTs: string;
  codeHtml: string;
  codeScss: string;
  meta?: any;
}

export interface UpdateComponentRequest {
  name?: string;
  codeTs?: string;
  codeHtml?: string;
  codeScss?: string;
  meta?: any;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComponentService {
  private readonly http = inject(HttpClient);
  private readonly environmentService = inject(EnvironmentService);
  private readonly notificationService = inject(NotificationService);

  // State management
  private readonly _components = new BehaviorSubject<Component[]>([]);
  private readonly _isLoading = signal(false);

  // Public observables
  public readonly components$ = this._components.asObservable();
  public readonly isLoading = this._isLoading.asReadonly();

  // API base URL
  private get apiUrl(): string {
    return `${this.environmentService.config.apiUrl}/api`;
  }

  /**
   * Get all user components from database
   */
  getComponents(): Observable<Component[]> {
    this._isLoading.set(true);
    
    return this.http.get<{success: boolean, data: Component[]}>(`${this.apiUrl}/components`).pipe(
      tap(response => {
        if (response.success) {
          this._components.next(response.data);
          console.log('✅ Components loaded from database:', response.data.length);
        }
      }),
      map(response => response.data),
      catchError(error => {
        console.error('❌ Failed to load components:', error);
        this.notificationService.showError('Failed to load components');
        return throwError(() => error);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Get component by ID
   */
  getComponent(id: string): Observable<Component> {
    return this.http.get<{success: boolean, data: Component}>(`${this.apiUrl}/components/${id}`).pipe(
      tap(response => {
        if (response.success) {
          console.log('✅ Component loaded:', response.data.name);
        }
      }),
      map(response => response.data),
      catchError(error => {
        console.error('❌ Failed to load component:', error);
        this.notificationService.showError('Failed to load component');
        return throwError(() => error);
      })
    );
  }

  /**
   * Create new component in database
   */
  createComponent(component: CreateComponentRequest): Observable<Component> {
    this._isLoading.set(true);
    
    return this.http.post<{success: boolean, data: Component}>(`${this.apiUrl}/components`, component).pipe(
      tap(response => {
        if (response.success) {
          // Add to local state
          const currentComponents = this._components.value;
          this._components.next([response.data, ...currentComponents]);
          
          console.log('✅ Component created:', response.data.name);
          this.notificationService.showSuccess(`Component "${response.data.name}" created successfully!`);
        }
      }),
      map(response => response.data),
      catchError(error => {
        console.error('❌ Failed to create component:', error);
        this.notificationService.showError('Failed to create component');
        return throwError(() => error);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Update existing component
   */
  updateComponent(id: string, updates: UpdateComponentRequest): Observable<Component> {
    this._isLoading.set(true);
    
    return this.http.put<{success: boolean, data: Component}>(`${this.apiUrl}/components/${id}`, updates).pipe(
      tap(response => {
        if (response.success) {
          // Update local state
          const currentComponents = this._components.value;
          const updatedComponents = currentComponents.map(comp => 
            comp.id === id ? response.data : comp
          );
          this._components.next(updatedComponents);
          
          console.log('✅ Component updated:', response.data.name);
          this.notificationService.showSuccess(`Component "${response.data.name}" updated successfully!`);
        }
      }),
      map(response => response.data),
      catchError(error => {
        console.error('❌ Failed to update component:', error);
        this.notificationService.showError('Failed to update component');
        return throwError(() => error);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Delete component
   */
  deleteComponent(id: string): Observable<void> {
    this._isLoading.set(true);
    
    return this.http.delete<{success: boolean}>(`${this.apiUrl}/components/${id}`).pipe(
      tap(response => {
        if (response.success) {
          // Remove from local state
          const currentComponents = this._components.value;
          const filteredComponents = currentComponents.filter(comp => comp.id !== id);
          this._components.next(filteredComponents);
          
          console.log('✅ Component deleted');
          this.notificationService.showSuccess('Component deleted successfully!');
        }
      }),
      map(() => void 0),
      catchError(error => {
        console.error('❌ Failed to delete component:', error);
        this.notificationService.showError('Failed to delete component');
        return throwError(() => error);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Get component versions/history
   */
  getComponentVersions(componentId: string): Observable<ComponentVersion[]> {
    return this.http.get<{success: boolean, data: ComponentVersion[]}>(`${this.apiUrl}/components/${componentId}/versions`).pipe(
      tap(response => {
        if (response.success) {
          console.log('✅ Component versions loaded:', response.data.length);
        }
      }),
      map(response => response.data),
      catchError(error => {
        console.error('❌ Failed to load component versions:', error);
        this.notificationService.showError('Failed to load component history');
        return throwError(() => error);
      })
    );
  }

  /**
   * Export component as ZIP
   */
  exportComponent(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/components/${id}/export`, { 
      responseType: 'blob' 
    }).pipe(
      tap(() => {
        console.log('✅ Component exported');
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
   * Search components
   */
  searchComponents(query: string, filters?: {
    framework?: string;
    style?: string;
  }): Observable<Component[]> {
    const params = new URLSearchParams();
    params.set('q', query);
    
    if (filters?.framework) {
      params.set('framework', filters.framework);
    }
    if (filters?.style) {
      params.set('style', filters.style);
    }

    return this.http.get<{success: boolean, data: Component[]}>(`${this.apiUrl}/components/search?${params}`).pipe(
      tap(response => {
        if (response.success) {
          console.log('✅ Search results:', response.data.length);
        }
      }),
      map(response => response.data),
      catchError(error => {
        console.error('❌ Search failed:', error);
        this.notificationService.showError('Search failed');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current components from state
   */
  getCurrentComponents(): Component[] {
    return this._components.value;
  }

  /**
   * Refresh components from server
   */
  refreshComponents(): void {
    this.getComponents().subscribe();
  }
}
