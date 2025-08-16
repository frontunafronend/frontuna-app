import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AIPrompt, AIResponse, AISuggestion, AIModel } from '@app/models/ai.model';
import { AIPromptCoreService } from './ai-prompt-core.service';
import { AICodeGeneratorService, CodeGenerationRequest, GeneratedCode, ComponentProp } from './ai-code-generator.service';

/**
 * Main AI Prompt Service - Facade for AI functionality
 * 
 * This service provides a unified interface for all AI-related operations
 * while delegating to specialized services for actual implementation.
 */
@Injectable({
  providedIn: 'root'
})
export class AIPromptService {
  private readonly aiPromptCore = inject(AIPromptCoreService);
  private readonly aiCodeGenerator = inject(AICodeGeneratorService);

  // Expose core service observables
  public readonly promptHistory$ = this.aiPromptCore.promptHistory$;
  public readonly suggestions$ = this.aiPromptCore.suggestions$;
  public readonly isProcessing = this.aiPromptCore.isProcessing;
  public readonly currentModel = this.aiPromptCore.currentModel;

  /**
   * Send prompt to AI and get response
   */
  sendPrompt(
    content: string,
    type: 'generate' | 'modify' | 'refactor' | 'optimize' = 'generate',
    context?: string
  ): Observable<AIResponse> {
    return this.aiPromptCore.sendPrompt(content, type, context);
  }

  /**
   * Get AI suggestions for code at cursor position
   */
  getSuggestions(code: string, cursor?: { line: number; column: number }): Observable<AISuggestion[]> {
    return this.aiPromptCore.getSuggestions(code, cursor);
  }

  /**
   * Get available AI models
   */
  getAvailableModels(): Observable<AIModel[]> {
    return this.aiPromptCore.getAvailableModels();
  }

  /**
   * Set current AI model
   */
  setCurrentModel(model: AIModel): void {
    this.aiPromptCore.setCurrentModel(model);
  }

  /**
   * Clear prompt history
   */
  clearHistory(): void {
    this.aiPromptCore.clearHistory();
  }

  /**
   * Get prompt history
   */
  getPromptHistory(): Observable<AIPrompt[]> {
    return this.aiPromptCore.getPromptHistory();
  }

  // Code Generation Methods (delegated to AICodeGeneratorService)

  /**
   * Generate code based on request
   */
  generateCode(request: CodeGenerationRequest): Observable<GeneratedCode> {
    return this.aiCodeGenerator.generateCode(request);
  }

  /**
   * Generate component code
   */
  generateComponent(
    name: string,
    framework: string,
    features: string[],
    props?: ComponentProp[]
  ): Observable<GeneratedCode> {
    return this.aiCodeGenerator.generateComponent(name, framework, features, props);
  }

  /**
   * Generate service code
   */
  generateService(
    name: string,
    framework: string,
    methods: string[]
  ): Observable<GeneratedCode> {
    return this.aiCodeGenerator.generateService(name, framework, methods);
  }

  // Quick helper methods for common operations

  /**
   * Quick component generation with common patterns
   */
  quickGenerateComponent(
    name: string,
    type: 'card' | 'form' | 'table' | 'modal' | 'button' | 'navigation' = 'card',
    framework: 'angular' | 'react' | 'vue' | 'svelte' = 'angular'
  ): Observable<GeneratedCode> {
    const featureMap: Record<string, string[]> = {
      card: ['display', 'styling', 'responsive'],
      form: ['form', 'validation', 'submit'],
      table: ['list', 'sorting', 'pagination'],
      modal: ['overlay', 'close', 'animation'],
      button: ['button', 'click', 'variants'],
      navigation: ['menu', 'routing', 'responsive']
    };

    return this.generateComponent(name, framework, featureMap[type]);
  }

  /**
   * Generate component from natural language description
   */
  generateFromDescription(
    description: string,
    framework: 'angular' | 'react' | 'vue' | 'svelte' = 'angular'
  ): Observable<GeneratedCode> {
    // This would use AI to parse the description and generate appropriate code
    const prompt = `Create a ${framework} component based on this description: ${description}

Please analyze the description and create a component with appropriate:
- Props/inputs
- Features and functionality
- Styling
- Event handlers
- Accessibility features

Return the component code with proper structure and best practices.`;

    return this.sendPrompt(prompt, 'generate', `framework:${framework}`) as any;
    // Note: In a real implementation, this would need proper response transformation
  }

  /**
   * Optimize existing component code
   */
  optimizeComponent(
    code: string,
    framework: string,
    optimizations: string[] = ['performance', 'accessibility', 'best-practices']
  ): Observable<AIResponse> {
    const prompt = `Optimize this ${framework} component code for: ${optimizations.join(', ')}

Original code:
\`\`\`${framework}
${code}
\`\`\`

Please provide:
1. Optimized code
2. Explanation of changes made
3. Performance improvements
4. Best practices applied`;

    return this.sendPrompt(prompt, 'optimize', `framework:${framework}`);
  }

  /**
   * Refactor component to different framework
   */
  refactorToFramework(
    code: string,
    fromFramework: string,
    toFramework: string
  ): Observable<AIResponse> {
    const prompt = `Convert this ${fromFramework} component to ${toFramework}:

\`\`\`${fromFramework}
${code}
\`\`\`

Please:
1. Maintain the same functionality
2. Use ${toFramework} best practices
3. Update syntax and patterns appropriately
4. Preserve styling and behavior`;

    return this.sendPrompt(prompt, 'refactor', `from:${fromFramework},to:${toFramework}`);
  }

  /**
   * Get code review and suggestions
   */
  reviewCode(
    code: string,
    framework: string,
    focusAreas: string[] = ['security', 'performance', 'maintainability']
  ): Observable<AIResponse> {
    const prompt = `Review this ${framework} code focusing on: ${focusAreas.join(', ')}

\`\`\`${framework}
${code}
\`\`\`

Please provide:
1. Overall code quality assessment
2. Specific issues found
3. Improvement suggestions
4. Best practice recommendations
5. Security considerations`;

    return this.sendPrompt(prompt, 'modify', `framework:${framework},review:${focusAreas.join(',')}`);
  }

  /**
   * Generate unit tests for component
   */
  generateTests(
    code: string,
    framework: string,
    testType: 'unit' | 'integration' | 'e2e' = 'unit'
  ): Observable<AIResponse> {
    const prompt = `Generate ${testType} tests for this ${framework} component:

\`\`\`${framework}
${code}
\`\`\`

Please create comprehensive tests that cover:
1. Component rendering
2. Props/inputs
3. Event handling
4. Edge cases
5. Accessibility
6. User interactions

Use appropriate testing framework for ${framework}.`;

    return this.sendPrompt(prompt, 'generate', `framework:${framework},testType:${testType}`);
  }

  /**
   * Generate documentation for component
   */
  generateDocumentation(
    code: string,
    framework: string,
    includeStorybook: boolean = true
  ): Observable<AIResponse> {
    const prompt = `Generate documentation for this ${framework} component:

\`\`\`${framework}
${code}
\`\`\`

Please create:
1. README with usage instructions
2. Props/API documentation
3. Examples
${includeStorybook ? '4. Storybook stories' : ''}
4. Installation guide
5. Customization options`;

    return this.sendPrompt(prompt, 'generate', `framework:${framework},docs:true,storybook:${includeStorybook}`);
  }

  /**
   * Suggest improvements for existing code
   */
  suggestImprovements(code: string, framework: string): Observable<AISuggestion[]> {
    return this.getSuggestions(code);
  }

  /**
   * Get AI capabilities for current model
   */
  getCurrentCapabilities(): string[] {
    const model = this.currentModel();
    return model?.capabilities || [];
  }

  /**
   * Check if AI can perform specific task
   */
  canPerformTask(task: string): boolean {
    const capabilities = this.getCurrentCapabilities();
    const taskMap: Record<string, string[]> = {
      'code-generation': ['code-generation', 'generation'],
      'code-review': ['code-review', 'review', 'analysis'],
      'optimization': ['optimization', 'performance'],
      'refactoring': ['refactoring', 'transformation'],
      'testing': ['testing', 'test-generation'],
      'documentation': ['documentation', 'docs']
    };

    const requiredCapabilities = taskMap[task] || [task];
    return requiredCapabilities.some(cap => capabilities.includes(cap));
  }
}