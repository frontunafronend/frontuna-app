import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { SeoService } from '../../../services/seo/seo.service';
import { GoogleAnalyticsService } from '../../../services/analytics/google-analytics.service';

@Component({
  selector: 'app-how-to-use',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatTabsModule,
    MatExpansionModule,
    MatDividerModule
  ],
  template: `
    <div class="how-to-use-container">
      <div class="container">
        <!-- Header -->
        <div class="page-header">
          <h1>
            <mat-icon>help_center</mat-icon>
            How to Use Frontuna.com
          </h1>
          <p>Complete guide to mastering component generation and app workflows</p>
        </div>

        <!-- Main Content Tabs -->
        <mat-tab-group class="main-tabs" animationDuration="300ms">
          
          <!-- Overview Tab -->
          <mat-tab label="Overview">
            <div class="tab-content">
              <div class="overview-section">
                <h2>Application Flow Overview</h2>
                <div class="flow-diagram">
                  <div class="flow-step" *ngFor="let step of appFlow; let i = index">
                    <div class="step-number">{{ i + 1 }}</div>
                    <div class="step-content">
                      <mat-card>
                        <mat-card-content>
                          <div class="step-header">
                            <mat-icon>{{ step.icon }}</mat-icon>
                            <h3>{{ step.title }}</h3>
                          </div>
                          <p>{{ step.description }}</p>
                          <div class="step-actions">
                            <button mat-button color="primary" [routerLink]="step.route" *ngIf="step.route">
                              Try Now
                            </button>
                          </div>
                        </mat-card-content>
                      </mat-card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Dashboard Tab -->
          <mat-tab label="Dashboard">
            <div class="tab-content">
              <div class="dashboard-guide">
                <h2>Dashboard Navigation</h2>
                
                <mat-expansion-panel *ngFor="let section of dashboardSections" class="guide-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>{{ section.icon }}</mat-icon>
                      {{ section.title }}
                    </mat-panel-title>
                    <mat-panel-description>
                      {{ section.description }}
                    </mat-panel-description>
                  </mat-expansion-panel-header>
                  
                  <div class="panel-content">
                    <div class="instructions">
                      <h4>How to Use:</h4>
                      <ol>
                        <li *ngFor="let instruction of section.instructions">{{ instruction }}</li>
                      </ol>
                    </div>
                    
                    <div class="features" *ngIf="section.features">
                      <h4>Key Features:</h4>
                      <ul>
                        <li *ngFor="let feature of section.features">{{ feature }}</li>
                      </ul>
                    </div>

                    <div class="tips" *ngIf="section.tips">
                      <h4>💡 Pro Tips:</h4>
                      <ul class="tips-list">
                        <li *ngFor="let tip of section.tips">{{ tip }}</li>
                      </ul>
                    </div>


                  </div>
                </mat-expansion-panel>
              </div>
            </div>
          </mat-tab>

          <!-- Generate Components Tab -->
          <mat-tab label="Generate Components">
            <div class="tab-content">
              <div class="generate-guide">
                <h2>Component Generation Mastery</h2>
                
                <div class="guide-sections">
                  <mat-card class="guide-card" *ngFor="let guide of generateGuides">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>{{ guide.icon }}</mat-icon>
                        {{ guide.title }}
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <p>{{ guide.description }}</p>
                      
                      <div class="guide-steps">
                        <h4>Step-by-Step:</h4>
                        <div class="step-list">
                          <div class="guide-step" *ngFor="let step of guide.steps; let i = index">
                            <span class="step-num">{{ i + 1 }}</span>
                            <span class="step-text">{{ step }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="sample-prompts" *ngIf="guide.samples">
                        <h4>Sample Prompts:</h4>
                        <div class="prompt-examples">
                          <div class="prompt-card" *ngFor="let sample of guide.samples">
                            <div class="prompt-header">
                              <strong>{{ sample.type }}:</strong>
                            </div>
                            <div class="prompt-text">{{ sample.prompt }}</div>
                            <div class="prompt-result">
                              <small><em>Result: {{ sample.description }}</em></small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Templates Tab -->
          <mat-tab label="Templates">
            <div class="tab-content">
              <div class="templates-guide">
                <h2>Working with Templates</h2>
                
                <div class="template-workflow">
                  <mat-card class="workflow-card">
                    <mat-card-header>
                      <mat-card-title>Template Workflow</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="workflow-steps">
                        <div class="workflow-step" *ngFor="let step of templateWorkflow; let i = index">
                          <div class="workflow-step-icon">
                            <mat-icon>{{ step.icon }}</mat-icon>
                          </div>
                          <div class="workflow-step-content">
                            <h4>{{ step.title }}</h4>
                            <p>{{ step.description }}</p>
                            <div class="step-details" *ngIf="step.details">
                              <ul>
                                <li *ngFor="let detail of step.details">{{ detail }}</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="troubleshooting-card">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>build</mat-icon>
                        Troubleshooting Templates
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="troubleshooting-list">
                        <div class="trouble-item" *ngFor="let trouble of templateTroubleshooting">
                          <div class="trouble-problem">
                            <mat-icon>error_outline</mat-icon>
                            <strong>{{ trouble.problem }}</strong>
                          </div>
                          <div class="trouble-solution">
                            <mat-icon>check_circle</mat-icon>
                            {{ trouble.solution }}
                          </div>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Editor Tab -->
          <mat-tab label="Monaco Editor">
            <div class="tab-content">
              <div class="editor-guide">
                <h2>Monaco Editor Guide</h2>
                
                <div class="editor-sections">
                  <mat-card class="editor-card" *ngFor="let section of editorSections">
                    <mat-card-header>
                      <mat-card-title>{{ section.title }}</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <p>{{ section.description }}</p>
                      
                      <div class="editor-features">
                        <h4>Available Features:</h4>
                        <div class="feature-grid">
                          <div class="feature-item" *ngFor="let feature of section.features">
                            <mat-icon>{{ feature.icon }}</mat-icon>
                            <div class="feature-content">
                              <strong>{{ feature.name }}</strong>
                              <span>{{ feature.shortcut }}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="editor-tips" *ngIf="section.tips">
                        <h4>Tips & Tricks:</h4>
                        <ul>
                          <li *ngFor="let tip of section.tips">{{ tip }}</li>
                        </ul>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Advanced Features Tab -->
          <mat-tab label="Advanced">
            <div class="tab-content">
              <div class="advanced-guide">
                <h2>Advanced Features & Workflows</h2>
                
                <div class="advanced-sections">
                  <mat-expansion-panel *ngFor="let advanced of advancedFeatures" class="advanced-panel">
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <mat-icon>{{ advanced.icon }}</mat-icon>
                        {{ advanced.title }}
                      </mat-panel-title>
                      <mat-panel-description>
                        {{ advanced.description }}
                      </mat-panel-description>
                    </mat-expansion-panel-header>
                    
                    <div class="advanced-content">
                      <div class="advanced-instructions">
                        <h4>How it Works:</h4>
                        <p>{{ advanced.explanation }}</p>
                        
                        <div class="advanced-steps">
                          <h4>Implementation Steps:</h4>
                          <ol>
                            <li *ngFor="let step of advanced.steps">{{ step }}</li>
                          </ol>
                        </div>

                        <div class="advanced-examples" *ngIf="advanced.examples">
                          <h4>Use Cases:</h4>
                          <div class="use-case-cards">
                            <mat-card *ngFor="let example of advanced.examples" class="use-case-card">
                              <mat-card-content>
                                <h5>{{ example.title }}</h5>
                                <p>{{ example.description }}</p>
                                <div class="use-case-result">
                                  <strong>Result:</strong> {{ example.result }}
                                </div>
                              </mat-card-content>
                            </mat-card>
                          </div>
                        </div>
                      </div>
                    </div>
                  </mat-expansion-panel>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-buttons">
            <button mat-raised-button color="primary" routerLink="/dashboard/generate">
              <mat-icon>auto_awesome</mat-icon>
              Start Generating
            </button>
            <button mat-raised-button color="accent" routerLink="/dashboard/templates">
              <mat-icon>view_module</mat-icon>
              Browse Templates
            </button>
            <button mat-stroked-button color="primary" routerLink="/dashboard">
              <mat-icon>dashboard</mat-icon>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .how-to-use-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem;
      background: rgba(255,255,255,0.95);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      backdrop-filter: blur(10px);
    }

    .page-header h1 {
      font-size: 3rem;
      font-weight: 700;
      color: #333;
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: center;
      margin: 0 0 1rem 0;
    }

    .page-header p {
      font-size: 1.2rem;
      color: #666;
      margin: 0;
    }

    .main-tabs {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      margin-bottom: 3rem;
    }

    .tab-content {
      padding: 2rem;
    }

    /* Overview Styles */
    .overview-section h2 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 2rem;
      color: #333;
      text-align: center;
    }

    .flow-diagram {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .flow-step {
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
      color: var(--secondary-color);
      font-size: 1.5rem;
    }

    .step-header h3 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
    }

    /* Dashboard Guide Styles */
    .dashboard-guide h2 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 2rem;
      color: #333;
      text-align: center;
    }

    .guide-panel {
      margin-bottom: 1rem;
    }

    .panel-content {
      padding: 1rem 0;
    }

    .instructions h4,
    .features h4,
    .tips h4,
    .examples h4 {
      color: #333;
      font-weight: 600;
      margin: 1.5rem 0 0.75rem 0;
    }

    .instructions ol,
    .features ul {
      margin: 0 0 1.5rem 0;
      padding-left: 1.5rem;
    }

    .instructions li,
    .features li {
      margin-bottom: 0.5rem;
      line-height: 1.5;
    }

    .tips-list {
      list-style: none;
      padding: 0;
      margin: 0 0 1.5rem 0;
    }

    .tips-list li {
      background: #f0f4ff;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      border-left: 4px solid var(--primary-color);
    }

    .example-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .example-card {
      background: #f8f9fa;
    }

    .example-card h5 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-weight: 600;
    }

    .example-card p {
      margin: 0 0 0.75rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .example-card code {
      background: #e9ecef;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: 'Monaco', monospace;
      font-size: 0.85rem;
    }

    /* Generate Guide Styles */
    .generate-guide h2 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 2rem;
      color: #333;
      text-align: center;
    }

    .guide-sections {
      display: grid;
      gap: 2rem;
    }

    .guide-card {
      transition: transform 0.2s ease;
    }

    .guide-card:hover {
      transform: translateY(-4px);
    }

    .guide-steps {
      margin-top: 1.5rem;
    }

    .step-list {
      margin-top: 1rem;
    }

    .guide-step {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .step-num {
      background: var(--primary-color);
      color: #333;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .step-text {
      line-height: 1.5;
    }

    .sample-prompts {
      margin-top: 2rem;
    }

    .prompt-examples {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .prompt-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid var(--secondary-color);
    }

    .prompt-header {
      color: var(--secondary-color);
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .prompt-text {
      background: white;
      padding: 0.75rem;
      border-radius: 4px;
      font-style: italic;
      margin-bottom: 0.5rem;
      border: 1px solid #e9ecef;
    }

    .prompt-result {
      color: #666;
      font-size: 0.85rem;
    }

    /* Template Guide Styles */
    .templates-guide h2 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 2rem;
      color: #333;
      text-align: center;
    }

    .template-workflow {
      display: grid;
      gap: 2rem;
    }

    .workflow-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .workflow-steps {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .workflow-step {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }

    .workflow-step-icon {
      background: var(--primary-color);
      color: #333;
      padding: 1rem;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .workflow-step-content h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-weight: 600;
    }

    .workflow-step-content p {
      margin: 0 0 1rem 0;
      color: #666;
      line-height: 1.5;
    }

    .step-details ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #555;
    }

    .step-details li {
      margin-bottom: 0.25rem;
    }

    .troubleshooting-card {
      background: #fff3e0;
    }

    .troubleshooting-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .trouble-item {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .trouble-problem,
    .trouble-solution {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .trouble-problem {
      color: #d32f2f;
    }

    .trouble-solution {
      color: #2e7d32;
      padding-left: 2rem;
    }

    /* Editor Guide Styles */
    .editor-guide h2 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 2rem;
      color: #333;
      text-align: center;
    }

    .editor-sections {
      display: grid;
      gap: 2rem;
    }

    .editor-card {
      background: linear-gradient(135deg, #f0f4ff 0%, #e6f3ff 100%);
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: white;
      padding: 0.75rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .feature-item mat-icon {
      color: var(--secondary-color);
    }

    .feature-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .feature-content strong {
      color: #333;
      font-size: 0.9rem;
    }

    .feature-content span {
      color: #666;
      font-size: 0.8rem;
      font-family: 'Monaco', monospace;
    }

    .editor-tips ul {
      margin: 1rem 0 0 0;
      padding-left: 1.5rem;
    }

    .editor-tips li {
      margin-bottom: 0.5rem;
      line-height: 1.5;
    }

    /* Advanced Guide Styles */
    .advanced-guide h2 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 2rem;
      color: #333;
      text-align: center;
    }

    .advanced-sections {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .advanced-panel {
      background: #f8f9fa;
    }

    .advanced-content {
      padding: 1rem 0;
    }

    .advanced-instructions h4 {
      color: #333;
      font-weight: 600;
      margin: 1.5rem 0 0.75rem 0;
    }

    .advanced-instructions p {
      margin: 0 0 1.5rem 0;
      line-height: 1.6;
      color: #555;
    }

    .advanced-steps ol {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }

    .advanced-steps li {
      margin-bottom: 0.5rem;
      line-height: 1.5;
    }

    .use-case-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .use-case-card {
      background: white;
      border-left: 4px solid var(--primary-color);
    }

    .use-case-card h5 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-weight: 600;
    }

    .use-case-card p {
      margin: 0 0 1rem 0;
      color: #666;
      line-height: 1.5;
    }

    .use-case-result {
      background: #f0f4ff;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .use-case-result strong {
      color: var(--secondary-color);
    }

    /* Quick Actions */
    .quick-actions {
      text-align: center;
      padding: 3rem 2rem;
      background: rgba(255,255,255,0.95);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      backdrop-filter: blur(10px);
    }

    .quick-actions h2 {
      font-size: 2rem;
      font-weight: 600;
      margin: 0 0 2rem 0;
      color: #333;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 600;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .how-to-use-container {
        padding: 1rem 0;
      }

      .container {
        padding: 0 1rem;
      }

      .page-header h1 {
        font-size: 2rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .tab-content {
        padding: 1rem;
      }

      .flow-step {
        flex-direction: column;
        text-align: center;
      }

      .workflow-step {
        flex-direction: column;
        text-align: center;
      }

      .feature-grid {
        grid-template-columns: 1fr;
      }

      .use-case-cards,
      .example-cards {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
        align-items: center;
      }

      .action-buttons button {
        width: 100%;
        max-width: 300px;
      }
    }
  `]
})
export class HowToUseComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);

  public readonly appFlow = [
    {
      icon: 'login',
      title: 'Sign In & Access Dashboard',
      description: 'Start by signing in to access your personalized dashboard with stats, recent components, and quick actions.',
      route: '/dashboard'
    },
    {
      icon: 'auto_awesome',
      title: 'Generate Components',
      description: 'Use AI to generate components by describing what you need. Choose framework, design system, and features.',
      route: '/dashboard/generate'
    },
    {
      icon: 'view_module',
      title: 'Browse Templates',
      description: 'Explore pre-built templates for common components. Preview and customize them to your needs.',
      route: '/dashboard/templates'
    },
    {
      icon: 'edit',
      title: 'Edit with Monaco Editor',
      description: 'Use the integrated Monaco Editor to modify generated code with syntax highlighting and auto-completion.',
      route: null
    },
    {
      icon: 'save',
      title: 'Save & Export',
      description: 'Save components to your library, export as files, or download complete projects with dependencies.',
      route: '/dashboard/export'
    }
  ];

  public readonly dashboardSections = [
    {
      icon: 'dashboard',
      title: 'Main Dashboard',
      description: 'Overview of your account, usage, and quick actions',
      instructions: [
        'View your monthly usage and remaining generations',
        'Check your current subscription plan',
        'See recent component generation activity',
        'Access quick action cards for common tasks'
      ],
      features: [
        'Real-time usage tracking',
        'Quick stats overview',
        'Recent components list',
        'One-click access to main features'
      ],
      tips: [
        'Click on recent components to view/edit them',
        'Use quick action cards for faster navigation',
        'Monitor your usage to avoid hitting limits'
      ]
    },
    {
      icon: 'auto_awesome',
      title: 'Generate Components',
      description: 'AI-powered component generation',
      instructions: [
        'Click "Generate Component" from dashboard or sidebar',
        'Fill out the component description (be specific!)',
        'Choose your framework (React, Angular, Vue)',
        'Select design framework (Bootstrap, Material-UI, etc.)',
        'Toggle features like responsive design, TypeScript, etc.',
        'Click "Generate Component" and wait for AI magic',
        'Review generated code in Monaco Editor tabs',
        'Make edits directly in the editor',
        'Save, download, or share your component'
      ],
      features: [
        'Multi-framework support',
        'Live Monaco Editor integration',
        'Real-time preview',
        'Feature toggles',
        'Instant code generation'
      ],
      tips: [
        'Be specific in your descriptions for better results',
        'Use the preview tab to see your component in action',
        'Edit code directly in the Monaco Editor for customization',
        'Save successful generations to your library'
      ]
    },
    {
      icon: 'view_module',
      title: 'Templates',
      description: 'Pre-built component templates',
      instructions: [
        'Browse available templates by category',
        'Click "Preview" to see template in action',
        'Use filters to find specific types',
        'Click "Use Template" to pre-fill generator',
        'Customize the template in the generator',
        'Generate your customized version'
      ],
      features: [
        'Category filtering',
        'Live preview modal',
        'Pre-filled generation',
        'Multiple frameworks available'
      ],
      tips: [
        'Templates are great starting points for customization',
        'Preview before using to ensure it matches your needs',
        'Templates automatically fill the generator form'
      ]
    },
    {
      icon: 'history',
      title: 'Generation History',
      description: 'View and manage your generated components',
      instructions: [
        'View all your previously generated components',
        'Filter by framework, date, or category',
        'Click on any component to view details',
        'Edit components using the built-in Monaco Editor',
        'Save favorites to your library',
        'Regenerate variations of existing components'
      ],
      features: [
        'Complete generation history',
        'Advanced filtering',
        'Component editing',
        'Regeneration options'
      ],
      tips: [
        'Use history to iterate on previous generations',
        'Filter by framework to find specific components',
        'Save your best components to the library'
      ]
    }
  ];

  public readonly generateGuides = [
    {
      icon: 'description',
      title: 'Writing Effective Prompts',
      description: 'Learn how to write prompts that generate exactly what you need',
      steps: [
        'Start with the component type (button, card, modal, etc.)',
        'Describe the visual appearance and style',
        'Specify functionality and interactions',
        'Mention any specific requirements',
        'Include responsive behavior if needed'
      ],
      samples: [
        {
          type: 'Button Component',
          prompt: 'A modern gradient button with hover animations, rounded corners, and support for icons and loading states',
          description: 'Generates a styled button with animations and state management'
        },
        {
          type: 'Navigation Component',
          prompt: 'A responsive navigation header with logo, menu items, mobile hamburger menu, and smooth transitions',
          description: 'Creates a complete navigation system with mobile responsiveness'
        },
        {
          type: 'Card Component',
          prompt: 'A product card with image, title, price, description, and action buttons with subtle shadow and hover effects',
          description: 'Builds a comprehensive product display card'
        }
      ]
    },
    {
      icon: 'settings',
      title: 'Framework Selection',
      description: 'Choose the right framework for your project',
      steps: [
        'Consider your project\'s existing technology stack',
        'Choose React for flexibility and ecosystem',
        'Choose Angular for enterprise applications',
        'Choose Vue for ease of learning and integration',
        'Match your team\'s expertise'
      ]
    },
    {
      icon: 'palette',
      title: 'Design Framework Integration',
      description: 'Select design frameworks that match your project',
      steps: [
        'Bootstrap for rapid prototyping and consistency',
        'Material-UI for Google Material Design',
        'Tailwind CSS for utility-first approach',
        'Plain CSS for complete customization',
        'Consider your design system requirements'
      ]
    }
  ];

  public readonly templateWorkflow = [
    {
      icon: 'search',
      title: 'Browse Templates',
      description: 'Explore our curated collection of component templates',
      details: [
        'Filter by category (UI, Forms, Navigation, Layout)',
        'Preview components before using',
        'See framework and design system compatibility'
      ]
    },
    {
      icon: 'visibility',
      title: 'Preview Templates',
      description: 'See how templates look and behave before using them',
      details: [
        'Interactive preview modal',
        'Full-screen preview option',
        'Component functionality demonstration'
      ]
    },
    {
      icon: 'add',
      title: 'Use Template',
      description: 'Apply template to pre-fill the component generator',
      details: [
        'Automatically fills generator form',
        'Pre-selects matching framework and design system',
        'Provides base description for customization'
      ]
    },
    {
      icon: 'edit',
      title: 'Customize & Generate',
      description: 'Modify the template to match your specific needs',
      details: [
        'Edit the auto-filled description',
        'Adjust framework or design system if needed',
        'Add or remove features',
        'Generate your customized version'
      ]
    }
  ];

  public readonly templateTroubleshooting = [
    {
      problem: 'Template preview not loading',
      solution: 'Refresh the page and try again. Check your internet connection.'
    },
    {
      problem: 'Template doesn\'t match my framework',
      solution: 'Use the template as inspiration and change the framework in the generator.'
    },
    {
      problem: 'Generated component differs from template',
      solution: 'Templates are starting points. Customize the description for exact matches.'
    },
    {
      problem: 'Can\'t find a specific template type',
      solution: 'Use the search and filter options, or generate a custom component instead.'
    }
  ];

  public readonly editorSections = [
    {
      title: 'Basic Editing',
      description: 'Essential Monaco Editor features for code editing',
      features: [
        { icon: 'edit', name: 'Edit Code', shortcut: 'Click to edit' },
        { icon: 'content_copy', name: 'Copy Code', shortcut: 'Ctrl+C' },
        { icon: 'content_paste', name: 'Paste Code', shortcut: 'Ctrl+V' },
        { icon: 'undo', name: 'Undo', shortcut: 'Ctrl+Z' },
        { icon: 'redo', name: 'Redo', shortcut: 'Ctrl+Y' }
      ],
      tips: [
        'Click anywhere in the editor to start typing',
        'Use Ctrl+A to select all text',
        'The editor automatically saves changes',
        'Syntax highlighting works for TypeScript, JavaScript, CSS, and HTML'
      ]
    },
    {
      title: 'Advanced Features',
      description: 'Power user features for enhanced productivity',
      features: [
        { icon: 'format_color_text', name: 'Format Code', shortcut: 'Shift+Alt+F' },
        { icon: 'search', name: 'Find & Replace', shortcut: 'Ctrl+F' },
        { icon: 'fullscreen', name: 'Fullscreen', shortcut: 'F11 or button' },
        { icon: 'select_all', name: 'Multi-cursor', shortcut: 'Alt+Click' },
        { icon: 'code', name: 'Command Palette', shortcut: 'Ctrl+Shift+P' }
      ],
      tips: [
        'Use multi-cursor editing for batch changes',
        'Fullscreen mode provides more editing space',
        'Format code regularly for better readability',
        'The command palette provides access to all features'
      ]
    },
    {
      title: 'Language Support',
      description: 'Monaco Editor supports multiple programming languages',
      features: [
        { icon: 'code', name: 'TypeScript', shortcut: '.ts files' },
        { icon: 'javascript', name: 'JavaScript', shortcut: '.js files' },
        { icon: 'style', name: 'CSS/SCSS', shortcut: '.css files' },
        { icon: 'web', name: 'HTML', shortcut: '.html files' },
        { icon: 'data_object', name: 'JSON', shortcut: '.json files' }
      ],
      tips: [
        'Language is automatically detected from file extension',
        'IntelliSense provides auto-completion',
        'Error detection helps catch issues early',
        'Syntax highlighting improves code readability'
      ]
    }
  ];

  public readonly advancedFeatures = [
    {
      icon: 'psychology',
      title: 'AI-Powered Code Enhancement',
      description: 'Leverage AI to improve and optimize your generated components',
      explanation: 'Our AI doesn\'t just generate code—it optimizes it for performance, accessibility, and best practices.',
      steps: [
        'Generate your initial component',
        'Review the code in Monaco Editor',
        'Use the "Enhance" feature to apply AI optimizations',
        'Compare before and after versions',
        'Apply enhancements selectively'
      ],
      examples: [
        {
          title: 'Performance Optimization',
          description: 'AI adds memoization and lazy loading',
          result: 'Faster rendering and reduced bundle size'
        },
        {
          title: 'Accessibility Enhancement',
          description: 'AI adds ARIA labels and keyboard navigation',
          result: 'WCAG compliant components'
        }
      ]
    },
    {
      icon: 'sync',
      title: 'Component Versioning',
      description: 'Track changes and manage different versions of your components',
      explanation: 'Keep track of component evolution and easily revert to previous versions.',
      steps: [
        'Generate or edit a component',
        'Save creates a new version automatically',
        'View version history in component details',
        'Compare versions side-by-side',
        'Restore any previous version'
      ],
      examples: [
        {
          title: 'Iterative Design',
          description: 'Try different approaches without losing work',
          result: 'Safe experimentation and design evolution'
        }
      ]
    },
    {
      icon: 'share',
      title: 'Component Sharing & Collaboration',
      description: 'Share components with team members and the community',
      explanation: 'Collaborate on components and share your best creations.',
      steps: [
        'Generate and refine your component',
        'Click the share button',
        'Choose sharing permissions (team/public)',
        'Copy the share link',
        'Others can view, fork, and use your component'
      ],
      examples: [
        {
          title: 'Team Collaboration',
          description: 'Share components within your organization',
          result: 'Consistent design system across projects'
        },
        {
          title: 'Public Gallery',
          description: 'Contribute to the community template library',
          result: 'Help other developers and gain recognition'
        }
      ]
    },
    {
      icon: 'extension',
      title: 'Plugin System',
      description: 'Extend functionality with custom plugins and integrations',
      explanation: 'Connect Frontuna with your existing tools and workflows.',
      steps: [
        'Browse available plugins in settings',
        'Install plugins for your tools (Figma, Storybook, etc.)',
        'Configure plugin settings',
        'Use enhanced features in your workflow',
        'Create custom plugins if needed'
      ],
      examples: [
        {
          title: 'Figma Integration',
          description: 'Import designs directly from Figma',
          result: 'Pixel-perfect code from designs'
        },
        {
          title: 'Storybook Export',
          description: 'Automatically generate Storybook stories',
          result: 'Documentation and testing ready components'
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'How to Use Frontuna.com - Complete Guide',
      description: 'Complete guide to using Frontuna.com for AI-powered component generation, templates, Monaco Editor, and advanced features.',
      url: 'https://frontuna.com/how-to-use'
    });

    this.analyticsService.trackPageView({
      page_title: 'How To Use Guide',
      page_location: window.location.href
    });
  }
}