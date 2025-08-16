import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, AfterViewInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

export interface PlaygroundCode {
  html: string;
  typescript: string;
  scss: string;
}

export interface PlaygroundFile {
  name: string;
  language: string;
  content: string;
  icon: string;
}

@Component({
  selector: 'app-monaco-playground',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MonacoEditorModule
  ],
  template: `
    <div class="monaco-playground">
      <div class="playground-header">
        <div class="header-left">
          <mat-icon>code</mat-icon>
          <h3>Code Editor</h3>
        </div>
        <div class="header-actions">
          <button mat-icon-button 
                  (click)="toggleTheme()" 
                  [matTooltip]="isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <mat-icon>{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
          <button mat-icon-button 
                  (click)="formatCode()" 
                  matTooltip="Format Code (Alt+Shift+F)">
            <mat-icon>auto_fix_high</mat-icon>
          </button>
          <button mat-icon-button 
                  (click)="resetCode()" 
                  matTooltip="Reset to Original">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <mat-tab-group class="editor-tabs" 
                    [(selectedIndex)]="selectedTabIndex"
                    (selectedTabChange)="onTabChange($event)">
        <mat-tab *ngFor="let file of files(); let i = index" 
                 [label]="file.name">
          <ng-template matTabLabel>
            <mat-icon class="tab-icon">{{ file.icon }}</mat-icon>
            <span>{{ file.name }}</span>
          </ng-template>
          
          <div class="editor-container">
            <ngx-monaco-editor
              [options]="getEditorOptions(file.language)"
              [(ngModel)]="file.content"
              (onInit)="onEditorInit($event, i)"
              class="monaco-editor">
            </ngx-monaco-editor>
          </div>
        </mat-tab>
      </mat-tab-group>

      <div class="editor-footer" [class.has-error]="hasErrors()">
        <div class="editor-info">
          <mat-icon>info</mat-icon>
          <span>{{ getEditorInfo() }}</span>
        </div>
        @if (hasErrors()) {
          <div class="editor-errors">
            <mat-icon>error</mat-icon>
            <span>{{ errorCount() }} error(s) found</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .monaco-playground {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .playground-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-left mat-icon {
      color: #667eea;
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .header-left h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .editor-tabs {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .editor-tabs ::ng-deep .mat-mdc-tab-group {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .editor-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
      flex: 1;
      display: flex;
    }

    .editor-tabs ::ng-deep .mat-mdc-tab-body {
      flex: 1;
    }

    .editor-tabs ::ng-deep .mat-mdc-tab-body-content {
      height: 100%;
      overflow: hidden;
    }

    .tab-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      margin-right: 0.5rem;
    }

    .editor-container {
      height: 100%;
      min-height: 400px;
    }

    .monaco-editor {
      height: 100%;
      width: 100%;
    }

    .editor-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #e0e0e0;
      font-size: 0.85rem;
      color: #666;
    }

    .editor-footer.has-error {
      background: #fff3e0;
      border-top-color: #ff9800;
    }

    .editor-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .editor-info mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #667eea;
    }

    .editor-errors {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #d32f2f;
    }

    .editor-errors mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    /* Dark mode styles */
    .monaco-playground.dark-mode {
      background: #1e1e1e;
    }

    .monaco-playground.dark-mode .playground-header,
    .monaco-playground.dark-mode .editor-footer {
      background: #2d2d2d;
      border-color: #404040;
      color: #cccccc;
    }

    .monaco-playground.dark-mode .header-left h3 {
      color: #cccccc;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .playground-header {
        padding: 0.75rem 1rem;
      }

      .header-left h3 {
        font-size: 1rem;
      }

      .editor-footer {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
      }
    }
  `]
})
export class MonacoPlaygroundComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() initialCode: PlaygroundCode = {
    html: '',
    typescript: '',
    scss: ''
  };

  @Output() codeChange = new EventEmitter<PlaygroundCode>();
  @Output() themeChange = new EventEmitter<boolean>();

  public readonly isDarkMode = signal(false);
  public readonly files = signal<PlaygroundFile[]>([]);
  public readonly hasErrors = signal(false);
  public readonly errorCount = signal(0);

  public selectedTabIndex = 0;

  private readonly destroy$ = new Subject<void>();
  private readonly codeChangeSubject = new Subject<void>();
  private originalCode: PlaygroundCode = { html: '', typescript: '', scss: '' };

  constructor() {
    // Setup code change debouncing
    this.codeChangeSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.emitCodeChange();
    });

    // React to initial code changes
    effect(() => {
      this.updateFiles();
    });
  }

  ngOnInit(): void {
    this.originalCode = { ...this.initialCode };
    this.updateFiles();
    this.setupMonacoDefaults();
  }

  ngAfterViewInit(): void {
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateFiles(): void {
    const newFiles: PlaygroundFile[] = [
      {
        name: 'component.html',
        language: 'html',
        content: this.initialCode.html,
        icon: 'html'
      },
      {
        name: 'component.ts',
        language: 'typescript',
        content: this.initialCode.typescript,
        icon: 'code'
      },
      {
        name: 'component.scss',
        language: 'scss',
        content: this.initialCode.scss,
        icon: 'palette'
      }
    ];
    this.files.set(newFiles);
  }

  private setupMonacoDefaults(): void {
    // Configure Monaco Editor global settings
    if (typeof window !== 'undefined' && (window as any).monaco) {
      const monaco = (window as any).monaco;
      
      // Configure TypeScript compiler options
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types']
      });

      // Add Angular and React type definitions
      this.addTypeDefinitions(monaco);
    }
  }

  private addTypeDefinitions(monaco: any): void {
    // Add basic Angular type definitions
    const angularTypes = `
      declare module '@angular/core' {
        export interface Component {}
        export interface Input {}
        export interface Output {}
        export interface EventEmitter<T> {}
        export interface OnInit {}
        export interface OnDestroy {}
      }
    `;

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      angularTypes,
      'file:///node_modules/@angular/core/index.d.ts'
    );
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      if (event.altKey && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        this.formatCode();
      }
    });
  }

  public getEditorOptions(language: string) {
    const baseOptions = {
      theme: this.isDarkMode() ? 'vs-dark' : 'vs',
      language: language,
      fontSize: 14,
      fontFamily: 'Fira Code, Monaco, Consolas, monospace',
      fontLigatures: true,
      lineNumbers: 'on' as const,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on' as const,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 3,
      glyphMargin: false,
      folding: true,
      selectOnLineNumbers: true,
      matchBrackets: 'always' as const,
      autoIndent: 'full' as const,
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on' as const,
      snippetSuggestions: 'top' as const,
      parameterHints: { enabled: true },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      }
    };

    // Language-specific options
    if (language === 'html') {
      return {
        ...baseOptions,
        suggest: {
          html5: true
        }
      };
    }

    if (language === 'typescript') {
      return {
        ...baseOptions,
        suggest: {
          snippetsPreventQuickSuggestions: false
        }
      };
    }

    return baseOptions;
  }

  public onEditorInit(editor: any, fileIndex: number): void {
    // Set up content change listener
    editor.onDidChangeModelContent(() => {
      const newContent = editor.getValue();
      this.onCodeChange(fileIndex, newContent);
    });
  }

  public onCodeChange(fileIndex: number, newContent: string): void {
    const currentFiles = this.files();
    if (currentFiles[fileIndex]) {
      currentFiles[fileIndex].content = newContent;
      this.files.set([...currentFiles]);
      this.codeChangeSubject.next();
    }
  }

  public onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }

  public toggleTheme(): void {
    const newTheme = !this.isDarkMode();
    this.isDarkMode.set(newTheme);
    this.themeChange.emit(newTheme);
  }

  public formatCode(): void {
    // Trigger Monaco's format action
    if (typeof window !== 'undefined' && (window as any).monaco) {
      const monaco = (window as any).monaco;
      const editor = monaco.editor.getEditors()[this.selectedTabIndex];
      if (editor) {
        editor.getAction('editor.action.formatDocument').run();
      }
    }
  }

  public resetCode(): void {
    const resetFiles = [
      { ...this.files()[0], content: this.originalCode.html },
      { ...this.files()[1], content: this.originalCode.typescript },
      { ...this.files()[2], content: this.originalCode.scss }
    ];
    this.files.set(resetFiles);
    this.emitCodeChange();
  }

  public getEditorInfo(): string {
    const currentFile = this.files()[this.selectedTabIndex];
    if (!currentFile) return '';
    
    const lines = currentFile.content.split('\n').length;
    const characters = currentFile.content.length;
    return `Lines: ${lines}, Characters: ${characters}`;
  }

  private emitCodeChange(): void {
    const files = this.files();
    const code: PlaygroundCode = {
      html: files[0]?.content || '',
      typescript: files[1]?.content || '',
      scss: files[2]?.content || ''
    };
    this.codeChange.emit(code);
  }
}