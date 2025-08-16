import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { 
  Plugin, 
  PluginCategory, 
  PluginStatus, 
  PluginInstallation, 
  PluginMarketplace,
  PluginDevelopment,
  PluginManifest
} from '@app/models/plugin.model';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class PluginService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  
  private readonly baseUrl = `${environment.apiUrl}/plugins`;
  
  // State management
  private readonly installedPluginsSubject = new BehaviorSubject<PluginInstallation[]>([]);
  private readonly marketplaceSubject = new BehaviorSubject<PluginMarketplace | null>(null);
  private readonly isLoadingSignal = signal<boolean>(false);
  
  // Public observables
  public readonly installedPlugins$ = this.installedPluginsSubject.asObservable();
  public readonly marketplace$ = this.marketplaceSubject.asObservable();
  public readonly isLoading = this.isLoadingSignal.asReadonly();

  constructor() {
    this.loadInstalledPlugins();
    this.loadMarketplace();
  }

  /**
   * Get all available plugins from marketplace
   */
  getMarketplacePlugins(category?: PluginCategory, search?: string): Observable<Plugin[]> {
    console.log('🔌 Plugin Service: Getting marketplace plugins', { category, search });
    
    if (environment.features.enableMockData) {
      return this.mockGetMarketplacePlugins(category, search);
    }
    
    const params: any = {};
    if (category) params.category = category;
    if (search) params.search = search;
    
    return this.http.get<Plugin[]>(`${this.baseUrl}/marketplace`, { params })
      .pipe(
        tap(plugins => console.log('✅ Plugin Service: Marketplace plugins loaded:', plugins.length)),
        catchError(error => {
          console.error('❌ Plugin Service: Failed to load marketplace plugins:', error);
          this.notificationService.showError('Failed to load marketplace plugins');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get installed plugins for current user
   */
  getInstalledPlugins(): Observable<PluginInstallation[]> {
    console.log('🔌 Plugin Service: Getting installed plugins');
    
    if (environment.features.enableMockData) {
      return this.mockGetInstalledPlugins();
    }
    
    return this.http.get<PluginInstallation[]>(`${this.baseUrl}/installed`)
      .pipe(
        tap(plugins => {
          console.log('✅ Plugin Service: Installed plugins loaded:', plugins.length);
          this.installedPluginsSubject.next(plugins);
        }),
        catchError(error => {
          console.error('❌ Plugin Service: Failed to load installed plugins:', error);
          this.notificationService.showError('Failed to load installed plugins');
          return throwError(() => error);
        })
      );
  }

  /**
   * Install a plugin
   */
  installPlugin(pluginId: string): Observable<PluginInstallation> {
    console.log('🔌 Plugin Service: Installing plugin:', pluginId);
    this.isLoadingSignal.set(true);
    
    if (environment.features.enableMockData) {
      return this.mockInstallPlugin(pluginId);
    }
    
    return this.http.post<PluginInstallation>(`${this.baseUrl}/${pluginId}/install`, {})
      .pipe(
        tap(installation => {
          console.log('✅ Plugin Service: Plugin installed:', installation);
          this.updateInstalledPlugin(installation);
          this.notificationService.showSuccess(`Plugin installed successfully`);
          this.isLoadingSignal.set(false);
        }),
        catchError(error => {
          console.error('❌ Plugin Service: Failed to install plugin:', error);
          this.notificationService.showError('Failed to install plugin');
          this.isLoadingSignal.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Uninstall a plugin
   */
  uninstallPlugin(pluginId: string): Observable<void> {
    console.log('🔌 Plugin Service: Uninstalling plugin:', pluginId);
    this.isLoadingSignal.set(true);
    
    if (environment.features.enableMockData) {
      return this.mockUninstallPlugin(pluginId);
    }
    
    return this.http.delete<void>(`${this.baseUrl}/${pluginId}/uninstall`)
      .pipe(
        tap(() => {
          console.log('✅ Plugin Service: Plugin uninstalled:', pluginId);
          this.removeInstalledPlugin(pluginId);
          this.notificationService.showSuccess(`Plugin uninstalled successfully`);
          this.isLoadingSignal.set(false);
        }),
        catchError(error => {
          console.error('❌ Plugin Service: Failed to uninstall plugin:', error);
          this.notificationService.showError('Failed to uninstall plugin');
          this.isLoadingSignal.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Enable/disable a plugin
   */
  togglePlugin(pluginId: string, enabled: boolean): Observable<PluginInstallation> {
    console.log('🔌 Plugin Service: Toggling plugin:', pluginId, enabled);
    
    if (environment.features.enableMockData) {
      return this.mockTogglePlugin(pluginId, enabled);
    }
    
    return this.http.patch<PluginInstallation>(`${this.baseUrl}/${pluginId}/toggle`, { enabled })
      .pipe(
        tap(installation => {
          console.log('✅ Plugin Service: Plugin toggled:', installation);
          this.updateInstalledPlugin(installation);
          const action = enabled ? 'enabled' : 'disabled';
          this.notificationService.showSuccess(`Plugin ${action} successfully`);
        }),
        catchError(error => {
          console.error('❌ Plugin Service: Failed to toggle plugin:', error);
          this.notificationService.showError('Failed to toggle plugin');
          return throwError(() => error);
        })
      );
  }

  /**
   * Update plugin settings
   */
  updatePluginSettings(pluginId: string, settings: Record<string, any>): Observable<PluginInstallation> {
    console.log('🔌 Plugin Service: Updating plugin settings:', pluginId, settings);
    
    if (environment.features.enableMockData) {
      return this.mockUpdatePluginSettings(pluginId, settings);
    }
    
    return this.http.patch<PluginInstallation>(`${this.baseUrl}/${pluginId}/settings`, { settings })
      .pipe(
        tap(installation => {
          console.log('✅ Plugin Service: Plugin settings updated:', installation);
          this.updateInstalledPlugin(installation);
          this.notificationService.showSuccess('Plugin settings updated successfully');
        }),
        catchError(error => {
          console.error('❌ Plugin Service: Failed to update plugin settings:', error);
          this.notificationService.showError('Failed to update plugin settings');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get plugin details
   */
  getPluginDetails(pluginId: string): Observable<Plugin> {
    console.log('🔌 Plugin Service: Getting plugin details:', pluginId);
    
    if (environment.features.enableMockData) {
      return this.mockGetPluginDetails(pluginId);
    }
    
    return this.http.get<Plugin>(`${this.baseUrl}/${pluginId}`)
      .pipe(
        tap(plugin => console.log('✅ Plugin Service: Plugin details loaded:', plugin)),
        catchError(error => {
          console.error('❌ Plugin Service: Failed to load plugin details:', error);
          this.notificationService.showError('Failed to load plugin details');
          return throwError(() => error);
        })
      );
  }

  /**
   * Search plugins
   */
  searchPlugins(query: string, category?: PluginCategory): Observable<Plugin[]> {
    console.log('🔌 Plugin Service: Searching plugins:', query, category);
    
    if (environment.features.enableMockData) {
      return this.mockSearchPlugins(query, category);
    }
    
    const params: any = { q: query };
    if (category) params.category = category;
    
    return this.http.get<Plugin[]>(`${this.baseUrl}/search`, { params })
      .pipe(
        tap(plugins => console.log('✅ Plugin Service: Search results:', plugins.length)),
        catchError(error => {
          console.error('❌ Plugin Service: Failed to search plugins:', error);
          this.notificationService.showError('Failed to search plugins');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get plugin development projects
   */
  getDevelopmentPlugins(): Observable<PluginDevelopment[]> {
    console.log('🔌 Plugin Service: Getting development plugins');
    
    if (environment.features.enableMockData) {
      return this.mockGetDevelopmentPlugins();
    }
    
    return this.http.get<PluginDevelopment[]>(`${this.baseUrl}/development`)
      .pipe(
        tap(plugins => console.log('✅ Plugin Service: Development plugins loaded:', plugins.length)),
        catchError(error => {
          console.error('❌ Plugin Service: Failed to load development plugins:', error);
          this.notificationService.showError('Failed to load development plugins');
          return throwError(() => error);
        })
      );
  }

  /**
   * Create new plugin development project
   */
  createDevelopmentPlugin(manifest: PluginManifest): Observable<PluginDevelopment> {
    console.log('🔌 Plugin Service: Creating development plugin:', manifest);
    
    if (environment.features.enableMockData) {
      return this.mockCreateDevelopmentPlugin(manifest);
    }
    
    return this.http.post<PluginDevelopment>(`${this.baseUrl}/development`, { manifest })
      .pipe(
        tap(plugin => {
          console.log('✅ Plugin Service: Development plugin created:', plugin);
          this.notificationService.showSuccess('Development plugin created successfully');
        }),
        catchError(error => {
          console.error('❌ Plugin Service: Failed to create development plugin:', error);
          this.notificationService.showError('Failed to create development plugin');
          return throwError(() => error);
        })
      );
  }

  // Private helper methods
  private loadInstalledPlugins() {
    this.getInstalledPlugins().subscribe();
  }

  private loadMarketplace() {
    if (environment.features.enableMockData) {
      this.mockGetMarketplace().subscribe(marketplace => {
        this.marketplaceSubject.next(marketplace);
      });
    }
  }

  private updateInstalledPlugin(installation: PluginInstallation) {
    const currentPlugins = this.installedPluginsSubject.value;
    const index = currentPlugins.findIndex(p => p.pluginId === installation.pluginId);
    
    if (index >= 0) {
      currentPlugins[index] = installation;
    } else {
      currentPlugins.push(installation);
    }
    
    this.installedPluginsSubject.next([...currentPlugins]);
  }

  private removeInstalledPlugin(pluginId: string) {
    const currentPlugins = this.installedPluginsSubject.value;
    const filtered = currentPlugins.filter(p => p.pluginId !== pluginId);
    this.installedPluginsSubject.next(filtered);
  }

  // Mock implementations for development
  private mockGetMarketplacePlugins(category?: PluginCategory, search?: string): Observable<Plugin[]> {
    return of(null).pipe(
      delay(800),
      map(() => {
        let plugins = this.getMockPlugins();
        
        if (category) {
          plugins = plugins.filter(p => p.category === category);
        }
        
        if (search) {
          const query = search.toLowerCase();
          plugins = plugins.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.keywords.some(k => k.toLowerCase().includes(query))
          );
        }
        
        return plugins;
      })
    );
  }

  private mockGetInstalledPlugins(): Observable<PluginInstallation[]> {
    return of([
      {
        pluginId: 'plugin-1',
        userId: 'user-1',
        version: '1.0.0',
        status: 'active' as PluginStatus,
        settings: {
          theme: 'dark',
          autoUpdate: true
        },
        installedAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
        lastUsed: new Date(Date.now() - 3600000), // 1 hour ago
        usageCount: 42
      },
      {
        pluginId: 'plugin-2',
        userId: 'user-1',
        version: '2.1.0',
        status: 'inactive' as PluginStatus,
        settings: {},
        installedAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
        lastUsed: new Date(Date.now() - 86400000), // 1 day ago
        usageCount: 15
      }
    ]).pipe(delay(500));
  }

  private mockInstallPlugin(pluginId: string): Observable<PluginInstallation> {
    return of({
      pluginId,
      userId: 'user-1',
      version: '1.0.0',
      status: 'installing' as PluginStatus,
      settings: {},
      installedAt: new Date(),
      usageCount: 0
    }).pipe(
      delay(2000),
      map(installation => ({
        ...installation,
        status: 'active' as PluginStatus
      }))
    );
  }

  private mockUninstallPlugin(pluginId: string): Observable<void> {
    return of(undefined).pipe(delay(1000));
  }

  private mockTogglePlugin(pluginId: string, enabled: boolean): Observable<PluginInstallation> {
    const currentPlugins = this.installedPluginsSubject.value;
    const plugin = currentPlugins.find(p => p.pluginId === pluginId);
    
    if (!plugin) {
      return throwError(() => new Error('Plugin not found'));
    }
    
    return of({
      ...plugin,
      status: enabled ? 'active' : 'inactive'
    } as PluginInstallation).pipe(delay(500));
  }

  private mockUpdatePluginSettings(pluginId: string, settings: Record<string, any>): Observable<PluginInstallation> {
    const currentPlugins = this.installedPluginsSubject.value;
    const plugin = currentPlugins.find(p => p.pluginId === pluginId);
    
    if (!plugin) {
      return throwError(() => new Error('Plugin not found'));
    }
    
    return of({
      ...plugin,
      settings: { ...plugin.settings, ...settings }
    }).pipe(delay(500));
  }

  private mockGetPluginDetails(pluginId: string): Observable<Plugin> {
    const plugins = this.getMockPlugins();
    const plugin = plugins.find(p => p.id === pluginId);
    
    if (!plugin) {
      return throwError(() => new Error('Plugin not found'));
    }
    
    return of(plugin).pipe(delay(300));
  }

  private mockSearchPlugins(query: string, category?: PluginCategory): Observable<Plugin[]> {
    return this.mockGetMarketplacePlugins(category, query);
  }

  private mockGetDevelopmentPlugins(): Observable<PluginDevelopment[]> {
    return of([
      {
        id: 'dev-1',
        name: 'My Custom Plugin',
        status: 'draft' as 'draft',
        files: [],
        manifest: {
          name: 'My Custom Plugin',
          version: '0.1.0',
          description: 'A custom plugin I am developing',
          author: 'John Doe',
          license: 'MIT',
          main: 'index.js',
          permissions: [],
          dependencies: {},
          engines: {
            frontuna: '^1.0.0'
          }
        },
        createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
        updatedAt: new Date(Date.now() - 3600000) // 1 hour ago
      }
    ]).pipe(delay(600));
  }

  private mockCreateDevelopmentPlugin(manifest: PluginManifest): Observable<PluginDevelopment> {
    return of({
      id: 'dev-' + Date.now(),
      name: manifest.name,
      status: 'draft' as 'draft',
      files: [],
      manifest,
      createdAt: new Date(),
      updatedAt: new Date()
    }).pipe(delay(1000));
  }

  private mockGetMarketplace(): Observable<PluginMarketplace> {
    const plugins = this.getMockPlugins();
    
    return of({
      featured: plugins.slice(0, 3),
      popular: plugins.slice(0, 6),
      recent: plugins.slice(3, 9),
      categories: [
        { category: 'code-generation' as PluginCategory, name: 'Code Generation', description: 'AI-powered code generators', icon: 'code', count: 12 },
        { category: 'ui-enhancement' as PluginCategory, name: 'UI Enhancement', description: 'Visual improvements and themes', icon: 'palette', count: 8 },
        { category: 'development-tools' as PluginCategory, name: 'Development Tools', description: 'Productivity and workflow tools', icon: 'build', count: 15 },
        { category: 'integrations' as PluginCategory, name: 'Integrations', description: 'Third-party service integrations', icon: 'link', count: 10 }
      ],
      totalPlugins: plugins.length
    }).pipe(delay(400));
  }

  private getMockPlugins(): Plugin[] {
    return [
      {
        id: 'plugin-1',
        name: 'AI Code Generator Pro',
        displayName: 'AI Code Generator Pro',
        description: 'Advanced AI-powered code generation with support for multiple frameworks and languages.',
        version: '2.1.0',
        author: 'AI Tools Inc.',
        category: 'code-generation',
        type: 'tool',
        status: 'active',
        permissions: [
          { type: 'read-files', description: 'Read project files', required: true },
          { type: 'write-files', description: 'Generate and save code files', required: true }
        ],
        configuration: {
          settings: [
            { key: 'model', name: 'AI Model', description: 'Choose AI model', type: 'select', defaultValue: 'gpt-4', options: [{ label: 'GPT-4', value: 'gpt-4' }, { label: 'GPT-3.5', value: 'gpt-3.5' }], required: true },
            { key: 'autoSave', name: 'Auto Save', description: 'Automatically save generated code', type: 'boolean', defaultValue: true, required: false }
          ],
          hooks: [],
          commands: []
        },
        dependencies: ['@openai/api'],
        files: [],
        icon: 'assets/images/plugins/ai-generator.svg',
        screenshots: [],
        documentation: 'https://docs.example.com/ai-generator',
        repository: 'https://github.com/example/ai-generator',
        homepage: 'https://ai-generator.example.com',
        license: 'MIT',
        keywords: ['ai', 'code-generation', 'gpt', 'automation'],
        downloads: 15420,
        rating: 4.8,
        reviews: [],
        isOfficial: false,
        isVerified: true,
        publishedAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
        updatedAt: new Date(Date.now() - 86400000 * 5) // 5 days ago
      },
      {
        id: 'plugin-2',
        name: 'Dark Theme Pro',
        displayName: 'Dark Theme Pro',
        description: 'Professional dark theme with customizable colors and syntax highlighting.',
        version: '1.5.2',
        author: 'Theme Masters',
        category: 'ui-enhancement',
        type: 'theme',
        status: 'active',
        permissions: [],
        configuration: {
          settings: [
            { key: 'accentColor', name: 'Accent Color', description: 'Choose accent color', type: 'color', defaultValue: '#007bff', required: false },
            { key: 'fontSize', name: 'Font Size', description: 'Editor font size', type: 'number', defaultValue: 14, required: false }
          ],
          hooks: [],
          commands: []
        },
        dependencies: [],
        files: [],
        license: 'MIT',
        keywords: ['theme', 'dark', 'ui', 'customization'],
        downloads: 8930,
        rating: 4.6,
        reviews: [],
        isOfficial: false,
        isVerified: true,
        publishedAt: new Date(Date.now() - 86400000 * 60), // 60 days ago
        updatedAt: new Date(Date.now() - 86400000 * 10) // 10 days ago
      },
      {
        id: 'plugin-3',
        name: 'Component Library Sync',
        displayName: 'Component Library Sync',
        description: 'Synchronize components with external design systems and component libraries.',
        version: '3.0.1',
        author: 'Sync Tools Ltd.',
        category: 'integrations',
        type: 'integration',
        status: 'active',
        permissions: [
          { type: 'network-access', description: 'Connect to external APIs', required: true }
        ],
        configuration: {
          settings: [
            { key: 'apiKey', name: 'API Key', description: 'Your design system API key', type: 'string', defaultValue: '', required: true },
            { key: 'syncInterval', name: 'Sync Interval', description: 'How often to sync (minutes)', type: 'number', defaultValue: 60, required: false }
          ],
          hooks: [],
          commands: []
        },
        dependencies: ['axios'],
        files: [],
        license: 'Apache-2.0',
        keywords: ['sync', 'design-system', 'components', 'integration'],
        downloads: 3250,
        rating: 4.3,
        reviews: [],
        isOfficial: false,
        isVerified: true,
        publishedAt: new Date(Date.now() - 86400000 * 45), // 45 days ago
        updatedAt: new Date(Date.now() - 86400000 * 2) // 2 days ago
      },
      {
        id: 'plugin-4',
        name: 'Testing Assistant',
        displayName: 'Testing Assistant',
        description: 'Automated test generation and testing utilities for your components.',
        version: '1.8.0',
        author: 'Test Automation Co.',
        category: 'testing',
        type: 'tool',
        status: 'active',
        permissions: [
          { type: 'read-files', description: 'Read component files', required: true },
          { type: 'write-files', description: 'Generate test files', required: true }
        ],
        configuration: {
          settings: [
            { key: 'testFramework', name: 'Test Framework', description: 'Choose testing framework', type: 'select', defaultValue: 'jest', options: [{ label: 'Jest', value: 'jest' }, { label: 'Vitest', value: 'vitest' }], required: true },
            { key: 'coverage', name: 'Code Coverage', description: 'Generate coverage reports', type: 'boolean', defaultValue: true, required: false }
          ],
          hooks: [],
          commands: []
        },
        dependencies: ['@testing-library/angular'],
        files: [],
        license: 'MIT',
        keywords: ['testing', 'automation', 'jest', 'coverage'],
        downloads: 5670,
        rating: 4.5,
        reviews: [],
        isOfficial: false,
        isVerified: true,
        publishedAt: new Date(Date.now() - 86400000 * 20), // 20 days ago
        updatedAt: new Date(Date.now() - 86400000 * 1) // 1 day ago
      }
    ];
  }
}