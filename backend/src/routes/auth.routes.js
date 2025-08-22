const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const rateLimitMiddleware = require('../middleware/rate-limit.middleware');

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

const signupValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least 8 characters with uppercase, lowercase, number and special character'),
  body('agreeToTerms')
    .isBoolean()
    .custom(value => value === true)
    .withMessage('You must agree to the terms and conditions')
];

const resetPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const changePasswordValidation = [
  body('currentPassword')
    .isLength({ min: 8 })
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least 8 characters with uppercase, lowercase, number and special character')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

// Public routes
router.post('/login', 
  // rateLimitMiddleware.auth, // Temporarily disabled for testing
  loginValidation,
  validationMiddleware,
  authController.login
);

router.post('/signup', 
  // rateLimitMiddleware.auth, // Temporarily disabled for testing
  signupValidation,
  validationMiddleware,
  authController.signup
);

router.post('/refresh', 
  rateLimitMiddleware.auth,
  authController.refreshToken
);

router.post('/reset-password', 
  rateLimitMiddleware.passwordReset,
  resetPasswordValidation,
  validationMiddleware,
  authController.requestPasswordReset
);

router.post('/reset-password/:token', 
  rateLimitMiddleware.passwordReset,
  changePasswordValidation,
  validationMiddleware,
  authController.resetPassword
);

router.post('/verify-email/:token', 
  authController.verifyEmail
);

router.post('/resend-verification', 
  rateLimitMiddleware.emailVerification,
  body('email').isEmail().normalizeEmail(),
  validationMiddleware,
  authController.resendVerification
);

// Protected routes
router.use(authMiddleware); // All routes below require authentication

router.get('/profile', 
  authController.getProfile
);

router.put('/profile', 
  updateProfileValidation,
  validationMiddleware,
  authController.updateProfile
);

router.post('/change-password', 
  changePasswordValidation,
  validationMiddleware,
  authController.changePassword
);

router.post('/logout', 
  authController.logout
);

router.delete('/account', 
  body('password').isLength({ min: 8 }),
  validationMiddleware,
  authController.deleteAccount
);

// OAuth routes (placeholder for future implementation)
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);
router.get('/github', authController.githubAuth);
router.get('/github/callback', authController.githubCallback);

module.exports = router;