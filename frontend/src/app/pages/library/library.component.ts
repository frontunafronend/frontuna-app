import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <div class="library-layout">
      <div class="library-header">
        <h1>
          <mat-icon>folder</mat-icon>
          Component Library
        </h1>
        <p>Manage your saved components and organize your collection</p>
      </div>

      <div class="library-content">
        <div class="empty-state">
          <mat-icon class="empty-icon">bookmark_border</mat-icon>
          <h3>Your Library is Empty</h3>
          <p>Start generating and saving components to build your library!</p>
          <button mat-raised-button 
                  color="primary"
                  routerLink="/dashboard/generate">
            <mat-icon>auto_awesome</mat-icon>
            Generate Your First Component
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .library-layout {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .library-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .library-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .library-header p {
      margin: 0;
      font-size: 16px;
      color: #666;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
      color: #666;
    }

    .empty-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ddd;
      margin-bottom: 24px;
    }

    .empty-state h3 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 24px;
    }

    .empty-state p {
      margin: 0 0 32px 0;  
      font-size: 16px;
    }
  `]
})
export class LibraryComponent implements OnInit {
  ngOnInit(): void {
    // Component initialization
  }
}