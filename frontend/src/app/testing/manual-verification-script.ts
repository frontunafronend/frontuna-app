/**
 * Manual Verification Script for AI Copilot
 * Run this in the browser console when on the AI Copilot page
 */

export const ManualVerificationScript = {
  
  /**
   * Verify keyboard shortcuts are working
   */
  testKeyboardShortcuts() {
    console.log('🎹 Testing Keyboard Shortcuts...');
    
    // Test Ctrl+Enter (Send prompt)
    console.log('1. Press Ctrl+Enter in chat input - should send prompt');
    
    // Test Ctrl+Shift+D (Toggle diff viewer)
    console.log('2. Press Ctrl+Shift+D - should toggle diff viewer if available');
    
    // Test Ctrl+Shift+P (Toggle preview)
    console.log('3. Press Ctrl+Shift+P - should toggle preview panel');
    
    // Add event listeners to verify shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        console.log('✅ Ctrl+Enter detected');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        console.log('✅ Ctrl+Shift+D detected');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        console.log('✅ Ctrl+Shift+P detected');
      }
    });
    
    return 'Keyboard shortcut listeners added. Try the shortcuts now.';
  },

  /**
   * Verify tour and persistence functionality
   */
  testTourPersistence() {
    console.log('🎓 Testing Tour & Persistence...');
    
    // Check current tour status
    const tourSeen = localStorage.getItem('ai-copilot-tour-seen');
    console.log('Tour seen status:', tourSeen);
    
    // Clear tour to test first-time experience
    localStorage.removeItem('ai-copilot-tour-seen');
    console.log('✅ Tour status cleared - reload page to see tour');
    
    // Test layout persistence
    const layoutData = localStorage.getItem('ai-copilot-layout');
    console.log('Layout data:', layoutData);
    
    return 'Tour cleared. Reload page to test first-time experience.';
  },

  /**
   * Verify chat history functionality
   */
  testChatHistory() {
    console.log('💬 Testing Chat History...');
    
    // Check current chat history
    const historyData = localStorage.getItem('ai-copilot-chat-history');
    console.log('Current chat history:', historyData);
    
    // Add test history entries
    const testHistory = [
      { prompt: 'Create a button component', timestamp: new Date(), response: 'Here is your button...' },
      { prompt: 'Add hover effects', timestamp: new Date(), response: 'Added hover effects...' },
      { prompt: 'Make it responsive', timestamp: new Date(), response: 'Made it responsive...' },
      { prompt: 'Add accessibility', timestamp: new Date(), response: 'Added ARIA labels...' },
      { prompt: 'Optimize performance', timestamp: new Date(), response: 'Optimized with memo...' },
      { prompt: 'Extra item (should be removed)', timestamp: new Date(), response: 'This should not appear' }
    ];
    
    // Should only keep last 5
    localStorage.setItem('ai-copilot-chat-history', JSON.stringify(testHistory.slice(0, 5)));
    console.log('✅ Test history added (5 items max)');
    
    return 'Chat history populated. Check history panel.';
  },

  /**
   * Test complete diff workflow
   */
  testDiffWorkflow() {
    console.log('🔄 Testing Diff Workflow...');
    
    const testPrompt = `Create a responsive card component:

\`\`\`typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  template: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() title: string = '';
  @Input() content: string = '';
  @Input() imageUrl?: string;
}
\`\`\`

\`\`\`html
<div class="card">
  <img *ngIf="imageUrl" [src]="imageUrl" [alt]="title" class="card-image">
  <div class="card-content">
    <h3 class="card-title">{{ title }}</h3>
    <p class="card-text">{{ content }}</p>
  </div>
</div>
\`\`\`

\`\`\`scss
.card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: white;
  
  .card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .card-content {
    padding: 16px;
    
    .card-title {
      margin: 0 0 8px 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .card-text {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }
  }
}
\`\`\``;

    console.log('Test prompt with code fences created:');
    console.log(testPrompt);
    console.log('✅ Copy this prompt into the chat and send it to test the diff workflow');
    
    return 'Test prompt ready. Paste into chat to test Chat → Diff → Apply flow.';
  },

  /**
   * Test telemetry tracking
   */
  testTelemetry() {
    console.log('📊 Testing Telemetry...');
    
    // Mock gtag function to capture events
    (window as any).gtag = (command: string, eventName: string, params: any) => {
      console.log(`📈 Telemetry Event: ${command} - ${eventName}`, params);
    };
    
    console.log('✅ Telemetry mock installed. Perform actions to see events logged.');
    
    return 'Telemetry tracking enabled. Check console for events.';
  },

  /**
   * Verify status indicators
   */
  testStatusIndicators() {
    console.log('🚦 Testing Status Indicators...');
    
    // Look for status indicator element
    const statusIndicator = document.querySelector('.status-indicator');
    if (statusIndicator) {
      console.log('✅ Status indicator found:', statusIndicator);
      
      // Check current status
      const statusText = statusIndicator.textContent;
      console.log('Current status:', statusText);
      
      return 'Status indicator verified. Send a prompt to see it change.';
    } else {
      console.log('❌ Status indicator not found');
      return 'Status indicator not found on page.';
    }
  },

  /**
   * Test accessibility features
   */
  testAccessibility() {
    console.log('♿ Testing Accessibility...');
    
    // Check for ARIA labels
    const buttons = document.querySelectorAll('button');
    const buttonsWithAria = Array.from(buttons).filter(btn => 
      btn.hasAttribute('aria-label') || btn.hasAttribute('matTooltip')
    );
    
    console.log(`✅ Found ${buttonsWithAria.length}/${buttons.length} buttons with accessibility attributes`);
    
    // Check for keyboard navigation
    const focusableElements = document.querySelectorAll(
      'button, [tabindex]:not([tabindex="-1"]), input, textarea, select'
    );
    console.log(`✅ Found ${focusableElements.length} focusable elements`);
    
    return 'Accessibility check completed. See console for details.';
  },

  /**
   * Run all tests
   */
  runAllTests() {
    console.log('🚀 Running All AI Copilot Verification Tests...');
    console.log('='.repeat(50));
    
    const results = {
      keyboardShortcuts: this.testKeyboardShortcuts(),
      tourPersistence: this.testTourPersistence(),
      chatHistory: this.testChatHistory(),
      diffWorkflow: this.testDiffWorkflow(),
      telemetry: this.testTelemetry(),
      statusIndicators: this.testStatusIndicators(),
      accessibility: this.testAccessibility()
    };
    
    console.log('='.repeat(50));
    console.log('📋 Test Results Summary:');
    Object.entries(results).forEach(([test, result]) => {
      console.log(`${test}: ${result}`);
    });
    
    console.log('='.repeat(50));
    console.log('🎯 Manual Actions Required:');
    console.log('1. Try keyboard shortcuts (Ctrl+Enter, Ctrl+Shift+D, Ctrl+Shift+P)');
    console.log('2. Reload page to test tour (if cleared)');
    console.log('3. Send the test prompt to verify diff workflow');
    console.log('4. Check chat history panel');
    console.log('5. Resize panels to test layout persistence');
    
    return results;
  }
};

// Auto-export to window for console access
if (typeof window !== 'undefined') {
  (window as any).verifyAICopilot = ManualVerificationScript;
  console.log('🔧 AI Copilot verification tools loaded!');
  console.log('Run: verifyAICopilot.runAllTests() to start all tests');
}

// Export for Angular usage
export default ManualVerificationScript;

