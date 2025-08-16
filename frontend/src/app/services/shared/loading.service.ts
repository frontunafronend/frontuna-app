import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly loadingCountSignal = signal<number>(0);
  
  public readonly isLoading = computed(() => this.loadingCountSignal() > 0);

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    if (loading) {
      this.loadingCountSignal.update(count => count + 1);
    } else {
      this.loadingCountSignal.update(count => Math.max(0, count - 1));
    }
  }

  /**
   * Force clear all loading states
   */
  clearLoading(): void {
    this.loadingCountSignal.set(0);
  }
}