import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, delay } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { AIDiff, DiffChange } from '@app/models/ai.model';
import { NotificationService } from '../notification/notification.service';

export interface DiffOptions {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  contextLines: number;
  highlightSyntax: boolean;
  showLineNumbers: boolean;
  wordLevel: boolean;
}

export interface DiffStats {
  totalLines: number;
  addedLines: number;
  removedLines: number;
  modifiedLines: number;
  unchangedLines: number;
  similarity: number; // 0-1 scale
}

export interface DiffContext {
  beforeContext: string[];
  afterContext: string[];
  lineNumber: number;
}

export interface DiffHunk {
  id: string;
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  changes: DiffChange[];
  context: DiffContext;
}

export interface DiffFile {
  path: string;
  oldPath?: string;
  type: 'added' | 'deleted' | 'modified' | 'renamed';
  hunks: DiffHunk[];
  stats: DiffStats;
  isBinary: boolean;
}

export interface DiffResult {
  id: string;
  files: DiffFile[];
  stats: DiffStats;
  options: DiffOptions;
  timestamp: Date;
  processingTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class AIDiffService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  
  private readonly baseUrl = `${environment.apiUrl}/ai/diff`;
  
  // State management
  private readonly currentDiffSubject = new BehaviorSubject<AIDiff | null>(null);
  private readonly diffHistorySubject = new BehaviorSubject<AIDiff[]>([]);
  private readonly isProcessingSignal = signal<boolean>(false);
  private readonly diffOptionsSignal = signal<DiffOptions>(this.getDefaultOptions());
  
  // Public observables
  public readonly currentDiff$ = this.currentDiffSubject.asObservable();
  public readonly diffHistory$ = this.diffHistorySubject.asObservable();
  public readonly isProcessing = this.isProcessingSignal.asReadonly();
  public readonly diffOptions = this.diffOptionsSignal.asReadonly();

  constructor() {
    this.loadDiffHistory();
  }

  /**
   * Generate diff between two code versions
   */
  generateDiff(
    originalCode: string,
    modifiedCode: string,
    options?: Partial<DiffOptions>
  ): Observable<AIDiff> {
    console.log('🔍 AI Diff: Generating diff between code versions');
    
    this.isProcessingSignal.set(true);
    
    const diffOptions = { ...this.diffOptionsSignal(), ...options };
    this.diffOptionsSignal.set(diffOptions);
    
    // Always use live backend - no mock data
    
    const payload = {
      originalCode,
      modifiedCode,
      options: diffOptions
    };
    
    return this.http.post<AIDiff>(`${this.baseUrl}/generate`, payload)
      .pipe(
        tap(diff => {
          console.log('✅ AI Diff: Diff generated successfully');
          this.currentDiffSubject.next(diff);
          this.addToHistory(diff);
          this.isProcessingSignal.set(false);
        }),
        catchError(error => {
          console.error('❌ AI Diff: Error generating diff:', error);
          this.isProcessingSignal.set(false);
          this.notificationService.showError('Failed to generate diff');
          throw error;
        })
      );
  }

  /**
   * Generate smart diff with AI analysis
   */
  generateSmartDiff(
    originalCode: string,
    modifiedCode: string,
    context?: string
  ): Observable<AIDiff> {
    console.log('🧠 AI Diff: Generating smart diff with AI analysis');
    
    const payload = {
      originalCode,
      modifiedCode,
      context,
      useAI: true
    };
    
    // Always use live backend - no mock data
    
    return this.http.post<AIDiff>(`${this.baseUrl}/smart`, payload)
      .pipe(
        tap(diff => {
          this.currentDiffSubject.next(diff);
          this.addToHistory(diff);
          this.notificationService.showSuccess('Smart diff generated with AI insights!');
        })
      );
  }

  /**
   * Apply diff changes to code
   */
  applyDiff(originalCode: string, diff: AIDiff): Observable<string> {
    console.log('🔧 AI Diff: Applying diff changes');
    
    // Always use live backend - no mock data
    
    const payload = {
      originalCode,
      changes: diff.changes
    };
    
    return this.http.post<{ result: string }>(`${this.baseUrl}/apply`, payload)
      .pipe(
        map(response => response.result),
        tap(() => {
          this.notificationService.showSuccess('Diff applied successfully!');
        })
      );
  }

  /**
   * Reverse diff changes
   */
  reverseDiff(modifiedCode: string, diff: AIDiff): Observable<string> {
    const payload = {
      modifiedCode,
      changes: diff.changes
    };
    
    return this.http.post<{ result: string }>(`${this.baseUrl}/reverse`, payload)
      .pipe(
        map(response => response.result)
      );
  }

  /**
   * Get diff statistics
   */
  getDiffStats(diff: AIDiff): DiffStats {
    const stats: DiffStats = {
      totalLines: 0,
      addedLines: 0,
      removedLines: 0,
      modifiedLines: 0,
      unchangedLines: 0,
      similarity: 0
    };

    diff.changes.forEach(change => {
      stats.totalLines++;
      switch (change.type) {
        case 'add':
          stats.addedLines++;
          break;
        case 'remove':
          stats.removedLines++;
          break;
        case 'modify':
          stats.modifiedLines++;
          break;
      }
    });

    // Calculate similarity (simplified)
    const totalChanges = stats.addedLines + stats.removedLines + stats.modifiedLines;
    stats.similarity = Math.max(0, 1 - (totalChanges / stats.totalLines));

    return stats;
  }

  /**
   * Export diff as various formats
   */
  exportDiff(diff: AIDiff, format: 'unified' | 'context' | 'json' | 'html'): Observable<string> {
    // Always use live backend - no mock data
    
    return this.http.post<{ content: string }>(`${this.baseUrl}/export`, {
      diff,
      format
    }).pipe(
      map(response => response.content)
    );
  }

  /**
   * Compare multiple versions
   */
  compareMultipleVersions(versions: { version: string; code: string }[]): Observable<AIDiff[]> {
    const comparisons: Observable<AIDiff>[] = [];
    
    for (let i = 0; i < versions.length - 1; i++) {
      const comparison = this.generateDiff(versions[i].code, versions[i + 1].code);
      comparisons.push(comparison);
    }
    
    // Return array of diffs (simplified - in real implementation would use forkJoin)
    return of([]).pipe(delay(1000)); // Placeholder
  }

  /**
   * Update diff options
   */
  updateDiffOptions(options: Partial<DiffOptions>): void {
    const currentOptions = this.diffOptionsSignal();
    const newOptions = { ...currentOptions, ...options };
    this.diffOptionsSignal.set(newOptions);
    this.saveDiffOptions(newOptions);
  }

  /**
   * Clear diff history
   */
  clearHistory(): void {
    this.diffHistorySubject.next([]);
    localStorage.removeItem('ai_diff_history');
    this.notificationService.showInfo('Diff history cleared');
  }

  /**
   * Get diff by ID from history
   */
  getDiffById(diffId: string): AIDiff | null {
    const history = this.diffHistorySubject.value;
    return history.find(diff => diff.id === diffId) || null;
  }

  // Private methods
  private getDefaultOptions(): DiffOptions {
    const saved = localStorage.getItem('ai_diff_options');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load diff options:', error);
      }
    }
    
    return {
      ignoreWhitespace: false,
      ignoreCase: false,
      contextLines: 3,
      highlightSyntax: true,
      showLineNumbers: true,
      wordLevel: false
    };
  }

  private saveDiffOptions(options: DiffOptions): void {
    localStorage.setItem('ai_diff_options', JSON.stringify(options));
  }

  private loadDiffHistory(): void {
    const saved = localStorage.getItem('ai_diff_history');
    if (saved) {
      try {
        const history: AIDiff[] = JSON.parse(saved);
        this.diffHistorySubject.next(history);
      } catch (error) {
        console.error('Failed to load diff history:', error);
      }
    }
  }

  private addToHistory(diff: AIDiff): void {
    const currentHistory = this.diffHistorySubject.value;
    const updatedHistory = [diff, ...currentHistory].slice(0, 20); // Keep last 20
    this.diffHistorySubject.next(updatedHistory);
    localStorage.setItem('ai_diff_history', JSON.stringify(updatedHistory));
  }

  private generateId(): string {
    return 'diff_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Mock implementations for development
  private mockGenerateDiff(
    originalCode: string,
    modifiedCode: string,
    options: DiffOptions
  ): Observable<AIDiff> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const mockChanges: DiffChange[] = [
          {
            type: 'modify',
            lineNumber: 5,
            content: 'const updatedValue = newImplementation();',
            oldContent: 'const oldValue = oldImplementation();'
          },
          {
            type: 'add',
            lineNumber: 10,
            content: '// Added new feature implementation'
          },
          {
            type: 'remove',
            lineNumber: 15,
            content: 'deprecated function call'
          }
        ];

        const diff: AIDiff = {
          id: this.generateId(),
          originalCode,
          modifiedCode,
          changes: mockChanges,
          summary: `Generated diff with ${mockChanges.length} changes`,
          timestamp: new Date()
        };

        return diff;
      })
    );
  }

  private mockGenerateSmartDiff(
    originalCode: string,
    modifiedCode: string,
    context?: string
  ): Observable<AIDiff> {
    return of(null).pipe(
      delay(1500),
      map(() => {
        const smartChanges: DiffChange[] = [
          {
            type: 'modify',
            lineNumber: 3,
            content: '// AI detected: Performance optimization applied',
            oldContent: '// Original implementation'
          },
          {
            type: 'add',
            lineNumber: 8,
            content: '// AI suggestion: Added error handling'
          }
        ];

        const diff: AIDiff = {
          id: this.generateId(),
          originalCode,
          modifiedCode,
          changes: smartChanges,
          summary: `AI-enhanced diff with smart analysis${context ? ` (${context})` : ''}`,
          timestamp: new Date()
        };

        return diff;
      })
    );
  }

  private mockApplyDiff(originalCode: string, diff: AIDiff): Observable<string> {
    return of(null).pipe(
      delay(500),
      map(() => {
        // Simulate applying changes
        let result = originalCode;
        diff.changes.forEach(change => {
          if (change.type === 'add') {
            result += '\n' + change.content;
          } else if (change.type === 'modify' && change.oldContent) {
            result = result.replace(change.oldContent, change.content);
          }
        });
        return result;
      })
    );
  }

  private mockExportDiff(diff: AIDiff, format: string): Observable<string> {
    return of(null).pipe(
      delay(300),
      map(() => {
        switch (format) {
          case 'unified':
            return this.generateUnifiedDiff(diff);
          case 'json':
            return JSON.stringify(diff, null, 2);
          case 'html':
            return this.generateHTMLDiff(diff);
          default:
            return diff.summary;
        }
      })
    );
  }

  private generateUnifiedDiff(diff: AIDiff): string {
    let result = `--- Original\n+++ Modified\n`;
    
    diff.changes.forEach(change => {
      const prefix = change.type === 'add' ? '+' : change.type === 'remove' ? '-' : ' ';
      result += `${prefix}${change.lineNumber}: ${change.content}\n`;
    });
    
    return result;
  }

  private generateHTMLDiff(diff: AIDiff): string {
    let html = '<div class="diff-viewer">\n';
    
    diff.changes.forEach(change => {
      const cssClass = `diff-${change.type}`;
      html += `  <div class="${cssClass}">${change.lineNumber}: ${change.content}</div>\n`;
    });
    
    html += '</div>';
    return html;
  }
}