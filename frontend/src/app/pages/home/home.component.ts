import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { SeoService } from '@app/services/seo/seo.service';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';
import { AuthService } from '@app/services/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center min-vh-100">
          <div class="col-lg-6 order-lg-2">
            <div class="hero-content">
              <h1 class="hero-title bounce-in">
                Generate Frontend Components in
                <span class="gradient-text">Seconds</span>
                <div class="tuna-decoration">🐟</div>
              </h1>
              <p class="hero-description">
                Meet your new AI coding companion! Our smart cat mascot helps you create 
                production-ready React, Angular, and Vue components instantly - no more hours of coding!
              </p>
              
              <div class="hero-stats">
                <div class="stat-item">
                  <span class="stat-number">10,000+</span>
                  <span class="stat-label">Components Generated</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">2,500+</span>
                  <span class="stat-label">Developers</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">50+</span>
                  <span class="stat-label">Component Types</span>
                </div>
              </div>

              <div class="hero-actions">
                @if (isAuthenticated()) {
                  <a routerLink="/dashboard" 
                     mat-raised-button 
                     class="btn btn-primary cta-button pulse">
                    <mat-icon>auto_awesome</mat-icon>
                    Try Now
                  </a>
                } @else {
                  <a routerLink="/auth/signup" 
                     mat-raised-button 
                     class="btn btn-primary cta-button pulse">
                    <mat-icon>auto_awesome</mat-icon>
                    Try Now
                  </a>
                }
                
                <a routerLink="/auth/login" 
                   mat-stroked-button 
                   class="btn btn-secondary secondary-button">
                  <mat-icon>person_add</mat-icon>
                  Sign Up
                </a>
              </div>

              <div class="hero-features">
                <mat-chip-set>
                  <mat-chip>✨ AI-Powered</mat-chip>
                  <mat-chip>⚡ Instant Generation</mat-chip>
                  <mat-chip>📱 Responsive Design</mat-chip>
                  <mat-chip>♿ Accessibility Ready</mat-chip>
                </mat-chip-set>
              </div>
            </div>
          </div>
          
          <div class="col-lg-6 order-lg-1">
            <div class="hero-visual">
              <!-- New Cat Mascot -->
              <div class="mascot-container float">
                <div class="mascot-scene">
                  <img src="assets/images/main-cat-first-page.png" 
                       alt="Main Cat Mascot - First Page" 
                       class="cat-mascot-image"
                       width="300"
                       height="300"
                       loading="lazy"
                       (load)="onMascotImageLoad($event)"
                       (error)="onMascotImageError($event)"/>
                </div>
                <div class="speech-bubble">
                  <p>"Ready to build amazing components together! 🚀"</p>
                </div>
              </div>
              
              <div class="floating-elements">
                <div class="floating-card lightning-icon float">
                  <mat-icon>bolt</mat-icon>
                  <span>Lightning Fast</span>
                </div>
                <div class="floating-card ui-blocks float">
                  <mat-icon>widgets</mat-icon>
                  <span>UI Components</span>
                </div>
                <div class="floating-card ai-powered float">
                  <mat-icon>auto_awesome</mat-icon>
                  <span>AI Powered</span>
                </div>
                <div class="floating-card component-preview float">
                  <mat-icon>code</mat-icon>
                  <span>React • Angular • Vue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="section-header">
                      <h2>Why Choose Frontuna.com?</h2>
          <p>Powerful features that make component development effortless</p>
        </div>
        
        <div class="features-grid">
          <mat-card class="feature-card" *ngFor="let feature of features">
            <mat-card-content>
              <div class="feature-icon">
                <mat-icon>{{ feature.icon }}</mat-icon>
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </section>

    <!-- Frameworks Section -->
    <section class="frameworks-section">
      <div class="container">
        <div class="section-header">
          <h2>Support for All Major Frameworks</h2>
          <p>Generate components for your favorite frontend framework</p>
        </div>
        
        <div class="frameworks-grid">
          <div class="framework-item" *ngFor="let framework of frameworks">
                            <div class="framework-logo">
                  <img [src]="framework.logo" [alt]="framework.name" (error)="onFrameworkImageError($event, framework)" />
                </div>
            <h4>{{ framework.name }}</h4>
            <p>{{ framework.description }}</p>
            <div class="framework-stats">
              <span>{{ framework.componentsGenerated }}+ components</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works-section">
      <div class="container">
        <div class="section-header">
          <h2>Simple as 1-2-3</h2>
          <p>Generate professional components in minutes, not hours</p>
        </div>
        
        <div class="steps-container">
          <div class="step-item" *ngFor="let step of steps; let i = index">
            <div class="step-number">{{ i + 1 }}</div>
            <div class="step-content">
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
            <div class="step-visual">
              <mat-icon>{{ step.icon }}</mat-icon>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-5">
          <a routerLink="/how-it-works" 
             mat-raised-button 
             color="accent">
            Learn More
          </a>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <h2>Loved by Developers Worldwide</h2>
                        <p>Join thousands of developers who trust Frontuna.com</p>
        </div>
        
        <div class="row">
          <div class="col-lg-12 col-md-10 mb-4" *ngFor="let testimonial of testimonials">
            <mat-card class="testimonial-card">
              <mat-card-content>
                <div class="testimonial-rating">
                  <mat-icon *ngFor="let star of [1,2,3,4,5]" class="star-icon">star</mat-icon>
                </div>
                <p class="testimonial-text">"{{ testimonial.content }}"</p>
                <div class="testimonial-author">
                  <img [src]="testimonial.avatar" [alt]="testimonial.name" (error)="onTestimonialImageError($event, testimonial)" />
                  <div>
                    <strong>{{ testimonial.name }}</strong>
                    <span>{{ testimonial.role }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <div class="cta-mascot">
            <img src="assets/images/main-cat-first-page.png" 
                 alt="Cat Mascot" 
                 class="cta-cat-image"
                 width="200"
                 height="200"
                 loading="lazy"/>
          </div>
          <h2>Start Building Components Now!</h2>
          <p>Join our purr-fect community of developers and let our AI cat help you code faster than ever! 🐾</p>
          
          <div class="cta-actions">
            @if (isAuthenticated()) {
              <a routerLink="/dashboard" 
                 mat-raised-button 
                 class="btn btn-primary cta-button-large pulse">
                <mat-icon>rocket_launch</mat-icon>
                Go to Dashboard
              </a>
            } @else {
              <a routerLink="/auth/signup" 
                 mat-raised-button 
                 class="btn btn-primary cta-button-large pulse">
                <mat-icon>rocket_launch</mat-icon>
                Start Building Now
              </a>
              <a routerLink="/auth/login" 
                 mat-stroked-button 
                 class="btn btn-secondary cta-button-outline">
                <mat-icon>account_circle</mat-icon>
                Sign In
              </a>
            }
          </div>
          
          <div class="cta-note">
            <small>🎉 Free forever • No credit card required • Join 10,000+ happy developers</small>
          </div>
          
          <div class="floating-tuna-bones">
            <div class="tuna-bone">🐟</div>
            <div class="tuna-bone">🐟</div>
            <div class="tuna-bone">🐟</div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* Material Icons Font Import - Ensure loading */
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
    @import url('https://fonts.googleapis.com/css2?family=Material+Icons:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
    
    /* Professional Typography - Roboto & Arial fonts */
    * :not(mat-icon) {
      font-family: 'Roboto', Arial, sans-serif !important;
    }

    /* Fix Material Icons Display - High Priority */
    .hero-section mat-icon,
    .features-section mat-icon,
    .testimonials-section mat-icon,
    .cta-section mat-icon,
    mat-icon {
      font-family: 'Material Icons' !important;
      font-weight: normal !important;
      font-style: normal !important;
      font-size: 24px !important;
      line-height: 1 !important;
      letter-spacing: normal !important;
      text-transform: none !important;
      display: inline-block !important;
      white-space: nowrap !important;
      word-wrap: normal !important;
      direction: ltr !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      text-rendering: optimizeLegibility !important;
      -webkit-font-feature-settings: 'liga' 1 !important;
      font-feature-settings: 'liga' 1 !important;
      vertical-align: middle !important;
    }

    /* Ensure Material Icons override everything */
    mat-icon,
    .mat-icon,
    [mat-icon] {
      font-family: 'Material Icons' !important;
    }

    .hero-section {
      padding: 2rem 0;
      background: linear-gradient(135deg, #673AB7 0%, #7B1FA2 25%, #8E24AA 45%, #FF9800 75%, #FFC107 100%);
      color: #ffffff;
      position: relative;
      overflow: hidden;
      min-height: 90vh;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }

    .hero-content {
      position: relative;
      z-index: 2;
    }

    .hero-title {
      font-family: 'Roboto', Arial, sans-serif;
      font-size: 3.5rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      position: relative;
      color: #ffffff;
      text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
      letter-spacing: -0.02em;
    }

    .gradient-text {
      background: linear-gradient(45deg, #FFD700, #FFA500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: none;
      font-weight: 800;
    }
    
    .tuna-decoration {
      position: absolute;
      top: -10px;
      right: -20px;
      font-size: 2rem;
      animation: float 2s ease-in-out infinite;
      transform-origin: center;
    }

    .hero-description {
      font-family: 'Roboto', Arial, sans-serif;
      font-size: 1.25rem;
      font-weight: 400;
      line-height: 1.6;
      margin-bottom: 2rem;
      color: rgba(255, 255, 255, 0.95);
      text-shadow: 1px 1px 4px rgba(0,0,0,0.2);
      letter-spacing: 0.01em;
    }

    .hero-stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-family: 'Roboto', Arial, sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #FFD700;
      text-shadow: 1px 1px 4px rgba(0,0,0,0.3);
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-family: 'Roboto', Arial, sans-serif;
      font-size: 0.9rem;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.85);
      text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .cta-button, .secondary-button {
      font-family: 'Roboto', Arial, sans-serif;
      padding: 0.75rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      border-radius: 8px;
      text-transform: none;
      transition: all 0.3s ease;
    }

    .cta-button {
      background: linear-gradient(45deg, #FFD700, #FFA500) !important;
      color: #333 !important;
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
    }

    .hero-features {
      margin-top: 2rem;
    }

    .hero-visual {
      position: relative;
      height: 960px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Modern Cat Mascot Styles */
    .mascot-container {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .mascot-scene {
      width: 720px;
      height: 720px;
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 20px;
    }
    
    /* New Cat Mascot Image - 20% Smaller */
    .cat-mascot-image {
      width: 672px;
      height: 840px;
      max-width: 100%;
      height: auto;
      animation: float 3s ease-in-out infinite;
      filter: drop-shadow(0 20px 40px rgba(0,0,0,0.3));
      transition: transform 0.3s ease;
    }
    
    .cat-mascot-image:hover {
      transform: scale(1.05);
    }
    

    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
    
    @keyframes blink {
      0%, 90%, 100% { height: 20px; }
      95% { height: 3px; }
    }
    
    .speech-bubble {
      position: absolute;
      top: -80px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      padding: 12px 18px;
      border-radius: 20px;
      border: 2px solid #FFD700;
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.2), 0 2px 10px rgba(0,0,0,0.1);
      max-width: 220px;
      font-family: 'Roboto', Arial, sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
      animation: fadeInOut 4s ease-in-out infinite;
      z-index: 10;
      text-align: center;
      line-height: 1.4;
      backdrop-filter: blur(10px);
    }
    
    .speech-bubble::before {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      border: 8px solid transparent;
      border-top-color: #FFD700;
    }
    
    .speech-bubble::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: #ffffff;
    }
    
    @keyframes fadeInOut {
      0%, 20%, 80%, 100% { opacity: 1; }
      40%, 60% { opacity: 0.7; }
    }

    .code-preview {
      background: #1e1e1e;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      position: relative;
      z-index: 2;
    }

    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: #2d2d2d;
      border-bottom: 1px solid #404040;
    }

    .code-dots {
      display: flex;
      gap: 0.5rem;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .dot.red { background: #ff5f56; }
    .dot.yellow { background: #ffbd2e; }
    .dot.green { background: #27ca3f; }

    .code-title {
      color: #cccccc;
      font-size: 0.9rem;
    }

    .code-content {
      padding: 1.5rem;
      color: #cccccc;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .floating-elements {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .floating-card {
      position: absolute;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 0.65rem 0.85rem;
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      border: 2px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 600;
      font-size: 0.8rem;
      color: #333;
      transition: all 0.3s ease;
      white-space: nowrap;
      max-width: 160px;
      min-width: 120px;
    }
    
    .floating-card:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 12px 40px rgba(0,0,0,0.2);
    }
    
    .floating-card mat-icon {
      font-family: 'Material Icons' !important;
      font-size: 1.2rem !important;
      width: 1.2rem !important;
      height: 1.2rem !important;
      font-weight: normal !important;
      font-style: normal !important;
      line-height: 1 !important;
      text-transform: none !important;
      white-space: nowrap !important;
      word-wrap: normal !important;
      direction: ltr !important;
      -webkit-font-feature-settings: 'liga' !important;
      -webkit-font-smoothing: antialiased !important;
    }
    
    .floating-card.lightning-icon {
      top: 8%;
      right: -2%;
      animation: float 3s ease-in-out infinite;
      animation-delay: 0s;
      background: linear-gradient(45deg, #FFD700, #FFA500);
      color: #333;
      border: 2px solid #FFD700;
    }
    
    .floating-card.ui-blocks {
      top: 32%;
      left: -8%;
      animation: float 3s ease-in-out infinite;
      animation-delay: 1s;
      background: linear-gradient(45deg, #4CAF50, #45a049);
      color: white;
      border: 2px solid #4CAF50;
    }
    
    .floating-card.ai-powered {
      top: 58%;
      right: -6%;
      animation: float 3s ease-in-out infinite;
      animation-delay: 2s;
      background: linear-gradient(45deg, #667eea, #764ba2);
      color: white;
      border: 2px solid #667eea;
    }
    
    .floating-card.component-preview {
      bottom: 12%;
      left: -6%;
      animation: float 3s ease-in-out infinite;
      animation-delay: 0.5s;
      background: linear-gradient(45deg, #2196F3, #1976D2);
      color: white;
      border: 2px solid #2196F3;
    }

    .framework-card.react {
      top: 10%;
      right: -10%;
      color: #61dafb;
      animation-delay: 0s;
    }

    .framework-card.angular {
      top: 40%;
      right: -15%;
      color: #dd0031;
      animation-delay: 1s;
    }

    .framework-card.vue {
      top: 70%;
      right: -5%;
      color: #4fc08d;
      animation-delay: 2s;
    }

    .ai-badge {
      top: 20%;
      left: -10%;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      color: white;
      animation-delay: 0.5s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .features-section, .frameworks-section, .how-it-works-section, .testimonials-section {
      padding: 5rem 0;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2.5rem;
      margin-top: 2rem;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-header h2 {
      font-family: 'Roboto', Arial, sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #2c2c2c;
      letter-spacing: -0.02em;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      word-break: keep-all;
      white-space: nowrap;
      overflow-wrap: normal;
    }

    .section-header p {
      font-family: 'Roboto', Arial, sans-serif;
      font-size: 1.1rem;
      font-weight: 400;
      color: #555;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .feature-card {
      height: 100%;
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    .feature-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: white !important;
      font-size: 2rem;
      position: relative;
    }

    .feature-icon mat-icon {
      font-family: 'Material Icons' !important;
      font-size: 2.5rem !important;
      width: 2.5rem !important;
      height: 2.5rem !important;
      color: white !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      line-height: 1 !important;
      font-weight: normal !important;
      font-style: normal !important;
      text-transform: none !important;
      white-space: nowrap !important;
      word-wrap: normal !important;
      direction: ltr !important;
      -webkit-font-feature-settings: 'liga' !important;
      -webkit-font-smoothing: antialiased !important;
    }

    .frameworks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2.5rem;
      margin-top: 3rem;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }

    .framework-item {
      text-align: center;
      padding: 2rem;
      border-radius: 12px;
      background: #f8f9fa;
      transition: transform 0.3s ease;
    }

    .framework-item:hover {
      transform: translateY(-5px);
    }

    .framework-logo {
      width: 180px;
      height: 180px;
      margin: 0 auto 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .framework-logo img {
      min-width: 100%;
      max-height: 100%;
    }

    .steps-container {
      display: flex;
      flex-direction: column;
      gap: 3rem;
      margin: 3rem auto;
      max-width: 900px;
    }

    .step-item {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .step-number {
      width: 60px;
      height: 60px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .step-content {
      flex: 1;
    }

    .step-content h3 {
      margin-bottom: 0.5rem;
      color: #333;
    }

    .step-visual {
      width: 100px;
      height: 100px;
      background: #f8f9fa;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
      font-size: 2.5rem;
    }

    .step-visual mat-icon {
      font-family: 'Material Icons' !important;
      font-size: 2.5rem !important;
      width: 2.5rem !important;
      height: 2.5rem !important;
      color: #667eea !important;
      font-weight: normal !important;
      font-style: normal !important;
      line-height: 1 !important;
      text-transform: none !important;
      white-space: nowrap !important;
      word-wrap: normal !important;
      direction: ltr !important;
      -webkit-font-feature-settings: 'liga' !important;
      -webkit-font-smoothing: antialiased !important;
    }

    .testimonials-section {
      background: #f8f9fa;
    }

    .testimonials-section .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 2.5rem;
      margin-top: 2rem;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }

    .testimonial-card {
      height: 100%;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-radius: 12px;
      overflow: hidden;
    }

    .testimonial-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.1);
    }

    .testimonial-rating {
      color: #ffc107;
      margin-bottom: 1rem;
      display: flex;
      gap: 0.25rem;
    }

    .star-icon {
      font-family: 'Material Icons' !important;
      font-size: 1.2rem !important;
      width: 1.2rem !important;
      height: 1.2rem !important;
      color: #ffc107 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-weight: normal !important;
      font-style: normal !important;
      line-height: 1 !important;
      text-transform: none !important;
      white-space: nowrap !important;
      word-wrap: normal !important;
      direction: ltr !important;
      -webkit-font-feature-settings: 'liga' !important;
      -webkit-font-smoothing: antialiased !important;
    }

    .testimonial-text {
      font-style: italic;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .testimonial-author img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }

    .testimonial-author div {
      display: flex;
      flex-direction: column;
    }

    .testimonial-author span {
      font-size: 0.9rem;
      color: #666;
    }

    .cta-section {
      padding: 5rem 0;
      background: linear-gradient(135deg, #673AB7 0%, #FFD700 100%);
      color: #ffffff;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .cta-mascot {
      margin-bottom: 1rem;
      animation: bounce-in 1s ease-out;
      display: flex;
      justify-content: center;
    }
    
    .cta-cat-image {
      width: 120px;
      height: auto;
      border-radius: 15px;
      animation: float 3s ease-in-out infinite;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
      transition: transform 0.3s ease;
    }
    
    .cta-cat-image:hover {
      transform: scale(1.05);
    }
    
    .cta-button-large {
      padding: 1rem 2.5rem;
      font-size: 1.2rem;
      font-weight: 700;
      border-radius: 50px;
      margin: 0 0.5rem;
    }
    
    .cta-button-outline {
      padding: 1rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 50px;
      margin: 0 0.5rem;
      border: 2px solid var(--secondary-color);
      color: var(--secondary-color);
      background: transparent;
    }
    
    .cta-button-outline:hover {
      background: var(--secondary-color);
      color: white;
    }
    
    .floating-tuna-bones {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }
    
    .tuna-bone {
      position: absolute;
      font-size: 2rem;
      animation: float 4s ease-in-out infinite;
      opacity: 0.6;
    }
    
    .tuna-bone:nth-child(1) {
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }
    
    .tuna-bone:nth-child(2) {
      top: 60%;
      right: 15%;
      animation-delay: 1.5s;
    }
    
    .tuna-bone:nth-child(3) {
      bottom: 20%;
      left: 20%;
      animation-delay: 3s;
    }

    .cta-content h2 {
      font-family: 'Roboto', Arial, sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #ffffff;
      text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
      letter-spacing: -0.02em;
    }

    .cta-content p {
      font-family: 'Roboto', Arial, sans-serif;
      font-size: 1.2rem;
      font-weight: 400;
      margin-bottom: 2rem;
      color: rgba(255, 255, 255, 0.95);
      text-shadow: 1px 1px 4px rgba(0,0,0,0.2);
      line-height: 1.6;
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .cta-note {
      opacity: 0.8;
    }

    /* Button Icons Fix */
    .cta-button mat-icon,
    .secondary-button mat-icon,
    .cta-button-large mat-icon,
    .cta-button-outline mat-icon,
    .btn mat-icon,
    button mat-icon {
      font-family: 'Material Icons' !important;
      font-weight: normal !important;
      font-style: normal !important;
      font-size: 1.2rem !important;
      line-height: 1 !important;
      text-transform: none !important;
      white-space: nowrap !important;
      word-wrap: normal !important;
      direction: ltr !important;
      -webkit-font-feature-settings: 'liga' !important;
      -webkit-font-smoothing: antialiased !important;
      margin-right: 0.5rem !important;
      vertical-align: middle !important;
    }

    /* Large desktop - 3 columns for better use of space */
    @media (min-width: 1400px) {
      .features-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 3rem;
      }
      
      .testimonials-section .row {
        grid-template-columns: repeat(3, 1fr);
        gap: 3rem;
      }
    }

    @media (max-width: 1024px) and (min-width: 769px) {
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
      }
      
      .frameworks-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
      }
      
      .testimonials-section .row {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
      }
      
      .floating-card {
        font-size: 0.75rem;
        padding: 0.5rem 0.7rem;
        max-width: 140px;
      }
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }

      .hero-stats {
        flex-direction: column;
        gap: 1rem;
      }

      .hero-actions {
        flex-direction: column;
      }

      .step-item {
        flex-direction: column;
        text-align: center;
      }

      .cta-actions {
        flex-direction: column;
        align-items: center;
      }

      .section-header h2 {
        font-size: 2rem;
        white-space: normal;
        word-break: normal;
        line-height: 1.2;
      }

      /* Scale down cat for mobile */
      .cat-mascot-image {
        width: 320px;
        height: 400px;
      }

      .mascot-scene {
        width: 360px;
        height: 480px;
      }

      .hero-visual {
        height: 560px;
      }

      /* Testimonials responsive */
      .testimonials-section .row {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .testimonial-author {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
      }

      .testimonial-text {
        font-size: 0.95rem;
      }

      .testimonial-card {
        margin-bottom: 1rem;
      }

      /* Features responsive */
      .features-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 0 1rem;
      }

      .feature-icon {
        width: 70px;
        height: 70px;
        margin-bottom: 1rem;
      }
      
      /* Hide floating cards on mobile to prevent overflow */
      .floating-card {
        display: none;
      }
      
      /* Adjust frameworks grid for mobile */
      .frameworks-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 0 1rem;
      }
      
      /* Testimonials mobile adjustments */
      .testimonials-section .row {
        padding: 0 1rem;
      }

      .feature-icon mat-icon {
        font-family: 'Material Icons' !important;
        font-size: 2rem !important;
        width: 2rem !important;
        height: 2rem !important;
        font-weight: normal !important;
        font-style: normal !important;
        line-height: 1 !important;
        text-transform: none !important;
        white-space: nowrap !important;
        word-wrap: normal !important;
        direction: ltr !important;
        -webkit-font-feature-settings: 'liga' !important;
        -webkit-font-smoothing: antialiased !important;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);
  private readonly authService = inject(AuthService);

  public readonly features = [
    {
      icon: 'auto_awesome',
      title: 'AI Component Generator',
      description: 'Smart AI that understands your needs and creates perfect components from simple descriptions.'
    },
    {
      icon: 'bar_chart',
      title: 'Admin & Analytics',
      description: 'Powerful dashboard to track usage, manage components, and analyze your development workflow.'
    },
    {
      icon: 'library_books',
      title: 'Component Library',
      description: 'Save, organize, and reuse your generated components with our comprehensive library system.'
    },
    {
      icon: 'flash_on',
      title: 'Lightning Fast',
      description: 'Generate production-ready components in seconds, not hours. Your coding companion that never sleeps! 🐱'
    },
    {
      icon: 'security',
      title: 'Enterprise Security',
      description: 'Bank-grade security with encrypted data transmission, secure authentication, and compliance-ready architecture.'
    },
    {
      icon: 'integration_instructions',
      title: 'Seamless Integration',
      description: 'Easy integration with popular IDEs, CI/CD pipelines, and development workflows. Works with your existing tools!'
    }
  ];

  public readonly testimonials = [
    {
      name: 'Mike Rodriguez',
      role: 'Frontend Lead',
      company: 'StartupXYZ',
      content: 'Amazing tool! Cut our component development time by 70%. Highly recommend to any dev team.',
      avatar: 'assets/images/testimonials/mike.jpg',
      rating: 5
    },
    {
      name: 'Sarah Chen',
      role: 'Senior React Developer',
      company: 'TechFlow Inc',
      content: 'Frontuna.com is a game-changer! The AI generates clean, production-ready components that save me hours every day.',
      avatar: 'assets/images/testimonials/sarah.jpg',
      rating: 5
    },
    {
      name: 'David Kumar',
      role: 'Full Stack Engineer',
      company: 'InnovateLab',
      content: 'Love how it supports multiple frameworks! Generated Angular components work perfectly in our enterprise app.',
      avatar: 'assets/images/testimonials/david.jpg',
      rating: 5
    },
    {
      name: 'Emily Watson',
      role: 'UI/UX Developer',
      company: 'DesignHub',
      content: 'The accessibility features and responsive design patterns are spot-on. Makes my design-to-code workflow seamless!',
      avatar: 'assets/images/testimonials/emily.jpg',
      rating: 5
    },
    {
      name: 'Alex Thompson',
      role: 'Lead Developer',
      company: 'CodeCraft Solutions',
      content: 'Incredible time-saver for our Vue.js projects. The generated components follow best practices and are well-documented.',
      avatar: 'assets/images/testimonials/alex.jpg',
      rating: 5
    },
    {
      name: 'Maria Gonzalez',
      role: 'Software Architect',
      company: 'NextGen Systems',
      content: 'Finally, an AI tool that understands component architecture! The quality and consistency are outstanding.',
      avatar: 'assets/images/testimonials/maria.jpg',
      rating: 5
    }
  ];

  public readonly isAuthenticated = this.authService.isAuthenticated;
  
  public readonly sampleCode = `const Button = ({ variant = 'primary', children, ...props }) => {
  return (
    <button 
      className={\`btn btn-\${variant}\`}
      {...props}
    >
      {children}
    </button>
  );
};`;



  public readonly frameworks = [
    {
      name: 'React',
      description: 'Modern React components with hooks and best practices',
      logo: 'assets/images/frameworks/react.svg',
      componentsGenerated: 3500
    },
    {
      name: 'Angular',
      description: 'Angular 17+ standalone components with TypeScript',
      logo: 'assets/images/frameworks/angular.svg',
      componentsGenerated: 2800
    },
    {
      name: 'Vue.js',
      description: 'Vue 3 components with Composition API',
      logo: 'assets/images/frameworks/vue.svg',
      componentsGenerated: 2200
    },
    {
      name: 'Svelte',
      description: 'Lightweight Svelte components with reactive statements',
      logo: 'assets/images/frameworks/svelte.png',
      componentsGenerated: 1500
    }
  ];

  public readonly steps = [
    {
      title: 'Describe Your Component',
      description: 'Simply tell us what you want to build in plain English',
      icon: 'create'
    },
    {
      title: 'Choose Your Framework',
      description: 'Select from React, Angular, Vue, Svelte, or Vanilla JS',
      icon: 'settings'
    },
    {
      title: 'Get Production-Ready Code',
      description: 'Receive clean, documented, and tested component code instantly',
      icon: 'download'
    }
  ];



  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'Frontuna.com - AI-Powered Frontend Component Generator',
      description: 'Generate production-ready frontend components instantly using AI. Create React, Angular, Vue, and Svelte components from natural language prompts.',
      keywords: 'AI, frontend, components, generator, React, Angular, Vue, Svelte, SaaS, development tools',
      url: 'https://frontuna.com',
      image: 'https://frontuna.com/assets/images/og-home.png'
    });

    this.analyticsService.trackPageView({
      page_title: 'Home - Frontuna.com',
      page_location: window.location.href
    });
  }

  onTestimonialImageError(event: any, testimonial: any): void {
    // Replace broken testimonial image with initials
    const img = event.target as HTMLImageElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = 50;
      canvas.height = 50;
      
      // Get testimonial initials
      const initials = testimonial.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
      
      // Set background color
      ctx.fillStyle = '#8e24aa';
      
      // Draw circle
      ctx.beginPath();
      ctx.arc(25, 25, 25, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw initials
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, 25, 25);
      
      img.src = canvas.toDataURL();
    }
  }

  onFrameworkImageError(event: any, framework: any): void {
    // Replace broken framework image with colored block and framework name
    const img = event.target as HTMLImageElement;
    const container = img.parentElement;
    
    if (container) {
      // Hide the broken image
      img.style.display = 'none';
      
      // Create fallback element
      const fallback = document.createElement('div');
      fallback.style.cssText = `
        width: 80px;
        height: 80px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        text-align: center;
        line-height: 1.2;
      `;
      fallback.textContent = framework.name;
      
      container.appendChild(fallback);
    }
  }

  onMascotImageLoad(event: any): void {
    // Image loaded successfully - show it and hide any fallback
    const img = event.target as HTMLImageElement;
    const container = img.parentElement;
    
    if (container) {
      img.style.display = 'block';
      // Remove any existing fallback
      const fallback = container.querySelector('div[style*="font-size: 8rem"]');
      if (fallback) {
        fallback.remove();
      }
    }
  }

  onMascotImageError(event: any): void {
    // Replace broken mascot image with emoji fallback
    const img = event.target as HTMLImageElement;
    const container = img.parentElement;
    
    if (container) {
      img.style.display = 'none';
      
      // Check if fallback already exists
      const existingFallback = container.querySelector('div[style*="font-size: 8rem"]');
      if (!existingFallback) {
        const fallback = document.createElement('div');
        fallback.style.cssText = `
          width: 280px;
          height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8rem;
          animation: float 3s ease-in-out infinite;
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2));
        `;
        fallback.textContent = '🐱';
        
        container.appendChild(fallback);
      }
    }
  }
}