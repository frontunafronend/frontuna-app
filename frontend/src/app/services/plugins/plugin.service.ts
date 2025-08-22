import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';

import { EnvironmentService } from '../core/environment.service';
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
  private readonly environmentService = inject(EnvironmentService);
  
  private readonly baseUrl = `${this.environmentService.apiUrl}/plugins`;
  
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
   * Toggle plugin enabled/disabled state
   */
  togglePlugin(pluginId: string, enabled: boolean): Observable<PluginInstallation> {
    console.log('🔌 Plugin Service: Toggling plugin:', pluginId, enabled);
    
    return this.http.patch<PluginInstallation>(`${this.baseUrl}/${pluginId}/toggle`, { enabled })
      .pipe(
        tap(installation => {
          console.log('✅ Plugin Service: Plugin toggled:', installation);
          this.updateInstalledPlugin(installation);
          this.notificationService.showSuccess(`Plugin ${enabled ? 'enabled' : 'disabled'} successfully`);
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
    
    return this.http.patch<PluginInstallation>(`${this.baseUrl}/${pluginId}/settings`, { settings })
      .pipe(
        tap(installation => {
          console.log('✅ Plugin Service: Plugin settings updated:', installation);
          this.updateInstalledPlugin(installation);
          this.notificationService.showSuccess(`Plugin settings updated successfully`);
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
    
    return this.http.get<Plugin>(`${this.baseUrl}/${pluginId}`)
      .pipe(
        tap(plugin => console.log('✅ Plugin Service: Plugin details loaded:', plugin.name)),
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
   * Get development plugins
   */
  getDevelopmentPlugins(): Observable<PluginDevelopment[]> {
    console.log('🔌 Plugin Service: Getting development plugins');
    
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
   * Create development plugin
   */
  createDevelopmentPlugin(manifest: PluginManifest): Observable<PluginDevelopment> {
    console.log('🔌 Plugin Service: Creating development plugin:', manifest);
    
    return this.http.post<PluginDevelopment>(`${this.baseUrl}/development`, { manifest })
      .pipe(
        tap(plugin => {
          console.log('✅ Plugin Service: Development plugin created:', plugin);
          this.notificationService.showSuccess(`Development plugin created: ${plugin.name}`);
        }),
        catchError(error => {
          console.error('❌ Plugin Service: Failed to create development plugin:', error);
          this.notificationService.showError('Failed to create development plugin');
          return throwError(() => error);
        })
      );
  }

  /**
   * Load marketplace data
   */
  private loadMarketplace() {
    this.http.get<PluginMarketplace>(`${this.baseUrl}/marketplace`)
      .subscribe(marketplace => {
        this.marketplaceSubject.next(marketplace);
      });
  }

  /**
   * Load installed plugins
   */
  private loadInstalledPlugins() {
    this.getInstalledPlugins().subscribe();
  }

  /**
   * Update installed plugin in local state
   */
  private updateInstalledPlugin(installation: PluginInstallation) {
    const currentPlugins = this.installedPluginsSubject.value;
    const updatedPlugins = currentPlugins.map(p => 
      p.pluginId === installation.pluginId ? installation : p
    );
    
    // If plugin not found, add it
    if (!currentPlugins.find(p => p.pluginId === installation.pluginId)) {
      updatedPlugins.push(installation);
    }
    
    this.installedPluginsSubject.next(updatedPlugins);
  }

  /**
   * Remove installed plugin from local state
   */
  private removeInstalledPlugin(pluginId: string) {
    const currentPlugins = this.installedPluginsSubject.value;
    const updatedPlugins = currentPlugins.filter(p => p.pluginId !== pluginId);
    this.installedPluginsSubject.next(updatedPlugins);
  }
}