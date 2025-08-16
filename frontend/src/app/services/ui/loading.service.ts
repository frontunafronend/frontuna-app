import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  id: string;
  message?: string;
  progress?: number;
  type: 'spinner' | 'bar' | 'dots';
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingStates = new BehaviorSubject<Map<string, LoadingState>>(new Map());
  
  // Global loading state
  public readonly isGlobalLoading = signal(false);
  public readonly globalLoadingMessage = signal('Loading...');

  constructor() {}

  /**
   * Start loading for a specific operation
   */
  startLoading(id: string, message?: string, type: 'spinner' | 'bar' | 'dots' = 'dots'): void {
    const currentStates = this.loadingStates.value;
    const newStates = new Map(currentStates);
    
    newStates.set(id, {
      id,
      message,
      type,
      progress: 0
    });
    
    this.loadingStates.next(newStates);
    this.updateGlobalState();
  }

  /**
   * Update loading progress
   */
  updateProgress(id: string, progress: number, message?: string): void {
    const currentStates = this.loadingStates.value;
    const existingState = currentStates.get(id);
    
    if (existingState) {
      const newStates = new Map(currentStates);
      newStates.set(id, {
        ...existingState,
        progress,
        message: message || existingState.message
      });
      
      this.loadingStates.next(newStates);
    }
  }

  /**
   * Stop loading for a specific operation
   */
  stopLoading(id: string): void {
    const currentStates = this.loadingStates.value;
    const newStates = new Map(currentStates);
    
    newStates.delete(id);
    this.loadingStates.next(newStates);
    this.updateGlobalState();
  }

  /**
   * Check if a specific operation is loading
   */
  isLoading(id: string): Observable<boolean> {
    return new Observable(observer => {
      const subscription = this.loadingStates.subscribe(states => {
        observer.next(states.has(id));
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Get loading state for a specific operation
   */
  getLoadingState(id: string): Observable<LoadingState | null> {
    return new Observable(observer => {
      const subscription = this.loadingStates.subscribe(states => {
        observer.next(states.get(id) || null);
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Get all loading states
   */
  getAllLoadingStates(): Observable<Map<string, LoadingState>> {
    return this.loadingStates.asObservable();
  }

  /**
   * Set global loading state
   */
  setGlobalLoading(loading: boolean, message: string = 'Loading...'): void {
    this.isGlobalLoading.set(loading);
    this.globalLoadingMessage.set(message);
  }

  /**
   * Clear all loading states
   */
  clearAll(): void {
    this.loadingStates.next(new Map());
    this.setGlobalLoading(false);
  }

  private updateGlobalState(): void {
    const hasAnyLoading = this.loadingStates.value.size > 0;
    this.isGlobalLoading.set(hasAnyLoading);
  }
}
