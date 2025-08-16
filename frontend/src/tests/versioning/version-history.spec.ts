/**
 * Version History Component Tests
 * Tests for the component that displays version history with filtering and comparison
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { VersionHistoryComponent } from '../../app/components/versioning/version-history/version-history.component';
import { AIVersioningService } from '../../app/services/ai/ai-versioning.service';
import { NotificationService } from '../../app/services/notification/notification.service';
import { TestingUtils, mockComponentVersion, mockUser } from '../utils/test-helpers';
import { ComponentVersion } from '../../app/services/ai/ai-versioning.service';

describe('VersionHistoryComponent', () => {
  let component: VersionHistoryComponent;
  let fixture: ComponentFixture<VersionHistoryComponent>;
  let aiVersioningService: jasmine.SpyObj<AIVersioningService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const mockVersionHistory: ComponentVersion[] = [
    {
      ...mockComponentVersion,
      id: 'version-1',
      version: '2.1.0',
      description: 'Added dark mode support',
      timestamp: new Date('2024-01-15T10:00:00Z'),
      branch: 'main'
    },
    {
      ...mockComponentVersion,
      id: 'version-2',
      version: '2.0.0',
      description: 'Major refactoring with TypeScript',
      timestamp: new Date('2024-01-10T15:30:00Z'),
      branch: 'develop'
    },
    {
      ...mockComponentVersion,
      id: 'version-3',
      version: '1.5.2',
      description: 'Bug fixes and performance improvements',
      timestamp: new Date('2024-01-05T09:15:00Z'),
      branch: 'main'
    }
  ];

  beforeEach(async () => {
    const aiVersioningSpy = TestingUtils.createSpyObj('AIVersioningService', [
      'getVersionHistory',
      'compareVersions',
      'restoreVersion',
      'deleteVersion'
    ]);
    const notificationSpy = TestingUtils.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
      'showInfo'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        VersionHistoryComponent,
        NoopAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatTooltipModule,
        MatMenuModule,
        MatCheckboxModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: AIVersioningService, useValue: aiVersioningSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VersionHistoryComponent);
    component = fixture.componentInstance;
    aiVersioningService = TestBed.inject(AIVersioningService) as jasmine.SpyObj<AIVersioningService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    // Set up mock data
    component.versionHistory.set(mockVersionHistory);
    aiVersioningService.getVersionHistory.and.returnValue(of(mockVersionHistory));

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with version history', () => {
      expect(component.versionHistory().length).toBe(3);
    });

    it('should initialize filtered history', () => {
      expect(component.filteredHistory().length).toBe(3);
    });

    it('should have default filter values', () => {
      expect(component.filterBranch()).toBe('all');
      expect(component.filterAuthor()).toBe('all');
      expect(component.filterDate()).toBe('all');
    });
  });

  describe('Filtering', () => {
    it('should filter by branch', () => {
      component.filterBranch.set('main');
      component.applyFilters();

      const filtered = component.filteredHistory();
      expect(filtered.length).toBe(2);
      expect(filtered.every(v => v.branch === 'main')).toBeTruthy();
    });

    it('should filter by author', () => {
      component.filterAuthor.set(mockUser.id);
      component.applyFilters();

      const filtered = component.filteredHistory();
      expect(filtered.every(v => v.author.id === mockUser.id)).toBeTruthy();
    });

    it('should filter by date range', () => {
      component.filterDate.set('last-week');
      component.applyFilters();

      const filtered = component.filteredHistory();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      expect(filtered.every(v => v.timestamp >= weekAgo)).toBeTruthy();
    });

    it('should combine multiple filters', () => {
      component.filterBranch.set('main');
      component.filterAuthor.set(mockUser.id);
      component.applyFilters();

      const filtered = component.filteredHistory();
      expect(filtered.every(v => 
        v.branch === 'main' && v.author.id === mockUser.id
      )).toBeTruthy();
    });

    it('should reset filters', () => {
      component.filterBranch.set('develop');
      component.filterAuthor.set('some-author');
      component.resetFilters();

      expect(component.filterBranch()).toBe('all');
      expect(component.filterAuthor()).toBe('all');
      expect(component.filterDate()).toBe('all');
      expect(component.filteredHistory().length).toBe(mockVersionHistory.length);
    });
  });

  describe('Version Selection', () => {
    it('should select single version', () => {
      const version = mockVersionHistory[0];
      component.selectVersion(version, false);

      expect(component.selectedVersions().length).toBe(1);
      expect(component.selectedVersion()).toBe(version);
    });

    it('should select multiple versions with Ctrl+click', () => {
      const version1 = mockVersionHistory[0];
      const version2 = mockVersionHistory[1];
      
      component.selectVersion(version1, false);
      component.selectVersion(version2, true);

      expect(component.selectedVersions().length).toBe(2);
      expect(component.selectedVersions()).toContain(version1);
      expect(component.selectedVersions()).toContain(version2);
    });

    it('should deselect version when clicking selected version', () => {
      const version = mockVersionHistory[0];
      
      component.selectVersion(version, false);
      expect(component.selectedVersions().length).toBe(1);
      
      component.selectVersion(version, false);
      expect(component.selectedVersions().length).toBe(0);
    });

    it('should clear selection', () => {
      component.selectVersion(mockVersionHistory[0], false);
      component.selectVersion(mockVersionHistory[1], true);
      
      component.clearSelection();
      
      expect(component.selectedVersions().length).toBe(0);
    });
  });

  describe('Version Comparison', () => {
    it('should compare two selected versions', () => {
      const version1 = mockVersionHistory[0];
      const version2 = mockVersionHistory[1];
      
      component.selectVersion(version1, false);
      component.selectVersion(version2, true);
      
      component.compareSelectedVersions();
      
      expect(aiVersioningService.compareVersions).toHaveBeenCalledWith(
        version1.id,
        version2.id
      );
    });

    it('should show error when comparing with wrong number of selections', () => {
      component.selectVersion(mockVersionHistory[0], false);
      
      component.compareSelectedVersions();
      
      expect(notificationService.showError).toHaveBeenCalledWith(
        'Please select exactly 2 versions to compare.'
      );
    });

    it('should compare specific version with another', () => {
      const version = mockVersionHistory[0];
      
      component.compareVersion(version);
      
      expect(aiVersioningService.compareVersions).toHaveBeenCalled();
    });
  });

  describe('Version Restoration', () => {
    it('should restore selected version', async () => {
      const version = mockVersionHistory[0];
      aiVersioningService.restoreVersion.and.returnValue(of(undefined));
      
      await component.restoreVersion(version);
      
      expect(aiVersioningService.restoreVersion).toHaveBeenCalledWith(version.id);
      expect(notificationService.showSuccess).toHaveBeenCalledWith(
        `Restored to version ${version.version}`
      );
    });

    it('should handle restoration errors', async () => {
      const version = mockVersionHistory[0];
      aiVersioningService.restoreVersion.and.throwError('Restoration failed');
      
      await component.restoreVersion(version);
      
      expect(notificationService.showError).toHaveBeenCalledWith(
        'Failed to restore version. Please try again.'
      );
    });

    it('should confirm before restoring', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const version = mockVersionHistory[0];
      
      component.restoreVersion(version);
      
      expect(aiVersioningService.restoreVersion).not.toHaveBeenCalled();
    });
  });

  describe('Table Display', () => {
    it('should display version data in table', async () => {
      await TestingUtils.waitForStability(fixture);

      const rows = TestingUtils.getAllElements(fixture, 'mat-row');
      expect(rows.length).toBe(mockVersionHistory.length);
    });

    it('should display version numbers', async () => {
      await TestingUtils.waitForStability(fixture);

      const versionCells = TestingUtils.getAllElements(fixture, '.version-cell');
      expect(versionCells.length).toBeGreaterThan(0);
      expect(versionCells[0].textContent).toContain('2.1.0');
    });

    it('should display branch information', async () => {
      await TestingUtils.waitForStability(fixture);

      const branchChips = TestingUtils.getAllElements(fixture, 'mat-chip');
      expect(branchChips.length).toBeGreaterThan(0);
    });

    it('should display author information', async () => {
      await TestingUtils.waitForStability(fixture);

      const authorCells = TestingUtils.getAllElements(fixture, '.author-cell');
      expect(authorCells.length).toBeGreaterThan(0);
    });

    it('should display timestamps in relative format', async () => {
      await TestingUtils.waitForStability(fixture);

      const timestampCells = TestingUtils.getAllElements(fixture, '.timestamp-cell');
      expect(timestampCells.length).toBeGreaterThan(0);
    });
  });

  describe('Sorting', () => {
    it('should sort by version', async () => {
      await TestingUtils.waitForStability(fixture);

      const versionHeader = fixture.nativeElement.querySelector('[mat-sort-header="version"]');
      versionHeader?.click();
      fixture.detectChanges();

      // Verify sorting was applied
      const sortedVersions = component.filteredHistory();
      expect(sortedVersions[0].version).toBe('1.5.2');
    });

    it('should sort by date', async () => {
      await TestingUtils.waitForStability(fixture);

      const dateHeader = fixture.nativeElement.querySelector('[mat-sort-header="timestamp"]');
      dateHeader?.click();
      fixture.detectChanges();

      const sortedVersions = component.filteredHistory();
      expect(sortedVersions[0].timestamp.getTime()).toBeLessThanOrEqual(
        sortedVersions[1].timestamp.getTime()
      );
    });

    it('should sort by author', async () => {
      await TestingUtils.waitForStability(fixture);

      const authorHeader = fixture.nativeElement.querySelector('[mat-sort-header="author"]');
      authorHeader?.click();
      fixture.detectChanges();

      // Verify sorting was applied
      expect(component.filteredHistory().length).toBeGreaterThan(0);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      // Create more versions for pagination testing
      const moreVersions = Array.from({ length: 15 }, (_, i) => ({
        ...mockComponentVersion,
        id: `version-${i + 4}`,
        version: `1.${i}.0`,
        timestamp: new Date(2024, 0, i + 1)
      }));
      
      component.versionHistory.set([...mockVersionHistory, ...moreVersions]);
      component.applyFilters();
    });

    it('should paginate results', async () => {
      await TestingUtils.waitForStability(fixture);

      const paginator = fixture.nativeElement.querySelector('mat-paginator');
      expect(paginator).toBeTruthy();
    });

    it('should navigate to next page', async () => {
      await TestingUtils.waitForStability(fixture);

      const nextButton = fixture.nativeElement.querySelector('.mat-paginator-navigation-next');
      nextButton?.click();
      fixture.detectChanges();

      // Verify page changed
      expect(component.currentPage).toBeGreaterThan(0);
    });
  });

  describe('UI Interactions', () => {
    it('should show filter controls', async () => {
      await TestingUtils.waitForStability(fixture);

      expect(TestingUtils.elementExists(fixture, '.filter-branch')).toBeTruthy();
      expect(TestingUtils.elementExists(fixture, '.filter-author')).toBeTruthy();
      expect(TestingUtils.elementExists(fixture, '.filter-date')).toBeTruthy();
    });

    it('should show action buttons for selected versions', async () => {
      component.selectVersion(mockVersionHistory[0], false);
      await TestingUtils.waitForStability(fixture);

      expect(TestingUtils.elementExists(fixture, '.action-compare')).toBeTruthy();
      expect(TestingUtils.elementExists(fixture, '.action-restore')).toBeTruthy();
    });

    it('should show context menu on right-click', async () => {
      await TestingUtils.waitForStability(fixture);

      const row = fixture.nativeElement.querySelector('mat-row');
      const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true });
      row?.dispatchEvent(contextMenuEvent);
      fixture.detectChanges();

      expect(TestingUtils.elementExists(fixture, 'mat-menu')).toBeTruthy();
    });

    it('should highlight selected rows', async () => {
      component.selectVersion(mockVersionHistory[0], false);
      await TestingUtils.waitForStability(fixture);

      const selectedRow = fixture.nativeElement.querySelector('mat-row.selected');
      expect(selectedRow).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      await TestingUtils.waitForStability(fixture);

      const table = fixture.nativeElement.querySelector('mat-table');
      expect(table?.getAttribute('role')).toBe('table');
      expect(table?.getAttribute('aria-label')).toContain('version history');
    });

    it('should support keyboard navigation', async () => {
      await TestingUtils.waitForStability(fixture);

      const rows = TestingUtils.getAllElements(fixture, 'mat-row');
      rows.forEach(row => {
        expect(row.getAttribute('tabindex')).toBe('0');
      });
    });

    it('should announce selection changes', async () => {
      component.selectVersion(mockVersionHistory[0], false);
      await TestingUtils.waitForStability(fixture);

      const liveRegion = fixture.nativeElement.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should handle large version history efficiently', () => {
      const largeHistory = Array.from({ length: 1000 }, (_, i) => ({
        ...mockComponentVersion,
        id: `version-${i}`,
        version: `1.${i}.0`
      }));

      const startTime = performance.now();
      component.versionHistory.set(largeHistory);
      component.applyFilters();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should debounce filter changes', (done) => {
      spyOn(component, 'applyFilters').and.callThrough();

      component.filterBranch.set('main');
      component.filterBranch.set('develop');
      component.filterBranch.set('feature');

      setTimeout(() => {
        expect(component.applyFilters).toHaveBeenCalledTimes(1);
        done();
      }, 50);
    });
  });
});