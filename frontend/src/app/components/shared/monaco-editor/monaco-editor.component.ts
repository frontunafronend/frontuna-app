import { 
  Component, 
  ElementRef, 
  Input, 
  Output, 
  EventEmitter, 
  ViewChild, 
  OnInit, 
  OnDestroy, 
  OnChanges,
  SimpleChanges,
  forwardRef,
  AfterViewInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

declare global {
  interface Window {
    monaco: any;
    require: any;
  }
}

@Component({
  selector: 'app-monaco-editor',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MonacoEditorComponent),
      multi: true
    }
  ],
  template: `
    <div class="monaco-editor-container">
      <div class="editor-header" *ngIf="showHeader">
        <div class="editor-title">
          <mat-icon>code</mat-icon>
          <span>{{ title || 'Code Editor' }}</span>
        </div>
        <div class="editor-actions">
          <button class="btn-copy" (click)="copyCode()" title="Copy Code">
            📋
          </button>
          <button class="btn-format" (click)="formatCode()" title="Format Code">
            ✨
          </button>
          <button class="btn-fullscreen" (click)="toggleFullscreen()" title="Toggle Fullscreen">
            {{ isFullscreen ? '🗗' : '🗖' }}
          </button>
        </div>
      </div>
      <div 
        #editorContainer 
        class="monaco-editor" 
        [class.fullscreen]="isFullscreen"
        [style.height.px]="height">
      </div>
      <div class="editor-footer" *ngIf="showFooter">
        <div class="editor-info">
          <span class="language-info">{{ language.toUpperCase() }}</span>
          <span class="lines-info">Lines: {{ lineCount }}</span>
          <span class="chars-info">Characters: {{ charCount }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .monaco-editor-container {
      display: flex;
      flex-direction: column;
      border: 1px solid #e1e5e9;
      border-radius: 8px;
      overflow: hidden;
      background: #ffffff;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e1e5e9;
      min-height: 40px;
    }

    .editor-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #495057;
      font-size: 14px;
    }

    .editor-actions {
      display: flex;
      gap: 4px;
    }

    .editor-actions button {
      background: none;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    }

    .editor-actions button:hover {
      background: #e9ecef;
      border-color: #adb5bd;
    }

    .monaco-editor {
      flex: 1;
      min-height: 200px;
      position: relative;
    }

    .monaco-editor.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      background: white;
    }

    .editor-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 16px;
      background: #f8f9fa;
      border-top: 1px solid #e1e5e9;
      font-size: 11px;
      color: #6c757d;
    }

    .editor-info {
      display: flex;
      gap: 16px;
    }

    .language-info {
      font-weight: 500;
      color: #495057;
    }

    .lines-info,
    .chars-info {
      color: #6c757d;
    }

    /* Dark theme support */
    :host-context(.dark-theme) .monaco-editor-container {
      background: #1e1e1e;
      border-color: #444;
    }

    :host-context(.dark-theme) .editor-header,
    :host-context(.dark-theme) .editor-footer {
      background: #252526;
      border-color: #444;
      color: #cccccc;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .editor-header {
        padding: 6px 12px;
      }
      
      .editor-title span {
        display: none;
      }
      
      .editor-actions button {
        padding: 2px 6px;
      }
      
      .editor-info {
        gap: 8px;
      }
    }
  `]
})
export class MonacoEditorComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges, ControlValueAccessor {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;

  @Input() language: string = 'typescript';
  @Input() theme: string = 'vs';
  @Input() height: number | 'auto' = 'auto';
  @Input() minHeight: number = 300;
  @Input() maxHeight: number = 1000;
  @Input() readonly: boolean = false;
  @Input() showHeader: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() title: string = '';
  @Input() automaticLayout: boolean = true;
  @Input() minimap: boolean = true;
  @Input() 
  get value(): string {
    return this._value;
  }
  set value(val: string) {
    this._value = val;
    this.updateStats();
    this.onChange(val);
    this.onTouched();
    this.valueChange.emit(val);
    if (this.editor) {
      this.editor.setValue(val);
    }
  }

  @Output() valueChange = new EventEmitter<string>();
  @Output() editorReady = new EventEmitter<any>();

  private editor: any;
  private monacoLoaded = false;
  public isFullscreen = false;
  public lineCount = 0;
  public charCount = 0;

  private _value: string = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};



  ngOnInit(): void {
    this.loadMonaco();
  }

  ngAfterViewInit(): void {
    // Monaco will be initialized once loaded
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.dispose();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle value changes
    if (changes['value'] && !changes['value'].firstChange) {
      const newValue = changes['value'].currentValue;
      if (this.editor && this.editor.getValue() !== newValue) {
        console.log('🔄 Monaco Editor (v2): Updating value from input change:', newValue?.substring(0, 100) + '...');
        this.editor.setValue(newValue || '');
      }
    }

    // Handle language changes
    if (changes['language'] && !changes['language'].firstChange) {
      const newLanguage = changes['language'].currentValue;
      if (this.editor && newLanguage) {
        console.log('🔄 Monaco Editor (v2): Updating language to:', newLanguage);
        (window as any).monaco.editor.setModelLanguage(this.editor.getModel(), newLanguage);
      }
    }

    // Handle theme changes
    if (changes['theme'] && !changes['theme'].firstChange) {
      const newTheme = changes['theme'].currentValue;
      if (this.editor && newTheme) {
        console.log('🔄 Monaco Editor (v2): Updating theme to:', newTheme);
        (window as any).monaco.editor.setTheme(newTheme);
      }
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this._value = value || '';
    if (this.editor) {
      // Monaco editor
      this.editor.setValue(this._value);
    } else if ((this as any).fallbackTextarea) {
      // Fallback textarea
      (this as any).fallbackTextarea.value = this._value;
    }
    this.updateStats();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.editor) {
      this.editor.updateOptions({ readOnly: isDisabled });
    }
  }

  private async loadMonaco(): Promise<void> {
    if (this.monacoLoaded && window.monaco) {
      this.initEditor();
      return;
    }

    try {
      // Load Monaco Editor dynamically with improved error handling
      if (!window.monaco) {
        // Check if loader already exists
        if (!(window as any).require) {
          // Create script tag to load Monaco
          const monacoScript = document.createElement('script');
          monacoScript.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js';
          document.head.appendChild(monacoScript);

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Monaco loader timeout'));
            }, 10000); // 10 second timeout

            monacoScript.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            monacoScript.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('Failed to load Monaco loader'));
            };
          });
        }

        // Configure and load Monaco
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Monaco initialization timeout'));
          }, 10000);

          // Set Monaco environment first
          (window as any).MonacoEnvironment = {
            getWorkerUrl: function (moduleId: string, label: string) {
              if (label === 'json') {
                return 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/language/json/json.worker.js';
              }
              if (label === 'css' || label === 'scss' || label === 'less') {
                return 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/language/css/css.worker.js';
              }
              if (label === 'html' || label === 'handlebars' || label === 'razor') {
                return 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/language/html/html.worker.js';
              }
              if (label === 'typescript' || label === 'javascript') {
                return 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/language/typescript/ts.worker.js';
              }
              return 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/editor/editor.worker.js';
            }
          };

          (window as any).require.config({
            paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' },
            'vs/nls': {
              availableLanguages: {
                '*': 'en'
              }
            }
          });

          (window as any).require(['vs/editor/editor.main'], () => {
            clearTimeout(timeout);
            this.monacoLoaded = true;
            resolve();
          }, (error: any) => {
            clearTimeout(timeout);
            reject(error);
          });
        });
      }

      // Additional wait to ensure Monaco is fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (window.monaco) {
        this.initEditor();
      } else {
        throw new Error('Monaco not available after loading');
      }
    } catch (error) {
      console.error('Failed to load Monaco Editor:', error);
      this.fallbackToTextarea();
    }
  }

  private initEditor(): void {
    if (!window.monaco || !this.editorContainer) {
      return;
    }

    try {
      // Set container height based on height input
      if (this.height === 'auto') {
        this.editorContainer.nativeElement.style.height = 'auto';
        this.editorContainer.nativeElement.style.minHeight = `${this.minHeight}px`;
        this.editorContainer.nativeElement.style.maxHeight = `${this.maxHeight}px`;
      } else {
        this.editorContainer.nativeElement.style.height = `${this.height}px`;
      }

      this.editor = window.monaco.editor.create(this.editorContainer.nativeElement, {
        value: this._value,
        language: this.language,
        theme: this.theme,
        readOnly: this.readonly,
        automaticLayout: this.automaticLayout,
        minimap: { enabled: this.minimap },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        cursorStyle: 'line',
        wordWrap: 'on',
        contextmenu: true,
        selectOnLineNumbers: true,
        glyphMargin: true,
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'always',
        unfoldOnClickAfterEndOfLine: false,
        bracketPairColorization: { enabled: true }
      });

      // Listen for content changes with debouncing
      let changeTimeout: any;
      this.editor.onDidChangeModelContent(() => {
        const value = this.editor.getValue();
        this._value = value;
        
        // Clear previous timeout
        if (changeTimeout) {
          clearTimeout(changeTimeout);
        }
        
        // Debounce changes to avoid excessive updates
        changeTimeout = setTimeout(() => {
          this.onChange(value);
          this.valueChange.emit(value);
          this.updateStats();
        }, 300);
      });

      // Listen for focus events
      this.editor.onDidFocusEditorText(() => {
        this.onTouched();
      });

      // Listen for blur events
      this.editor.onDidBlurEditorText(() => {
        // Ensure final value is emitted on blur
        const value = this.editor.getValue();
        if (this._value !== value) {
          this._value = value;
          this.onChange(value);
          this.valueChange.emit(value);
        }
      });

      this.editorReady.emit(this.editor);
      this.updateStats();
    } catch (error) {
      console.error('Failed to initialize Monaco Editor:', error);
      this.fallbackToTextarea();
    }
  }

  private fallbackToTextarea(): void {
    // Create a fallback textarea if Monaco fails to load
    const textarea = document.createElement('textarea');
    textarea.value = this._value;
    textarea.readOnly = this.readonly;
    textarea.placeholder = 'Code editor (Monaco Editor failed to load)';
    
    // Style the textarea to match Monaco
    Object.assign(textarea.style, {
      width: '100%',
      height: this.height + 'px',
      border: 'none',
      outline: 'none',
      resize: 'vertical',
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      fontSize: '14px',
      lineHeight: '1.5',
      padding: '16px',
      backgroundColor: '#ffffff',
      color: '#333333',
      tabSize: '2'
    });

    // Handle input changes with debouncing
    let inputTimeout: any;
    textarea.addEventListener('input', (e) => {
      const value = (e.target as HTMLTextAreaElement).value;
      this._value = value;
      
      // Clear previous timeout
      if (inputTimeout) {
        clearTimeout(inputTimeout);
      }
      
      // Debounce changes
      inputTimeout = setTimeout(() => {
        this.onChange(value);
        this.valueChange.emit(value);
        this.updateStats();
      }, 300);
    });
    
    // Handle focus/blur
    textarea.addEventListener('focus', () => {
      this.onTouched();
    });
    
    textarea.addEventListener('blur', () => {
      // Ensure final value is emitted
      const value = textarea.value;
      if (this._value !== value) {
        this._value = value;
        this.onChange(value);
        this.valueChange.emit(value);
      }
    });

    // Clear container and add textarea
    this.editorContainer.nativeElement.innerHTML = '';
    this.editorContainer.nativeElement.appendChild(textarea);
    
    // Store reference for later updates
    (this as any).fallbackTextarea = textarea;
  }

  private updateStats(): void {
    this.charCount = this._value.length;
    this.lineCount = this._value.split('\n').length;
  }

  public copyCode(): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this._value).then(() => {
        console.log('✅ Code copied to clipboard!');
      });
    }
  }

  public formatCode(): void {
    if (this.editor && window.monaco) {
      this.editor.getAction('editor.action.formatDocument').run();
    }
  }

  public toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    if (this.editor) {
      setTimeout(() => {
        this.editor.layout();
      }, 100);
    }
  }

  public setValue(value: string): void {
    this.writeValue(value);
  }

  public getValue(): string {
    return this._value;
  }

  public focus(): void {
    if (this.editor) {
      this.editor.focus();
    }
  }

  public setLanguage(language: string): void {
    this.language = language;
    if (this.editor && window.monaco) {
      window.monaco.editor.setModelLanguage(this.editor.getModel(), language);
    }
  }

  public setTheme(theme: string): void {
    this.theme = theme;
    if (window.monaco) {
      window.monaco.editor.setTheme(theme);
    }
  }
}