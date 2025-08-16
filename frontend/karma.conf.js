// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution order
        random: true,
        seed: '4321',
        stopSpecOnExpectationFailure: false
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    
    // 📊 COVERAGE CONFIGURATION
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/frontuna-frontend'),
      subdir: '.',
      reporters: [
        // HTML report - Interactive browser-viewable report
        { 
          type: 'html',
          subdir: 'html-report'
        },
        // Text summary - Console output
        { 
          type: 'text-summary'
        },
        // LCOV format - For CI/CD and external tools
        { 
          type: 'lcov',
          subdir: 'lcov-report'
        },
        // JSON format - Machine readable
        { 
          type: 'json',
          subdir: '.',
          file: 'coverage.json'
        },
        // Cobertura XML - For some CI systems
        { 
          type: 'cobertura',
          subdir: '.',
          file: 'cobertura-coverage.xml'
        },
        // Text file - Detailed text report
        { 
          type: 'text',
          subdir: '.',
          file: 'coverage.txt'
        }
      ],
      
      // Coverage thresholds - fail if coverage is below these values
      check: {
        global: {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80
        },
        each: {
          statements: 70,
          branches: 60,
          functions: 70,
          lines: 70
        }
      },
      
      // Include all source files for accurate coverage reporting
      includeAllSources: true,
      
      // Watermarks for coverage levels (good, ok, bad)
      watermarks: {
        statements: [80, 95],
        functions: [80, 95],
        branches: [70, 90],
        lines: [80, 95]
      }
    },
    
    // 🎯 TEST CONFIGURATION
    reporters: ['progress', 'kjhtml', 'coverage'],
    
    // Browser configuration
    browsers: ['Chrome'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--remote-debugging-port=9222'
        ]
      },
      ChromeDebugging: {
        base: 'Chrome',
        flags: [
          '--remote-debugging-port=9333',
          '--disable-web-security'
        ]
      }
    },
    
    // Port configuration
    port: 9876,
    colors: true,
    
    // Logging level
    logLevel: config.LOG_INFO,
    
    // Watch files and execute tests whenever any file changes
    autoWatch: true,
    
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
    
    // Concurrency level - how many browser instances should be started simultaneously
    concurrency: Infinity,
    
    // 📁 FILE PATTERNS
    files: [
      // Test helper files
      'src/tests/utils/test-helpers.ts'
    ],
    
    // Preprocessing
    preprocessors: {
      'src/**/*.ts': ['coverage']
    },
    
    // 🚀 PERFORMANCE CONFIGURATION
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 60000,
    captureTimeout: 60000,
    
    // Memory management
    browserSocketTimeout: 20000,
    
    // Webpack configuration for coverage
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map'
    }
  });

  // 🔧 ENVIRONMENT-SPECIFIC CONFIGURATION
  if (process.env.CI) {
    // CI environment configuration
    config.browsers = ['ChromeHeadlessCI'];
    config.singleRun = true;
    config.autoWatch = false;
    config.concurrency = 1;
    
    // Reduce timeouts for CI
    config.browserDisconnectTimeout = 5000;
    config.browserNoActivityTimeout = 30000;
    config.captureTimeout = 30000;
  }
  
  // Coverage-only mode
  if (process.env.COVERAGE_ONLY) {
    config.reporters = ['coverage'];
    config.singleRun = true;
    config.autoWatch = false;
  }
  
  // Debug mode
  if (process.env.DEBUG_MODE) {
    config.browsers = ['ChromeDebugging'];
    config.logLevel = config.LOG_DEBUG;
    config.singleRun = false;
    config.autoWatch = true;
  }
};