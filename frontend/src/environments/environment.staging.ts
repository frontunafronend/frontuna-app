export const environment = {
  production: false, // Staging is not production
  apiUrl: 'https://api-staging.frontuna.com/api',
  socketUrl: 'https://api-staging.frontuna.com',
  
  // API Configuration
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Features flags
  features: {
    enableServiceWorker: false, // Disable SW in staging
    enableAnalytics: true,
    enableWebSocket: true,
    enableTooltips: true,
    enableAnimations: true
  },
  
  // Google Analytics 4
  googleAnalytics: {
    trackingId: 'G-QJ5BQ4LBZS', // Same tracking ID but different environment
    enabled: true,
    debugMode: true, // Enable debug mode for staging
    anonymizeIp: true,
    cookieFlags: 'SameSite=None;Secure'
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
  seoIndexDefault: false // Staging: Prevent indexing by default
};
