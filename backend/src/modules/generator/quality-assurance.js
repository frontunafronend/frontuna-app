/**
 * Quality Assurance Module
 * Validates and ensures component quality
 */

const { createLogger } = require('../../utils/logger');

const logger = createLogger('quality-assurance');

class QualityAssurance {
  constructor() {
    this.validationRules = {
      structure: this.validateStructure.bind(this),
      syntax: this.validateSyntax.bind(this),
      accessibility: this.validateAccessibility.bind(this),
      performance: this.validatePerformance.bind(this),
      security: this.validateSecurity.bind(this)
    };

    this.qualityThresholds = {
      minCodeLength: 50,
      maxCodeLength: 10000,
      maxComplexity: 8,
      minAccessibilityScore: 7
    };

    logger.info('🛡️ Quality Assurance initialized');
  }

  /**
   * Validate component quality
   */
  async validate(component) {
    try {
      logger.info('🔍 Starting quality assurance', { 
        component: component.name 
      });

      const validationResults = {};
      const issues = [];
      let overallScore = 0;

      // Run all validation rules
      for (const [ruleName, ruleFunction] of Object.entries(this.validationRules)) {
        try {
          const result = await ruleFunction(component);
          validationResults[ruleName] = result;
          overallScore += result.score;

          if (result.issues && result.issues.length > 0) {
            issues.push(...result.issues.map(issue => ({
              rule: ruleName,
              ...issue
            })));
          }
        } catch (error) {
          logger.warn(`⚠️ Validation rule ${ruleName} failed`, { error: error.message });
          validationResults[ruleName] = {
            score: 0,
            status: 'error',
            error: error.message
          };
        }
      }

      // Calculate final score
      const finalScore = Math.round(overallScore / Object.keys(this.validationRules).length);

      // Add quality metadata
      component.quality = {
        score: finalScore,
        grade: this.getQualityGrade(finalScore),
        validationResults,
        issues: issues.slice(0, 10), // Limit to top 10 issues
        timestamp: new Date().toISOString()
      };

      // Apply fixes if needed
      if (finalScore < 7) {
        component = await this.applyAutomaticFixes(component, issues);
      }

      logger.info('✅ Quality assurance completed', { 
        component: component.name,
        score: finalScore,
        grade: component.quality.grade,
        issuesFound: issues.length
      });

      return component;

    } catch (error) {
      logger.error('❌ Quality assurance failed', { 
        error: error.message,
        component: component.name
      });
      
      // Return component with minimal quality info
      component.quality = {
        score: 5,
        grade: 'C',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      return component;
    }
  }

  /**
   * Validate component structure
   */
  async validateStructure(component) {
    const issues = [];
    let score = 10;

    // Check required fields
    if (!component.name) {
      issues.push({ severity: 'error', message: 'Component name is missing' });
      score -= 3;
    }

    if (!component.code || Object.keys(component.code).length === 0) {
      issues.push({ severity: 'error', message: 'Component code is missing' });
      score -= 5;
    }

    if (!component.description) {
      issues.push({ severity: 'warning', message: 'Component description is missing' });
      score -= 1;
    }

    // Check code structure
    const totalCodeLength = Object.values(component.code || {}).join('').length;
    if (totalCodeLength < this.qualityThresholds.minCodeLength) {
      issues.push({ severity: 'warning', message: 'Component code is too short' });
      score -= 2;
    }

    if (totalCodeLength > this.qualityThresholds.maxCodeLength) {
      issues.push({ severity: 'warning', message: 'Component code is too long, consider splitting' });
      score -= 1;
    }

    return {
      score: Math.max(0, score),
      status: issues.length === 0 ? 'passed' : 'issues_found',
      issues
    };
  }

  /**
   * Validate syntax
   */
  async validateSyntax(component) {
    const issues = [];
    let score = 10;

    // Basic syntax checks
    for (const [codeType, code] of Object.entries(component.code || {})) {
      if (!code) continue;

      // Check for common syntax issues
      const syntaxIssues = this.checkSyntaxIssues(code, codeType);
      issues.push(...syntaxIssues);
      score -= syntaxIssues.length * 0.5;
    }

    return {
      score: Math.max(0, Math.round(score)),
      status: issues.length === 0 ? 'passed' : 'issues_found',
      issues
    };
  }

  /**
   * Validate accessibility
   */
  async validateAccessibility(component) {
    const issues = [];
    let score = 10;

    const htmlCode = component.code.html || '';

    // Check for accessibility features
    if (htmlCode && !htmlCode.includes('aria-')) {
      issues.push({ severity: 'warning', message: 'No ARIA attributes found' });
      score -= 2;
    }

    if (htmlCode && !htmlCode.includes('alt=')) {
      const hasImages = htmlCode.includes('<img');
      if (hasImages) {
        issues.push({ severity: 'error', message: 'Images without alt attributes' });
        score -= 3;
      }
    }

    if (htmlCode && htmlCode.includes('<div') && !htmlCode.includes('role=')) {
      issues.push({ severity: 'info', message: 'Consider adding semantic roles to div elements' });
      score -= 0.5;
    }

    return {
      score: Math.max(0, Math.round(score)),
      status: score >= this.qualityThresholds.minAccessibilityScore ? 'passed' : 'issues_found',
      issues
    };
  }

  /**
   * Validate performance
   */
  async validatePerformance(component) {
    const issues = [];
    let score = 10;

    const allCode = Object.values(component.code || {}).join('');

    // Check for performance anti-patterns
    if (allCode.includes('document.write')) {
      issues.push({ severity: 'error', message: 'document.write is deprecated and blocks rendering' });
      score -= 3;
    }

    if (allCode.includes('innerHTML') && allCode.includes('user')) {
      issues.push({ severity: 'warning', message: 'Potential XSS risk with innerHTML and user data' });
      score -= 2;
    }

    // Check for optimization opportunities
    if (allCode.length > 5000 && !allCode.includes('lazy')) {
      issues.push({ severity: 'info', message: 'Large component - consider lazy loading' });
      score -= 0.5;
    }

    return {
      score: Math.max(0, Math.round(score)),
      status: issues.length === 0 ? 'passed' : 'issues_found',
      issues
    };
  }

  /**
   * Validate security
   */
  async validateSecurity(component) {
    const issues = [];
    let score = 10;

    const allCode = Object.values(component.code || {}).join('');

    // Check for security issues
    if (allCode.includes('eval(')) {
      issues.push({ severity: 'error', message: 'eval() is dangerous and should be avoided' });
      score -= 5;
    }

    if (allCode.includes('dangerouslySetInnerHTML')) {
      issues.push({ severity: 'warning', message: 'dangerouslySetInnerHTML can lead to XSS' });
      score -= 2;
    }

    if (allCode.includes('http://') && !allCode.includes('localhost')) {
      issues.push({ severity: 'warning', message: 'Non-HTTPS URLs detected' });
      score -= 1;
    }

    return {
      score: Math.max(0, Math.round(score)),
      status: issues.length === 0 ? 'passed' : 'issues_found',
      issues
    };
  }

  /**
   * Check for basic syntax issues
   */
  checkSyntaxIssues(code, codeType) {
    const issues = [];

    // Check for unmatched brackets/braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push({
        severity: 'error',
        message: `Unmatched braces in ${codeType} code`
      });
    }

    // Check for console.log statements (should be removed in production)
    if (code.includes('console.log')) {
      issues.push({
        severity: 'info',
        message: `Console.log statements found in ${codeType} code`
      });
    }

    return issues;
  }

  /**
   * Apply automatic fixes for common issues
   */
  async applyAutomaticFixes(component, issues) {
    logger.info('🔧 Applying automatic fixes', { 
      component: component.name,
      issuesCount: issues.length
    });

    // Apply fixes based on issue types
    for (const issue of issues) {
      if (issue.severity === 'error' && issue.message.includes('description')) {
        component.description = component.description || `A ${component.name} component`;
      }
    }

    return component;
  }

  /**
   * Get quality grade from score
   */
  getQualityGrade(score) {
    if (score >= 9) return 'A+';
    if (score >= 8) return 'A';
    if (score >= 7) return 'B';
    if (score >= 6) return 'C';
    if (score >= 5) return 'D';
    return 'F';
  }

  /**
   * Get QA status
   */
  getStatus() {
    return {
      status: 'operational',
      rules: Object.keys(this.validationRules),
      thresholds: this.qualityThresholds
    };
  }
}

module.exports = QualityAssurance;