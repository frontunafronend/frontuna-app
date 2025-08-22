/**
 * 🔄 AUTOMATED AI BUG GUARDIAN SCANNER
 * 
 * This system automatically runs the AI Bug Guardian at regular intervals
 * to ensure the app stays healthy and database-connected.
 */

const AIBugGuardian = require('./ai-bug-guardian');
const fs = require('fs');

class AutoBugScanner {
  constructor() {
    this.guardian = new AIBugGuardian();
    this.scanInterval = 5 * 60 * 1000; // 5 minutes
    this.isScanning = false;
    this.lastScanTime = null;
    this.issueHistory = [];
  }

  /**
   * Start automated scanning
   */
  startAutomatedScanning() {
    console.log('🚀 Starting Automated AI Bug Guardian Scanner');
    console.log(`⏰ Scan interval: ${this.scanInterval / 1000 / 60} minutes`);
    
    // Run initial scan
    this.runScan();
    
    // Set up regular scanning
    setInterval(() => {
      this.runScan();
    }, this.scanInterval);
    
    console.log('✅ Automated scanning is now active');
  }

  /**
   * Run a single scan
   */
  async runScan() {
    if (this.isScanning) {
      console.log('⏳ Scan already in progress, skipping...');
      return;
    }

    this.isScanning = true;
    this.lastScanTime = new Date();
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 AUTOMATED SCAN STARTING');
    console.log(`⏰ Time: ${this.lastScanTime.toISOString()}`);
    console.log('='.repeat(60));
    
    try {
      // Run the guardian analysis
      this.guardian.analyzeProject();
      
      // Check if any new issues appeared
      const currentIssues = this.getCurrentIssueCount();
      this.issueHistory.push({
        timestamp: this.lastScanTime,
        issueCount: currentIssues
      });
      
      // Alert if issues increased
      if (this.issueHistory.length > 1) {
        const previousCount = this.issueHistory[this.issueHistory.length - 2].issueCount;
        if (currentIssues > previousCount) {
          console.log(`\n🚨 ALERT: Issues increased from ${previousCount} to ${currentIssues}!`);
          this.sendAlert(currentIssues, previousCount);
        } else if (currentIssues < previousCount) {
          console.log(`\n✅ GOOD: Issues decreased from ${previousCount} to ${currentIssues}!`);
        } else {
          console.log(`\n📊 STATUS: Issue count stable at ${currentIssues}`);
        }
      }
      
      // Keep only last 10 scans in history
      if (this.issueHistory.length > 10) {
        this.issueHistory = this.issueHistory.slice(-10);
      }
      
      console.log('\n✅ Automated scan completed successfully');
      
    } catch (error) {
      console.error('❌ Error during automated scan:', error);
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Get current issue count from latest report
   */
  getCurrentIssueCount() {
    try {
      if (fs.existsSync('DATABASE-CONNECTION-REPORT.md')) {
        const report = fs.readFileSync('DATABASE-CONNECTION-REPORT.md', 'utf8');
        const match = report.match(/Total Issues Found:\*\* (\d+)/);
        return match ? parseInt(match[1]) : 0;
      }
    } catch (error) {
      console.error('Error reading issue count:', error);
    }
    return 0;
  }

  /**
   * Send alert when issues increase
   */
  sendAlert(currentCount, previousCount) {
    const alert = `
🚨 AI BUG GUARDIAN ALERT
========================
Time: ${new Date().toISOString()}
Issue Count: ${previousCount} → ${currentCount} (+${currentCount - previousCount})

⚠️ New issues detected in the application!
📋 Check DATABASE-CONNECTION-REPORT.md for details
🔧 Run fixes from DATABASE-FIX-GUIDE.md

Action Required: Review and fix new issues immediately.
`;

    // Save alert to file
    fs.writeFileSync(`ALERT-${Date.now()}.md`, alert);
    
    console.log(alert);
  }

  /**
   * Get scan status
   */
  getStatus() {
    return {
      isScanning: this.isScanning,
      lastScanTime: this.lastScanTime,
      scanInterval: this.scanInterval,
      issueHistory: this.issueHistory
    };
  }

  /**
   * Manual scan trigger
   */
  triggerManualScan() {
    console.log('🔍 Triggering manual scan...');
    this.runScan();
  }
}

// Export for use in other files
module.exports = AutoBugScanner;

// Run if called directly
if (require.main === module) {
  const scanner = new AutoBugScanner();
  
  // Start automated scanning
  scanner.startAutomatedScanning();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down automated scanner...');
    process.exit(0);
  });
  
  // Keep process alive
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    // Continue running despite errors
  });
}
