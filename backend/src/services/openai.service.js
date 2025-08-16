const OpenAI = require('openai');
const { createLogger, logAIEvent } = require('../utils/logger');

const logger = createLogger('openai-service');

// Initialize OpenAI client lazily
let openai = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
  }
  
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    });
  }
  
  return openai;
}

/**
 * Generate component code using OpenAI
 */
exports.generateComponent = async (params) => {
  try {
    const { prompt, framework, category, style, options, designFramework = 'plain' } = params;
    
    const openaiClient = getOpenAIClient();

    // Build the system prompt based on framework and options
    const systemPrompt = buildSystemPrompt(framework, category, style, options, designFramework);
    
    // Build the user prompt
    const userPrompt = buildUserPrompt(prompt, framework, options, designFramework);

    logAIEvent('component_generation_started', {
      framework,
      category,
      promptLength: prompt.length,
      options
    });

    const startTime = Date.now();

    // Call OpenAI API
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4', // TODO: Make this configurable
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated from OpenAI');
    }

    // Parse the generated content
    const parsedResult = parseGeneratedContent(generatedContent, framework);
    
    // Add design dependencies based on designFramework
    const designDependencies = generateDesignDependencies(designFramework);

    logAIEvent('component_generation_completed', {
      framework,
      category,
      designFramework,
      generationTime,
      tokensUsed: completion.usage?.total_tokens,
      success: true
    });

    return {
      ...parsedResult,
      designFramework,
      designDependencies,
      metadata: {
        generationTime,
        tokensUsed: completion.usage?.total_tokens,
        model: 'gpt-4',
        completionId: completion.id
      }
    };

  } catch (error) {
    logAIEvent('component_generation_failed', {
      framework,
      category,
      error: error.message
    });

    logger.error('OpenAI generation error:', error);
    throw new Error(`Component generation failed: ${error.message}`);
  }
};

/**
 * Build system prompt based on framework and options
 */
function buildSystemPrompt(framework, category, style, options, designFramework = 'plain') {
  let systemPrompt = `You are an expert frontend developer specializing in ${framework.toUpperCase()}. 
Generate clean, production-ready, accessible code for a \${category || 'component'} component.

IMPORTANT GUIDELINES:
- Write semantic, accessible HTML with proper ARIA attributes
- Use modern CSS with Flexbox/Grid for layouts
- Follow \${framework} best practices and conventions
- Include proper error handling and edge cases
- Write clean, readable, well-commented code
- Ensure responsive design (mobile-first approach)
  `;

  // Framework-specific instructions
  switch (framework) {
    case 'react':
      systemPrompt += `
- Use functional components with hooks
- Include PropTypes for type checking
- Handle loading and error states
- Use modern ES6+ syntax
- Include proper key props for lists
  `;
      break;
    case 'angular':
      systemPrompt += `
- Use Angular 17+ standalone components
- Include proper TypeScript typing
- Use Angular Material when appropriate
- Implement proper lifecycle hooks
- Include input validation
  `;
      break;
    case 'vue':
      systemPrompt += `
- Use Vue 3 Composition API
- Include proper template refs and reactive data
- Use Vue's built-in directives appropriately
- Include proper event handling
- Follow Vue 3 best practices
  `;
      break;
    case 'svelte':
      systemPrompt += `
- Use Svelte 4+ syntax
- Include proper reactive statements
- Use Svelte stores for state management when needed
- Include proper event dispatching
- Follow Svelte conventions
  `;
      break;
    case 'vanilla':
      systemPrompt += `
- Use modern JavaScript (ES6+)
- Include proper DOM manipulation
- Use modern APIs (fetch, etc.)
- Include proper event listeners cleanup
- Follow web standards
  `;
      break;
  }

  // Add design framework specific instructions
  systemPrompt += `\n\nDESIGN FRAMEWORK: ${designFramework.toUpperCase()}\n`;
  
  switch (designFramework) {
    case 'plain':
      systemPrompt += `
- Use clean, custom CSS without external frameworks
- Create modern, responsive layouts with Flexbox/Grid
- Use CSS custom properties for theming
- Focus on clean, minimal design patterns
- Avoid external dependencies
  `;
      break;
    case 'bootstrap':
      systemPrompt += `
- Use Bootstrap 5.3.0 utility classes and components
- Leverage Bootstrap's grid system (container, row, col)
- Use Bootstrap components (btn, card, navbar, modal, etc.)
- Apply Bootstrap color utilities (text-primary, bg-success, etc.)
- Include responsive Bootstrap classes (d-md-block, col-lg-6, etc.)
- Follow Bootstrap naming conventions and patterns
- Use Bootstrap form classes for inputs and validation
  `;
      break;
    case 'bootstrap-material':
      systemPrompt += `
- Combine Bootstrap 5.3.0 with Material Design principles
- Use Bootstrap grid and utilities as the foundation
- Apply Material Design elevation and shadows
- Use Material Icons (material-icons font family)
- Implement Material Design color palette
- Add Material Design ripple effects where appropriate
- Use Material Design typography (Roboto font)
- Apply Material Design button styles with Bootstrap base
- Include Material Design form field styling
  `;
      break;
  }

  // Add style preferences
  if (style) {
    systemPrompt += `
DESIGN STYLE:
- Theme: \${style.theme || 'modern'}
- Color Scheme: \${style.colorScheme || 'auto'}
  `;
    if (style.primaryColor) {
      systemPrompt += `- Primary Color: ${style.primaryColor}\n`;
    }
  }

  // Add option-specific instructions
  if (options) {
    if (options.responsive) {
      systemPrompt += `- Ensure full responsive design with mobile-first approach\n`;
    }
    if (options.accessibility) {
      systemPrompt += `- Include comprehensive accessibility features (WCAG 2.1 AA)\n`;
    }
    if (options.darkMode) {
      systemPrompt += `- Include dark mode support with CSS custom properties\n`;
    }
    if (options.animations) {
      systemPrompt += `- Include smooth animations and transitions\n`;
    }
    if (options.typescript && framework !== 'vanilla') {
      systemPrompt += `- Use TypeScript with proper typing\n`;
    }
  }

  systemPrompt += `
OUTPUT FORMAT:
Provide the code in the following JSON structure:
{
  "html": "HTML structure with framework-specific classes",
  "css": "CSS styles (custom styles only, framework styles loaded via CDN)", 
  "javascript": "JavaScript code",
  "typescript": "TypeScript code (if applicable)",
  "dependencies": ["array", "of", "npm", "dependencies"],
  "description": "Brief description of the component",
  "usage": "How to use this component with framework setup",
  "props": [{"name": "propName", "type": "string", "description": "prop description", "required": true}],
  "features": ["list", "of", "key", "features"],
  "designFramework": "${designFramework}",
  "frameworkInstructions": "Specific instructions for using this component with the chosen design framework"
}
  `;

  return systemPrompt;
}

/**
 * Build user prompt
 */
function buildUserPrompt(prompt, framework, options, designFramework = 'plain') {
  let userPrompt = `Create a ${framework} component using ${getDesignFrameworkLabel(designFramework)}: ${prompt}`;

  if (options && Object.keys(options).length > 0) {
    userPrompt += `\n\nSpecific requirements:`;
    if (options.responsive) userPrompt += `\n- Must be fully responsive`;
    if (options.accessibility) userPrompt += `\n- Must be accessible (WCAG 2.1 AA)`;
    if (options.darkMode) userPrompt += `\n- Must support dark mode`;
    if (options.animations) userPrompt += `\n- Include smooth animations`;
    if (options.typescript) userPrompt += `\n- Use TypeScript`;
  }

  // Add framework-specific requirements
  userPrompt += `\n\nDesign Framework Requirements:`;
  switch (designFramework) {
    case 'plain':
      userPrompt += `\n- Use modern CSS with no external framework dependencies`;
      userPrompt += `\n- Create custom, clean styling`;
      break;
    case 'bootstrap':
      userPrompt += `\n- Use Bootstrap 5.3.0 classes and components`;
      userPrompt += `\n- Leverage Bootstrap utilities for responsive design`;
      userPrompt += `\n- Follow Bootstrap conventions`;
      break;
    case 'bootstrap-material':
      userPrompt += `\n- Combine Bootstrap 5.3.0 with Material Design principles`;
      userPrompt += `\n- Use Material Icons and typography`;
      userPrompt += `\n- Apply Material Design colors and elevation`;
      break;
  }

  return userPrompt;
}

/**
 * Parse the generated content from OpenAI
 */
function parseGeneratedContent(content, framework) {
  try {
    // Clean the content first - remove control characters and fix common issues
    let cleanContent = content
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/\n\s*\n/g, '\n') // Remove extra newlines
      .trim();

    // Try to extract JSON from the content
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      logger.warn('No JSON structure found, falling back to code block extraction');
      return extractCodeBlocks(cleanContent);
    }

    // Clean the JSON string further
    let jsonString = jsonMatch[0]
      .replace(/```[\w]*\n/g, '') // Remove code block markers
      .replace(/\n```/g, '') // Remove closing code block markers
      .replace(/`([^`]*)`/g, '"$1"') // Replace backticks with quotes
      .replace(/:\s*`([^`]*)`/g, ': "$1"') // Handle backticks in values
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":'); // Quote unquoted keys

    const parsed = JSON.parse(jsonString);

    // Validate required fields
    if (!parsed.html && !parsed.javascript && !parsed.typescript && !parsed.code) {
      logger.warn('Generated content missing required code sections, using fallback');
      return extractCodeBlocks(cleanContent);
    }

    return {
      html: parsed.html || parsed.code?.html || '',
      css: parsed.css || parsed.code?.css || '',
      javascript: parsed.javascript || parsed.code?.javascript || '',
      typescript: parsed.typescript || parsed.code?.typescript || '',
      dependencies: parsed.dependencies || [],
      description: parsed.description || 'Generated component',
      usage: parsed.usage || 'No usage instructions provided',
      props: parsed.props || [],
      features: parsed.features || [],
      designFramework: parsed.designFramework || 'plain',
      frameworkInstructions: parsed.frameworkInstructions || 'Standard usage instructions',
      explanation: parsed.explanation || parsed.description || 'Component generated successfully'
    };

  } catch (parseError) {
    logger.error('Failed to parse generated content:', parseError.message);
    return extractCodeBlocks(content);
  }
}

function extractCodeBlocks(content) {
  // Fallback: try to extract code blocks manually
  const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/) || 
                   content.match(/<[\s\S]*>/);
  const cssMatch = content.match(/```css\n([\s\S]*?)\n```/) || 
                  content.match(/```scss\n([\s\S]*?)\n```/);
  const jsMatch = content.match(/```javascript\n([\s\S]*?)\n```/) || 
                 content.match(/```js\n([\s\S]*?)\n```/);
  const tsMatch = content.match(/```typescript\n([\s\S]*?)\n```/) || 
                 content.match(/```ts\n([\s\S]*?)\n```/);

  return {
    html: htmlMatch ? htmlMatch[1] : '',
    css: cssMatch ? cssMatch[1] : '',
    javascript: jsMatch ? jsMatch[1] : '',
    typescript: tsMatch ? tsMatch[1] : '',
    dependencies: [],
    description: 'Generated component (parsed from code blocks)',
    usage: 'Please refer to the generated code for usage instructions',
    props: [],
    features: [],
    designFramework: 'plain',
    frameworkInstructions: 'Standard usage instructions',
    explanation: 'Component generated successfully'
  };
}

/**
 * Test OpenAI API connection
 */
exports.testConnection = async () => {
  try {
    const openaiClient = getOpenAIClient();
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Hello, can you respond with a simple "OK" message?'
        }
      ],
      max_tokens: 10
    });

    return {
      success: true,
      response: completion.choices[0]?.message?.content || 'No response',
      usage: completion.usage
    };

  } catch (error) {
    logger.error('OpenAI connection test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get available models
 */
exports.getAvailableModels = async () => {
  try {
    const models = await openai.models.list();
    return models.data
      .filter(model => model.id.includes('gpt'))
      .map(model => ({
        id: model.id,
        created: model.created,
        owned_by: model.owned_by
      }));
  } catch (error) {
    logger.error('Failed to get available models:', error);
    throw error;
  }
};

/**
 * Get design framework label
 */
function getDesignFrameworkLabel(designFramework) {
  const labels = {
    'plain': 'Plain CSS',
    'bootstrap': 'Bootstrap 5',
    'bootstrap-material': 'Bootstrap + Material Design'
  };
  return labels[designFramework] || 'Plain CSS';
}

/**
 * Generate design dependencies based on framework
 */
function generateDesignDependencies(designFramework) {
  const dependencies = {};

  switch (designFramework) {
    case 'bootstrap':
      dependencies.bootstrap = {
        version: '5.3.0',
        cdnUrl: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        integrity: 'sha384-9ndCyUa+IgAUC2M8W2RQGA9iJ6xgZZz8l5IgDKYo7Yxg8WfXVvdDvKhD2nYzg9fQ',
        required: true,
        type: 'css',
        description: 'Bootstrap CSS framework for responsive design and components'
      };
      dependencies.bootstrapJs = {
        version: '5.3.0',
        cdnUrl: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
        integrity: 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz',
        required: false,
        type: 'js',
        description: 'Bootstrap JavaScript bundle for interactive components'
      };
      break;

    case 'bootstrap-material':
      dependencies.bootstrap = {
        version: '5.3.0',
        cdnUrl: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        integrity: 'sha384-9ndCyUa+IgAUC2M8W2RQGA9iJ6xgZZz8l5IgDKYo7Yxg8WfXVvdDvKhD2nYzg9fQ',
        required: true,
        type: 'css',
        description: 'Bootstrap CSS framework'
      };
      dependencies.bootstrapJs = {
        version: '5.3.0',
        cdnUrl: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
        integrity: 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz',
        required: false,
        type: 'js',
        description: 'Bootstrap JavaScript bundle'
      };
      dependencies.materialIcons = {
        version: 'latest',
        cdnUrl: 'https://fonts.googleapis.com/icon?family=Material+Icons',
        required: true,
        type: 'css',
        description: 'Google Material Icons font'
      };
      dependencies.robotoFont = {
        version: 'latest',
        cdnUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
        required: true,
        type: 'css',
        description: 'Roboto font family for Material Design typography'
      };
      break;

    case 'plain':
    default:
      // No external dependencies for plain CSS
      break;
  }

  return dependencies;
}