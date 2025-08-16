const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  // Basic Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in query results by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },

  // Account Status
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  // Subscription Information
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due', 'trial'],
      default: 'trial'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    },
    isTrialActive: {
      type: Boolean,
      default: true
    },
    trialEndDate: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    },
    customerId: String, // Stripe customer ID
    subscriptionId: String // Stripe subscription ID
  },

  // Usage Tracking
  usage: {
    generationsUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    generationsLimit: {
      type: Number,
      default: 10 // Free tier limit
    },
    storageUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    storageLimit: {
      type: Number,
      default: 100 // 100MB for free tier
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },

  // User Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      },
      updates: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      }
    },
    ui: {
      enableAnimations: {
        type: Boolean,
        default: true
      },
      enableTooltips: {
        type: Boolean,
        default: true
      },
      compactMode: {
        type: Boolean,
        default: false
      }
    }
  },

  // Authentication & Security
  refreshToken: {
    type: String,
    select: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpiry: {
    type: Date,
    select: false
  },

  // Terms & Agreements
  agreeToTerms: {
    type: Boolean,
    required: [true, 'You must agree to the terms and conditions']
  },
  subscribeToNewsletter: {
    type: Boolean,
    default: false
  },

  // Tracking Information
  registrationIP: String,
  lastLoginAt: Date,
  lastLoginIP: String,
  loginCount: {
    type: Number,
    default: 0
  },

  // Timestamps
  emailVerifiedAt: Date,
  passwordChangedAt: Date,
  deletedAt: Date
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshToken;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpiry;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for usage percentage
userSchema.virtual('usagePercentage').get(function() {
  if (this.usage.generationsLimit === 0) return 0;
  return Math.round((this.usage.generationsUsed / this.usage.generationsLimit) * 100);
});

// Virtual for subscription status
userSchema.virtual('isSubscriptionActive').get(function() {
  return this.subscription.status === 'active' || 
         (this.subscription.status === 'trial' && this.subscription.isTrialActive);
});

// Virtual for trial days remaining
userSchema.virtual('trialDaysRemaining').get(function() {
  if (!this.subscription.isTrialActive || !this.subscription.trialEndDate) return 0;
  const now = new Date();
  const trialEnd = new Date(this.subscription.trialEndDate);
  const diffTime = trialEnd - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Update login count on login
  if (this.isModified('lastLoginAt')) {
    this.loginCount += 1;
  }
  
  // Set email verification status to false if email is changed
  if (this.isModified('email') && !this.isNew) {
    this.isEmailVerified = false;
    this.emailVerificationToken = require('crypto').randomBytes(32).toString('hex');
  }
  
  next();
});

// Instance methods for usage management
userSchema.methods.canGenerate = function() {
  return this.usage.generationsUsed < this.usage.generationsLimit;
};

userSchema.methods.incrementGeneration = async function() {
  this.usage.generationsUsed += 1;
  return this.save();
};

userSchema.methods.resetUsage = async function() {
  this.usage.generationsUsed = 0;
  this.usage.lastResetDate = new Date();
  return this.save();
};

userSchema.methods.updateStorageUsed = async function(sizeInBytes) {
  this.usage.storageUsed += sizeInBytes;
  return this.save();
};

userSchema.methods.canUseStorage = function(sizeInBytes) {
  return (this.usage.storageUsed + sizeInBytes) <= (this.usage.storageLimit * 1024 * 1024); // Convert MB to bytes
};

userSchema.methods.getUsageStats = function() {
  return {
    generations: {
      used: this.usage.generationsUsed,
      limit: this.usage.generationsLimit,
      remaining: this.usage.generationsLimit - this.usage.generationsUsed,
      percentage: Math.round((this.usage.generationsUsed / this.usage.generationsLimit) * 100)
    },
    storage: {
      used: this.usage.storageUsed,
      limit: this.usage.storageLimit * 1024 * 1024, // Convert to bytes
      remaining: (this.usage.storageLimit * 1024 * 1024) - this.usage.storageUsed,
      percentage: Math.round((this.usage.storageUsed / (this.usage.storageLimit * 1024 * 1024)) * 100)
    },
    plan: this.subscription.plan,
    status: this.subscription.status,
    lastReset: this.usage.lastResetDate
  };
};

userSchema.methods.hasReachedGenerationLimit = function() {
  return this.usage.generationsUsed >= this.usage.generationsLimit;
};

userSchema.methods.hasReachedStorageLimit = function() {
  return this.usage.storageUsed >= this.usage.storageLimit;
};

userSchema.methods.canGenerate = function() {
  return this.isActive && 
         this.isSubscriptionActive && 
         !this.hasReachedGenerationLimit();
};

userSchema.methods.incrementGeneration = function() {
  this.usage.generationsUsed += 1;
  return this.save();
};

userSchema.methods.resetUsage = function() {
  this.usage.generationsUsed = 0;
  this.usage.lastResetDate = new Date();
  return this.save();
};

userSchema.methods.updateStorageUsage = function(bytes) {
  this.usage.storageUsed += bytes;
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.createUser = function(userData) {
  const user = new this(userData);
  return user.save();
};

userSchema.statics.getActiveUsers = function() {
  return this.find({ isActive: true });
};

userSchema.statics.getUsersByPlan = function(plan) {
  return this.find({ 'subscription.plan': plan, isActive: true });
};

userSchema.statics.getTrialUsers = function() {
  return this.find({ 
    'subscription.status': 'trial',
    'subscription.isTrialActive': true,
    isActive: true 
  });
};

userSchema.statics.getExpiredTrialUsers = function() {
  return this.find({
    'subscription.status': 'trial',
    'subscription.trialEndDate': { $lt: new Date() },
    isActive: true
  });
};

// Create and export model
const User = mongoose.model('User', userSchema);

module.exports = User;