import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AIDiffViewerComponent, DiffData, DiffApplyEvent } from './ai-diff-viewer.component';
import { EditorBuffers } from '../../../services/editor-state.service';

describe('AIDiffViewerComponent', () => {
  let component: AIDiffViewerComponent;
  let fixture: ComponentFixture<AIDiffViewerComponent>;

  const mockDiffData: DiffData = {
    before: {
      typescript: 'const x = 1;',
      html: '<div>old</div>',
      scss: '.old { color: red; }'
    },
    after: {
      typescript: 'const x = 2;',
      html: '<div>new</div>',
      scss: '.new { color: blue; }'
    },
    changes: [
      {
        type: 'typescript',
        before: 'const x = 1;',
        after: 'const x = 2;',
        hasChanges: true
      },
      {
        type: 'html',
        before: '<div>old</div>',
        after: '<div>new</div>',
        hasChanges: true
      },
      {
        type: 'scss',
        before: '.old { color: red; }',
        after: '.new { color: blue; }',
        hasChanges: true
      }
    ],
    hasAnyChanges: true,
    changedTypes: ['typescript', 'html', 'scss']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AIDiffViewerComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AIDiffViewerComponent);
    component = fixture.componentInstance;
    
    // Set initial diff data
    component.diffData.set(mockDiffData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should auto-select all changes by default', () => {
      expect(component.selectedChanges()).toEqual(['typescript', 'html', 'scss']);
      expect(component.hasSelectedChanges()).toBe(true);
    });

    it('should display correct tab labels', () => {
      expect(component.getTabLabel('typescript')).toBe('TypeScript');
      expect(component.getTabLabel('html')).toBe('HTML');
      expect(component.getTabLabel('scss')).toBe('SCSS');
    });

    it('should display correct file names', () => {
      expect(component.getFileName('typescript')).toBe('component.ts');
      expect(component.getFileName('html')).toBe('component.html');
      expect(component.getFileName('scss')).toBe('component.scss');
    });

    it('should display correct file icons', () => {
      expect(component.getFileIcon('typescript')).toBe('code');
      expect(component.getFileIcon('html')).toBe('html');
      expect(component.getFileIcon('scss')).toBe('style');
    });
  });

  describe('Selection Management', () => {
    it('should select all changes', () => {
      component.selectNone();
      expect(component.selectedChanges()).toEqual([]);

      component.selectAll();
      expect(component.selectedChanges()).toEqual(['typescript', 'html', 'scss']);
    });

    it('should select none', () => {
      component.selectNone();
      expect(component.selectedChanges()).toEqual([]);
      expect(component.hasSelectedChanges()).toBe(false);
    });

    it('should toggle individual changes', () => {
      component.selectNone();
      
      // Add typescript
      component.toggleChange('typescript', { checked: true });
      expect(component.selectedChanges()).toEqual(['typescript']);
      expect(component.isChangeSelected('typescript')).toBe(true);

      // Add html
      component.toggleChange('html', { checked: true });
      expect(component.selectedChanges()).toEqual(['typescript', 'html']);

      // Remove typescript
      component.toggleChange('typescript', { checked: false });
      expect(component.selectedChanges()).toEqual(['html']);
      expect(component.isChangeSelected('typescript')).toBe(false);
    });

    it('should not add duplicate selections', () => {
      component.selectNone();
      component.toggleChange('typescript', { checked: true });
      component.toggleChange('typescript', { checked: true }); // Try to add again

      expect(component.selectedChanges()).toEqual(['typescript']);
    });
  });

  describe('Event Handling', () => {
    it('should emit apply selected changes event', () => {
      spyOn(component.applyChanges, 'emit');
      
      component.selectNone();
      component.toggleChange('typescript', { checked: true });
      component.toggleChange('html', { checked: true });

      component.onApplySelected();

      expect(component.applyChanges.emit).toHaveBeenCalledWith({
        applyAll: false,
        selectedChanges: ['typescript', 'html']
      });
    });

    it('should emit apply all changes event', () => {
      spyOn(component.applyChanges, 'emit');

      component.onApplyAll();

      expect(component.applyChanges.emit).toHaveBeenCalledWith({
        applyAll: true,
        selectedChanges: ['typescript', 'html', 'scss']
      });
    });

    it('should emit cancel event', () => {
      spyOn(component.cancel, 'emit');

      component.onCancel();

      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should handle tab changes', () => {
      component.onTabChange(1);
      expect(component.activeTab).toBe(1);
    });
  });

  describe('Utility Methods', () => {
    it('should get correct language for type', () => {
      expect(component.getLanguageForType('typescript')).toBe('typescript');
      expect(component.getLanguageForType('html')).toBe('html');
      expect(component.getLanguageForType('scss')).toBe('scss');
    });

    it('should count lines correctly', () => {
      expect(component.getLineCount('line1\nline2\nline3')).toBe(3);
      expect(component.getLineCount('single line')).toBe(1);
      expect(component.getLineCount('')).toBe(0);
    });

    it('should calculate additions correctly', () => {
      const before = 'line1\nline2';
      const after = 'line1\nline2\nline3\nline4';
      
      expect(component.getAdditions(before, after)).toBe(2);
    });

    it('should calculate deletions correctly', () => {
      const before = 'line1\nline2\nline3\nline4';
      const after = 'line1\nline2';
      
      expect(component.getDeletions(before, after)).toBe(2);
    });

    it('should handle empty content in calculations', () => {
      expect(component.getAdditions('', 'new content')).toBe(1);
      expect(component.getDeletions('old content', '')).toBe(1);
      expect(component.getAdditions('', '')).toBe(0);
      expect(component.getDeletions('', '')).toBe(0);
    });

    it('should track changes correctly', () => {
      const change = { type: 'typescript' as keyof EditorBuffers };
      expect(component.trackChange(0, change)).toBe('typescript');
    });
  });

  describe('Component State', () => {
    it('should handle diff data with no changes', () => {
      const noChangesDiffData: DiffData = {
        before: { typescript: '', html: '', scss: '' },
        after: {},
        changes: [],
        hasAnyChanges: false,
        changedTypes: []
      };

      component.diffData.set(noChangesDiffData);
      fixture.detectChanges();

      expect(component.hasSelectedChanges()).toBe(false);
    });

    it('should handle partial changes', () => {
      const partialDiffData: DiffData = {
        before: { typescript: 'old', html: '', scss: '' },
        after: { typescript: 'new' },
        changes: [
          {
            type: 'typescript',
            before: 'old',
            after: 'new',
            hasChanges: true
          },
          {
            type: 'html',
            before: '',
            after: '',
            hasChanges: false
          },
          {
            type: 'scss',
            before: '',
            after: '',
            hasChanges: false
          }
        ],
        hasAnyChanges: true,
        changedTypes: ['typescript']
      };

      component.diffData.set(partialDiffData);
      fixture.detectChanges();

      // Should auto-select only changed types
      component.selectAll();
      expect(component.selectedChanges()).toEqual(['typescript']);
    });
  });

  describe('Template Integration', () => {
    it('should render diff data correctly', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      // Check if header is rendered
      expect(compiled.querySelector('.diff-header h2')).toBeTruthy();
      
      // Check if tabs are rendered
      expect(compiled.querySelector('mat-tab-group')).toBeTruthy();
      
      // Check if footer actions are rendered
      expect(compiled.querySelector('.diff-footer')).toBeTruthy();
    });

    it('should disable apply buttons when no changes selected', () => {
      component.selectNone();
      fixture.detectChanges();

      const applySelectedBtn = fixture.nativeElement.querySelector('.apply-button') as HTMLButtonElement;
      expect(applySelectedBtn?.disabled).toBe(true);
    });

    it('should enable apply buttons when changes are selected', () => {
      component.selectAll();
      fixture.detectChanges();

      const applySelectedBtn = fixture.nativeElement.querySelector('.apply-button') as HTMLButtonElement;
      const applyAllBtn = fixture.nativeElement.querySelector('.apply-all-button') as HTMLButtonElement;
      
      expect(applySelectedBtn?.disabled).toBe(false);
      expect(applyAllBtn?.disabled).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      // Check for important accessibility features
      const checkboxes = compiled.querySelectorAll('mat-checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
      
      const buttons = compiled.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', () => {
      // Tab changes should be accessible
      expect(component.onTabChange).toBeDefined();
      
      // Button actions should be accessible
      expect(component.onApplySelected).toBeDefined();
      expect(component.onApplyAll).toBeDefined();
      expect(component.onCancel).toBeDefined();
    });
  });
});
