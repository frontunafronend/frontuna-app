/**
 * OpenAI Engine for Component Generation
 * Handles all AI interactions with precise prompting
 */

const OpenAI = require('openai');
const { createLogger } = require('../../utils/logger');

const logger = createLogger('openai-engine');

class OpenAIEngine {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.model = 'gpt-4';
    this.maxTokens = 4000;
    this.temperature = 0.3; // Lower temperature for more consistent code
    
    logger.info('🤖 OpenAI Engine initialized');
  }

  /**
   * Generate component using OpenAI
   */
  async generate(request) {
    try {
      const prompt = this.buildPrompt(request);
      
      logger.info('🎯 Sending request to OpenAI', { 
        framework: request.framework,
        promptLength: prompt.length 
      });

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(request.framework)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });

      const result = this.parseResponse(response, request);
      
      logger.info('✅ OpenAI generation completed', { 
        tokensUsed: response.usage?.total_tokens || 0,
        model: response.model
      });

      return result;

    } catch (error) {
      logger.error('❌ OpenAI generation failed', { 
        error: error.message,
        framework: request.framework
      });
      
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Build comprehensive prompt for generation
   */
  buildPrompt(request) {
    const { prompt, framework, category, options, designFramework = 'plain' } = request;

    return `Generate a ${framework} component using ${this.getDesignFrameworkLabel(designFramework)} with the following requirements:

COMPONENT REQUEST:
${prompt}

SPECIFICATIONS:
- Framework: ${framework.toUpperCase()}
- Design Framework: ${designFramework.toUpperCase()}
- Category: ${category || 'custom'}
- Responsive: ${options.responsive ? 'Yes' : 'No'}
- Accessibility: ${options.accessibility ? 'Yes' : 'No'}
- TypeScript: ${options.typescript ? 'Yes' : 'No'}

DESIGN FRAMEWORK REQUIREMENTS:
${this.getDesignFrameworkInstructions(designFramework)}

REQUIREMENTS:
1. Generate clean, production-ready code
2. Follow ${framework} best practices and conventions
3. Include proper error handling
4. Add comprehensive comments
5. Ensure responsive design
6. Include accessibility features (ARIA labels, semantic HTML)
7. Use modern ${framework} features
8. Optimize for performance

RESPONSE FORMAT:
Provide the response as a JSON object with this exact structure:
{
  "name": "ComponentName",
  "description": "Brief description of what this component does",
  "code": {
    "html": "HTML template code with framework-specific classes",
    "css": "CSS styles (custom styles only, framework styles loaded via CDN)",
    "js": "JavaScript/TypeScript logic",
    "ts": "TypeScript definitions (if applicable)"
  },
  "dependencies": [],
  "props": [],
  "features": [],
  "usage": "Example of how to use this component with framework setup",
  "designFramework": "${designFramework}",
  "frameworkInstructions": "Specific instructions for using this component with the chosen design framework"
}

Generate the component now:`;
  }

  /**
   * Get system prompt for specific framework
   */
  getSystemPrompt(framework) {
    const basePrompt = `You are an expert ${framework} developer and component architect. You specialize in creating high-quality, reusable components that follow best practices.

Your expertise includes:
- Modern ${framework} patterns and conventions
- Responsive design and mobile-first development
- Accessibility standards (WCAG 2.1)
- Performance optimization
- Clean, maintainable code architecture
- Cross-browser compatibility
- Component testing strategies

Always generate production-ready code that is:
- Well-structured and organized
- Properly commented and documented
- Accessible and inclusive
- Responsive and mobile-friendly
- Performant and optimized
- Following latest ${framework} best practices`;

    const frameworkSpecific = {
      react: `
Additional React expertise:
- Functional components with hooks
- Modern state management (useState, useEffect, useContext)
- Component composition patterns
- Performance optimization (useMemo, useCallback)
- TypeScript integration
- Modern CSS-in-JS solutions
- React 18+ features`,

      angular: `
Additional Angular expertise:
- Component-based architecture
- Reactive forms and template-driven forms
- RxJS and observables
- Angular Material integration
- Angular CLI best practices
- TypeScript-first development
- Angular 15+ features
- Standalone components`,

      vue: `
Additional Vue expertise:
- Composition API and Options API
- Vue 3+ features
- Single File Components (SFC)
- Reactive data and computed properties
- Vue ecosystem (Vuex/Pinia, Vue Router)
- TypeScript integration
- Performance optimization`,

      svelte: `
Additional Svelte expertise:
- Svelte 4+ features
- Reactive statements and stores
- Component slots and props
- SvelteKit integration
- Animation and transitions
- Compile-time optimizations`,

      vanilla: `
Additional Vanilla JS expertise:
- Modern ES6+ features
- Web Components standards
- Custom Elements and Shadow DOM
- Module systems (ES6 imports/exports)
- Modern CSS (Grid, Flexbox, Custom Properties)
- Progressive enhancement`
    };

    return basePrompt + (frameworkSpecific[framework] || '');
  }

  /**
   * Parse OpenAI response
   */
  parseResponse(response, request) {
    try {
      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // Extract JSON from response
      let jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Fallback: try to parse entire content as JSON
        jsonMatch = [content];
      }

      const parsedComponent = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsedComponent.name || !parsedComponent.code) {
        throw new Error('Invalid component structure from AI');
      }

      return {
        ...parsedComponent,
        metadata: {
          model: response.model,
          tokensUsed: response.usage?.total_tokens || 0,
          finishReason: response.choices[0]?.finish_reason,
          framework: request.framework,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('❌ Failed to parse OpenAI response', { 
        error: error.message,
        response: response.choices[0]?.message?.content?.substring(0, 200) + '...'
      });
      
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      model: this.model,
      status: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      maxTokens: this.maxTokens,
      temperature: this.temperature
    };
  }

  /**
   * Get design framework label
   */
  getDesignFrameworkLabel(designFramework) {
    const labels = {
      'plain': 'Plain CSS',
      'bootstrap': 'Bootstrap 5',
      'bootstrap-material': 'Bootstrap + Material Design'
    };
    return labels[designFramework] || 'Plain CSS';
  }

  /**
   * Get design framework specific instructions
   */
  getDesignFrameworkInstructions(designFramework) {
    switch (designFramework) {
      case 'plain':
        return `
- Use clean, custom CSS without external frameworks
- Create modern, responsive layouts with Flexbox/Grid
- Use CSS custom properties for theming
- Focus on clean, minimal design patterns
- Avoid external dependencies`;

      case 'bootstrap':
        return `
- Use Bootstrap 5.3.0 utility classes and components
- Leverage Bootstrap's grid system (container, row, col)
- Use Bootstrap components (btn, card, navbar, modal, etc.)
- Apply Bootstrap color utilities (text-primary, bg-success, etc.)
- Include responsive Bootstrap classes (d-md-block, col-lg-6, etc.)
- Follow Bootstrap naming conventions and patterns
- Use Bootstrap form classes for inputs and validation`;

      case 'bootstrap-material':
        return `
- Combine Bootstrap 5.3.0 with Material Design principles
- Use Bootstrap grid and utilities as the foundation
- Apply Material Design elevation and shadows
- Use Material Icons (material-icons font family)
- Implement Material Design color palette
- Add Material Design ripple effects where appropriate
- Use Material Design typography (Roboto font)
- Apply Material Design button styles with Bootstrap base
- Include Material Design form field styling`;

      default:
        return 'Follow standard web development practices';
    }
  }
}

module.exports = OpenAIEngine;