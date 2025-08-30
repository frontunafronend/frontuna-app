import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-responsive-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="responsive-card" 
         [class.elevated]="elevated"
         [class.clickable]="clickable"
         (click)="onCardClick()">
      
      <!-- Card Header -->
      <div class="card-header" *ngIf="title || subtitle">
        <div class="header-content">
          <h3 class="card-title" *ngIf="title">{{ title }}</h3>
          <p class="card-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <div class="header-icon" *ngIf="icon">
          <mat-icon>{{ icon }}</mat-icon>
        </div>
      </div>

      <!-- Card Image -->
      <div class="card-image" *ngIf="imageUrl">
        <img [src]="imageUrl" [alt]="title || 'Card image'" />
      </div>

      <!-- Card Content -->
      <div class="card-content">
        <ng-content></ng-content>
      </div>

      <!-- Card Actions -->
      <div class="card-actions" *ngIf="showActions">
        <ng-content select="[slot=actions]"></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./responsive-card.component.scss']
})
export class ResponsiveCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() imageUrl?: string;
  @Input() elevated: boolean = false;
  @Input() clickable: boolean = false;
  @Input() showActions: boolean = false;

  onCardClick() {
    if (this.clickable) {
      // Emit click event or handle navigation
      console.log('Card clicked:', this.title);
    }
  }
}
