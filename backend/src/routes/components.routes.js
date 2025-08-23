const express = require('express');
const { body, query } = require('express-validator');
const componentsController = require('../controllers/components.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const rateLimitMiddleware = require('../middleware/rate-limit.middleware');

const router = express.Router();

// Validation rules
const createComponentValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Component name must be between 1 and 100 characters'),
  body('style')
    .isIn(['material', 'bootstrap', 'html'])
    .withMessage('Style must be material, bootstrap, or html'),
  body('framework')
    .isIn(['angular', 'react', 'vue', 'svelte', 'vanilla'])
    .withMessage('Framework must be angular, react, vue, svelte, or vanilla'),
  body('codeTs')
    .isLength({ min: 1 })
    .withMessage('TypeScript code is required'),
  body('codeHtml')
    .isLength({ min: 1 })
    .withMessage('HTML code is required'),
  body('codeScss')
    .isLength({ min: 1 })
    .withMessage('SCSS code is required'),
  body('meta')
    .optional()
    .isObject()
    .withMessage('Meta must be an object')
];

const updateComponentValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Component name must be between 1 and 100 characters'),
  body('codeTs')
    .optional()
    .isLength({ min: 1 })
    .withMessage('TypeScript code cannot be empty'),
  body('codeHtml')
    .optional()
    .isLength({ min: 1 })
    .withMessage('HTML code cannot be empty'),
  body('codeScss')
    .optional()
    .isLength({ min: 1 })
    .withMessage('SCSS code cannot be empty'),
  body('meta')
    .optional()
    .isObject()
    .withMessage('Meta must be an object'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const searchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('framework')
    .optional()
    .isIn(['angular', 'react', 'vue', 'svelte', 'vanilla'])
    .withMessage('Invalid framework filter'),
  query('style')
    .optional()
    .isIn(['material', 'bootstrap', 'html'])
    .withMessage('Invalid style filter')
];

// All routes require authentication
router.use(authMiddleware);

// GET /api/components - Get all user components
router.get('/', 
  rateLimitMiddleware.api,
  componentsController.getComponents
);

// GET /api/components/search - Search components
router.get('/search', 
  rateLimitMiddleware.api,
  searchValidation,
  validationMiddleware,
  componentsController.searchComponents
);

// GET /api/components/:id - Get specific component
router.get('/:id', 
  rateLimitMiddleware.api,
  componentsController.getComponent
);

// POST /api/components - Create new component
router.post('/', 
  rateLimitMiddleware.generation, // Use generation rate limit for creating components
  createComponentValidation,
  validationMiddleware,
  componentsController.createComponent
);

// PUT /api/components/:id - Update component
router.put('/:id', 
  rateLimitMiddleware.api,
  updateComponentValidation,
  validationMiddleware,
  componentsController.updateComponent
);

// DELETE /api/components/:id - Delete component
router.delete('/:id', 
  rateLimitMiddleware.api,
  componentsController.deleteComponent
);

// GET /api/components/:id/versions - Get component versions
router.get('/:id/versions', 
  rateLimitMiddleware.api,
  componentsController.getComponentVersions
);

// GET /api/components/:id/export - Export component as ZIP
router.get('/:id/export', 
  rateLimitMiddleware.api,
  componentsController.exportComponent
);

module.exports = router;
