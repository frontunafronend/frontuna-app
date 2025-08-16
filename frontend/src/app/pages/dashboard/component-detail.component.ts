import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SeoService } from '@app/services/seo/seo.service';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';

@Component({
  selector: 'app-component-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatTooltipModule
  ],
  template: `
    <div class="component-detail-layout">
      @if (component) {
        <div class="detail-header">
          <button mat-icon-button routerLink="/dashboard" class="back-btn" matTooltip="Back to Dashboard">
            <mat-icon>arrow_back</mat-icon>
          </button>
          
          <div class="header-content">
            <h1>{{ component.name }}</h1>
            <p>{{ component.description }}</p>
            <div class="component-meta">
              <mat-chip class="framework-chip">{{ component.framework }}</mat-chip>
              <mat-chip class="category-chip">{{ component.category }}</mat-chip>
              <span class="created-date">Created {{ component.createdAt | date:'medium' }}</span>
            </div>
          </div>

          <div class="header-actions">
            <button mat-icon-button (click)="saveToLibrary()" [disabled]="component.isSaved" matTooltip="Save to Library">
              <mat-icon>{{ component.isSaved ? 'bookmark' : 'bookmark_border' }}</mat-icon>
            </button>
            <button mat-icon-button (click)="downloadComponent()" matTooltip="Download">
              <mat-icon>download</mat-icon>
            </button>
            <button mat-icon-button (click)="shareComponent()" matTooltip="Share">
              <mat-icon>share</mat-icon>
            </button>
            <button mat-raised-button color="primary" (click)="regenerateComponent()">
              <mat-icon>refresh</mat-icon>
              Regenerate
            </button>
          </div>
        </div>

        <div class="detail-content">
          <mat-tab-group>
            <mat-tab label="Preview">
              <div class="preview-section">
                <div class="preview-container">
                  <div class="preview-frame">
                    <div class="component-preview" [innerHTML]="component.preview"></div>
                  </div>
                </div>
                
                <div class="preview-info">
                  <h3>Component Preview</h3>
                  <p>Interactive preview of your generated component</p>
                  <div class="preview-stats">
                    <div class="stat">
                      <mat-icon>code</mat-icon>
                      <span>{{ component.linesOfCode }} lines</span>
                    </div>
                    <div class="stat">
                      <mat-icon>schedule</mat-icon>
                      <span>Generated in {{ component.generationTime }}s</span>
                    </div>
                    <div class="stat">
                      <mat-icon>file_present</mat-icon>
                      <span>{{ component.fileCount }} files</span>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="HTML">
              <div class="code-section">
                <div class="code-header">
                  <h3>HTML Structure</h3>
                  <button mat-icon-button (click)="copyCode('html')" matTooltip="Copy HTML">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </div>
                <div class="code-viewer">
                  <pre><code>{{ component.code.html }}</code></pre>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="CSS">
              <div class="code-section">
                <div class="code-header">
                  <h3>Styles</h3>
                  <button mat-icon-button (click)="copyCode('css')" matTooltip="Copy CSS">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </div>
                <div class="code-viewer">
                  <pre><code>{{ component.code.css }}</code></pre>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="JavaScript">
              <div class="code-section">
                <div class="code-header">
                  <h3>Logic & Functionality</h3>
                  <button mat-icon-button (click)="copyCode('js')" matTooltip="Copy JavaScript">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </div>
                <div class="code-viewer">
                  <pre><code>{{ component.code.javascript }}</code></pre>
                </div>
              </div>
            </mat-tab>

            @if (component.tests) {
              <mat-tab label="Tests">
                <div class="code-section">
                  <div class="code-header">
                    <h3>Unit Tests</h3>
                    <button mat-icon-button (click)="copyCode('tests')" matTooltip="Copy Tests">
                      <mat-icon>content_copy</mat-icon>
                    </button>
                  </div>
                  <div class="code-viewer">
                    <pre><code>{{ component.tests }}</code></pre>
                  </div>
                </div>
              </mat-tab>
            }
          </mat-tab-group>
        </div>
      } @else {
        <div class="loading-state">
          <mat-icon>hourglass_empty</mat-icon>
          <h3>Loading component...</h3>
        </div>
      }
    </div>
  `,
  styles: [`
    .component-detail-layout {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .detail-header {
      display: flex;
      align-items: flex-start;
      gap: 2rem;
      margin-bottom: 2rem;
      padding: 2rem;
      background: rgba(255,255,255,0.95);
      border-radius: var(--border-radius-xl);
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      backdrop-filter: blur(10px);
    }

    .back-btn {
      flex-shrink: 0;
      margin-top: 0.5rem;
    }

    .header-content {
      flex: 1;
    }

    .header-content h1 {
      font-size: 2.2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .header-content p {
      color: #666;
      font-size: 1.1rem;
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }

    .component-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .framework-chip {
      background: var(--secondary-color);
      color: white;
    }

    .category-chip {
      background: var(--primary-color);
      color: #333;
    }

    .created-date {
      font-size: 0.9rem;
      color: #999;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .detail-content {
      background: white;
      border-radius: var(--border-radius-xl);
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .preview-section {
      padding: 2rem;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .preview-container {
      background: #f8f9fa;
      border-radius: var(--border-radius);
      padding: 1rem;
    }

    .preview-frame {
      background: white;
      border-radius: var(--border-radius);
      padding: 2rem;
      min-height: 400px;
      border: 1px solid #e0e0e0;
    }

    .component-preview {
      width: 100%;
      height: 100%;
    }

    .preview-info h3 {
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .preview-info p {
      color: #666;
      margin: 0 0 2rem 0;
    }

    .preview-stats {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: var(--border-radius);
    }

    .stat mat-icon {
      color: var(--secondary-color);
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .code-section {
      padding: 2rem;
    }

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .code-header h3 {
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0;
      color: #333;
    }

    .code-viewer {
      background: #1e1e1e;
      border-radius: var(--border-radius);
      overflow: auto;
      max-height: 600px;
    }

    .code-viewer pre {
      margin: 0;
      padding: 2rem;
      color: #d4d4d4;
      font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
      font-size: 0.9rem;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .loading-state mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 1rem;
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-state h3 {
      font-size: 1.5rem;
      margin: 0;
      color: #333;
    }

    @media (max-width: 1200px) {
      .preview-section {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .component-detail-layout {
        padding: 1rem;
      }

      .detail-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
        padding: 1.5rem;
      }

      .detail-header h1 {
        font-size: 1.8rem;
      }

      .header-actions {
        justify-content: space-between;
      }

      .preview-frame {
        padding: 1rem;
        min-height: 300px;
      }

      .code-section {
        padding: 1rem;
      }
    }
  `]
})
export class ComponentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);

  componentId: string | null = null;
  component: any = null;

  // Mock component data
  private mockComponents: any = {
    'comp_1': {
      id: 'comp_1',
      name: 'User Profile Card',
      description: 'A responsive user profile card with avatar, name, bio, and social media links. Perfect for displaying user information in a clean, modern design.',
      framework: 'React',
      category: 'UI Component',
      createdAt: new Date(),
      linesOfCode: 127,
      generationTime: 15,
      fileCount: 3,
      isSaved: false,
      preview: `
        <div style="max-width: 300px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">👤</div>
            <h3 style="margin: 0 0 5px 0; color: #333;">John Doe</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">Frontend Developer</p>
          </div>
          <div style="text-align: center;">
            <button style="background: #667eea; color: white; border: none; padding: 8px 20px; border-radius: 20px; margin: 0 5px; cursor: pointer;">Follow</button>
            <button style="background: transparent; color: #667eea; border: 1px solid #667eea; padding: 8px 20px; border-radius: 20px; margin: 0 5px; cursor: pointer;">Message</button>
          </div>
        </div>
      `,
      code: {
        html: `<div class="user-profile-card">
  <div class="profile-header">
    <div class="avatar">
      <img src="/api/placeholder/80/80" alt="User Avatar" />
    </div>
    <h3 class="user-name">John Doe</h3>
    <p class="user-title">Frontend Developer</p>
  </div>
  
  <div class="profile-actions">
    <button class="btn btn-primary">Follow</button>
    <button class="btn btn-outline">Message</button>
  </div>
  
  <div class="profile-stats">
    <div class="stat">
      <span class="stat-number">1.2k</span>
      <span class="stat-label">Followers</span>
    </div>
    <div class="stat">
      <span class="stat-number">532</span>
      <span class="stat-label">Following</span>
    </div>
    <div class="stat">
      <span class="stat-number">89</span>
      <span class="stat-label">Posts</span>
    </div>
  </div>
</div>`,
        css: `.user-profile-card {
  max-width: 300px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.profile-header {
  margin-bottom: 24px;
}

.avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.user-title {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.profile-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.btn {
  padding: 10px 24px;
  border-radius: 24px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  margin-top: 4px;
}`,
        javascript: `import React from 'react';
import './UserProfileCard.css';

const UserProfileCard = ({ user }) => {
  const handleFollow = () => {
    console.log('Following user:', user.name);
    // Add follow logic here
  };

  const handleMessage = () => {
    console.log('Messaging user:', user.name);
    // Add messaging logic here
  };

  return (
    <div className="user-profile-card">
      <div className="profile-header">
        <div className="avatar">
          <img src={user.avatar} alt="User Avatar" />
        </div>
        <h3 className="user-name">{user.name}</h3>
        <p className="user-title">{user.title}</p>
      </div>
      
      <div className="profile-actions">
        <button className="btn btn-primary" onClick={handleFollow}>
          Follow
        </button>
        <button className="btn btn-outline" onClick={handleMessage}>
          Message
        </button>
      </div>
      
      <div className="profile-stats">
        <div className="stat">
          <span className="stat-number">{user.followers}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat">
          <span className="stat-number">{user.following}</span>
          <span className="stat-label">Following</span>
        </div>
        <div className="stat">
          <span className="stat-number">{user.posts}</span>
          <span className="stat-label">Posts</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;`
      },
      tests: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfileCard from './UserProfileCard';

const mockUser = {
  name: 'John Doe',
  title: 'Frontend Developer',
  avatar: '/test-avatar.jpg',
  followers: '1.2k',
  following: '532',
  posts: '89'
};

describe('UserProfileCard', () => {
  test('renders user information correctly', () => {
    render(<UserProfileCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('1.2k')).toBeInTheDocument();
  });

  test('handles follow button click', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    render(<UserProfileCard user={mockUser} />);
    
    const followButton = screen.getByText('Follow');
    fireEvent.click(followButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Following user:', 'John Doe');
  });

  test('handles message button click', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    render(<UserProfileCard user={mockUser} />);
    
    const messageButton = screen.getByText('Message');
    fireEvent.click(messageButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Messaging user:', 'John Doe');
  });
});`
    }
  };

  ngOnInit(): void {
    this.componentId = this.route.snapshot.paramMap.get('id');
    
    if (this.componentId) {
      // In a real app, you'd fetch from a service
      this.component = this.mockComponents[this.componentId] || {
        id: this.componentId,
        name: 'Sample Component',
        description: 'This is a sample component for demonstration purposes.',
        framework: 'React',
        category: 'UI',
        createdAt: new Date(),
        linesOfCode: 50,
        generationTime: 10,
        fileCount: 2,
        isSaved: false,
        preview: '<div style="padding: 20px; text-align: center; background: #f5f5f5; border-radius: 8px;">Sample Component Preview</div>',
        code: {
          html: '<div class="sample-component">Sample HTML</div>',
          css: '.sample-component { padding: 20px; }',
          javascript: 'console.log("Sample JavaScript");'
        }
      };

      this.seoService.setPageSeo({
        title: `${this.component.name} - Frontuna.ai`,
        description: this.component.description,
        url: `https://frontuna.ai/dashboard/component/${this.componentId}`,
        robots: 'noindex, nofollow'
      });

      this.analyticsService.trackPageView({
        page_title: `Component Detail - ${this.component.name}`,
        page_location: window.location.href
      });
    }
  }

  saveToLibrary(): void {
    if (this.component && !this.component.isSaved) {
      this.component.isSaved = true;
      
      this.analyticsService.trackEvent({
        action: 'save_to_library',
        category: 'component_detail',
        label: this.component.name
      });
      
      console.log('✅ Saved to library:', this.component.name);
    }
  }

  downloadComponent(): void {
    this.analyticsService.trackEvent({
      action: 'download_component',
      category: 'component_detail',
      label: this.component?.name
    });
    
    console.log('📥 Download component:', this.component?.name);
  }

  shareComponent(): void {
    this.analyticsService.trackEvent({
      action: 'share_component',
      category: 'component_detail',
      label: this.component?.name
    });
    
    // Copy link to clipboard
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      console.log('🔗 Component link copied to clipboard');
    });
  }

  regenerateComponent(): void {
    this.analyticsService.trackEvent({
      action: 'regenerate_component',
      category: 'component_detail',
      label: this.component?.name
    });
    
    console.log('🔄 Regenerate component:', this.component?.name);
  }

  copyCode(type: string): void {
    let code = '';
    
    switch (type) {
      case 'html':
        code = this.component?.code?.html || '';
        break;
      case 'css':
        code = this.component?.code?.css || '';
        break;
      case 'js':
        code = this.component?.code?.javascript || '';
        break;
      case 'tests':
        code = this.component?.tests || '';
        break;
    }

    navigator.clipboard.writeText(code).then(() => {
      console.log(`📋 ${type.toUpperCase()} code copied to clipboard`);
    });

    this.analyticsService.trackEvent({
      action: 'copy_code',
      category: 'component_detail',
      label: `${type}_${this.component?.name}`
    });
  }
}