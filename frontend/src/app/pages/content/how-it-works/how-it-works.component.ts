import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { SeoService } from '../../../services/seo/seo.service';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="container">
        <div class="page-header">
          <h1>How Frontuna.com Works</h1>
          <p>Discover the complete process of how our AI transforms your ideas into production-ready components</p>
        </div>
        
        <!-- Main Process Steps -->
        <div class="main-process-section">
          <h2>The Complete Process</h2>
          <div class="process-steps">
            <div class="process-step" *ngFor="let step of mainProcessSteps; let i = index">
              <div class="step-number">{{ i + 1 }}</div>
              <div class="step-content">
                <mat-card>
                  <mat-card-content>
                    <div class="step-header">
                      <mat-icon>{{ step.icon }}</mat-icon>
                      <h3>{{ step.title }}</h3>
                    </div>
                    <p>{{ step.description }}</p>
                    <div class="step-features">
                      <span *ngFor="let feature of step.features" class="feature-tag">{{ feature }}</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Technology Section -->
        <div class="technology-section">
          <h2>Our AI Technology</h2>
          <div class="technology-grid">
            <mat-card *ngFor="let tech of aiTechnology" class="technology-card">
              <mat-card-content>
                <div class="tech-icon">
                  <mat-icon>{{ tech.icon }}</mat-icon>
                </div>
                <h3>{{ tech.title }}</h3>
                <p>{{ tech.description }}</p>
                <ul>
                  <li *ngFor="let benefit of tech.benefits">{{ benefit }}</li>
                </ul>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Framework Support Section -->
        <div class="framework-section">
          <h2>Multi-Framework Support</h2>
          <div class="framework-grid">
            <mat-card *ngFor="let framework of frameworkSupport" class="framework-card">
              <mat-card-content>
                <div class="framework-header">
                  <mat-icon>{{ framework.icon }}</mat-icon>
                  <h3>{{ framework.name }}</h3>
                </div>
                <p>{{ framework.description }}</p>
                <div class="framework-capabilities">
                  <h4>What we generate:</h4>
                  <ul>
                    <li *ngFor="let capability of framework.capabilities">{{ capability }}</li>
                  </ul>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Design Systems Section -->
        <div class="design-systems-section">
          <h2>Design Framework Integration</h2>
          <div class="design-systems-grid">
            <mat-card *ngFor="let design of designSystems" class="design-system-card">
              <mat-card-content>
                <div class="design-header">
                  <div class="design-color" [style.background-color]="design.color"></div>
                  <h3>{{ design.name }}</h3>
                </div>
                <p>{{ design.description }}</p>
                <div class="design-features">
                  <span *ngFor="let feature of design.features" class="design-feature">{{ feature }}</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Quality Assurance Section -->
        <div class="quality-section">
          <h2>Quality & Standards</h2>
          <div class="quality-grid">
            <mat-card *ngFor="let quality of qualityFeatures" class="quality-card">
              <mat-card-content>
                <mat-icon>{{ quality.icon }}</mat-icon>
                <h3>{{ quality.title }}</h3>
                <p>{{ quality.description }}</p>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Advanced Features Section -->
        <div class="advanced-features-section">
          <h2>Advanced Capabilities</h2>
          <div class="features-grid">
            <mat-card *ngFor="let feature of advancedFeatures" class="feature-card">
              <mat-card-content>
                <div class="feature-header">
                  <mat-icon>{{ feature.icon }}</mat-icon>
                  <h3>{{ feature.title }}</h3>
                </div>
                <p>{{ feature.description }}</p>
                <div class="feature-benefits">
                  <span *ngFor="let benefit of feature.benefits" class="benefit-tag">{{ benefit }}</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="cta-section">
          <mat-card class="cta-card">
            <mat-card-content>
              <h2>Ready to Experience the Magic?</h2>
              <p>Join thousands of developers who are already building faster with Frontuna.com</p>
              <div class="cta-actions">
                <button mat-raised-button color="primary" routerLink="/dashboard/generate">
                  <mat-icon>rocket_launch</mat-icon>
                  Start Building Now
                </button>
                <button mat-stroked-button color="primary" routerLink="/dashboard/components">
                  <mat-icon>preview</mat-icon>
                  Browse Components
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { 
      padding: 2rem 0 4rem; 
      min-height: 100vh; 
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    
    .page-header { 
      text-align: center; 
      margin-bottom: 4rem; 
    }
    
    .page-header h1 { 
      font-size: 3.5rem; 
      font-weight: 700; 
      color: #2c2c2c; 
      margin-bottom: 1rem;
      background: linear-gradient(45deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .page-header p {
      font-size: 1.2rem;
      color: #666;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Main Process Section */
    .main-process-section {
      margin-bottom: 5rem;
    }

    .main-process-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 3rem;
      color: #2c2c2c;
    }

    .process-steps {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .process-step {
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

    .step-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .step-header mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #667eea;
    }

    .step-header h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2c2c2c;
    }

    .step-features {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .feature-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    /* Technology Section */
    .technology-section {
      margin-bottom: 5rem;
    }

    .technology-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 3rem;
      color: #2c2c2c;
    }

    .technology-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .technology-card {
      height: 100%;
      transition: transform 0.3s ease;
    }

    .technology-card:hover {
      transform: translateY(-5px);
    }

    .tech-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .tech-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: white;
    }

    /* Framework Section */
    .framework-section {
      margin-bottom: 5rem;
    }

    .framework-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 3rem;
      color: #2c2c2c;
    }

    .framework-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .framework-card {
      height: 100%;
      transition: transform 0.3s ease;
    }

    .framework-card:hover {
      transform: translateY(-5px);
    }

    .framework-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .framework-header mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #667eea;
    }

    .framework-capabilities h4 {
      margin: 1rem 0 0.5rem 0;
      font-weight: 600;
      color: #2c2c2c;
    }

    /* Design Systems Section */
    .design-systems-section {
      margin-bottom: 5rem;
    }

    .design-systems-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 3rem;
      color: #2c2c2c;
    }

    .design-systems-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .design-system-card {
      height: 100%;
      transition: transform 0.3s ease;
    }

    .design-system-card:hover {
      transform: translateY(-5px);
    }

    .design-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .design-color {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .design-features {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .design-feature {
      background: #f0f4ff;
      color: #667eea;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    /* Quality Section */
    .quality-section {
      margin-bottom: 5rem;
    }

    .quality-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 3rem;
      color: #2c2c2c;
    }

    .quality-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .quality-card {
      text-align: center;
      height: 100%;
      transition: transform 0.3s ease;
    }

    .quality-card:hover {
      transform: translateY(-5px);
    }

    .quality-card mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #667eea;
      margin-bottom: 1rem;
    }

    /* Advanced Features Section */
    .advanced-features-section {
      margin-bottom: 5rem;
    }

    .advanced-features-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 3rem;
      color: #2c2c2c;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      height: 100%;
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .feature-header mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #667eea;
    }

    .feature-benefits {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .benefit-tag {
      background: #e8f5e8;
      color: #2e7d32;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    /* CTA Section */
    .cta-section {
      margin-top: 5rem;
    }

    .cta-card {
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .cta-card h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: white;
    }

    .cta-card p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .page-container {
        padding: 1rem 0 2rem;
      }

      .container {
        padding: 0 1rem;
      }

      .page-header h1 {
        font-size: 2.5rem;
      }

      .process-step {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .cta-actions {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .cta-actions button {
        width: 100%;
        max-width: 300px;
      }

      .technology-grid,
      .framework-grid,
      .design-systems-grid,
      .quality-grid,
      .features-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .main-process-section h2,
      .technology-section h2,
      .framework-section h2,
      .design-systems-section h2,
      .quality-section h2,
      .advanced-features-section h2 {
        font-size: 2rem;
      }

      .cta-card h2 {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .page-header h1 {
        font-size: 2rem;
      }

      .page-header p {
        font-size: 1rem;
      }

      .main-process-section h2,
      .technology-section h2,
      .framework-section h2,
      .design-systems-section h2,
      .quality-section h2,
      .advanced-features-section h2 {
        font-size: 1.75rem;
      }

      .step-number {
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
      }
    }
  `]
})
export class HowItWorksComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    // Set up SEO meta tags
    this.seoService.setTitle('How Frontuna.com Works - AI Component Generation Process');
    this.seoService.setDescription('Discover how our AI transforms your ideas into production-ready components. Complete process from description to deployment.');
    this.seoService.setKeywords('AI component generation, frontend development, React Angular Vue, code generation process');
    this.seoService.setOpenGraphTags({
      title: 'How Frontuna.com Works - AI Component Generation',
      description: 'Learn the complete process of AI-powered component generation',
      url: `${window.location.origin}/how-it-works`,
      image: '/assets/images/how-it-works-preview.jpg',
      type: 'website'
    });
  }
  public readonly mainProcessSteps = [
    {
      icon: 'psychology',
      title: 'Describe Your Vision',
      description: 'Simply describe what component you need in natural language. Our AI understands complex requirements and design patterns.',
      features: ['Natural Language Processing', 'Context Understanding', 'Design Pattern Recognition']
    },
    {
      icon: 'settings',
      title: 'Choose Your Stack',
      description: 'Select your preferred framework (React, Angular, Vue, Svelte) and design system (Plain CSS, Bootstrap, Material Design).',
      features: ['Multi-Framework Support', 'Design System Integration', 'Custom Styling Options']
    },
    {
      icon: 'auto_awesome',
      title: 'AI Generation Magic',
      description: 'Our advanced AI analyzes your requirements and generates production-ready code with best practices built-in.',
      features: ['GPT-4 Powered', 'Best Practices', 'Clean Code Generation']
    },
    {
      icon: 'preview',
      title: 'Live Preview & Refinement',
      description: 'See your component come to life instantly with our live preview system. Make adjustments and regenerate as needed.',
      features: ['Real-time Preview', 'Interactive Testing', 'Instant Regeneration']
    },
    {
      icon: 'download',
      title: 'Export & Integrate',
      description: 'Download your component files or copy the code directly into your project. Includes all necessary dependencies and documentation.',
      features: ['Multiple Export Formats', 'Documentation Included', 'Dependency Management']
    }
  ];

  public readonly aiTechnology = [
    {
      icon: 'psychology',
      title: 'Advanced Language Models',
      description: 'Powered by state-of-the-art GPT-4 technology specifically fine-tuned for frontend component generation.',
      benefits: [
        'Understanding of modern web development patterns',
        'Context-aware code generation',
        'Semantic understanding of UI/UX requirements',
        'Continuous learning from developer feedback'
      ]
    },
    {
      icon: 'code',
      title: 'Code Intelligence',
      description: 'Our AI understands the nuances of different frameworks and generates idiomatic code for each platform.',
      benefits: [
        'Framework-specific best practices',
        'Modern syntax and patterns',
        'Optimized performance considerations',
        'Cross-browser compatibility'
      ]
    },
    {
      icon: 'palette',
      title: 'Design System Awareness',
      description: 'Intelligent integration with popular design systems and CSS frameworks for consistent, professional results.',
      benefits: [
        'Bootstrap integration expertise',
        'Material Design implementation',
        'Custom CSS generation',
        'Responsive design patterns'
      ]
    },
    {
      icon: 'security',
      title: 'Quality Assurance',
      description: 'Built-in quality checks ensure your generated components meet industry standards and security best practices.',
      benefits: [
        'Accessibility compliance (WCAG)',
        'Security vulnerability prevention',
        'Performance optimization',
        'SEO-friendly markup'
      ]
    }
  ];

  public readonly frameworkSupport = [
    {
      icon: 'web',
      name: 'React Components',
      description: 'Modern React components using hooks, TypeScript, and functional patterns with full JSX support.',
      capabilities: [
        'Functional components with hooks',
        'TypeScript interfaces and props',
        'State management integration',
        'Custom hooks for reusability',
        'Jest testing setup',
        'Storybook documentation'
      ]
    },
    {
      icon: 'architecture',
      name: 'Angular Components',
      description: 'Angular 17+ standalone components with signals, reactive forms, and modern Angular patterns.',
      capabilities: [
        'Standalone component architecture',
        'Angular Signals for reactivity',
        'Reactive forms integration',
        'Angular Material components',
        'Karma/Jasmine testing',
        'Angular CLI compatibility'
      ]
    },
    {
      icon: 'widgets',
      name: 'Vue.js Components',
      description: 'Vue 3 components using Composition API, TypeScript, and modern Vue ecosystem tools.',
      capabilities: [
        'Composition API patterns',
        'Script setup syntax',
        'TypeScript definitions',
        'Pinia state management',
        'Vitest testing framework',
        'Vue 3 best practices'
      ]
    },
    {
      icon: 'dynamic_form',
      name: 'Svelte Components',
      description: 'Lightweight Svelte components with reactive declarations and minimal bundle size optimization.',
      capabilities: [
        'Reactive declarations',
        'Svelte stores integration',
        'TypeScript support',
        'SvelteKit compatibility',
        'Minimal bundle size',
        'Native web standards'
      ]
    }
  ];

  public readonly designSystems = [
    {
      name: 'Plain CSS',
      description: 'Clean, modern CSS with custom properties, flexbox, and grid layouts for maximum flexibility.',
      color: '#1976d2',
      features: ['Custom Properties', 'Modern CSS Grid', 'Flexbox Layouts', 'Responsive Design', 'Clean Architecture']
    },
    {
      name: 'Bootstrap Integration',
      description: 'Full Bootstrap 5 integration with utility classes, components, and responsive grid system.',
      color: '#7952b3',
      features: ['Utility Classes', 'Component Library', 'Responsive Grid', 'Theme Customization', 'Icon Integration']
    },
    {
      name: 'Material Design',
      description: 'Google Material Design principles with Material-UI/Angular Material component integration.',
      color: '#2196f3',
      features: ['Material Components', 'Design Tokens', 'Elevation System', 'Motion Patterns', 'Accessibility']
    }
  ];

  public readonly qualityFeatures = [
    {
      icon: 'accessibility',
      title: 'Accessibility First',
      description: 'Every component is generated with WCAG 2.1 AA compliance, proper ARIA labels, keyboard navigation, and screen reader support.'
    },
    {
      icon: 'devices',
      title: 'Responsive Design',
      description: 'Mobile-first responsive components that work seamlessly across all device sizes with optimized touch interactions.'
    },
    {
      icon: 'speed',
      title: 'Performance Optimized',
      description: 'Lightweight, efficient code with lazy loading, tree shaking support, and minimal runtime overhead.'
    },
    {
      icon: 'security',
      title: 'Security Hardened',
      description: 'Generated code follows security best practices with XSS prevention, input sanitization, and safe DOM manipulation.'
    },
    {
      icon: 'bug_report',
      title: 'Testing Ready',
      description: 'Components come with unit test scaffolds, testing utilities, and comprehensive test coverage examples.'
    },
    {
      icon: 'dark_mode',
      title: 'Dark Mode Support',
      description: 'Automatic dark mode compatibility with CSS custom properties and theme switching capabilities.'
    }
  ];

  public readonly advancedFeatures = [
    {
      icon: 'library_books',
      title: 'Component Library Management',
      description: 'Save, organize, and reuse your generated components with our comprehensive library system.',
      benefits: ['Version Control', 'Team Sharing', 'Component Discovery', 'Usage Analytics']
    },
    {
      icon: 'integration_instructions',
      title: 'API Integration Ready',
      description: 'Components can be generated with API integration patterns, state management, and data fetching logic.',
      benefits: ['REST API Integration', 'GraphQL Support', 'State Management', 'Error Handling']
    },
    {
      icon: 'motion_photos_on',
      title: 'Animation & Interactions',
      description: 'Rich micro-interactions and animations using CSS transitions, keyframes, and modern animation libraries.',
      benefits: ['Smooth Transitions', 'Micro-interactions', 'Loading States', 'Gesture Support']
    },
    {
      icon: 'build',
      title: 'Build Tool Integration',
      description: 'Generated components work seamlessly with modern build tools and development workflows.',
      benefits: ['Webpack Compatible', 'Vite Support', 'Rollup Integration', 'TypeScript Ready']
    },
    {
      icon: 'cloud_sync',
      title: 'Version Control & Collaboration',
      description: 'Built-in version control for your components with team collaboration and sharing features.',
      benefits: ['Git Integration', 'Team Workspaces', 'Component Versioning', 'Change Tracking']
    },
    {
      icon: 'analytics',
      title: 'Usage Analytics & Insights',
      description: 'Track component usage, performance metrics, and optimization opportunities across your projects.',
      benefits: ['Usage Tracking', 'Performance Metrics', 'Optimization Insights', 'Team Analytics']
    }
  ];
}