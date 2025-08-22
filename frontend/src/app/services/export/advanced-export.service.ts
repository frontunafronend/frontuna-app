import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay, tap } from 'rxjs/operators';

import { EnvironmentService } from '../core/environment.service';
import { NotificationService } from '../notification/notification.service';

export interface ExportConfig {
  components: ExportComponent[];
  format: 'zip' | 'codesandbox' | 'stackblitz' | 'github-gist' | 'project';
  framework: 'angular' | 'react' | 'vue' | 'svelte';
  options: {
    includeTests?: boolean;
    includeStories?: boolean;
    includeDocumentation?: boolean;
    includeDependencies?: boolean;
    projectName?: string;
    packageManager?: 'npm' | 'yarn' | 'pnpm';
    template?: string;
  };
}

export interface ExportComponent {
  id: string;
  name: string;
  framework: string;
  code: {
    template: string;
    styles: string;
    typescript: string;
  };
  dependencies: string[];
  props?: ComponentProp[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface ExportResult {
  success: boolean;
  url?: string;
  downloadUrl?: string;
  files?: ExportFile[];
  message: string;
  metadata?: {
    size: number;
    fileCount: number;
    exportTime: number;
  };
}

export interface ExportFile {
  path: string;
  content: string;
  type: 'component' | 'test' | 'story' | 'config' | 'documentation';
}

export interface CodeSandboxConfig {
  files: Record<string, { content: string }>;
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  template: string;
  title: string;
  description?: string;
}

export interface StackBlitzConfig {
  files: Record<string, string>;
  dependencies: Record<string, string>;
  template: string;
  title: string;
  description?: string;
  settings?: {
    compile?: {
      trigger?: 'auto' | 'keystroke' | 'save';
      action?: 'hmr' | 'refresh';
      clearConsole?: boolean;
    };
  };
}

export interface GitHubGistConfig {
  description: string;
  public: boolean;
  files: Record<string, { content: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class AdvancedExportService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly environmentService = inject(EnvironmentService);
  private readonly baseUrl = `${this.environmentService.apiUrl}/export`;

  /**
   * Export components with advanced options
   */
  exportComponents(config: ExportConfig): Observable<ExportResult> {
    console.log('🚀 Advanced Export: Starting export with config:', config);

    return this.http.post<ExportResult>(`${this.baseUrl}/advanced`, config)
      .pipe(
        tap(result => {
          if (result.success) {
            this.notificationService.showSuccess(`Export completed! ${config.components.length} components exported.`);
          } else {
            this.notificationService.showError('Export failed: ' + result.message);
          }
        }),
        catchError(error => {
          console.error('❌ Advanced Export: Export failed:', error);
          this.notificationService.showError('Export failed. Please try again.');
          return throwError(() => error);
        })
      );
  }

  /**
   * Export to CodeSandbox
   */
  exportToCodeSandbox(config: ExportConfig): Observable<ExportResult> {
    console.log('📦 CodeSandbox Export: Creating sandbox...');

    const sandboxConfig = this.buildCodeSandboxConfig(config);
    
    return this.http.post<ExportResult>(`${this.baseUrl}/codesandbox`, sandboxConfig)
      .pipe(
        tap(result => {
          if (result.success && result.url) {
            this.notificationService.showSuccess('CodeSandbox created successfully!');
            window.open(result.url, '_blank');
          }
        }),
        catchError(error => {
          console.error('❌ CodeSandbox Export: Failed:', error);
          this.notificationService.showError('Failed to create CodeSandbox');
          return throwError(() => error);
        })
      );
  }

  /**
   * Export to StackBlitz
   */
  exportToStackBlitz(config: ExportConfig): Observable<ExportResult> {
    console.log('⚡ StackBlitz Export: Creating project...');

    const stackBlitzConfig = this.buildStackBlitzConfig(config);
    
    return this.http.post<ExportResult>(`${this.baseUrl}/stackblitz`, stackBlitzConfig)
      .pipe(
        tap(result => {
          if (result.success && result.url) {
            this.notificationService.showSuccess('StackBlitz project created successfully!');
            window.open(result.url, '_blank');
          }
        }),
        catchError(error => {
          console.error('❌ StackBlitz Export: Failed:', error);
          this.notificationService.showError('Failed to create StackBlitz project');
          return throwError(() => error);
        })
      );
  }

  /**
   * Export to GitHub Gist
   */
  exportToGitHubGist(config: ExportConfig): Observable<ExportResult> {
    console.log('🐙 GitHub Gist Export: Creating gist...');

    const gistConfig = this.buildGitHubGistConfig(config);
    
    return this.http.post<ExportResult>(`${this.baseUrl}/github-gist`, gistConfig)
      .pipe(
        tap(result => {
          if (result.success && result.url) {
            this.notificationService.showSuccess('GitHub Gist created successfully!');
            window.open(result.url, '_blank');
          }
        }),
        catchError(error => {
          console.error('❌ GitHub Gist Export: Failed:', error);
          this.notificationService.showError('Failed to create GitHub Gist');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get available export templates
   */
  getExportTemplates(framework: string): Observable<ExportTemplate[]> {

    return this.http.get<ExportTemplate[]>(`${this.baseUrl}/templates/${framework}`);
  }

  /**
   * Build CodeSandbox configuration
   */
  private buildCodeSandboxConfig(config: ExportConfig): CodeSandboxConfig {
    const files: Record<string, { content: string }> = {};
    const dependencies: Record<string, string> = {};
    
    // Add main files
    files['src/index.js'] = {
      content: this.generateIndexFile(config)
    };

    files['public/index.html'] = {
      content: this.generateHTMLFile(config)
    };

    files['package.json'] = {
      content: JSON.stringify({
        name: config.options.projectName || 'exported-components',
        version: '1.0.0',
        description: 'Components exported from Frontuna',
        main: 'src/index.js',
        dependencies: this.getDependencies(config),
        devDependencies: config.options.includeTests ? this.getTestDependencies(config) : {}
      }, null, 2)
    };

    // Add component files
    config.components.forEach(component => {
      const componentPath = `src/components/${component.name}`;
      files[`${componentPath}/${component.name}.${this.getFileExtension(config.framework)}`] = {
        content: component.code.template
      };
      
      if (component.code.styles) {
        files[`${componentPath}/${component.name}.css`] = {
          content: component.code.styles
        };
      }

      if (config.options.includeTests) {
        files[`${componentPath}/${component.name}.test.${this.getFileExtension(config.framework)}`] = {
          content: this.generateTestFile(component, config.framework)
        };
      }
    });

    return {
      files,
      dependencies: this.getDependencies(config),
      template: this.getCodeSandboxTemplate(config.framework),
      title: config.options.projectName || 'Frontuna Components',
      description: `${config.components.length} components exported from Frontuna`
    };
  }

  /**
   * Build StackBlitz configuration
   */
  private buildStackBlitzConfig(config: ExportConfig): StackBlitzConfig {
    const files: Record<string, string> = {};
    
    // Add component files
    config.components.forEach(component => {
      const componentPath = `src/components/${component.name}`;
      files[`${componentPath}/${component.name}.${this.getFileExtension(config.framework)}`] = component.code.template;
      
      if (component.code.styles) {
        files[`${componentPath}/${component.name}.css`] = component.code.styles;
      }
    });

    files['src/main.js'] = this.generateIndexFile(config);
    files['index.html'] = this.generateHTMLFile(config);
    files['package.json'] = JSON.stringify({
      name: config.options.projectName || 'frontuna-components',
      version: '1.0.0',
      dependencies: this.getDependencies(config)
    }, null, 2);

    return {
      files,
      dependencies: this.getDependencies(config),
      template: this.getStackBlitzTemplate(config.framework),
      title: config.options.projectName || 'Frontuna Components',
      description: `${config.components.length} components from Frontuna`,
      settings: {
        compile: {
          trigger: 'auto',
          action: 'hmr',
          clearConsole: false
        }
      }
    };
  }

  /**
   * Build GitHub Gist configuration
   */
  private buildGitHubGistConfig(config: ExportConfig): GitHubGistConfig {
    const files: Record<string, { content: string }> = {};
    
    config.components.forEach(component => {
      files[`${component.name}.${this.getFileExtension(config.framework)}`] = {
        content: component.code.template
      };
      
      if (component.code.styles) {
        files[`${component.name}.css`] = {
          content: component.code.styles
        };
      }
    });

    files['README.md'] = {
      content: this.generateReadmeFile(config)
    };

    return {
      description: `${config.components.length} ${config.framework} components from Frontuna`,
      public: true,
      files
    };
  }

  /**
   * Generate index file content
   */
  private generateIndexFile(config: ExportConfig): string {
    switch (config.framework) {
      case 'react':
        return `import React from 'react';
import ReactDOM from 'react-dom';
${config.components.map(c => `import ${c.name} from './components/${c.name}/${c.name}';`).join('\n')}

function App() {
  return (
    <div>
      <h1>Frontuna Components</h1>
      ${config.components.map(c => `<${c.name} />`).join('\n      ')}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));`;

      case 'vue':
        return `import { createApp } from 'vue';
${config.components.map(c => `import ${c.name} from './components/${c.name}/${c.name}.vue';`).join('\n')}

const app = createApp({
  template: \`
    <div>
      <h1>Frontuna Components</h1>
      ${config.components.map(c => `<${c.name} />`).join('\n      ')}
    </div>
  \`
});

${config.components.map(c => `app.component('${c.name}', ${c.name});`).join('\n')}
app.mount('#app');`;

      case 'angular':
        return `import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
${config.components.map(c => `import { ${c.name}Component } from './components/${c.name}/${c.name}.component';`).join('\n')}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [${config.components.map(c => `${c.name}Component`).join(', ')}],
  template: \`
    <div>
      <h1>Frontuna Components</h1>
      ${config.components.map(c => `<app-${c.name.toLowerCase()}></app-${c.name.toLowerCase()}>`).join('\n      ')}
    </div>
  \`
})
export class AppComponent {}

bootstrapApplication(AppComponent);`;

      default:
        return `// ${config.framework} components\n${config.components.map(c => `// ${c.name}`).join('\n')}`;
    }
  }

  /**
   * Generate HTML file content
   */
  private generateHTMLFile(config: ExportConfig): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.options.projectName || 'Frontuna Components'}</title>
</head>
<body>
  <div id="${config.framework === 'vue' ? 'app' : 'root'}"></div>
</body>
</html>`;
  }

  /**
   * Generate test file content
   */
  private generateTestFile(component: ExportComponent, framework: string): string {
    switch (framework) {
      case 'react':
        return `import React from 'react';
import { render, screen } from '@testing-library/react';
import ${component.name} from './${component.name}';

describe('${component.name}', () => {
  it('renders without crashing', () => {
    render(<${component.name} />);
  });
});`;

      case 'angular':
        return `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ${component.name}Component } from './${component.name}.component';

describe('${component.name}Component', () => {
  let component: ${component.name}Component;
  let fixture: ComponentFixture<${component.name}Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [${component.name}Component]
    }).compileComponents();

    fixture = TestBed.createComponent(${component.name}Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});`;

      case 'vue':
        return `import { mount } from '@vue/test-utils';
import ${component.name} from './${component.name}.vue';

describe('${component.name}', () => {
  it('renders properly', () => {
    const wrapper = mount(${component.name});
    expect(wrapper.exists()).toBe(true);
  });
});`;

      default:
        return `// Test file for ${component.name}`;
    }
  }

  /**
   * Generate README file content
   */
  private generateReadmeFile(config: ExportConfig): string {
    return `# ${config.options.projectName || 'Frontuna Components'}

Components exported from [Frontuna.com](https://frontuna.com) - AI-Powered Frontend Component Generator.

## Components

${config.components.map(component => `### ${component.name}
- Framework: ${component.framework}
- Dependencies: ${component.dependencies.join(', ') || 'None'}
${component.props ? `- Props: ${component.props.map(p => `${p.name} (${p.type})`).join(', ')}` : ''}
`).join('\n')}

## Usage

1. Copy the component files to your project
2. Install dependencies: \`${config.options.packageManager || 'npm'} install\`
3. Import and use the components in your application

## Generated by Frontuna

These components were generated using Frontuna's AI-powered component generator. Visit [Frontuna.com](https://frontuna.com) to create more components.
`;
  }

  /**
   * Get file extension for framework
   */
  private getFileExtension(framework: string): string {
    const extensions: Record<string, string> = {
      react: 'jsx',
      vue: 'vue',
      angular: 'ts',
      svelte: 'svelte'
    };
    return extensions[framework] || 'js';
  }

  /**
   * Get dependencies for framework
   */
  private getDependencies(config: ExportConfig): Record<string, string> {
    const baseDependencies: Record<string, Record<string, string>> = {
      react: {
        'react': '^18.0.0',
        'react-dom': '^18.0.0'
      },
      vue: {
        'vue': '^3.0.0'
      },
      angular: {
        '@angular/core': '^17.0.0',
        '@angular/common': '^17.0.0',
        '@angular/platform-browser': '^17.0.0'
      },
      svelte: {
        'svelte': '^4.0.0'
      }
    };

    const dependencies = { ...baseDependencies[config.framework] };
    
    // Add component-specific dependencies
    config.components.forEach(component => {
      component.dependencies.forEach(dep => {
        dependencies[dep] = 'latest';
      });
    });

    return dependencies;
  }

  /**
   * Get test dependencies for framework
   */
  private getTestDependencies(config: ExportConfig): Record<string, string> {
    const testDependencies: Record<string, Record<string, string>> = {
      react: {
        '@testing-library/react': '^13.0.0',
        '@testing-library/jest-dom': '^5.0.0',
        'jest': '^29.0.0'
      },
      angular: {
        '@angular/testing': '^17.0.0',
        'jasmine': '^4.0.0',
        'karma': '^6.0.0'
      },
      vue: {
        '@vue/test-utils': '^2.0.0',
        'vitest': '^0.34.0'
      }
    };

    return testDependencies[config.framework] || {};
  }

  /**
   * Get CodeSandbox template
   */
  private getCodeSandboxTemplate(framework: string): string {
    const templates: Record<string, string> = {
      react: 'create-react-app',
      vue: 'vue',
      angular: 'angular',
      svelte: 'svelte'
    };
    return templates[framework] || 'vanilla';
  }

  /**
   * Get StackBlitz template
   */
  private getStackBlitzTemplate(framework: string): string {
    const templates: Record<string, string> = {
      react: 'create-react-app',
      vue: 'vue',
      angular: 'angular-cli',
      svelte: 'sveltekit'
    };
    return templates[framework] || 'javascript';
  }

  // Mock implementations for development
  private mockExportComponents(config: ExportConfig): Observable<ExportResult> {
    console.log('🎭 Mock: Exporting components...', config);
    
    return of({
      success: true,
      downloadUrl: 'https://example.com/download/components.zip',
      message: `Successfully exported ${config.components.length} components`,
      metadata: {
        size: 1024 * 1024, // 1MB
        fileCount: config.components.length * 3,
        exportTime: 2500
      }
    }).pipe(delay(2500));
  }

  private mockCodeSandboxExport(config: ExportConfig): Observable<ExportResult> {
    console.log('🎭 Mock: Creating CodeSandbox...', config);
    
    return of({
      success: true,
      url: 'https://codesandbox.io/s/frontuna-components-abc123',
      message: 'CodeSandbox created successfully',
      metadata: {
        size: 512 * 1024,
        fileCount: config.components.length * 2,
        exportTime: 1500
      }
    }).pipe(delay(1500));
  }

  private mockStackBlitzExport(config: ExportConfig): Observable<ExportResult> {
    console.log('🎭 Mock: Creating StackBlitz project...', config);
    
    return of({
      success: true,
      url: 'https://stackblitz.com/edit/frontuna-components-xyz789',
      message: 'StackBlitz project created successfully',
      metadata: {
        size: 768 * 1024,
        fileCount: config.components.length * 2,
        exportTime: 1800
      }
    }).pipe(delay(1800));
  }

  private mockGitHubGistExport(config: ExportConfig): Observable<ExportResult> {
    console.log('🎭 Mock: Creating GitHub Gist...', config);
    
    return of({
      success: true,
      url: 'https://gist.github.com/user/1234567890abcdef',
      message: 'GitHub Gist created successfully',
      metadata: {
        size: 256 * 1024,
        fileCount: config.components.length + 1, // +1 for README
        exportTime: 1200
      }
    }).pipe(delay(1200));
  }

  private mockGetExportTemplates(framework: string): Observable<ExportTemplate[]> {
    const templates: ExportTemplate[] = [
      {
        id: 'basic',
        name: 'Basic Template',
        description: 'Simple project structure with essential files',
        framework,
        features: ['Components', 'Styles', 'Basic setup']
      },
      {
        id: 'full',
        name: 'Full Template',
        description: 'Complete project with tests, stories, and documentation',
        framework,
        features: ['Components', 'Tests', 'Storybook', 'Documentation', 'CI/CD']
      },
      {
        id: 'minimal',
        name: 'Minimal Template',
        description: 'Lightweight setup for quick prototyping',
        framework,
        features: ['Components only']
      }
    ];

    return of(templates).pipe(delay(500));
  }
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  framework: string;
  features: string[];
}