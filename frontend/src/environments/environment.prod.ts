export const environment = {
  production: true,
  apiUrl: 'https://api.frontuna.com/api',
  socketUrl: 'https://api.frontuna.com',
  
  // API Configuration
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Features flags
  features: {
    enableServiceWorker: true,
    enableAnalytics: true,
    enableWebSocket: true,
    enableTooltips: true,
    enableAnimations: true,
    enableMockData: false
  },
  
  // Google Analytics
  googleAnalytics: {
    trackingId: 'GA_TRACKING_ID', // TODO: Replace with your GA tracking ID
    enabled: true
  },
  
  // Authentication
  auth: {
    tokenKey: 'frontuna_token',
    refreshTokenKey: 'frontuna_refresh_token',
    tokenExpirationBuffer: 300000 // 5 minutes in milliseconds
  },
  
  // File upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.zip', '.tar.gz'],
    maxFiles: 1
  },
  
  // Component generation
  generation: {
    maxPromptLength: 2000,
    maxComponentsPerUser: 100,
    previewTimeout: 30000
  },
  
  // UI Configuration
  ui: {
    toastTimeout: 5000,
    debounceTime: 300,
    animationDuration: 300,
    paginationPageSize: 10
  },
  
  // External URLs
  urls: {
    documentation: 'https://docs.frontuna.com',
    support: 'mailto:support@frontuna.com',
    github: 'https://github.com/frontuna-ai',
    discord: 'https://discord.gg/frontuna'
  },
  
  // SEO Configuration
  seoIndexDefault: false // Production: Prevent indexing by default (protect unfinished sections)
};