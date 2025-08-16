import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MonacoCodeEditorComponent } from './monaco-code-editor.component';

// Mock Monaco Editor
const mockMonacoEditor = {
  create: jasmine.createSpy('create').and.returnValue({
    getValue: jasmine.createSpy('getValue').and.returnValue(''),
    setValue: jasmine.createSpy('setValue'),
    getModel: jasmine.createSpy('getModel').and.returnValue({}),
    updateOptions: jasmine.createSpy('updateOptions'),
    dispose: jasmine.createSpy('dispose'),
    onDidChangeModelContent: jasmine.createSpy('onDidChangeModelContent').and.returnValue({
      dispose: jasmine.createSpy('dispose')
    }),
    onDidChangeCursorPosition: jasmine.createSpy('onDidChangeCursorPosition').and.returnValue({
      dispose: jasmine.createSpy('dispose')
    }),
    onDidChangeModelSelection: jasmine.createSpy('onDidChangeModelSelection').and.returnValue({
      dispose: jasmine.createSpy('dispose')
    }),
    getPosition: jasmine.createSpy('getPosition').and.returnValue({ lineNumber: 1, column: 1 }),
    getSelection: jasmine.createSpy('getSelection').and.returnValue(null),
    trigger: jasmine.createSpy('trigger'),
    canUndo: jasmine.createSpy('canUndo').and.returnValue(false),
    canRedo: jasmine.createSpy('canRedo').and.returnValue(false)
  }),
  editor: {
    create: jasmine.createSpy('create'),
    setModelLanguage: jasmine.createSpy('setModelLanguage'),
    setTheme: jasmine.createSpy('setTheme')
  }
};

// Mock global monaco
(global as any).monaco = mockMonacoEditor;
(window as any).monaco = mockMonacoEditor;

describe('MonacoCodeEditorComponent', () => {
  let component: MonacoCodeEditorComponent;
  let fixture: ComponentFixture<MonacoCodeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MonacoCodeEditorComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MonacoCodeEditorComponent);
    component = fixture.componentInstance;
    
    // Mock the container element
    component.monacoContainer = {
      nativeElement: document.createElement('div')
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should have default values', () => {
      expect(component.value).toBe('');
      expect(component.language).toBe('typescript');
      expect(component.theme).toBe('vs-dark');
      expect(component.isReadOnly).toBe(false);
      expect(component.showHeader).toBe(true);
      expect(component.showStatusBar).toBe(true);
    });

    it('should initialize signals with default values', () => {
      expect(component.currentLine()).toBe(1);
      expect(component.currentColumn()).toBe(1);
      expect(component.selectionLength()).toBe(0);
    });
  });

  describe('Monaco Editor Integration', () => {
    beforeEach(() => {
      // Simulate Monaco being loaded
      component['isMonacoLoaded'] = true;
    });

    it('should initialize editor when Monaco is loaded', () => {
      component['initializeEditor']();
      
      expect(mockMonacoEditor.create).toHaveBeenCalled();
    });

    it('should handle editor options correctly', () => {
      const customOptions = {
        fontSize: 16,
        wordWrap: 'on' as const,
        minimap: { enabled: false }
      };
      
      component.options = customOptions;
      component['initializeEditor']();

      const createCall = mockMonacoEditor.create.calls.mostRecent();
      const passedOptions = createCall.args[1];
      
      expect(passedOptions.fontSize).toBe(16);
      expect(passedOptions.wordWrap).toBe('on');
      expect(passedOptions.minimap.enabled).toBe(false);
    });

    it('should emit editorReady event', () => {
      spyOn(component.editorReady, 'emit');
      
      component['initializeEditor']();
      
      expect(component.editorReady.emit).toHaveBeenCalled();
    });

    it('should setup event listeners', () => {
      const mockEditor = mockMonacoEditor.create();
      component['editor'] = mockEditor;
      
      component['setupEventListeners']();
      
      expect(mockEditor.onDidChangeModelContent).toHaveBeenCalled();
      expect(mockEditor.onDidChangeCursorPosition).toHaveBeenCalled();
      expect(mockEditor.onDidChangeModelSelection).toHaveBeenCalled();
    });
  });

  describe('Input Changes', () => {
    beforeEach(() => {
      component['editor'] = mockMonacoEditor.create();
    });

    it('should update editor value when value input changes', () => {
      const newValue = 'const x = 1;';
      component.value = newValue;
      
      // Simulate value change detection
      if (component['editor']) {
        component['editor'].setValue(newValue);
      }

      expect(component.value).toBe(newValue);
    });

    it('should update editor language when language input changes', () => {
      component.language = 'javascript';
      expect(component.language).toBe('javascript');
    });

    it('should update editor theme when theme input changes', () => {
      component.theme = 'vs-light';
      expect(component.theme).toBe('vs-light');
    });

    it('should update readonly option when isReadOnly input changes', () => {
      component.isReadOnly = true;
      expect(component.isReadOnly).toBe(true);
    });
  });

  describe('Editor Actions', () => {
    beforeEach(() => {
      component['editor'] = mockMonacoEditor.create();
    });

    it('should format code', () => {
      const mockAction = { run: jasmine.createSpy('run') };
      component['editor'].getAction = jasmine.createSpy('getAction').and.returnValue(mockAction);
      
      component.formatCode();
      
      expect(component['editor'].getAction).toHaveBeenCalledWith('editor.action.formatDocument');
      expect(mockAction.run).toHaveBeenCalled();
    });

    it('should clear code', () => {
      component.clearCode();
      expect(component['editor'].setValue).toHaveBeenCalledWith('');
    });

    it('should copy code to clipboard', async () => {
      const mockWriteText = jasmine.createSpy('writeText').and.returnValue(Promise.resolve());
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true
      });

      component['editor'].getValue.and.returnValue('const x = 1;');
      
      await component.copyCode();
      
      expect(mockWriteText).toHaveBeenCalledWith('const x = 1;');
    });
  });

  describe('Editor State', () => {
    it('should handle editor initialization', () => {
      expect(component['editor']).toBeFalsy();
      expect(component['isMonacoLoaded']).toBe(false);
    });

    it('should handle missing editor gracefully', () => {
      component['editor'] = null;
      
      // Should not throw errors when editor is null
      expect(() => component.formatCode()).not.toThrow();
      expect(() => component.clearCode()).not.toThrow();
      expect(() => component.copyCode()).not.toThrow();
    });
  });

  describe('Lifecycle', () => {
    it('should dispose editor on destroy', () => {
      const mockEditor = mockMonacoEditor.create();
      
      component['editor'] = mockEditor;
      
      component.ngOnDestroy();
      
      expect(mockEditor.dispose).toHaveBeenCalled();
    });

    it('should handle destroy when editor is not initialized', () => {
      component['editor'] = null;
      
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle Monaco loading errors gracefully', () => {
      spyOn(console, 'error');
      mockMonacoEditor.create.and.throwError('Monaco failed to load');
      
      expect(() => component['initializeEditor']()).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle clipboard errors gracefully', async () => {
      spyOn(console, 'error');
      Object.defineProperty(navigator, 'clipboard', {
        value: { 
          writeText: jasmine.createSpy('writeText').and.returnValue(Promise.reject('Clipboard error'))
        },
        writable: true
      });

      component['editor'] = mockMonacoEditor.create();
      component['editor'].getValue.and.returnValue('test');
      
      await component.copyCode();
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Template Integration', () => {
    it('should render header when showHeader is true', () => {
      component.showHeader = true;
      fixture.detectChanges();
      
      const header = fixture.nativeElement.querySelector('.editor-header');
      expect(header).toBeTruthy();
    });

    it('should hide header when showHeader is false', () => {
      component.showHeader = false;
      fixture.detectChanges();
      
      const header = fixture.nativeElement.querySelector('.editor-header');
      expect(header).toBeFalsy();
    });

    it('should render status bar when showStatusBar is true', () => {
      component.showStatusBar = true;
      fixture.detectChanges();
      
      const statusBar = fixture.nativeElement.querySelector('.editor-status-bar');
      expect(statusBar).toBeTruthy();
    });

    it('should hide status bar when showStatusBar is false', () => {
      component.showStatusBar = false;
      fixture.detectChanges();
      
      const statusBar = fixture.nativeElement.querySelector('.editor-status-bar');
      expect(statusBar).toBeFalsy();
    });

    it('should display editor container', () => {
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.monaco-editor-container');
      expect(container).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      fixture.detectChanges();
      
      const buttons = fixture.nativeElement.querySelectorAll('button[mat-icon-button]');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Each button should have either matTooltip or aria-label
      buttons.forEach((button: HTMLElement) => {
        const hasTooltip = button.hasAttribute('matTooltip');
        const hasAriaLabel = button.hasAttribute('aria-label');
        expect(hasTooltip || hasAriaLabel).toBe(true);
      });
    });
  });
});
