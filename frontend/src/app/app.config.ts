import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';

// Material modules
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Third party modules
import { provideLottieOptions } from 'ngx-lottie';
import { provideToastr } from 'ngx-toastr';

// import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// App modules
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { environment } from '../environments/environment';
import { AuthService } from './services/auth/auth.service';

// AI Services
import { AICopilotService } from './services/ai/ai-copilot.service';
import { AICodeGeneratorService } from './services/ai/ai-code-generator.service';
import { AICopilotStateService } from './services/ai/ai-copilot-state.service';

// SEO Service
import { SeoService } from './services/seo/seo.service';
import { GoogleAnalyticsService } from './services/analytics/google-analytics.service';

// Lottie player factory
export function playerFactory() {
  return import('lottie-web');
}

// Auth initialization factory
export function initializeAuth(authService: AuthService) {
  return () => authService.initializeForApp();
}

// SEO initialization factory
export function initializeSeo(seoService: SeoService) {
  return () => {
    // SEO service will automatically start listening to router events
    console.log('🔍 SEO Service initialized');
    return Promise.resolve();
  };
}

export function initializeAnalytics(analyticsService: GoogleAnalyticsService) {
  return () => {
    // Analytics service will auto-initialize in constructor
    console.log('🔍 Analytics: Initialization function called');
    return Promise.resolve();
  };
}



export const appConfig: ApplicationConfig = {
  providers: [
    // Auth Service
    AuthService,
    
    // AI Services
    AICopilotService,
    AICodeGeneratorService,
    AICopilotStateService,
    
    // SEO Service
    SeoService,
    
    // Analytics Service
    GoogleAnalyticsService,
    
    // App Initializer for Authentication
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    },
    
    // App Initializer for SEO
    {
      provide: APP_INITIALIZER,
      useFactory: initializeSeo,
      deps: [SeoService],
      multi: true
    },
    
    // App Initializer for Analytics
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAnalytics,
      deps: [GoogleAnalyticsService],
      multi: true
    },
    
    // Router
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    
    // HTTP Client with interceptors
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loadingInterceptor,
        errorInterceptor
      ])
    ),
    
    // Animations
    provideAnimations(),
    
    // Service Worker
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    
    // Angular Material
    importProvidersFrom(
      MatSnackBarModule,
      MatDialogModule,
      MatProgressSpinnerModule
    ),
    
    // Charts
    // provideCharts(withDefaultRegisterables()),
    
    // Toastr notifications
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      progressBar: true,
      progressAnimation: 'increasing',
      newestOnTop: true,
      maxOpened: 3,
      autoDismiss: true,
      closeButton: true,
      tapToDismiss: true
    }),
    
    // Lottie animations
    provideLottieOptions({
      player: playerFactory
    }),
    

  ]
};