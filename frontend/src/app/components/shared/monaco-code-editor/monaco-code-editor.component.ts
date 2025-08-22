import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Monaco Editor types
declare const monaco: any;

export interface MonacoEditorOptions {
  theme?: string;
  language?: string;
  automaticLayout?: boolean;
  wordWrap?: string;
  minimap?: { enabled: boolean };
  fontSize?: number;
  lineNumbers?: string;
  scrollBeyondLastLine?: boolean;
  readOnly?: boolean;
}

@Component({
  selector: 'app-monaco-code-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  template: `
    <div class="monaco-editor-container">
      <!-- Editor Header -->
      <div class="editor-header" *ngIf="showHeader">
        <div class="editor-title">
          <mat-icon>{{ getLanguageIcon() }}</mat-icon>
          <span>{{ title || getLanguageTitle() }}</span>
        </div>
        <div class="editor-actions">
          <button mat-icon-button 
                  (click)="formatCode()" 
                  matTooltip="Format Code"
                  [disabled]="isReadOnly">
            <mat-icon>format_indent_increase</mat-icon>
          </button>
          <button mat-icon-button 
                  (click)="copyCode()" 
                  matTooltip="Copy Code">
            <mat-icon>content_copy</mat-icon>
          </button>
          <button mat-icon-button 
                  (click)="clearCode()" 
                  matTooltip="Clear Code"
                  [disabled]="isReadOnly">
            <mat-icon>clear</mat-icon>
          </button>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div class="editor-loading" *ngIf="isLoading()">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        <span>Loading Monaco Editor...</span>
      </div>

      <!-- Monaco Editor -->
      <div class="monaco-editor-wrapper" 
           [style.height]="height"
           [class.loading]="isLoading()">
        <div #monacoContainer 
             class="monaco-container"
             [style.height]="height">
        </div>
      </div>

      <!-- Status Bar -->
      <div class="editor-status-bar" *ngIf="showStatusBar">
        <div class="status-left">
          <span class="language-indicator">{{ language.toUpperCase() }}</span>
          <span class="encoding">UTF-8</span>
        </div>
        <div class="status-right">
          <span class="cursor-position">Ln {{ currentLine() }}, Col {{ currentColumn() }}</span>
          <span class="selection-info" *ngIf="selectionLength() > 0">
            ({{ selectionLength() }} selected)
          </span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./monaco-code-editor.component.scss']
})
export class MonacoCodeEditorComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('monacoContainer', { static: true }) monacoContainer!: ElementRef;

  @Input() value: string = '';
  @Input() language: string = 'typescript';
  @Input() theme: string = 'vs-dark';
  @Input() height: string = '400px';
  @Input() title?: string;
  @Input() showHeader: boolean = true;
  @Input() showStatusBar: boolean = true;
  @Input() isReadOnly: boolean = false;
  @Input() options: Partial<MonacoEditorOptions> = {};

  @Output() valueChange = new EventEmitter<string>();
  @Output() editorReady = new EventEmitter<any>();
  @Output() cursorPositionChange = new EventEmitter<{ line: number; column: number }>();

  // Component state
  readonly isLoading = signal<boolean>(true);
  readonly currentLine = signal<number>(1);
  readonly currentColumn = signal<number>(1);
  readonly selectionLength = signal<number>(0);

  private editor: any;
  private isMonacoLoaded = false;

  ngOnInit() {
    this.loadMonacoEditor();
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.dispose();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Handle value changes
    if (changes['value'] && !changes['value'].firstChange) {
      const newValue = changes['value'].currentValue;
      if (this.editor && this.editor.getValue() !== newValue) {
        console.log('🔄 Monaco Editor: Updating value from input change:', newValue?.substring(0, 100) + '...');
        this.editor.setValue(newValue || '');
      }
    }

    // Handle language changes
    if (changes['language'] && !changes['language'].firstChange) {
      const newLanguage = changes['language'].currentValue;
      if (this.editor && newLanguage) {
        console.log('🔄 Monaco Editor: Updating language to:', newLanguage);
        this.setLanguage(newLanguage);
      }
    }

    // Handle theme changes
    if (changes['theme'] && !changes['theme'].firstChange) {
      const newTheme = changes['theme'].currentValue;
      if (this.editor && newTheme) {
        console.log('🔄 Monaco Editor: Updating theme to:', newTheme);
        monaco.editor.setTheme(newTheme);
      }
    }
  }

  private async loadMonacoEditor() {
    try {
      // Check if Monaco is already loaded
      if (typeof monaco !== 'undefined') {
        this.isMonacoLoaded = true;
        this.initializeEditor();
        return;
      }

      // Load Monaco dynamically
      await this.loadMonacoScript();
      this.isMonacoLoaded = true;
      this.initializeEditor();
    } catch (error) {
      console.error('Failed to load Monaco Editor:', error);
      this.isLoading.set(false);
    }
  }

  private loadMonacoScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector('script[src*="monaco-editor"]')) {
        resolve();
        return;
      }

      // Try CDN first, then fallback to local assets
      const tryLoadMonaco = (scriptSrc: string, configPaths: string, isLocal: boolean = false) => {
        const script = document.createElement('script');
        script.src = scriptSrc;
        
        script.onload = () => {
          try {
            (window as any).require.config({ 
              paths: { 
                vs: configPaths
              },
              'vs/nls': {
                availableLanguages: {
                  '*': 'en'
                }
              }
            });
            
            // Set Monaco environment
            (window as any).MonacoEnvironment = {
              getWorkerUrl: function (moduleId: string, label: string) {
                const basePath = isLocal ? 'assets/monaco-editor/min/vs' : 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs';
                
                if (label === 'json') {
                  return `${basePath}/language/json/json.worker.js`;
                }
                if (label === 'css' || label === 'scss' || label === 'less') {
                  return `${basePath}/language/css/css.worker.js`;
                }
                if (label === 'html' || label === 'handlebars' || label === 'razor') {
                  return `${basePath}/language/html/html.worker.js`;
                }
                if (label === 'typescript' || label === 'javascript') {
                  return `${basePath}/language/typescript/ts.worker.js`;
                }
                return `${basePath}/editor/editor.worker.js`;
              }
            };
            
            (window as any).require(['vs/editor/editor.main'], () => {
              resolve();
            }, (error: any) => {
              console.error('Failed to load Monaco editor main:', error);
              if (!isLocal) {
                // Try local fallback
                document.head.removeChild(script);
                tryLoadMonaco('assets/monaco-editor/min/vs/loader.js', 'assets/monaco-editor/min/vs', true);
              } else {
                reject(new Error('Failed to load Monaco Editor from both CDN and local assets'));
              }
            });
          } catch (error) {
            console.error('Monaco configuration error:', error);
            if (!isLocal) {
              // Try local fallback
              document.head.removeChild(script);
              tryLoadMonaco('assets/monaco-editor/min/vs/loader.js', 'assets/monaco-editor/min/vs', true);
            } else {
              reject(new Error('Failed to configure Monaco Editor'));
            }
          }
        };
        
        script.onerror = () => {
          console.error('Failed to load Monaco script from:', scriptSrc);
          if (!isLocal) {
            // Try local fallback
            document.head.removeChild(script);
            tryLoadMonaco('assets/monaco-editor/min/vs/loader.js', 'assets/monaco-editor/min/vs', true);
          } else {
            reject(new Error('Failed to load Monaco Editor from both CDN and local assets'));
          }
        };
        
        document.head.appendChild(script);
      };

      // Start with CDN
      tryLoadMonaco(
        'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js',
        'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
      );
    });
  }

  private initializeEditor() {
    if (!this.monacoContainer?.nativeElement || !this.isMonacoLoaded) {
      return;
    }

    const editorOptions: MonacoEditorOptions = {
      language: this.language,
      theme: this.theme,
      automaticLayout: true,
      wordWrap: 'on',
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      readOnly: this.isReadOnly,
      ...this.options
    };

    try {
      this.editor = monaco.editor.create(
        this.monacoContainer.nativeElement,
        {
          value: this.value,
          ...editorOptions
        }
      );

      // Set up event listeners
      this.setupEventListeners();

      // Emit ready event
      this.editorReady.emit(this.editor);
      this.isLoading.set(false);

    } catch (error) {
      console.error('Failed to initialize Monaco Editor:', error);
      this.isLoading.set(false);
    }
  }

  private setupEventListeners() {
    if (!this.editor) return;

    // Content change listener
    this.editor.onDidChangeModelContent(() => {
      const newValue = this.editor.getValue();
      this.valueChange.emit(newValue);
    });

    // Cursor position change listener
    this.editor.onDidChangeCursorPosition((e: any) => {
      this.currentLine.set(e.position.lineNumber);
      this.currentColumn.set(e.position.column);
      this.cursorPositionChange.emit({
        line: e.position.lineNumber,
        column: e.position.column
      });
    });

    // Selection change listener
    this.editor.onDidChangeCursorSelection((e: any) => {
      const selection = this.editor.getSelection();
      const selectedText = this.editor.getModel().getValueInRange(selection);
      this.selectionLength.set(selectedText.length);
    });
  }

  // Public methods
  setValue(value: string) {
    if (this.editor && this.editor.getValue() !== value) {
      this.editor.setValue(value);
    }
  }

  getValue(): string {
    return this.editor ? this.editor.getValue() : '';
  }

  setLanguage(language: string) {
    if (this.editor) {
      monaco.editor.setModelLanguage(this.editor.getModel(), language);
    }
  }

  formatCode() {
    if (this.editor) {
      this.editor.getAction('editor.action.formatDocument').run();
    }
  }

  copyCode() {
    if (this.editor) {
      const value = this.editor.getValue();
      navigator.clipboard.writeText(value).then(() => {
        // Could emit a success event here
      });
    }
  }

  clearCode() {
    if (this.editor && !this.isReadOnly) {
      this.editor.setValue('');
    }
  }

  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  // Utility methods
  getLanguageIcon(): string {
    switch (this.language) {
      case 'typescript': return 'code';
      case 'javascript': return 'javascript';
      case 'html': return 'html';
      case 'css':
      case 'scss': return 'style';
      case 'json': return 'data_object';
      default: return 'code';
    }
  }

  getLanguageTitle(): string {
    switch (this.language) {
      case 'typescript': return 'TypeScript';
      case 'javascript': return 'JavaScript';
      case 'html': return 'HTML';
      case 'css': return 'CSS';
      case 'scss': return 'SCSS';
      case 'json': return 'JSON';
      default: return this.language.toUpperCase();
    }
  }
}
