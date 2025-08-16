import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-professional-loader',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatIconModule],
  template: `
    <div class="professional-loader" [class]="'loader-' + type + ' loader-' + size">
      @if (type === 'thinking') {
        <div class="thinking-loader">
          <div class="brain-container">
            <mat-icon class="brain-icon">psychology</mat-icon>
            <div class="thinking-waves">
              <div class="wave wave-1"></div>
              <div class="wave wave-2"></div>
              <div class="wave wave-3"></div>
            </div>
          </div>
          <div class="thinking-text">
            <span class="thinking-message">{{ message || 'AI is thinking' }}</span>
            <span class="thinking-dots">
              <span class="dot">.</span>
              <span class="dot">.</span>
              <span class="dot">.</span>
            </span>
          </div>
        </div>
      }

      @if (type === 'generating') {
        <div class="generating-loader">
          <div class="code-container">
            <mat-icon class="code-icon">code</mat-icon>
            <div class="code-lines">
              <div class="code-line line-1"></div>
              <div class="code-line line-2"></div>
              <div class="code-line line-3"></div>
            </div>
          </div>
          <div class="generating-text">
            <span class="generating-message">{{ message || 'Generating code' }}</span>
            @if (showProgress && progress !== undefined) {
              <mat-progress-bar mode="determinate" [value]="progress" class="progress-bar"></mat-progress-bar>
            } @else {
              <mat-progress-bar mode="indeterminate" class="progress-bar"></mat-progress-bar>
            }
          </div>
        </div>
      }

      @if (type === 'processing') {
        <div class="processing-loader">
          <div class="spinner-container">
            <div class="modern-spinner">
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
              <mat-icon class="spinner-icon">smart_toy</mat-icon>
            </div>
          </div>
          <div class="processing-text">
            <span class="processing-message">{{ message || 'Processing request' }}</span>
            @if (subMessage) {
              <span class="sub-message">{{ subMessage }}</span>
            }
          </div>
        </div>
      }

      @if (type === 'pulse') {
        <div class="pulse-loader">
          <div class="pulse-container">
            <div class="pulse-dot main-dot"></div>
            <div class="pulse-ring ring-1"></div>
            <div class="pulse-ring ring-2"></div>
            <div class="pulse-ring ring-3"></div>
          </div>
          <div class="pulse-text">{{ message || 'Loading' }}</div>
        </div>
      }
    </div>
  `,
  styles: [`
    .professional-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, rgba(103, 126, 234, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%);
      border-radius: 12px;
      border: 1px solid rgba(103, 126, 234, 0.1);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    /* THINKING LOADER */
    .thinking-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .brain-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brain-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #667eea;
      z-index: 2;
      position: relative;
      animation: brain-pulse 2s ease-in-out infinite;
    }

    .thinking-waves {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .wave {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      border: 2px solid #667eea;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: wave-expand 2s ease-out infinite;
    }

    .wave-1 { animation-delay: 0s; }
    .wave-2 { animation-delay: 0.7s; }
    .wave-3 { animation-delay: 1.4s; }

    .thinking-text {
      text-align: center;
    }

    .thinking-message {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      display: block;
      margin-bottom: 4px;
    }

    .thinking-dots {
      display: inline-flex;
      gap: 2px;
    }

    .thinking-dots .dot {
      animation: thinking-bounce 1.4s ease-in-out infinite both;
      color: #667eea;
      font-weight: bold;
    }

    .thinking-dots .dot:nth-child(1) { animation-delay: -0.32s; }
    .thinking-dots .dot:nth-child(2) { animation-delay: -0.16s; }
    .thinking-dots .dot:nth-child(3) { animation-delay: 0s; }

    /* GENERATING LOADER */
    .generating-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .code-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .code-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #4caf50;
      z-index: 2;
      animation: code-glow 2s ease-in-out infinite;
    }

    .code-lines {
      position: absolute;
      left: 45px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .code-line {
      height: 2px;
      background: #4caf50;
      border-radius: 1px;
      animation: code-type 1.5s ease-in-out infinite;
    }

    .line-1 { width: 40px; animation-delay: 0s; }
    .line-2 { width: 30px; animation-delay: 0.3s; }
    .line-3 { width: 35px; animation-delay: 0.6s; }

    .generating-text {
      text-align: center;
      width: 200px;
    }

    .generating-message {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      display: block;
      margin-bottom: 8px;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      border-radius: 2px;
    }

    /* PROCESSING LOADER */
    .processing-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .spinner-container {
      position: relative;
      width: 60px;
      height: 60px;
    }

    .modern-spinner {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner-ring {
      position: absolute;
      border: 2px solid transparent;
      border-radius: 50%;
      animation: spin 2s linear infinite;
    }

    .spinner-ring:nth-child(1) {
      width: 60px;
      height: 60px;
      border-top-color: #667eea;
      animation-duration: 2s;
    }

    .spinner-ring:nth-child(2) {
      width: 45px;
      height: 45px;
      border-right-color: #4caf50;
      animation-duration: 1.5s;
      animation-direction: reverse;
    }

    .spinner-ring:nth-child(3) {
      width: 30px;
      height: 30px;
      border-bottom-color: #ff9800;
      animation-duration: 1s;
    }

    .spinner-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #666;
      z-index: 5;
    }

    .processing-text {
      text-align: center;
    }

    .processing-message {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      display: block;
    }

    .sub-message {
      font-size: 12px;
      color: #666;
      display: block;
      margin-top: 4px;
    }

    /* PULSE LOADER */
    .pulse-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .pulse-container {
      position: relative;
      width: 40px;
      height: 40px;
    }

    .pulse-dot {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 12px;
      height: 12px;
      background: #667eea;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse-beat 1.5s ease-in-out infinite;
    }

    .pulse-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      border: 2px solid #667eea;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse-expand 1.5s ease-out infinite;
    }

    .ring-1 {
      width: 20px;
      height: 20px;
      animation-delay: 0s;
    }

    .ring-2 {
      width: 30px;
      height: 30px;
      animation-delay: 0.5s;
    }

    .ring-3 {
      width: 40px;
      height: 40px;
      animation-delay: 1s;
    }

    .pulse-text {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    /* SIZE VARIANTS */
    .loader-small {
      padding: 16px;
    }

    .loader-small .brain-icon,
    .loader-small .code-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .loader-small .modern-spinner {
      width: 40px;
      height: 40px;
    }

    .loader-large {
      padding: 32px;
    }

    .loader-large .brain-icon,
    .loader-large .code-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    .loader-large .modern-spinner {
      width: 80px;
      height: 80px;
    }

    /* ANIMATIONS */
    @keyframes brain-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    @keyframes wave-expand {
      0% {
        width: 40px;
        height: 40px;
        opacity: 1;
      }
      100% {
        width: 80px;
        height: 80px;
        opacity: 0;
      }
    }

    @keyframes thinking-bounce {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1.2);
        opacity: 1;
      }
    }

    @keyframes code-glow {
      0%, 100% { 
        color: #4caf50;
        text-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
      }
      50% { 
        color: #66bb6a;
        text-shadow: 0 0 10px rgba(76, 175, 80, 0.6);
      }
    }

    @keyframes code-type {
      0% { width: 0; opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 0.7; }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes pulse-beat {
      0%, 100% { 
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
      50% { 
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 0.7;
      }
    }

    @keyframes pulse-expand {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(0.8);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(2);
      }
    }

    /* DARK MODE SUPPORT */
    @media (prefers-color-scheme: dark) {
      .professional-loader {
        background: linear-gradient(135deg, rgba(103, 126, 234, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%);
        border-color: rgba(103, 126, 234, 0.2);
      }

      .thinking-message,
      .generating-message,
      .processing-message,
      .pulse-text {
        color: #e0e0e0;
      }

      .sub-message {
        color: #b0b0b0;
      }
    }
  `]
})
export class ProfessionalLoaderComponent implements OnInit, OnDestroy {
  @Input() type: 'thinking' | 'generating' | 'processing' | 'pulse' = 'thinking';
  @Input() message?: string;
  @Input() subMessage?: string;
  @Input() size: 'small' | 'normal' | 'large' = 'normal';
  @Input() showProgress: boolean = false;
  @Input() progress?: number;

  ngOnInit() {
    // Auto-update progress for demo if not provided
    if (this.showProgress && this.progress === undefined) {
      this.simulateProgress();
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private simulateProgress() {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
      }
      this.progress = Math.min(currentProgress, 100);
    }, 500);
  }
}
