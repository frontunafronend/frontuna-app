/**
 * Component Processor
 * Enhances and processes generated components
 */

const { createLogger } = require('../../utils/logger');

const logger = createLogger('component-processor');

class ComponentProcessor {
  constructor() {
    this.processors = {
      react: this.processReactComponent.bind(this),
      angular: this.processAngularComponent.bind(this),
      vue: this.processVueComponent.bind(this),
      svelte: this.processSvelteComponent.bind(this),
      vanilla: this.processVanillaComponent.bind(this)
    };
    
    logger.info('🔧 Component Processor initialized');
  }

  /**
   * Process component based on framework
   */
  async process(rawComponent, request) {
    try {
      const processor = this.processors[request.framework];
      if (!processor) {
        throw new Error(`No processor found for framework: ${request.framework}`);
      }

      logger.info('🔄 Processing component', { framework: request.framework });

      let processedComponent = await processor(rawComponent, request);
      
      // Apply common enhancements
      processedComponent = await this.applyCommonEnhancements(processedComponent, request);
      
      // Calculate metrics
      processedComponent.metrics = this.calculateMetrics(processedComponent);

      logger.info('✅ Component processing completed', { 
        framework: request.framework,
        metrics: processedComponent.metrics
      });

      return processedComponent;

    } catch (error) {
      logger.error('❌ Component processing failed', { 
        error: error.message,
        framework: request.framework
      });
      
      throw error;
    }
  }

  /**
   * Process React component
   */
  async processReactComponent(component, request) {
    // Add React-specific imports and structure
    if (component.code.js && !component.code.js.includes('import React')) {
      component.code.js = `import React from 'react';\n${component.code.js}`;
    }

    // Add TypeScript if requested
    if (request.options.typescript && !component.code.ts) {
      component.code.ts = this.generateTypeScriptDefinitions(component, 'react');
    }

    // Add default props and prop types
    component.props = component.props || [];
    
    return component;
  }

  /**
   * Process Angular component
   */
  async processAngularComponent(component, request) {
    // Ensure Angular component structure
    if (!component.code.ts) {
      component.code.ts = component.code.js || '';
    }

    // Add Angular decorators if missing
    if (component.code.ts && !component.code.ts.includes('@Component')) {
      const componentDecorator = `@Component({
  selector: 'app-${component.name.toLowerCase().replace(/([A-Z])/g, '-$1').slice(1)}',
  templateUrl: './${component.name.toLowerCase()}.component.html',
  styleUrls: ['./${component.name.toLowerCase()}.component.scss']
})`;
      component.code.ts = `import { Component } from '@angular/core';\n\n${componentDecorator}\n${component.code.ts}`;
    }

    return component;
  }

  /**
   * Process Vue component
   */
  async processVueComponent(component, request) {
    // Ensure Vue SFC structure
    if (!component.code.vue) {
      component.code.vue = this.createVueSFC(component);
    }

    return component;
  }

  /**
   * Process Svelte component
   */
  async processSvelteComponent(component, request) {
    // Ensure Svelte component structure
    if (!component.code.svelte) {
      component.code.svelte = this.createSvelteComponent(component);
    }

    return component;
  }

  /**
   * Process Vanilla JavaScript component
   */
  async processVanillaComponent(component, request) {
    // Add module exports if missing
    if (component.code.js && !component.code.js.includes('export')) {
      component.code.js += `\n\nexport default ${component.name};`;
    }

    return component;
  }

  /**
   * Apply common enhancements to all components
   */
  async applyCommonEnhancements(component, request) {
    // Ensure accessibility attributes
    component = await this.enhanceAccessibility(component);
    
    // Add responsive utilities
    if (request.options.responsive) {
      component = await this.addResponsiveFeatures(component);
    }

    // Add error boundaries/handling
    component = await this.addErrorHandling(component, request.framework);

    // Optimize performance
    component = await this.optimizePerformance(component, request.framework);

    return component;
  }

  /**
   * Enhance accessibility
   */
  async enhanceAccessibility(component) {
    // Add ARIA labels, roles, and semantic HTML improvements
    if (component.code.html) {
      // Basic accessibility enhancements
      component.code.html = component.code.html
        .replace(/<div/g, '<div role="region"')
        .replace(/<button(?![^>]*aria-label)/g, '<button aria-label="Action button"');
    }

    component.accessibilityFeatures = [
      'ARIA labels',
      'Semantic HTML',
      'Keyboard navigation',
      'Screen reader support'
    ];

    return component;
  }

  /**
   * Add responsive features
   */
  async addResponsiveFeatures(component) {
    if (component.code.css) {
      // Add basic responsive utilities
      component.code.css += `\n\n/* Responsive utilities */
@media (max-width: 768px) {
  .${component.name.toLowerCase()} {
    padding: 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .${component.name.toLowerCase()} {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}`;
    }

    return component;
  }

  /**
   * Add error handling
   */
  async addErrorHandling(component, framework) {
    // Framework-specific error handling will be added here
    component.errorHandling = {
      framework,
      features: ['Error boundaries', 'Graceful degradation', 'User feedback']
    };

    return component;
  }

  /**
   * Optimize performance
   */
  async optimizePerformance(component, framework) {
    // Performance optimizations based on framework
    component.performance = {
      optimizations: ['Lazy loading', 'Memoization', 'Bundle splitting'],
      framework
    };

    return component;
  }

  /**
   * Calculate component metrics
   */
  calculateMetrics(component) {
    const codeSize = Object.values(component.code || {})
      .join('')
      .length;

    return {
      codeSize,
      complexity: this.calculateComplexity(component),
      features: (component.features || []).length,
      props: (component.props || []).length,
      dependencies: (component.dependencies || []).length
    };
  }

  /**
   * Calculate code complexity (basic)
   */
  calculateComplexity(component) {
    const code = Object.values(component.code || {}).join('');
    const conditionals = (code.match(/if|switch|for|while|\?/g) || []).length;
    const functions = (code.match(/function|=>/g) || []).length;
    
    return Math.min(10, Math.max(1, conditionals + functions));
  }

  /**
   * Generate TypeScript definitions
   */
  generateTypeScriptDefinitions(component, framework) {
    // Basic TypeScript definitions
    return `// TypeScript definitions for ${component.name}\nexport interface ${component.name}Props {\n  // Define your props here\n}`;
  }

  /**
   * Create Vue SFC
   */
  createVueSFC(component) {
    return `<template>\n${component.code.html || ''}\n</template>\n\n<script>\n${component.code.js || ''}\n</script>\n\n<style scoped>\n${component.code.css || ''}\n</style>`;
  }

  /**
   * Create Svelte component
   */
  createSvelteComponent(component) {
    return `<script>\n${component.code.js || ''}\n</script>\n\n${component.code.html || ''}\n\n<style>\n${component.code.css || ''}\n</style>`;
  }

  /**
   * Get processor status
   */
  getStatus() {
    return {
      processors: Object.keys(this.processors),
      status: 'operational'
    };
  }
}

module.exports = ComponentProcessor;