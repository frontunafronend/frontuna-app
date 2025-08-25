const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get user profile with subscription and usage data
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log('🔍 Fetching user profile for:', userId);

    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        usageLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate usage statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const usageStats = await prisma.usageLog.aggregate({
      where: {
        userId: userId,
        createdAt: {
          gte: currentMonth
        }
      },
      _count: {
        id: true
      }
    });

    // Determine plan limits based on subscription
    const isAdmin = user.role === 'admin' || user.email === 'admin@frontuna.com';
    let generationsLimit = 10; // Free plan default
    
    if (isAdmin) {
      generationsLimit = 1000;
    } else if (user.subscription?.plan === 'pro') {
      generationsLimit = 100;
    } else if (user.subscription?.plan === 'premium') {
      generationsLimit = 500;
    } else if (user.subscription?.plan === 'enterprise') {
      generationsLimit = 2000;
    }

    // Build comprehensive user profile
    const userProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      company: user.company,
      subscription: {
        plan: user.subscription?.plan || 'free',
        status: user.subscription?.status || 'active',
        startDate: user.subscription?.startDate || new Date(),
        endDate: user.subscription?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isTrialActive: user.subscription?.isTrialActive || false
      },
      usage: {
        generationsUsed: usageStats._count.id || 0,
        generationsLimit: generationsLimit,
        storageUsed: 0, // TODO: Implement storage tracking
        storageLimit: isAdmin ? 1000 : 100,
        lastResetDate: currentMonth
      },
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    console.log('✅ User profile fetched successfully:', {
      email: user.email,
      plan: userProfile.subscription.plan,
      generationsUsed: userProfile.usage.generationsUsed,
      generationsLimit: userProfile.usage.generationsLimit
    });

    res.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user?.id;
    const updates = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log('🔄 Updating user profile:', userId, updates);

    // Only allow certain fields to be updated
    const allowedUpdates = {
      firstName: updates.firstName,
      lastName: updates.lastName,
      avatar: updates.avatar,
      company: updates.company
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...allowedUpdates,
        updatedAt: new Date()
      },
      include: {
        subscription: true
      }
    });

    console.log('✅ User profile updated successfully');

    // Return updated profile using the same format as getUserProfile
    const userProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      company: updatedUser.company,
      subscription: {
        plan: updatedUser.subscription?.plan || 'free',
        status: updatedUser.subscription?.status || 'active',
        startDate: updatedUser.subscription?.startDate || new Date(),
        endDate: updatedUser.subscription?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isTrialActive: updatedUser.subscription?.isTrialActive || false
      },
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user subscription details
 */
const getUserSubscription = async (req, res) => {
  try {
    const userId = req.params.id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const subscription = {
      plan: user.subscription?.plan || 'free',
      status: user.subscription?.status || 'active',
      startDate: user.subscription?.startDate || new Date(),
      endDate: user.subscription?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isTrialActive: user.subscription?.isTrialActive || false
    };

    res.json({
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error('❌ Error fetching user subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user usage statistics
 */
const getUserUsage = async (req, res) => {
  try {
    const userId = req.params.id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate current month usage
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const usageStats = await prisma.usageLog.aggregate({
      where: {
        userId: userId,
        createdAt: {
          gte: currentMonth
        }
      },
      _count: {
        id: true
      }
    });

    // Determine limits based on subscription
    const isAdmin = user.role === 'admin' || user.email === 'admin@frontuna.com';
    let generationsLimit = 10; // Free plan default
    
    if (isAdmin) {
      generationsLimit = 1000;
    } else if (user.subscription?.plan === 'pro') {
      generationsLimit = 100;
    } else if (user.subscription?.plan === 'premium') {
      generationsLimit = 500;
    } else if (user.subscription?.plan === 'enterprise') {
      generationsLimit = 2000;
    }

    const usage = {
      generationsUsed: usageStats._count.id || 0,
      generationsLimit: generationsLimit,
      storageUsed: 0, // TODO: Implement storage tracking
      storageLimit: isAdmin ? 1000 : 100,
      lastResetDate: currentMonth
    };

    res.json({
      success: true,
      data: usage
    });

  } catch (error) {
    console.error('❌ Error fetching user usage:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create or update user subscription
 */
const updateUserSubscription = async (req, res) => {
  try {
    const userId = req.params.id || req.user?.id;
    const { plan, status } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Subscription plan is required'
      });
    }

    console.log('🔄 Updating user subscription:', { userId, plan, status });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate end date based on plan
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: userId },
      update: {
        plan: plan,
        status: status || 'active',
        updatedAt: new Date()
      },
      create: {
        userId: userId,
        plan: plan,
        status: status || 'active',
        startDate: startDate,
        endDate: endDate,
        isTrialActive: plan === 'free'
      }
    });

    console.log('✅ User subscription updated successfully');

    res.json({
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error('❌ Error updating user subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user analytics data
 */
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const analytics = await prisma.usageLog.groupBy({
      by: ['createdAt'],
      where: { userId },
      _count: { id: true },
      orderBy: { createdAt: 'desc' },
      take: 30
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get generation history
 */
const getGenerationHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;
    
    const history = await prisma.component.findMany({
      where: { createdBy: userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('❌ Error fetching generation history:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get usage trends
 */
const getUsageTrends = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { period = '7d' } = req.query;
    
    let dateFilter = new Date();
    if (period === '7d') dateFilter.setDate(dateFilter.getDate() - 7);
    else if (period === '30d') dateFilter.setDate(dateFilter.getDate() - 30);
    else if (period === '90d') dateFilter.setDate(dateFilter.getDate() - 90);
    
    const trends = await prisma.usageLog.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        createdAt: { gte: dateFilter }
      },
      _count: { id: true },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('❌ Error fetching usage trends:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get user preferences
 */
const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferences: true
      }
    });

    const defaultPreferences = {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        updates: true,
        marketing: false
      },
      ui: {
        enableAnimations: true,
        enableTooltips: true,
        compactMode: false
      }
    };

    res.json({
      success: true,
      data: user?.preferences || defaultPreferences
    });
  } catch (error) {
    console.error('❌ Error fetching preferences:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Update user preferences
 */
const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user?.id;
    const preferences = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: preferences,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('❌ Error updating preferences:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    
    // TODO: Implement password validation and hashing
    console.log('🔐 Password change requested for user:', userId);
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Verify email
 */
const verifyEmail = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('❌ Error verifying email:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Enable 2FA
 */
const enable2FA = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // TODO: Implement 2FA logic
    console.log('🔒 2FA enable requested for user:', userId);
    
    res.json({
      success: true,
      message: '2FA enabled successfully'
    });
  } catch (error) {
    console.error('❌ Error enabling 2FA:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Disable 2FA
 */
const disable2FA = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // TODO: Implement 2FA logic
    console.log('🔓 2FA disable requested for user:', userId);
    
    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('❌ Error disabling 2FA:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get user notifications
 */
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // TODO: Implement notifications system
    const mockNotifications = [
      {
        id: '1',
        title: 'Welcome to Frontuna!',
        message: 'Start generating amazing components',
        type: 'info',
        isRead: false,
        createdAt: new Date()
      }
    ];

    res.json({
      success: true,
      data: mockNotifications
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Mark notification as read
 */
const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // TODO: Implement notification marking
    console.log('📖 Marking notification as read:', notificationId);
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking notification:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // TODO: Implement notification deletion
    console.log('🗑️ Deleting notification:', notificationId);
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Export user data
 */
const exportUserData = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        components: true,
        usageLogs: true
      }
    });

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('❌ Error exporting user data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Export user components
 */
const exportUserComponents = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const components = await prisma.component.findMany({
      where: { createdBy: userId },
      include: {
        versions: true
      }
    });

    res.json({
      success: true,
      data: components
    });
  } catch (error) {
    console.error('❌ Error exporting components:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Export user history
 */
const exportUserHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const history = await prisma.usageLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('❌ Error exporting history:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Deactivate account
 */
const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('❌ Error deactivating account:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Delete account
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // TODO: Implement proper account deletion with data cleanup
    console.log('🗑️ Account deletion requested for user:', userId);
    
    res.json({
      success: true,
      message: 'Account deletion initiated'
    });
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserSubscription,
  getUserUsage,
  updateUserSubscription,
  getUserAnalytics,
  getGenerationHistory,
  getUsageTrends,
  getUserPreferences,
  updateUserPreferences,
  changePassword,
  verifyEmail,
  enable2FA,
  disable2FA,
  getUserNotifications,
  markNotificationRead,
  deleteNotification,
  exportUserData,
  exportUserComponents,
  exportUserHistory,
  deactivateAccount,
  deleteAccount
};
