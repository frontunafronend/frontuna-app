const { createLogger } = require('../utils/logger');
const openaiService = require('../services/openai.service');
const componentService = require('../services/component.service');
const User = require('../models/User');

const logger = createLogger('generator-controller');

// Try to use the new generator module, fallback to original service
let generatorModule;
try {
  const ComponentGeneratorModule = require('../modules/generator');
  generatorModule = new ComponentGeneratorModule();
  logger.info('🚀 New Component Generator Module loaded successfully');
} catch (error) {
  logger.warn('⚠️ Could not load new generator module, using fallback', { error: error.message });
  generatorModule = null;
}

/**
 * Generate AI component using the new Generator Module
 */
exports.generateComponent = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    // Check if user can generate more components
    if (!user.canGenerate()) {
      return res.status(429).json({
        success: false,
        error: { 
          code: 'GENERATION_LIMIT_EXCEEDED',
          message: `Generation limit exceeded. You have used ${user.usage.generationsUsed}/${user.usage.generationsLimit} generations.`,
          usage: user.getUsageStats()
        }
      });
    }

    const { prompt, framework, category, options = {}, designFramework = 'plain' } = req.body;

    logger.info('🚀 Starting component generation', {
      userId,
      framework,
      category,
      designFramework,
      promptLength: prompt.length,
      usingNewModule: !!generatorModule
    });

    let generationResult;
    
    if (generatorModule) {
      // Use new Generator Module
      generationResult = await generatorModule.generateComponent({
        prompt,
        framework,
        category,
        options,
        designFramework,
        userId
      });

      if (!generationResult.success) {
        return res.status(500).json(generationResult);
      }
    } else {
      // Fallback to original OpenAI service
      generationResult = {
        success: true,
        data: {
          component: await openaiService.generateComponent({
            prompt,
            framework,
            category,
            options,
            designFramework
          }),
          metadata: {
            sessionId: `fallback_${Date.now()}`,
            version: '1.0.0-fallback',
            generationTime: 0,
            timestamp: new Date().toISOString()
          }
        }
      };
    }

    // Process and save the component using existing service
    const processedComponent = await componentService.processGeneratedComponent(
      generationResult.data.component,
      {
        userId,
        prompt,
        framework,
        category,
        options
      }
    );

    // Increment user's generation count
    await user.incrementGeneration();

    logger.info('✅ Component generated successfully with new module', {
      userId,
      componentId: processedComponent.id,
      framework,
      sessionId: generationResult.data.metadata.sessionId
    });

    res.json({
      success: true,
      data: {
        component: processedComponent,
        usage: user.getUsageStats(),
        metadata: generationResult.data.metadata
      }
    });

  } catch (error) {
    logger.error('❌ Component generation failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_FAILED',
        message: error.message || 'Failed to generate component'
      }
    });
  }
};

/**
 * Get generation history
 */
exports.getGenerationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      framework,
      category,
      status
    } = req.query;

    const history = await componentService.getGenerationHistory(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      framework,
      category,
      status
    });

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    logger.error('Failed to get generation history', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'HISTORY_FETCH_FAILED',
        message: 'Failed to retrieve generation history'
      }
    });
  }
};

/**
 * Get specific generation by ID
 */
exports.getGenerationById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const component = await componentService.getGenerationById(id, userId);

    if (!component) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMPONENT_NOT_FOUND',
          message: 'Component not found'
        }
      });
    }

    res.json({
      success: true,
      data: { component }
    });

  } catch (error) {
    logger.error('Failed to get generation by ID', {
      error: error.message,
      userId: req.user?.id,
      componentId: req.params.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'COMPONENT_FETCH_FAILED',
        message: 'Failed to retrieve component'
      }
    });
  }
};

/**
 * Save component to library
 */
exports.saveToLibrary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, tags, isPublic } = req.body;

    const savedComponent = await componentService.saveToLibrary(id, userId, {
      name,
      description,
      tags,
      isPublic
    });

    res.json({
      success: true,
      data: { component: savedComponent }
    });

  } catch (error) {
    logger.error('Failed to save component to library', {
      error: error.message,
      userId: req.user?.id,
      componentId: req.params.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'SAVE_FAILED',
        message: 'Failed to save component to library'
      }
    });
  }
};

/**
 * Export component
 */
exports.exportComponent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { format = 'zip' } = req.query;

    const exportData = await componentService.exportComponent(id, userId, format);

    res.json({
      success: true,
      data: exportData
    });

  } catch (error) {
    logger.error('Failed to export component', {
      error: error.message,
      userId: req.user?.id,
      componentId: req.params.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_FAILED',
        message: 'Failed to export component'
      }
    });
  }
};

/**
 * Delete generation
 */
exports.deleteGeneration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await componentService.deleteGeneration(id, userId);

    res.json({
      success: true,
      data: { message: 'Component deleted successfully' }
    });

  } catch (error) {
    logger.error('Failed to delete generation', {
      error: error.message,
      userId: req.user?.id,
      componentId: req.params.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete component'
      }
    });
  }
};

/**
 * Get library components
 */
exports.getLibraryComponents = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      framework,
      category,
      tags
    } = req.query;

    const components = await componentService.getLibraryComponents(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      framework,
      category,
      tags: tags ? tags.split(',') : undefined
    });

    res.json({
      success: true,
      data: components
    });

  } catch (error) {
    logger.error('Failed to get library components', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'LIBRARY_FETCH_FAILED',
        message: 'Failed to retrieve library components'
      }
    });
  }
};

/**
 * Get user usage statistics
 */
exports.getUserUsage = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    const usage = user.getUsageStats();

    res.json({
      success: true,
      data: { usage }
    });

  } catch (error) {
    logger.error('Failed to get user usage', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'USAGE_FETCH_FAILED',
        message: 'Failed to retrieve usage statistics'
      }
    });
  }
};