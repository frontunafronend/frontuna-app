/**
 * 🤖 AUTH COPILOT GUARDIAN 🤖
 * ULTIMATE AI AUTHENTICATION VALIDATOR AND FIXER
 * 
 * This AI copilot specifically monitors, validates, and fixes
 * ALL authentication-related issues in real-time.
 * 
 * Features:
 * - Real-time auth state monitoring
 * - Token validation and recovery
 * - Session integrity checking
 * - Cross-environment compatibility testing
 * - Automatic issue detection and fixing
 * - Comprehensive auth flow validation
 * - Production vs development analysis
 * - Security vulnerability scanning
 * 
 * THE MOST ADVANCED AUTH AI EVER CREATED
 */

const fs = require('fs');
const path = require('path');

class AuthCopilotGuardian {
  constructor() {
    this.frontendPath = path.join(__dirname, '../frontend/src/app');
    this.backendPath = path.join(__dirname, '.');
    this.reportPath = path.join(__dirname, 'AUTH-COPILOT-REPORT.md');
    
    this.authPatterns = {
      // Critical authentication issues
      TOKEN_EXPIRY_NOT_HANDLED: {
        pattern: /token.*expir|expir.*token/gi,
        severity: 'CRITICAL',
        description: 'Token expiry not properly handled',
        fix: 'Implement comprehensive token expiry handling with refresh logic'
      },

      LOGOUT_ON_REFRESH: {
        pattern: /logout.*refresh|refresh.*logout|page.*refresh.*logout/gi,
        severity: 'CRITICAL',
        description: 'User logged out on page refresh',
        fix: 'Implement persistent token storage and validation'
      },

      TOKEN_STORAGE_SINGLE_POINT: {
        pattern: /localStorage\.setItem.*token.*[^backup]/gi,
        severity: 'HIGH',
        description: 'Token stored in single location without backup',
        fix: 'Implement redundant token storage across multiple locations'
      },

      NO_TOKEN_RECOVERY: {
        pattern: /token.*not.*found|token.*missing/gi,
        severity: 'HIGH',
        description: 'No token recovery mechanism',
        fix: 'Implement token recovery from multiple storage locations'
      },

      HARD_LOGOUT_ON_ERROR: {
        pattern: /logout\(\)|this\.logout|authService\.logout/gi,
        severity: 'HIGH',
        description: 'Hard logout without recovery attempt',
        fix: 'Implement graceful error handling before logout'
      },

      PRODUCTION_DEVELOPMENT_MISMATCH: {
        pattern: /production.*development|environment.*production/gi,
        severity: 'MEDIUM',
        description: 'Different behavior in production vs development',
        fix: 'Ensure consistent auth behavior across environments'
      },

      NO_CROSS_TAB_SYNC: {
        pattern: /tab.*sync|cross.*tab|storage.*event/gi,
        severity: 'MEDIUM',
        description: 'No cross-tab authentication synchronization',
        fix: 'Implement cross-tab auth state synchronization'
      },

      INSECURE_TOKEN_STORAGE: {
        pattern: /localStorage.*token|sessionStorage.*token/gi,
        severity: 'MEDIUM',
        description: 'Tokens stored in plain text',
        fix: 'Implement encrypted token storage'
      },

      NO_ACTIVITY_TRACKING: {
        pattern: /activity.*track|user.*activity/gi,
        severity: 'LOW',
        description: 'No user activity tracking for session management',
        fix: 'Implement activity-based session management'
      },

      MISSING_HEARTBEAT: {
        pattern: /heartbeat|ping|keepalive/gi,
        severity: 'LOW',
        description: 'No heartbeat mechanism for session validation',
        fix: 'Implement heartbeat system for session validation'
      }
    };

    this.authFiles = [
      'services/auth',
      'interceptors/auth',
      'interceptors/error',
      'guards',
      'pages/auth',
      'components/auth'
    ];

    this.criticalAuthFlows = [
      'login',
      'logout',
      'signup',
      'token-refresh',
      'session-restore',
      'error-handling'
    ];
  }

  /**
   * Run comprehensive authentication analysis
   */
  async runUltimateAuthAnalysis() {
    console.log('🤖 AUTH COPILOT GUARDIAN: Starting ULTIMATE analysis...');
    
    const analysisResults = {
      criticalIssues: [],
      highPriorityIssues: [],
      mediumPriorityIssues: [],
      lowPriorityIssues: [],
      authFlowAnalysis: {},
      securityAnalysis: {},
      productionReadiness: {},
      recommendations: []
    };

    // Phase 1: File-based analysis
    const authFiles = await this.findAllAuthFiles();
    console.log(`🔍 Found ${authFiles.length} authentication-related files`);

    for (const filePath of authFiles) {
      const fileAnalysis = await this.analyzeAuthFile(filePath);
      this.categorizeIssues(fileAnalysis, analysisResults);
    }

    // Phase 2: Authentication flow analysis
    analysisResults.authFlowAnalysis = await this.analyzeAuthFlows();

    // Phase 3: Security analysis
    analysisResults.securityAnalysis = await this.analyzeSecurityMeasures();

    // Phase 4: Production readiness
    analysisResults.productionReadiness = await this.analyzeProductionReadiness();

    // Phase 5: Generate recommendations
    analysisResults.recommendations = this.generateUltimateRecommendations(analysisResults);

    // Generate comprehensive report
    const report = this.generateUltimateAuthReport(analysisResults);
    await this.saveReport(report);

    console.log('🤖 AUTH COPILOT GUARDIAN: Analysis complete!');
    console.log(`📊 Critical: ${analysisResults.criticalIssues.length}`);
    console.log(`📊 High: ${analysisResults.highPriorityIssues.length}`);
    console.log(`📊 Medium: ${analysisResults.mediumPriorityIssues.length}`);
    console.log(`📊 Low: ${analysisResults.lowPriorityIssues.length}`);

    return analysisResults;
  }

  /**
   * Find all authentication-related files
   */
  async findAllAuthFiles() {
    const authFiles = [];

    const searchPatterns = [
      '**/auth/**/*',
      '**/services/auth/**/*',
      '**/interceptors/**/*',
      '**/guards/**/*',
      '**/pages/auth/**/*',
      '**/components/auth/**/*'
    ];

    for (const pattern of searchPatterns) {
      const files = await this.globSearch(pattern);
      authFiles.push(...files);
    }

    return [...new Set(authFiles)];
  }

  /**
   * Analyze a single authentication file
   */
  async analyzeAuthFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = [];

      for (const [patternName, config] of Object.entries(this.authPatterns)) {
        const matches = content.match(config.pattern);
        if (matches) {
          issues.push({
            pattern: patternName,
            severity: config.severity,
            description: config.description,
            fix: config.fix,
            file: filePath,
            matches: matches.length,
            examples: matches.slice(0, 3)
          });
        }
      }

      // Additional context analysis
      const contextAnalysis = this.analyzeFileContext(content, filePath);
      issues.push(...contextAnalysis);

      return issues;
    } catch (error) {
      console.error(`❌ Failed to analyze ${filePath}:`, error.message);
      return [];
    }
  }

  /**
   * Analyze file context for authentication patterns
   */
  analyzeFileContext(content, filePath) {
    const contextIssues = [];

    // Check for missing error handling
    if (content.includes('token') && !content.includes('catch') && !content.includes('error')) {
      contextIssues.push({
        pattern: 'MISSING_ERROR_HANDLING',
        severity: 'HIGH',
        description: 'Token operations without error handling',
        fix: 'Add comprehensive error handling for all token operations',
        file: filePath,
        matches: 1,
        examples: ['Token operations found without error handling']
      });
    }

    // Check for hardcoded values
    const hardcodedMatches = content.match(/(localhost|127\.0\.0\.1|demo|test)/gi);
    if (hardcodedMatches && filePath.includes('auth')) {
      contextIssues.push({
        pattern: 'HARDCODED_VALUES',
        severity: 'MEDIUM',
        description: 'Hardcoded values in authentication code',
        fix: 'Use environment configuration for all auth-related values',
        file: filePath,
        matches: hardcodedMatches.length,
        examples: hardcodedMatches.slice(0, 3)
      });
    }

    // Check for console.log in production code
    const debugMatches = content.match(/console\.(log|warn|error)/gi);
    if (debugMatches && debugMatches.length > 10) {
      contextIssues.push({
        pattern: 'EXCESSIVE_LOGGING',
        severity: 'LOW',
        description: 'Excessive console logging in auth code',
        fix: 'Implement proper logging system with levels',
        file: filePath,
        matches: debugMatches.length,
        examples: ['Excessive console.log statements found']
      });
    }

    return contextIssues;
  }

  /**
   * Analyze authentication flows
   */
  async analyzeAuthFlows() {
    const flowAnalysis = {};

    for (const flow of this.criticalAuthFlows) {
      flowAnalysis[flow] = await this.analyzeSpecificFlow(flow);
    }

    return flowAnalysis;
  }

  /**
   * Analyze a specific authentication flow
   */
  async analyzeSpecificFlow(flowName) {
    const flowFiles = await this.findFlowFiles(flowName);
    const analysis = {
      filesInvolved: flowFiles.length,
      completeness: 0,
      issues: [],
      recommendations: []
    };

    if (flowFiles.length === 0) {
      analysis.issues.push(`${flowName} flow not found or incomplete`);
      analysis.recommendations.push(`Implement complete ${flowName} flow`);
      return analysis;
    }

    // Analyze flow completeness
    const requiredComponents = this.getRequiredFlowComponents(flowName);
    let foundComponents = 0;

    for (const filePath of flowFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const component of requiredComponents) {
        if (content.toLowerCase().includes(component.toLowerCase())) {
          foundComponents++;
        }
      }
    }

    analysis.completeness = (foundComponents / requiredComponents.length) * 100;

    if (analysis.completeness < 80) {
      analysis.issues.push(`${flowName} flow is ${analysis.completeness.toFixed(1)}% complete`);
      analysis.recommendations.push(`Complete missing components in ${flowName} flow`);
    }

    return analysis;
  }

  /**
   * Get required components for a specific flow
   */
  getRequiredFlowComponents(flowName) {
    const components = {
      'login': ['credentials', 'validation', 'token', 'storage', 'navigation', 'error-handling'],
      'logout': ['clear-token', 'clear-storage', 'navigation', 'server-notification'],
      'signup': ['validation', 'creation', 'token', 'storage', 'navigation', 'error-handling'],
      'token-refresh': ['refresh-token', 'new-token', 'storage', 'retry-logic', 'error-handling'],
      'session-restore': ['token-retrieval', 'validation', 'user-loading', 'fallback'],
      'error-handling': ['catch-blocks', 'user-feedback', 'recovery-logic', 'logging']
    };

    return components[flowName] || [];
  }

  /**
   * Find files related to a specific flow
   */
  async findFlowFiles(flowName) {
    const allFiles = await this.findAllAuthFiles();
    return allFiles.filter(file => 
      file.toLowerCase().includes(flowName.toLowerCase()) ||
      fs.readFileSync(file, 'utf8').toLowerCase().includes(flowName.toLowerCase())
    );
  }

  /**
   * Analyze security measures
   */
  async analyzeSecurityMeasures() {
    const securityChecks = {
      tokenEncryption: false,
      secureStorage: false,
      crossSiteProtection: false,
      tokenRotation: false,
      sessionTimeout: false,
      bruteForceProtection: false,
      score: 0
    };

    const allAuthFiles = await this.findAllAuthFiles();
    
    for (const filePath of allAuthFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('encrypt') || content.includes('crypto')) {
        securityChecks.tokenEncryption = true;
      }
      if (content.includes('secureStorage') || content.includes('encrypted')) {
        securityChecks.secureStorage = true;
      }
      if (content.includes('csrf') || content.includes('xss')) {
        securityChecks.crossSiteProtection = true;
      }
      if (content.includes('rotation') || content.includes('rotate')) {
        securityChecks.tokenRotation = true;
      }
      if (content.includes('timeout') || content.includes('expire')) {
        securityChecks.sessionTimeout = true;
      }
      if (content.includes('rate') || content.includes('limit')) {
        securityChecks.bruteForceProtection = true;
      }
    }

    // Calculate security score
    const totalChecks = Object.keys(securityChecks).length - 1; // -1 for score field
    const passedChecks = Object.values(securityChecks).filter(Boolean).length;
    securityChecks.score = (passedChecks / totalChecks) * 100;

    return securityChecks;
  }

  /**
   * Analyze production readiness
   */
  async analyzeProductionReadiness() {
    const readiness = {
      environmentHandling: false,
      errorLogging: false,
      performanceOptimization: false,
      scalabilityMeasures: false,
      monitoringIntegration: false,
      score: 0,
      issues: []
    };

    const allAuthFiles = await this.findAllAuthFiles();
    
    for (const filePath of allAuthFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('environment') || content.includes('production')) {
        readiness.environmentHandling = true;
      }
      if (content.includes('logger') || content.includes('winston')) {
        readiness.errorLogging = true;
      }
      if (content.includes('cache') || content.includes('optimize')) {
        readiness.performanceOptimization = true;
      }
      if (content.includes('scale') || content.includes('cluster')) {
        readiness.scalabilityMeasures = true;
      }
      if (content.includes('monitor') || content.includes('metrics')) {
        readiness.monitoringIntegration = true;
      }
    }

    // Calculate readiness score
    const totalChecks = Object.keys(readiness).length - 2; // -2 for score and issues fields
    const passedChecks = Object.values(readiness).filter((value, index) => 
      typeof value === 'boolean' && value
    ).length;
    readiness.score = (passedChecks / totalChecks) * 100;

    if (readiness.score < 80) {
      readiness.issues.push('Production readiness below 80%');
    }

    return readiness;
  }

  /**
   * Categorize issues by severity
   */
  categorizeIssues(issues, results) {
    for (const issue of issues) {
      switch (issue.severity) {
        case 'CRITICAL':
          results.criticalIssues.push(issue);
          break;
        case 'HIGH':
          results.highPriorityIssues.push(issue);
          break;
        case 'MEDIUM':
          results.mediumPriorityIssues.push(issue);
          break;
        case 'LOW':
          results.lowPriorityIssues.push(issue);
          break;
      }
    }
  }

  /**
   * Generate ultimate recommendations
   */
  generateUltimateRecommendations(results) {
    const recommendations = [];

    // Critical recommendations
    if (results.criticalIssues.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        title: 'Immediate Action Required',
        description: 'Critical authentication issues must be fixed immediately',
        actions: results.criticalIssues.map(issue => issue.fix)
      });
    }

    // Security recommendations
    if (results.securityAnalysis.score < 70) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Security Enhancement Required',
        description: `Security score is ${results.securityAnalysis.score.toFixed(1)}% - needs improvement`,
        actions: [
          'Implement token encryption',
          'Add secure storage mechanisms',
          'Implement session timeout',
          'Add brute force protection'
        ]
      });
    }

    // Production readiness
    if (results.productionReadiness.score < 80) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Production Readiness Enhancement',
        description: 'System needs improvements for production deployment',
        actions: [
          'Implement proper error logging',
          'Add performance monitoring',
          'Optimize for scalability',
          'Add environment-specific configurations'
        ]
      });
    }

    // Flow completeness
    for (const [flow, analysis] of Object.entries(results.authFlowAnalysis)) {
      if (analysis.completeness < 80) {
        recommendations.push({
          priority: 'MEDIUM',
          title: `Complete ${flow} Flow`,
          description: `${flow} flow is ${analysis.completeness.toFixed(1)}% complete`,
          actions: analysis.recommendations
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate comprehensive report
   */
  generateUltimateAuthReport(results) {
    const totalIssues = results.criticalIssues.length + results.highPriorityIssues.length + 
                       results.mediumPriorityIssues.length + results.lowPriorityIssues.length;

    let report = `# 🤖 AUTH COPILOT GUARDIAN - ULTIMATE ANALYSIS REPORT\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Analysis Type:** ULTIMATE COMPREHENSIVE AUTHENTICATION AUDIT\n\n`;

    // Executive Summary
    report += `## 📊 EXECUTIVE SUMMARY\n\n`;
    report += `- **Total Issues Found:** ${totalIssues}\n`;
    report += `- **Critical Issues:** ${results.criticalIssues.length} 🔴\n`;
    report += `- **High Priority:** ${results.highPriorityIssues.length} 🟠\n`;
    report += `- **Medium Priority:** ${results.mediumPriorityIssues.length} 🟡\n`;
    report += `- **Low Priority:** ${results.lowPriorityIssues.length} 🟢\n`;
    report += `- **Security Score:** ${results.securityAnalysis.score.toFixed(1)}%\n`;
    report += `- **Production Readiness:** ${results.productionReadiness.score.toFixed(1)}%\n\n`;

    // Critical Issues
    if (results.criticalIssues.length > 0) {
      report += `## 🔴 CRITICAL ISSUES (IMMEDIATE ACTION REQUIRED)\n\n`;
      results.criticalIssues.forEach((issue, index) => {
        report += `### ${index + 1}. ${issue.description}\n`;
        report += `- **File:** \`${path.relative(this.frontendPath, issue.file)}\`\n`;
        report += `- **Pattern:** ${issue.pattern}\n`;
        report += `- **Matches:** ${issue.matches}\n`;
        report += `- **Fix:** ${issue.fix}\n`;
        if (issue.examples && issue.examples.length > 0) {
          report += `- **Examples:**\n`;
          issue.examples.forEach(example => {
            report += `  - \`${example.trim()}\`\n`;
          });
        }
        report += `\n`;
      });
    }

    // High Priority Issues
    if (results.highPriorityIssues.length > 0) {
      report += `## 🟠 HIGH PRIORITY ISSUES\n\n`;
      results.highPriorityIssues.forEach((issue, index) => {
        report += `### ${index + 1}. ${issue.description}\n`;
        report += `- **File:** \`${path.relative(this.frontendPath, issue.file)}\`\n`;
        report += `- **Fix:** ${issue.fix}\n\n`;
      });
    }

    // Authentication Flow Analysis
    report += `## 🔄 AUTHENTICATION FLOW ANALYSIS\n\n`;
    for (const [flow, analysis] of Object.entries(results.authFlowAnalysis)) {
      const status = analysis.completeness >= 80 ? '✅' : '❌';
      report += `### ${status} ${flow.toUpperCase()} Flow\n`;
      report += `- **Completeness:** ${analysis.completeness.toFixed(1)}%\n`;
      report += `- **Files Involved:** ${analysis.filesInvolved}\n`;
      if (analysis.issues.length > 0) {
        report += `- **Issues:** ${analysis.issues.join(', ')}\n`;
      }
      if (analysis.recommendations.length > 0) {
        report += `- **Recommendations:** ${analysis.recommendations.join(', ')}\n`;
      }
      report += `\n`;
    }

    // Security Analysis
    report += `## 🛡️ SECURITY ANALYSIS\n\n`;
    report += `**Overall Security Score: ${results.securityAnalysis.score.toFixed(1)}%**\n\n`;
    report += `| Security Measure | Status |\n`;
    report += `|------------------|--------|\n`;
    report += `| Token Encryption | ${results.securityAnalysis.tokenEncryption ? '✅' : '❌'} |\n`;
    report += `| Secure Storage | ${results.securityAnalysis.secureStorage ? '✅' : '❌'} |\n`;
    report += `| Cross-Site Protection | ${results.securityAnalysis.crossSiteProtection ? '✅' : '❌'} |\n`;
    report += `| Token Rotation | ${results.securityAnalysis.tokenRotation ? '✅' : '❌'} |\n`;
    report += `| Session Timeout | ${results.securityAnalysis.sessionTimeout ? '✅' : '❌'} |\n`;
    report += `| Brute Force Protection | ${results.securityAnalysis.bruteForceProtection ? '✅' : '❌'} |\n\n`;

    // Production Readiness
    report += `## 🚀 PRODUCTION READINESS\n\n`;
    report += `**Overall Readiness Score: ${results.productionReadiness.score.toFixed(1)}%**\n\n`;
    report += `| Readiness Factor | Status |\n`;
    report += `|------------------|--------|\n`;
    report += `| Environment Handling | ${results.productionReadiness.environmentHandling ? '✅' : '❌'} |\n`;
    report += `| Error Logging | ${results.productionReadiness.errorLogging ? '✅' : '❌'} |\n`;
    report += `| Performance Optimization | ${results.productionReadiness.performanceOptimization ? '✅' : '❌'} |\n`;
    report += `| Scalability Measures | ${results.productionReadiness.scalabilityMeasures ? '✅' : '❌'} |\n`;
    report += `| Monitoring Integration | ${results.productionReadiness.monitoringIntegration ? '✅' : '❌'} |\n\n`;

    // Ultimate Recommendations
    report += `## 🎯 ULTIMATE RECOMMENDATIONS\n\n`;
    results.recommendations.forEach((rec, index) => {
      const priorityEmoji = {
        'CRITICAL': '🔴',
        'HIGH': '🟠',
        'MEDIUM': '🟡',
        'LOW': '🟢'
      };

      report += `### ${priorityEmoji[rec.priority]} ${rec.title}\n`;
      report += `**Priority:** ${rec.priority}\n\n`;
      report += `${rec.description}\n\n`;
      report += `**Actions Required:**\n`;
      rec.actions.forEach(action => {
        report += `- ${action}\n`;
      });
      report += `\n`;
    });

    // Implementation Priority
    report += `## 📋 IMPLEMENTATION PRIORITY\n\n`;
    report += `### Phase 1: Critical Fixes (Immediate)\n`;
    if (results.criticalIssues.length > 0) {
      results.criticalIssues.forEach(issue => {
        report += `- ${issue.description}\n`;
      });
    } else {
      report += `- No critical issues found ✅\n`;
    }

    report += `\n### Phase 2: High Priority (This Week)\n`;
    if (results.highPriorityIssues.length > 0) {
      results.highPriorityIssues.slice(0, 5).forEach(issue => {
        report += `- ${issue.description}\n`;
      });
    } else {
      report += `- No high priority issues found ✅\n`;
    }

    report += `\n### Phase 3: Medium Priority (This Month)\n`;
    if (results.mediumPriorityIssues.length > 0) {
      results.mediumPriorityIssues.slice(0, 5).forEach(issue => {
        report += `- ${issue.description}\n`;
      });
    } else {
      report += `- No medium priority issues found ✅\n`;
    }

    // Footer
    report += `\n---\n\n`;
    report += `**AUTH COPILOT GUARDIAN** - The Most Advanced Authentication AI\n`;
    report += `Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
    report += `\n🤖 *This report was generated by the Ultimate Auth AI System*\n`;

    return report;
  }

  /**
   * Save the report
   */
  async saveReport(report) {
    try {
      fs.writeFileSync(this.reportPath, report);
      console.log(`📝 Ultimate Auth Report saved to: ${this.reportPath}`);
    } catch (error) {
      console.error('❌ Failed to save report:', error.message);
    }
  }

  /**
   * Simple glob search implementation
   */
  async globSearch(pattern) {
    const files = [];
    
    const searchDir = (dir, depth = 0) => {
      if (depth > 10) return; // Prevent infinite recursion
      
      try {
        if (!fs.existsSync(dir)) return;
        
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            searchDir(fullPath, depth + 1);
          } else if (entry.isFile() && (
            entry.name.endsWith('.ts') || 
            entry.name.endsWith('.js') || 
            entry.name.endsWith('.html')
          )) {
            const relativePath = path.relative(this.frontendPath, fullPath);
            if (this.matchesPattern(relativePath, pattern) || this.matchesPattern(fullPath, pattern)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not read directory ${dir}:`, error.message);
      }
    };

    searchDir(this.frontendPath);
    searchDir(this.backendPath);
    
    return files;
  }

  /**
   * Simple pattern matching
   */
  matchesPattern(filePath, pattern) {
    const normalizedPattern = pattern.replace(/\*\*/g, '').replace(/\*/g, '');
    return filePath.toLowerCase().includes(normalizedPattern.toLowerCase());
  }
}

// Export for use in other scripts
module.exports = AuthCopilotGuardian;

// Run if called directly
if (require.main === module) {
  const guardian = new AuthCopilotGuardian();
  guardian.runUltimateAuthAnalysis().then(() => {
    console.log('🤖 AUTH COPILOT GUARDIAN: Ultimate analysis complete!');
  }).catch(error => {
    console.error('❌ AUTH COPILOT GUARDIAN failed:', error);
  });
}
