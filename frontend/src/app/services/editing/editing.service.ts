import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface EditSession {
  id: string;
  type: 'component' | 'version' | 'history' | 'form';
  entityId: string;
  isActive: boolean;
  hasUnsavedChanges: boolean;
  lastModified: Date;
  autoSaveEnabled: boolean;
}

export interface EditChange {
  sessionId: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EditingService {
  private readonly activeSessions = signal<Map<string, EditSession>>(new Map());
  private readonly changeHistory = signal<EditChange[]>([]);
  private readonly autoSaveTimeouts = new Map<string, any>();
  
  private readonly activeSessionsSubject = new BehaviorSubject<EditSession[]>([]);
  public readonly activeSessions$ = this.activeSessionsSubject.asObservable();

  /**
   * Start an editing session
   */
  startEditSession(type: EditSession['type'], entityId: string, autoSave = true): string {
    const sessionId = this.generateSessionId();
    
    const session: EditSession = {
      id: sessionId,
      type,
      entityId,
      isActive: true,
      hasUnsavedChanges: false,
      lastModified: new Date(),
      autoSaveEnabled: autoSave
    };
    
    const sessions = new Map(this.activeSessions());
    sessions.set(sessionId, session);
    this.activeSessions.set(sessions);
    
    this.updateActiveSessionsSubject();
    
    console.log(`✏️ Started edit session: ${type}/${entityId} (${sessionId})`);
    return sessionId;
  }

  /**
   * End an editing session
   */
  endEditSession(sessionId: string, save = true): boolean {
    const sessions = new Map(this.activeSessions());
    const session = sessions.get(sessionId);
    
    if (!session) {
      console.warn(`⚠️ Session not found: ${sessionId}`);
      return false;
    }
    
    // Clear any pending auto-save
    this.clearAutoSave(sessionId);
    
    if (save && session.hasUnsavedChanges) {
      this.saveSession(sessionId);
    }
    
    sessions.delete(sessionId);
    this.activeSessions.set(sessions);
    this.updateActiveSessionsSubject();
    
    console.log(`✅ Ended edit session: ${sessionId}`);
    return true;
  }

  /**
   * Record a change in an editing session
   */
  recordChange(sessionId: string, field: string, oldValue: any, newValue: any): void {
    const sessions = new Map(this.activeSessions());
    const session = sessions.get(sessionId);
    
    if (!session) {
      console.warn(`⚠️ Session not found: ${sessionId}`);
      return;
    }
    
    // Update session
    session.hasUnsavedChanges = true;
    session.lastModified = new Date();
    sessions.set(sessionId, session);
    this.activeSessions.set(sessions);
    
    // Record change
    const change: EditChange = {
      sessionId,
      field,
      oldValue,
      newValue,
      timestamp: new Date()
    };
    
    const history = [...this.changeHistory()];
    history.push(change);
    this.changeHistory.set(history);
    
    // Setup auto-save if enabled
    if (session.autoSaveEnabled) {
      this.setupAutoSave(sessionId);
    }
    
    this.updateActiveSessionsSubject();
    
    console.log(`📝 Recorded change in session ${sessionId}: ${field}`);
  }

  /**
   * Save a session
   */
  saveSession(sessionId: string): boolean {
    const sessions = new Map(this.activeSessions());
    const session = sessions.get(sessionId);
    
    if (!session) {
      console.warn(`⚠️ Session not found: ${sessionId}`);
      return false;
    }
    
    // Clear pending auto-save
    this.clearAutoSave(sessionId);
    
    // Mark as saved
    session.hasUnsavedChanges = false;
    session.lastModified = new Date();
    sessions.set(sessionId, session);
    this.activeSessions.set(sessions);
    
    this.updateActiveSessionsSubject();
    
    console.log(`💾 Saved session: ${sessionId}`);
    
    // Here you would typically call the appropriate service to persist the changes
    // based on session.type and session.entityId
    
    return true;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): EditSession | null {
    return this.activeSessions().get(sessionId) || null;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): EditSession[] {
    return Array.from(this.activeSessions().values());
  }

  /**
   * Get sessions by type
   */
  getSessionsByType(type: EditSession['type']): EditSession[] {
    return this.getActiveSessions().filter(session => session.type === type);
  }

  /**
   * Get sessions by entity ID
   */
  getSessionsByEntity(entityId: string): EditSession[] {
    return this.getActiveSessions().filter(session => session.entityId === entityId);
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges(sessionId?: string): boolean {
    if (sessionId) {
      const session = this.getSession(sessionId);
      return session?.hasUnsavedChanges || false;
    }
    
    return this.getActiveSessions().some(session => session.hasUnsavedChanges);
  }

  /**
   * Save all sessions with unsaved changes
   */
  saveAllSessions(): number {
    let savedCount = 0;
    
    for (const session of this.getActiveSessions()) {
      if (session.hasUnsavedChanges) {
        if (this.saveSession(session.id)) {
          savedCount++;
        }
      }
    }
    
    console.log(`💾 Saved ${savedCount} sessions`);
    return savedCount;
  }

  /**
   * Get change history for a session
   */
  getSessionHistory(sessionId: string): EditChange[] {
    return this.changeHistory().filter(change => change.sessionId === sessionId);
  }

  /**
   * Clear change history
   */
  clearHistory(sessionId?: string): void {
    if (sessionId) {
      const history = this.changeHistory().filter(change => change.sessionId !== sessionId);
      this.changeHistory.set(history);
    } else {
      this.changeHistory.set([]);
    }
  }

  /**
   * Setup auto-save for a session
   */
  private setupAutoSave(sessionId: string, delay = 2000): void {
    this.clearAutoSave(sessionId);
    
    const timeout = setTimeout(() => {
      this.saveSession(sessionId);
    }, delay);
    
    this.autoSaveTimeouts.set(sessionId, timeout);
  }

  /**
   * Clear auto-save timeout
   */
  private clearAutoSave(sessionId: string): void {
    const timeout = this.autoSaveTimeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.autoSaveTimeouts.delete(sessionId);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update the active sessions subject
   */
  private updateActiveSessionsSubject(): void {
    this.activeSessionsSubject.next(this.getActiveSessions());
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    // Clear all auto-save timeouts
    for (const timeout of this.autoSaveTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.autoSaveTimeouts.clear();
  }
}
