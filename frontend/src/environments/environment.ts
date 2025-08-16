export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000',
  
  // API Configuration
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Features flags
  features: {
    enableServiceWorker: false,
    enableAnalytics: true,
    enableWebSocket: true,
    enableTooltips: true,
    enableAnimations: true,
    enableMockData: false
  },
  
  // Google Analytics
  googleAnalytics: {
    trackingId: '', // TODO: Add your GA tracking ID
    enabled: false
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
  }
};