import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-best-practices',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="container">
        <div class="page-header">
          <h1>Best Practices</h1>
          <p>Learn the best practices for component development</p>
        </div>
        
        <div class="content-section">
          <mat-card>
            <mat-card-content>
              <h2><mat-icon>star</mat-icon> Component Best Practices</h2>
              <p>Follow these guidelines to create maintainable and scalable components.</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 6rem 0 4rem; min-height: 100vh; }
    .page-header { text-align: center; margin-bottom: 3rem; }
    .page-header h1 { font-size: 3rem; font-weight: 700; color: #333; }
    .content-section { margin: 2rem 0; }
  `]
})
export class BestPracticesComponent {}