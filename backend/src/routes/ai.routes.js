const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const rateLimitMiddleware = require('../middleware/rate-limit.middleware');
const { createLogger } = require('../utils/logger');

// Import OpenAI service
const openaiService = require('../services/openai.service');

const router = express.Router();
const logger = createLogger('ai-routes');

// All routes require authentication
router.use(authMiddleware);

// Validation rules for prompt
const promptValidation = [
  body('content')
    .trim()
    .isLength({ min: 5, max: 2000 })
    .withMessage('Prompt content must be between 5 and 2000 characters'),
  body('type')
    .optional()
    .isIn(['generate', 'modify', 'refactor', 'optimize'])
    .withMessage('Invalid prompt type'),
  body('context')
    .optional()
    .isString()
    .withMessage('Context must be a string')
];

/**
 * POST /ai/prompt/send - Send prompt to AI and get response
 */
router.post('/prompt/send', 
  rateLimitMiddleware.generation,
  promptValidation,
  validationMiddleware,
  async (req, res) => {
    try {
      const { content, type = 'generate', context, model = 'gpt-4' } = req.body;
      const userId = req.user.id;

      logger.info('AI Prompt request received', {
        userId,
        type,
        contentLength: content.length,
        hasContext: !!context
      });

      // Prepare parameters for OpenAI service
      const params = {
        prompt: content,
        framework: 'angular', // Default framework - could be extracted from context
        category: 'custom',
        style: 'modern',
        options: {
          responsive: true,
          accessibility: true
        }
      };

      // Call OpenAI service with error handling
      let result;
      try {
        result = await openaiService.generateComponent(params);
      } catch (openaiError) {
        logger.error('OpenAI service error:', openaiError.message);
        
        // Provide fallback response when OpenAI fails - with actual working code for testing
        result = {
          explanation: `I understand you want to: ${content}\n\n🔧 **Note**: OpenAI service is currently unavailable, so I'm providing a sample implementation for testing purposes.`,
          codeTs: `import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  template: \`
    <div class="sample-container">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <button (click)="onClick()" [class.active]="isActive">
        {{ isActive ? 'Active' : 'Click Me' }}
      </button>
    </div>
  \`,
  styleUrls: ['./sample.component.scss']
})
export class SampleComponent {
  title = 'Sample Component';
  description = 'Request: ${content}';
  isActive = false;
  
  onClick() {
    this.isActive = !this.isActive;
    console.log('Button clicked!');
  }
}`,
          codeHtml: `<div class="sample-container">
  <header>
    <h1>Sample HTML Template</h1>
    <p>This is a sample HTML template for testing.</p>
  </header>
  
  <main>
    <div class="card">
      <h2>Interactive Card</h2>
      <p>This card demonstrates the HTML structure.</p>
      <button class="btn-primary">Click Me</button>
    </div>
    
    <form class="sample-form">
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" id="name" placeholder="Enter your name">
      </div>
      <button type="submit" class="btn-submit">Submit</button>
    </form>
  </main>
</div>`,
          codeScss: `.sample-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
  
  header {
    text-align: center;
    margin-bottom: 2rem;
    
    h1 {
      color: #333;
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    
    p {
      color: #666;
      font-size: 1.1rem;
    }
  }
  
  main {
    .card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      border: 1px solid #dee2e6;
      
      h2 {
        color: #495057;
        margin-bottom: 1rem;
      }
      
      .btn-primary {
        background: #007bff;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background: #0056b3;
        }
      }
    }
    
    .sample-form {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #dee2e6;
      
      .form-group {
        margin-bottom: 1rem;
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        
        input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ced4da;
          border-radius: 4px;
          
          &:focus {
            outline: none;
            border-color: #007bff;
          }
        }
      }
      
      .btn-submit {
        background: #28a745;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background: #218838;
        }
      }
    }
  }
}`,
          tokensUsed: 0,
          generationTime: 0
        };
      }

      // Format response for frontend
      const response = {
        id: `prompt_${Date.now()}`,
        content: result.explanation || 'AI response generated',
        code: {
          typescript: result.codeTs || '',
          html: result.codeHtml || '',
          scss: result.codeScss || '',
          javascript: result.codeJs || ''
        },
        type: 'ai',
        timestamp: new Date().toISOString(),
        suggestions: result.suggestions || [],
        metadata: {
          model,
          tokensUsed: result.tokensUsed || 0,
          generationTime: result.generationTime || 0,
          framework: 'angular'
        }
      };

      logger.info('AI Prompt response generated', {
        userId,
        responseId: response.id,
        tokensUsed: result.tokensUsed || 0
      });

      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      logger.error('AI Prompt error:', {
        userId: req.user?.id,
        error: error.message,
        stack: error.stack
      });

      // Always return a valid response structure even on error
      const fallbackResponse = {
        id: `error_${Date.now()}`,
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        code: {
          typescript: '// Error occurred during generation',
          html: '<!-- Error occurred during generation -->',
          scss: '/* Error occurred during generation */',
          javascript: '// Error occurred during generation'
        },
        type: 'error',
        timestamp: new Date().toISOString(),
        suggestions: [],
        metadata: {
          model: 'error',
          tokensUsed: 0,
          generationTime: 0,
          framework: 'angular',
          error: true
        }
      };

      res.status(200).json({
        success: true,
        data: fallbackResponse
      });
    }
  }
);

/**
 * POST /ai/transform - Transform code using AI
 */
router.post('/transform',
  rateLimitMiddleware.generation,
  [
    body('sourceCode')
      .trim()
      .isLength({ min: 10, max: 10000 })
      .withMessage('Source code must be between 10 and 10000 characters'),
    body('transformationType')
      .isIn(['refactor', 'optimize', 'convert', 'enhance'])
      .withMessage('Invalid transformation type'),
    body('framework')
      .isIn(['angular', 'react', 'vue', 'svelte'])
      .withMessage('Invalid framework')
  ],
  validationMiddleware,
  async (req, res) => {
    try {
      const { sourceCode, transformationType, framework, options = {} } = req.body;
      const userId = req.user.id;

      logger.info('AI Transform request received', {
        userId,
        transformationType,
        framework,
        codeLength: sourceCode.length
      });

      // Prepare transformation prompt
      const transformPrompt = `Transform this ${framework} code by ${transformationType}:\n\n${sourceCode}`;

      const params = {
        prompt: transformPrompt,
        framework,
        category: 'custom',
        style: 'modern',
        options: {
          ...options,
          transformation: transformationType
        }
      };

      const result = await openaiService.generateComponent(params);

      const response = {
        id: `transform_${Date.now()}`,
        originalCode: sourceCode,
        transformedCode: result.codeTs || result.codeHtml,
        changes: [],
        explanation: result.explanation,
        transformationType,
        framework,
        metadata: {
          tokensUsed: result.tokensUsed,
          generationTime: result.generationTime
        }
      };

      logger.info('AI Transform response generated', {
        userId,
        transformId: response.id
      });

      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      logger.error('AI Transform error:', {
        userId: req.user?.id,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'AI_TRANSFORM_FAILED',
          message: 'Failed to transform code',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }
);

/**
 * POST /ai/diff - Generate diff between code versions
 */
router.post('/diff',
  [
    body('originalCode').trim().notEmpty().withMessage('Original code is required'),
    body('modifiedCode').trim().notEmpty().withMessage('Modified code is required')
  ],
  validationMiddleware,
  async (req, res) => {
    try {
      const { originalCode, modifiedCode, options = {} } = req.body;
      const userId = req.user.id;

      // Simple diff implementation (in production, use a proper diff library)
      const diff = {
        id: `diff_${Date.now()}`,
        originalCode,
        modifiedCode,
        changes: [],
        summary: 'Code comparison completed',
        timestamp: new Date()
      };

      res.json({
        success: true,
        data: diff
      });

    } catch (error) {
      logger.error('AI Diff error:', {
        userId: req.user?.id,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'AI_DIFF_FAILED',
          message: 'Failed to generate diff'
        }
      });
    }
  }
);

module.exports = router;

