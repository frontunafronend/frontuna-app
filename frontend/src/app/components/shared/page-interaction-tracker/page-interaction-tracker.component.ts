import { Component, OnInit, OnDestroy, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, filter, throttleTime, debounceTime } from 'rxjs/operators';

import { AnalyticsService } from '@app/services/analytics/analytics.service';

@Component({
  selector: 'app-page-interaction-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `<!-- This component has no visual output -->`,
  styles: []
})
export class PageInteractionTrackerComponent implements OnInit, OnDestroy {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // Configuration inputs
  public readonly trackClicks = input<boolean>(true);
  public readonly trackScrolling = input<boolean>(true);
  public readonly trackFormInteractions = input<boolean>(true);
  public readonly trackHovers = input<boolean>(false);
  public readonly trackKeyboardEvents = input<boolean>(false);

  // Tracking state
  private pageStartTime = Date.now();
  private scrollDepth = 0;
  private maxScrollDepth = 0;
  private clickCount = 0;
  private formInteractions = 0;

  ngOnInit(): void {
    this.setupRouterTracking();
    
    if (this.trackClicks()) {
      this.setupClickTracking();
    }
    
    if (this.trackScrolling()) {
      this.setupScrollTracking();
    }
    
    if (this.trackFormInteractions()) {
      this.setupFormTracking();
    }
    
    if (this.trackHovers()) {
      this.setupHoverTracking();
    }
    
    if (this.trackKeyboardEvents()) {
      this.setupKeyboardTracking();
    }

    this.setupVisibilityTracking();
    console.log('📊 Page Interaction Tracker: Initialized');
  }

  ngOnDestroy(): void {
    // Track page exit metrics
    this.trackPageExit();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupRouterTracking(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        const navEvent = event as NavigationEnd;
        // Track page exit for previous page
        this.trackPageExit();
        
        // Reset metrics for new page
        this.resetPageMetrics();
        
        // Track new page view
        this.analyticsService.trackPageView(navEvent.url, document.title);
      });
  }

  private setupClickTracking(): void {
    fromEvent<MouseEvent>(document, 'click')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.clickCount++;
        
        const target = event.target as HTMLElement;
        const elementInfo = this.getElementInfo(target);
        
        this.analyticsService.trackEvent(
          'button_clicked',
          'interaction',
          'click',
          elementInfo.selector,
          undefined,
          {
            elementType: elementInfo.type,
            elementText: elementInfo.text,
            elementId: elementInfo.id,
            elementClass: elementInfo.className,
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now(),
            clickCount: this.clickCount
          }
        );
      });
  }

  private setupScrollTracking(): void {
    fromEvent(window, 'scroll')
      .pipe(
        throttleTime(250),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        this.scrollDepth = Math.round((scrollTop + windowHeight) / documentHeight * 100);
        this.maxScrollDepth = Math.max(this.maxScrollDepth, this.scrollDepth);
        
        // Track milestone scroll depths
        if (this.scrollDepth >= 25 && this.scrollDepth < 50) {
          this.trackScrollMilestone(25);
        } else if (this.scrollDepth >= 50 && this.scrollDepth < 75) {
          this.trackScrollMilestone(50);
        } else if (this.scrollDepth >= 75 && this.scrollDepth < 90) {
          this.trackScrollMilestone(75);
        } else if (this.scrollDepth >= 90) {
          this.trackScrollMilestone(90);
        }
      });
  }

  private setupFormTracking(): void {
    // Track form field interactions
    fromEvent<Event>(document, 'focusin')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        const target = event.target as HTMLElement;
        if (this.isFormElement(target)) {
          this.formInteractions++;
          
          this.analyticsService.trackEvent(
            'feature_used',
            'form',
            'field_focus',
            target.tagName.toLowerCase(),
            undefined,
            {
              fieldType: (target as HTMLInputElement).type || target.tagName.toLowerCase(),
              fieldName: (target as HTMLInputElement).name,
              fieldId: target.id,
              formInteractions: this.formInteractions
            }
          );
        }
      });

    // Track form submissions
    fromEvent<Event>(document, 'submit')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        // Count form fields manually since FormData.keys() might not be available in all TypeScript versions
        const fieldCount = form.elements.length;
        
        this.analyticsService.trackEvent(
          'form_submitted',
          'form',
          'submit',
          form.id || form.className || 'unknown',
          fieldCount,
          {
            formId: form.id,
            formClass: form.className,
            fieldCount,
            formAction: form.action,
            formMethod: form.method
          }
        );
      });
  }

  private setupHoverTracking(): void {
    fromEvent<MouseEvent>(document, 'mouseover')
      .pipe(
        throttleTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        const target = event.target as HTMLElement;
        
        // Only track hovers on interactive elements
        if (this.isInteractiveElement(target)) {
          const elementInfo = this.getElementInfo(target);
          
          this.analyticsService.trackEvent(
            'feature_used',
            'interaction',
            'hover',
            elementInfo.selector,
            undefined,
            {
              elementType: elementInfo.type,
              elementText: elementInfo.text,
              elementId: elementInfo.id
            }
          );
        }
      });
  }

  private setupKeyboardTracking(): void {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        // Track important keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
          this.analyticsService.trackEvent(
            'feature_used',
            'keyboard',
            'shortcut',
            `${event.ctrlKey ? 'ctrl' : 'cmd'}+${event.key}`,
            undefined,
            {
              key: event.key,
              code: event.code,
              ctrlKey: event.ctrlKey,
              metaKey: event.metaKey,
              shiftKey: event.shiftKey,
              altKey: event.altKey
            }
          );
        }
      });
  }

  private setupVisibilityTracking(): void {
    fromEvent(document, 'visibilitychange')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (document.hidden) {
          this.analyticsService.trackEvent(
            'feature_used',
            'page',
            'hidden',
            window.location.pathname,
            Date.now() - this.pageStartTime
          );
        } else {
          this.analyticsService.trackEvent(
            'feature_used',
            'page',
            'visible',
            window.location.pathname
          );
          this.pageStartTime = Date.now(); // Reset timer when page becomes visible again
        }
      });
  }

  private trackScrollMilestone(depth: number): void {
    this.analyticsService.trackEvent(
      'feature_used',
      'scroll',
      'milestone',
      `${depth}%`,
      depth,
      {
        scrollDepth: depth,
        timeToScroll: Date.now() - this.pageStartTime,
        pageUrl: window.location.pathname
      }
    );
  }

  private trackPageExit(): void {
    const timeOnPage = Date.now() - this.pageStartTime;
    
    this.analyticsService.trackEvent(
      'feature_used',
      'page',
      'exit',
      window.location.pathname,
      timeOnPage,
      {
        timeOnPage,
        maxScrollDepth: this.maxScrollDepth,
        clickCount: this.clickCount,
        formInteractions: this.formInteractions,
        pageUrl: window.location.pathname
      }
    );
  }

  private resetPageMetrics(): void {
    this.pageStartTime = Date.now();
    this.scrollDepth = 0;
    this.maxScrollDepth = 0;
    this.clickCount = 0;
    this.formInteractions = 0;
  }

  private getElementInfo(element: HTMLElement) {
    return {
      type: element.tagName.toLowerCase(),
      text: element.textContent?.trim().substring(0, 100) || '',
      id: element.id,
      className: element.className,
      selector: this.getElementSelector(element)
    };
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        return `.${classes[0]}`;
      }
    }
    
    return element.tagName.toLowerCase();
  }

  private isFormElement(element: HTMLElement): boolean {
    const formElements = ['input', 'textarea', 'select', 'button'];
    return formElements.includes(element.tagName.toLowerCase());
  }

  private isInteractiveElement(element: HTMLElement): boolean {
    const interactiveElements = ['button', 'a', 'input', 'select', 'textarea'];
    const hasClickHandler = element.onclick !== null;
    const hasRole = element.getAttribute('role') === 'button';
    
    return interactiveElements.includes(element.tagName.toLowerCase()) || 
           hasClickHandler || 
           hasRole ||
           element.classList.contains('clickable') ||
           element.classList.contains('interactive');
  }
}