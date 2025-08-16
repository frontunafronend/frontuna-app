import { 
  Directive, 
  ElementRef, 
  Input, 
  Output, 
  EventEmitter, 
  HostListener,
  OnInit,
  OnDestroy,
  inject
} from '@angular/core';
import { EditingService } from '../services/editing/editing.service';

@Directive({
  selector: '[appEditable]',
  standalone: true
})
export class EditableDirective implements OnInit, OnDestroy {
  @Input('appEditable') entityId!: string;
  @Input() editType: 'component' | 'version' | 'history' | 'form' = 'form';
  @Input() field!: string;
  @Input() autoSave = true;
  @Input() debounceTime = 300;

  @Output() valueChange = new EventEmitter<any>();
  @Output() editStart = new EventEmitter<void>();
  @Output() editEnd = new EventEmitter<void>();

  private readonly editingService = inject(EditingService);
  private readonly elementRef = inject(ElementRef);
  
  private sessionId: string | null = null;
  private originalValue: any = null;
  private currentValue: any = null;
  private debounceTimeout: any = null;
  private isEditing = false;

  ngOnInit(): void {
    this.setupElement();
  }

  ngOnDestroy(): void {
    if (this.sessionId) {
      this.editingService.endEditSession(this.sessionId, true);
    }
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
  }

  @HostListener('focus')
  onFocus(): void {
    if (!this.isEditing) {
      this.startEditing();
    }
  }

  @HostListener('blur')
  onBlur(): void {
    if (this.isEditing) {
      this.endEditing();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const newValue = target.value;
    
    if (newValue !== this.currentValue) {
      this.handleValueChange(newValue);
    }
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    this.cancelEditing();
  }

  @HostListener('keydown.control.s', ['$event'])
  @HostListener('keydown.meta.s', ['$event'])
  onSave(event: KeyboardEvent): void {
    event.preventDefault();
    this.saveChanges();
  }

  private setupElement(): void {
    const element = this.elementRef.nativeElement;
    
    // Store original value
    this.originalValue = element.value || element.textContent || '';
    this.currentValue = this.originalValue;
    
    // Add visual indicators
    element.classList.add('editable');
    
    // Add data attributes for debugging
    element.setAttribute('data-editable-entity', this.entityId);
    element.setAttribute('data-editable-field', this.field);
  }

  private startEditing(): void {
    if (this.isEditing) return;
    
    console.log(`✏️ Starting edit: ${this.entityId}/${this.field}`);
    
    this.isEditing = true;
    this.sessionId = this.editingService.startEditSession(this.editType, this.entityId, this.autoSave);
    
    // Add editing visual state
    const element = this.elementRef.nativeElement;
    element.classList.add('editing');
    
    this.editStart.emit();
  }

  private endEditing(): void {
    if (!this.isEditing) return;
    
    console.log(`✅ Ending edit: ${this.entityId}/${this.field}`);
    
    this.isEditing = false;
    
    if (this.sessionId) {
      this.editingService.endEditSession(this.sessionId, true);
      this.sessionId = null;
    }
    
    // Remove editing visual state
    const element = this.elementRef.nativeElement;
    element.classList.remove('editing');
    
    this.editEnd.emit();
  }

  private handleValueChange(newValue: any): void {
    const oldValue = this.currentValue;
    this.currentValue = newValue;
    
    // Clear previous debounce
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    // Debounce the change recording
    this.debounceTimeout = setTimeout(() => {
      this.recordChange(oldValue, newValue);
    }, this.debounceTime);
    
    // Emit immediate change for reactive updates
    this.valueChange.emit(newValue);
  }

  private recordChange(oldValue: any, newValue: any): void {
    if (this.sessionId && oldValue !== newValue) {
      this.editingService.recordChange(this.sessionId, this.field, oldValue, newValue);
      
      // Add visual indicator for unsaved changes
      const element = this.elementRef.nativeElement;
      element.classList.add('has-changes');
    }
  }

  private saveChanges(): void {
    if (this.sessionId) {
      const saved = this.editingService.saveSession(this.sessionId);
      
      if (saved) {
        // Remove unsaved changes indicator
        const element = this.elementRef.nativeElement;
        element.classList.remove('has-changes');
        
        console.log(`💾 Saved changes for: ${this.entityId}/${this.field}`);
      }
    }
  }

  private cancelEditing(): void {
    if (!this.isEditing) return;
    
    console.log(`❌ Cancelling edit: ${this.entityId}/${this.field}`);
    
    // Restore original value
    const element = this.elementRef.nativeElement;
    if (element.value !== undefined) {
      element.value = this.originalValue;
    } else {
      element.textContent = this.originalValue;
    }
    
    this.currentValue = this.originalValue;
    
    // End session without saving
    if (this.sessionId) {
      this.editingService.endEditSession(this.sessionId, false);
      this.sessionId = null;
    }
    
    this.endEditing();
    this.valueChange.emit(this.originalValue);
  }
}
