/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:38:46.986Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - FORM_SUBMISSION_NO_DB: HIGH
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:32:02.223Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - FORM_SUBMISSION_NO_DB: HIGH
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:30:48.031Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - FORM_SUBMISSION_NO_DB: HIGH
 */

/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: 2025-08-22T21:22:46.030Z
 * Issues detected: 1
 * 
 * This file is protected against common bugs:
 * - FORM_SUBMISSION_NO_DB: HIGH
 */

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, delay, debounceTime } from 'rxjs/operators';

import { EnvironmentService } from '../core/environment.service';
import { NotificationService } from '../notification/notification.service';

export interface GalleryComponent {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: ComponentCategory;
  framework: 'angular' | 'react' | 'vue' | 'svelte';
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  preview: {
    thumbnail: string;
    images: string[];
    liveDemo?: string;
  };
  code: {
    template: string;
    styles: string;
    typescript: string;
    dependencies: string[];
  };
  props: ComponentProp[];
  variants: ComponentVariant[];
  usage: {
    downloads: number;
    likes: number;
    views: number;
    forks: number;
  };
  metadata: {
    complexity: 'beginner' | 'intermediate' | 'advanced';
    responsive: boolean;
    accessible: boolean;
    darkMode: boolean;
    animations: boolean;
    size: 'small' | 'medium' | 'large';
  };
  license: string;
  isOfficial: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function';
  description: string;
  defaultValue?: any;
  required: boolean;
  options?: Array<{ label: string; value: any }>;
}

export interface ComponentVariant {
  id: string;
  name: string;
  description: string;
  props: Record<string, any>;
  preview: string;
}

export type ComponentCategory = 
  | 'buttons' 
  | 'forms' 
  | 'navigation' 
  | 'layout' 
  | 'data-display' 
  | 'feedback' 
  | 'surfaces' 
  | 'inputs' 
  | 'media' 
  | 'overlays'
  | 'charts'
  | 'e-commerce'
  | 'dashboard'
  | 'authentication'
  | 'messaging';

export interface GalleryFilter {
  search?: string;
  category?: ComponentCategory;
  framework?: string;
  tags?: string[];
  complexity?: string;
  author?: string;
  featured?: boolean;
  sortBy?: 'popular' | 'recent' | 'name' | 'downloads' | 'likes';
  sortOrder?: 'asc' | 'desc';
}

export interface GalleryResponse {
  components: GalleryComponent[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FavoriteComponent {
  componentId: string;
  userId: string;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ComponentGalleryService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly environmentService = inject(EnvironmentService);
  
  private readonly baseUrl = `${this.environmentService.apiUrl}/gallery`;
  
  // State management
  private readonly componentsSubject = new BehaviorSubject<GalleryComponent[]>([]);
  private readonly favoritesSubject = new BehaviorSubject<FavoriteComponent[]>([]);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly currentFilterSignal = signal<GalleryFilter>({});
  
  // Public observables
  public readonly components$ = this.componentsSubject.asObservable();
  public readonly favorites$ = this.favoritesSubject.asObservable();
  public readonly isLoading = this.isLoadingSignal.asReadonly();
  public readonly currentFilter = this.currentFilterSignal.asReadonly();

  constructor() {
    this.loadFavorites();
  }

  /**
   * Get components from gallery with filtering and pagination
   */
  getComponents(filter: GalleryFilter = {}, page = 1, limit = 20): Observable<GalleryResponse> {
    console.log('🎨 Gallery Service: Getting components from database', { filter, page, limit });
    
    this.isLoadingSignal.set(true);
    this.currentFilterSignal.set(filter);
    
    const params: any = { page, limit, ...filter };
    if (filter.tags?.length) {
      params.tags = filter.tags.join(',');
    }
    
    return this.http.get<GalleryResponse>(`${this.baseUrl}/components`, { params })
      .pipe(
        tap(response => {
          console.log('✅ Gallery Service: Components loaded from database:', response.components?.length || 0);
          if (response.components) {
            if (page === 1) {
              this.componentsSubject.next(response.components);
            } else {
              const current = this.componentsSubject.value;
              this.componentsSubject.next([...current, ...response.components]);
            }
          }
          this.isLoadingSignal.set(false);
        }),
        catchError(error => {
          console.error('❌ Gallery Service: Failed to load components from database:', error);
          this.notificationService.showError('Failed to load components from database');
          this.isLoadingSignal.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get component by ID
   */
  getComponent(id: string): Observable<GalleryComponent> {
    console.log('🎨 Gallery Service: Getting component:', id);
    
    return this.http.get<GalleryComponent>(`${this.baseUrl}/components/${id}`)
      .pipe(
        tap(component => console.log('✅ Gallery Service: Component loaded:', component.name)),
        catchError(error => {
          console.error('❌ Gallery Service: Failed to load component:', error);
          this.notificationService.showError('Failed to load component');
          return throwError(() => error);
        })
      );
  }

  /**
   * Search components
   */
  searchComponents(query: string, filter: Omit<GalleryFilter, 'search'> = {}): Observable<GalleryResponse> {
    console.log('🎨 Gallery Service: Searching components:', query);
    
    return this.getComponents({ ...filter, search: query });
  }

  /**
   * Get featured components
   */
  getFeaturedComponents(limit = 6): Observable<GalleryComponent[]> {
    console.log('🎨 Gallery Service: Getting featured components');
    
    return this.http.get<GalleryComponent[]>(`${this.baseUrl}/featured`, { params: { limit } })
      .pipe(
        tap(components => console.log('✅ Gallery Service: Featured components loaded:', components.length)),
        catchError(error => {
          console.error('❌ Gallery Service: Failed to load featured components:', error);
          return of([]);
        })
      );
  }

  /**
   * Get popular components
   */
  getPopularComponents(limit = 10): Observable<GalleryComponent[]> {
    console.log('🎨 Gallery Service: Getting popular components');
    
    return this.getComponents({ sortBy: 'popular', sortOrder: 'desc' }, 1, limit)
      .pipe(map(response => response.components));
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: ComponentCategory, limit = 20): Observable<GalleryComponent[]> {
    console.log('🎨 Gallery Service: Getting components by category:', category);
    
    return this.getComponents({ category }, 1, limit)
      .pipe(map(response => response.components));
  }

  /**
   * Add component to favorites
   */
  addToFavorites(componentId: string): Observable<void> {
    console.log('🎨 Gallery Service: Adding to favorites:', componentId);
    
    return this.http.post<void>(`${this.baseUrl}/favorites`, { componentId })
      .pipe(
        tap(() => {
          console.log('✅ Gallery Service: Added to favorites:', componentId);
          this.updateFavorites(componentId, true);
          this.notificationService.showSuccess('Added to favorites');
        }),
        catchError(error => {
          console.error('❌ Gallery Service: Failed to add to favorites:', error);
          this.notificationService.showError('Failed to add to favorites');
          return throwError(() => error);
        })
      );
  }

  /**
   * Remove component from favorites
   */
  removeFromFavorites(componentId: string): Observable<void> {
    console.log('🎨 Gallery Service: Removing from favorites:', componentId);
    
    return this.http.delete<void>(`${this.baseUrl}/favorites/${componentId}`)
      .pipe(
        tap(() => {
          console.log('✅ Gallery Service: Removed from favorites:', componentId);
          this.updateFavorites(componentId, false);
          this.notificationService.showSuccess('Removed from favorites');
        }),
        catchError(error => {
          console.error('❌ Gallery Service: Failed to remove from favorites:', error);
          this.notificationService.showError('Failed to remove from favorites');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get user's favorite components
   */
  getFavorites(): Observable<FavoriteComponent[]> {
    console.log('🎨 Gallery Service: Getting favorites');
    
    return this.http.get<FavoriteComponent[]>(`${this.baseUrl}/favorites`)
      .pipe(
        tap(favorites => {
          console.log('✅ Gallery Service: Favorites loaded:', favorites.length);
          this.favoritesSubject.next(favorites);
        }),
        catchError(error => {
          console.error('❌ Gallery Service: Failed to load favorites:', error);
          return of([]);
        })
      );
  }

  /**
   * Check if component is favorited
   */
  isFavorite(componentId: string): boolean {
    return this.favoritesSubject.value.some(fav => fav.componentId === componentId);
  }

  /**
   * Like a component
   */
  likeComponent(componentId: string): Observable<void> {
    console.log('🎨 Gallery Service: Liking component:', componentId);
    
    return this.http.post<void>(`${this.baseUrl}/components/${componentId}/like`, {})
      .pipe(
        tap(() => {
          console.log('✅ Gallery Service: Component liked:', componentId);
          this.notificationService.showSuccess('Component liked');
        }),
        catchError(error => {
          console.error('❌ Gallery Service: Failed to like component:', error);
          this.notificationService.showError('Failed to like component');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get available categories
   */
  getCategories(): ComponentCategory[] {
    return [
      'buttons',
      'forms',
      'navigation',
      'layout',
      'data-display',
      'feedback',
      'surfaces',
      'inputs',
      'media',
      'overlays',
      'charts',
      'e-commerce',
      'dashboard',
      'authentication',
      'messaging'
    ];
  }

  /**
   * Get available frameworks
   */
  getFrameworks(): Array<{ value: string; label: string }> {
    return [
      { value: 'angular', label: 'Angular' },
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'svelte', label: 'Svelte' }
    ];
  }

  // Private helper methods
  private loadFavorites() {
    this.getFavorites().subscribe();
  }

  private updateFavorites(componentId: string, add: boolean) {
    const current = this.favoritesSubject.value;
    
    if (add) {
      const favorite: FavoriteComponent = {
        componentId,
        userId: 'current-user',
        addedAt: new Date()
      };
      this.favoritesSubject.next([...current, favorite]);
    } else {
      const filtered = current.filter(fav => fav.componentId !== componentId);
      this.favoritesSubject.next(filtered);
    }
  }

  // Mock implementations for development
  private mockGetComponents(filter: GalleryFilter, page: number, limit: number): Observable<GalleryResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        let components = this.getMockComponents();
        
        // Apply filters
        if (filter.search) {
          const query = filter.search.toLowerCase();
          components = components.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query) ||
            c.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }
        
        if (filter.category) {
          components = components.filter(c => c.category === filter.category);
        }
        
        if (filter.framework) {
          components = components.filter(c => c.framework === filter.framework);
        }
        
        if (filter.tags?.length) {
          components = components.filter(c =>
            filter.tags!.some(tag => c.tags.includes(tag))
          );
        }
        
        if (filter.complexity) {
          components = components.filter(c => c.metadata.complexity === filter.complexity);
        }
        
        if (filter.featured) {
          components = components.filter(c => c.isFeatured);
        }
        
        // Apply sorting
        if (filter.sortBy) {
          components.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (filter.sortBy) {
              case 'popular':
                aValue = a.usage.likes + a.usage.downloads;
                bValue = b.usage.likes + b.usage.downloads;
                break;
              case 'recent':
                aValue = a.updatedAt.getTime();
                bValue = b.updatedAt.getTime();
                break;
              case 'name':
                aValue = a.name;
                bValue = b.name;
                break;
              case 'downloads':
                aValue = a.usage.downloads;
                bValue = b.usage.downloads;
                break;
              case 'likes':
                aValue = a.usage.likes;
                bValue = b.usage.likes;
                break;
              default:
                return 0;
            }
            
            if (filter.sortOrder === 'desc') {
              return bValue > aValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
          });
        }
        
        // Apply pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedComponents = components.slice(start, end);
        
        return {
          components: paginatedComponents,
          total: components.length,
          page,
          limit,
          hasMore: end < components.length
        };
      })
    );
  }

  private mockGetComponent(id: string): Observable<GalleryComponent> {
    const components = this.getMockComponents();
    const component = components.find(c => c.id === id);
    
    if (!component) {
      return throwError(() => new Error('Component not found'));
    }
    
    return of(component).pipe(delay(300));
  }

  private mockGetFeaturedComponents(limit: number): Observable<GalleryComponent[]> {
    const components = this.getMockComponents().filter(c => c.isFeatured);
    return of(components.slice(0, limit)).pipe(delay(500));
  }

  private mockAddToFavorites(componentId: string): Observable<void> {
    this.updateFavorites(componentId, true);
    return of(undefined).pipe(delay(300));
  }

  private mockRemoveFromFavorites(componentId: string): Observable<void> {
    this.updateFavorites(componentId, false);
    return of(undefined).pipe(delay(300));
  }

  private mockGetFavorites(): Observable<FavoriteComponent[]> {
    return of([
      {
        componentId: 'comp-1',
        userId: 'user-1',
        addedAt: new Date(Date.now() - 86400000 * 2)
      },
      {
        componentId: 'comp-3',
        userId: 'user-1',
        addedAt: new Date(Date.now() - 86400000 * 5)
      }
    ]).pipe(delay(400));
  }

  private mockLikeComponent(componentId: string): Observable<void> {
    return of(undefined).pipe(delay(200));
  }

  private getMockComponents(): GalleryComponent[] {
    return [
      {
        id: 'comp-1',
        name: 'modern-button',
        displayName: 'Modern Button',
        description: 'A sleek, customizable button component with hover effects and multiple variants.',
        category: 'buttons',
        framework: 'angular',
        tags: ['button', 'ui', 'interactive', 'modern'],
        author: {
          name: 'Design Team',
          verified: true
        },
        preview: {
          thumbnail: 'assets/images/gallery/modern-button-thumb.png',
          images: ['assets/images/gallery/modern-button-1.png', 'assets/images/gallery/modern-button-2.png']
        },
        code: {
          template: '<button class="modern-btn" [class]="variant" (click)="onClick()">{{ label }}</button>',
          styles: '.modern-btn { padding: 12px 24px; border-radius: 8px; transition: all 0.2s ease; }',
          typescript: '@Component({ selector: "modern-button" }) export class ModernButtonComponent { @Input() label = "Button"; @Input() variant = "primary"; @Output() clicked = new EventEmitter(); onClick() { this.clicked.emit(); } }',
          dependencies: ['@angular/core', '@angular/common']
        },
        props: [
          {
            name: 'label',
            type: 'string',
            description: 'Button text',
            defaultValue: 'Button',
            required: false
          },
          {
            name: 'variant',
            type: 'string',
            description: 'Button style variant',
            defaultValue: 'primary',
            required: false,
            options: [
              { label: 'Primary', value: 'primary' },
              { label: 'Secondary', value: 'secondary' },
              { label: 'Danger', value: 'danger' }
            ]
          },
          {
            name: 'disabled',
            type: 'boolean',
            description: 'Disable the button',
            defaultValue: false,
            required: false
          }
        ],
        variants: [
          {
            id: 'primary',
            name: 'Primary',
            description: 'Main action button',
            props: { variant: 'primary', label: 'Primary Button' },
            preview: 'assets/images/gallery/button-primary.png'
          },
          {
            id: 'secondary',
            name: 'Secondary',
            description: 'Secondary action button',
            props: { variant: 'secondary', label: 'Secondary Button' },
            preview: 'assets/images/gallery/button-secondary.png'
          }
        ],
        usage: {
          downloads: 1542,
          likes: 324,
          views: 5678,
          forks: 89
        },
        metadata: {
          complexity: 'beginner',
          responsive: true,
          accessible: true,
          darkMode: true,
          animations: true,
          size: 'small'
        },
        license: 'MIT',
        isOfficial: true,
        isFeatured: true,
        createdAt: new Date(Date.now() - 86400000 * 30),
        updatedAt: new Date(Date.now() - 86400000 * 5)
      },
      {
        id: 'comp-2',
        name: 'data-table',
        displayName: 'Data Table',
        description: 'Advanced data table with sorting, filtering, and pagination capabilities.',
        category: 'data-display',
        framework: 'angular',
        tags: ['table', 'data', 'sorting', 'pagination', 'filtering'],
        author: {
          name: 'Community',
          verified: false
        },
        preview: {
          thumbnail: 'assets/images/gallery/data-table-thumb.png',
          images: ['assets/images/gallery/data-table-1.png']
        },
        code: {
          template: '<table class="data-table"><thead><tr><th *ngFor="let col of columns">{{col.title}}</th></tr></thead><tbody><tr *ngFor="let row of data"><td *ngFor="let col of columns">{{row[col.key]}}</td></tr></tbody></table>',
          styles: '.data-table { width: 100%; border-collapse: collapse; } .data-table th, .data-table td { padding: 12px; border-bottom: 1px solid #eee; }',
          typescript: '@Component({ selector: "data-table" }) export class DataTableComponent { @Input() columns: any[] = []; @Input() data: any[] = []; }',
          dependencies: ['@angular/core', '@angular/common']
        },
        props: [
          {
            name: 'columns',
            type: 'array',
            description: 'Table column definitions',
            required: true
          },
          {
            name: 'data',
            type: 'array',
            description: 'Table data rows',
            required: true
          }
        ],
        variants: [],
        usage: {
          downloads: 892,
          likes: 156,
          views: 2341,
          forks: 45
        },
        metadata: {
          complexity: 'intermediate',
          responsive: true,
          accessible: true,
          darkMode: true,
          animations: false,
          size: 'large'
        },
        license: 'MIT',
        isOfficial: false,
        isFeatured: false,
        createdAt: new Date(Date.now() - 86400000 * 15),
        updatedAt: new Date(Date.now() - 86400000 * 3)
      },
      {
        id: 'comp-3',
        name: 'card-component',
        displayName: 'Material Card',
        description: 'Versatile card component with header, content, and action areas.',
        category: 'surfaces',
        framework: 'angular',
        tags: ['card', 'material', 'surface', 'container'],
        author: {
          name: 'Material Team',
          verified: true
        },
        preview: {
          thumbnail: 'assets/images/gallery/card-thumb.png',
          images: ['assets/images/gallery/card-1.png', 'assets/images/gallery/card-2.png']
        },
        code: {
          template: '<mat-card class="custom-card"><mat-card-header><mat-card-title>{{title}}</mat-card-title><mat-card-subtitle>{{subtitle}}</mat-card-subtitle></mat-card-header><mat-card-content>{{content}}</mat-card-content><mat-card-actions><button mat-button>Action</button></mat-card-actions></mat-card>',
          styles: '.custom-card { margin: 16px; max-width: 400px; }',
          typescript: '@Component({ selector: "material-card" }) export class MaterialCardComponent { @Input() title = ""; @Input() subtitle = ""; @Input() content = ""; }',
          dependencies: ['@angular/material/card', '@angular/material/button']
        },
        props: [
          {
            name: 'title',
            type: 'string',
            description: 'Card title',
            required: false
          },
          {
            name: 'subtitle',
            type: 'string',
            description: 'Card subtitle',
            required: false
          },
          {
            name: 'content',
            type: 'string',
            description: 'Card content',
            required: false
          }
        ],
        variants: [
          {
            id: 'basic',
            name: 'Basic Card',
            description: 'Simple card with title and content',
            props: { title: 'Basic Card', content: 'This is a basic card example.' },
            preview: 'assets/images/gallery/card-basic.png'
          }
        ],
        usage: {
          downloads: 2341,
          likes: 456,
          views: 7892,
          forks: 123
        },
        metadata: {
          complexity: 'beginner',
          responsive: true,
          accessible: true,
          darkMode: true,
          animations: false,
          size: 'medium'
        },
        license: 'MIT',
        isOfficial: true,
        isFeatured: true,
        createdAt: new Date(Date.now() - 86400000 * 45),
        updatedAt: new Date(Date.now() - 86400000 * 10)
      },
      {
        id: 'comp-4',
        name: 'navigation-menu',
        displayName: 'Navigation Menu',
        description: 'Responsive navigation menu with dropdown support and mobile-friendly design.',
        category: 'navigation',
        framework: 'angular',
        tags: ['navigation', 'menu', 'responsive', 'dropdown'],
        author: {
          name: 'UI Library',
          verified: true
        },
        preview: {
          thumbnail: 'assets/images/gallery/nav-menu-thumb.png',
          images: ['assets/images/gallery/nav-menu-1.png']
        },
        code: {
          template: '<nav class="nav-menu"><ul><li *ngFor="let item of menuItems"><a [routerLink]="item.link">{{item.label}}</a></li></ul></nav>',
          styles: '.nav-menu { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .nav-menu ul { display: flex; list-style: none; margin: 0; padding: 0; } .nav-menu li a { padding: 16px 20px; text-decoration: none; color: #333; }',
          typescript: '@Component({ selector: "navigation-menu" }) export class NavigationMenuComponent { @Input() menuItems: any[] = []; }',
          dependencies: ['@angular/router', '@angular/common']
        },
        props: [
          {
            name: 'menuItems',
            type: 'array',
            description: 'Navigation menu items',
            required: true
          }
        ],
        variants: [],
        usage: {
          downloads: 1876,
          likes: 298,
          views: 4567,
          forks: 67
        },
        metadata: {
          complexity: 'intermediate',
          responsive: true,
          accessible: true,
          darkMode: true,
          animations: true,
          size: 'medium'
        },
        license: 'Apache-2.0',
        isOfficial: false,
        isFeatured: true,
        createdAt: new Date(Date.now() - 86400000 * 25),
        updatedAt: new Date(Date.now() - 86400000 * 7)
      },
      {
        id: 'comp-5',
        name: 'contact-form',
        displayName: 'Contact Form',
        description: 'Complete contact form with validation, error handling, and success states.',
        category: 'forms',
        framework: 'angular',
        tags: ['form', 'contact', 'validation', 'input'],
        author: {
          name: 'Form Experts',
          verified: true
        },
        preview: {
          thumbnail: 'assets/images/gallery/contact-form-thumb.png',
          images: ['assets/images/gallery/contact-form-1.png']
        },
        code: {
          template: '<form class="contact-form" [formGroup]="contactForm" (ngSubmit)="onSubmit()"><mat-form-field><input matInput formControlName="name" placeholder="Name"></mat-form-field><mat-form-field><input matInput formControlName="email" placeholder="Email"></mat-form-field><mat-form-field><textarea matInput formControlName="message" placeholder="Message"></textarea></mat-form-field><button mat-raised-button color="primary" type="submit">Send Message</button></form>',
          styles: '.contact-form { display: flex; flex-direction: column; gap: 16px; max-width: 500px; }',
          typescript: '@Component({ selector: "contact-form" }) export class ContactFormComponent { contactForm = this.fb.group({ name: ["", Validators.required], email: ["", [Validators.required, Validators.email]], message: ["", Validators.required] }); constructor(private fb: FormBuilder) {} onSubmit() { if (this.contactForm.valid) { console.log(this.contactForm.value); } } }',
          dependencies: ['@angular/forms', '@angular/material/form-field', '@angular/material/input', '@angular/material/button']
        },
        props: [
          {
            name: 'submitText',
            type: 'string',
            description: 'Submit button text',
            defaultValue: 'Send Message',
            required: false
          }
        ],
        variants: [],
        usage: {
          downloads: 1234,
          likes: 234,
          views: 3456,
          forks: 56
        },
        metadata: {
          complexity: 'intermediate',
          responsive: true,
          accessible: true,
          darkMode: true,
          animations: false,
          size: 'medium'
        },
        license: 'MIT',
        isOfficial: false,
        isFeatured: false,
        createdAt: new Date(Date.now() - 86400000 * 20),
        updatedAt: new Date(Date.now() - 86400000 * 4)
      },
      {
        id: 'comp-6',
        name: 'dashboard-widget',
        displayName: 'Dashboard Widget',
        description: 'Customizable dashboard widget with charts, metrics, and interactive elements.',
        category: 'dashboard',
        framework: 'angular',
        tags: ['dashboard', 'widget', 'chart', 'metrics', 'analytics'],
        author: {
          name: 'Analytics Pro',
          verified: true
        },
        preview: {
          thumbnail: 'assets/images/gallery/dashboard-widget-thumb.png',
          images: ['assets/images/gallery/dashboard-widget-1.png']
        },
        code: {
          template: '<div class="dashboard-widget"><div class="widget-header"><h3>{{title}}</h3><span class="widget-value">{{value}}</span></div><div class="widget-content"><div class="metric" *ngFor="let metric of metrics"><span class="metric-label">{{metric.label}}</span><span class="metric-value">{{metric.value}}</span></div></div></div>',
          styles: '.dashboard-widget { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); } .widget-header { display: flex; justify-content: space-between; margin-bottom: 16px; } .metric { display: flex; justify-content: space-between; margin-bottom: 8px; }',
          typescript: '@Component({ selector: "dashboard-widget" }) export class DashboardWidgetComponent { @Input() title = ""; @Input() value = ""; @Input() metrics: any[] = []; }',
          dependencies: ['@angular/core', '@angular/common']
        },
        props: [
          {
            name: 'title',
            type: 'string',
            description: 'Widget title',
            required: true
          },
          {
            name: 'value',
            type: 'string',
            description: 'Main metric value',
            required: false
          },
          {
            name: 'metrics',
            type: 'array',
            description: 'Additional metrics to display',
            required: false
          }
        ],
        variants: [],
        usage: {
          downloads: 987,
          likes: 187,
          views: 2876,
          forks: 43
        },
        metadata: {
          complexity: 'advanced',
          responsive: true,
          accessible: true,
          darkMode: true,
          animations: true,
          size: 'large'
        },
        license: 'MIT',
        isOfficial: false,
        isFeatured: true,
        createdAt: new Date(Date.now() - 86400000 * 12),
        updatedAt: new Date(Date.now() - 86400000 * 1)
      }
    ];
  }
}