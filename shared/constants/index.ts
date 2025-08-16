// Shared constants between frontend and backend

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  GENERATOR: {
    GENERATE: '/generator/generate',
    SAVE: '/generator/save',
    LIST: '/generator/list',
    DELETE: '/generator/delete'
  },
  ADMIN: {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    COMPONENTS: '/admin/components',
    SYSTEM_HEALTH: '/admin/health'
  },
  ANALYTICS: {
    TRACK: '/analytics/track',
    STATS: '/analytics/stats'
  },
  UPLOAD: {
    COMPONENT_ZIP: '/upload/component-zip',
    ASSETS: '/upload/assets'
  }
} as const;

export const COMPONENT_FRAMEWORKS = [
  'react',
  'angular',
  'vue'
] as const;

export const COMPONENT_CATEGORIES = [
  'navigation',
  'forms',
  'buttons',
  'cards',
  'modals',
  'layout',
  'data-display',
  'feedback',
  'inputs',
  'media',
  'overlays',
  'typography',
  'utilities'
] as const;

export const STYLING_OPTIONS = [
  'css',
  'scss',
  'tailwind',
  'bootstrap',
  'material-ui',
  'styled-components'
] as const;

export const USER_ROLES = [
  'user',
  'admin'
] as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

export const VALIDATION_RULES = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_-]+$/
  },
  COMPONENT_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z][a-zA-Z0-9_-]*$/
  },
  PROMPT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2000
  }
} as const;

export const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX: 100 // requests per window
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX: 5 // requests per window
  },
  GENERATION: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX: 20 // requests per window
  }
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['.zip', '.tar.gz'],
  ALLOWED_MIME_TYPES: [
    'application/zip',
    'application/x-tar',
    'application/gzip'
  ]
} as const;

export const ANALYTICS_EVENTS = {
  COMPONENT_GENERATED: 'component_generated',
  COMPONENT_SAVED: 'component_saved',
  COMPONENT_DOWNLOADED: 'component_downloaded',
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  PAGE_VIEW: 'page_view',
  SEARCH: 'search',
  ERROR: 'error'
} as const;