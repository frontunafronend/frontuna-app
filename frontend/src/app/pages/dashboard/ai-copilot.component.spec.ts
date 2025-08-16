import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { AICopilotComponent } from './ai-copilot.component';
import { AICopilotStateService } from '@app/services/ai/ai-copilot-state.service';
import { AIPromptService } from '@app/services/ai/ai-prompt.service';
import { AITransformService } from '@app/services/ai/ai-transform.service';
import { AuthService } from '@app/services/auth/auth.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { KeyboardShortcutsService } from '@app/services/ui/keyboard-shortcuts.service';
import { AIResponse, AIPrompt } from '@app/models/ai.model';

describe('AICopilotComponent', () => {
  let component: AICopilotComponent;
  let fixture: ComponentFixture<AICopilotComponent>;
  let mockCopilotState: jasmine.SpyObj<AICopilotStateService>;
  let mockAIPromptService: jasmine.SpyObj<AIPromptService>;
  let mockAITransformService: jasmine.SpyObj<AITransformService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockKeyboardShortcuts: jasmine.SpyObj<KeyboardShortcutsService>;

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

  beforeEach(async () => {
    mockCopilotState = jasmine.createSpyObj('AICopilotStateService', [
      'addChatMessage',
      'setGeneratedCode',
      'addPromptToHistory',
      'currentStep',
      'setCurrentStep'
    ], {
      currentContext: { value: 'test context' },
      chatMessages: { value: [] },
      generatedCode: { value: '' },
      promptHistory: { value: [] }
    });

    mockAIPromptService = jasmine.createSpyObj('AIPromptService', [
      'sendPrompt',
      'getSuggestions'
    ]);

    mockAITransformService = jasmine.createSpyObj('AITransformService', [
      'transformCode'
    ]);

    mockAuthService = jasmine.createSpyObj('AuthService', [
      'getCurrentUser'
    ]);

    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
      'showInfo'
    ]);

    mockKeyboardShortcuts = jasmine.createSpyObj('KeyboardShortcutsService', [
      'registerShortcut',
      'showShortcutsHelp'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        AICopilotComponent,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AICopilotStateService, useValue: mockCopilotState },
        { provide: AIPromptService, useValue: mockAIPromptService },
        { provide: AITransformService, useValue: mockAITransformService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: KeyboardShortcutsService, useValue: mockKeyboardShortcuts }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AICopilotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.activeTab).toBe(0);
    expect(component.chatSearchQuery).toBe('');
    expect(component.showFavorites).toBe(false);
    expect(component.starterPrompts.length).toBeGreaterThan(0);
  });

  it('should load stats on init', () => {
    spyOn(component, 'loadStats');
    component.ngOnInit();
    expect(component.loadStats).toHaveBeenCalled();
  });

  it('should setup keyboard shortcuts on init', () => {
    spyOn(component, 'setupKeyboardShortcuts');
    component.ngOnInit();
    expect(component.setupKeyboardShortcuts).toHaveBeenCalled();
  });

  describe('handlePromptSent', () => {
    it('should handle prompt sent correctly', fakeAsync(() => {
      const prompt = 'Test prompt';
      mockAIPromptService.sendPrompt.and.returnValue(of(mockAIResponse));
      
      component.handlePromptSent(prompt);
      tick();
      
      expect(mockAIPromptService.sendPrompt).toHaveBeenCalledWith(prompt);
      expect(mockCopilotState.addPromptToHistory).toHaveBeenCalled();
    }));

    it('should handle prompt error', fakeAsync(() => {
      const prompt = 'Test prompt';
      const error = new Error('API Error');
      mockAIPromptService.sendPrompt.and.returnValue(throwError(() => error));
      
      component.handlePromptSent(prompt);
      tick();
      
      expect(mockNotificationService.showError).toHaveBeenCalled();
    }));
  });

  describe('handleResponseReceived', () => {
    it('should handle AI response correctly', () => {
      component.handleResponseReceived(mockAIResponse);
      
      expect(mockCopilotState.setGeneratedCode).toHaveBeenCalled();
      expect(mockCopilotState.addChatMessage).toHaveBeenCalled();
      expect(component.lastAIResponse()).toEqual(mockAIResponse);
    });
  });

  describe('handleChatResponse', () => {
    it('should handle chat response correctly', () => {
      component.handleChatResponse(mockAIResponse);
      
      expect(mockCopilotState.addChatMessage).toHaveBeenCalled();
    });
  });

  describe('handleGenerationResponse', () => {
    it('should handle generation response correctly', () => {
      component.handleGenerationResponse(mockAIResponse);
      
      expect(mockCopilotState.setGeneratedCode).toHaveBeenCalled();
      expect(mockCopilotState.addChatMessage).toHaveBeenCalled();
    });
  });

  describe('useStarterPrompt', () => {
    it('should apply starter prompt', () => {
      const starterPrompt = 'Create a component';
      component.useStarterPrompt(starterPrompt);
      
      expect(mockCopilotState.addChatMessage).toHaveBeenCalledWith({
        content: starterPrompt,
        sender: 'user',
        timestamp: jasmine.any(Date),
        type: 'prompt'
      });
    });
  });

  describe('clearHistory', () => {
    it('should clear chat history', () => {
      component.clearHistory();
      
      expect(mockCopilotState.chatMessages().length).toBe(0);
      expect(mockNotificationService.showInfo).toHaveBeenCalledWith('Chat history cleared');
    });
  });

  describe('copyGeneratedCode', () => {
    it('should copy code to clipboard', () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      component.generatedCode.set('test code');
      
      component.copyGeneratedCode();
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test code');
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith('Code copied to clipboard');
    });
  });

  describe('saveGeneratedCode', () => {
    it('should save generated code', () => {
      component.generatedCode.set('test code');
      
      component.saveGeneratedCode();
      
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith('Code saved successfully');
    });
  });

  describe('preview panel methods', () => {
    it('should open preview panel', () => {
      component.openPreviewPanel();
      expect(component.showPreviewPanel()).toBe(true);
    });

    it('should toggle preview panel', () => {
      component.showPreviewPanel.set(false);
      component.togglePreviewPanel();
      expect(component.showPreviewPanel()).toBe(true);
      
      component.togglePreviewPanel();
      expect(component.showPreviewPanel()).toBe(false);
    });

    it('should close preview panel', () => {
      component.showPreviewPanel.set(true);
      component.closePreviewPanel();
      expect(component.showPreviewPanel()).toBe(false);
    });
  });

  describe('chat features', () => {
    it('should filter messages correctly', () => {
      component.chatSearchQuery = 'test';
      const messages = component.filteredMessages();
      expect(messages).toBeDefined();
    });

    it('should toggle message favorite', () => {
      const message = { id: '1', content: 'test', sender: 'user', timestamp: new Date(), type: 'prompt' };
      component.toggleMessageFavorite(message);
      
      const favorites = component.favoriteMessages();
      expect(favorites.some(f => f.id === '1')).toBe(true);
    });

    it('should copy message', () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      const message = { id: '1', content: 'test', sender: 'user', timestamp: new Date(), type: 'prompt' };
      
      component.copyMessage(message);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test');
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith('Message copied to clipboard');
    });

    it('should export chat as markdown', () => {
      spyOn(component, 'exportChatAsMarkdown');
      component.exportChatAsMarkdown();
      expect(component.exportChatAsMarkdown).toHaveBeenCalled();
    });

    it('should export chat as JSON', () => {
      spyOn(component, 'exportChatAsJSON');
      component.exportChatAsJSON();
      expect(component.exportChatAsJSON).toHaveBeenCalled();
    });

    it('should export chat as PDF', () => {
      spyOn(component, 'exportChatAsPDF');
      component.exportChatAsPDF();
      expect(component.exportChatAsPDF).toHaveBeenCalled();
    });

    it('should share chat', () => {
      spyOn(component, 'shareChat');
      component.shareChat();
      expect(component.shareChat).toHaveBeenCalled();
    });

    it('should edit message', () => {
      const message = { id: '1', content: 'test', sender: 'user', timestamp: new Date(), type: 'prompt' };
      component.editMessage(message);
      
      expect(message.content).toBe('test');
    });

    it('should reply to message', () => {
      const message = { id: '1', content: 'test', sender: 'user', timestamp: new Date(), type: 'prompt' };
      component.replyToMessage(message);
      
      expect(mockCopilotState.addChatMessage).toHaveBeenCalled();
    });

    it('should delete message', () => {
      const message = { id: '1', content: 'test', sender: 'user', timestamp: new Date(), type: 'prompt' };
      component.deleteMessage(message);
      
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith('Message deleted');
    });
  });

  describe('keyboard shortcuts', () => {
    it('should setup keyboard shortcuts', () => {
      component.setupKeyboardShortcuts();
      
      expect(mockKeyboardShortcuts.registerShortcut).toHaveBeenCalledWith('ctrl+/', 'Show shortcuts help');
      expect(mockKeyboardShortcuts.registerShortcut).toHaveBeenCalledWith('ctrl+k', 'Focus chat search');
      expect(mockKeyboardShortcuts.registerShortcut).toHaveBeenCalledWith('ctrl+l', 'Clear chat history');
    });

    it('should show shortcuts help', () => {
      component.showShortcutsHelp();
      expect(mockKeyboardShortcuts.showShortcutsHelp).toHaveBeenCalled();
    });

    it('should focus chat search', () => {
      spyOn(component, 'focusChatSearch');
      component.focusChatSearch();
      expect(component.focusChatSearch).toHaveBeenCalled();
    });
  });

  describe('utility methods', () => {
    it('should get loader type based on current step', () => {
      mockCopilotState.currentStep.and.returnValue('generating');
      const loaderType = component.getLoaderType();
      expect(loaderType).toBe('generating');
    });

    it('should track message by id', () => {
      const message = { id: '1', content: 'test', sender: 'user', timestamp: new Date(), type: 'prompt' };
      const trackBy = component.trackMessage(0, message);
      expect(trackBy).toBe('1');
    });

    it('should handle preview code change', () => {
      const event = { type: 'typescript', code: 'new code' };
      component.lastAIResponse.set(mockAIResponse);
      
      component.onPreviewCodeChange(event);
      
      expect(component.generatedCode()).toBe('new code');
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', fakeAsync(() => {
      const error = new Error('Network error');
      mockAIPromptService.sendPrompt.and.returnValue(throwError(() => error));
      
      component.handlePromptSent('test');
      tick();
      
      expect(mockNotificationService.showError).toHaveBeenCalledWith('Failed to send prompt. Please try again.');
    }));

    it('should handle clipboard errors', async () => {
      const error = new Error('Clipboard error');
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject(error));
      component.generatedCode.set('test code');
      
      await component.copyGeneratedCode();
      
      expect(mockNotificationService.showError).toHaveBeenCalledWith('Failed to copy code to clipboard');
    });
  });

  describe('performance', () => {
    it('should use computed properties efficiently', () => {
      const startTime = performance.now();
      const messages = component.filteredMessages();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
      expect(messages).toBeDefined();
    });

    it('should handle large message lists', () => {
      const largeMessageList = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg${i}`,
        content: `Message ${i}`,
        sender: 'user',
        timestamp: new Date(),
        type: 'prompt'
      }));
      
      // Simulate large message list
      spyOnProperty(mockCopilotState, 'chatMessages').and.returnValue({ value: largeMessageList });
      
      const messages = component.filteredMessages();
      expect(messages.length).toBe(1000);
    });
  });
});
