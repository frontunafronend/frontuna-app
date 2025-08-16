import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { SeoService } from '@app/services/seo/seo.service';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="about-page">
      <!-- Hero Section -->
      <section class="about-hero">
        <div class="container">
          <div class="hero-content">
            <h1>About Frontuna.com</h1>
            <p class="hero-description">
              We're on a mission to revolutionize frontend development by making 
              component creation as simple as describing what you want to build.
            </p>
          </div>
        </div>
      </section>

      <!-- Story Section -->
      <section class="story-section">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h2>Our Story</h2>
              <p>
                Frontuna.com was born from the frustration of spending countless hours 
                building similar components over and over again. As frontend developers, 
                we knew there had to be a better way.
              </p>
              <p>
                In 2024, we decided to harness the power of artificial intelligence to 
                solve this problem. What started as a simple idea has grown into a 
                comprehensive platform that helps thousands of developers worldwide 
                create better components faster.
              </p>
              <p>
                Today, Frontuna.com is trusted by developers at startups and Fortune 500 
                companies alike, generating over 50,000 components and counting.
              </p>
            </div>
            <div class="col-lg-6">
              <div class="story-image">
                <img src="assets/images/about/story-illustration.svg" 
                     alt="Our Story" 
                     class="img-fluid"
                     (error)="onStoryImageError($event)" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Mission Section -->
      <section class="mission-section">
        <div class="container">
          <div class="section-header">
            <h2>Our Mission</h2>
            <p>Empowering developers to build better user interfaces, faster</p>
          </div>
          
          <div class="mission-grid">
            <div class="mission-item">
              <div class="mission-icon">
                <mat-icon>speed</mat-icon>
              </div>
              <h3>Speed Development</h3>
              <p>
                Reduce the time from idea to implementation by generating 
                production-ready components in seconds, not hours.
              </p>
            </div>
            
            <div class="mission-item">
              <div class="mission-icon">
                <mat-icon>high_quality</mat-icon>
              </div>
              <h3>Ensure Quality</h3>
              <p>
                Every generated component follows best practices for 
                accessibility, performance, and maintainability.
              </p>
            </div>
            
            <div class="mission-item">
              <div class="mission-icon">
                <mat-icon>school</mat-icon>
              </div>
              <h3>Enable Learning</h3>
              <p>
                Help developers learn new patterns and techniques through 
                AI-generated code examples and explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Team Section -->
      <section class="team-section">
        <div class="container">
          <div class="section-header">
            <h2>Meet Our Team</h2>
                          <p>The passionate developers and designers behind Frontuna.com</p>
          </div>
          
          <div class="team-grid">
            <mat-card class="team-member" *ngFor="let member of teamMembers">
              <div class="member-photo">
                <img [src]="member.photo" [alt]="member.name" (error)="onImageError($event, member)" />
              </div>
              <mat-card-content>
                <h3>{{ member.name }}</h3>
                <p class="member-role">{{ member.role }}</p>
                <p class="member-bio">{{ member.bio }}</p>
                <div class="member-social">
                  <a [href]="member.linkedin" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     *ngIf="member.linkedin">
                    <mat-icon>linkedin</mat-icon>
                  </a>
                  <a [href]="member.twitter" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     *ngIf="member.twitter">
                    <mat-icon>twitter</mat-icon>
                  </a>
                  <a [href]="member.github" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     *ngIf="member.github">
                    <mat-icon>github</mat-icon>
                  </a>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </section>

      <!-- Values Section -->
      <section class="values-section">
        <div class="container">
          <div class="section-header">
            <h2>Our Values</h2>
            <p>The principles that guide everything we do</p>
          </div>
          
          <div class="values-grid">
            <div class="value-item" *ngFor="let value of companyValues">
              <div class="value-icon">
                <mat-icon>{{ value.icon }}</mat-icon>
              </div>
              <h3>{{ value.title }}</h3>
              <p>{{ value.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-item" *ngFor="let stat of companyStats">
              <div class="stat-number">{{ stat.number }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Transform Your Development Workflow?</h2>
                          <p>Join thousands of developers who trust Frontuna.com</p>
            <div class="cta-actions">
              <a routerLink="/auth/signup" 
                 mat-raised-button 
                 color="primary" 
                 size="large">
                Get Started Free
              </a>
              <a routerLink="/contact" 
                 mat-stroked-button 
                 color="primary" 
                 size="large">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .about-page {
      overflow-x: hidden;
    }

    .about-hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 6rem 0 4rem;
      text-align: center;
    }

    .hero-content h1 {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
    }

    .hero-description {
      font-size: 1.3rem;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      opacity: 0.95;
    }

    .story-section {
      padding: 6rem 0;
    }

    .story-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 2rem;
    }

    .story-section p {
      font-size: 1.1rem;
      line-height: 1.8;
      color: #666;
      margin-bottom: 1.5rem;
    }

    .story-image {
      text-align: center;
    }

    .story-image img {
      max-width: 100%;
      height: auto;
    }

    .mission-section {
      padding: 6rem 0;
      background: #f8f9fa;
    }

    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .section-header h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 1rem;
    }

    .section-header p {
      font-size: 1.2rem;
      color: #666;
      max-width: 600px;
      margin: 0 auto;
    }

    .mission-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 3rem;
    }

    .mission-item {
      text-align: center;
    }

    .mission-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 2rem;
      color: white;
      font-size: 2rem;
    }

    .mission-item h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
    }

    .mission-item p {
      font-size: 1rem;
      line-height: 1.6;
      color: #666;
    }

    .team-section {
      padding: 6rem 0;
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .team-member {
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .team-member:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    .member-photo {
      width: 120px;
      height: 120px;
      margin: -60px auto 2rem;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid white;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }

    .member-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .team-member h3 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .member-role {
      color: #667eea;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .member-bio {
      color: #666;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .member-social {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .member-social a {
      color: #666;
      transition: color 0.3s ease;
    }

    .member-social a:hover {
      color: #667eea;
    }

    .values-section {
      padding: 6rem 0;
      background: #f8f9fa;
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .value-item {
      background: white;
      padding: 2.5rem 2rem;
      border-radius: 12px;
      text-align: center;
      transition: transform 0.3s ease;
    }

    .value-item:hover {
      transform: translateY(-3px);
    }

    .value-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: white;
    }

    .value-item h3 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
    }

    .value-item p {
      color: #666;
      line-height: 1.6;
    }

    .stats-section {
      padding: 4rem 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      justify-items: center;
    }

    .stat-item {
      text-align: center;
      min-width: 200px;
      padding: 0 1rem;
    }

    .stat-number {
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: block;
      white-space: nowrap;
      overflow: visible;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .cta-section {
      padding: 6rem 0;
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 2rem;
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2.5rem;
      }

      .hero-description {
        font-size: 1.1rem;
      }

      .story-section,
      .mission-section,
      .team-section,
      .values-section {
        padding: 4rem 0;
      }

      .section-header h2 {
        font-size: 2rem;
      }

      .mission-grid,
      .team-grid,
      .values-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }

      .stat-item {
        min-width: 150px;
        padding: 0 0.5rem;
      }

      .stat-number {
        font-size: 2.5rem;
        line-height: 1.1;
      }

      .cta-actions {
        flex-direction: column;
        align-items: center;
      }
    }

    @media (max-width: 480px) {
      .hero-content h1 {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .stat-item {
        min-width: auto;
        padding: 0;
      }

      .stat-number {
        font-size: 2rem;
        line-height: 1;
      }
    }
  `]
})
export class AboutComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'About Frontuna.com - AI-Powered Component Generation',
      description: 'Learn about Frontuna.com and our mission to revolutionize frontend development with AI-powered component generation.',
      keywords: 'about frontuna, ai components, frontend development, team',
      url: 'https://frontuna.com/about'
    });

    this.analyticsService.trackEvent({
      action: 'page_view',
      category: 'navigation',
      label: 'about'
    });
  }

  public readonly teamMembers = [
    {
      name: 'Alex Chen',
      role: 'CEO & Co-Founder',
      bio: 'Former senior engineer at Google with 10+ years in frontend development and AI.',
      photo: 'assets/images/team/alex-chen.jpg',
      linkedin: 'https://linkedin.com/in/alexchen',
      twitter: 'https://twitter.com/alexchen',
      github: 'https://github.com/alexchen'
    },
    {
      name: 'Sarah Rodriguez',
      role: 'CTO & Co-Founder',
      bio: 'Machine learning expert and former lead architect at Microsoft AI division.',
      photo: 'assets/images/team/sarah-rodriguez.jpg',
      linkedin: 'https://linkedin.com/in/sarahrodriguez',
      twitter: 'https://twitter.com/sarahrodriguez',
      github: 'https://github.com/sarahrodriguez'
    },
    {
      name: 'David Kim',
      role: 'Head of Engineering',
      bio: 'Full-stack developer passionate about developer tools and productivity.',
      photo: 'assets/images/team/david-kim.jpg',
      linkedin: 'https://linkedin.com/in/davidkim',
      twitter: 'https://twitter.com/davidkim',
      github: 'https://github.com/davidkim'
    },
    {
      name: 'Emma Thompson',
      role: 'Head of Design',
      bio: 'UX/UI designer focused on creating intuitive developer experiences.',
      photo: 'assets/images/team/emma-thompson.jpg',
      linkedin: 'https://linkedin.com/in/emmathompson',
      twitter: 'https://twitter.com/emmathompson',
      github: null
    }
  ];

  public readonly companyValues = [
    {
      icon: 'transparency',
      title: 'Transparency',
      description: 'We believe in open communication and honest feedback in everything we do.'
    },
    {
      icon: 'innovation',
      title: 'Innovation',
      description: 'We constantly push the boundaries of what\'s possible with AI and development tools.'
    },
    {
      icon: 'community',
      title: 'Community',
      description: 'We build for developers, by developers, with the community at the center.'
    },
    {
      icon: 'quality',
      title: 'Quality',
      description: 'We never compromise on code quality, security, or user experience.'
    },
    {
      icon: 'accessibility',
      title: 'Accessibility',
      description: 'We make sure our tools and generated components work for everyone.'
    },
    {
      icon: 'sustainability',
      title: 'Sustainability',
      description: 'We build responsibly and consider the environmental impact of our technology.'
    }
  ];

  public readonly companyStats = [
    { number: '50,000+', label: 'Components Generated' },
    { number: '2,500+', label: 'Developers' },
    { number: '150+', label: 'Companies' },
    { number: '99.9%', label: 'Uptime' }
  ];

  onImageError(event: any, member: any): void {
    // Replace broken image with a colored avatar with initials
    const img = event.target as HTMLImageElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = 120;
      canvas.height = 120;
      
      // Get member initials
      const initials = member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
      
      // Set background color based on member role
      const colors = ['#667eea', '#ff6b6b', '#4ecdc4', '#ffc927'];
      const colorIndex = member.name.length % colors.length;
      ctx.fillStyle = colors[colorIndex];
      
      // Draw circle
      ctx.beginPath();
      ctx.arc(60, 60, 60, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw initials
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, 60, 60);
      
      img.src = canvas.toDataURL();
    }
  }

  onStoryImageError(event: any): void {
    // Replace with a simple icon if story image fails
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    
    // Add a fallback div with icon
    const fallback = document.createElement('div');
    fallback.style.cssText = `
      width: 100%;
      height: 300px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 4rem;
      border-radius: 12px;
    `;
    fallback.innerHTML = '🚀';
    
    img.parentNode?.appendChild(fallback);
  }
}