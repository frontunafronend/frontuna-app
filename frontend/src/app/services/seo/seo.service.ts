import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);

  constructor() {
    this.initializeRouteTracking();
  }

  /**
   * Set page title
   */
  setTitle(title: string): void {
    this.title.setTitle(title);
  }

  /**
   * Set meta description
   */
  setDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
  }

  /**
   * Set meta keywords
   */
  setKeywords(keywords: string): void {
    this.meta.updateTag({ name: 'keywords', content: keywords });
  }

  /**
   * Set Open Graph meta tags
   */
  setOpenGraphTags(data: {
    title: string;
    description: string;
    url: string;
    image?: string;
    type?: string;
  }): void {
    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:url', content: data.url });
    this.meta.updateTag({ property: 'og:type', content: data.type || 'website' });
    
    if (data.image) {
      this.meta.updateTag({ property: 'og:image', content: data.image });
    }
  }

  /**
   * Set Twitter Card meta tags
   */
  setTwitterCardTags(data: {
    title: string;
    description: string;
    image?: string;
    card?: string;
  }): void {
    this.meta.updateTag({ name: 'twitter:card', content: data.card || 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: data.title });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });
    
    if (data.image) {
      this.meta.updateTag({ name: 'twitter:image', content: data.image });
    }
  }

  /**
   * Set canonical URL
   */
  setCanonicalUrl(url: string): void {
    const existingLink = document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.setAttribute('href', url);
    } else {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      document.head.appendChild(link);
    }
  }

  /**
   * Set robots meta tag
   */
  setRobots(content: string): void {
    this.meta.updateTag({ name: 'robots', content });
  }

  /**
   * Add structured data (JSON-LD)
   */
  addStructuredData(data: any): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Set complete page SEO data
   */
  setPageSeo(data: {
    title: string;
    description: string;
    keywords?: string;
    url: string;
    image?: string;
    robots?: string;
    structuredData?: any;
  }): void {
    // Basic meta tags
    this.setTitle(data.title);
    this.setDescription(data.description);
    this.setCanonicalUrl(data.url);
    
    if (data.keywords) {
      this.setKeywords(data.keywords);
    }
    
    if (data.robots) {
      this.setRobots(data.robots);
    }

    // Open Graph tags
    this.setOpenGraphTags({
      title: data.title,
      description: data.description,
      url: data.url,
      image: data.image
    });

    // Twitter Card tags
    this.setTwitterCardTags({
      title: data.title,
      description: data.description,
      image: data.image
    });

    // Structured data
    if (data.structuredData) {
      this.addStructuredData(data.structuredData);
    }
  }

  /**
   * Set default meta tags
   */
  setDefaultMetaTags(): void {
    const defaultData = {
      title: 'Frontuna.com - AI-Powered Frontend Component Generator',
      description: 'Generate frontend components instantly using AI. Create React, Angular, Vue components from natural language prompts.',
      keywords: 'AI, frontend, components, generator, React, Angular, Vue, SaaS',
      url: 'https://frontuna.com',
      image: 'https://frontuna.com/assets/images/og-image.png',
      robots: 'index, follow'
    };

    this.setPageSeo(defaultData);
  }

  /**
   * Initialize route tracking for automatic SEO updates
   */
  private initializeRouteTracking(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updateSeoForRoute(event.url);
        }
      });
  }

  /**
   * Update SEO based on current route
   */
  private updateSeoForRoute(url: string): void {
    const routeData = this.getRouteSpecificSeoData(url);
    if (routeData) {
      this.setPageSeo(routeData);
    }
  }

  /**
   * Get SEO data based on route
   */
  private getRouteSpecificSeoData(url: string): any {
    const baseUrl = 'https://frontuna.com';
    
    const routeMap: { [key: string]: any } = {
      '/': {
        title: 'Frontuna.com - AI-Powered Frontend Component Generator',
        description: 'Generate frontend components instantly using AI. Create React, Angular, Vue components from natural language prompts.',
        keywords: 'AI, frontend, components, generator, React, Angular, Vue, SaaS',
        url: baseUrl,
        image: `${baseUrl}/assets/images/og-image.png`
      },
      '/dashboard': {
        title: 'Dashboard - Frontuna.com',
        description: 'Generate and manage your frontend components with AI-powered tools.',
        keywords: 'dashboard, component generator, AI tools',
        url: `${baseUrl}/dashboard`,
        robots: 'noindex, nofollow' // Private page
      },
      '/library': {
        title: 'Component Library - Frontuna.com',
        description: 'Browse and manage your saved frontend components generated by AI.',
        keywords: 'component library, saved components, code library',
        url: `${baseUrl}/library`,
        robots: 'noindex, nofollow' // Private page
      },
      '/about': {
        title: 'About - Frontuna.com',
        description: 'Learn about Frontuna.com, the AI-powered platform for generating frontend components.',
        keywords: 'about, AI platform, frontend development, component generation',
        url: `${baseUrl}/about`
      },
      '/contact': {
        title: 'Contact Us - Frontuna.com',
        description: 'Get in touch with the Frontuna.com team for support, questions, or partnership opportunities.',
        keywords: 'contact, support, partnership, help',
        url: `${baseUrl}/contact`
      },
      '/how-it-works': {
        title: 'How It Works - Frontuna.com',
        description: 'Learn how Frontuna.com uses artificial intelligence to generate high-quality frontend components from simple prompts.',
        keywords: 'how it works, AI component generation, tutorial, guide',
        url: `${baseUrl}/how-it-works`
      },
      '/best-practices': {
        title: 'Frontend Component Best Practices - Frontuna.com',
        description: 'Discover best practices for creating maintainable, accessible, and performant frontend components.',
        keywords: 'best practices, frontend development, component design, accessibility',
        url: `${baseUrl}/best-practices`
      },
      '/tutorials': {
        title: 'Tutorials - Frontuna.com',
        description: 'Step-by-step tutorials on using Frontuna.com to generate and customize frontend components.',
        keywords: 'tutorials, guides, component generation, frontend development',
        url: `${baseUrl}/tutorials`
      }
    };

    return routeMap[url] || null;
  }
}