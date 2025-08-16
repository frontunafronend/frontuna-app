import { Injectable } from '@angular/core';
import hljs from 'highlight.js/lib/core';

// Import specific languages
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';

@Injectable({
  providedIn: 'root'
})
export class CodeHighlightingService {
  private initialized = false;

  constructor() {
    this.initializeHighlightJS();
  }

  private initializeHighlightJS(): void {
    if (this.initialized) return;

    // Register languages
    hljs.registerLanguage('typescript', typescript);
    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('html', html);
    hljs.registerLanguage('xml', html);
    hljs.registerLanguage('css', css);
    hljs.registerLanguage('scss', scss);
    hljs.registerLanguage('json', json);
    hljs.registerLanguage('bash', bash);
    hljs.registerLanguage('shell', bash);

    this.initialized = true;
  }

  /**
   * Highlight code with automatic language detection
   */
  highlightAuto(code: string): { language?: string; value: string } {
    try {
      return hljs.highlightAuto(code);
    } catch (error) {
      console.warn('Code highlighting failed:', error);
      return { value: this.escapeHtml(code) };
    }
  }

  /**
   * Highlight code with specified language
   */
  highlight(code: string, language: string): { language: string; value: string } {
    try {
      const result = hljs.highlight(code, { language });
      return {
        language: result.language || language,
        value: result.value
      };
    } catch (error) {
      console.warn(`Code highlighting failed for language ${language}:`, error);
      return {
        language,
        value: this.escapeHtml(code)
      };
    }
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(language: string): boolean {
    return hljs.getLanguage(language) !== undefined;
  }

  /**
   * Get list of supported languages
   */
  getSupportedLanguages(): string[] {
    return hljs.listLanguages();
  }

  /**
   * Detect language from code content
   */
  detectLanguage(code: string): string | null {
    const result = this.highlightAuto(code);
    return result.language || null;
  }

  /**
   * Format code with proper indentation
   */
  formatCode(code: string, language: string = 'typescript'): string {
    // Basic code formatting
    let formatted = code;

    // Remove extra whitespace
    formatted = formatted.trim();

    // Fix indentation for TypeScript/JavaScript
    if (language === 'typescript' || language === 'javascript') {
      formatted = this.formatTypeScript(formatted);
    }

    // Fix indentation for HTML
    if (language === 'html' || language === 'xml') {
      formatted = this.formatHtml(formatted);
    }

    // Fix indentation for CSS/SCSS
    if (language === 'css' || language === 'scss') {
      formatted = this.formatCss(formatted);
    }

    return formatted;
  }

  /**
   * Extract code blocks from text
   */
  extractCodeBlocks(text: string): Array<{ language?: string; code: string; raw: string }> {
    const codeBlocks: Array<{ language?: string; code: string; raw: string }> = [];
    
    // Match fenced code blocks with optional language
    const fencedRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let match;

    while ((match = fencedRegex.exec(text)) !== null) {
      codeBlocks.push({
        language: match[1] || undefined,
        code: match[2].trim(),
        raw: match[0]
      });
    }

    // Match inline code blocks
    const inlineRegex = /`([^`]+)`/g;
    while ((match = inlineRegex.exec(text)) !== null) {
      if (match[1].length > 10) { // Only consider longer inline code as code blocks
        codeBlocks.push({
          code: match[1],
          raw: match[0]
        });
      }
    }

    return codeBlocks;
  }

  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Basic TypeScript formatting
   */
  private formatTypeScript(code: string): string {
    let formatted = code;
    let indentLevel = 0;
    const indentSize = 2;
    const lines = formatted.split('\n');
    const formattedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Decrease indent for closing braces
      if (line.startsWith('}') || line.startsWith(']') || line.startsWith(')')
          || line.includes('} else') || line.includes('} catch') || line.includes('} finally')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Add indentation
      const indent = ' '.repeat(indentLevel * indentSize);
      formattedLines.push(indent + line);

      // Increase indent for opening braces
      if (line.endsWith('{') || line.endsWith('[') || line.endsWith('(')
          || line.includes('if (') || line.includes('for (') || line.includes('while (')
          || line.includes('try {') || line.includes('} else {') || line.includes('} catch')) {
        indentLevel++;
      }
    }

    return formattedLines.join('\n');
  }

  /**
   * Basic HTML formatting
   */
  private formatHtml(code: string): string {
    let formatted = code;
    let indentLevel = 0;
    const indentSize = 2;
    
    // Add line breaks after tags
    formatted = formatted.replace(/></g, '>\n<');
    
    const lines = formatted.split('\n');
    const formattedLines: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Decrease indent for closing tags
      if (trimmedLine.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Add indentation
      const indent = ' '.repeat(indentLevel * indentSize);
      formattedLines.push(indent + trimmedLine);

      // Increase indent for opening tags (but not self-closing)
      if (trimmedLine.startsWith('<') && !trimmedLine.startsWith('</') && !trimmedLine.endsWith('/>')) {
        indentLevel++;
      }
    }

    return formattedLines.join('\n');
  }

  /**
   * Basic CSS formatting
   */
  private formatCss(code: string): string {
    let formatted = code;
    let indentLevel = 0;
    const indentSize = 2;

    // Add line breaks after braces and semicolons
    formatted = formatted.replace(/\{/g, '{\n');
    formatted = formatted.replace(/\}/g, '\n}\n');
    formatted = formatted.replace(/;/g, ';\n');

    const lines = formatted.split('\n');
    const formattedLines: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Decrease indent for closing braces
      if (trimmedLine === '}') {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Add indentation
      const indent = ' '.repeat(indentLevel * indentSize);
      formattedLines.push(indent + trimmedLine);

      // Increase indent for opening braces
      if (trimmedLine.endsWith('{')) {
        indentLevel++;
      }
    }

    return formattedLines.join('\n');
  }
}