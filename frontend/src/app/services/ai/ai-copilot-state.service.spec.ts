import { TestBed } from '@angular/core/testing';
import { AICopilotStateService, ChatMessage } from './ai-copilot-state.service';
import { AIResponse, AIPrompt } from '@app/models/ai.model';

describe('AICopilotStateService', () => {
  let service: AICopilotStateService;

  const mockAIResponse: AIResponse = {
    id: '1',
    promptId: 'prompt1',
    code: 'console.log("Hello World");',
    timestamp: new Date(),
    model: 'gpt-4',
    tokens: 100,
    cost: 0.01
  };

  const mockAIPrompt: AIPrompt = {
    id: 'prompt1',
    content: 'Create a simple component',
    type: 'generate',
    context: 'Angular component',
    timestamp: new Date(),
    userId: 'user1'
  };

  const mockChatMessage: ChatMessage = {
    id: 'msg1',
    content: 'Hello AI',
    sender: 'user',
    timestamp: new Date(),
    type: 'prompt'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AICopilotStateService]
    });
    service = TestBed.inject(AICopilotStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should initialize with empty chat messages', () => {
      expect(service.chatMessages().length).toBe(0);
    });

    it('should initialize with empty generated code', () => {
      expect(service.generatedCode()).toBe('');
    });

    it('should initialize with empty prompt history', () => {
      expect(service.promptHistory().length).toBe(0);
    });

    it('should initialize with default current step', () => {
      expect(service.currentStep()).toBe('idle');
    });

    it('should initialize with default current context', () => {
      expect(service.currentContext()).toBe('');
    });
  });

  describe('Chat message management', () => {
    it('should add chat message', () => {
      service.addChatMessage(mockChatMessage);
      
      expect(service.chatMessages().length).toBe(1);
      expect(service.chatMessages()[0]).toEqual(mockChatMessage);
    });

    it('should add multiple chat messages', () => {
      const message1 = { ...mockChatMessage, id: 'msg1' };
      const message2 = { ...mockChatMessage, id: 'msg2' };
      
      service.addChatMessage(message1);
      service.addChatMessage(message2);
      
      expect(service.chatMessages().length).toBe(2);
      expect(service.chatMessages()[0].id).toBe('msg1');
      expect(service.chatMessages()[1].id).toBe('msg2');
    });

    it('should clear chat messages', () => {
      service.addChatMessage(mockChatMessage);
      expect(service.chatMessages().length).toBe(1);
      
      service.clearChatMessages();
      expect(service.chatMessages().length).toBe(0);
    });

    it('should remove specific chat message', () => {
      service.addChatMessage(mockChatMessage);
      const message2 = { ...mockChatMessage, id: 'msg2' };
      service.addChatMessage(message2);
      
      expect(service.chatMessages().length).toBe(2);
      
      service.removeChatMessage('msg1');
      expect(service.chatMessages().length).toBe(1);
      expect(service.chatMessages()[0].id).toBe('msg2');
    });

    it('should update chat message', () => {
      service.addChatMessage(mockChatMessage);
      const updatedMessage = { ...mockChatMessage, content: 'Updated content' };
      
      service.updateChatMessage('msg1', updatedMessage);
      
      expect(service.chatMessages()[0].content).toBe('Updated content');
    });

    it('should handle updating non-existent message', () => {
      service.addChatMessage(mockChatMessage);
      
      const updatedMessage = { ...mockChatMessage, content: 'Updated content' };
      service.updateChatMessage('non-existent', updatedMessage);
      
      expect(service.chatMessages()[0].content).toBe('Hello AI'); // Should remain unchanged
    });
  });

  describe('Generated code management', () => {
    it('should set generated code', () => {
      const code = 'const test = "Hello World";';
      service.setGeneratedCode(code);
      
      expect(service.generatedCode()).toBe(code);
    });

    it('should update generated code', () => {
      service.setGeneratedCode('initial code');
      service.updateGeneratedCode('updated code');
      
      expect(service.generatedCode()).toBe('updated code');
    });

    it('should clear generated code', () => {
      service.setGeneratedCode('some code');
      expect(service.generatedCode()).toBe('some code');
      
      service.clearGeneratedCode();
      expect(service.generatedCode()).toBe('');
    });
  });

  describe('Prompt history management', () => {
    it('should add prompt to history', () => {
      service.addPromptToHistory(mockAIPrompt);
      
      expect(service.promptHistory().length).toBe(1);
      expect(service.promptHistory()[0]).toEqual(mockAIPrompt);
    });

    it('should add multiple prompts to history', () => {
      const prompt1 = { ...mockAIPrompt, id: 'prompt1' };
      const prompt2 = { ...mockAIPrompt, id: 'prompt2' };
      
      service.addPromptToHistory(prompt1);
      service.addPromptToHistory(prompt2);
      
      expect(service.promptHistory().length).toBe(2);
      expect(service.promptHistory()[0].id).toBe('prompt1');
      expect(service.promptHistory()[1].id).toBe('prompt2');
    });

    it('should clear prompt history', () => {
      service.addPromptToHistory(mockAIPrompt);
      expect(service.promptHistory().length).toBe(1);
      
      service.clearPromptHistory();
      expect(service.promptHistory().length).toBe(0);
    });

    it('should remove specific prompt from history', () => {
      service.addPromptToHistory(mockAIPrompt);
      const prompt2 = { ...mockAIPrompt, id: 'prompt2' };
      service.addPromptToHistory(prompt2);
      
      expect(service.promptHistory().length).toBe(2);
      
      service.removePromptFromHistory('prompt1');
      expect(service.promptHistory().length).toBe(1);
      expect(service.promptHistory()[0].id).toBe('prompt2');
    });

    it('should update prompt in history', () => {
      service.addPromptToHistory(mockAIPrompt);
      const updatedPrompt = { ...mockAIPrompt, content: 'Updated prompt' };
      
      service.updatePromptInHistory('prompt1', updatedPrompt);
      
      expect(service.promptHistory()[0].content).toBe('Updated prompt');
    });

    it('should handle updating non-existent prompt', () => {
      service.addPromptToHistory(mockAIPrompt);
      
      const updatedPrompt = { ...mockAIPrompt, content: 'Updated prompt' };
      service.updatePromptInHistory('non-existent', updatedPrompt);
      
      expect(service.promptHistory()[0].content).toBe('Create a simple component'); // Should remain unchanged
    });
  });

  describe('Current step management', () => {
    it('should set current step', () => {
      service.setCurrentStep('generating');
      expect(service.currentStep()).toBe('generating');
    });

    it('should update current step', () => {
      service.setCurrentStep('idle');
      service.setCurrentStep('processing');
      
      expect(service.currentStep()).toBe('processing');
    });

    it('should handle all step types', () => {
      const steps = ['idle', 'processing', 'generating', 'complete', 'error'];
      
      steps.forEach(step => {
        service.setCurrentStep(step);
        expect(service.currentStep()).toBe(step);
      });
    });
  });

  describe('Current context management', () => {
    it('should set current context', () => {
      const context = 'Angular component generation';
      service.setCurrentContext(context);
      
      expect(service.currentContext()).toBe(context);
    });

    it('should update current context', () => {
      service.setCurrentContext('initial context');
      service.setCurrentContext('updated context');
      
      expect(service.currentContext()).toBe('updated context');
    });

    it('should clear current context', () => {
      service.setCurrentContext('some context');
      expect(service.currentContext()).toBe('some context');
      
      service.clearCurrentContext();
      expect(service.currentContext()).toBe('');
    });
  });

  describe('State persistence', () => {
    it('should save state to localStorage', () => {
      spyOn(localStorage, 'setItem');
      
      service.addChatMessage(mockChatMessage);
      service.setGeneratedCode('test code');
      service.addPromptToHistory(mockAIPrompt);
      
      // Trigger save by calling a method that saves state
      service.saveState();
      
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should load state from localStorage', () => {
      const mockState = {
        chatMessages: [mockChatMessage],
        generatedCode: 'test code',
        promptHistory: [mockAIPrompt],
        currentStep: 'generating',
        currentContext: 'test context'
      };
      
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockState));
      
      service.loadState();
      
      expect(service.chatMessages().length).toBe(1);
      expect(service.generatedCode()).toBe('test code');
      expect(service.promptHistory().length).toBe(1);
      expect(service.currentStep()).toBe('generating');
      expect(service.currentContext()).toBe('test context');
    });

    it('should handle loading invalid state gracefully', () => {
      spyOn(localStorage, 'getItem').and.returnValue('invalid json');
      spyOn(console, 'error');
      
      service.loadState();
      
      expect(console.error).toHaveBeenCalled();
      // State should remain at default values
      expect(service.chatMessages().length).toBe(0);
      expect(service.generatedCode()).toBe('');
    });

    it('should handle loading null state gracefully', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      
      service.loadState();
      
      // State should remain at default values
      expect(service.chatMessages().length).toBe(0);
      expect(service.generatedCode()).toBe('');
    });
  });

  describe('State reset', () => {
    it('should reset all state to initial values', () => {
      // Populate state
      service.addChatMessage(mockChatMessage);
      service.setGeneratedCode('test code');
      service.addPromptToHistory(mockAIPrompt);
      service.setCurrentStep('generating');
      service.setCurrentContext('test context');
      
      // Verify state is populated
      expect(service.chatMessages().length).toBe(1);
      expect(service.generatedCode()).toBe('test code');
      expect(service.promptHistory().length).toBe(1);
      expect(service.currentStep()).toBe('generating');
      expect(service.currentContext()).toBe('test context');
      
      // Reset state
      service.resetState();
      
      // Verify state is reset
      expect(service.chatMessages().length).toBe(0);
      expect(service.generatedCode()).toBe('');
      expect(service.promptHistory().length).toBe(0);
      expect(service.currentStep()).toBe('idle');
      expect(service.currentContext()).toBe('');
    });
  });

  describe('State validation', () => {
    it('should validate chat message structure', () => {
      const invalidMessage = { content: 'test' } as any; // Missing required fields
      
      expect(() => service.addChatMessage(invalidMessage)).toThrow();
    });

    it('should validate AI prompt structure', () => {
      const invalidPrompt = { content: 'test' } as any; // Missing required fields
      
      expect(() => service.addPromptToHistory(invalidPrompt)).toThrow();
    });

    it('should validate step values', () => {
      expect(() => service.setCurrentStep('invalid-step' as any)).toThrow();
    });
  });

  describe('Performance and memory management', () => {
    it('should handle large message lists efficiently', () => {
      const largeMessageList = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg${i}`,
        content: `Message ${i}`,
        sender: 'user',
        timestamp: new Date(),
        type: 'prompt'
      }));
      
      const startTime = performance.now();
      
      largeMessageList.forEach(msg => service.addChatMessage(msg));
      
      const endTime = performance.now();
      
      expect(service.chatMessages().length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it('should limit history size to prevent memory issues', () => {
      const maxMessages = 100;
      
      // Add more than max messages
      for (let i = 0; i < maxMessages + 50; i++) {
        const msg = { ...mockChatMessage, id: `msg${i}` };
        service.addChatMessage(msg);
      }
      
      // Should not exceed max size
      expect(service.chatMessages().length).toBeLessThanOrEqual(maxMessages);
    });
  });

  describe('Error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      spyOn(localStorage, 'setItem').and.throwError('Storage error');
      spyOn(console, 'error');
      
      service.addChatMessage(mockChatMessage);
      
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle JSON parsing errors gracefully', () => {
      spyOn(localStorage, 'getItem').and.returnValue('invalid json');
      spyOn(console, 'error');
      
      service.loadState();
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('State synchronization', () => {
    it('should maintain consistency between related state updates', () => {
      // When adding a chat message, related state should be updated
      service.addChatMessage(mockChatMessage);
      
      // Verify chat messages are updated
      expect(service.chatMessages().length).toBe(1);
      
      // Verify state is saved
      spyOn(localStorage, 'setItem');
      service.saveState();
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should handle concurrent state updates correctly', () => {
      // Simulate concurrent updates
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        const msg = { ...mockChatMessage, id: `msg${i}` };
        promises.push(Promise.resolve(service.addChatMessage(msg)));
      }
      
      Promise.all(promises).then(() => {
        expect(service.chatMessages().length).toBe(10);
      });
    });
  });
});
