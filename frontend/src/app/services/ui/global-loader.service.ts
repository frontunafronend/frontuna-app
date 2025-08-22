import { Injectable, signal, computed, ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject } from '@angular/core';
import { ProfessionalLoaderComponent } from '@app/components/ui/professional-loader/professional-loader.component';

export interface LoaderConfig {
  type: 'thinking' | 'generating' | 'processing' | 'pulse';
  message?: string;
  subMessage?: string;
  size?: 'small' | 'normal' | 'large';
  showProgress?: boolean;
  progress?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalLoaderService {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  // Loading state signals
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly loadingConfigSignal = signal<LoaderConfig | null>(null);
  private readonly loadingMessageSignal = signal<string>('');

  // Public computed values
  public readonly isLoading = computed(() => this.isLoadingSignal());
  public readonly loadingConfig = computed(() => this.loadingConfigSignal());
  public readonly loadingMessage = computed(() => this.loadingMessageSignal());

  // Component references for overlay
  private loaderComponentRef: ComponentRef<ProfessionalLoaderComponent> | null = null;
  private overlayElement: HTMLElement | null = null;

  /**
   * Show global loader with configuration
   */
  show(config: LoaderConfig): void {
    this.isLoadingSignal.set(true);
    this.loadingConfigSignal.set(config);
    this.loadingMessageSignal.set(config.message || 'Loading...');
    this.createLoaderOverlay(config);
  }

  /**
   * Show thinking loader (for AI processing)
   */
  showThinking(message: string = 'AI is thinking', subMessage?: string): void {
    this.show({
      type: 'thinking',
      message,
      subMessage,
      size: 'normal'
    });
  }

  /**
   * Show generating loader (for code generation)
   */
  showGenerating(message: string = 'Generating code', showProgress: boolean = false, progress?: number): void {
    this.show({
      type: 'generating',
      message,
      size: 'normal',
      showProgress,
      progress
    });
  }

  /**
   * Show processing loader (for general processing)
   */
  showProcessing(message: string = 'Processing request', subMessage?: string): void {
    this.show({
      type: 'processing',
      message,
      subMessage,
      size: 'normal'
    });
  }

  /**
   * Show pulse loader (for simple loading)
   */
  showPulse(message: string = 'Loading'): void {
    this.show({
      type: 'pulse',
      message,
      size: 'normal'
    });
  }

  /**
   * Update loader progress (for generating type)
   */
  updateProgress(progress: number): void {
    const currentConfig = this.loadingConfigSignal();
    if (currentConfig && currentConfig.type === 'generating') {
      this.loadingConfigSignal.set({
        ...currentConfig,
        progress,
        showProgress: true
      });
      
      if (this.loaderComponentRef) {
        this.loaderComponentRef.instance.progress = progress;
        this.loaderComponentRef.instance.showProgress = true;
      }
    }
  }

  /**
   * Update loader message
   */
  updateMessage(message: string, subMessage?: string): void {
    const currentConfig = this.loadingConfigSignal();
    if (currentConfig) {
      this.loadingConfigSignal.set({
        ...currentConfig,
        message,
        subMessage
      });
      this.loadingMessageSignal.set(message);
      
      if (this.loaderComponentRef) {
        this.loaderComponentRef.instance.message = message;
        if (subMessage !== undefined) {
          this.loaderComponentRef.instance.subMessage = subMessage;
        }
      }
    }
  }

  /**
   * Hide global loader
   */
  hide(): void {
    this.isLoadingSignal.set(false);
    this.loadingConfigSignal.set(null);
    this.loadingMessageSignal.set('');
    this.removeLoaderOverlay();
  }

  /**
   * Create the loader overlay
   */
  private createLoaderOverlay(config: LoaderConfig): void {
    // Remove existing overlay if present
    this.removeLoaderOverlay();

    // Create overlay element
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'global-loader-overlay';
    this.overlayElement.innerHTML = `
      <style>
        .global-loader-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .global-loader-container {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          max-width: 400px;
          width: 90%;
          margin: 20px;
        }
        
        @media (prefers-color-scheme: dark) {
          .global-loader-container {
            background: #2d2d2d;
            color: white;
          }
        }
      </style>
    `;

    // Create container for the loader component
    const containerElement = document.createElement('div');
    containerElement.className = 'global-loader-container';
    this.overlayElement.appendChild(containerElement);

    // Create the loader component
    this.loaderComponentRef = createComponent(ProfessionalLoaderComponent, {
      environmentInjector: this.environmentInjector
    });

    // Set component inputs
    this.loaderComponentRef.instance.type = config.type;
    this.loaderComponentRef.instance.message = config.message;
    this.loaderComponentRef.instance.subMessage = config.subMessage;
    this.loaderComponentRef.instance.size = config.size || 'normal';
    this.loaderComponentRef.instance.showProgress = config.showProgress || false;
    this.loaderComponentRef.instance.progress = config.progress;

    // Append component to container
    containerElement.appendChild(this.loaderComponentRef.location.nativeElement);

    // Attach to application
    this.appRef.attachView(this.loaderComponentRef.hostView);

    // Add to DOM
    document.body.appendChild(this.overlayElement);

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
  }

  /**
   * Remove the loader overlay
   */
  private removeLoaderOverlay(): void {
    if (this.overlayElement) {
      document.body.removeChild(this.overlayElement);
      this.overlayElement = null;
    }

    if (this.loaderComponentRef) {
      this.appRef.detachView(this.loaderComponentRef.hostView);
      this.loaderComponentRef.destroy();
      this.loaderComponentRef = null;
    }

    // Restore body scrolling
    document.body.style.overflow = '';
  }

  /**
   * Show loader for a specific duration
   */
  showForDuration(config: LoaderConfig, duration: number): Promise<void> {
    return new Promise((resolve) => {
      this.show(config);
      setTimeout(() => {
        this.hide();
        resolve();
      }, duration);
    });
  }

  /**
   * Show loader while executing a promise
   */
  async showWhile<T>(config: LoaderConfig, promise: Promise<T>): Promise<T> {
    this.show(config);
    try {
      const result = await promise;
      this.hide();
      return result;
    } catch (error) {
      this.hide();
      throw error;
    }
  }

  /**
   * Utility method to show different loaders for common operations
   */
  forOperation(operation: 'signup' | 'login' | 'generating' | 'processing' | 'saving' | 'loading'): LoaderConfig {
    const configs: Record<string, LoaderConfig> = {
      signup: {
        type: 'processing',
        message: 'Creating your account...',
        subMessage: 'Please wait while we set up your workspace',
        size: 'normal'
      },
      login: {
        type: 'processing',
        message: 'Signing you in...',
        subMessage: 'Verifying your credentials',
        size: 'normal'
      },
      generating: {
        type: 'generating',
        message: 'Generating code...',
        size: 'normal',
        showProgress: true
      },
      processing: {
        type: 'processing',
        message: 'Processing your request...',
        size: 'normal'
      },
      saving: {
        type: 'pulse',
        message: 'Saving changes...',
        size: 'normal'
      },
      loading: {
        type: 'pulse',
        message: 'Loading...',
        size: 'normal'
      }
    };
    
    return configs[operation] || configs['loading'];
  }
}
