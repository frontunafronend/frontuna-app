import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Frontuna E2E Tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './e2e/tests',
  
  // Global test timeout
  timeout: 60 * 1000, // 60 seconds per test
  
  // Global expect timeout
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: './e2e/test-results/html-report',
      open: process.env.CI ? 'never' : 'on-failure'
    }],
    ['json', { 
      outputFile: './e2e/test-results/results.json' 
    }],
    ['junit', { 
      outputFile: './e2e/test-results/results.xml' 
    }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  // Global test setup
  globalSetup: './e2e/utils/global-setup.ts',
  globalTeardown: './e2e/utils/global-teardown.ts',
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:4200',
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Action timeout
    actionTimeout: 15 * 1000, // 15 seconds
    
    // Navigation timeout
    navigationTimeout: 30 * 1000, // 30 seconds
  },

  // Output directories
  outputDir: './e2e/test-results',
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable headless mode
        headless: true,
        // Additional Chrome flags for CI
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        }
      },
    },
    
    {
      name: 'chromium-headed',
      use: { 
        ...devices['Desktop Chrome'],
        headless: false
      },
    },

    // Mobile testing (optional)
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        headless: true
      },
    },
    
    // Tablet testing (optional)
    {
      name: 'tablet',
      use: { 
        ...devices['iPad Pro'],
        headless: true
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: process.env.CI ? undefined : {
    command: 'npm run start',
    port: 4200,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes to start
    env: {
      NODE_ENV: 'test'
    }
  },
  
  // Test match patterns
  testMatch: [
    '**/e2e/tests/**/*.spec.ts',
    '**/e2e/tests/**/*.e2e.ts'
  ],
  
  // Files to ignore
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**'
  ]
});