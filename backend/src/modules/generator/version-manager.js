/**
 * Version Manager
 * Handles component versioning and updates
 */

const { createLogger } = require('../../utils/logger');

const logger = createLogger('version-manager');

class VersionManager {
  constructor() {
    this.currentVersion = '1.0.0';
    this.supportedVersions = ['1.0.0'];
    
    logger.info('📦 Version Manager initialized', { version: this.currentVersion });
  }

  /**
   * Finalize component with version information
   */
  async finalize(component, moduleVersion) {
    try {
      // Add version metadata
      component.version = {
        component: this.generateComponentVersion(),
        module: moduleVersion,
        api: this.currentVersion,
        timestamp: new Date().toISOString(),
        build: this.generateBuildNumber()
      };

      // Add compatibility information
      component.compatibility = {
        frameworks: this.getFrameworkCompatibility(component),
        browsers: this.getBrowserCompatibility(),
        node: process.version
      };

      // Add update information
      component.updateInfo = {
        lastUpdated: new Date().toISOString(),
        updateChannel: 'stable',
        autoUpdate: true
      };

      logger.info('📋 Component finalized', { 
        name: component.name,
        version: component.version.component
      });

      return component;

    } catch (error) {
      logger.error('❌ Component finalization failed', { 
        error: error.message,
        component: component.name
      });
      
      throw error;
    }
  }

  /**
   * Generate component version
   */
  generateComponentVersion() {
    const timestamp = Date.now();
    const major = 1;
    const minor = 0;
    const patch = Math.floor(timestamp / 1000000) % 1000;
    
    return `${major}.${minor}.${patch}`;
  }

  /**
   * Generate build number
   */
  generateBuildNumber() {
    return `build.${Date.now()}`;
  }

  /**
   * Get framework compatibility
   */
  getFrameworkCompatibility(component) {
    const compatibility = {
      primary: component.metadata?.framework || 'unknown',
      versions: {}
    };

    // Framework version compatibility
    switch (component.metadata?.framework) {
      case 'react':
        compatibility.versions = {
          '16.8+': 'full',
          '17.x': 'full',
          '18.x': 'full'
        };
        break;
      case 'angular':
        compatibility.versions = {
          '12.x': 'partial',
          '13.x': 'full',
          '14.x': 'full',
          '15.x': 'full'
        };
        break;
      case 'vue':
        compatibility.versions = {
          '2.7': 'partial',
          '3.x': 'full'
        };
        break;
      case 'svelte':
        compatibility.versions = {
          '3.x': 'full',
          '4.x': 'full'
        };
        break;
      default:
        compatibility.versions = {
          'latest': 'full'
        };
    }

    return compatibility;
  }

  /**
   * Get browser compatibility
   */
  getBrowserCompatibility() {
    return {
      chrome: '80+',
      firefox: '75+',
      safari: '13+',
      edge: '80+',
      ie: 'not supported'
    };
  }

  /**
   * Migrate between versions
   */
  async migrate(fromVersion, toVersion) {
    logger.info('🔄 Starting version migration', { 
      from: fromVersion, 
      to: toVersion 
    });

    // Version-specific migration logic will be added here
    // For now, just update the current version
    this.currentVersion = toVersion;
    
    if (!this.supportedVersions.includes(toVersion)) {
      this.supportedVersions.push(toVersion);
    }

    logger.info('✅ Version migration completed', { 
      newVersion: toVersion,
      supportedVersions: this.supportedVersions
    });
  }

  /**
   * Check if version is supported
   */
  isVersionSupported(version) {
    return this.supportedVersions.includes(version);
  }

  /**
   * Get version information
   */
  getVersionInfo() {
    return {
      current: this.currentVersion,
      supported: this.supportedVersions,
      latest: this.supportedVersions[this.supportedVersions.length - 1]
    };
  }

  /**
   * Get manager status
   */
  getStatus() {
    return {
      status: 'operational',
      currentVersion: this.currentVersion,
      supportedVersions: this.supportedVersions
    };
  }
}

module.exports = VersionManager;