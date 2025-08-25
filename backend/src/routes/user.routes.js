const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validation.middleware');

/**
 * 🔥 COMPREHENSIVE USER ROUTES - SPRINT 1
 * All routes for complete user management and data connectivity
 */

// 👤 USER PROFILE ROUTES
router.get('/profile', authenticateToken, userController.getUserProfile);
router.get('/:id/profile', authenticateToken, userController.getUserProfile);
router.put('/profile', authenticateToken, userController.updateUserProfile);
router.put('/:id/profile', authenticateToken, userController.updateUserProfile);

// 💳 SUBSCRIPTION ROUTES  
router.get('/subscription', authenticateToken, userController.getUserSubscription);
router.get('/:id/subscription', authenticateToken, userController.getUserSubscription);
router.put('/subscription', authenticateToken, userController.updateUserSubscription);
router.put('/:id/subscription', authenticateToken, userController.updateUserSubscription);

// 📊 USAGE ROUTES
router.get('/usage', authenticateToken, userController.getUserUsage);
router.get('/:id/usage', authenticateToken, userController.getUserUsage);

// 📈 ANALYTICS ROUTES
router.get('/analytics', authenticateToken, userController.getUserAnalytics);
router.get('/analytics/generations', authenticateToken, userController.getGenerationHistory);
router.get('/analytics/usage-trends', authenticateToken, userController.getUsageTrends);

// 🎯 PREFERENCES ROUTES
router.get('/preferences', authenticateToken, userController.getUserPreferences);
router.put('/preferences', authenticateToken, userController.updateUserPreferences);

// 🔒 SECURITY ROUTES
router.post('/change-password', authenticateToken, userController.changePassword);
router.post('/verify-email', authenticateToken, userController.verifyEmail);
router.post('/enable-2fa', authenticateToken, userController.enable2FA);
router.post('/disable-2fa', authenticateToken, userController.disable2FA);

// 📱 NOTIFICATION ROUTES
router.get('/notifications', authenticateToken, userController.getUserNotifications);
router.put('/notifications/:notificationId/read', authenticateToken, userController.markNotificationRead);
router.delete('/notifications/:notificationId', authenticateToken, userController.deleteNotification);

// 💾 DATA EXPORT ROUTES
router.get('/export', authenticateToken, userController.exportUserData);
router.get('/export/components', authenticateToken, userController.exportUserComponents);
router.get('/export/history', authenticateToken, userController.exportUserHistory);

// 🗑️ ACCOUNT MANAGEMENT
router.post('/deactivate', authenticateToken, userController.deactivateAccount);
router.delete('/delete', authenticateToken, userController.deleteAccount);

module.exports = router;
