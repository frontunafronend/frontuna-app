export interface ScaffoldTemplate {
  id: string;
  name: string;
  description: string;
  category: ScaffoldCategory;
  framework: 'angular' | 'react' | 'vue' | 'svelte';
  type: 'component' | 'page' | 'service' | 'module' | 'full-app';
  files: ScaffoldFile[];
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
  configuration: ScaffoldConfig;
  preview?: string;
  tags: string[];
  author: string;
  version: string;
  isPublic: boolean;
  downloads: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScaffoldFile {
  path: string;
  content: string;
  type: 'typescript' | 'html' | 'scss' | 'css' | 'json' | 'markdown' | 'other';
  isTemplate: boolean;
  variables?: ScaffoldVariable[];
}

export interface ScaffoldVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  defaultValue?: any;
  required: boolean;
  options?: string[];
}

export interface ScaffoldConfig {
  routing?: boolean;
  testing?: boolean;
  styling?: 'css' | 'scss' | 'tailwind' | 'styled-components';
  stateManagement?: 'none' | 'rxjs' | 'ngrx' | 'redux' | 'vuex' | 'pinia';
  authentication?: boolean;
  internalization?: boolean;
  pwa?: boolean;
  ssr?: boolean;
  customOptions?: Record<string, any>;
}

export type ScaffoldCategory = 
  | 'basic'
  | 'forms'
  | 'data-display'
  | 'navigation'
  | 'layout'
  | 'feedback'
  | 'charts'
  | 'e-commerce'
  | 'dashboard'
  | 'auth'
  | 'cms'
  | 'portfolio'
  | 'blog'
  | 'landing-page'
  | 'admin'
  | 'custom';

export interface ScaffoldRequest {
  templateId: string;
  projectName: string;
  variables: Record<string, any>;
  configuration: ScaffoldConfig;
  outputPath?: string;
}

export interface ScaffoldResult {
  id: string;
  requestId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  files: GeneratedFile[];
  errors?: string[];
  warnings?: string[];
  progress: number;
  estimatedTime?: number;
  downloadUrl?: string;
  createdAt: Date;
}

export interface GeneratedFile {
  path: string;
  content: string;
  size: number;
  type: string;
  checksum?: string;
}

export interface ScaffoldHistory {
  id: string;
  userId: string;
  templateId: string;
  templateName: string;
  projectName: string;
  status: 'completed' | 'failed';
  filesGenerated: number;
  downloadUrl?: string;
  createdAt: Date;
}

export interface ScaffoldStats {
  totalTemplates: number;
  totalGenerations: number;
  popularTemplates: ScaffoldTemplate[];
  recentGenerations: ScaffoldHistory[];
  categoryCounts: Record<ScaffoldCategory, number>;
}