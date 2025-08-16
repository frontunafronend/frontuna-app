export interface DesignFrameworkOption {
  value: string;
  label: string;
  color: string;
  description: string;
}

export interface ComponentUpgradeOptions {
  framework: 'react' | 'angular' | 'vue';
  designFramework: string;
  features: string[];
  version: 'v1' | 'v2';
}

export function createDesignFrameworkOptions(): DesignFrameworkOption[] {
  return [
    {
      value: 'bootstrap',
      label: 'Bootstrap',
      color: '#7952b3',
      description: 'Popular CSS framework with responsive grid and components'
    },
    {
      value: 'bootstrap-material',
      label: 'Bootstrap + Material',
      color: '#2196f3',
      description: 'Bootstrap enhanced with Material Design principles'
    },
    {
      value: 'tailwind',
      label: 'Tailwind CSS',
      color: '#06b6d4',
      description: 'Utility-first CSS framework for rapid UI development'
    },
    {
      value: 'material-ui',
      label: 'Material-UI',
      color: '#00acc1',
      description: 'React components implementing Google\'s Material Design'
    },
    {
      value: 'ant-design',
      label: 'Ant Design',
      color: '#1890ff',
      description: 'Enterprise-class UI design language and components'
    },
    {
      value: 'chakra-ui',
      label: 'Chakra UI',
      color: '#319795',
      description: 'Simple, modular and accessible component library'
    },
    {
      value: 'bulma',
      label: 'Bulma',
      color: '#00d1b2',
      description: 'Modern CSS framework based on Flexbox'
    },
    {
      value: 'foundation',
      label: 'Foundation',
      color: '#1779ba',
      description: 'Advanced responsive front-end framework'
    },
    {
      value: 'semantic-ui',
      label: 'Semantic UI',
      color: '#00b5ad',
      description: 'UI component framework based around useful principles'
    },
    {
      value: 'plain',
      label: 'Plain CSS',
      color: '#1976d2',
      description: 'Custom CSS without any framework dependencies'
    }
  ];
}

export function upgradeComponentToV2(component: any, options: ComponentUpgradeOptions): any {
  return {
    ...component,
    version: 'v2',
    designFramework: options.designFramework,
    features: [...(component.features || []), ...options.features],
    upgraded: true,
    upgradedAt: new Date().toISOString()
  };
}

export function getFrameworkColor(framework: string): string {
  const colors: Record<string, string> = {
    'react': '#61dafb',
    'angular': '#dd0031',
    'vue': '#4fc08d',
    'javascript': '#f7df1e',
    'typescript': '#3178c6'
  };
  return colors[framework.toLowerCase()] || '#666666';
}

export function getDesignFrameworkIcon(framework: string): string {
  const icons: Record<string, string> = {
    'bootstrap': 'grid_view',
    'bootstrap-material': 'design_services',
    'tailwind': 'palette',
    'material-ui': 'layers',
    'ant-design': 'widgets',
    'chakra-ui': 'auto_awesome',
    'bulma': 'view_module',
    'foundation': 'foundation',
    'semantic-ui': 'category',
    'plain': 'code'
  };
  return icons[framework] || 'code';
}