const { createLogger } = require('../utils/logger');
const Component = require('../models/Component');
const User = require('../models/User');
// Import Prisma client - fallback if TypeScript file doesn't exist
let prisma;
try {
  prisma = require('../lib/prisma').default;
} catch (error) {
  // Fallback: create Prisma client directly
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
}

const logger = createLogger('component-service');

/**
 * Process generated component from OpenAI
 */
exports.processGeneratedComponent = async (data) => {
  try {
    const {
      userId,
      prompt,
      framework,
      category,
      html,
      css,
      javascript,
      typescript,
      dependencies,
      description,
      usage,
      props,
      features,
      metadata,
      options
    } = data;

    // Generate component name from prompt
    const name = generateComponentName(prompt);

    // Create component document
    const component = new Component({
      name,
      description: description || 'AI Generated Component',
      prompt,
      framework,
      category: category || 'custom',
      styleTheme: options?.styleTheme || 'modern',
      code: {
        html: html || '',
        css: css || '',
        javascript: javascript || '',
        typescript: typescript || ''
      },
      dependencies: dependencies || [],
      props: props || [],
      features: features || [],
      usage: usage || '',
      options: {
        responsive: options?.responsive || true,
        accessibility: options?.accessibility || true,
        darkMode: options?.darkMode || false,
        animations: options?.animations || false,
        typescript: options?.typescript || false,
        tests: options?.tests || false
      },
      generationMetadata: {
        model: metadata?.model || 'gpt-4',
        tokensUsed: metadata?.tokensUsed || 0,
        generationTime: metadata?.generationTime || 0,
        completionId: metadata?.completionId,
        temperature: 0.7
      },
      userId,
      status: 'generated',
      tags: generateTags(prompt, framework, category)
    });

    // Save to database
    const savedComponent = await component.save();

    // Update user storage usage
    const user = await User.findById(userId);
    if (user) {
      const componentSize = savedComponent.codeSize;
      await user.updateStorageUsed(componentSize);
    }

    logger.info('Component processed and saved successfully', {
      componentId: savedComponent._id,
      userId,
      name: savedComponent.name,
      framework,
      codeSize: savedComponent.codeSize
    });

    return savedComponent.toSafeObject();

  } catch (error) {
    logger.error('Component processing error:', error);
    throw error;
  }
};

/**
 * Generate component name from prompt
 */
function generateComponentName(prompt) {
  // Extract meaningful words from prompt
  const words = prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !['the', 'and', 'for', 'with', 'that', 'this', 'component'].includes(word))
    .slice(0, 3);

  if (words.length === 0) {
    return 'Custom Component';
  }

  // Convert to title case and join
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') + ' Component';
}

/**
 * Generate tags from prompt, framework, and category
 */
function generateTags(prompt, framework, category) {
  const tags = new Set();
  
  // Add framework
  tags.add(framework);
  
  // Add category
  if (category && category !== 'custom') {
    tags.add(category);
  }
  
  // Extract tags from prompt
  const promptWords = prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['component', 'create', 'make', 'build', 'generate'].includes(word));
  
  // Add relevant prompt words as tags (max 5)
  promptWords.slice(0, 5).forEach(word => tags.add(word));
  
  return Array.from(tags);
}

/**
 * Get generation history for a user
 */
exports.getGenerationHistory = async (filters, pagination) => {
  try {
    const { userId, framework, category, status, search } = filters;
    const { page = 1, limit = 10 } = pagination;
    
    logger.info('Using PostgreSQL/Prisma for getGenerationHistory', { userId });
    
    // Build Prisma where clause
    const where = { userId };
    
    if (framework) where.framework = framework;
    if (category && where.meta) {
      // Category is stored in meta for migrated data
      where.meta = {
        path: ['category'],
        equals: category
      };
    }
    
    // Get total count
    const totalItems = await prisma.component.count({ where });
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get components with pagination
    const components = await prisma.component.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        name: true,
        style: true,
        framework: true,
        version: true,
        codeTs: true,
        codeHtml: true,
        codeScss: true,
        createdAt: true,
        meta: true
      }
    });
    
    return {
      components: components.map(comp => ({
        id: comp.id,
        name: comp.name,
        framework: comp.framework,
        style: comp.style,
        version: comp.version,
        code: {
          html: comp.codeHtml,
          css: comp.codeScss,
          typescript: comp.codeTs,
          javascript: comp.codeTs // Fallback
        },
        createdAt: comp.createdAt,
        description: comp.meta?.description,
        category: comp.meta?.category,
        status: comp.meta?.status || 'generated'
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

  } catch (error) {
    logger.error('Get generation history error:', error);
    throw error;
  }
};

/**
 * Get generation by ID
 */
exports.getGenerationById = async (id, userId) => {
  try {
    const component = await Component.findOne({ _id: id, userId }).lean();
    
    if (!component) {
      throw new Error('Component not found or access denied');
    }
    
    // Increment view count
    await Component.findByIdAndUpdate(id, { $inc: { views: 1 } });
    
    logger.info('Generation retrieved by ID', {
      componentId: id,
      userId,
      name: component.name
    });
    
    return {
      id: component._id,
      name: component.name,
      description: component.description,
      prompt: component.prompt,
      framework: component.framework,
      category: component.category,
      styleTheme: component.styleTheme,
      code: component.code,
      dependencies: component.dependencies,
      props: component.props,
      features: component.features,
      usage: component.usage,
      options: component.options,
      generationMetadata: component.generationMetadata,
      status: component.status,
      isPublic: component.isPublic,
      isSaved: component.isSaved,
      tags: component.tags,
      views: component.views + 1, // Include the increment
      likes: component.likes,
      downloads: component.downloads,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt
    };

  } catch (error) {
    logger.error('Get generation by ID error:', error);
    throw error;
  }
};

/**
 * Save component to library
 */
exports.saveToLibrary = async (id, userId, metadata = {}) => {
  try {
    const component = await Component.findOne({ _id: id, userId });
    
    if (!component) {
      throw new Error('Component not found or access denied');
    }
    
    if (component.isSaved) {
      throw new Error('Component is already saved to library');
    }
    
    // Update component status
    component.isSaved = true;
    component.status = 'saved';
    
    // Update metadata if provided
    if (metadata.name) component.name = metadata.name;
    if (metadata.description) component.description = metadata.description;
    if (metadata.tags) component.tags = [...new Set([...component.tags, ...metadata.tags])];
    if (metadata.isPublic !== undefined) component.isPublic = metadata.isPublic;
    
    await component.save();
    
    logger.info('Component saved to library', {
      componentId: id,
      userId,
      name: component.name
    });

    return component.toSafeObject();

  } catch (error) {
    logger.error('Save to library error:', error);
    throw error;
  }
};

/**
 * Delete generation
 */
exports.deleteGeneration = async (id, userId) => {
  try {
    const component = await Component.findOne({ _id: id, userId });
    
    if (!component) {
      throw new Error('Component not found or access denied');
    }
    
    // Update user storage usage (subtract the component size)
    const user = await User.findById(userId);
    if (user) {
      const componentSize = component.codeSize;
      await user.updateStorageUsed(-componentSize); // Negative to subtract
    }
    
    // Delete the component
    await Component.findByIdAndDelete(id);
    
    logger.info('Generation deleted', {
      componentId: id,
      userId,
      name: component.name,
      codeSize: component.codeSize
    });

    return true;

  } catch (error) {
    logger.error('Delete generation error:', error);
    throw error;
  }
};

/**
 * Get user's library components
 */
exports.getLibraryComponents = async (userId, filters = {}, pagination = {}) => {
  try {
    const { framework, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const { page = 1, limit = 20 } = pagination;
    
    // Build query for saved components
    const query = { 
      userId, 
      isSaved: true,
      status: { $ne: 'archived' }
    };
    
    if (framework) query.framework = framework;
    if (category) query.category = category;
    
    // Add text search if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate skip
    const skip = (page - 1) * limit;
    
    // Get total count
    const totalItems = await Component.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get components
    const components = await Component.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-code.html -code.css -code.javascript -code.typescript') // Exclude large code fields for list view
      .lean();
    
    return {
      data: components.map(comp => ({
        id: comp._id,
        name: comp.name,
        description: comp.description,
        framework: comp.framework,
        category: comp.category,
        tags: comp.tags,
        views: comp.views,
        likes: comp.likes,
        downloads: comp.downloads,
        createdAt: comp.createdAt,
        updatedAt: comp.updatedAt
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

  } catch (error) {
    logger.error('Get library components error:', error);
    throw error;
  }
};

/**
 * Export component as downloadable package
 */
exports.exportComponent = async (id, userId, format = 'zip') => {
  try {
    const component = await Component.findOne({ _id: id, userId });
    
    if (!component) {
      throw new Error('Component not found or access denied');
    }
    
    // Increment download count
    await Component.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
    
    // Prepare export data
    const exportData = {
      name: component.name,
      description: component.description,
      framework: component.framework,
      code: component.code,
      dependencies: component.dependencies,
      props: component.props,
      usage: component.usage,
      options: component.options,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    logger.info('Component exported', {
      componentId: id,
      userId,
      name: component.name,
      format
    });
    
    return exportData;

  } catch (error) {
    logger.error('Export component error:', error);
    throw error;
  }
};