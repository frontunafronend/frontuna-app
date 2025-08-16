export interface PreviewConfig {
  id: string;
  framework: 'angular' | 'react' | 'vue' | 'svelte';
  theme: PreviewTheme;
  viewport: ViewportSize;
  zoom: number;
  showGrid: boolean;
  showRuler: boolean;
  showCode: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface PreviewTheme {
  id: string;
  name: string;
  type: 'light' | 'dark' | 'auto';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
  };
  spacing: {
    base: string;
    scale: number[];
  };
  borderRadius: string;
  shadows: string[];
}

export interface ViewportSize {
  id: string;
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'desktop' | 'custom';
  orientation?: 'portrait' | 'landscape';
}

export interface LivePreview {
  id: string;
  componentId: string;
  url: string;
  status: 'loading' | 'ready' | 'error';
  lastUpdated: Date;
  config: PreviewConfig;
  interactions: PreviewInteraction[];
}

export interface PreviewInteraction {
  type: 'click' | 'hover' | 'input' | 'scroll';
  element: string;
  timestamp: Date;
  data?: any;
}

export interface FrameworkPreview {
  framework: 'angular' | 'react' | 'vue' | 'svelte';
  code: string;
  compiledCode?: string;
  dependencies: string[];
  isCompiling: boolean;
  compileErrors?: CompileError[];
  preview?: string;
}

export interface CompileError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source: string;
}

export interface ExportOptions {
  format: 'zip' | 'codesandbox' | 'stackblitz' | 'github' | 'npm';
  includeTests: boolean;
  includeStories: boolean;
  includeDocs: boolean;
  framework: 'angular' | 'react' | 'vue' | 'svelte';
  buildTool: 'webpack' | 'vite' | 'angular-cli' | 'create-react-app';
  packageManager: 'npm' | 'yarn' | 'pnpm';
  typescript: boolean;
  eslint: boolean;
  prettier: boolean;
}

export interface ExportResult {
  id: string;
  format: string;
  downloadUrl?: string;
  externalUrl?: string;
  status: 'preparing' | 'ready' | 'failed';
  error?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface PreviewSession {
  id: string;
  userId: string;
  componentId: string;
  startTime: Date;
  endTime?: Date;
  interactions: PreviewInteraction[];
  config: PreviewConfig;
  screenshots: string[];
}

export const DEFAULT_VIEWPORT_SIZES: ViewportSize[] = [
  { id: 'mobile', name: 'Mobile', width: 375, height: 667, type: 'mobile', orientation: 'portrait' },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, type: 'tablet', orientation: 'portrait' },
  { id: 'desktop', name: 'Desktop', width: 1440, height: 900, type: 'desktop' },
  { id: 'wide', name: 'Wide Screen', width: 1920, height: 1080, type: 'desktop' }
];

export const DEFAULT_THEMES: PreviewTheme[] = [
  {
    id: 'light',
    name: 'Light',
    type: 'light',
    colors: {
      primary: '#1976d2',
      secondary: '#dc004e',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#212121',
      border: '#e0e0e0'
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    spacing: {
      base: '8px',
      scale: [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8]
    },
    borderRadius: '4px',
    shadows: ['none', '0 1px 3px rgba(0,0,0,0.12)', '0 3px 6px rgba(0,0,0,0.16)']
  },
  {
    id: 'dark',
    name: 'Dark',
    type: 'dark',
    colors: {
      primary: '#90caf9',
      secondary: '#f48fb1',
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      border: '#333333'
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    spacing: {
      base: '8px',
      scale: [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8]
    },
    borderRadius: '4px',
    shadows: ['none', '0 1px 3px rgba(0,0,0,0.24)', '0 3px 6px rgba(0,0,0,0.32)']
  }
];