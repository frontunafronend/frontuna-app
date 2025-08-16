export interface Plugin {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  category: PluginCategory;
  type: PluginType;
  status: PluginStatus;
  permissions: PluginPermission[];
  configuration: PluginConfig;
  dependencies: string[];
  files: PluginFile[];
  icon?: string;
  screenshots?: string[];
  documentation?: string;
  repository?: string;
  homepage?: string;
  license: string;
  keywords: string[];
  downloads: number;
  rating: number;
  reviews: PluginReview[];
  isOfficial: boolean;
  isVerified: boolean;
  publishedAt: Date;
  updatedAt: Date;
}

export type PluginCategory = 
  | 'code-generation'
  | 'ui-enhancement'
  | 'development-tools'
  | 'integrations'
  | 'themes'
  | 'templates'
  | 'analytics'
  | 'productivity'
  | 'testing'
  | 'deployment'
  | 'other';

export type PluginType = 
  | 'component'
  | 'service'
  | 'theme'
  | 'template'
  | 'tool'
  | 'integration'
  | 'extension';

export type PluginStatus = 
  | 'active'
  | 'inactive'
  | 'installing'
  | 'updating'
  | 'error'
  | 'pending-approval';

export interface PluginPermission {
  type: 'read-files' | 'write-files' | 'network-access' | 'system-info' | 'user-data';
  description: string;
  required: boolean;
}

export interface PluginConfig {
  settings: PluginSetting[];
  hooks: PluginHook[];
  commands: PluginCommand[];
  shortcuts?: PluginShortcut[];
}

export interface PluginSetting {
  key: string;
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'file';
  defaultValue: any;
  options?: { label: string; value: any }[];
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface PluginHook {
  event: string;
  handler: string;
  priority?: number;
  conditions?: Record<string, any>;
}

export interface PluginCommand {
  id: string;
  name: string;
  description: string;
  handler: string;
  parameters?: PluginParameter[];
}

export interface PluginParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface PluginShortcut {
  key: string;
  commandId: string;
  description: string;
}

export interface PluginFile {
  path: string;
  content: string;
  type: 'javascript' | 'typescript' | 'css' | 'html' | 'json' | 'other';
  size: number;
  checksum: string;
}

export interface PluginReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: number;
}

export interface PluginInstallation {
  pluginId: string;
  userId: string;
  version: string;
  status: PluginStatus;
  settings: Record<string, any>;
  installedAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

export interface PluginMarketplace {
  featured: Plugin[];
  popular: Plugin[];
  recent: Plugin[];
  categories: PluginCategoryInfo[];
  totalPlugins: number;
}

export interface PluginCategoryInfo {
  category: PluginCategory;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface PluginDevelopment {
  id: string;
  name: string;
  status: 'draft' | 'testing' | 'review' | 'published';
  files: PluginFile[];
  testResults?: PluginTestResult[];
  manifest: PluginManifest;
  createdAt: Date;
  updatedAt: Date;
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  main: string;
  permissions: PluginPermission[];
  dependencies: Record<string, string>;
  engines: {
    frontuna: string;
    node?: string;
  };
}

export interface PluginTestResult {
  test: string;
  status: 'passed' | 'failed' | 'skipped';
  message?: string;
  duration: number;
  timestamp: Date;
}

export interface PluginAPI {
  version: string;
  methods: PluginAPIMethod[];
  events: PluginAPIEvent[];
}

export interface PluginAPIMethod {
  name: string;
  description: string;
  parameters: PluginParameter[];
  returnType: string;
  example: string;
}

export interface PluginAPIEvent {
  name: string;
  description: string;
  payload: Record<string, any>;
  example: string;
}