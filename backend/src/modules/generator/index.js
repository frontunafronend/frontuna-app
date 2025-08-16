/**
 * Component Generator Module v1.0.0
 * Main AI-powered component generation engine
 * This is the core engine for Frontuna - handle with precision
 */

const OpenAIEngine = require('./openai-engine');
const ComponentProcessor = require('./component-processor'); 
const VersionManager = require('./version-manager');
const QualityAssurance = require('./quality-assurance');
const { createLogger } = require('../../utils/logger');

const logger = createLogger('generator-module');

class ComponentGeneratorModule {
  constructor() {
    this.version = '1.0.0';
    this.engine = new OpenAIEngine();
    this.processor = new ComponentProcessor();
    this.versionManager = new VersionManager();
    this.qa = new QualityAssurance();
    
    logger.info('🚀 Component Generator Module initialized', { version: this.version });
  }

  /**
   * Generate component with full pipeline
   */
  async generateComponent(request) {
    const startTime = Date.now();
    const sessionId = this.generateSessionId();
    
    logger.info('🎯 Starting component generation', { 
      sessionId, 
      framework: request.framework,
      category: request.category 
    });

    try {
      // Step 1: Validate and prepare request
      const validatedRequest = await this.validateRequest(request);
      
      // Step 2: Generate with OpenAI
      const rawGeneration = await this.engine.generate(validatedRequest);
      
      // Step 3: Process and enhance
      const processedComponent = await this.processor.process(rawGeneration, validatedRequest);
      
      // Step 4: Quality assurance
      const qualityChecked = await this.qa.validate(processedComponent);
      
      // Step 5: Version and finalize
      const finalComponent = await this.versionManager.finalize(qualityChecked, this.version);
      
      const duration = Date.now() - startTime;
      
      logger.info('✅ Component generation completed', { 
        sessionId, 
        duration: `${duration}ms`,
        success: true 
      });

      return {
        success: true,
        data: {
          component: finalComponent,
          metadata: {
            sessionId,
            version: this.version,
            generationTime: duration,
            timestamp: new Date().toISOString()
          }
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('❌ Component generation failed', { 
        sessionId, 
        duration: `${duration}ms`,
        error: error.message,
        stack: error.stack 
      });

      return {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: error.message,
          sessionId,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Validate generation request
   */
  async validateRequest(request) {
    const errors = [];

    // Required fields
    if (!request.prompt || request.prompt.trim().length < 10) {
      errors.push('Prompt must be at least 10 characters');
    }

    if (!request.framework || !['react', 'angular', 'vue', 'svelte', 'vanilla'].includes(request.framework)) {
      errors.push('Invalid framework specified');
    }

    // Optional fields with validation
    if (request.category && !['layout', 'navigation', 'forms', 'buttons', 'cards', 'modals', 'tables', 'charts', 'media', 'utility', 'custom'].includes(request.category)) {
      errors.push('Invalid category specified');
    }

    if (request.designFramework && !['plain', 'bootstrap', 'bootstrap-material'].includes(request.designFramework)) {
      errors.push('Invalid design framework specified');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return {
      ...request,
      prompt: request.prompt.trim(),
      designFramework: request.designFramework || 'plain',
      options: {
        responsive: request.options?.responsive !== false,
        accessibility: request.options?.accessibility !== false,
        typescript: request.options?.typescript !== false,
        testing: request.options?.testing !== false,
        ...request.options
      }
    };
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get module status and health
   */
  getStatus() {
    return {
      version: this.version,
      status: 'operational',
      engines: {
        openai: this.engine.getStatus(),
        processor: this.processor.getStatus(),
        qa: this.qa.getStatus()
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update module version (for continuous updates)
   */
  async updateVersion(newVersion) {
    const oldVersion = this.version;
    this.version = newVersion;
    
    await this.versionManager.migrate(oldVersion, newVersion);
    
    logger.info('🔄 Module version updated', { 
      from: oldVersion, 
      to: newVersion 
    });
    
    return this.version;
  }
}

module.exports = ComponentGeneratorModule;