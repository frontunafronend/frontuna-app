import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { GAEvent, GAPageView, GATransaction } from '@app/models/analytics.model';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {
  private readonly router = inject(Router);
  private isInitialized = false;

  constructor() {
    if (environment.googleAnalytics.enabled) {
      this.initializeRouteTracking();
    }
  }

  /**
   * Initialize Google Analytics
   */
  initialize(): void {
    if (!environment.googleAnalytics.enabled || !environment.googleAnalytics.trackingId) {
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${environment.googleAnalytics.trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    gtag = function() { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', environment.googleAnalytics.trackingId, {
      page_title: document.title,
      page_location: window.location.href
    });

    this.isInitialized = true;
  }

  /**
   * Track page view
   */
  trackPageView(pageData?: Partial<GAPageView>): void {
    if (!this.isInitialized) return;

    const defaultData: GAPageView = {
      page_title: document.title,
      page_location: window.location.href,
      page_referrer: document.referrer
    };

    const data = { ...defaultData, ...pageData };

    gtag('config', environment.googleAnalytics.trackingId, {
      page_title: data.page_title,
      page_location: data.page_location,
      page_referrer: data.page_referrer,
      user_id: data.user_id,
      custom_map: data.custom_parameters
    });
  }

  /**
   * Track custom event
   */
  trackEvent(event: GAEvent): void {
    if (!this.isInitialized) return;

    gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters
    });
  }

  /**
   * Track user login
   */
  trackLogin(method: string = 'email'): void {
    this.trackEvent({
      action: 'login',
      category: 'authentication',
      label: method
    });
  }

  /**
   * Track user signup
   */
  trackSignup(method: string = 'email'): void {
    this.trackEvent({
      action: 'sign_up',
      category: 'authentication',
      label: method
    });
  }

  /**
   * Track component generation
   */
  trackComponentGeneration(framework: string, category: string): void {
    this.trackEvent({
      action: 'generate_component',
      category: 'component_generator',
      label: `${framework}_${category}`,
      custom_parameters: {
        framework,
        component_category: category
      }
    });
  }

  /**
   * Track component save
   */
  trackComponentSave(componentId: string, framework: string): void {
    this.trackEvent({
      action: 'save_component',
      category: 'component_library',
      label: framework,
      custom_parameters: {
        component_id: componentId,
        framework
      }
    });
  }

  /**
   * Track component download
   */
  trackComponentDownload(componentId: string, format: string): void {
    this.trackEvent({
      action: 'download_component',
      category: 'component_library',
      label: format,
      custom_parameters: {
        component_id: componentId,
        download_format: format
      }
    });
  }

  /**
   * Track search
   */
  trackSearch(searchTerm: string, category: string = 'component_search'): void {
    this.trackEvent({
      action: 'search',
      category,
      label: searchTerm,
      custom_parameters: {
        search_term: searchTerm
      }
    });
  }

  /**
   * Track error
   */
  trackError(error: string, category: string = 'error'): void {
    this.trackEvent({
      action: 'exception',
      category,
      label: error,
      custom_parameters: {
        error_message: error,
        fatal: false
      }
    });
  }

  /**
   * Track timing (e.g., generation time)
   */
  trackTiming(category: string, variable: string, value: number, label?: string): void {
    this.trackEvent({
      action: 'timing_complete',
      category,
      label: label || variable,
      value,
      custom_parameters: {
        name: variable,
        value
      }
    });
  }

  /**
   * Track purchase/subscription
   */
  trackPurchase(transaction: GATransaction): void {
    if (!this.isInitialized) return;

    gtag('event', 'purchase', {
      transaction_id: transaction.transaction_id,
      value: transaction.value,
      currency: transaction.currency,
      items: transaction.items
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>): void {
    if (!this.isInitialized) return;

    gtag('config', environment.googleAnalytics.trackingId, {
      custom_map: properties
    });
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    if (!this.isInitialized) return;

    gtag('config', environment.googleAnalytics.trackingId, {
      user_id: userId
    });
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(percentage: number): void {
    this.trackEvent({
      action: 'scroll',
      category: 'engagement',
      label: `${percentage}%`,
      value: percentage
    });
  }

  /**
   * Track file download
   */
  trackFileDownload(fileName: string, fileType: string): void {
    this.trackEvent({
      action: 'file_download',
      category: 'downloads',
      label: fileType,
      custom_parameters: {
        file_name: fileName,
        file_extension: fileType
      }
    });
  }

  /**
   * Track video interaction
   */
  trackVideoPlay(videoTitle: string, duration?: number): void {
    this.trackEvent({
      action: 'video_play',
      category: 'video',
      label: videoTitle,
      value: duration
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmit(formName: string, success: boolean = true): void {
    this.trackEvent({
      action: success ? 'form_submit' : 'form_submit_fail',
      category: 'forms',
      label: formName,
      custom_parameters: {
        form_name: formName,
        success
      }
    });
  }

  /**
   * Initialize automatic route tracking
   */
  private initializeRouteTracking(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.trackPageView({
            page_location: window.location.origin + event.url
          });
        }
      });
  }
}