// API Base URLs
export const API_BASE_URL = '/api';

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  DELETE_ACCOUNT: '/auth/account',
  
  // OAuth
  GOOGLE_AUTH: '/auth/google',
  GOOGLE_CALLBACK: '/auth/google/callback',
  GITHUB_AUTH: '/auth/github',
  GITHUB_CALLBACK: '/auth/github/callback'
} as const;

// Component Generation Endpoints
export const GENERATOR_ENDPOINTS = {
  GENERATE: '/generate/component',
  HISTORY: '/generate/history',
  REGENERATE: (id: string) => \`/generate/regenerate/\${id}\`,
  SAVE: (id: string) => \`/generate/save/\${id}\`,
  DELETE: (id: string) => \`/generate/history/\${id}\`,
  GET: (id: string) => \`/generate/history/\${id}\`
} as const;

// Component Library Endpoints
export const LIBRARY_ENDPOINTS = {
  LIST: '/library',
  GET: (id: string) => \`/library/\${id}\`,
  UPDATE: (id: string) => \`/library/\${id}\`,
  DELETE: (id: string) => \`/library/\${id}\`,
  FAVORITE: (id: string) => \`/library/\${id}/favorite\`,
  RATE: (id: string) => \`/library/\${id}/rate\`,
  DOWNLOAD: (id: string) => \`/library/\${id}/download\`,
  SHARE: (id: string) => \`/library/\${id}/share\`,
  CATEGORIES: '/library/categories',
  TAGS: '/library/tags',
  SEARCH: '/library/search'
} as const;

// Usage & Analytics Endpoints
export const USAGE_ENDPOINTS = {
  CURRENT: '/usage/current',
  HISTORY: '/usage/history',
  LIMITS: '/usage/limits',
  RESET: '/usage/reset'
} as const;

// Admin Endpoints
export const ADMIN_ENDPOINTS = {
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  USER: (id: string) => \`/admin/users/\${id}\`,
  USER_ACTIVATE: (id: string) => \`/admin/users/\${id}/activate\`,
  USER_DEACTIVATE: (id: string) => \`/admin/users/\${id}/deactivate\`,
  ANALYTICS: '/admin/analytics',
  COMPONENTS: '/admin/components',
  COMPONENT: (id: string) => \`/admin/components/\${id}\`,
  LOGS: '/admin/logs',
  SETTINGS: '/admin/settings',
  AI_KEEPER: '/admin/ai-keeper',
  SYSTEM_HEALTH: '/admin/health'
} as const;

// File Upload Endpoints
export const UPLOAD_ENDPOINTS = {
  COMPONENT: '/upload/component',
  AVATAR: '/upload/avatar',
  BULK: '/upload/bulk',
  STATUS: (id: string) => \`/upload/status/\${id}\`
} as const;

// Export Endpoints
export const EXPORT_ENDPOINTS = {
  COMPONENT: (id: string) => \`/export/component/\${id}\`,
  LIBRARY: '/export/library',
  BULK: '/export/bulk',
  DOWNLOAD: (id: string) => \`/export/download/\${id}\`
} as const;

// Analytics Endpoints
export const ANALYTICS_ENDPOINTS = {
  OVERVIEW: '/analytics/overview',
  USAGE: '/analytics/usage',
  USERS: '/analytics/users',
  COMPONENTS: '/analytics/components',
  PERFORMANCE: '/analytics/performance',
  EVENTS: '/analytics/events'
} as const;

// SEO Endpoints
export const SEO_ENDPOINTS = {
  SITEMAP: '/seo/sitemap',
  ROBOTS: '/seo/robots',
  META: '/seo/meta',
  STRUCTURED_DATA: '/seo/structured-data'
} as const;

// Notification Endpoints
export const NOTIFICATION_ENDPOINTS = {
  LIST: '/notifications',
  GET: (id: string) => \`/notifications/\${id}\`,
  MARK_READ: (id: string) => \`/notifications/\${id}/read\`,
  MARK_ALL_READ: '/notifications/read-all',
  DELETE: (id: string) => \`/notifications/\${id}\`,
  PREFERENCES: '/notifications/preferences'
} as const;

// Health Check Endpoints
export const HEALTH_ENDPOINTS = {
  API: '/health',
  DATABASE: '/health/database',
  OPENAI: '/health/openai',
  VERSION: '/version'
} as const;

// WebSocket Events
export const WEBSOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Authentication
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  
  // Component Generation
  GENERATION_STARTED: 'generation_started',
  GENERATION_PROGRESS: 'generation_progress',
  GENERATION_COMPLETED: 'generation_completed',
  GENERATION_FAILED: 'generation_failed',
  
  // Notifications
  NEW_NOTIFICATION: 'new_notification',
  NOTIFICATION_READ: 'notification_read',
  
  // Admin
  USER_ACTIVITY: 'user_activity',
  SYSTEM_ALERT: 'system_alert',
  
  // Real-time Updates
  USAGE_UPDATED: 'usage_updated',
  COMPONENT_SAVED: 'component_saved',
  LIBRARY_UPDATED: 'library_updated'
} as const;

// Rate Limit Headers
export const RATE_LIMIT_HEADERS = {
  LIMIT: 'X-RateLimit-Limit',
  REMAINING: 'X-RateLimit-Remaining',
  RESET: 'X-RateLimit-Reset',
  RETRY_AFTER: 'Retry-After'
} as const;

// API Response Headers
export const API_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  REQUEST_ID: 'X-Request-ID',
  API_VERSION: 'X-API-Version',
  TOTAL_COUNT: 'X-Total-Count',
  PAGE_COUNT: 'X-Page-Count'
} as const;