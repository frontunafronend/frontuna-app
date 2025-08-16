import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simple-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="simple-loader" [class]="'loader-' + type">
      @if (type === 'dots') {
        <div class="loader-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      }
      
      @if (type === 'spinner') {
        <div class="loader-spinner"></div>
      }
      
      @if (type === 'bar') {
        <div class="loader-bar">
          <div class="bar-fill" [style.width.%]="progress"></div>
        </div>
      }
      
      @if (message) {
        <div class="loader-message">{{ message }}</div>
      }
    </div>
  `,
  styles: [`
    .simple-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
    }

    /* Dots Loader */
    .loader-dots {
      display: flex;
      gap: 4px;
    }

    .loader-dots .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary-color, #667eea);
      animation: dot-pulse 1.4s ease-in-out infinite both;
    }

    .loader-dots .dot:nth-child(1) { animation-delay: -0.32s; }
    .loader-dots .dot:nth-child(2) { animation-delay: -0.16s; }
    .loader-dots .dot:nth-child(3) { animation-delay: 0s; }

    @keyframes dot-pulse {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Spinner Loader */
    .loader-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid rgba(102, 126, 234, 0.2);
      border-top: 2px solid var(--primary-color, #667eea);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Bar Loader */
    .loader-bar {
      width: 200px;
      height: 4px;
      background: rgba(102, 126, 234, 0.2);
      border-radius: 2px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: var(--primary-color, #667eea);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    /* Message */
    .loader-message {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      text-align: center;
      margin-top: 4px;
    }

    /* Size variants */
    .simple-loader.small {
      padding: 8px;
    }

    .simple-loader.small .loader-dots .dot {
      width: 6px;
      height: 6px;
    }

    .simple-loader.small .loader-spinner {
      width: 16px;
      height: 16px;
    }

    .simple-loader.small .loader-bar {
      width: 120px;
      height: 3px;
    }

    .simple-loader.large {
      padding: 24px;
    }

    .simple-loader.large .loader-dots .dot {
      width: 12px;
      height: 12px;
    }

    .simple-loader.large .loader-spinner {
      width: 32px;
      height: 32px;
    }

    .simple-loader.large .loader-bar {
      width: 300px;
      height: 6px;
    }
  `]
})
export class SimpleLoaderComponent {
  @Input() type: 'dots' | 'spinner' | 'bar' = 'dots';
  @Input() message?: string;
  @Input() progress: number = 0;
  @Input() size: 'small' | 'normal' | 'large' = 'normal';
}
