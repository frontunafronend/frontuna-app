import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-analytics-debug',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="analytics-debug">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>analytics</mat-icon>
          Google Analytics Debug
        </mat-card-title>
        <mat-card-subtitle>
          Testing GA4 Integration (ID: {{ trackingId }})
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="status-section">
          <h3>Status</h3>
          <div class="status-item">
            <strong>Enabled:</strong> 
            <span [class]="analyticsEnabled ? 'status-success' : 'status-error'">
              {{ analyticsEnabled ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="status-item">
            <strong>Debug Mode:</strong> 
            <span [class]="debugMode ? 'status-warning' : 'status-info'">
              {{ debugMode ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
          <div class="status-item">
            <strong>Tracking ID:</strong> 
            <code>{{ trackingId }}</code>
          </div>
        </div>

        <div class="test-section">
          <h3>Test Events</h3>
          <div class="button-grid">
            <button mat-raised-button color="primary" (click)="testPageView()">
              <mat-icon>pageview</mat-icon>
              Test Page View
            </button>
            
            <button mat-raised-button color="accent" (click)="testCustomEvent()">
              <mat-icon>event</mat-icon>
              Test Custom Event
            </button>
            
            <button mat-raised-button color="primary" (click)="testSignupEvent()">
              <mat-icon>person_add</mat-icon>
              Test Signup Event
            </button>
            
            <button mat-raised-button color="accent" (click)="testComponentGeneration()">
              <mat-icon>code</mat-icon>
              Test Component Event
            </button>
            
            <button mat-raised-button color="primary" (click)="testError()">
              <mat-icon>error</mat-icon>
              Test Error Event
            </button>
            
            <button mat-raised-button color="accent" (click)="testTiming()">
              <mat-icon>timer</mat-icon>
              Test Timing Event
            </button>
          </div>
        </div>

        <div class="instructions">
          <h3>How to Verify</h3>
          <ol>
            <li>Open Chrome DevTools (F12)</li>
            <li>Go to <strong>Console</strong> tab</li>
            <li>Look for GA4 debug messages</li>
            <li>Or use <strong>GA4 Debug View</strong> in your Google Analytics dashboard</li>
            <li>Click the test buttons above to send events</li>
          </ol>
          
          <div class="debug-info" *ngIf="debugMode">
            <h4>Debug Mode Active</h4>
            <p>Events will appear in real-time in GA4 Debug View</p>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .analytics-debug {
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
    
    .status-section {
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    .status-item {
      margin-bottom: 0.5rem;
    }
    
    .status-success { color: #4caf50; font-weight: bold; }
    .status-error { color: #f44336; font-weight: bold; }
    .status-warning { color: #ff9800; font-weight: bold; }
    .status-info { color: #2196f3; font-weight: bold; }
    
    .test-section {
      margin-bottom: 2rem;
    }
    
    .button-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .button-grid button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
    }
    
    .instructions {
      background: #e3f2fd;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }
    
    .debug-info {
      background: #fff3e0;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
      margin-top: 1rem;
    }
    
    code {
      background: #f5f5f5;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
    }
    
    h3 {
      margin-top: 0;
      color: #333;
    }
    
    h4 {
      margin-top: 0;
      color: #ff9800;
    }
    
    ol {
      padding-left: 1.5rem;
    }
    
    li {
      margin-bottom: 0.5rem;
    }
  `]
})
export class AnalyticsDebugComponent {
  private readonly analyticsService = inject(GoogleAnalyticsService);
  
  public readonly analyticsEnabled = environment.googleAnalytics.enabled;
  public readonly debugMode = environment.googleAnalytics.debugMode;
  public readonly trackingId = environment.googleAnalytics.trackingId;

  testPageView(): void {
    console.log('🧪 Testing Page View event');
    this.analyticsService.trackPageView({
      page_title: 'Analytics Debug Test Page',
      page_location: window.location.href + '#debug-test'
    });
  }

  testCustomEvent(): void {
    console.log('🧪 Testing Custom event');
    this.analyticsService.trackEvent({
      action: 'debug_test',
      category: 'testing',
      label: 'custom_event_test',
      value: 42
    });
  }

  testSignupEvent(): void {
    console.log('🧪 Testing Signup event');
    this.analyticsService.trackSignup('debug_test');
  }

  testComponentGeneration(): void {
    console.log('🧪 Testing Component Generation event');
    this.analyticsService.trackComponentGeneration('angular', 'button');
  }

  testError(): void {
    console.log('🧪 Testing Error event');
    this.analyticsService.trackError('This is a test error for analytics debugging');
  }

  testTiming(): void {
    console.log('🧪 Testing Timing event');
    this.analyticsService.trackTiming('debug', 'test_operation', 1500, 'Debug timing test');
  }
}
