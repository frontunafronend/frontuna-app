import { Injectable } from '@angular/core';
import { EditorBuffers } from './editor-state.service';

export interface ParsedCodeFences {
  typescript?: string;
  html?: string;
  scss?: string;
  css?: string;
  javascript?: string;
  hasCode: boolean;
  originalText: string;
}

export interface CodeFence {
  language: string;
  code: string;
  startIndex: number;
  endIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class CodeFenceParserService {

  /**
   * Parse code fences from AI response text
   */
  parseCodeFences(text: string): ParsedCodeFences {
    const fences = this.extractCodeFences(text);
    const result: ParsedCodeFences = {
      hasCode: fences.length > 0,
      originalText: text
    };

    // Process each fence and categorize by language
    fences.forEach(fence => {
      const normalizedLang = this.normalizeLanguage(fence.language);
      
      switch (normalizedLang) {
        case 'typescript':
          result.typescript = fence.code;
          break;
        case 'html':
          result.html = fence.code;
          break;
        case 'scss':
          result.scss = fence.code;
          break;
        case 'css':
          // Convert CSS to SCSS if no SCSS is present
          if (!result.scss) {
            result.scss = fence.code;
          }
          result.css = fence.code;
          break;
        case 'javascript':
          // Use JavaScript as TypeScript if no TypeScript is present
          if (!result.typescript) {
            result.typescript = fence.code;
          }
          result.javascript = fence.code;
          break;
      }
    });

    return result;
  }

  /**
   * Extract all code fences from text
   */
  private extractCodeFences(text: string): CodeFence[] {
    const fences: CodeFence[] = [];
    const fenceRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = fenceRegex.exec(text)) !== null) {
      const language = match[1] || 'text';
      const code = match[2].trim();
      
      if (code) {
        fences.push({
          language,
          code,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      }
    }

    return fences;
  }

  /**
   * Normalize language names to standard types
   */
  private normalizeLanguage(language: string): string {
    const lang = language.toLowerCase().trim();
    
    // Language mappings
    const mappings: { [key: string]: string } = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'htm': 'html',
      'css': 'css',
      'sass': 'scss',
      'less': 'scss'
    };

    return mappings[lang] || lang;
  }

  /**
   * Convert parsed fences to EditorBuffers format
   */
  toEditorBuffers(parsed: ParsedCodeFences): Partial<EditorBuffers> {
    const buffers: Partial<EditorBuffers> = {};

    if (parsed.typescript) {
      buffers.typescript = parsed.typescript;
    }

    if (parsed.html) {
      buffers.html = parsed.html;
    }

    if (parsed.scss) {
      buffers.scss = parsed.scss;
    }

    return buffers;
  }

  /**
   * Check if text contains code fences
   */
  hasCodeFences(text: string): boolean {
    return /```\w*\n[\s\S]*?```/.test(text);
  }

  /**
   * Remove code fences from text, leaving only the explanation
   */
  removeCodeFences(text: string): string {
    return text.replace(/```\w*\n[\s\S]*?```/g, '').trim();
  }

  /**
   * Get explanation text without code fences
   */
  getExplanationText(text: string): string {
    const withoutFences = this.removeCodeFences(text);
    
    // Clean up extra whitespace and line breaks
    return withoutFences
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Detect if response is explanation-only (no code)
   */
  isExplanationOnly(text: string): boolean {
    return !this.hasCodeFences(text) || this.removeCodeFences(text).length > text.length * 0.8;
  }

  /**
   * Smart merge of new code with existing buffers
   */
  mergeWithExisting(existing: EditorBuffers, parsed: ParsedCodeFences): EditorBuffers {
    const result: EditorBuffers = { ...existing };

    // Only update if new code is provided
    if (parsed.typescript) {
      result.typescript = parsed.typescript;
    }

    if (parsed.html) {
      result.html = parsed.html;
    }

    if (parsed.scss) {
      result.scss = parsed.scss;
    }

    return result;
  }

  /**
   * Generate diff-friendly comparison data
   */
  generateDiffData(before: EditorBuffers, after: Partial<EditorBuffers>) {
    const changes: Array<{
      type: keyof EditorBuffers;
      before: string;
      after: string;
      hasChanges: boolean;
    }> = [];

    (['typescript', 'html', 'scss'] as const).forEach(type => {
      const beforeCode = before[type] || '';
      const afterCode = after[type] || beforeCode;
      
      changes.push({
        type,
        before: beforeCode,
        after: afterCode,
        hasChanges: beforeCode !== afterCode
      });
    });

    return {
      changes,
      hasAnyChanges: changes.some(c => c.hasChanges),
      changedTypes: changes.filter(c => c.hasChanges).map(c => c.type)
    };
  }

  /**
   * Validate parsed code for basic syntax
   */
  validateParsedCode(parsed: ParsedCodeFences): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic TypeScript validation
    if (parsed.typescript) {
      if (!this.isValidTypeScript(parsed.typescript)) {
        errors.push('TypeScript code appears to have syntax errors');
      }
    }

    // Basic HTML validation
    if (parsed.html) {
      if (!this.isValidHTML(parsed.html)) {
        errors.push('HTML code appears to have structural issues');
      }
    }

    // Basic SCSS validation
    if (parsed.scss) {
      if (!this.isValidSCSS(parsed.scss)) {
        errors.push('SCSS code appears to have syntax errors');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isValidTypeScript(code: string): boolean {
    try {
      // Basic validation - check for balanced braces
      const braceCount = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
      const parenCount = (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
      return Math.abs(braceCount) <= 1 && Math.abs(parenCount) <= 1; // Allow some tolerance
    } catch {
      return false;
    }
  }

  private isValidHTML(code: string): boolean {
    try {
      // Basic validation - check for balanced tags
      const openTags = (code.match(/<[^/!][^>]*[^/]>/g) || []).length;
      const closeTags = (code.match(/<\/[^>]*>/g) || []).length;
      const selfClosing = (code.match(/<[^>]*\/>/g) || []).length;
      
      // Allow some flexibility in tag matching
      return openTags >= closeTags - 2;
    } catch {
      return false;
    }
  }

  private isValidSCSS(code: string): boolean {
    try {
      // Basic validation - check for balanced braces
      const braceCount = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
      return Math.abs(braceCount) <= 1; // Allow some tolerance
    } catch {
      return false;
    }
  }
}
