import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

import { SeoService } from '../../../services/seo/seo.service';
import { GoogleAnalyticsService } from '../../../services/analytics/google-analytics.service';

export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  action: string;
  expectedResult: string;
  tips?: string[];
  codeExample?: string;
  imageUrl?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  category: string;
  tags: string[];
  objectives: string[];
  prerequisites: string[];
  steps: TutorialStep[];
  finalResult: string;
  nextSteps?: string[];
}

@Component({
  selector: 'app-tutorials',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatButtonModule, 
    MatCardModule, 
    MatIconModule,
    MatTabsModule,
    MatExpansionModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  template: `
    <div class="tutorials-container">
      <div class="container">
        <!-- Header -->
        <div class="page-header">
          <h1>
            <mat-icon>school</mat-icon>
            Interactive Tutorials
          </h1>
          <p>Master Frontuna.com with step-by-step video tutorials and hands-on examples</p>
          <div class="header-stats">
            <div class="stat-item">
              <mat-icon>play_circle</mat-icon>
              <span>{{ tutorials.length }} Tutorials</span>
            </div>
            <div class="stat-item">
              <mat-icon>schedule</mat-icon>
              <span>2-15 min each</span>
            </div>
            <div class="stat-item">
              <mat-icon>trending_up</mat-icon>
              <span>Beginner to Advanced</span>
            </div>
          </div>
        </div>

        <!-- Featured Tutorial -->
        <div class="featured-section">
          <mat-card class="featured-tutorial">
            <div class="featured-content">
              <div class="featured-info">
                <div class="featured-badge">
                  <mat-icon>star</mat-icon>
                  <span>Most Popular</span>
                </div>
                <h2>{{ featuredTutorial.title }}</h2>
                <p>{{ featuredTutorial.description }}</p>
                <div class="tutorial-meta">
                  <mat-chip class="difficulty-chip" [class]="'difficulty-' + featuredTutorial.difficulty">
                    {{ featuredTutorial.difficulty | titlecase }}
                  </mat-chip>
                  <mat-chip class="duration-chip">
                    <mat-icon>schedule</mat-icon>
                    {{ featuredTutorial.duration }}
                  </mat-chip>
                  <mat-chip class="category-chip">{{ featuredTutorial.category }}</mat-chip>
                </div>
                <button mat-raised-button color="primary" class="start-tutorial-btn" (click)="startTutorial(featuredTutorial.id)">
                  <mat-icon>play_arrow</mat-icon>
                  Start Tutorial
                </button>
              </div>
              <div class="featured-preview">
                <div class="video-placeholder">
                  <mat-icon>play_circle_filled</mat-icon>
                  <span>Tutorial Preview</span>
                </div>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- All Tutorials -->
        <div class="tutorials-section">
          <div class="section-header">
            <h2>All Tutorials</h2>
            <div class="tutorial-filters">
              <button mat-button 
                      *ngFor="let difficulty of difficulties" 
                      [class.active]="selectedDifficulty === difficulty"
                      (click)="filterByDifficulty(difficulty)">
                {{ difficulty | titlecase }}
              </button>
            </div>
          </div>

          <div class="tutorials-grid">
            <mat-card class="tutorial-card" *ngFor="let tutorial of filteredTutorials; trackBy: trackTutorial">
              <div class="tutorial-header">
                <div class="tutorial-thumbnail">
                  <mat-icon>{{ getTutorialIcon(tutorial.category) }}</mat-icon>
                  <div class="play-overlay">
                    <mat-icon>play_arrow</mat-icon>
                  </div>
                </div>
                <div class="tutorial-badges">
                  <mat-chip class="difficulty-chip" [class]="'difficulty-' + tutorial.difficulty">
                    {{ tutorial.difficulty }}
                  </mat-chip>
                </div>
              </div>
              
              <mat-card-content>
                <h3>{{ tutorial.title }}</h3>
                <p class="tutorial-description">{{ tutorial.description }}</p>
                
                <div class="tutorial-info">
                  <div class="info-item">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ tutorial.duration }}</span>
                  </div>
                  <div class="info-item">
                    <mat-icon>list</mat-icon>
                    <span>{{ tutorial.steps.length }} steps</span>
                  </div>
                  <div class="info-item">
                    <mat-icon>category</mat-icon>
                    <span>{{ tutorial.category }}</span>
                  </div>
                </div>

                <div class="tutorial-tags">
                  <mat-chip class="tag-chip" *ngFor="let tag of tutorial.tags.slice(0, 3)">
                    {{ tag }}
                  </mat-chip>
                  <span *ngIf="tutorial.tags.length > 3" class="more-tags">+{{ tutorial.tags.length - 3}}</span>
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button (click)="previewTutorial(tutorial.id)">
                  <mat-icon>visibility</mat-icon>
                  Preview
                </button>
                <button mat-raised-button color="primary" (click)="startTutorial(tutorial.id)">
                  <mat-icon>play_arrow</mat-icon>
                  Start Tutorial
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>

        <!-- Quick Start Guide -->
        <div class="quick-start-section">
          <mat-card class="quick-start-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>rocket_launch</mat-icon>
                Quick Start Guide
              </mat-card-title>
              <mat-card-subtitle>Get started in 5 minutes</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="quick-steps">
                <div class="quick-step" *ngFor="let step of quickStartSteps; let i = index">
                  <div class="quick-step-number">{{ i + 1 }}</div>
                  <div class="quick-step-content">
                    <h4>{{ step.title }}</h4>
                    <p>{{ step.description }}</p>
                  </div>
                  <mat-icon class="quick-step-icon">{{ step.icon }}</mat-icon>
                </div>
              </div>
              <div class="quick-start-actions">
                <button mat-raised-button color="primary" routerLink="/dashboard/generate">
                  <mat-icon>auto_awesome</mat-icon>
                  Start Generating
                </button>
                <button mat-button routerLink="/how-to-use">
                  <mat-icon>help_center</mat-icon>
                  View Full Guide
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tutorials-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem 0;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 4rem;
      padding: 3rem 2rem;
      background: rgba(255,255,255,0.95);
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      backdrop-filter: blur(10px);
    }

    .page-header h1 {
      font-size: 3.5rem;
      font-weight: 700;
      color: #333;
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: center;
      margin: 0 0 1rem 0;
      background: linear-gradient(45deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-stats {
      display: flex;
      justify-content: center;
      gap: 3rem;
      margin-top: 2rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #555;
      font-weight: 500;
    }

    .featured-section {
      margin-bottom: 4rem;
    }

    .featured-tutorial {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      overflow: hidden;
    }

    .featured-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      padding: 3rem;
      align-items: center;
    }

    .featured-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.2);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .video-placeholder {
      width: 400px;
      height: 225px;
      background: rgba(0,0,0,0.3);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .video-placeholder:hover {
      transform: scale(1.05);
    }

    .tutorials-section {
      margin-bottom: 4rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .tutorials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 2rem;
    }

    .tutorial-card {
      transition: all 0.3s ease;
      cursor: pointer;
      overflow: hidden;
    }

    .tutorial-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.15);
    }

    .tutorial-header {
      position: relative;
      height: 200px;
      background: linear-gradient(45deg, #f0f2f5, #e9ecef);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .difficulty-chip {
      font-weight: 600;
    }

    .difficulty-beginner {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .difficulty-intermediate {
      background: #fff3e0;
      color: #f57c00;
    }

    .difficulty-advanced {
      background: #ffebee;
      color: #d32f2f;
    }

    .quick-start-section {
      margin-top: 4rem;
    }

    .quick-steps {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .quick-step {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .quick-step-number {
      width: 40px;
      height: 40px;
      background: var(--primary-color);
      color: #333;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .tutorials-container {
        padding: 1rem 0;
      }

      .container {
        padding: 0 1rem;  
      }

      .page-header h1 {
        font-size: 2.5rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .featured-content {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .tutorials-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TutorialsComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);

  selectedDifficulty = 'all';

  // Tutorial data - 3 comprehensive mock examples
  public readonly tutorials: Tutorial[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with Component Generation',
      description: 'Learn the fundamentals of creating your first AI-generated component from scratch. Perfect for beginners who want to understand the core workflow.',
      difficulty: 'beginner',
      duration: '8 minutes',
      category: 'Getting Started',
      tags: ['beginner', 'basics', 'first-component', 'ai-generation'],
      objectives: [
        'Understand the component generation workflow',
        'Learn how to write effective prompts',
        'Master the basic interface navigation',
        'Generate your first working component',
        'Preview and test generated code'
      ],
      prerequisites: [
        'Basic understanding of web development',
        'Familiarity with HTML/CSS',
        'Frontuna.com account (free signup)',
        'Modern web browser'
      ],
      steps: [
        {
          id: 1,
          title: 'Access the Generator',
          description: 'Navigate to the component generator and familiarize yourself with the interface.',
          action: 'Click on "Generate Component" from the dashboard or sidebar navigation.',
          expectedResult: 'You should see the component generation interface with configuration options on the left and preview area on the right.',
          tips: [
            'Take a moment to explore all the available options',
            'Notice the real-time preview area where your component will appear'
          ]
        },
        {
          id: 2,
          title: 'Write Your First Prompt',
          description: 'Learn how to describe your component effectively to get the best AI-generated results.',
          action: 'In the description field, type: "Create a modern button component with hover effects, rounded corners, and support for different sizes (small, medium, large)"',
          expectedResult: 'The description field should contain your prompt text and validation should pass.',
          codeExample: 'Create a [component type] with [visual features], [interactions], and [functionality]',
          tips: [
            'Be specific about colors, sizes, and visual effects',
            'Mention any interactive behaviors you want',
            'Include responsive design requirements if needed'
          ]
        },
        {
          id: 3,
          title: 'Generate Your Component',
          description: 'Trigger the AI generation process and watch your component come to life.',
          action: 'Click the "Generate Component" button and wait for the AI to process your request.',
          expectedResult: 'You should see a loading indicator, followed by generated code appearing in multiple tabs (Component, Styles, Types).',
          tips: [
            'Generation typically takes 10-30 seconds',
            'Don\'t refresh the page during generation'
          ]
        }
      ],
      finalResult: 'Congratulations! You\'ve successfully generated, previewed, and exported your first AI-created component. You now understand the complete workflow from prompt to production-ready code.',
      nextSteps: [
        'Try generating different types of components (cards, forms, navigation)',
        'Experiment with different frameworks',
        'Learn advanced prompting techniques'
      ]
    },
    {
      id: 'advanced-prompting',
      title: 'Advanced Prompting Techniques',
      description: 'Master the art of writing prompts that generate exactly what you need. Learn advanced techniques, patterns, and best practices for complex components.',
      difficulty: 'intermediate',
      duration: '12 minutes',
      category: 'AI Techniques',
      tags: ['prompting', 'ai', 'advanced', 'techniques', 'optimization'],
      objectives: [
        'Master advanced prompting patterns and techniques',
        'Learn to specify complex interactions and behaviors',
        'Generate components with multiple features and states',
        'Optimize prompts for better AI understanding'
      ],
      prerequisites: [
        'Completed "Getting Started" tutorial',
        'Basic understanding of component architecture',
        'Familiarity with at least one frontend framework'
      ],
      steps: [
        {
          id: 1,
          title: 'Understanding Prompt Structure',
          description: 'Learn the anatomy of effective prompts and how to structure them for maximum clarity.',
          action: 'Study the prompt template and create a complex component description using the structured approach.',
          expectedResult: 'You should understand the key elements that make prompts effective and clear.',
          codeExample: '[COMPONENT TYPE] + [VISUAL DESIGN] + [FUNCTIONALITY] + [INTERACTIONS]',
          tips: [
            'Start with the component type (button, card, modal, etc.)',
            'Describe visual appearance in detail',
            'Specify all interactive behaviors'
          ]
        },
        {
          id: 2,
          title: 'Specifying Complex Interactions',
          description: 'Learn how to describe complex user interactions and component behaviors.',
          action: 'Create a prompt for a multi-step form wizard with validation, progress tracking, and conditional fields.',
          expectedResult: 'Your prompt should clearly describe each interaction pattern and how they work together.',
          tips: [
            'Break complex behaviors into clear sections',
            'Describe user flows step by step',
            'Specify validation rules and error handling'
          ]
        }
      ],
      finalResult: 'You\'ve mastered advanced prompting techniques! You can now generate complex, well-structured components with sophisticated features.',
      nextSteps: [
        'Practice with real-world complex components',
        'Learn about component architecture patterns',
        'Explore the Monaco Editor integration tutorial'
      ]
    },
    {
      id: 'monaco-editor-mastery',
      title: 'Monaco Editor Integration & Code Editing',
      description: 'Master the integrated Monaco Editor to customize, edit, and enhance your generated components. Learn advanced editing features, shortcuts, and collaboration workflows.',
      difficulty: 'advanced',
      duration: '15 minutes',
      category: 'Code Editing',
      tags: ['monaco-editor', 'code-editing', 'advanced', 'customization', 'productivity'],
      objectives: [
        'Master all Monaco Editor features and shortcuts',
        'Learn code editing and refactoring techniques',
        'Understand multi-cursor editing and find/replace',
        'Customize the editor for maximum productivity'
      ],
      prerequisites: [
        'Completed previous tutorials',
        'Experience with code editors (VS Code, Atom, etc.)',
        'Understanding of JavaScript/TypeScript syntax'
      ],
      steps: [
        {
          id: 1,
          title: 'Monaco Editor Overview',
          description: 'Get familiar with the Monaco Editor interface and basic navigation.',
          action: 'Generate any component and navigate to the code editing tabs. Explore the editor interface, toolbars, and available features.',
          expectedResult: 'You should see the Monaco Editor with syntax highlighting, line numbers, and editor toolbar.',
          tips: [
            'Monaco Editor is the same editor that powers VS Code',
            'All VS Code shortcuts work in Monaco Editor'
          ]
        },
        {
          id: 2,
          title: 'Essential Keyboard Shortcuts',
          description: 'Learn the most important keyboard shortcuts for efficient code editing.',
          action: 'Practice these shortcuts while editing your generated component code.',
          expectedResult: 'You should be comfortable using shortcuts for common editing tasks.',
          codeExample: 'Ctrl+D - Select next occurrence\nCtrl+Shift+L - Select all occurrences\nAlt+Click - Add cursor',
          tips: [
            'Practice shortcuts in order of frequency',
            'Multi-cursor editing is one of the most powerful features'
          ]
        }
      ],
      finalResult: 'You\'ve mastered Monaco Editor! You can now efficiently edit, refactor, and customize generated components using advanced editor features.',
      nextSteps: [
        'Practice advanced editing techniques on real projects',
        'Explore VS Code extensions that work with Monaco',
        'Learn about collaborative editing features'
      ]
    }
  ];

  public readonly featuredTutorial = this.tutorials[0];
  public readonly difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  public readonly quickStartSteps = [
    {
      title: 'Sign Up & Access Dashboard',
      description: 'Create your free account and explore the main dashboard',
      icon: 'person_add'
    },
    {
      title: 'Write Your First Prompt',
      description: 'Describe the component you want to create in natural language',
      icon: 'edit'
    },
    {
      title: 'Generate & Preview',
      description: 'Watch AI create your component and see it in live preview',
      icon: 'auto_awesome'
    },
    {
      title: 'Customize & Export',
      description: 'Edit the code if needed and download for your project',
      icon: 'download'
    }
  ];

  public get filteredTutorials(): Tutorial[] {
    return this.tutorials.filter(tutorial => {
      return this.selectedDifficulty === 'all' || tutorial.difficulty === this.selectedDifficulty;
    });
  }

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'Interactive Tutorials - Master Frontuna.com',
      description: 'Learn Frontuna.com with step-by-step video tutorials. Master AI component generation, advanced prompting, Monaco Editor, and professional workflows.',
      url: 'https://frontuna.com/tutorials'
    });

    this.analyticsService.trackPageView({
      page_title: 'Tutorials',
      page_location: window.location.href
    });
  }

  filterByDifficulty(difficulty: string): void {
    this.selectedDifficulty = difficulty;
    this.analyticsService.trackEvent({
      action: 'filter_tutorials',
      category: 'tutorials',
      label: `difficulty_${difficulty}`
    });
  }

  startTutorial(tutorialId: string): void {
    this.analyticsService.trackEvent({
      action: 'start_tutorial',
      category: 'tutorials',
      label: tutorialId
    });
    
    const tutorial = this.tutorials.find(t => t.id === tutorialId);
    alert(`Starting tutorial: ${tutorial?.title}\n\nThis would open the interactive tutorial player with:\n• ${tutorial?.steps.length} step-by-step instructions\n• Video demonstrations\n• Hands-on practice exercises\n• Progress tracking`);
  }

  previewTutorial(tutorialId: string): void {
    const tutorial = this.tutorials.find(t => t.id === tutorialId);
    if (tutorial) {
      this.analyticsService.trackEvent({
        action: 'preview_tutorial', 
        category: 'tutorials',
        label: tutorialId
      });
      
      alert(`Tutorial Preview: ${tutorial.title}\n\nDuration: ${tutorial.duration}\nSteps: ${tutorial.steps.length}\nDifficulty: ${tutorial.difficulty}\n\nObjectives:\n${tutorial.objectives.map(obj => `• ${obj}`).join('\n')}`);
    }
  }

  getTutorialIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'Getting Started': 'rocket_launch',
      'AI Techniques': 'psychology',
      'Code Editing': 'code',
      'Advanced Workflows': 'engineering'
    };
    return iconMap[category] || 'play_circle';
  }

  trackTutorial(index: number, tutorial: Tutorial): string {
    return tutorial.id;
  }
}