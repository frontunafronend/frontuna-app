const mongoose = require('mongoose');
const { Schema } = mongoose;

const componentSchema = new Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Component name is required'],
    trim: true,
    maxlength: [100, 'Component name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Component description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  prompt: {
    type: String,
    required: [true, 'Original prompt is required'],
    trim: true,
    maxlength: [2000, 'Prompt cannot exceed 2000 characters']
  },

  // Technical Details
  framework: {
    type: String,
    required: [true, 'Framework is required'],
    enum: ['react', 'angular', 'vue', 'svelte', 'vanilla'],
    lowercase: true
  },
  category: {
    type: String,
    enum: ['layout', 'navigation', 'form', 'card', 'button', 'modal', 'table', 'chart', 'custom'],
    default: 'custom'
  },
  styleTheme: {
    type: String,
    enum: ['modern', 'classic', 'minimal', 'colorful', 'corporate'],
    default: 'modern'
  },

  // Generated Code
  code: {
    html: {
      type: String,
      default: ''
    },
    css: {
      type: String,
      default: ''
    },
    javascript: {
      type: String,
      default: ''
    },
    typescript: {
      type: String,
      default: ''
    }
  },

  // Component Metadata
  dependencies: [{
    type: String,
    trim: true
  }],
  props: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    required: {
      type: Boolean,
      default: false
    },
    defaultValue: String
  }],
  features: [{
    type: String,
    trim: true
  }],
  usage: {
    type: String,
    default: ''
  },

  // Component Options
  options: {
    responsive: {
      type: Boolean,
      default: true
    },
    accessibility: {
      type: Boolean,
      default: true
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    animations: {
      type: Boolean,
      default: false
    },
    typescript: {
      type: Boolean,
      default: false
    },
    tests: {
      type: Boolean,
      default: false
    }
  },

  // Generation Metadata
  generationMetadata: {
    model: {
      type: String,
      default: 'gpt-4'
    },
    tokensUsed: {
      type: Number,
      min: 0
    },
    generationTime: {
      type: Number,
      min: 0
    },
    completionId: String,
    temperature: {
      type: Number,
      default: 0.7
    }
  },

  // User Association
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  // Status and Visibility
  status: {
    type: String,
    enum: ['generated', 'saved', 'published', 'archived'],
    default: 'generated'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isSaved: {
    type: Boolean,
    default: false
  },

  // Preview and Assets
  previewUrl: String,
  thumbnailUrl: String,
  assetsUrl: String,

  // Rating and Usage
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  downloads: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },

  // Tags for searching
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],

  // File size for storage tracking
  fileSize: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
componentSchema.index({ userId: 1, createdAt: -1 });
componentSchema.index({ framework: 1, category: 1 });
componentSchema.index({ status: 1, isPublic: 1 });
componentSchema.index({ tags: 1 });
componentSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for formatted creation date
componentSchema.virtual('createdAtFormatted').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Virtual for code size
componentSchema.virtual('codeSize').get(function() {
  const html = this.code.html || '';
  const css = this.code.css || '';
  const js = this.code.javascript || '';
  const ts = this.code.typescript || '';
  return html.length + css.length + js.length + ts.length;
});

// Pre-save middleware to calculate file size
componentSchema.pre('save', function(next) {
  if (this.isModified('code')) {
    this.fileSize = this.codeSize;
  }
  next();
});

// Instance methods
componentSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  return {
    id: obj._id,
    name: obj.name,
    description: obj.description,
    framework: obj.framework,
    category: obj.category,
    styleTheme: obj.styleTheme,
    code: obj.code,
    dependencies: obj.dependencies,
    props: obj.props,
    features: obj.features,
    usage: obj.usage,
    options: obj.options,
    status: obj.status,
    isPublic: obj.isPublic,
    isSaved: obj.isSaved,
    previewUrl: obj.previewUrl,
    thumbnailUrl: obj.thumbnailUrl,
    rating: obj.rating,
    downloads: obj.downloads,
    likes: obj.likes,
    views: obj.views,
    tags: obj.tags,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    codeSize: this.codeSize
  };
};

componentSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

componentSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

componentSchema.methods.toggleLike = function(increment = true) {
  this.likes += increment ? 1 : -1;
  if (this.likes < 0) this.likes = 0;
  return this.save();
};

// Static methods
componentSchema.statics.findByUserId = function(userId, options = {}) {
  const query = { userId };
  if (options.status) query.status = options.status;
  if (options.framework) query.framework = options.framework;
  if (options.category) query.category = options.category;
  
  return this.find(query)
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

componentSchema.statics.findPublic = function(options = {}) {
  const query = { isPublic: true, status: { $ne: 'archived' } };
  if (options.framework) query.framework = options.framework;
  if (options.category) query.category = options.category;
  if (options.tags) query.tags = { $in: options.tags };
  
  return this.find(query)
    .sort(options.sort || { createdAt: -1, likes: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

componentSchema.statics.searchComponents = function(searchTerm, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    isPublic: true,
    status: { $ne: 'archived' }
  };
  
  if (options.framework) query.framework = options.framework;
  if (options.category) query.category = options.category;
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, likes: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

componentSchema.statics.getPopular = function(options = {}) {
  const query = { isPublic: true, status: { $ne: 'archived' } };
  if (options.framework) query.framework = options.framework;
  if (options.timeframe) {
    const date = new Date();
    date.setDate(date.getDate() - options.timeframe);
    query.createdAt = { $gte: date };
  }
  
  return this.find(query)
    .sort({ likes: -1, downloads: -1, views: -1 })
    .limit(options.limit || 10);
};

componentSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalComponents: { $sum: 1 },
        totalDownloads: { $sum: '$downloads' },
        totalLikes: { $sum: '$likes' },
        totalViews: { $sum: '$views' },
        frameworks: { $addToSet: '$framework' },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
};

// Create and export model
const Component = mongoose.model('Component', componentSchema);

module.exports = Component;