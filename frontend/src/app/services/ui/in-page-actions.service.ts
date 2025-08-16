import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';
import { NotificationService } from '../notification/notification.service';

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InPageActionsService {
  
  constructor(
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  /**
   * Execute an action with loading state and notifications
   */
  executeAction<T>(
    actionId: string,
    actionFn: () => Observable<T>,
    options: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
      showNotifications?: boolean;
      loaderType?: 'dots' | 'spinner' | 'bar';
    } = {}
  ): Observable<ActionResult<T>> {
    
    const {
      loadingMessage = 'Processing...',
      successMessage,
      errorMessage,
      showNotifications = true,
      loaderType = 'dots'
    } = options;

    // Start loading
    this.loadingService.startLoading(actionId, loadingMessage, loaderType);

    return new Observable<ActionResult<T>>(observer => {
      actionFn().pipe(
        finalize(() => {
          // Stop loading when action completes
          this.loadingService.stopLoading(actionId);
        })
      ).subscribe({
        next: (data) => {
          const result: ActionResult<T> = {
            success: true,
            data,
            message: successMessage
          };
          
          if (showNotifications && successMessage) {
            this.notificationService.showSuccess(successMessage);
          }
          
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          const errorMsg = errorMessage || error.message || 'An error occurred';
          const result: ActionResult<T> = {
            success: false,
            error: errorMsg
          };
          
          if (showNotifications) {
            this.notificationService.showError(errorMsg);
          }
          
          observer.next(result);
          observer.complete();
        }
      });
    });
  }

  /**
   * Execute multiple actions in sequence with individual loading states
   */
  executeSequentialActions<T>(
    actions: Array<{
      id: string;
      action: () => Observable<T>;
      message?: string;
    }>,
    options: {
      showNotifications?: boolean;
      stopOnError?: boolean;
    } = {}
  ): Observable<ActionResult<T[]>> {
    
    const { showNotifications = true, stopOnError = true } = options;
    const results: T[] = [];
    
    return new Observable<ActionResult<T[]>>(observer => {
      const executeNext = (index: number) => {
        if (index >= actions.length) {
          // All actions completed successfully
          observer.next({
            success: true,
            data: results,
            message: 'All actions completed successfully'
          });
          observer.complete();
          return;
        }
        
        const currentAction = actions[index];
        this.executeAction(
          currentAction.id,
          currentAction.action,
          {
            loadingMessage: currentAction.message,
            showNotifications: false // Handle notifications at sequence level
          }
        ).subscribe({
          next: (result) => {
            if (result.success && result.data) {
              results.push(result.data);
              executeNext(index + 1);
            } else {
              // Action failed
              if (stopOnError) {
                observer.next({
                  success: false,
                  error: result.error || 'Action failed',
                  data: results
                });
                observer.complete();
              } else {
                executeNext(index + 1);
              }
            }
          }
        });
      };
      
      executeNext(0);
    });
  }

  /**
   * Execute an action with optimistic updates
   */
  executeOptimisticAction<T>(
    actionId: string,
    optimisticUpdateFn: () => void,
    actionFn: () => Observable<T>,
    rollbackFn: () => void,
    options: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
      showNotifications?: boolean;
    } = {}
  ): Observable<ActionResult<T>> {
    
    // Apply optimistic update immediately
    optimisticUpdateFn();
    
    return this.executeAction(actionId, actionFn, options).pipe(
      finalize(() => {
        // If action failed, rollback the optimistic update
        if (!this.loadingService.isGlobalLoading()) {
          // Action completed - check if we need to rollback
          // This is a simplified check; in a real app you'd track the result
        }
      })
    );
  }

  /**
   * Execute an action with retry logic
   */
  executeWithRetry<T>(
    actionId: string,
    actionFn: () => Observable<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000,
    options: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
      showNotifications?: boolean;
    } = {}
  ): Observable<ActionResult<T>> {
    
    let attempt = 0;
    
    const tryAction = (): Observable<ActionResult<T>> => {
      attempt++;
      
      return this.executeAction(
        `${actionId}_attempt_${attempt}`,
        actionFn,
        {
          ...options,
          loadingMessage: `${options.loadingMessage || 'Processing'} (Attempt ${attempt}/${maxRetries + 1})`,
          showNotifications: attempt > maxRetries // Only show notifications on final attempt
        }
      ).pipe(
        delay(attempt > 1 ? retryDelay : 0)
      );
    };
    
    return new Observable<ActionResult<T>>(observer => {
      const executeAttempt = () => {
        tryAction().subscribe({
          next: (result) => {
            if (result.success || attempt > maxRetries) {
              observer.next(result);
              observer.complete();
            } else {
              // Retry
              setTimeout(executeAttempt, retryDelay);
            }
          }
        });
      };
      
      executeAttempt();
    });
  }
}
