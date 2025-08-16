import { Injectable, signal, computed } from '@angular/core';

export interface EditorBuffers {
  typescript: string;
  html: string;
  scss: string;
}

export interface EditorState {
  buffers: EditorBuffers;
  activeTab: 'typescript' | 'html' | 'scss';
  hasChanges: boolean;
  lastModified: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EditorStateService {
  // Core state signals
  private readonly _buffers = signal<EditorBuffers>({
    typescript: '',
    html: '',
    scss: ''
  });

  private readonly _activeTab = signal<'typescript' | 'html' | 'scss'>('typescript');
  private readonly _hasChanges = signal<boolean>(false);
  private readonly _lastModified = signal<Date>(new Date());

  // Public readonly signals
  readonly buffers = this._buffers.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();
  readonly hasChanges = this._hasChanges.asReadonly();
  readonly lastModified = this._lastModified.asReadonly();

  // Computed signals
  readonly currentBuffer = computed(() => {
    const buffers = this._buffers();
    const tab = this._activeTab();
    return buffers[tab];
  });

  readonly isEmpty = computed(() => {
    const buffers = this._buffers();
    return !buffers.typescript && !buffers.html && !buffers.scss;
  });

  readonly hasCode = computed(() => {
    const buffers = this._buffers();
    return !!(buffers.typescript || buffers.html || buffers.scss);
  });

  readonly editorState = computed((): EditorState => ({
    buffers: this._buffers(),
    activeTab: this._activeTab(),
    hasChanges: this._hasChanges(),
    lastModified: this._lastModified()
  }));

  // Buffer management methods
  updateBuffers(partial: Partial<EditorBuffers>): void {
    const current = this._buffers();
    const updated = { ...current, ...partial };
    
    // Only update if there are actual changes
    if (this.hasBufferChanges(current, updated)) {
      this._buffers.set(updated);
      this._hasChanges.set(true);
      this._lastModified.set(new Date());
    }
  }

  updateBuffer(type: keyof EditorBuffers, content: string): void {
    this.updateBuffers({ [type]: content });
  }

  setActiveTab(tab: 'typescript' | 'html' | 'scss'): void {
    this._activeTab.set(tab);
  }

  clearBuffers(): void {
    this._buffers.set({
      typescript: '',
      html: '',
      scss: ''
    });
    this._hasChanges.set(false);
    this._lastModified.set(new Date());
  }

  resetChanges(): void {
    this._hasChanges.set(false);
  }

  // Utility methods
  private hasBufferChanges(current: EditorBuffers, updated: EditorBuffers): boolean {
    return (
      current.typescript !== updated.typescript ||
      current.html !== updated.html ||
      current.scss !== updated.scss
    );
  }

  // Export/Import methods
  exportBuffers(): EditorBuffers {
    return { ...this._buffers() };
  }

  importBuffers(buffers: EditorBuffers): void {
    this._buffers.set({ ...buffers });
    this._hasChanges.set(true);
    this._lastModified.set(new Date());
  }

  // Validation methods
  validateBuffer(type: keyof EditorBuffers, content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (type) {
      case 'typescript':
        // Basic TypeScript validation
        if (content && !this.isValidTypeScript(content)) {
          errors.push('Invalid TypeScript syntax detected');
        }
        break;
      case 'html':
        // Basic HTML validation
        if (content && !this.isValidHTML(content)) {
          errors.push('Invalid HTML structure detected');
        }
        break;
      case 'scss':
        // Basic SCSS validation
        if (content && !this.isValidSCSS(content)) {
          errors.push('Invalid SCSS syntax detected');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isValidTypeScript(content: string): boolean {
    // Basic validation - check for balanced braces and basic syntax
    try {
      const braceCount = (content.match(/\{/g) || []).length - (content.match(/\}/g) || []).length;
      const parenCount = (content.match(/\(/g) || []).length - (content.match(/\)/g) || []).length;
      return braceCount === 0 && parenCount === 0;
    } catch {
      return false;
    }
  }

  private isValidHTML(content: string): boolean {
    // Basic validation - check for balanced tags
    try {
      const openTags = content.match(/<[^/][^>]*>/g) || [];
      const closeTags = content.match(/<\/[^>]*>/g) || [];
      const selfClosing = content.match(/<[^>]*\/>/g) || [];
      
      // Simple check: open tags should roughly match close tags + self-closing
      return openTags.length >= closeTags.length;
    } catch {
      return false;
    }
  }

  private isValidSCSS(content: string): boolean {
    // Basic validation - check for balanced braces
    try {
      const braceCount = (content.match(/\{/g) || []).length - (content.match(/\}/g) || []).length;
      return braceCount === 0;
    } catch {
      return false;
    }
  }

  // Debug methods
  getDebugInfo(): any {
    return {
      buffers: this._buffers(),
      activeTab: this._activeTab(),
      hasChanges: this._hasChanges(),
      lastModified: this._lastModified(),
      isEmpty: this.isEmpty(),
      hasCode: this.hasCode()
    };
  }
}
