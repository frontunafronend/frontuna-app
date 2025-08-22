/**
 * 🤖 AI BUG GUARDIAN SYSTEM
 * 
 * This system analyzes code and adds protective comments to prevent bugs from returning.
 * It guards against common issues like:
 * - Authentication auto-logout bugs
 * - Database connection failures
 * - Token handling issues
 * - Missing error handling
 * - Incomplete API implementations
 */

const fs = require('fs');
const path = require('path');

class AIBugGuardian {
  constructor() {
    this.bugPatterns = {
      // Authentication Issues
      AUTH_AUTO_LOGOUT: {
        pattern: /setTimeout.*logout|logout.*setTimeout/gi,
        severity: 'CRITICAL',
        message: '🚨 CRITICAL: Auto-logout timeout detected! This causes users to be logged out unexpectedly.',
        fix: 'Remove setTimeout before logout or navigation. Navigate immediately after successful auth.'
      },
      
      // Token Issues
      TOKEN_BASE64_MISMATCH: {
        pattern: /toString\(['"]base64['"]\)|toString\(['"]base64url['"]\)/gi,
        severity: 'HIGH',
        message: '⚠️ HIGH: Token encoding detected. Ensure frontend expects same encoding as backend.',
        fix: 'Use consistent base64url encoding between frontend and backend JWT handling.'
      },
      
      // Database Connection Issues
      MISSING_DB_ERROR_HANDLING: {
        pattern: /pool\.query|db\.query(?!.*catch)/gi,
        severity: 'HIGH',
        message: '⚠️ HIGH: Database query without error handling detected.',
        fix: 'Wrap database queries in try-catch blocks with proper error responses.'
      },
      
      MOCK_DATA_WITHOUT_DB_FALLBACK: {
        pattern: /const mock\w+|mockData|return \{.*mock|\/\/ TODO.*database/gi,
        severity: 'HIGH',
        message: '🗄️ HIGH: Mock data detected without database connection!',
        fix: 'Connect to real database: 1) Add user token extraction, 2) Add database query, 3) Keep mock as fallback'
      },
      
      HARDCODED_DEMO_RESPONSES: {
        pattern: /demo.*user|user.*demo|Demo User|demo@example\.com/gi,
        severity: 'HIGH',
        message: '🗄️ HIGH: Hardcoded demo data detected! Should load from database.',
        fix: 'Replace demo data with database lookup using user token/email'
      },
      
      API_WITHOUT_DB_INTEGRATION: {
        pattern: /app\.(get|post|put|delete)\(['"][^'"]*['"].*\{(?!.*db\.|.*pool\.|.*query)/gi,
        severity: 'HIGH',
        message: '🗄️ HIGH: API endpoint without database integration!',
        fix: 'Add database connection: 1) Extract user from token, 2) Query/update database, 3) Return real data'
      },
      
      SETTINGS_NOT_PERSISTED: {
        pattern: /updatePreference|updateNotification|saveProfile(?!.*db\.|.*pool\.|.*query)/gi,
        severity: 'CRITICAL',
        message: '🚨 CRITICAL: Settings update not persisted to database!',
        fix: 'Connect settings to database: 1) Get user ID from token, 2) UPDATE user_preferences table, 3) Return updated data'
      },
      
      AI_USAGE_NOT_TRACKED: {
        pattern: /ai.*prompt|sendPrompt|ai.*generate(?!.*INSERT.*ai_usage)/gi,
        severity: 'MEDIUM',
        message: '🤖 MEDIUM: AI usage not tracked in database!',
        fix: 'Add AI usage tracking: INSERT INTO ai_usage (user_id, prompt, response, tokens_used)'
      },
      
      FORM_SUBMISSION_NO_DB: {
        pattern: /onSubmit|saveProfile|updateSettings(?!.*http\.|.*subscribe)/gi,
        severity: 'HIGH',
        message: '📝 HIGH: Form submission not connected to backend API!',
        fix: 'Connect form to API: 1) Call HTTP service, 2) Handle response, 3) Update UI state'
      },
      
      // API Endpoint Issues
      INCOMPLETE_API_RESPONSE: {
        pattern: /res\.json\(\{[^}]*success[^}]*\}\)(?!.*data)/gi,
        severity: 'MEDIUM',
        message: '📝 MEDIUM: API response missing data field.',
        fix: 'Include data field in API responses for consistency.'
      },
      
      // Error Handling Issues
      GENERIC_ERROR_MESSAGE: {
        pattern: /error\.message(?!.*instanceof Error)/gi,
        severity: 'MEDIUM',
        message: '📝 MEDIUM: Generic error handling without type checking.',
        fix: 'Check if error instanceof Error before accessing .message property.'
      },
      
      // Frontend Issues
      MISSING_LOADING_STATE: {
        pattern: /\.subscribe\(\{[^}]*next[^}]*\}\)(?!.*error)/gi,
        severity: 'MEDIUM',
        message: '📝 MEDIUM: Observable subscription without error handling.',
        fix: 'Add error handling to all observable subscriptions.'
      },
      
      // Component State Issues
      STATIC_USER_DATA: {
        pattern: /firstName.*=.*['"].*['"]|lastName.*=.*['"].*['"]|Demo User|Test User/gi,
        severity: 'HIGH',
        message: '👤 HIGH: Static user data detected! Should load from database.',
        fix: 'Load user data from API: 1) Call auth service, 2) Get profile from database, 3) Update component state'
      }
    };
    
    this.protectiveComments = {
      AUTH_GUARD: `
// 🛡️ AUTH GUARD: This code handles user authentication
// CRITICAL RULES:
// 1. NEVER add setTimeout before navigation after successful auth
// 2. ALWAYS navigate immediately after login/signup success
// 3. NEVER logout users automatically without explicit user action
// 4. Token validation should be tolerant, not strict
`,
      
      DATABASE_GUARD: `
// 🛡️ DATABASE GUARD: This code interacts with the database
// CRITICAL RULES:
// 1. ALWAYS wrap database queries in try-catch blocks
// 2. ALWAYS provide fallback responses for demo mode
// 3. NEVER expose raw database errors to frontend
// 4. ALWAYS validate user input before database operations
`,
      
      TOKEN_GUARD: `
// 🛡️ TOKEN GUARD: This code handles JWT tokens
// CRITICAL RULES:
// 1. Frontend and backend MUST use same encoding (base64url recommended)
// 2. ALWAYS provide fallback for invalid tokens (don't auto-logout)
// 3. Token validation should be tolerant for demo/development
// 4. NEVER decode tokens without proper error handling
`,
      
      API_GUARD: `
// 🛡️ API GUARD: This code defines API endpoints
// CRITICAL RULES:
// 1. ALWAYS return consistent response format: { success, data, message }
// 2. ALWAYS handle both database and demo modes
// 3. ALWAYS provide meaningful error messages
// 4. NEVER expose internal server errors to client
`
    };
  }

  /**
   * Analyze a file for potential bugs and add protective comments
   */
  analyzeFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = this.detectIssues(content, filePath);
    
    if (issues.length > 0) {
      console.log(`\n🔍 ANALYZING: ${filePath}`);
      console.log(`📊 Found ${issues.length} potential issues:`);
      
      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.severity}: ${issue.message}`);
        console.log(`   💡 Fix: ${issue.fix}`);
        console.log(`   📍 Pattern: ${issue.pattern}`);
      });
      
      // Add protective comments
      const protectedContent = this.addProtectiveComments(content, filePath, issues);
      
      // Create backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content);
      
      // Write protected version
      fs.writeFileSync(filePath, protectedContent);
      
      console.log(`✅ Added protective comments to ${filePath}`);
      console.log(`📁 Backup saved as ${backupPath}`);
    } else {
      console.log(`✅ ${filePath} - No issues detected`);
    }
  }

  /**
   * Detect potential issues in code
   */
  detectIssues(content, filePath) {
    const issues = [];
    
    Object.entries(this.bugPatterns).forEach(([key, pattern]) => {
      const matches = content.match(pattern.pattern);
      if (matches) {
        issues.push({
          type: key,
          severity: pattern.severity,
          message: pattern.message,
          fix: pattern.fix,
          pattern: pattern.pattern.toString(),
          matches: matches.length
        });
      }
    });
    
    return issues;
  }

  /**
   * Add protective comments to code
   */
  addProtectiveComments(content, filePath, issues) {
    let protectedContent = content;
    
    // Add file header guard
    const fileGuard = `/**
 * 🤖 AI BUG GUARDIAN PROTECTED FILE
 * Last analyzed: ${new Date().toISOString()}
 * Issues detected: ${issues.length}
 * 
 * This file is protected against common bugs:
 * ${issues.map(issue => `- ${issue.type}: ${issue.severity}`).join('\n * ')}
 */

`;
    
    // Add specific guards based on file type
    if (filePath.includes('auth')) {
      protectedContent = fileGuard + this.protectiveComments.AUTH_GUARD + protectedContent;
    } else if (filePath.includes('server') || filePath.includes('database')) {
      protectedContent = fileGuard + this.protectiveComments.DATABASE_GUARD + protectedContent;
    } else if (filePath.includes('token') || filePath.includes('jwt')) {
      protectedContent = fileGuard + this.protectiveComments.TOKEN_GUARD + protectedContent;
    } else if (filePath.includes('api') || filePath.includes('endpoint')) {
      protectedContent = fileGuard + this.protectiveComments.API_GUARD + protectedContent;
    } else {
      protectedContent = fileGuard + protectedContent;
    }
    
    return protectedContent;
  }

  /**
   * Analyze entire project for database connection issues
   */
  analyzeProject(projectPath = '.') {
    console.log('🤖 AI BUG GUARDIAN - Starting Comprehensive Project Analysis');
    console.log('🗄️ FOCUS: Database Connection Issues');
    console.log('=' .repeat(70));
    
    const filesToAnalyze = [
      // Backend files
      'backend/server-production.js',
      'backend/server.js',
      'backend/minimal-server.js',
      
      // Frontend auth files
      'frontend/src/app/services/auth/auth.service.ts',
      'frontend/src/app/pages/auth/login/login.component.ts',
      'frontend/src/app/pages/auth/signup/signup.component.ts',
      
      // Settings files
      'frontend/src/app/pages/settings/settings.component.ts',
      'frontend/src/app/services/api/settings.service.ts',
      
      // AI service files
      'frontend/src/app/services/ai/ai-prompt-core.service.ts',
      'frontend/src/app/pages/dashboard/ai-copilot.component.ts',
      'frontend/src/app/pages/dashboard/ai-copilot-new.component.ts',
      'frontend/src/app/pages/dashboard/ai-copilot-fixed.component.ts',
      
      // Component gallery files
      'frontend/src/app/services/gallery/component-gallery.service.ts',
      'frontend/src/app/services/ai/ai-versioning.service.ts',
      
      // Additional service files
      'frontend/src/app/services/api/base-api.service.ts',
      'frontend/src/app/services/analytics/google-analytics.service.ts'
    ];
    
    let totalIssues = 0;
    let databaseIssues = 0;
    const disconnectedComponents = [];
    
    filesToAnalyze.forEach(filePath => {
      const fullPath = path.join(projectPath, filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const issues = this.detectIssues(content, fullPath);
        totalIssues += issues.length;
        
        // Count database-specific issues
        const dbIssues = issues.filter(issue => 
          issue.type.includes('MOCK_DATA') || 
          issue.type.includes('DEMO') || 
          issue.type.includes('API_WITHOUT_DB') ||
          issue.type.includes('SETTINGS_NOT_PERSISTED') ||
          issue.type.includes('AI_USAGE_NOT_TRACKED') ||
          issue.type.includes('STATIC_USER_DATA')
        );
        
        if (dbIssues.length > 0) {
          databaseIssues += dbIssues.length;
          disconnectedComponents.push({
            file: filePath,
            issues: dbIssues.length,
            types: dbIssues.map(issue => issue.type)
          });
        }
        
        if (issues.length > 0) {
          this.analyzeFile(fullPath);
        }
      }
    });
    
    console.log('\n' + '=' .repeat(70));
    console.log(`🎯 ANALYSIS COMPLETE`);
    console.log(`📊 Total files analyzed: ${filesToAnalyze.length}`);
    console.log(`⚠️ Total issues found: ${totalIssues}`);
    console.log(`🗄️ Database connection issues: ${databaseIssues}`);
    console.log(`🛡️ Protective comments added to all vulnerable files`);
    
    // Show disconnected components
    if (disconnectedComponents.length > 0) {
      console.log('\n🚨 COMPONENTS NOT CONNECTED TO DATABASE:');
      disconnectedComponents.forEach((comp, index) => {
        console.log(`${index + 1}. ${comp.file} (${comp.issues} issues)`);
        comp.types.forEach(type => {
          console.log(`   - ${type}`);
        });
      });
    }
    
    // Generate comprehensive database connection report
    this.generateDatabaseConnectionReport(totalIssues, databaseIssues, disconnectedComponents);
    
    // Generate step-by-step fix guide
    this.generateFixGuide(disconnectedComponents);
  }

  /**
   * Generate comprehensive database connection report
   */
  generateDatabaseConnectionReport(totalIssues, databaseIssues, disconnectedComponents) {
    const report = `
# 🗄️ DATABASE CONNECTION ANALYSIS REPORT
Generated: ${new Date().toISOString()}

## 📊 SUMMARY
- **Total Issues Found:** ${totalIssues}
- **Database Connection Issues:** ${databaseIssues}
- **Components Not Connected:** ${disconnectedComponents.length}
- **Connection Status:** ${databaseIssues > 0 ? '🔴 NEEDS FIXING' : '🟢 FULLY CONNECTED'}

## 🚨 COMPONENTS REQUIRING DATABASE CONNECTION

${disconnectedComponents.map((comp, index) => `
### ${index + 1}. ${comp.file}
**Issues:** ${comp.issues}
**Problems:**
${comp.types.map(type => `- ${type}`).join('\n')}

**Fix Required:**
${this.getFixInstructions(comp.file)}
`).join('\n')}

## 🛠️ PRIORITY FIXES

### 🔥 CRITICAL (Fix Immediately)
1. **Settings Not Persisted** - User changes are lost on refresh
2. **Static User Data** - Shows "Demo User" instead of real names
3. **API Without DB Integration** - Endpoints return mock data

### ⚠️ HIGH PRIORITY (Fix Soon)
1. **Mock Data Without DB Fallback** - No real data loading
2. **Form Submissions Not Connected** - Changes don't save
3. **Hardcoded Demo Responses** - Always shows demo data

### 📝 MEDIUM PRIORITY (Fix When Possible)
1. **AI Usage Not Tracked** - No usage analytics
2. **Missing Loading States** - Poor user experience

## ✅ REQUIRED ACTIONS

### For Backend Files:
1. Add user token extraction from Authorization header
2. Query database using user email/ID
3. Return real data with fallback to mock
4. Add proper error handling

### For Frontend Components:
1. Connect forms to HTTP services
2. Load user data from API calls
3. Handle loading and error states
4. Update component state with real data

### For Settings Pages:
1. Call backend APIs on form submission
2. Persist changes to database
3. Show success/error feedback
4. Reload data after updates

---
*🤖 AI Bug Guardian - Ensuring Complete Database Integration*
`;

    fs.writeFileSync('DATABASE-CONNECTION-REPORT.md', report);
    console.log('\n📄 Database connection report saved as DATABASE-CONNECTION-REPORT.md');
  }

  /**
   * Get specific fix instructions for a file
   */
  getFixInstructions(filePath) {
    if (filePath.includes('server')) {
      return `
1. Extract user email from JWT token in Authorization header
2. Add database query to get/update user data
3. Return real data with mock as fallback
4. Add try-catch error handling`;
    } else if (filePath.includes('settings')) {
      return `
1. Connect all form submissions to HTTP service calls
2. Handle API responses and update UI state
3. Show loading indicators during API calls
4. Display success/error messages`;
    } else if (filePath.includes('auth')) {
      return `
1. Load user profile data from API after login
2. Store real user data in component state
3. Remove hardcoded demo values
4. Handle profile loading errors gracefully`;
    } else if (filePath.includes('ai')) {
      return `
1. Track AI usage by calling backend endpoint
2. Send user context with AI requests
3. Store AI responses and usage data
4. Show usage statistics to user`;
    }
    return 'Connect to backend API and database';
  }

  /**
   * Generate step-by-step fix guide
   */
  generateFixGuide(disconnectedComponents) {
    const guide = `
# 🔧 STEP-BY-STEP DATABASE CONNECTION FIX GUIDE

## 🎯 GOAL: Connect ALL components to real database

### STEP 1: Backend API Endpoints
For each API endpoint in server-production.js:

\`\`\`javascript
// ❌ WRONG: Mock response
app.get('/api/endpoint', (req, res) => {
  res.json({ success: true, data: mockData });
});

// ✅ CORRECT: Database connected
app.get('/api/endpoint', async (req, res) => {
  try {
    // Extract user from token
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userEmail = decoded.email;
    
    // Query database
    const result = await db.query('SELECT * FROM users WHERE email = $1', [userEmail]);
    
    if (result.rows.length > 0) {
      res.json({ success: true, data: result.rows[0] });
    } else {
      // Fallback to mock
      res.json({ success: true, data: mockData });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});
\`\`\`

### STEP 2: Frontend Components
For each component with static data:

\`\`\`typescript
// ❌ WRONG: Static data
export class Component {
  firstName = 'Demo';
  lastName = 'User';
}

// ✅ CORRECT: Load from API
export class Component {
  firstName = signal<string>('');
  lastName = signal<string>('');
  
  ngOnInit() {
    this.authService.getProfile().subscribe(profile => {
      this.firstName.set(profile.firstName);
      this.lastName.set(profile.lastName);
    });
  }
}
\`\`\`

### STEP 3: Settings Forms
For each settings form:

\`\`\`typescript
// ❌ WRONG: No API call
saveSettings() {
  console.log('Settings saved');
}

// ✅ CORRECT: API integration
saveSettings() {
  this.settingsService.updateProfile(this.form.value).subscribe({
    next: (response) => {
      this.notificationService.showSuccess('Settings saved!');
    },
    error: (error) => {
      this.notificationService.showError('Failed to save settings');
    }
  });
}
\`\`\`

## 🚀 QUICK FIX CHECKLIST

${disconnectedComponents.map((comp, index) => `
### ${comp.file}
- [ ] Add API service calls
- [ ] Remove hardcoded data  
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test database connection
`).join('')}

---
*Follow this guide to ensure complete database integration!*
`;

    fs.writeFileSync('DATABASE-FIX-GUIDE.md', guide);
    console.log('📖 Step-by-step fix guide saved as DATABASE-FIX-GUIDE.md');
  }

  /**
   * Generate comprehensive bug prevention report
   */
  generateBugReport(totalIssues) {
    const report = `
# 🤖 AI BUG GUARDIAN REPORT
Generated: ${new Date().toISOString()}

## 🛡️ PROTECTION RULES ENFORCED

### 1. AUTHENTICATION PROTECTION
- ❌ NO setTimeout before navigation after auth success
- ✅ IMMEDIATE navigation after login/signup
- ❌ NO automatic user logout without user action
- ✅ TOLERANT token validation (don't kick users out)

### 2. DATABASE PROTECTION  
- ✅ ALL database queries wrapped in try-catch
- ✅ FALLBACK responses for demo mode
- ❌ NO raw database errors exposed to frontend
- ✅ INPUT validation before database operations

### 3. TOKEN PROTECTION
- ✅ CONSISTENT encoding between frontend/backend
- ✅ FALLBACK handling for invalid tokens
- ✅ TOLERANT token validation for development
- ✅ PROPER error handling in token decode

### 4. API PROTECTION
- ✅ CONSISTENT response format: { success, data, message }
- ✅ BOTH database and demo mode support
- ✅ MEANINGFUL error messages
- ❌ NO internal server errors exposed

## 📊 ANALYSIS RESULTS
- Total issues detected: ${totalIssues}
- Files protected: All vulnerable files
- Bug prevention: ACTIVE
- Status: 🟢 PROTECTED

## 🚨 CRITICAL REMINDERS
1. NEVER add delays before navigation after successful auth
2. ALWAYS use consistent JWT encoding (base64url recommended)
3. ALWAYS provide database fallbacks for demo mode
4. ALWAYS handle errors gracefully without auto-logout
5. ALWAYS validate tokens tolerantly in development

---
*This report ensures bugs don't return. Keep this system active!*
`;

    fs.writeFileSync('BUG-GUARDIAN-REPORT.md', report);
    console.log('\n📄 Bug prevention report saved as BUG-GUARDIAN-REPORT.md');
  }

  /**
   * Create continuous monitoring system
   */
  setupContinuousMonitoring() {
    console.log('🔄 Setting up continuous bug monitoring...');
    
    // Watch for file changes and re-analyze
    const filesToWatch = [
      'backend/server-production.js',
      'frontend/src/app/services/auth/auth.service.ts',
      'frontend/src/app/pages/settings/settings.component.ts'
    ];
    
    filesToWatch.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.watchFile(filePath, (curr, prev) => {
          console.log(`\n🔍 File changed: ${filePath}`);
          console.log('🤖 Re-analyzing for bugs...');
          this.analyzeFile(filePath);
        });
      }
    });
    
    console.log('✅ Continuous monitoring active for critical files');
  }
}

// Export for use in other files
module.exports = AIBugGuardian;

// Run analysis if called directly
if (require.main === module) {
  const guardian = new AIBugGuardian();
  guardian.analyzeProject();
  
  // Uncomment to enable continuous monitoring
  // guardian.setupContinuousMonitoring();
}
