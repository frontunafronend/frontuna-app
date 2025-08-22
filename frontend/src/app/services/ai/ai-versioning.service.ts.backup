/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:32:02.228Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - MOCK_DATA_WITHOUT_DB_FALLBACK: HIGH
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:30:48.038Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - MOCK_DATA_WITHOUT_DB_FALLBACK: HIGH
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:22:46.036Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - MOCK_DATA_WITHOUT_DB_FALLBACK: HIGH
 */

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, delay } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { EnvironmentService } from '../core/environment.service';
import { NotificationService } from '../notification/notification.service';

export interface ComponentVersion {
  id: string;
  componentId: string;
  version: string;
  name: string;
  description: string;
  code: string;
  styles?: string;
  template?: string;
  author: string;
  authorId: string;
  isPublished: boolean;
  isStable: boolean;
  tags: string[];
  changes: VersionChange[];
  dependencies: string[];
  parentVersionId?: string;
  childVersionIds: string[];
  createdAt: Date;
  updatedAt: Date;
  downloadCount: number;
  rating: number;
  size: number;
}

export interface VersionChange {
  type: 'feature' | 'bugfix' | 'improvement' | 'breaking' | 'deprecation';
  description: string;
  impact: 'major' | 'minor' | 'patch';
  affectedFiles: string[];
}

export interface VersionComparison {
  fromVersion: ComponentVersion;
  toVersion: ComponentVersion;
  differences: VersionDifference[];
  summary: ComparisonSummary;
}

export interface VersionDifference {
  type: 'added' | 'removed' | 'modified';
  file: string;
  section: 'code' | 'template' | 'styles' | 'dependencies';
  oldContent?: string;
  newContent?: string;
  lineNumber?: number;
}

export interface ComparisonSummary {
  totalChanges: number;
  additionsCount: number;
  deletionsCount: number;
  modificationsCount: number;
  impactLevel: 'low' | 'medium' | 'high';
  breakingChanges: boolean;
}

export interface VersionBranch {
  id: string;
  name: string;
  description: string;
  baseVersionId: string;
  versions: ComponentVersion[];
  isActive: boolean;
  createdAt: Date;
}

export interface VersionMergeRequest {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  fromVersionId: string;
  toVersionId: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'merged';
  conflicts: MergeConflict[];
  createdBy: string;
  createdAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface MergeConflict {
  file: string;
  section: string;
  conflictType: 'content' | 'dependency' | 'structure';
  baseContent: string;
  sourceContent: string;
  targetContent: string;
  resolution?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIVersioningService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly environmentService = inject(EnvironmentService);
  
  private readonly baseUrl = `${this.environmentService.apiUrl}/ai/versioning`;
  
  // State management
  private readonly versionsSubject = new BehaviorSubject<ComponentVersion[]>([]);
  private readonly currentVersionSubject = new BehaviorSubject<ComponentVersion | null>(null);
  private readonly branchesSubject = new BehaviorSubject<VersionBranch[]>([]);
  private readonly isProcessingSignal = signal<boolean>(false);
  
  // Public observables
  public readonly versions$ = this.versionsSubject.asObservable();
  public readonly currentVersion$ = this.currentVersionSubject.asObservable();
  public readonly branches$ = this.branchesSubject.asObservable();
  public readonly isProcessing = this.isProcessingSignal.asReadonly();

  /**
   * Get all versions for a component
   */
  getVersions(componentId: string): Observable<ComponentVersion[]> {
    console.log('📚 AI Versioning: Getting versions for component:', componentId);
    
    // Always use live backend - no mock data
    
    return this.http.get<ComponentVersion[]>(`${this.baseUrl}/components/${componentId}/versions`)
      .pipe(
        tap(versions => {
          this.versionsSubject.next(versions);
          if (versions.length > 0 && !this.currentVersionSubject.value) {
            this.currentVersionSubject.next(versions[0]);
          }
        }),
        catchError(error => {
          console.error('❌ AI Versioning: Error getting versions:', error);
          return of([]);
        })
      );
  }

  /**
   * Get specific version
   */
  getVersion(versionId: string): Observable<ComponentVersion> {
    // Always use live backend - no mock data
    
    return this.http.get<ComponentVersion>(`${this.baseUrl}/versions/${versionId}`)
      .pipe(
        tap(version => {
          this.currentVersionSubject.next(version);
        })
      );
  }

  /**
   * Create new version
   */
  createVersion(
    componentId: string,
    name: string,
    description: string,
    code: string,
    changes: VersionChange[],
    parentVersionId?: string
  ): Observable<ComponentVersion> {
    console.log('🆕 AI Versioning: Creating new version:', name);
    
    this.isProcessingSignal.set(true);
    
    const versionData = {
      componentId,
      name,
      description,
      code,
      changes,
      parentVersionId
    };
    
    // Always use live backend - no mock data
    
    return this.http.post<ComponentVersion>(`${this.baseUrl}/versions`, versionData)
      .pipe(
        tap(version => {
          const currentVersions = this.versionsSubject.value;
          this.versionsSubject.next([version, ...currentVersions]);
          this.currentVersionSubject.next(version);
          this.isProcessingSignal.set(false);
          this.notificationService.showSuccess('Version created successfully!');
        }),
        catchError(error => {
          this.isProcessingSignal.set(false);
          this.notificationService.showError('Failed to create version');
          throw error;
        })
      );
  }

  /**
   * Update version
   */
  updateVersion(versionId: string, updates: Partial<ComponentVersion>): Observable<ComponentVersion> {
    // Always use live backend - no mock data
    
    return this.http.put<ComponentVersion>(`${this.baseUrl}/versions/${versionId}`, updates)
      .pipe(
        tap(version => {
          this.currentVersionSubject.next(version);
          this.updateVersionInList(version);
          this.notificationService.showSuccess('Version updated successfully!');
        })
      );
  }

  /**
   * Delete version
   */
  deleteVersion(versionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/versions/${versionId}`)
      .pipe(
        tap(() => {
          this.removeVersionFromList(versionId);
          this.notificationService.showSuccess('Version deleted successfully!');
        })
      );
  }

  /**
   * Compare two versions
   */
  compareVersions(fromVersionId: string, toVersionId: string): Observable<VersionComparison> {
    console.log('🔍 AI Versioning: Comparing versions:', fromVersionId, 'vs', toVersionId);
    
    // Always use live backend - no mock data
    
    return this.http.get<VersionComparison>(
      `${this.baseUrl}/versions/compare/${fromVersionId}/${toVersionId}`
    );
  }

  /**
   * Get version branches
   */
  getBranches(componentId: string): Observable<VersionBranch[]> {
    // Always use live backend - no mock data
    
    return this.http.get<VersionBranch[]>(`${this.baseUrl}/components/${componentId}/branches`)
      .pipe(
        tap(branches => {
          this.branchesSubject.next(branches);
        })
      );
  }

  /**
   * Create branch
   */
  createBranch(
    componentId: string,
    name: string,
    description: string,
    baseVersionId: string
  ): Observable<VersionBranch> {
    const branchData = { componentId, name, description, baseVersionId };
    
    return this.http.post<VersionBranch>(`${this.baseUrl}/branches`, branchData)
      .pipe(
        tap(branch => {
          const currentBranches = this.branchesSubject.value;
          this.branchesSubject.next([...currentBranches, branch]);
          this.notificationService.showSuccess('Branch created successfully!');
        })
      );
  }

  /**
   * Merge versions
   */
  mergeVersions(
    sourceVersionId: string,
    targetVersionId: string,
    resolveConflicts?: Record<string, string>
  ): Observable<ComponentVersion> {
    const mergeData = { sourceVersionId, targetVersionId, resolveConflicts };
    
    return this.http.post<ComponentVersion>(`${this.baseUrl}/versions/merge`, mergeData)
      .pipe(
        tap(mergedVersion => {
          this.currentVersionSubject.next(mergedVersion);
          this.notificationService.showSuccess('Versions merged successfully!');
        })
      );
  }

  /**
   * Get version history
   */
  getVersionHistory(componentId: string, limit: number = 20): Observable<ComponentVersion[]> {
    return this.getVersions(componentId).pipe(
      map(versions => versions.slice(0, limit))
    );
  }

  /**
   * Rollback to version
   */
  rollbackToVersion(versionId: string): Observable<ComponentVersion> {
    return this.http.post<ComponentVersion>(`${this.baseUrl}/versions/${versionId}/rollback`, {})
      .pipe(
        tap(version => {
          this.currentVersionSubject.next(version);
          this.notificationService.showSuccess('Rolled back to version successfully!');
        })
      );
  }

  /**
   * Set current version
   */
  setCurrentVersion(version: ComponentVersion): void {
    this.currentVersionSubject.next(version);
  }

  // Private helper methods
  private updateVersionInList(updatedVersion: ComponentVersion): void {
    const currentVersions = this.versionsSubject.value;
    const updatedVersions = currentVersions.map(v => 
      v.id === updatedVersion.id ? updatedVersion : v
    );
    this.versionsSubject.next(updatedVersions);
  }

  private removeVersionFromList(versionId: string): void {
    const currentVersions = this.versionsSubject.value;
    const filteredVersions = currentVersions.filter(v => v.id !== versionId);
    this.versionsSubject.next(filteredVersions);
    
    if (this.currentVersionSubject.value?.id === versionId) {
      this.currentVersionSubject.next(filteredVersions[0] || null);
    }
  }

  private generateId(): string {
    return 'version_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Mock implementations for development
  private mockGetVersions(componentId: string): Observable<ComponentVersion[]> {
    const mockVersions: ComponentVersion[] = [
      {
        id: 'v1',
        componentId,
        version: '2.1.0',
        name: 'Enhanced Features',
        description: 'Added new features and improved performance',
        code: 'export class EnhancedComponent { }',
        author: 'John Doe',
        authorId: 'user1',
        isPublished: true,
        isStable: true,
        tags: ['feature', 'performance'],
        changes: [
          {
            type: 'feature',
            description: 'Added new input validation',
            impact: 'minor',
            affectedFiles: ['component.ts']
          }
        ],
        dependencies: ['@angular/core', '@angular/material'],
        childVersionIds: [],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
        downloadCount: 150,
        rating: 4.5,
        size: 2048
      },
      {
        id: 'v2',
        componentId,
        version: '2.0.0',
        name: 'Major Update',
        description: 'Breaking changes and new architecture',
        code: 'export class UpdatedComponent { }',
        author: 'Jane Smith',
        authorId: 'user2',
        isPublished: true,
        isStable: true,
        tags: ['breaking', 'architecture'],
        changes: [
          {
            type: 'breaking',
            description: 'Changed API structure',
            impact: 'major',
            affectedFiles: ['component.ts', 'service.ts']
          }
        ],
        dependencies: ['@angular/core'],
        childVersionIds: ['v1'],
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 172800000),
        downloadCount: 89,
        rating: 4.2,
        size: 1856
      }
    ];

    return of(mockVersions).pipe(delay(500));
  }

  private mockGetVersion(versionId: string): Observable<ComponentVersion> {
    return this.mockGetVersions('mock-component').pipe(
      map(versions => versions.find(v => v.id === versionId)!),
      delay(300)
    );
  }

  private mockCreateVersion(versionData: any): Observable<ComponentVersion> {
    const newVersion: ComponentVersion = {
      id: this.generateId(),
      componentId: versionData.componentId,
      version: '2.2.0',
      name: versionData.name,
      description: versionData.description,
      code: versionData.code,
      author: 'Current User',
      authorId: 'current-user',
      isPublished: false,
      isStable: false,
      tags: ['draft'],
      changes: versionData.changes,
      dependencies: ['@angular/core'],
      parentVersionId: versionData.parentVersionId,
      childVersionIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      downloadCount: 0,
      rating: 0,
      size: versionData.code.length
    };

    return of(newVersion).pipe(delay(1000));
  }

  private mockUpdateVersion(versionId: string, updates: any): Observable<ComponentVersion> {
    return this.mockGetVersion(versionId).pipe(
      map(version => ({ ...version, ...updates, updatedAt: new Date() })),
      delay(500)
    );
  }

  private mockCompareVersions(fromId: string, toId: string): Observable<VersionComparison> {
    const mockComparison: VersionComparison = {
      fromVersion: {} as ComponentVersion, // Would be populated with actual data
      toVersion: {} as ComponentVersion,
      differences: [
        {
          type: 'modified',
          file: 'component.ts',
          section: 'code',
          oldContent: 'old implementation',
          newContent: 'new implementation',
          lineNumber: 15
        },
        {
          type: 'added',
          file: 'component.ts',
          section: 'code',
          newContent: 'new method added',
          lineNumber: 25
        }
      ],
      summary: {
        totalChanges: 2,
        additionsCount: 1,
        deletionsCount: 0,
        modificationsCount: 1,
        impactLevel: 'medium',
        breakingChanges: false
      }
    };

    return of(mockComparison).pipe(delay(800));
  }

  private mockGetBranches(componentId: string): Observable<VersionBranch[]> {
    const mockBranches: VersionBranch[] = [
      {
        id: 'main',
        name: 'main',
        description: 'Main development branch',
        baseVersionId: 'v1',
        versions: [],
        isActive: true,
        createdAt: new Date(Date.now() - 2592000000) // 30 days ago
      },
      {
        id: 'feature',
        name: 'feature/new-ui',
        description: 'New UI improvements',
        baseVersionId: 'v1',
        versions: [],
        isActive: false,
        createdAt: new Date(Date.now() - 604800000) // 7 days ago
      }
    ];

    return of(mockBranches).pipe(delay(400));
  }
}