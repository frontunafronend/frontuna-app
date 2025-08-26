import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '@app/services/auth/auth.service';

import { SeoService } from '@app/services/seo/seo.service';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  
  private currentRoute = signal('');
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);

  // Reactive state
  public readonly showScrollTop = signal(false);

  title = 'Frontuna.ai';

  ngOnInit(): void {
    // Set initial route
    this.currentRoute.set(this.router.url);
    
    // Track route changes to determine header visibility
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute.set(event.url);
      }
    });
    
    // Initialize SEO defaults
    this.seoService.setDefaultMetaTags();

    // Initialize Google Analytics
    this.analyticsService.initialize();

    // Track scroll position for scroll-to-top button
    this.updateScrollTopVisibility();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    this.updateScrollTopVisibility();
  }

  /**
   * Scroll to top of page
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    this.analyticsService.trackEvent({
      action: 'scroll_to_top',
      category: 'navigation'
    });
  }

  /**
   * Update scroll-to-top button visibility
   */
  private updateScrollTopVisibility(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showScrollTop.set(scrollPosition > 300);
  }

  /**
   * Determine if header should be shown based on route and auth state
   * Header is always shown for authenticated users and on public routes
   */
  shouldShowHeader(): boolean {
    const route = this.currentRoute();
    const isAuthenticated = !!this.authService.currentUser();
    
    // Always show header for authenticated users (they need access to navigation)
    if (isAuthenticated) {
      // Only hide on auth pages when already authenticated (prevent going back)
      if (route.startsWith('/auth/') || route === '/auth') {
        return false;
      }
      return true;
    }
    
    // Show header on public routes when not authenticated
    return true;
  }

  /**
   * Get current timestamp for frontend connection test
   */
  getCurrentTimestamp(): string {
    return new Date().toLocaleString();
  }
}