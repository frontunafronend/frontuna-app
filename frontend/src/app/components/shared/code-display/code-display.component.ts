import { Component, OnInit, OnDestroy, input, output, signal, computed, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CodeHighlightingService } from '@app/services/code-highlighting/code-highlighting.service';
import { NotificationService } from '@app/services/notification/notification.service';

@Component({
  selector: 'app-code-display',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="code-display-container">
      <!-- Header -->
      <div class="code-header">
        <div class="code-info">
          @if (showLanguageSelector()) {
            <mat-form-field appearance="outline" class="language-selector">
              <mat-label>Language</mat-label>
              <mat-select [value]="selectedLanguage()" (selectionChange)="onLanguageChange($event.value)">
                @for (lang of supportedLanguages(); track lang) {
                  <mat-option [value]="lang">{{ formatLanguageName(lang) }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          } @else if (detectedLanguage()) {
            <span class="language-badge">{{ formatLanguageName(detectedLanguage()!) }}</span>
          }
          
          @if (showLineNumbers()) {
            <span class="line-count">{{ lineCount() }} lines</span>
          }
        </div>

        <div class="code-actions">
          @if (showFormatButton() && canFormat()) {
            <button mat-icon-button 
                    (click)="formatCode()" 
                    matTooltip="Format Code"
                    [disabled]="isFormatting()">
              <mat-icon>auto_fix_high</mat-icon>
            </button>
          }
          
          <button mat-icon-button 
                  (click)="copyCode()" 
                  matTooltip="Copy Code"
                  [disabled]="!code()">
            <mat-icon>content_copy</mat-icon>
          </button>
          
          @if (showDownloadButton()) {
            <button mat-icon-button 
                    (click)="downloadCode()" 
                    matTooltip="Download Code"
                    [disabled]="!code()">
              <mat-icon>download</mat-icon>
            </button>
          }
        </div>
      </div>

      <!-- Code Content -->
      <div class="code-content" [class.with-line-numbers]="showLineNumbers()">
        @if (showLineNumbers()) {
          <div class="line-numbers">
            @for (lineNum of lineNumbers(); track lineNum) {
              <span class="line-number">{{ lineNum }}</span>
            }
          </div>
        }
        
        <div class="code-wrapper">
          <pre #codeElement class="code-block" [class]="themeClass()"><code [innerHTML]="highlightedCode()"></code></pre>
        </div>
      </div>

      <!-- Footer -->
      @if (showFooter()) {
        <div class="code-footer">
          <div class="code-stats">
            <span>{{ characterCount() }} characters</span>
            <span>{{ wordCount() }} words</span>
            @if (detectedLanguage()) {
              <span>{{ formatLanguageName(detectedLanguage()!) }}</span>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .code-display-container {
      display: flex;
      flex-direction: column;
      background: #1e1e1e;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    }

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #2d2d30;
      border-bottom: 1px solid #3e3e42;
      min-height: 48px;
    }

    .code-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .language-selector {
      min-width: 120px;
    }

    .language-selector ::ng-deep .mat-mdc-form-field-flex {
      background: rgba(255, 255, 255, 0.05);
    }

    .language-badge {
      background: #007acc;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .line-count {
      color: #cccccc;
      font-size: 12px;
    }

    .code-actions {
      display: flex;
      gap: 4px;
    }

    .code-actions button {
      color: #cccccc;
    }

    .code-actions button:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }

    .code-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .code-content.with-line-numbers {
      background: #1e1e1e;
    }

    .line-numbers {
      background: #2d2d30;
      padding: 16px 8px;
      border-right: 1px solid #3e3e42;
      color: #858585;
      font-size: 12px;
      line-height: 1.5;
      text-align: right;
      user-select: none;
      min-width: 40px;
    }

    .line-number {
      display: block;
      padding: 0 4px;
    }

    .code-wrapper {
      flex: 1;
      overflow: auto;
    }

    .code-block {
      margin: 0;
      padding: 16px;
      background: transparent;
      color: #d4d4d4;
      font-size: 13px;
      line-height: 1.5;
      overflow-x: auto;
      white-space: pre;
      word-wrap: normal;
    }

    .code-block code {
      background: transparent;
      padding: 0;
      border: none;
      border-radius: 0;
    }

    .code-footer {
      padding: 8px 16px;
      background: #2d2d30;
      border-top: 1px solid #3e3e42;
    }

    .code-stats {
      display: flex;
      gap: 16px;
      font-size: 11px;
      color: #858585;
    }

    /* Theme variations */
    .code-block.theme-light {
      background: #ffffff;
      color: #333333;
    }

    .code-block.theme-dark {
      background: #1e1e1e;
      color: #d4d4d4;
    }

    .code-block.theme-vs-code {
      background: #1e1e1e;
      color: #d4d4d4;
    }

    /* Syntax highlighting styles */
    .code-block ::ng-deep {
      .hljs-keyword { color: #569cd6; }
      .hljs-string { color: #ce9178; }
      .hljs-number { color: #b5cea8; }
      .hljs-comment { color: #6a9955; font-style: italic; }
      .hljs-function { color: #dcdcaa; }
      .hljs-class { color: #4ec9b0; }
      .hljs-variable { color: #9cdcfe; }
      .hljs-type { color: #4fc1ff; }
      .hljs-property { color: #92c5f7; }
      .hljs-tag { color: #569cd6; }
      .hljs-attribute { color: #92c5f7; }
      .hljs-value { color: #ce9178; }
      .hljs-selector-tag { color: #d7ba7d; }
      .hljs-selector-class { color: #d7ba7d; }
      .hljs-selector-id { color: #d7ba7d; }
      .hljs-built_in { color: #4ec9b0; }
      .hljs-operator { color: #d4d4d4; }
      .hljs-punctuation { color: #d4d4d4; }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .code-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .code-info {
        justify-content: center;
      }

      .code-actions {
        justify-content: center;
      }

      .code-stats {
        justify-content: center;
        flex-wrap: wrap;
      }

      .line-numbers {
        min-width: 30px;
        font-size: 11px;
      }

      .code-block {
        font-size: 12px;
        padding: 12px;
      }
    }

    /* Scrollbar styling */
    .code-wrapper::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .code-wrapper::-webkit-scrollbar-track {
      background: #2d2d30;
    }

    .code-wrapper::-webkit-scrollbar-thumb {
      background: #464647;
      border-radius: 4px;
    }

    .code-wrapper::-webkit-scrollbar-thumb:hover {
      background: #5a5a5c;
    }
  `]
})
export class CodeDisplayComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly codeHighlightingService = inject(CodeHighlightingService);
  private readonly notificationService = inject(NotificationService);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild('codeElement') codeElement!: ElementRef<HTMLPreElement>;

  // Input properties
  code = input.required<string>();
  language = input<string>('');
  theme = input<'light' | 'dark' | 'vs-code'>('vs-code');
  showLineNumbers = input<boolean>(true);
  showLanguageSelector = input<boolean>(false);
  showFormatButton = input<boolean>(true);
  showDownloadButton = input<boolean>(false);
  showFooter = input<boolean>(false);
  filename = input<string>('code');
  readonly = input<boolean>(true);

  // Output events
  codeChange = output<string>();
  languageChange = output<string>();
  formatted = output<string>();

  // State
  readonly isFormatting = signal<boolean>(false);
  readonly selectedLanguage = signal<string>('');
  readonly detectedLanguage = signal<string | null>(null);
  readonly highlightedCode = signal<string>('');

  // Computed properties
  readonly supportedLanguages = computed(() => 
    this.codeHighlightingService.getSupportedLanguages().sort()
  );

  readonly lineCount = computed(() => 
    this.code().split('\n').length
  );

  readonly lineNumbers = computed(() => 
    Array.from({ length: this.lineCount() }, (_, i) => i + 1)
  );

  readonly characterCount = computed(() => 
    this.code().length
  );

  readonly wordCount = computed(() => 
    this.code().split(/\s+/).filter(word => word.length > 0).length
  );

  readonly themeClass = computed(() => 
    `theme-${this.theme()}`
  );

  readonly canFormat = computed(() => 
    ['typescript', 'javascript', 'html', 'css', 'scss'].includes(this.selectedLanguage())
  );

  ngOnInit(): void {
    this.initializeLanguage();
    this.highlightCode();
  }

  ngAfterViewInit(): void {
    // Additional setup after view initialization
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeLanguage(): void {
    const inputLanguage = this.language();
    
    if (inputLanguage && this.codeHighlightingService.isLanguageSupported(inputLanguage)) {
      this.selectedLanguage.set(inputLanguage);
    } else {
      // Auto-detect language
      const detected = this.codeHighlightingService.detectLanguage(this.code());
      if (detected) {
        this.detectedLanguage.set(detected);
        this.selectedLanguage.set(detected);
      } else {
        this.selectedLanguage.set('typescript'); // Default fallback
      }
    }
  }

  private highlightCode(): void {
    const code = this.code();
    const lang = this.selectedLanguage();

    if (!code) {
      this.highlightedCode.set('');
      return;
    }

    try {
      let result;
      if (lang && this.codeHighlightingService.isLanguageSupported(lang)) {
        result = this.codeHighlightingService.highlight(code, lang);
      } else {
        result = this.codeHighlightingService.highlightAuto(code);
        if (result.language) {
          this.detectedLanguage.set(result.language);
        }
      }

      this.highlightedCode.set(result.value);
    } catch (error) {
      console.warn('Code highlighting failed:', error);
      this.highlightedCode.set(this.escapeHtml(code));
    }
  }

  onLanguageChange(newLanguage: string): void {
    this.selectedLanguage.set(newLanguage);
    this.detectedLanguage.set(null);
    this.highlightCode();
    this.languageChange.emit(newLanguage);
  }

  async copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.snackBar.open('Code copied to clipboard!', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } catch (error) {
      console.error('Failed to copy code:', error);
      this.notificationService.showError('Failed to copy code to clipboard');
    }
  }

  formatCode(): void {
    if (!this.canFormat()) return;

    this.isFormatting.set(true);

    try {
      const formatted = this.codeHighlightingService.formatCode(
        this.code(), 
        this.selectedLanguage()
      );
      
      this.codeChange.emit(formatted);
      this.formatted.emit(formatted);
      this.highlightCode();
      
      this.notificationService.showSuccess('Code formatted successfully');
    } catch (error) {
      console.error('Code formatting failed:', error);
      this.notificationService.showError('Failed to format code');
    } finally {
      this.isFormatting.set(false);
    }
  }

  downloadCode(): void {
    const code = this.code();
    const filename = this.filename();
    const language = this.selectedLanguage();
    
    // Determine file extension based on language
    const extensions: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      html: 'html',
      xml: 'xml',
      css: 'css',
      scss: 'scss',
      json: 'json',
      bash: 'sh',
      shell: 'sh'
    };

    const extension = extensions[language] || 'txt';
    const fullFilename = filename.includes('.') ? filename : `${filename}.${extension}`;

    // Create and download file
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fullFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.notificationService.showSuccess(`Code downloaded as ${fullFilename}`);
  }

  formatLanguageName(language: string): string {
    const languageNames: Record<string, string> = {
      typescript: 'TypeScript',
      javascript: 'JavaScript',
      html: 'HTML',
      xml: 'XML',
      css: 'CSS',
      scss: 'SCSS',
      json: 'JSON',
      bash: 'Bash',
      shell: 'Shell'
    };

    return languageNames[language] || language.charAt(0).toUpperCase() + language.slice(1);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}