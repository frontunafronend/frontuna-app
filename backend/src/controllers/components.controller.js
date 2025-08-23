const { createLogger } = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');

const logger = createLogger('components-controller');
const prisma = new PrismaClient();

/**
 * Get all components for authenticated user
 */
async function getComponents(req, res) {
  try {
    const userId = req.user.id;
    
    logger.info('Fetching components for user', { userId });
    
    const components = await prisma.component.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        versions: {
          orderBy: { v: 'desc' },
          take: 5 // Only get latest 5 versions for performance
        }
      }
    });
    
    logger.info('Components fetched successfully', { 
      userId, 
      count: components.length 
    });
    
    res.json({
      success: true,
      data: components
    });
    
  } catch (error) {
    logger.error('Failed to fetch components', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_COMPONENTS_FAILED',
        message: 'Failed to fetch components'
      }
    });
  }
}

/**
 * Get component by ID
 */
async function getComponent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    logger.info('Fetching component', { componentId: id, userId });
    
    const component = await prisma.component.findFirst({
      where: { 
        id,
        userId // Ensure user can only access their own components
      },
      include: {
        versions: {
          orderBy: { v: 'desc' }
        }
      }
    });
    
    if (!component) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMPONENT_NOT_FOUND',
          message: 'Component not found'
        }
      });
    }
    
    logger.info('Component fetched successfully', { 
      componentId: id, 
      userId,
      name: component.name 
    });
    
    res.json({
      success: true,
      data: component
    });
    
  } catch (error) {
    logger.error('Failed to fetch component', { 
      error: error.message,
      componentId: req.params.id,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_COMPONENT_FAILED',
        message: 'Failed to fetch component'
      }
    });
  }
}

/**
 * Create new component
 */
async function createComponent(req, res) {
  try {
    const userId = req.user.id;
    const { name, style, framework, codeTs, codeHtml, codeScss, meta } = req.body;
    
    // Validation
    if (!name || !style || !framework || !codeTs || !codeHtml || !codeScss) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Name, style, framework, and all code fields are required'
        }
      });
    }
    
    logger.info('Creating component', { 
      userId, 
      name, 
      framework, 
      style 
    });
    
    // Check if component name already exists for this user
    const existingComponent = await prisma.component.findFirst({
      where: { 
        userId,
        name 
      }
    });
    
    if (existingComponent) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'COMPONENT_NAME_EXISTS',
          message: 'A component with this name already exists'
        }
      });
    }
    
    // Create component
    const component = await prisma.component.create({
      data: {
        userId,
        name,
        style,
        framework,
        codeTs,
        codeHtml,
        codeScss,
        meta: meta || {},
        version: 1
      },
      include: {
        versions: true
      }
    });
    
    // Create initial version
    await prisma.componentVersion.create({
      data: {
        componentId: component.id,
        v: 1,
        codeTs,
        codeHtml,
        codeScss,
        notes: 'Initial version'
      }
    });
    
    logger.info('Component created successfully', { 
      componentId: component.id,
      userId,
      name: component.name 
    });
    
    res.status(201).json({
      success: true,
      data: component
    });
    
  } catch (error) {
    logger.error('Failed to create component', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_COMPONENT_FAILED',
        message: 'Failed to create component'
      }
    });
  }
}

/**
 * Update component
 */
async function updateComponent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, codeTs, codeHtml, codeScss, meta, notes } = req.body;
    
    logger.info('Updating component', { componentId: id, userId });
    
    // Check if component exists and belongs to user
    const existingComponent = await prisma.component.findFirst({
      where: { 
        id,
        userId 
      }
    });
    
    if (!existingComponent) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMPONENT_NOT_FOUND',
          message: 'Component not found'
        }
      });
    }
    
    // Check if name is being changed and if it conflicts
    if (name && name !== existingComponent.name) {
      const nameConflict = await prisma.component.findFirst({
        where: { 
          userId,
          name,
          id: { not: id } // Exclude current component
        }
      });
      
      if (nameConflict) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'COMPONENT_NAME_EXISTS',
            message: 'A component with this name already exists'
          }
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (meta) updateData.meta = meta;
    
    // If code is being updated, increment version and create new version record
    const codeChanged = codeTs || codeHtml || codeScss;
    if (codeChanged) {
      updateData.version = existingComponent.version + 1;
      if (codeTs) updateData.codeTs = codeTs;
      if (codeHtml) updateData.codeHtml = codeHtml;
      if (codeScss) updateData.codeScss = codeScss;
    }
    
    // Update component
    const component = await prisma.component.update({
      where: { id },
      data: updateData,
      include: {
        versions: {
          orderBy: { v: 'desc' },
          take: 5
        }
      }
    });
    
    // Create new version if code changed
    if (codeChanged) {
      await prisma.componentVersion.create({
        data: {
          componentId: id,
          v: component.version,
          codeTs: codeTs || existingComponent.codeTs,
          codeHtml: codeHtml || existingComponent.codeHtml,
          codeScss: codeScss || existingComponent.codeScss,
          notes: notes || `Version ${component.version}`
        }
      });
    }
    
    logger.info('Component updated successfully', { 
      componentId: id,
      userId,
      name: component.name,
      newVersion: component.version
    });
    
    res.json({
      success: true,
      data: component
    });
    
  } catch (error) {
    logger.error('Failed to update component', { 
      error: error.message,
      componentId: req.params.id,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_COMPONENT_FAILED',
        message: 'Failed to update component'
      }
    });
  }
}

/**
 * Delete component
 */
async function deleteComponent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    logger.info('Deleting component', { componentId: id, userId });
    
    // Check if component exists and belongs to user
    const component = await prisma.component.findFirst({
      where: { 
        id,
        userId 
      }
    });
    
    if (!component) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMPONENT_NOT_FOUND',
          message: 'Component not found'
        }
      });
    }
    
    // Delete component (versions will be deleted automatically due to cascade)
    await prisma.component.delete({
      where: { id }
    });
    
    logger.info('Component deleted successfully', { 
      componentId: id,
      userId,
      name: component.name 
    });
    
    res.json({
      success: true,
      message: 'Component deleted successfully'
    });
    
  } catch (error) {
    logger.error('Failed to delete component', { 
      error: error.message,
      componentId: req.params.id,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_COMPONENT_FAILED',
        message: 'Failed to delete component'
      }
    });
  }
}

/**
 * Get component versions
 */
async function getComponentVersions(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    logger.info('Fetching component versions', { componentId: id, userId });
    
    // Check if component exists and belongs to user
    const component = await prisma.component.findFirst({
      where: { 
        id,
        userId 
      }
    });
    
    if (!component) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMPONENT_NOT_FOUND',
          message: 'Component not found'
        }
      });
    }
    
    const versions = await prisma.componentVersion.findMany({
      where: { componentId: id },
      orderBy: { v: 'desc' }
    });
    
    logger.info('Component versions fetched successfully', { 
      componentId: id,
      userId,
      versionsCount: versions.length 
    });
    
    res.json({
      success: true,
      data: versions
    });
    
  } catch (error) {
    logger.error('Failed to fetch component versions', { 
      error: error.message,
      componentId: req.params.id,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_VERSIONS_FAILED',
        message: 'Failed to fetch component versions'
      }
    });
  }
}

/**
 * Export component as ZIP
 */
async function exportComponent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    logger.info('Exporting component', { componentId: id, userId });
    
    // Check if component exists and belongs to user
    const component = await prisma.component.findFirst({
      where: { 
        id,
        userId 
      }
    });
    
    if (!component) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMPONENT_NOT_FOUND',
          message: 'Component not found'
        }
      });
    }
    
    // Create ZIP file content
    const JSZip = require('jszip');
    const zip = new JSZip();
    
    // Add component files
    zip.file(`${component.name}.component.ts`, component.codeTs);
    zip.file(`${component.name}.component.html`, component.codeHtml);
    zip.file(`${component.name}.component.scss`, component.codeScss);
    
    // Add README
    const readme = `# ${component.name}

Framework: ${component.framework}
Style: ${component.style}
Version: ${component.version}
Created: ${component.createdAt}

## Files
- ${component.name}.component.ts - TypeScript component code
- ${component.name}.component.html - HTML template
- ${component.name}.component.scss - SCSS styles

Generated by Frontuna.com
`;
    
    zip.file('README.md', readme);
    
    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    logger.info('Component exported successfully', { 
      componentId: id,
      userId,
      name: component.name 
    });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${component.name}-component.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);
    
    res.send(zipBuffer);
    
  } catch (error) {
    logger.error('Failed to export component', { 
      error: error.message,
      componentId: req.params.id,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_COMPONENT_FAILED',
        message: 'Failed to export component'
      }
    });
  }
}

/**
 * Search components
 */
async function searchComponents(req, res) {
  try {
    const userId = req.user.id;
    const { q, framework, style } = req.query;
    
    logger.info('Searching components', { userId, query: q, framework, style });
    
    const whereClause = { userId };
    
    // Add search filters
    if (q) {
      whereClause.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { codeTs: { contains: q, mode: 'insensitive' } },
        { codeHtml: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    if (framework) {
      whereClause.framework = framework;
    }
    
    if (style) {
      whereClause.style = style;
    }
    
    const components = await prisma.component.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit results for performance
    });
    
    logger.info('Component search completed', { 
      userId,
      resultsCount: components.length 
    });
    
    res.json({
      success: true,
      data: components
    });
    
  } catch (error) {
    logger.error('Failed to search components', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_COMPONENTS_FAILED',
        message: 'Failed to search components'
      }
    });
  }
}

module.exports = {
  getComponents,
  getComponent,
  createComponent,
  updateComponent,
  deleteComponent,
  getComponentVersions,
  exportComponent,
  searchComponents
};
