import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { EditableDirective } from '../../../directives/editable.directive';
import { EditingService, EditSession } from '../../../services/editing/editing.service';
import { MonacoEditorComponent } from '../../shared/monaco-editor/monaco-editor.component';

@Component({
  selector: 'app-editing-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    EditableDirective,
    MonacoEditorComponent
  ],
  template: `
    <div class="editing-demo-container">
      <h2>🎯 Editing System Demo</h2>
      <p>This demonstrates all the editing features working together.</p>

      <!-- Active Sessions Panel -->
      <mat-card class="sessions-panel" *ngIf="activeSessions().length > 0">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>edit</mat-icon>
            Active Edit Sessions ({{ activeSessions().length }})
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="session-list">
            <div *ngFor="let session of activeSessions()" class="session-item">
              <div class="session-info">
                <strong>{{ session.type }}/{{ session.entityId }}</strong>
                <span class="session-status" [class.has-changes]="session.hasUnsavedChanges">
                  {{ session.hasUnsavedChanges ? '● Unsaved' : '✓ Saved' }}
                </span>
              </div>
              <button mat-icon-button (click)="saveSession(session.id)" [disabled]="!session.hasUnsavedChanges">
                <mat-icon>save</mat-icon>
              </button>
            </div>
          </div>
          <div class="session-actions">
            <button mat-button (click)="saveAllSessions()">
              <mat-icon>save_alt</mat-icon>
              Save All
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Form Editing Demo -->
      <mat-card class="demo-section">
        <mat-card-header>
          <mat-card-title>📝 Form Editing</mat-card-title>
          <mat-card-subtitle>Click on any field to start editing</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="form-demo">
            <mat-form-field appearance="outline" class="editable">
              <mat-label>Component Name</mat-label>
              <input matInput 
                     [(ngModel)]="demoData.componentName"
                     appEditable="demo-component"
                     field="name"
                     editType="component"
                     (valueChange)="onValueChange('componentName', $event)">
            </mat-form-field>

            <mat-form-field appearance="outline" class="editable">
              <mat-label>Description</mat-label>
              <textarea matInput 
                        rows="3"
                        [(ngModel)]="demoData.description"
                        appEditable="demo-component"
                        field="description"
                        editType="component"
                        (valueChange)="onValueChange('description', $event)">
              </textarea>
            </mat-form-field>

            <div class="inline-edit-demo">
              <h4>Inline Editable Text</h4>
              <p [contentEditable]="true"
                 appEditable="demo-component"
                 field="inlineText"
                 editType="form"
                 data-placeholder="Click to edit this text..."
                 (valueChange)="onValueChange('inlineText', $event)">
                {{ demoData.inlineText }}
              </p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Code Editing Demo -->
      <mat-card class="demo-section">
        <mat-card-header>
          <mat-card-title>💻 Code Editing</mat-card-title>
          <mat-card-subtitle>Monaco editor with auto-save</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="code-demo">
            <app-monaco-editor
              [value]="demoData.code"
              [language]="'typescript'"
              [height]="300"
              [title]="'Demo Component Code'"
              [readonly]="false"
              class="editable"
              appEditable="demo-code"
              field="typescript"
              editType="component"
              (valueChange)="onCodeChange($event)">
            </app-monaco-editor>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Settings -->
      <mat-card class="demo-section">
        <mat-card-header>
          <mat-card-title>⚙️ Settings</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="settings-demo">
            <mat-slide-toggle [(ngModel)]="autoSaveEnabled" (change)="toggleAutoSave()">
              Auto-save enabled
            </mat-slide-toggle>
            
            <mat-slide-toggle [(ngModel)]="showShortcuts" (change)="toggleShortcuts()">
              Show keyboard shortcuts
            </mat-slide-toggle>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Current Values Display -->
      <mat-card class="demo-section">
        <mat-card-header>
          <mat-card-title>📊 Current Values</mat-card-title>
          <mat-card-subtitle>Live data preview</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <pre class="data-preview">{{ demoDataJson() }}</pre>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Keyboard Shortcuts Help -->
    <div class="editing-shortcuts" [class.show]="showShortcuts">
      <div class="shortcut">
        <span class="key">Ctrl+S</span> Save changes
      </div>
      <div class="shortcut">
        <span class="key">Esc</span> Cancel editing
      </div>
      <div class="shortcut">
        <span class="key">Tab</span> Next field
      </div>
    </div>
  `,
  styles: [`
    .editing-demo-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .demo-section {
      margin-bottom: 24px;
    }

    .sessions-panel {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin-bottom: 24px;
    }

    .sessions-panel .mat-mdc-card-header {
      color: white;
    }

    .session-list {
      margin-bottom: 16px;
    }

    .session-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .session-item:last-child {
      border-bottom: none;
    }

    .session-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .session-status {
      font-size: 12px;
      opacity: 0.8;
    }

    .session-status.has-changes {
      color: #ff9800;
    }

    .session-actions {
      text-align: center;
    }

    .form-demo {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .inline-edit-demo h4 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .inline-edit-demo p {
      min-height: 24px;
      padding: 8px;
      border: 1px dashed #ddd;
      border-radius: 4px;
      cursor: text;
    }

    .code-demo {
      border-radius: 8px;
      overflow: hidden;
    }

    .settings-demo {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .data-preview {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      line-height: 1.4;
      max-height: 300px;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .editing-demo-container {
        padding: 16px;
      }
      
      .form-demo {
        gap: 12px;
      }
    }
  `]
})
export class EditingDemoComponent {
  private readonly editingService = inject(EditingService);

  // Demo data
  public readonly demoData = signal({
    componentName: 'My Awesome Component',
    description: 'A demonstration component showing the editing system capabilities.',
    inlineText: 'This text can be edited inline. Click to start editing!',
    code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-demo',
  template: \`
    <div class="demo-component">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>
  \`,
  styles: [\`
    .demo-component {
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }
  \`]
})
export class DemoComponent {
  title = 'Demo Component';
  description = 'This is a demo component';
}`
  });

  // Settings
  public autoSaveEnabled = true;
  public showShortcuts = false;

  // Active sessions
  public readonly activeSessions = signal<EditSession[]>([]);

  // Computed
  public readonly demoDataJson = () => JSON.stringify(this.demoData(), null, 2);

  constructor() {
    // Subscribe to active sessions
    this.editingService.activeSessions$.subscribe(sessions => {
      this.activeSessions.set(sessions);
    });
  }

  onValueChange(field: string, value: any): void {
    const current = this.demoData();
    this.demoData.set({
      ...current,
      [field]: value
    });
    console.log(`📝 ${field} changed:`, value);
  }

  onCodeChange(code: string): void {
    this.onValueChange('code', code);
  }

  saveSession(sessionId: string): void {
    this.editingService.saveSession(sessionId);
  }

  saveAllSessions(): void {
    const count = this.editingService.saveAllSessions();
    console.log(`💾 Saved ${count} sessions`);
  }

  toggleAutoSave(): void {
    console.log('Auto-save:', this.autoSaveEnabled ? 'enabled' : 'disabled');
  }

  toggleShortcuts(): void {
    console.log('Shortcuts:', this.showShortcuts ? 'shown' : 'hidden');
  }
}
