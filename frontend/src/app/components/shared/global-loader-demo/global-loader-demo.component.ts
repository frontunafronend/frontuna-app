import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GlobalLoaderService } from '@app/services/ui/global-loader.service';

@Component({
  selector: 'app-global-loader-demo',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="demo-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>smart_toy</mat-icon>
          Global Loader Demo
        </mat-card-title>
        <mat-card-subtitle>
          Experience the beautiful professional loaders used throughout the app
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="demo-grid">
          <button mat-raised-button color="primary" (click)="showThinking()">
            <mat-icon>psychology</mat-icon>
            AI Thinking
          </button>
          
          <button mat-raised-button color="accent" (click)="showGenerating()">
            <mat-icon>code</mat-icon>
            Code Generation
          </button>
          
          <button mat-raised-button color="primary" (click)="showProcessing()">
            <mat-icon>settings</mat-icon>
            Processing
          </button>
          
          <button mat-raised-button color="accent" (click)="showPulse()">
            <mat-icon>radio_button_unchecked</mat-icon>
            Pulse Loading
          </button>
          
          <button mat-raised-button color="primary" (click)="showSignup()">
            <mat-icon>person_add</mat-icon>
            Signup Process
          </button>
          
          <button mat-raised-button color="accent" (click)="showLogin()">
            <mat-icon>login</mat-icon>
            Login Process
          </button>
          
          <button mat-raised-button color="primary" (click)="showProgressDemo()">
            <mat-icon>trending_up</mat-icon>
            Progress Demo
          </button>
          
          <button mat-raised-button color="warn" (click)="hideLoader()">
            <mat-icon>close</mat-icon>
            Hide Loader
          </button>
        </div>
        
        <div class="info-section">
          <h3>How to Use in Your Components:</h3>
          <pre><code>// Inject the service
private readonly globalLoader = inject(GlobalLoaderService);

// Show different types of loaders
this.globalLoader.showThinking('AI is analyzing your code...');
this.globalLoader.showGenerating('Creating components...', true, 45);
this.globalLoader.showProcessing('Saving changes...', 'Please wait');

// Use predefined configurations
this.globalLoader.show(this.globalLoader.forOperation('signup'));

// Hide the loader
this.globalLoader.hide();</code></pre>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .demo-card {
      max-width: 800px;
      margin: 2rem auto;
    }
    
    mat-card-header {
      margin-bottom: 1rem;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .demo-grid button {
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .info-section {
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
      margin-top: 2rem;
    }
    
    .info-section h3 {
      margin-top: 0;
      color: #333;
    }
    
    pre {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 0.9rem;
      line-height: 1.4;
    }
    
    code {
      font-family: 'Courier New', monospace;
    }
    
    @media (prefers-color-scheme: dark) {
      .info-section {
        background: #2d2d2d;
      }
      
      .info-section h3 {
        color: #e0e0e0;
      }
    }
  `]
})
export class GlobalLoaderDemoComponent {
  private readonly globalLoader = inject(GlobalLoaderService);

  showThinking(): void {
    this.globalLoader.showThinking(
      'AI is analyzing your request...',
      'This may take a few moments'
    );
    
    // Auto-hide after 3 seconds for demo
    setTimeout(() => this.globalLoader.hide(), 3000);
  }

  showGenerating(): void {
    this.globalLoader.showGenerating('Generating your component...', true, 0);
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        this.globalLoader.updateProgress(progress);
        clearInterval(interval);
        setTimeout(() => this.globalLoader.hide(), 1000);
      } else {
        this.globalLoader.updateProgress(Math.min(progress, 100));
      }
    }, 300);
  }

  showProcessing(): void {
    this.globalLoader.showProcessing(
      'Processing your request...',
      'Optimizing and validating code'
    );
    
    // Auto-hide after 2.5 seconds for demo
    setTimeout(() => this.globalLoader.hide(), 2500);
  }

  showPulse(): void {
    this.globalLoader.showPulse('Loading your workspace...');
    
    // Auto-hide after 2 seconds for demo
    setTimeout(() => this.globalLoader.hide(), 2000);
  }

  showSignup(): void {
    this.globalLoader.show(this.globalLoader.forOperation('signup'));
    
    // Simulate signup process
    setTimeout(() => {
      this.globalLoader.updateMessage(
        'Account created successfully!',
        'Redirecting to dashboard...'
      );
      setTimeout(() => this.globalLoader.hide(), 1500);
    }, 2000);
  }

  showLogin(): void {
    this.globalLoader.show(this.globalLoader.forOperation('login'));
    
    // Simulate login process
    setTimeout(() => {
      this.globalLoader.updateMessage(
        'Welcome back!',
        'Loading your workspace...'
      );
      setTimeout(() => this.globalLoader.hide(), 1500);
    }, 1500);
  }

  showProgressDemo(): void {
    this.globalLoader.showGenerating('Building your project...', true, 0);
    
    const steps = [
      { progress: 20, message: 'Installing dependencies...', sub: 'npm install' },
      { progress: 40, message: 'Compiling TypeScript...', sub: 'tsc --build' },
      { progress: 60, message: 'Building components...', sub: 'webpack --mode production' },
      { progress: 80, message: 'Optimizing assets...', sub: 'Minifying and compressing' },
      { progress: 100, message: 'Build complete!', sub: 'Ready for deployment' }
    ];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        this.globalLoader.updateProgress(step.progress);
        this.globalLoader.updateMessage(step.message, step.sub);
        stepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => this.globalLoader.hide(), 1000);
      }
    }, 1000);
  }

  hideLoader(): void {
    this.globalLoader.hide();
  }
}
