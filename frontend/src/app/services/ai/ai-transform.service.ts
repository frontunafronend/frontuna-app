import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, delay } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { AITransformation, AIChange, AITask, AITaskStatus } from '@app/models/ai.model';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AITransformService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  
  private readonly baseUrl = `${environment.apiUrl}/ai/transform`;
  
  // State management
  private readonly currentTaskSubject = new BehaviorSubject<AITask | null>(null);
  private readonly isProcessingSignal = signal<boolean>(false);
  
  // Public observables
  public readonly currentTask$ = this.currentTaskSubject.asObservable();
  public readonly isProcessing = this.isProcessingSignal.asReadonly();

  /**
   * Transform code using AI
   */
  transformCode(
    sourceCode: string,
    transformationType: 'refactor' | 'optimize' | 'convert' | 'enhance',
    framework: 'angular' | 'react' | 'vue' | 'svelte',
    options?: any
  ): Observable<AITransformation> {
    console.log('🤖 AI Transform: Starting transformation:', transformationType);
    
    this.isProcessingSignal.set(true);
    
    const task: AITask = {
      id: this.generateId(),
      type: 'transform',
      status: 'processing',
      prompt: `Transform ${transformationType} for ${framework}`,
      progress: 0,
      startTime: new Date()
    };
    
    this.currentTaskSubject.next(task);
    
    // Always use live backend - no mock data
    
    const payload = {
      sourceCode,
      transformationType,
      framework,
      options: options || {}
    };
    
    return this.http.post<AITransformation>(`${this.baseUrl}`, payload)
      .pipe(
        map(response => {
          console.log('✅ AI Transform: Transformation completed');
          this.updateTaskStatus('completed');
          this.isProcessingSignal.set(false);
          this.notificationService.showSuccess('Code transformation completed!');
          return response;
        }),
        catchError(error => {
          console.error('❌ AI Transform: Error:', error);
          this.updateTaskStatus('failed', error.message);
          this.isProcessingSignal.set(false);
          this.notificationService.showError('Code transformation failed');
          throw error;
        })
      );
  }

  /**
   * Refactor code with AI suggestions
   */
  refactorCode(sourceCode: string, suggestions?: string[]): Observable<AITransformation> {
    return this.transformCode(sourceCode, 'refactor', 'angular', { suggestions });
  }

  /**
   * Optimize code performance
   */
  optimizeCode(sourceCode: string, metrics?: string[]): Observable<AITransformation> {
    return this.transformCode(sourceCode, 'optimize', 'angular', { metrics });
  }

  /**
   * Convert code between frameworks
   */
  convertFramework(
    sourceCode: string,
    fromFramework: 'angular' | 'react' | 'vue' | 'svelte',
    toFramework: 'angular' | 'react' | 'vue' | 'svelte'
  ): Observable<AITransformation> {
    console.log(`🔄 AI Transform: Converting from ${fromFramework} to ${toFramework}`);
    
    return this.transformCode(sourceCode, 'convert', toFramework, { fromFramework });
  }

  /**
   * Enhance code with modern patterns
   */
  enhanceCode(sourceCode: string, patterns?: string[]): Observable<AITransformation> {
    return this.transformCode(sourceCode, 'enhance', 'angular', { patterns });
  }

  /**
   * Get transformation history
   */
  getTransformationHistory(limit: number = 10): Observable<AITransformation[]> {
    // Always use live backend - no mock data
    
    return this.http.get<AITransformation[]>(`${this.baseUrl}/history`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Cancel current transformation
   */
  cancelTransformation(): void {
    const currentTask = this.currentTaskSubject.value;
    if (currentTask && currentTask.status === 'processing') {
      this.updateTaskStatus('failed', 'Cancelled by user');
      this.isProcessingSignal.set(false);
      this.notificationService.showInfo('Transformation cancelled');
    }
  }

  /**
   * Update task status
   */
  private updateTaskStatus(status: AITaskStatus, error?: string): void {
    const currentTask = this.currentTaskSubject.value;
    if (currentTask) {
      const updatedTask: AITask = {
        ...currentTask,
        status,
        error,
        endTime: new Date(),
        progress: status === 'completed' ? 100 : currentTask.progress
      };
      this.currentTaskSubject.next(updatedTask);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'ai_transform_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Mock implementations for development
  private mockTransformCode(
    sourceCode: string,
    transformationType: 'refactor' | 'optimize' | 'convert' | 'enhance',
    framework: 'angular' | 'react' | 'vue' | 'svelte'
  ): Observable<AITransformation> {
    return of(null).pipe(
      delay(2000), // Simulate processing time
      map(() => {
        const mockChanges: AIChange[] = [
          {
            type: 'modification',
            line: 5,
            content: '// AI-optimized code',
            reason: 'Added performance optimization'
          },
          {
            type: 'addition',
            line: 10,
            content: 'const optimizedValue = useMemo(() => computeValue(), [dependency]);',
            reason: 'Added memoization for performance'
          }
        ];

        const transformation: AITransformation = {
          id: this.generateId(),
          sourceCode,
          targetCode: this.generateMockTransformedCode(sourceCode, transformationType),
          transformationType,
          framework,
          changes: mockChanges,
          timestamp: new Date()
        };

        return transformation;
      })
    );
  }

  private mockGetHistory(limit: number): Observable<AITransformation[]> {
    const mockHistory: AITransformation[] = [
      {
        id: 'transform_1',
        sourceCode: 'Original component code...',
        targetCode: 'Optimized component code...',
        transformationType: 'optimize',
        framework: 'angular',
        changes: [
          { type: 'modification', line: 3, content: 'Optimized logic', reason: 'Performance improvement' }
        ],
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: 'transform_2',
        sourceCode: 'Legacy component...',
        targetCode: 'Modern component...',
        transformationType: 'enhance',
        framework: 'angular',
        changes: [
          { type: 'addition', line: 1, content: 'Added modern patterns', reason: 'Code modernization' }
        ],
        timestamp: new Date(Date.now() - 172800000) // 2 days ago
      }
    ];

    return of(mockHistory.slice(0, limit)).pipe(delay(500));
  }

  private generateMockTransformedCode(sourceCode: string, type: string): string {
    const lines = sourceCode.split('\n');
    const transformedLines = lines.map(line => {
      if (line.trim().startsWith('//')) return line;
      
      switch (type) {
        case 'optimize':
          return line + ' // AI-optimized';
        case 'refactor':
          return line.replace('function', 'const').replace('var ', 'const ');
        case 'enhance':
          return line + ' // Enhanced with modern patterns';
        default:
          return line;
      }
    });
    
    return transformedLines.join('\n');
  }
}