import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { NotificationService } from '../notification/notification.service';

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  page?: {
    url: string;
    title: string;
    referrer?: string;
  };
  user?: {
    id?: string;
    type: 'anonymous' | 'authenticated';
    plan?: string;
  };
  device?: {
    userAgent: string;
    screen: {
      width: number;
      height: number;
    };
    viewport: {
      width: number;
      height: number;
    };
  };
}

export type AnalyticsEventType = 
  | 'page_view'
  | 'component_generated'
  | 'component_exported'
  | 'component_saved'
  | 'ai_prompt_sent'
  | 'ai_suggestion_applied'
  | 'plugin_installed'
  | 'plugin_used'
  | 'scaffold_generated'
  | 'gallery_component_viewed'
  | 'gallery_component_remixed'
  | 'user_signup'
  | 'user_login'
  | 'subscription_upgraded'
  | 'error_occurred'
  | 'feature_used'
  | 'button_clicked'
  | 'form_submitted'
  | 'search_performed'
  | 'filter_applied';

export interface AnalyticsMetrics {
  totalEvents: number;
  uniqueUsers: number;
  sessionsToday: number;
  componentsGenerated: number;
  componentsExported: number;
  aiPromptsProcessed: number;
  topFeatures: FeatureUsage[];
  userEngagement: {
    averageSessionDuration: number;
    bounceRate: number;
    pagesPerSession: number;
  };
  conversionFunnels: ConversionFunnel[];
}

export interface FeatureUsage {
  feature: string;
  category: string;
  usageCount: number;
  uniqueUsers: number;
  lastUsed: Date;
  growthRate: number; // percentage
}

export interface ConversionFunnel {
  name: string;
  steps: ConversionStep[];
  overallConversionRate: number;
}

export interface ConversionStep {
  name: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface UserJourney {
  userId: string;
  sessionId: string;
  events: AnalyticsEvent[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pages: string[];
  actions: string[];
  outcome?: 'converted' | 'abandoned' | 'ongoing';
}

export interface AnalyticsConfig {
  trackPageViews: boolean;
  trackUserInteractions: boolean;
  trackErrors: boolean;
  trackPerformance: boolean;
  enableHeatmaps: boolean;
  enableSessionRecording: boolean;
  samplingRate: number; // 0-1
  excludeUrls: string[];
  customDimensions: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly baseUrl = `${environment.apiUrl}/analytics`;

  // State management
  private readonly eventsSubject = new BehaviorSubject<AnalyticsEvent[]>([]);
  private readonly metricsSubject = new BehaviorSubject<AnalyticsMetrics | null>(null);
  private readonly configSubject = new BehaviorSubject<AnalyticsConfig>(this.getDefaultConfig());

  // Public observables
  public readonly events$ = this.eventsSubject.asObservable();
  public readonly metrics$ = this.metricsSubject.asObservable();
  public readonly config$ = this.configSubject.asObservable();

  // Session tracking
  private sessionId: string = this.generateSessionId();
  private sessionStartTime: Date = new Date();
  private pageStartTime: Date = new Date();
  private eventQueue: AnalyticsEvent[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeAnalytics();
  }

  /**
   * Initialize analytics system
   */
  private initializeAnalytics(): void {
    if (this.isInitialized) return;

    console.log('📊 Analytics: Initializing analytics system...');

    // Set up session tracking
    this.setupSessionTracking();

    // Set up automatic page view tracking
    if (this.configSubject.value.trackPageViews) {
      this.setupPageViewTracking();
    }

    // Set up error tracking
    if (this.configSubject.value.trackErrors) {
      this.setupErrorTracking();
    }

    // Set up performance tracking
    if (this.configSubject.value.trackPerformance) {
      this.setupPerformanceTracking();
    }

    // Start batch processing
    this.startBatchProcessing();

    this.isInitialized = true;
    console.log('✅ Analytics: System initialized');
  }

  /**
   * Track an analytics event
   */
  trackEvent(
    type: AnalyticsEventType,
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ): void {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type,
      category,
      action,
      label,
      value,
      sessionId: this.sessionId,
      timestamp: new Date(),
      metadata,
      page: this.getCurrentPageInfo(),
      user: this.getCurrentUserInfo(),
      device: this.getDeviceInfo()
    };

    console.log('📊 Analytics: Tracking event:', event);

    // Add to queue for batch processing
    this.eventQueue.push(event);

    // Update local state
    const currentEvents = this.eventsSubject.value;
    this.eventsSubject.next([...currentEvents, event]);

    // Send immediately for critical events
    if (this.isCriticalEvent(type)) {
      this.sendEventImmediately(event);
    }
  }

  /**
   * Track page view
   */
  trackPageView(url: string, title: string, referrer?: string): void {
    this.trackEvent('page_view', 'navigation', 'page_view', url, undefined, {
      url,
      title,
      referrer,
      timeOnPreviousPage: Date.now() - this.pageStartTime.getTime()
    });

    this.pageStartTime = new Date();
  }

  /**
   * Track component generation
   */
  trackComponentGeneration(
    componentType: string,
    framework: string,
    aiUsed: boolean = false,
    generationTime?: number
  ): void {
    this.trackEvent('component_generated', 'component', 'generate', componentType, generationTime, {
      framework,
      aiUsed,
      generationTime
    });
  }

  /**
   * Track component export
   */
  trackComponentExport(
    exportFormat: string,
    componentCount: number,
    exportSize?: number
  ): void {
    this.trackEvent('component_exported', 'component', 'export', exportFormat, componentCount, {
      exportFormat,
      componentCount,
      exportSize
    });
  }

  /**
   * Track AI interaction
   */
  trackAIInteraction(
    action: 'prompt_sent' | 'suggestion_applied' | 'code_generated',
    promptType?: string,
    responseTime?: number
  ): void {
    this.trackEvent(
      action === 'prompt_sent' ? 'ai_prompt_sent' : 'ai_suggestion_applied',
      'ai',
      action,
      promptType,
      responseTime,
      { promptType, responseTime }
    );
  }

  /**
   * Track user journey
   */
  trackUserJourney(action: string, step: string, metadata?: Record<string, any>): void {
    this.trackEvent('feature_used', 'user_journey', action, step, undefined, {
      step,
      ...metadata
    });
  }

  /**
   * Track error
   */
  trackError(
    error: Error | string,
    context?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' ? error.stack : undefined;

    this.trackEvent('error_occurred', 'error', 'exception', context, undefined, {
      errorMessage,
      errorStack,
      severity,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  /**
   * Get analytics metrics
   */
  getMetrics(dateRange?: { start: Date; end: Date }): Observable<AnalyticsMetrics> {
    console.log('📊 Analytics: Fetching metrics...', dateRange);

    const params: { [key: string]: string } = {};
    if (dateRange) {
      params['start'] = dateRange.start.toISOString();
      params['end'] = dateRange.end.toISOString();
    }

    return this.http.get<AnalyticsMetrics>(`${this.baseUrl}/metrics`, { params })
      .pipe(
        tap(metrics => {
          this.metricsSubject.next(metrics);
        }),
        catchError(error => {
          console.error('❌ Analytics: Failed to fetch metrics:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get user journey
   */
  getUserJourney(userId: string, sessionId?: string): Observable<UserJourney[]> {

    const params: { [key: string]: string } = {};
    if (sessionId) {
      params['sessionId'] = sessionId;
    }
    return this.http.get<UserJourney[]>(`${this.baseUrl}/journey/${userId}`, { params });
  }

  /**
   * Get feature usage analytics
   */
  getFeatureUsage(timeframe: 'day' | 'week' | 'month' | 'year' = 'week'): Observable<FeatureUsage[]> {

    return this.http.get<FeatureUsage[]>(`${this.baseUrl}/features`, { 
      params: { timeframe } 
    });
  }

  /**
   * Update analytics configuration
   */
  updateConfig(config: Partial<AnalyticsConfig>): void {
    const currentConfig = this.configSubject.value;
    const newConfig = { ...currentConfig, ...config };
    this.configSubject.next(newConfig);
    
    console.log('📊 Analytics: Configuration updated:', newConfig);
  }

  /**
   * Clear analytics data
   */
  clearData(): void {
    this.eventsSubject.next([]);
    this.eventQueue = [];
    console.log('📊 Analytics: Data cleared');
  }

  /**
   * Export analytics data
   */
  exportData(format: 'json' | 'csv' = 'json'): Observable<Blob> {

    return this.http.get(`${this.baseUrl}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }

  // Private helper methods

  private setupSessionTracking(): void {
    // Track session start
    this.trackEvent('feature_used', 'session', 'start');

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('feature_used', 'session', 'end', undefined, 
        Date.now() - this.sessionStartTime.getTime());
      this.flushEventQueue();
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('feature_used', 'session', 'hidden');
      } else {
        this.trackEvent('feature_used', 'session', 'visible');
      }
    });
  }

  private setupPageViewTracking(): void {
    // Track initial page view
    this.trackPageView(window.location.pathname, document.title);

    // Track navigation (for SPAs)
    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname, document.title);
    });
  }

  private setupErrorTracking(): void {
    window.addEventListener('error', (event) => {
      this.trackError(event.error || event.message, 'global_error_handler', 'high');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason, 'unhandled_promise_rejection', 'high');
    });
  }

  private setupPerformanceTracking(): void {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          this.trackEvent('feature_used', 'performance', 'page_load', undefined, 
            perfData.loadEventEnd - perfData.fetchStart, {
              dns: perfData.domainLookupEnd - perfData.domainLookupStart,
              tcp: perfData.connectEnd - perfData.connectStart,
              request: perfData.responseStart - perfData.requestStart,
              response: perfData.responseEnd - perfData.responseStart,
              dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
              load: perfData.loadEventEnd - perfData.loadEventStart
            });
        }
      }, 0);
    });
  }

  private startBatchProcessing(): void {
    setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushEventQueue();
      }
    }, 30000); // Send batch every 30 seconds
  }

  private flushEventQueue(): void {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    this.http.post(`${this.baseUrl}/batch`, { events: eventsToSend })
      .pipe(
        catchError(error => {
          // Silently handle analytics errors - don't break the app
          console.warn('⚠️ Analytics: Batch failed (backend endpoint may not exist):', error.message);
          // Re-queue events for retry
          this.eventQueue.unshift(...eventsToSend);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            console.log('📊 Analytics: Batch sent successfully');
          }
        }
      });
  }

  private sendEventImmediately(event: AnalyticsEvent): void {

    this.http.post(`${this.baseUrl}/event`, event)
      .pipe(
        catchError(error => {
          // Silently handle analytics errors - don't break the app
          console.warn('⚠️ Analytics: Event failed (backend endpoint may not exist):', error.message);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            console.log('📊 Analytics: Critical event sent');
          }
        }
      });
  }

  private isCriticalEvent(type: AnalyticsEventType): boolean {
    return ['error_occurred', 'user_signup', 'subscription_upgraded'].includes(type);
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private generateEventId(): string {
    return 'event_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private getCurrentPageInfo() {
    return {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer
    };
  }

  private getCurrentUserInfo() {
    // This would typically get user info from auth service
    return {
      type: 'anonymous' as const // or 'authenticated'
    };
  }

  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  private getDefaultConfig(): AnalyticsConfig {
    return {
      trackPageViews: true,
      trackUserInteractions: true,
      trackErrors: true,
      trackPerformance: true,
      enableHeatmaps: false,
      enableSessionRecording: false,
      samplingRate: 1.0,
      excludeUrls: ['/admin', '/debug'],
      customDimensions: {}
    };
  }

  // Mock implementations for development
  private mockGetMetrics(dateRange?: { start: Date; end: Date }): Observable<AnalyticsMetrics> {
    const mockMetrics: AnalyticsMetrics = {
      totalEvents: 15847,
      uniqueUsers: 2341,
      sessionsToday: 456,
      componentsGenerated: 1234,
      componentsExported: 567,
      aiPromptsProcessed: 890,
      topFeatures: [
        {
          feature: 'AI Component Generation',
          category: 'ai',
          usageCount: 1234,
          uniqueUsers: 890,
          lastUsed: new Date(),
          growthRate: 15.3
        },
        {
          feature: 'Component Export',
          category: 'export',
          usageCount: 567,
          uniqueUsers: 432,
          lastUsed: new Date(),
          growthRate: 8.7
        },
        {
          feature: 'Gallery Browse',
          category: 'gallery',
          usageCount: 789,
          uniqueUsers: 654,
          lastUsed: new Date(),
          growthRate: 12.1
        }
      ],
      userEngagement: {
        averageSessionDuration: 342000, // 5.7 minutes in ms
        bounceRate: 0.23,
        pagesPerSession: 4.2
      },
      conversionFunnels: [
        {
          name: 'Component Creation Flow',
          overallConversionRate: 0.68,
          steps: [
            { name: 'Landing Page', users: 1000, conversionRate: 1.0, dropoffRate: 0.0 },
            { name: 'AI Prompt', users: 850, conversionRate: 0.85, dropoffRate: 0.15 },
            { name: 'Generate Component', users: 720, conversionRate: 0.85, dropoffRate: 0.15 },
            { name: 'Save/Export', users: 680, conversionRate: 0.94, dropoffRate: 0.06 }
          ]
        }
      ]
    };

    return of(mockMetrics).pipe(delay(800));
  }

  private mockGetUserJourney(userId: string, sessionId?: string): Observable<UserJourney[]> {
    const mockJourney: UserJourney = {
      userId,
      sessionId: sessionId || this.sessionId,
      startTime: new Date(Date.now() - 1800000), // 30 minutes ago
      endTime: new Date(),
      duration: 1800000,
      pages: ['/dashboard', '/dashboard/ai-copilot', '/dashboard/gallery'],
      actions: ['page_view', 'ai_prompt_sent', 'component_generated', 'component_saved'],
      outcome: 'converted',
      events: [] // Would contain detailed events
    };

    return of([mockJourney]).pipe(delay(600));
  }

  private mockGetFeatureUsage(timeframe: string): Observable<FeatureUsage[]> {
    const mockFeatures: FeatureUsage[] = [
      {
        feature: 'AI Copilot',
        category: 'ai',
        usageCount: 1456,
        uniqueUsers: 892,
        lastUsed: new Date(),
        growthRate: 18.5
      },
      {
        feature: 'Component Gallery',
        category: 'gallery',
        usageCount: 1123,
        uniqueUsers: 743,
        lastUsed: new Date(),
        growthRate: 14.2
      },
      {
        feature: 'Export to CodeSandbox',
        category: 'export',
        usageCount: 567,
        uniqueUsers: 432,
        lastUsed: new Date(),
        growthRate: 9.8
      }
    ];

    return of(mockFeatures).pipe(delay(500));
  }

  private mockExportData(format: string): Observable<Blob> {
    const data = JSON.stringify({
      events: this.eventsSubject.value,
      metrics: this.metricsSubject.value,
      exportedAt: new Date().toISOString()
    });

    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });

    return of(blob).pipe(delay(1000));
  }
}