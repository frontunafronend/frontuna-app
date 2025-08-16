import { Injectable, inject } from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { NotificationService } from '../notification/notification.service';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutsService {
  private readonly notificationService = inject(NotificationService);
  private shortcuts: KeyboardShortcut[] = [];
  private isListening = false;

  constructor() {
    this.initializeGlobalShortcuts();
  }

  private initializeGlobalShortcuts() {
    if (this.isListening) return;
    
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter(event => this.shouldHandleShortcut(event)),
        map(event => this.findMatchingShortcut(event))
      )
      .subscribe(shortcut => {
        if (shortcut) {
          shortcut.action();
        }
      });
    
    this.isListening = true;
  }

  registerShortcut(shortcut: KeyboardShortcut) {
    // Remove existing shortcut with same key combination
    this.shortcuts = this.shortcuts.filter(s => !this.isShortcutEqual(s, shortcut));
    this.shortcuts.push(shortcut);
  }

  unregisterShortcut(key: string, modifiers?: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean }) {
    this.shortcuts = this.shortcuts.filter(s => 
      !(s.key === key && 
        s.ctrlKey === modifiers?.ctrlKey && 
        s.shiftKey === modifiers?.shiftKey && 
        s.altKey === modifiers?.altKey)
    );
  }

  getShortcuts(): KeyboardShortcut[] {
    return [...this.shortcuts];
  }

  showShortcutsHelp() {
    const helpText = this.shortcuts
      .map(s => `${this.formatShortcut(s)}: ${s.description}`)
      .join('\n');
    
    this.notificationService.showInfo(`Keyboard Shortcuts:\n${helpText}`);
  }

  private shouldHandleShortcut(event: KeyboardEvent): boolean {
    // Don't handle shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                   target.tagName === 'TEXTAREA' || 
                   target.contentEditable === 'true';
    
    // Allow certain shortcuts even in inputs
    const allowedInInputs = ['Escape', 'F1'];
    
    return !isInput || allowedInInputs.includes(event.key);
  }

  private findMatchingShortcut(event: KeyboardEvent): KeyboardShortcut | null {
    return this.shortcuts.find(shortcut => 
      shortcut.key.toLowerCase() === event.key.toLowerCase() &&
      !!shortcut.ctrlKey === event.ctrlKey &&
      !!shortcut.shiftKey === event.shiftKey &&
      !!shortcut.altKey === event.altKey
    ) || null;
  }

  private isShortcutEqual(a: KeyboardShortcut, b: KeyboardShortcut): boolean {
    return a.key === b.key &&
           a.ctrlKey === b.ctrlKey &&
           a.shiftKey === b.shiftKey &&
           a.altKey === b.altKey;
  }

  private formatShortcut(shortcut: KeyboardShortcut): string {
    const parts = [];
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  }
}
