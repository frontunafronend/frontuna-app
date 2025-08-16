const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get current usage statistics
router.get('/current', (req, res) => {
  res.json({
    success: true,
    data: {
      generationsUsed: req.user.usage.generationsUsed,
      generationsLimit: req.user.usage.generationsLimit,
      storageUsed: req.user.usage.storageUsed,
      storageLimit: req.user.usage.storageLimit,
      resetDate: req.user.usage.lastResetDate
    }
  });
});

// Get usage history
router.get('/history', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Usage history endpoint - to be implemented'
    }
  });
});

// Get usage limits
router.get('/limits', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Usage limits endpoint - to be implemented'
    }
  });
});

module.exports = router;