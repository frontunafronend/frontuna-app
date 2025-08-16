const { createLogger } = require('../utils/logger');

// Import Prisma client - fallback if TypeScript file doesn't exist
let prisma;
try {
  prisma = require('../lib/prisma').default;
} catch (error) {
  // Fallback: create Prisma client directly
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
}

const logger = createLogger('transaction-service');

/**
 * Create component with usage logging in a transaction
 */
exports.createComponentWithUsage = async (componentData, usageData) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create the component
      const component = await tx.component.create({
        data: componentData
      });
      
      // Create the initial version
      await tx.componentVersion.create({
        data: {
          id: require('uuid').v4(),
          componentId: component.id,
          v: 1,
          codeTs: componentData.codeTs,
          codeHtml: componentData.codeHtml,
          codeScss: componentData.codeScss,
          notes: 'Initial version'
        }
      });
      
      // Log the usage
      await tx.usageLog.create({
        data: {
          id: require('uuid').v4(),
          userId: componentData.userId,
          tokensIn: usageData.tokensIn || 0,
          tokensOut: usageData.tokensOut || 0,
          route: usageData.route || 'generate'
        }
      });
      
      return component;
    });
    
    logger.info('Component created with usage logging', {
      componentId: result.id,
      userId: componentData.userId
    });
    
    return result;
    
  } catch (error) {
    logger.error('Failed to create component with usage', {
      error: error.message,
      userId: componentData.userId
    });
    throw error;
  }
};

/**
 * Update component and log usage in a transaction
 */
exports.updateComponentWithUsage = async (componentId, updateData, usageData) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update the component
      const component = await tx.component.update({
        where: { id: componentId },
        data: updateData
      });
      
      // Create new version if code changed
      if (updateData.codeTs || updateData.codeHtml || updateData.codeScss) {
        const latestVersion = await tx.componentVersion.findFirst({
          where: { componentId },
          orderBy: { v: 'desc' }
        });
        
        const newVersion = (latestVersion?.v || 0) + 1;
        
        await tx.componentVersion.create({
          data: {
            id: require('uuid').v4(),
            componentId,
            v: newVersion,
            codeTs: updateData.codeTs || latestVersion?.codeTs || '',
            codeHtml: updateData.codeHtml || latestVersion?.codeHtml || '',
            codeScss: updateData.codeScss || latestVersion?.codeScss || '',
            notes: updateData.versionNotes || `Version ${newVersion}`
          }
        });
        
        // Update component version number
        await tx.component.update({
          where: { id: componentId },
          data: { version: newVersion }
        });
      }
      
      // Log the usage
      await tx.usageLog.create({
        data: {
          id: require('uuid').v4(),
          userId: component.userId,
          tokensIn: usageData.tokensIn || 0,
          tokensOut: usageData.tokensOut || 0,
          route: usageData.route || 'update'
        }
      });
      
      return component;
    });
    
    logger.info('Component updated with usage logging', {
      componentId,
      userId: result.userId
    });
    
    return result;
    
  } catch (error) {
    logger.error('Failed to update component with usage', {
      error: error.message,
      componentId
    });
    throw error;
  }
};

/**
 * Delete component and all versions in a transaction
 */
exports.deleteComponentWithUsage = async (componentId, userId, usageData) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Delete all versions first (due to foreign key constraints)
      await tx.componentVersion.deleteMany({
        where: { componentId }
      });
      
      // Delete the component
      const component = await tx.component.delete({
        where: { id: componentId }
      });
      
      // Log the usage
      await tx.usageLog.create({
        data: {
          id: require('uuid').v4(),
          userId,
          tokensIn: usageData.tokensIn || 0,
          tokensOut: usageData.tokensOut || 0,
          route: usageData.route || 'delete'
        }
      });
      
      return component;
    });
    
    logger.info('Component deleted with usage logging', {
      componentId,
      userId
    });
    
    return result;
    
  } catch (error) {
    logger.error('Failed to delete component with usage', {
      error: error.message,
      componentId,
      userId
    });
    throw error;
  }
};

/**
 * Batch create components with usage logging
 */
exports.batchCreateComponentsWithUsage = async (componentsData, userId) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const createdComponents = [];
      let totalTokensIn = 0;
      let totalTokensOut = 0;
      
      for (const componentData of componentsData) {
        // Create component
        const component = await tx.component.create({
          data: {
            ...componentData,
            userId
          }
        });
        
        // Create initial version
        await tx.componentVersion.create({
          data: {
            id: require('uuid').v4(),
            componentId: component.id,
            v: 1,
            codeTs: componentData.codeTs,
            codeHtml: componentData.codeHtml,
            codeScss: componentData.codeScss,
            notes: 'Initial version'
          }
        });
        
        createdComponents.push(component);
        totalTokensIn += componentData.tokensIn || 0;
        totalTokensOut += componentData.tokensOut || 0;
      }
      
      // Log batch usage
      await tx.usageLog.create({
        data: {
          id: require('uuid').v4(),
          userId,
          tokensIn: totalTokensIn,
          tokensOut: totalTokensOut,
          route: 'batch_create'
        }
      });
      
      return createdComponents;
    });
    
    logger.info('Batch components created with usage logging', {
      count: result.length,
      userId
    });
    
    return result;
    
  } catch (error) {
    logger.error('Failed to batch create components with usage', {
      error: error.message,
      count: componentsData.length,
      userId
    });
    throw error;
  }
};

/**
 * Update user subscription with usage reset
 */
exports.updateSubscriptionWithUsageReset = async (userId, subscriptionData) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update or create subscription
      const subscription = await tx.subscription.upsert({
        where: { userId },
        update: subscriptionData,
        create: {
          id: require('uuid').v4(),
          userId,
          ...subscriptionData
        }
      });
      
      // Reset usage logs if upgrading plan
      if (subscriptionData.plan && subscriptionData.plan !== 'free') {
        await tx.usageLog.create({
          data: {
            id: require('uuid').v4(),
            userId,
            tokensIn: 0,
            tokensOut: 0,
            route: 'subscription_update'
          }
        });
      }
      
      return subscription;
    });
    
    logger.info('Subscription updated with usage tracking', {
      userId,
      plan: subscriptionData.plan
    });
    
    return result;
    
  } catch (error) {
    logger.error('Failed to update subscription with usage', {
      error: error.message,
      userId
    });
    throw error;
  }
};

module.exports = exports;
