#!/usr/bin/env node

/**
 * Enhanced Test Runner for Frontuna
 * Provides better formatting and detailed test results
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.startTime = Date.now();
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }

  async runTests() {
    console.log('🧪 Frontuna Test Suite Runner');
    console.log('============================');
    console.log(`📅 Started: ${new Date().toLocaleString()}`);
    console.log('');

    // Determine which test configuration to use
    const useCoverage = process.argv.includes('--coverage') || process.env.COVERAGE === 'true';
    const useCI = process.env.CI === 'true';
    const useDebug = process.argv.includes('--debug');
    
    let testConfig = 'coverage'; // Default to coverage
    if (useDebug) {
      testConfig = 'debug';
    } else if (useCI) {
      testConfig = 'ci';
    }
    
    const args = [
      'run',
      'test',
      '--',
      `--configuration=${testConfig}`,
      '--progress=false'
    ];

    // Add any additional arguments passed to this script
    const additionalArgs = process.argv.slice(2);
    args.push(...additionalArgs);

    return new Promise((resolve, reject) => {
      const testProcess = spawn('npm', args, {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      let output = '';
      let errorOutput = '';

      testProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        process.stdout.write(chunk);
      });

      testProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        errorOutput += chunk;
        process.stderr.write(chunk);
      });

      testProcess.on('close', (code) => {
        this.parseResults(output);
        this.printSummary(code);
        
        if (code === 0) {
          resolve(this.testResults);
        } else {
          reject(new Error(`Tests failed with exit code ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        console.error('❌ Failed to start test process:', error);
        reject(error);
      });
    });
  }

  parseResults(output) {
    // Parse Karma/Jasmine output for test results
    const executedMatch = output.match(/Executed (\d+) of (\d+)/);
    const failedMatch = output.match(/\((\d+) FAILED\)/);
    const skippedMatch = output.match(/\((\d+) SKIPPED\)/);

    if (executedMatch) {
      this.testResults.total = parseInt(executedMatch[2], 10);
      const executed = parseInt(executedMatch[1], 10);
      this.testResults.failed = failedMatch ? parseInt(failedMatch[1], 10) : 0;
      this.testResults.skipped = skippedMatch ? parseInt(skippedMatch[1], 10) : 0;
      this.testResults.passed = executed - this.testResults.failed;
    }
  }

  printSummary(exitCode) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    console.log('');
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('======================');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`🎯 Total Tests: ${this.testResults.total}`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⏭️  Skipped: ${this.testResults.skipped}`);
    console.log('');

    if (exitCode === 0) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('====================');
      console.log('✅ Test suite completed successfully');
      console.log('🚀 Ready for deployment');
    } else {
      console.log('💥 TESTS FAILED!');
      console.log('================');
      console.log(`❌ ${this.testResults.failed} test(s) failed`);
      console.log('🔍 Check the output above for details');
    }

    console.log('');
    console.log('📊 CODE COVERAGE REPORTS');
    console.log('========================');
    console.log('📁 Coverage Directory: ./coverage/frontuna-frontend/');
    console.log('');
    console.log('📋 Available Reports:');
    console.log('  🌐 HTML Report:     coverage/frontuna-frontend/html-report/index.html');
    console.log('  📄 Text Summary:    coverage/frontuna-frontend/coverage.txt');
    console.log('  🔍 LCOV Report:     coverage/frontuna-frontend/lcov-report/lcov.info');
    console.log('  📊 JSON Data:       coverage/frontuna-frontend/coverage.json');
    console.log('  🏷️  Cobertura XML:  coverage/frontuna-frontend/cobertura-coverage.xml');
    console.log('');
    console.log('🚀 Quick Commands:');
    console.log('  npm run coverage:open          # Open HTML report in browser');
    console.log('  npm run test:coverage-open     # Run tests + open coverage');
    console.log('');
  }

  static printHelp() {
    console.log('🧪 Frontuna Test Runner');
    console.log('Usage: node scripts/test-runner.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help              Show this help message');
    console.log('  --coverage          Run with code coverage (default)');
    console.log('  --debug             Run in debug mode with Chrome browser');
    console.log('  --watch             Run tests in watch mode');
    console.log('');
    console.log('Environment Variables:');
    console.log('  CI=true             Run in CI mode (headless, single run)');
    console.log('  COVERAGE=true       Force coverage reporting');
    console.log('  DEBUG_MODE=true     Enable debug logging');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/test-runner.js                    # Run with coverage');
    console.log('  node scripts/test-runner.js --debug            # Debug mode');
    console.log('  npm run test:coverage                          # Angular coverage config');
    console.log('  npm run test:coverage-open                     # Run + open coverage');
    console.log('  npm run coverage:open                          # Just open coverage');
  }
}

// Main execution
async function main() {
  if (process.argv.includes('--help')) {
    TestRunner.printHelp();
    return;
  }

  const runner = new TestRunner();
  
  try {
    await runner.runTests();
    process.exit(0);
  } catch (error) {
    console.error('💥 Test execution failed:', error.message);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n🛑 Test execution interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test execution terminated');
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = TestRunner;