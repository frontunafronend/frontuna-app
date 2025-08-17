import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  constructor() {
    this.initializeRouterListener();
  }

  /**
   * Set page indexability by search engines
   * @param isIndexable - true to allow indexing, false to prevent indexing
   */
  setIndexable(isIndexable: boolean): void {
    // Remove existing robots meta tag if present
    const existingRobotsTag = this.document.querySelector('meta[name="robots"]');
    if (existingRobotsTag) {
      existingRobotsTag.remove();
    }

    // Add noindex meta tag if page should not be indexed
    if (!isIndexable) {
      const robotsTag = this.document.createElement('meta');
      robotsTag.name = 'robots';
      robotsTag.content = 'noindex,nofollow';
      this.document.head.appendChild(robotsTag);
    }

    console.log(`🤖 SEO: Page indexability set to ${isIndexable ? 'INDEXABLE' : 'NO-INDEX'}`);
  }

  /**
   * Initialize router listener to handle SEO settings on route changes
   */
  private initializeRouterListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.handleRouteChange(event.url);
        }
      });
  }

  /**
   * Handle route changes and apply SEO settings based on route data
   * @param url - Current route URL
   */
  private handleRouteChange(url: string): void {
    // Get the activated route data
    const route = this.router.routerState.root;
    let activatedRoute = route;
    
    // Find the deepest activated route
    while (activatedRoute.firstChild) {
      activatedRoute = activatedRoute.firstChild;
    }

    // Get seoIndex from route data
    const routeData = activatedRoute.snapshot.data;
    const seoIndex = routeData['seoIndex'];

    // Determine indexability
    let isIndexable: boolean;
    
    if (seoIndex !== undefined) {
      // Use explicit route setting
      isIndexable = seoIndex;
    } else {
      // Use environment default
      isIndexable = environment.seoIndexDefault ?? false;
    }

    // Apply SEO settings
    this.setIndexable(isIndexable);

    // Log for debugging
    console.log(`🔍 SEO Route: ${url} → ${isIndexable ? 'INDEXABLE' : 'NO-INDEX'}`, {
      routeData: routeData,
      seoIndex: seoIndex,
      defaultSetting: environment.seoIndexDefault,
      finalDecision: isIndexable
    });
  }

  /**
   * Manually set SEO for specific pages (useful for dynamic content)
   * @param isIndexable - Whether the page should be indexed
   * @param reason - Optional reason for logging
   */
  setPageIndexability(isIndexable: boolean, reason?: string): void {
    this.setIndexable(isIndexable);
    
    if (reason) {
      console.log(`🎯 SEO Manual Override: ${isIndexable ? 'INDEXABLE' : 'NO-INDEX'} - ${reason}`);
    }
  }

  /**
   * Get current indexability status
   * @returns true if page is indexable, false if no-index is set
   */
  isCurrentPageIndexable(): boolean {
    const robotsTag = this.document.querySelector('meta[name="robots"]');
    return !robotsTag || !robotsTag.getAttribute('content')?.includes('noindex');
  }

  // ===== LEGACY METHODS FOR BACKWARD COMPATIBILITY =====

  /**
   * Set page title
   * @param title - Page title
   */
  setTitle(title: string): void {
    this.titleService.setTitle(title);
    console.log(`📄 SEO: Title set to "${title}"`);
  }

  /**
   * Set page description
   * @param description - Page description
   */
  setDescription(description: string): void {
    this.metaService.updateTag({ name: 'description', content: description });
    console.log(`📝 SEO: Description set`);
  }

  /**
   * Set page keywords
   * @param keywords - Page keywords
   */
  setKeywords(keywords: string): void {
    this.metaService.updateTag({ name: 'keywords', content: keywords });
    console.log(`🏷️ SEO: Keywords set`);
  }

  /**
   * Set Open Graph tags
   * @param tags - Open Graph tags object
   */
  setOpenGraphTags(tags: { [key: string]: string }): void {
    Object.keys(tags).forEach(key => {
      this.metaService.updateTag({ property: `og:${key}`, content: tags[key] });
    });
    console.log(`📱 SEO: Open Graph tags set`, tags);
  }

  /**
   * Set comprehensive page SEO (legacy method)
   * @param seoData - SEO data object
   */
  setPageSeo(seoData: {
    title?: string;
    description?: string;
    keywords?: string;
    url?: string; // Added for backward compatibility
    image?: string; // Added for backward compatibility
    robots?: string; // Added for backward compatibility
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    canonical?: string;
    noIndex?: boolean;
  }): void {
    // Set title
    if (seoData.title) {
      this.setTitle(seoData.title);
    }

    // Set description
    if (seoData.description) {
      this.setDescription(seoData.description);
    }

    // Set keywords
    if (seoData.keywords) {
      this.setKeywords(seoData.keywords);
    }

    // Set Open Graph tags
    const ogTags: { [key: string]: string } = {};
    if (seoData.ogTitle) ogTags['title'] = seoData.ogTitle;
    if (seoData.ogDescription) ogTags['description'] = seoData.ogDescription;
    if (seoData.ogImage) ogTags['image'] = seoData.ogImage;
    if (seoData.ogUrl) ogTags['url'] = seoData.ogUrl;
    
    if (Object.keys(ogTags).length > 0) {
      this.setOpenGraphTags(ogTags);
    }

    // Set Twitter Card tags
    if (seoData.twitterCard) {
      this.metaService.updateTag({ name: 'twitter:card', content: seoData.twitterCard });
    }
    if (seoData.twitterTitle) {
      this.metaService.updateTag({ name: 'twitter:title', content: seoData.twitterTitle });
    }
    if (seoData.twitterDescription) {
      this.metaService.updateTag({ name: 'twitter:description', content: seoData.twitterDescription });
    }
    if (seoData.twitterImage) {
      this.metaService.updateTag({ name: 'twitter:image', content: seoData.twitterImage });
    }

    // Set canonical URL (from canonical or url property)
    if (seoData.canonical) {
      this.setCanonicalUrl(seoData.canonical);
    } else if (seoData.url) {
      this.setCanonicalUrl(seoData.url);
    }

    // Handle image property (map to ogImage)
    if (seoData.image && !seoData.ogImage) {
      this.setOpenGraphTags({ image: seoData.image });
    }

    // Handle robots property
    if (seoData.robots) {
      if (seoData.robots.includes('noindex')) {
        this.setIndexable(false);
      } else {
        this.setIndexable(true);
      }
    }

    // Set indexability
    if (seoData.noIndex !== undefined) {
      this.setIndexable(!seoData.noIndex);
    }

    console.log(`🎯 SEO: Comprehensive page SEO set`, seoData);
  }

  /**
   * Set canonical URL
   * @param url - Canonical URL
   */
  setCanonicalUrl(url: string): void {
    // Remove existing canonical link
    const existingCanonical = this.document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link
    const canonicalLink = this.document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = url;
    this.document.head.appendChild(canonicalLink);
    
    console.log(`🔗 SEO: Canonical URL set to "${url}"`);
  }

  /**
   * Remove all SEO meta tags (useful for cleanup)
   */
  clearSeoTags(): void {
    // Remove common SEO meta tags
    const tagsToRemove = [
      'meta[name="description"]',
      'meta[name="keywords"]',
      'meta[property^="og:"]',
      'meta[name^="twitter:"]',
      'link[rel="canonical"]'
    ];

    tagsToRemove.forEach(selector => {
      const elements = this.document.querySelectorAll(selector);
      elements.forEach(element => element.remove());
    });

    console.log(`🧹 SEO: Meta tags cleared`);
  }

  /**
   * Set default meta tags for the application
   */
  setDefaultMetaTags(): void {
    // Set default meta tags
    this.metaService.addTags([
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'author', content: 'Frontuna.com' },
      { name: 'generator', content: 'Angular 17' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Frontuna.com' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@frontuna' }
    ]);

    console.log(`🏷️ SEO: Default meta tags set`);
  }
}