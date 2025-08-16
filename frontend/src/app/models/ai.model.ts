export interface AIPrompt {
  id: string;
  content: string;
  type: 'generate' | 'modify' | 'refactor' | 'optimize';
  context?: string;
  timestamp: Date;
  userId: string;
  model?: string;
}

export interface AIResponse {
  id: string;
  promptId: string;
  content: string;
  code?: string;
  suggestions?: AISuggestion[];
  confidence: number;
  processingTime: number;
  model?: string;
  timestamp: Date;
  metadata?: {
    tokensUsed?: number;
    estimatedCost?: number;
  };
}

export interface AITransformation {
  id: string;
  sourceCode: string;
  targetCode: string;
  transformationType: 'refactor' | 'optimize' | 'convert' | 'enhance';
  framework: 'angular' | 'react' | 'vue' | 'svelte';
  changes: AIChange[];
  timestamp: Date;
}

export interface AIChange {
  type: 'addition' | 'deletion' | 'modification';
  line: number;
  content: string;
  reason?: string;
}

export interface AICopilot {
  isActive: boolean;
  currentContext: string;
  suggestions: AISuggestion[];
  history: AIPrompt[];
}

export interface AISuggestion {
  id: string;
  type: 'completion' | 'improvement' | 'fix' | 'feature' | 'refactor' | 'optimization' | 'security' | 'testing';
  title?: string;
  content?: string;
  description: string;
  code?: string | Record<string, string>; // Support multiple languages
  confidence: number;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  explanation?: string;
  benefits?: string[];
  implementationSteps?: string[];
  bestPractices?: string[];
  testingInstructions?: string;
  estimatedTime?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  relatedSuggestions?: string[];
  version?: string;
  lastModified?: Date;
  usageCount?: number;
  rating?: number;
  feedback?: AIFeedback[];
}

export interface AIFeedback {
  id: string;
  userId: string;
  rating: number;
  comment?: string;
  timestamp: Date;
  helpful: boolean;
}

export interface AICodeEdit {
  id: string;
  suggestionId: string;
  originalCode: string;
  editedCode: string;
  language: string;
  changes: CodeChange[];
  timestamp: Date;
  userId: string;
  status: 'draft' | 'reviewed' | 'approved' | 'applied';
}

export interface CodeChange {
  type: 'insert' | 'delete' | 'replace' | 'move';
  lineStart: number;
  lineEnd: number;
  content: string;
  oldContent?: string;
  description: string;
}

export interface AITestingResult {
  id: string;
  suggestionId: string;
  testType: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  status: 'passed' | 'failed' | 'warning' | 'error';
  message: string;
  details?: string;
  executionTime?: number;
  timestamp: Date;
  testOutput?: string;
  errorLog?: string;
}

export interface AICodeValidation {
  id: string;
  suggestionId: string;
  language: string;
  syntaxValid: boolean;
  lintingResults: LintingResult[];
  securityIssues: SecurityIssue[];
  performanceIssues: PerformanceIssue[];
  bestPracticeViolations: BestPracticeViolation[];
  timestamp: Date;
}

export interface LintingResult {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column: number;
  fixable: boolean;
  suggestedFix?: string;
}

export interface SecurityIssue {
  type: 'vulnerability' | 'weakness' | 'misconfiguration';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  cwe?: string;
  recommendation: string;
  line?: number;
}

export interface PerformanceIssue {
  type: 'memory' | 'cpu' | 'network' | 'database';
  severity: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  recommendation: string;
  line?: number;
}

export interface BestPracticeViolation {
  rule: string;
  description: string;
  impact: string;
  recommendation: string;
  line?: number;
  examples?: string[];
}

export interface AISolutionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  languages: string[];
  template: Record<string, string>;
  variables: TemplateVariable[];
  examples: TemplateExample[];
  tags: string[];
  rating: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: string;
}

export interface TemplateExample {
  name: string;
  description: string;
  variables: Record<string, any>;
  output: Record<string, string>;
}

export interface AIModel {
  id: string;
  name: string;
  description?: string;
  provider?: 'openai' | 'anthropic' | 'local';
  version?: string;
  capabilities: string[];
  maxTokens?: number;
  costPerToken?: number;
  isAvailable: boolean;
}

export type AICapability = 'code-generation' | 'code-review' | 'refactoring' | 'documentation' | 'testing' | 'optimization';

export interface AIDiff {
  id: string;
  originalCode: string;
  modifiedCode: string;
  changes: DiffChange[];
  summary: string;
  timestamp: Date;
}

export interface DiffChange {
  type: 'add' | 'remove' | 'modify';
  lineNumber: number;
  content: string;
  oldContent?: string;
}

export type AITaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AITask {
  id: string;
  type: 'generate' | 'transform' | 'analyze' | 'optimize';
  status: AITaskStatus;
  prompt: string;
  result?: string;
  error?: string;
  progress: number;
  startTime: Date;
  endTime?: Date;
}

export interface ComponentVersion {
  id: string;
  componentId: string;
  version: string;
  name?: string;
  description?: string;
  code: {
    html: string;
    css: string;
    javascript: string;
    typescript: string;
  };
  changes: string[];
  author: {
    id: string;
    name: string;
    email: string;
  };
  status: 'draft' | 'reviewed' | 'approved' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface VersionComparison {
  id: string;
  fromVersion: ComponentVersion;
  toVersion: ComponentVersion;
  differences: VersionDifference[];
  summary: {
    totalChanges: number;
    additions: number;
    deletions: number;
    modifications: number;
    filesChanged: number;
    impactLevel: 'low' | 'medium' | 'high';
    breakingChanges: boolean;
  };
  createdAt: Date;
}

export interface VersionDifference {
  id: string;
  file: string;
  type: 'addition' | 'deletion' | 'modification';
  lineNumber?: number;
  oldContent?: string;
  newContent?: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  breaking: boolean;
}

export interface VersionBranch {
  id: string;
  name: string;
  type: 'main' | 'feature' | 'bugfix' | 'hotfix' | 'release';
  isActive: boolean;
  isProtected: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastCommit?: {
    id: string;
    message: string;
    author: string;
    timestamp: Date;
  };
  parentBranch?: string;
  mergeTarget?: string;
}