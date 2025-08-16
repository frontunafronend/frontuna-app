/**
 * Basic Home Component Tests
 * Simple tests to verify the home page loads and basic functionality works
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { HomeComponent } from '../../app/pages/home/home.component';
import { AuthService } from '../../app/services/auth/auth.service';
import { SeoService } from '../../app/services/seo/seo.service';
import { GoogleAnalyticsService } from '../../app/services/analytics/google-analytics.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let seoService: jasmine.SpyObj<SeoService>;
  let analyticsService: jasmine.SpyObj<GoogleAnalyticsService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated'], {
      currentUser: jasmine.createSpy().and.returnValue({ id: '1', email: 'test@test.com' }),
      isAuthenticated: jasmine.createSpy().and.returnValue(false)
    });
    
    const seoSpy = jasmine.createSpyObj('SeoService', ['updateTitle', 'updateMetaTags']);
    const analyticsSpy = jasmine.createSpyObj('GoogleAnalyticsService', ['trackEvent']);

    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: SeoService, useValue: seoSpy },
        { provide: GoogleAnalyticsService, useValue: analyticsSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    seoService = TestBed.inject(SeoService) as jasmine.SpyObj<SeoService>;
    analyticsService = TestBed.inject(GoogleAnalyticsService) as jasmine.SpyObj<GoogleAnalyticsService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have features array', () => {
    expect(component.features).toBeDefined();
    expect(component.features.length).toBeGreaterThan(0);
  });

  it('should have testimonials array', () => {
    expect(component.testimonials).toBeDefined();
    expect(component.testimonials.length).toBeGreaterThan(0);
  });

  it('should have frameworks array', () => {
    expect(component.frameworks).toBeDefined();
    expect(component.frameworks.length).toBeGreaterThan(0);
  });

  it('should handle mascot image load', () => {
    const mockEvent = { target: { src: 'test.png' } } as any;
    expect(() => component.onMascotImageLoad(mockEvent)).not.toThrow();
  });

  it('should handle mascot image error', () => {
    const mockEvent = { target: { src: 'test.png' } } as any;
    expect(() => component.onMascotImageError(mockEvent)).not.toThrow();
  });

  it('should check authentication status', () => {
    component.isAuthenticated();
    expect(authService.isAuthenticated).toHaveBeenCalled();
  });
});