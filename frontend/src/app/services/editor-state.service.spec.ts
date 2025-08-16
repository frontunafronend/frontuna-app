import { TestBed } from '@angular/core/testing';
import { EditorStateService, EditorBuffers } from './editor-state.service';

describe('EditorStateService', () => {
  let service: EditorStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditorStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with empty buffers', () => {
      const buffers = service.buffers();
      expect(buffers.typescript).toBe('');
      expect(buffers.html).toBe('');
      expect(buffers.scss).toBe('');
    });

    it('should initialize with typescript as active tab', () => {
      expect(service.activeTab()).toBe('typescript');
    });

    it('should initialize with no changes', () => {
      expect(service.hasChanges()).toBe(false);
    });

    it('should initialize as empty', () => {
      expect(service.isEmpty()).toBe(true);
    });

    it('should initialize with no code', () => {
      expect(service.hasCode()).toBe(false);
    });
  });

  describe('Buffer Management', () => {
    it('should update single buffer', () => {
      const testCode = 'console.log("test");';
      service.updateBuffer('typescript', testCode);
      
      expect(service.buffers().typescript).toBe(testCode);
      expect(service.hasChanges()).toBe(true);
      expect(service.hasCode()).toBe(true);
      expect(service.isEmpty()).toBe(false);
    });

    it('should update multiple buffers', () => {
      const buffers: Partial<EditorBuffers> = {
        typescript: 'const x = 1;',
        html: '<div>Hello</div>',
        scss: '.test { color: red; }'
      };

      service.updateBuffers(buffers);

      expect(service.buffers().typescript).toBe(buffers.typescript!);
      expect(service.buffers().html).toBe(buffers.html!);
      expect(service.buffers().scss).toBe(buffers.scss!);
      expect(service.hasChanges()).toBe(true);
      expect(service.hasCode()).toBe(true);
    });

    it('should not update if content is the same', () => {
      const initialTime = service.lastModified();
      
      // Wait a bit to ensure timestamp would change if updated
      setTimeout(() => {
        service.updateBuffer('typescript', '');
        expect(service.lastModified()).toEqual(initialTime);
        expect(service.hasChanges()).toBe(false);
      }, 10);
    });

    it('should clear all buffers', () => {
      // First add some content
      service.updateBuffers({
        typescript: 'test',
        html: '<div>test</div>',
        scss: '.test {}'
      });

      expect(service.hasCode()).toBe(true);
      expect(service.hasChanges()).toBe(true);

      // Clear buffers
      service.clearBuffers();

      expect(service.buffers().typescript).toBe('');
      expect(service.buffers().html).toBe('');
      expect(service.buffers().scss).toBe('');
      expect(service.hasChanges()).toBe(false);
      expect(service.hasCode()).toBe(false);
      expect(service.isEmpty()).toBe(true);
    });
  });

  describe('Active Tab Management', () => {
    it('should set active tab', () => {
      service.setActiveTab('html');
      expect(service.activeTab()).toBe('html');

      service.setActiveTab('scss');
      expect(service.activeTab()).toBe('scss');
    });

    it('should return current buffer based on active tab', () => {
      service.updateBuffers({
        typescript: 'ts code',
        html: 'html code',
        scss: 'scss code'
      });

      service.setActiveTab('typescript');
      expect(service.currentBuffer()).toBe('ts code');

      service.setActiveTab('html');
      expect(service.currentBuffer()).toBe('html code');

      service.setActiveTab('scss');
      expect(service.currentBuffer()).toBe('scss code');
    });
  });

  describe('Validation', () => {
    it('should validate TypeScript code', () => {
      const validTS = 'const x = 1; function test() { return x; }';
      const invalidTS = 'const x = 1; function test() { return x;'; // Missing closing brace

      const validResult = service.validateBuffer('typescript', validTS);
      expect(validResult.valid).toBe(true);
      expect(validResult.errors.length).toBe(0);

      const invalidResult = service.validateBuffer('typescript', invalidTS);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });

    it('should validate HTML code', () => {
      const validHTML = '<div><p>Hello</p></div>';
      const validResult = service.validateBuffer('html', validHTML);
      expect(validResult.valid).toBe(true);

      // Note: Our basic HTML validation is quite permissive
      const simpleHTML = '<div>Hello</div>';
      const simpleResult = service.validateBuffer('html', simpleHTML);
      expect(simpleResult.valid).toBe(true);
    });

    it('should validate SCSS code', () => {
      const validSCSS = '.test { color: red; &:hover { color: blue; } }';
      const invalidSCSS = '.test { color: red; &:hover { color: blue; }'; // Missing closing brace

      const validResult = service.validateBuffer('scss', validSCSS);
      expect(validResult.valid).toBe(true);

      const invalidResult = service.validateBuffer('scss', invalidSCSS);
      expect(invalidResult.valid).toBe(false);
    });
  });

  describe('Export/Import', () => {
    it('should export buffers', () => {
      const testBuffers: EditorBuffers = {
        typescript: 'ts code',
        html: 'html code',
        scss: 'scss code'
      };

      service.updateBuffers(testBuffers);
      const exported = service.exportBuffers();

      expect(exported).toEqual(testBuffers);
      expect(exported).not.toBe(service.buffers()); // Should be a copy
    });

    it('should import buffers', () => {
      const testBuffers: EditorBuffers = {
        typescript: 'imported ts',
        html: 'imported html',
        scss: 'imported scss'
      };

      service.importBuffers(testBuffers);

      expect(service.buffers()).toEqual(testBuffers);
      expect(service.hasChanges()).toBe(true);
      expect(service.hasCode()).toBe(true);
    });
  });

  describe('Change Tracking', () => {
    it('should track changes correctly', () => {
      expect(service.hasChanges()).toBe(false);

      service.updateBuffer('typescript', 'test');
      expect(service.hasChanges()).toBe(true);

      service.resetChanges();
      expect(service.hasChanges()).toBe(false);
    });

    it('should update lastModified when content changes', () => {
      const initialTime = service.lastModified();

      setTimeout(() => {
        service.updateBuffer('typescript', 'new content');
        expect(service.lastModified()).not.toEqual(initialTime);
      }, 10);
    });
  });

  describe('Computed Properties', () => {
    it('should correctly compute isEmpty', () => {
      expect(service.isEmpty()).toBe(true);

      service.updateBuffer('typescript', 'test');
      expect(service.isEmpty()).toBe(false);

      service.clearBuffers();
      expect(service.isEmpty()).toBe(true);
    });

    it('should correctly compute hasCode', () => {
      expect(service.hasCode()).toBe(false);

      service.updateBuffer('html', '<div>test</div>');
      expect(service.hasCode()).toBe(true);

      service.clearBuffers();
      expect(service.hasCode()).toBe(false);
    });

    it('should return complete editor state', () => {
      service.updateBuffer('typescript', 'test');
      service.setActiveTab('html');

      const state = service.editorState();

      expect(state.buffers.typescript).toBe('test');
      expect(state.activeTab).toBe('html');
      expect(state.hasChanges).toBe(true);
      expect(state.lastModified).toBeDefined();
    });
  });

  describe('Debug Information', () => {
    it('should provide debug information', () => {
      service.updateBuffers({
        typescript: 'debug test',
        html: '<div>debug</div>',
        scss: '.debug {}'
      });
      service.setActiveTab('scss');

      const debugInfo = service.getDebugInfo();

      expect(debugInfo.buffers.typescript).toBe('debug test');
      expect(debugInfo.activeTab).toBe('scss');
      expect(debugInfo.hasChanges).toBe(true);
      expect(debugInfo.hasCode).toBe(true);
      expect(debugInfo.isEmpty).toBe(false);
      expect(debugInfo.lastModified).toBeDefined();
    });
  });
});
