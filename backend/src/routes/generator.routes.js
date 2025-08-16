const express = require('express');
const { body } = require('express-validator');
const generatorController = require('../controllers/generator.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const rateLimitMiddleware = require('../middleware/rate-limit.middleware');

const router = express.Router();

// Validation rules
const generateValidation = [
  body('prompt')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Prompt must be between 10 and 2000 characters'),
  body('framework')
    .isIn(['react', 'angular', 'vue', 'svelte', 'vanilla'])
    .withMessage('Invalid framework specified'),
  body('category')
    .optional()
    .isIn(['layout', 'navigation', 'forms', 'buttons', 'cards', 'modals', 'tables', 'charts', 'media', 'utility', 'custom'])
    .withMessage('Invalid category specified'),
  body('options.responsive')
    .optional()
    .isBoolean()
    .withMessage('Responsive option must be boolean'),
  body('options.accessibility')
    .optional()
    .isBoolean()
    .withMessage('Accessibility option must be boolean')
];

// All routes require authentication
router.use(authMiddleware);

// Generate component
router.post('/component', 
  rateLimitMiddleware.generation,
  generateValidation,
  validationMiddleware,
  generatorController.generateComponent
);

// Get generation history
router.get('/history', 
  generatorController.getGenerationHistory
);

// Get specific generation
router.get('/component/:id', 
  generatorController.getGenerationById
);

// Save component to library
router.post('/component/:id/save', 
  generatorController.saveToLibrary
);

// Export component
router.get('/component/:id/export', 
  generatorController.exportComponent
);

// Delete generation
router.delete('/component/:id', 
  generatorController.deleteGeneration
);

// Library endpoints
router.get('/library', 
  generatorController.getLibraryComponents
);

// Usage endpoints
router.get('/usage', 
  generatorController.getUserUsage
);

module.exports = router;