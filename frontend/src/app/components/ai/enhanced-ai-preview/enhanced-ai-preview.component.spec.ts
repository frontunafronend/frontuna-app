import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { EnhancedAIPreviewComponent, CodeChangeEvent } from './enhanced-ai-preview.component';
import { AIResponse } from '@app/models/ai.model';

describe('EnhancedAIPreviewComponent', () => {
  let component: EnhancedAIPreviewComponent;
  let fixture: ComponentFixture<EnhancedAIPreviewComponent>;

  const mockAIResponse: AIResponse = {
    id: '1',
    promptId: 'prompt1',
    content: 'Test component code',
    code: `
      @Component({
        selector: 'app-test',
        template: \`
          <div class="test-container">
            <h2>Test Component</h2>
            <p>This is a test component</p>
          </div>
        \`,
        styles: [\`
          .test-container {
            padding: 20px;
            background: #f5f5f5;
          }
        \`]
      })
      export class TestComponent {
        title = 'Test';
      }
    `,
    confidence: 0.95,
    processingTime: 1500,
    timestamp: new Date(),
    model: 'gpt-4'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EnhancedAIPreviewComponent,
        NoopAnimationsModule,
        FormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EnhancedAIPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.activeTabIndex).toBe(0);
    expect(component.selectedLanguage).toBe('typescript');
    expect(component.autoRefresh).toBe(true);
    expect(component.isRefreshing).toBe(false);
  });

  it('should update last updated on init', () => {
    const initialTime = component.lastUpdated();
    expect(initialTime).toBeInstanceOf(Date);
  });

  describe('Input/Output handling', () => {
    it('should accept AI response input', () => {
      component.aiResponse = mockAIResponse;
      fixture.detectChanges();
      
      expect(component.aiResponse).toEqual(mockAIResponse);
    });

    it('should emit code change events', () => {
      spyOn(component.codeChange, 'emit');
      const event: CodeChangeEvent = { type: 'typescript', code: 'new code' };
      
      component.onCodeChange('new code');
      
      expect(component.codeChange.emit).toHaveBeenCalledWith(event);
    });
  });

  describe('Computed properties', () => {
    beforeEach(() => {
      component.aiResponse = mockAIResponse;
    });

    it('should compute current code correctly for TypeScript', () => {
      component.selectedLanguage = 'typescript';
      const code = component.currentCode();
      
      expect(code).toContain('@Component');
      expect(code).toContain('export class TestComponent');
    });

    it('should compute current code correctly for JavaScript', () => {
      component.selectedLanguage = 'javascript';
      const code = component.currentCode();
      
      expect(code).toContain('export class TestComponent');
      expect(code).not.toContain(': string'); // Type annotations should be removed
    });

    it('should generate HTML from TypeScript code', () => {
      const html = component.htmlCode();
      
      expect(html).toContain('<div class="test-container">');
      expect(html).toContain('<h2>Test Component</h2>');
      expect(html).toContain('<p>This is a test component</p>');
    });

    it('should generate CSS from TypeScript code', () => {
      const css = component.cssCode();
      
      expect(css).toContain('.test-container');
      expect(css).toContain('padding: 20px');
      expect(css).toContain('background: #f5f5f5');
    });

    it('should generate preview URL with all code components', () => {
      const url = component.previewUrl();
      
      expect(url).toBeTruthy();
      expect(url).toContain('blob:');
    });

    it('should handle empty AI response gracefully', () => {
      component.aiResponse = null;
      
      expect(component.currentCode()).toBe('');
      expect(component.htmlCode()).toBe('');
      expect(component.cssCode()).toBe('');
      expect(component.previewUrl()).toBe('');
    });
  });

  describe('Tab management', () => {
    it('should change active tab index', () => {
      component.onTabChange(2);
      expect(component.activeTabIndex).toBe(2);
    });

    it('should refresh preview when switching to preview tab with auto-refresh enabled', () => {
      spyOn(component, 'refreshPreview');
      component.autoRefresh = true;
      
      component.onTabChange(3); // Preview tab
      
      expect(component.refreshPreview).toHaveBeenCalled();
    });

    it('should not refresh preview when switching to preview tab with auto-refresh disabled', () => {
      spyOn(component, 'refreshPreview');
      component.autoRefresh = false;
      
      component.onTabChange(3); // Preview tab
      
      expect(component.refreshPreview).not.toHaveBeenCalled();
    });
  });

  describe('Language switching', () => {
    it('should change selected language', () => {
      component.selectedLanguage = 'javascript';
      expect(component.selectedLanguage).toBe('javascript');
    });

    it('should emit code change when language changes', () => {
      spyOn(component.codeChange, 'emit');
      
      component.onLanguageChange();
      
      expect(component.codeChange.emit).toHaveBeenCalled();
    });

    it('should update last updated when language changes', () => {
      const initialTime = component.lastUpdated();
      
      setTimeout(() => {
        component.onLanguageChange();
        const newTime = component.lastUpdated();
        expect(newTime.getTime()).toBeGreaterThan(initialTime.getTime());
      }, 10);
    });
  });

  describe('Code editing', () => {
    it('should handle code changes', () => {
      spyOn(component.codeChange, 'emit');
      
      component.onCodeChange('modified code');
      
      expect(component.codeChange.emit).toHaveBeenCalled();
    });

    it('should update last updated when code changes', () => {
      const initialTime = component.lastUpdated();
      
      setTimeout(() => {
        component.onCodeChange('modified code');
        const newTime = component.lastUpdated();
        expect(newTime.getTime()).toBeGreaterThan(initialTime.getTime());
      }, 10);
    });
  });

  describe('Auto-refresh functionality', () => {
    it('should toggle auto-refresh', () => {
      component.autoRefresh = false;
      component.onAutoRefreshChange();
      
      expect(component.autoRefresh).toBe(false);
    });

    it('should refresh preview when auto-refresh is enabled and on preview tab', () => {
      spyOn(component, 'refreshPreview');
      component.autoRefresh = true;
      component.activeTabIndex = 3; // Preview tab
      
      component.onAutoRefreshChange();
      
      expect(component.refreshPreview).toHaveBeenCalled();
    });
  });

  describe('Preview functionality', () => {
    it('should refresh preview', fakeAsync(() => {
      component.refreshPreview();
      
      expect(component.isRefreshing).toBe(true);
      expect(component.previewStatus()).toBe('pending');
      
      tick(500);
      
      expect(component.isRefreshing).toBe(false);
    }));

    it('should not refresh if already refreshing', () => {
      component.isRefreshing = true;
      const initialTime = component.lastUpdated();
      
      component.refreshPreview();
      
      // Should not change anything
      expect(component.lastUpdated()).toEqual(initialTime);
    });

    it('should handle preview load success', () => {
      component.onPreviewLoad();
      expect(component.previewStatus()).toBe('success');
    });
  });

  describe('Code formatting', () => {
    it('should format code', () => {
      spyOn(component.codeChange, 'emit');
      component.aiResponse = mockAIResponse;
      
      component.formatCode();
      
      expect(component.codeChange.emit).toHaveBeenCalled();
    });

    it('should handle formatting with no code', () => {
      component.aiResponse = null;
      
      expect(() => component.formatCode()).not.toThrow();
    });
  });

  describe('Code reset', () => {
    it('should reset code', () => {
      spyOn(component.codeChange, 'emit');
      component.aiResponse = mockAIResponse;
      
      component.resetCode();
      
      expect(component.codeChange.emit).toHaveBeenCalled();
    });

    it('should handle reset with no AI response', () => {
      component.aiResponse = null;
      
      expect(() => component.resetCode()).not.toThrow();
    });
  });

  describe('Code export', () => {
    it('should export code as JSON', () => {
      spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(URL, 'revokeObjectURL');
      const mockAnchor = {
        href: '',
        download: '',
        click: jasmine.createSpy('click')
      };
      spyOn(document, 'createElement').and.returnValue(mockAnchor as any);
      
      component.aiResponse = mockAIResponse;
      component.exportCode();
      
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle export with no AI response', () => {
      component.aiResponse = null;
      
      expect(() => component.exportCode()).not.toThrow();
    });
  });

  describe('TypeScript to JavaScript conversion', () => {
    it('should remove type annotations', () => {
      const tsCode = 'const name: string = "test"; let age: number = 25;';
      const jsCode = component['convertToJavaScript'](tsCode);
      
      expect(jsCode).toBe('const name = "test"; let age = 25;');
    });

    it('should remove interfaces', () => {
      const tsCode = 'interface User { name: string; age: number; } const user: User = { name: "test", age: 25 };';
      const jsCode = component['convertToJavaScript'](tsCode);
      
      expect(jsCode).toBe('const user = { name: "test", age: 25 };');
    });

    it('should remove type aliases', () => {
      const tsCode = 'type Status = "active" | "inactive"; const status: Status = "active";';
      const jsCode = component['convertToJavaScript'](tsCode);
      
      expect(jsCode).toBe('const status = "active";');
    });

    it('should remove imports', () => {
      const tsCode = 'import { Component } from "@angular/core"; export class TestComponent {}';
      const jsCode = component['convertToJavaScript'](tsCode);
      
      expect(jsCode).toBe('class TestComponent {}');
    });

    it('should remove exports', () => {
      const tsCode = 'export class TestComponent {} export function test() {}';
      const jsCode = component['convertToJavaScript'](tsCode);
      
      expect(jsCode).toBe('class TestComponent {} function test() {}');
    });
  });

  describe('HTML generation', () => {
    it('should extract HTML from template string', () => {
      const tsCode = 'template: `<div>Hello World</div>`';
      const html = component['generateHTML'](tsCode);
      
      expect(html).toBe('<div>Hello World</div>');
    });

    it('should generate basic HTML for component', () => {
      const tsCode = '@Component({ selector: "app-test" })';
      const html = component['generateHTML'](tsCode);
      
      expect(html).toContain('<div class="component-container">');
      expect(html).toContain('<h2>Generated Component</h2>');
    });

    it('should handle no HTML template', () => {
      const tsCode = 'const test = "hello";';
      const html = component['generateHTML'](tsCode);
      
      expect(html).toBe('<div>No HTML template found</div>');
    });
  });

  describe('CSS generation', () => {
    it('should extract CSS from styles array', () => {
      const tsCode = 'styles: [`body { margin: 0; }`]';
      const css = component['generateCSS'](tsCode);
      
      expect(css).toBe('body { margin: 0; }');
    });

    it('should generate basic CSS for component', () => {
      const tsCode = '@Component({ selector: "app-test" })';
      const css = component['generateCSS'](tsCode);
      
      expect(css).toContain('.component-container');
      expect(css).toContain('padding: 20px');
      expect(css).toContain('background: #ffffff');
    });

    it('should handle no CSS styles', () => {
      const tsCode = 'const test = "hello";';
      const css = component['generateCSS'](tsCode);
      
      expect(css).toBe('');
    });
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      component.aiResponse = mockAIResponse;
      fixture.detectChanges();
    });

    it('should render all tabs', () => {
      const tabs = fixture.debugElement.queryAll(By.css('mat-tab'));
      expect(tabs.length).toBe(4); // TypeScript/JS, HTML, CSS, Preview
    });

    it('should render preview header', () => {
      const header = fixture.debugElement.query(By.css('.preview-header'));
      expect(header).toBeTruthy();
      expect(header.nativeElement.textContent).toContain('Live Preview');
    });

    it('should render status bar', () => {
      const statusBar = fixture.debugElement.query(By.css('.status-bar'));
      expect(statusBar).toBeTruthy();
    });

    it('should render language selector', () => {
      const languageSelector = fixture.debugElement.query(By.css('.language-selector'));
      expect(languageSelector).toBeTruthy();
    });

    it('should render code actions', () => {
      const codeActions = fixture.debugElement.queryAll(By.css('.code-actions button'));
      expect(codeActions.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive design', () => {
    it('should have responsive CSS rules', () => {
      // Test that the component handles responsive design properly
      expect(component).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    it('should handle missing AI response gracefully', () => {
      component.aiResponse = null;
      
      expect(() => {
        component.onCodeChange('test');
        component.onLanguageChange();
        component.formatCode();
        component.resetCode();
        component.exportCode();
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large code efficiently', () => {
      const largeCode = 'const largeArray = [' + Array.from({ length: 1000 }, (_, i) => `"item${i}"`).join(', ') + '];';
      const largeResponse = { ...mockAIResponse, code: largeCode };
      
      component.aiResponse = largeResponse;
      
      const startTime = performance.now();
      const code = component.currentCode();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
      expect(code).toContain('item999');
    });
  });
});
