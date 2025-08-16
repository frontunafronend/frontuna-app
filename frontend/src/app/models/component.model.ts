export interface GenerationRequest {
  prompt: string;
  framework: string;
  category?: string;
  styleTheme?: string;
  designFramework?: 'plain' | 'bootstrap' | 'bootstrap-material';
  options?: {
    responsive?: boolean;
    accessibility?: boolean;
    darkMode?: boolean;
    animations?: boolean;
    typescript?: boolean;
    tests?: boolean;
    includeBootstrap?: boolean;
    includeMaterialDesign?: boolean;
  };
}

export interface GenerationResponse {
  success: boolean;
  data?: {
    component: GeneratedComponent;
    usage?: {
      generationsRemaining: number;
      resetDate: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

export interface GeneratedComponent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  framework: string;
  category: string;
  styleTheme: string;
  designFramework: 'plain' | 'bootstrap' | 'bootstrap-material';
  code: {
    html: string;
    css: string;
    javascript: string;
    typescript: string;
  };
  dependencies: string[];
  designDependencies: {
    bootstrap?: {
      version: string;
      cdnUrl: string;
      required: boolean;
    };
    materialDesign?: {
      version: string;
      cdnUrl: string;
      required: boolean;
    };
  };
  props: ComponentProp[];
  features: string[];
  usage: string;
  options: {
    responsive: boolean;
    accessibility: boolean;
    darkMode: boolean;
    animations: boolean;
    typescript: boolean;
    tests: boolean;
    includeBootstrap: boolean;
    includeMaterialDesign: boolean;
  };
  preview?: string;
  previewWithDesign?: string;
  generationMetadata: {
    model: string;
    tokensUsed: number;
    generationTime: number;
    completionId: string;
    temperature: number;
  };
  status: 'generated' | 'saved' | 'published' | 'archived';
  isPublic: boolean;
  isSaved: boolean;
  tags: string[];
  views: number;
  likes: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

export interface ComponentHistory {
  data: ComponentHistoryItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ComponentHistoryItem {
  id: string;
  name: string;
  description: string;
  framework: string;
  category: string;
  status: string;
  isSaved: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  downloads: number;
}

export interface UsageStats {
  generations: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
  storage: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
  plan: string;
  status: string;
  lastReset: string;
}

export const FRAMEWORKS = {
  REACT: 'react',
  ANGULAR: 'angular',
  VUE: 'vue',
  SVELTE: 'svelte',
  VANILLA: 'vanilla'
} as const;

export const COMPONENT_CATEGORIES = {
  LAYOUT: 'layout',
  NAVIGATION: 'navigation',
  FORM: 'form',
  CARD: 'card',
  BUTTON: 'button',
  MODAL: 'modal',
  TABLE: 'table',
  CHART: 'chart',
  CUSTOM: 'custom'
} as const;

export const STYLE_THEMES = {
  MODERN: 'modern',
  CLASSIC: 'classic',
  MINIMAL: 'minimal',
  COLORFUL: 'colorful',
  CORPORATE: 'corporate'
} as const;

export const COMPONENT_STATUS = {
  GENERATED: 'generated',
  SAVED: 'saved',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const;

export interface ComponentLibraryFilter {
  framework?: string;
  category?: string;
  complexity?: 'simple' | 'medium' | 'complex';
  search?: string;
  tags?: string[];
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'downloads';
  sortOrder?: 'asc' | 'desc';
}

export interface ComponentExport {
  id: string;
  name: string;
  format: 'zip' | 'json' | 'html' | 'css' | 'js' | 'ts';
  url?: string;
  blob?: Blob;
  size?: number;
  createdAt: string;
}