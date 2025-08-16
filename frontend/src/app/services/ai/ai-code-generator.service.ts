import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AIPromptCoreService } from './ai-prompt-core.service';

export interface CodeGenerationRequest {
  type: 'component' | 'service' | 'directive' | 'pipe' | 'guard' | 'interceptor';
  framework: 'angular' | 'react' | 'vue' | 'svelte';
  name: string;
  description: string;
  features: string[];
  styling: 'css' | 'scss' | 'styled-components' | 'tailwind';
  dependencies?: string[];
  props?: ComponentProp[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface GeneratedCode {
  id: string;
  name: string;
  framework: string;
  files: GeneratedFile[];
  dependencies: string[];
  instructions: string;
  timestamp: Date;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'style' | 'test' | 'story' | 'config';
  language: string;
}

@Injectable({
  providedIn: 'root'
})
export class AICodeGeneratorService {
  private readonly aiPromptCore = inject(AIPromptCoreService);

  /**
   * Generate code based on request
   */
  generateCode(request: CodeGenerationRequest): Observable<GeneratedCode> {
    console.log('🏗️ AI Code Generator: Generating code...', request);

    // Always use live backend - no mock data

    // Use the AI prompt service to generate code
    const prompt = this.buildPrompt(request);
    return this.aiPromptCore.sendPrompt(prompt, 'generate', JSON.stringify(request))
      .pipe(
        map(response => this.transformResponseToGeneratedCode(response, request))
      );
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
    
    const request: CodeGenerationRequest = {
      type: 'component',
      framework: framework as any,
      name,
      description: `Generated ${name} component`,
      features,
      styling: 'scss',
      props
    };

    return this.generateCode(request);
  }

  /**
   * Generate service code
   */
  generateService(
    name: string,
    framework: string,
    methods: string[]
  ): Observable<GeneratedCode> {
    const request: CodeGenerationRequest = {
      type: 'service',
      framework: framework as any,
      name,
      description: `Generated ${name} service`,
      features: methods,
      styling: 'css'
    };

    return this.generateCode(request);
  }

  /**
   * Build AI prompt from request
   */
  private buildPrompt(request: CodeGenerationRequest): string {
    let prompt = `Generate a ${request.framework} ${request.type} named "${request.name}".

Description: ${request.description}

Requirements:
${request.features.map(feature => `- ${feature}`).join('\n')}

Framework: ${request.framework}
Styling: ${request.styling}`;

    if (request.props && request.props.length > 0) {
      prompt += `\n\nProps/Inputs:
${request.props.map(prop => `- ${prop.name}: ${prop.type}${prop.required ? ' (required)' : ' (optional)'}`).join('\n')}`;
    }

    if (request.dependencies && request.dependencies.length > 0) {
      prompt += `\n\nDependencies: ${request.dependencies.join(', ')}`;
    }

    prompt += `\n\nPlease generate clean, production-ready code with proper TypeScript types, error handling, and best practices.`;

    return prompt;
  }

  /**
   * Transform AI response to GeneratedCode format
   */
  private transformResponseToGeneratedCode(response: any, request: CodeGenerationRequest): GeneratedCode {
    return {
      id: this.generateId(),
      name: request.name,
      framework: request.framework,
      files: [{
        path: `${request.name.toLowerCase()}.component.ts`,
        content: response.code || response.content || '// Generated code will appear here',
        type: 'component',
        language: request.framework === 'angular' ? 'typescript' : 'javascript'
      }],
      dependencies: request.dependencies || [],
      instructions: 'AI-generated component ready for use',
      timestamp: new Date()
    };
  }

  private generateId(): string {
    return 'gen_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
}