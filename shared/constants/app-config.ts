// Application Configuration Constants

// Version Information
export const APP_INFO = {
  NAME: 'Frontuna.com',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-Powered Frontend Component Generator',
      WEBSITE: 'https://frontuna.com',
  REPOSITORY: 'https://github.com/frontuna-ai/frontuna-app'
} as const;

// Supported Frameworks
export const FRAMEWORKS = {
  REACT: 'react',
  ANGULAR: 'angular',
  VUE: 'vue',
  SVELTE: 'svelte',
  VANILLA: 'vanilla'
} as const;

export const FRAMEWORK_LABELS = {
  [FRAMEWORKS.REACT]: 'React',
  [FRAMEWORKS.ANGULAR]: 'Angular',
  [FRAMEWORKS.VUE]: 'Vue.js',
  [FRAMEWORKS.SVELTE]: 'Svelte',
  [FRAMEWORKS.VANILLA]: 'Vanilla JS'
} as const;

// Component Categories
export const COMPONENT_CATEGORIES = {
  LAYOUT: 'layout',
  NAVIGATION: 'navigation',
  FORMS: 'forms',
  BUTTONS: 'buttons',
  CARDS: 'cards',
  MODALS: 'modals',
  TABLES: 'tables',
  CHARTS: 'charts',
  MEDIA: 'media',
  UTILITY: 'utility',
  CUSTOM: 'custom'
} as const;

export const CATEGORY_LABELS = {
  [COMPONENT_CATEGORIES.LAYOUT]: 'Layout',
  [COMPONENT_CATEGORIES.NAVIGATION]: 'Navigation',
  [COMPONENT_CATEGORIES.FORMS]: 'Forms',
  [COMPONENT_CATEGORIES.BUTTONS]: 'Buttons',
  [COMPONENT_CATEGORIES.CARDS]: 'Cards',
  [COMPONENT_CATEGORIES.MODALS]: 'Modals',
  [COMPONENT_CATEGORIES.TABLES]: 'Tables',
  [COMPONENT_CATEGORIES.CHARTS]: 'Charts',
  [COMPONENT_CATEGORIES.MEDIA]: 'Media',
  [COMPONENT_CATEGORIES.UTILITY]: 'Utility',
  [COMPONENT_CATEGORIES.CUSTOM]: 'Custom'
} as const;

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
} as const;

export const ROLE_LABELS = {
  [USER_ROLES.USER]: 'User',
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.MODERATOR]: 'Moderator'
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
} as const;

export const PLAN_LABELS = {
  [SUBSCRIPTION_PLANS.FREE]: 'Free',
  [SUBSCRIPTION_PLANS.BASIC]: 'Basic',
  [SUBSCRIPTION_PLANS.PRO]: 'Pro',
  [SUBSCRIPTION_PLANS.ENTERPRISE]: 'Enterprise'
} as const;

// Plan Limits
export const PLAN_LIMITS = {
  [SUBSCRIPTION_PLANS.FREE]: {
    generations: 10,
    storage: 100, // MB
    components: 25,
    exports: 5
  },
  [SUBSCRIPTION_PLANS.BASIC]: {
    generations: 100,
    storage: 500, // MB
    components: 100,
    exports: 25
  },
  [SUBSCRIPTION_PLANS.PRO]: {
    generations: 500,
    storage: 2000, // MB
    components: 500,
    exports: 100
  },
  [SUBSCRIPTION_PLANS.ENTERPRISE]: {
    generations: -1, // Unlimited
    storage: -1, // Unlimited
    components: -1, // Unlimited
    exports: -1 // Unlimited
  }
} as const;

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  PAST_DUE: 'past_due',
  TRIAL: 'trial'
} as const;

// Component Complexity Levels
export const COMPLEXITY_LEVELS = {
  SIMPLE: 'simple',
  MEDIUM: 'medium',
  COMPLEX: 'complex'
} as const;

export const COMPLEXITY_LABELS = {
  [COMPLEXITY_LEVELS.SIMPLE]: 'Simple',
  [COMPLEXITY_LEVELS.MEDIUM]: 'Medium',
  [COMPLEXITY_LEVELS.COMPLEX]: 'Complex'
} as const;

// Generation Styles
export const GENERATION_STYLES = {
  MODERN: 'modern',
  CLASSIC: 'classic',
  MINIMAL: 'minimal',
  BOLD: 'bold'
} as const;

export const STYLE_LABELS = {
  [GENERATION_STYLES.MODERN]: 'Modern',
  [GENERATION_STYLES.CLASSIC]: 'Classic',
  [GENERATION_STYLES.MINIMAL]: 'Minimal',
  [GENERATION_STYLES.BOLD]: 'Bold'
} as const;

// Color Schemes
export const COLOR_SCHEMES = {
  AUTO: 'auto',
  LIGHT: 'light',
  DARK: 'dark'
} as const;

// File Export Formats
export const EXPORT_FORMATS = {
  ZIP: 'zip',
  TAR_GZ: 'tar.gz',
  JSON: 'json'
} as const;

export const FORMAT_LABELS = {
  [EXPORT_FORMATS.ZIP]: 'ZIP Archive',
  [EXPORT_FORMATS.TAR_GZ]: 'TAR.GZ Archive',
  [EXPORT_FORMATS.JSON]: 'JSON Data'
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  SYSTEM: 'system'
} as const;

// Notification Priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

// Notification Categories
export const NOTIFICATION_CATEGORIES = {
  SYSTEM: 'system',
  ACCOUNT: 'account',
  GENERATION: 'generation',
  SUBSCRIPTION: 'subscription',
  SECURITY: 'security',
  FEATURE: 'feature',
  MAINTENANCE: 'maintenance'
} as const;

// Supported Languages
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  JA: 'ja',
  KO: 'ko',
  ZH: 'zh'
} as const;

export const LANGUAGE_LABELS = {
  [LANGUAGES.EN]: 'English',
  [LANGUAGES.ES]: 'Español',
  [LANGUAGES.FR]: 'Français',
  [LANGUAGES.DE]: 'Deutsch',
  [LANGUAGES.IT]: 'Italiano',
  [LANGUAGES.PT]: 'Português',
  [LANGUAGES.JA]: '日本語',
  [LANGUAGES.KO]: '한국어',
  [LANGUAGES.ZH]: '中文'
} as const;

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const;

// File Upload Constraints
export const UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['.zip', '.tar.gz', '.json'],
  MAX_FILES: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  MAX_IMAGE_SIZE: 5 * 1024 * 1024 // 5MB
} as const;

// Generation Constraints
export const GENERATION_CONSTRAINTS = {
  MIN_PROMPT_LENGTH: 10,
  MAX_PROMPT_LENGTH: 2000,
  MAX_GENERATIONS_PER_HOUR: 20,
  MAX_CONCURRENT_GENERATIONS: 3,
  GENERATION_TIMEOUT: 60000 // 60 seconds
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5
  },
  GENERATION: {
    WINDOW_MS: 5 * 60 * 1000, // 5 minutes
    MAX_REQUESTS: 20
  },
  UPLOAD: {
    WINDOW_MS: 10 * 60 * 1000, // 10 minutes
    MAX_REQUESTS: 10
  }
} as const;

// Cache Duration (in seconds)
export const CACHE_DURATION = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  EXTRA_LONG: 86400 // 24 hours
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  // Page Views
  PAGE_VIEW: 'page_view',
  
  // Authentication
  LOGIN: 'login',
  SIGNUP: 'sign_up',
  LOGOUT: 'logout',
  
  // Component Generation
  GENERATE_COMPONENT: 'generate_component',
  REGENERATE_COMPONENT: 'regenerate_component',
  SAVE_COMPONENT: 'save_component',
  DELETE_COMPONENT: 'delete_component',
  
  // Library Actions
  VIEW_COMPONENT: 'view_component',
  DOWNLOAD_COMPONENT: 'download_component',
  SHARE_COMPONENT: 'share_component',
  RATE_COMPONENT: 'rate_component',
  
  // Search
  SEARCH: 'search',
  FILTER_APPLY: 'filter_apply',
  
  // Subscription
  UPGRADE_PLAN: 'upgrade_plan',
  CANCEL_SUBSCRIPTION: 'cancel_subscription',
  
  // Errors
  ERROR: 'error',
  API_ERROR: 'api_error',
  
  // Engagement
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  FILE_DOWNLOAD: 'file_download',
  VIDEO_PLAY: 'video_play',
  FORM_SUBMIT: 'form_submit'
} as const;

// Social Media Links
export const SOCIAL_LINKS = {
  GITHUB: 'https://github.com/frontuna-ai',
  TWITTER: 'https://twitter.com/frontuna_ai',
  DISCORD: 'https://discord.gg/frontuna',
  LINKEDIN: 'https://linkedin.com/company/frontuna-ai',
  YOUTUBE: 'https://youtube.com/@frontuna-ai'
} as const;

// Support Links
export const SUPPORT_LINKS = {
      DOCUMENTATION: 'https://docs.frontuna.com',
  HELP_CENTER: 'https://help.frontuna.com',
  COMMUNITY: 'https://community.frontuna.com',
  STATUS: 'https://status.frontuna.com',
  CONTACT: 'mailto:support@frontuna.com'
} as const;