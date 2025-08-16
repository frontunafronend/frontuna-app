import { TestBed } from '@angular/core/testing';
import { CodeFenceParserService } from './code-fence-parser.service';
import { EditorBuffers } from './editor-state.service';

describe('CodeFenceParserService', () => {
  let service: CodeFenceParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeFenceParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseCodeFences', () => {
    it('should parse TypeScript code fences', () => {
      const text = `
Here's some TypeScript code:

\`\`\`typescript
const greeting = 'Hello, World!';
console.log(greeting);
\`\`\`

That's it!
      `;

      const result = service.parseCodeFences(text);
      expect(result.typescript).toBe("const greeting = 'Hello, World!';\nconsole.log(greeting);");
      expect(result.html).toBe('');
      expect(result.scss).toBe('');
    });

    it('should parse HTML code fences', () => {
      const text = `
Here's some HTML:

\`\`\`html
<div class="container">
  <h1>Hello World</h1>
</div>
\`\`\`
      `;

      const result = service.parseCodeFences(text);
      expect(result.html).toBe('<div class="container">\n  <h1>Hello World</h1>\n</div>');
      expect(result.typescript).toBe('');
      expect(result.scss).toBe('');
    });

    it('should parse SCSS code fences', () => {
      const text = `
Here's some SCSS:

\`\`\`scss
.container {
  display: flex;
  &:hover {
    background: blue;
  }
}
\`\`\`
      `;

      const result = service.parseCodeFences(text);
      expect(result.scss).toBe('.container {\n  display: flex;\n  &:hover {\n    background: blue;\n  }\n}');
      expect(result.typescript).toBe('');
      expect(result.html).toBe('');
    });

    it('should parse multiple code fences', () => {
      const text = `
Here's a complete component:

\`\`\`typescript
@Component({
  selector: 'app-test',
  template: './test.html'
})
export class TestComponent {}
\`\`\`

\`\`\`html
<div class="test">
  <p>Test component</p>
</div>
\`\`\`

\`\`\`scss
.test {
  color: red;
}
\`\`\`
      `;

      const result = service.parseCodeFences(text);
      expect(result.typescript).toContain('@Component');
      expect(result.html).toContain('<div class="test">');
      expect(result.scss).toContain('.test {');
    });

    it('should handle language aliases', () => {
      const text = `
\`\`\`ts
const x = 1;
\`\`\`

\`\`\`js
var y = 2;
\`\`\`

\`\`\`css
.test { color: blue; }
\`\`\`
      `;

      const result = service.parseCodeFences(text);
      expect(result.typescript).toBe('var y = 2;'); // Last JS/TS code wins
      expect(result.scss).toBe('.test { color: blue; }');
    });

    it('should return empty buffers for text without code fences', () => {
      const text = 'This is just regular text without any code fences.';
      const result = service.parseCodeFences(text);
      
      expect(result.typescript).toBe('');
      expect(result.html).toBe('');
      expect(result.scss).toBe('');
    });

    it('should handle empty code fences', () => {
      const text = `
\`\`\`typescript
\`\`\`

\`\`\`html
\`\`\`
      `;

      const result = service.parseCodeFences(text);
      expect(result.typescript).toBe('');
      expect(result.html).toBe('');
    });

    it('should handle malformed code fences gracefully', () => {
      const text = `
\`\`\`typescript
const x = 1;
// Missing closing fence

\`\`\`html
<div>Valid HTML</div>
\`\`\`
      `;

      const result = service.parseCodeFences(text);
      expect(result.html).toBe('<div>Valid HTML</div>');
      expect(result.typescript).toBe(''); // Malformed fence should be ignored
    });
  });

  describe('toEditorBuffers', () => {
    it('should convert parsed code fences to editor buffers', () => {
      const parsed = {
        hasCode: true,
        originalText: 'test text',
        typescript: 'const x = 1;',
        html: '<div>test</div>',
        scss: '.test { color: red; }'
      };

      const buffers = service.toEditorBuffers(parsed);
      
      expect(buffers.typescript).toBe('const x = 1;');
      expect(buffers.html).toBe('<div>test</div>');
      expect(buffers.scss).toBe('.test { color: red; }');
    });

    it('should handle partial buffers', () => {
      const parsed = {
        hasCode: true,
        originalText: 'test text',
        typescript: 'const x = 1;'
      };

      const buffers = service.toEditorBuffers(parsed);
      
      expect(buffers.typescript).toBe('const x = 1;');
      expect(buffers.html).toBeUndefined();
      expect(buffers.scss).toBeUndefined();
    });

    it('should return empty object when no code', () => {
      const parsed = {
        hasCode: false,
        originalText: 'no code here'
      };

      const buffers = service.toEditorBuffers(parsed);
      expect(Object.keys(buffers).length).toBe(0);
    });
  });

  describe('generateDiffData', () => {
    it('should generate diff data for changes', () => {
      const before: EditorBuffers = {
        typescript: 'const x = 1;',
        html: '<div>old</div>',
        scss: '.old { color: red; }'
      };

      const after: Partial<EditorBuffers> = {
        typescript: 'const x = 2;',
        html: '<div>new</div>',
        scss: '.new { color: blue; }'
      };

      const diffData = service.generateDiffData(before, after);

      expect(diffData.hasAnyChanges).toBe(true);
      expect(diffData.changedTypes).toEqual(['typescript', 'html', 'scss']);
      expect(diffData.changes.length).toBe(3);

      const tsChange = diffData.changes.find(c => c.type === 'typescript');
      expect(tsChange?.before).toBe('const x = 1;');
      expect(tsChange?.after).toBe('const x = 2;');
      expect(tsChange?.hasChanges).toBe(true);
    });

    it('should detect no changes when content is identical', () => {
      const before: EditorBuffers = {
        typescript: 'const x = 1;',
        html: '<div>test</div>',
        scss: '.test { color: red; }'
      };

      const after: Partial<EditorBuffers> = {
        typescript: 'const x = 1;',
        html: '<div>test</div>',
        scss: '.test { color: red; }'
      };

      const diffData = service.generateDiffData(before, after);

      expect(diffData.hasAnyChanges).toBe(false);
      expect(diffData.changedTypes).toEqual([]);
      expect(diffData.changes.every(c => !c.hasChanges)).toBe(true);
    });

    it('should handle partial changes', () => {
      const before: EditorBuffers = {
        typescript: 'const x = 1;',
        html: '<div>test</div>',
        scss: '.test { color: red; }'
      };

      const after: Partial<EditorBuffers> = {
        typescript: 'const x = 2;' // Only TypeScript changed
      };

      const diffData = service.generateDiffData(before, after);

      expect(diffData.hasAnyChanges).toBe(true);
      expect(diffData.changedTypes).toEqual(['typescript']);
      
      const tsChange = diffData.changes.find(c => c.type === 'typescript');
      const htmlChange = diffData.changes.find(c => c.type === 'html');
      
      expect(tsChange?.hasChanges).toBe(true);
      expect(htmlChange?.hasChanges).toBe(false);
    });

    it('should handle new content being added', () => {
      const before: EditorBuffers = {
        typescript: '',
        html: '',
        scss: ''
      };

      const after: Partial<EditorBuffers> = {
        typescript: 'const x = 1;',
        html: '<div>new</div>'
      };

      const diffData = service.generateDiffData(before, after);

      expect(diffData.hasAnyChanges).toBe(true);
      expect(diffData.changedTypes).toEqual(['typescript', 'html']);
      
      const tsChange = diffData.changes.find(c => c.type === 'typescript');
      expect(tsChange?.before).toBe('');
      expect(tsChange?.after).toBe('const x = 1;');
      expect(tsChange?.hasChanges).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: parse -> convert -> diff', () => {
      const aiResponse = `
Here's your updated component:

\`\`\`typescript
@Component({
  selector: 'app-updated',
  template: './updated.html'
})
export class UpdatedComponent {
  title = 'Updated Title';
}
\`\`\`

\`\`\`html
<div class="updated">
  <h1>{{ title }}</h1>
</div>
\`\`\`

\`\`\`scss
.updated {
  background: blue;
  color: white;
}
\`\`\`
      `;

      // Parse the response
      const parsed = service.parseCodeFences(aiResponse);
      expect(parsed.typescript).toContain('UpdatedComponent');
      expect(parsed.html).toContain('<h1>{{ title }}</h1>');
      expect(parsed.scss).toContain('background: blue');

      // Convert to editor buffers
      const newBuffers = service.toEditorBuffers({
        ...parsed,
        hasCode: true,
        originalText: aiResponse
      });

      expect(newBuffers.typescript).toBeDefined();
      expect(newBuffers.html).toBeDefined();
      expect(newBuffers.scss).toBeDefined();

      // Generate diff against existing content
      const currentBuffers: EditorBuffers = {
        typescript: 'export class OldComponent {}',
        html: '<div>old content</div>',
        scss: '.old { color: red; }'
      };

      const diffData = service.generateDiffData(currentBuffers, newBuffers);
      
      expect(diffData.hasAnyChanges).toBe(true);
      expect(diffData.changedTypes).toEqual(['typescript', 'html', 'scss']);
      expect(diffData.changes.length).toBe(3);
    });

    it('should handle edge cases gracefully', () => {
      // Empty response
      expect(() => service.parseCodeFences('')).not.toThrow();
      
      // Null/undefined handling
      expect(() => service.toEditorBuffers(null as any)).not.toThrow();
      
      // Malformed input
      const malformed = 'Random text ```typescript incomplete fence';
      expect(() => service.parseCodeFences(malformed)).not.toThrow();
    });
  });
});
