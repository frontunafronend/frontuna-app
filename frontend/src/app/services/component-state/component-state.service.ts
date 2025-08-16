import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GeneratedComponent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  framework: string;
  category: string;
  styleTheme: string;
  designFramework: string;
  code: {
    html: string;
    css: string;
    javascript: string;
    typescript: string;
  };
  dependencies: string[];
  designDependencies: any;
  props: any[];
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
  preview: string;
  previewWithDesign: string;
  generationMetadata: {
    model: string;
    tokensUsed: number;
    generationTime: number;
    completionId: string;
    temperature: number;
  };
  status: 'generating' | 'generated' | 'failed';
  isPublic: boolean;
  isSaved: boolean;
  tags: string[];
  views: number;
  likes: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  framework: string;
  category: string;
  designFramework: string;
  previewHtml: string;
  complexity: 'simple' | 'medium' | 'complex';
  tags: string[];
  popularity: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComponentStateService {
  // Signals for reactive state management
  private readonly _components = signal<GeneratedComponent[]>([]);
  private readonly _templates = signal<ComponentTemplate[]>([]);
  private readonly _currentComponent = signal<GeneratedComponent | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _currentFilter = signal('all');

  // Public readonly signals
  public readonly components = this._components.asReadonly();
  public readonly templates = this._templates.asReadonly();
  public readonly currentComponent = this._currentComponent.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly currentFilter = this._currentFilter.asReadonly();

  // Computed values
  public readonly filteredComponents = computed(() => {
    const filter = this._currentFilter();
    const components = this._components();
    
    if (filter === 'all') return components;
    return components.filter(c => 
      c.framework.toLowerCase() === filter.toLowerCase() || 
      c.category.toLowerCase() === filter.toLowerCase()
    );
  });

  public readonly recentComponents = computed(() => 
    this._components()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );

  public readonly savedComponents = computed(() => 
    this._components().filter(c => c.isSaved)
  );

  public readonly componentsByFramework = computed(() => {
    const components = this._components();
    return {
      react: components.filter(c => c.framework.toLowerCase() === 'react'),
      angular: components.filter(c => c.framework.toLowerCase() === 'angular'),
      vue: components.filter(c => c.framework.toLowerCase() === 'vue')
    };
  });

  public readonly randomComponents = computed(() => 
    this.shuffleArray([...this._components()]).slice(0, 18)
  );

  public readonly savedComponentsCount = computed(() => 
    this.savedComponents().length
  );

  constructor() {
    this.initializeMockData();
  }

  // Utility method to shuffle array randomly
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Component Management
  addComponent(component: GeneratedComponent): void {
    const components = this._components();
    this._components.set([component, ...components]);
    this.saveToLocalStorage();
  }

  updateComponent(id: string, updates: Partial<GeneratedComponent>): void {
    const components = this._components();
    const index = components.findIndex(c => c.id === id);
    
    if (index !== -1) {
      const updatedComponent = { ...components[index], ...updates, updatedAt: new Date().toISOString() };
      const newComponents = [...components];
      newComponents[index] = updatedComponent;
      this._components.set(newComponents);
      this.saveToLocalStorage();
    }
  }

  deleteComponent(id: string): void {
    const components = this._components();
    this._components.set(components.filter(c => c.id !== id));
    this.saveToLocalStorage();
  }

  getComponent(id: string): GeneratedComponent | null {
    return this._components().find(c => c.id === id) || null;
  }

  setCurrentComponent(component: GeneratedComponent | null): void {
    this._currentComponent.set(component);
  }

  // Template Management
  getTemplate(id: string): ComponentTemplate | null {
    return this._templates().find(t => t.id === id) || null;
  }

  getTemplatesByCategory(category: string): ComponentTemplate[] {
    if (category === 'all') return this._templates();
    return this._templates().filter(t => t.category === category);
  }

  // Filter Management
  setFilter(filter: string): void {
    this._currentFilter.set(filter);
  }

  // Loading State
  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  // Component Actions
  saveComponent(id: string): void {
    this.updateComponent(id, { isSaved: true });
  }

  toggleSaveComponent(id: string): void {
    const component = this.getComponent(id);
    if (component) {
      this.updateComponent(id, { isSaved: !component.isSaved });
    }
  }

  incrementViews(id: string): void {
    const component = this.getComponent(id);
    if (component) {
      this.updateComponent(id, { views: component.views + 1 });
    }
  }

  likeComponent(id: string): void {
    const component = this.getComponent(id);
    if (component) {
      this.updateComponent(id, { likes: component.likes + 1 });
    }
  }

  downloadComponent(id: string): void {
    const component = this.getComponent(id);
    if (component) {
      this.updateComponent(id, { downloads: component.downloads + 1 });
    }
  }

  // Template to Component Conversion
  templateToComponent(template: ComponentTemplate): GeneratedComponent {
    return {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      description: template.description,
      prompt: `Create a ${template.name.toLowerCase()} based on template`,
      framework: template.framework,
      category: template.category,
      styleTheme: 'modern',
      designFramework: template.designFramework,
      code: {
        html: template.previewHtml,
        css: this.generateBasicCSS(template),
        javascript: this.generateBasicJS(template),
        typescript: this.generateBasicTS(template)
      },
      dependencies: this.getFrameworkDependencies(template.framework),
      designDependencies: this.getDesignDependencies(template.designFramework),
      props: [],
      features: ['Template-based', 'Responsive', 'Modern Design'],
      usage: `Use this ${template.name.toLowerCase()} component in your ${template.framework} application`,
      options: {
        responsive: true,
        accessibility: true,
        darkMode: false,
        animations: false,
        typescript: template.framework === 'Angular',
        tests: false,
        includeBootstrap: template.designFramework.includes('bootstrap'),
        includeMaterialDesign: template.designFramework === 'material'
      },
      preview: template.previewHtml,
      previewWithDesign: template.previewHtml,
      generationMetadata: {
        model: 'template',
        tokensUsed: 0,
        generationTime: 0,
        completionId: `template_${template.id}`,
        temperature: 0
      },
      status: 'generated',
      isPublic: true,
      isSaved: false,
      tags: [...template.tags, 'template-based'],
      views: 0,
      likes: 0,
      downloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Search and Filter
  searchComponents(query: string): GeneratedComponent[] {
    const lowercaseQuery = query.toLowerCase();
    return this._components().filter(component =>
      component.name.toLowerCase().includes(lowercaseQuery) ||
      component.description.toLowerCase().includes(lowercaseQuery) ||
      component.framework.toLowerCase().includes(lowercaseQuery) ||
      component.category.toLowerCase().includes(lowercaseQuery) ||
      component.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  searchTemplates(query: string): ComponentTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return this._templates().filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.framework.toLowerCase().includes(lowercaseQuery) ||
      template.category.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Statistics
  getStats() {
    const components = this._components();
    const templates = this._templates();
    
    return {
      totalComponents: components.length,
      savedComponents: components.filter(c => c.isSaved).length,
      totalTemplates: templates.length,
      recentGenerations: components.filter(c => {
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return new Date(c.createdAt) > dayAgo;
      }).length,
      frameworks: {
        react: components.filter(c => c.framework.toLowerCase() === 'react').length,
        angular: components.filter(c => c.framework.toLowerCase() === 'angular').length,
        vue: components.filter(c => c.framework.toLowerCase() === 'vue').length
      },
      categories: this.getCategoryStats(components)
    };
  }

  private getCategoryStats(components: GeneratedComponent[]) {
    const categories: { [key: string]: number } = {};
    components.forEach(component => {
      categories[component.category] = (categories[component.category] || 0) + 1;
    });
    return categories;
  }

  // Persistence
  private saveToLocalStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('frontuna_components', JSON.stringify(this._components()));
    }
  }

  private loadFromLocalStorage(): GeneratedComponent[] {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('frontuna_components');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }

  // Helper Methods
  private generateBasicCSS(template: ComponentTemplate): string {
    return `/* ${template.name} Styles */
.${template.name.toLowerCase().replace(/\s+/g, '-')} {
  /* Add your custom styles here */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}`;
  }

  private generateBasicJS(template: ComponentTemplate): string {
    return `// ${template.name} Component Logic
export function ${template.name.replace(/\s+/g, '')}() {
  // Add your component logic here
  console.log('${template.name} component initialized');
}`;
  }

  private generateBasicTS(template: ComponentTemplate): string {
    return `// ${template.name} TypeScript Definitions
export interface ${template.name.replace(/\s+/g, '')}Props {
  // Add your prop definitions here
}

export interface ${template.name.replace(/\s+/g, '')}State {
  // Add your state definitions here
}`;
  }

  private getFrameworkDependencies(framework: string): string[] {
    const deps: { [key: string]: string[] } = {
      'react': ['react', 'react-dom'],
      'angular': ['@angular/core', '@angular/common'],
      'vue': ['vue']
    };
    return deps[framework.toLowerCase()] || [];
  }

  private getDesignDependencies(designFramework: string): any {
    const deps: { [key: string]: any } = {
      'bootstrap': { 'bootstrap': '^5.3.0' },
      'material': { '@angular/material': '^17.0.0' },
      'tailwind': { 'tailwindcss': '^3.0.0' }
    };
    return deps[designFramework] || {};
  }

  // Initialize with mock data
  private initializeMockData(): void {
    // Load from localStorage or use mock data
    const savedComponents = this.loadFromLocalStorage();
    
    if (savedComponents.length === 0) {
      this.loadMockComponents();
    } else {
      this._components.set(savedComponents);
    }

    this.loadMockTemplates();
  }

  private loadMockComponents(): void {
    const mockComponents: GeneratedComponent[] = [
      {
        id: 'comp_1',
        name: 'User Profile Card',
        description: 'A responsive user profile card with avatar, name, bio, and social media links',
        prompt: 'Create a modern user profile card with avatar and social links',
        framework: 'React',
        category: 'UI Component',
        styleTheme: 'modern',
        designFramework: 'bootstrap',
        code: {
          html: `<div class="user-profile-card">
  <div class="profile-header">
    <div class="avatar">
      <img src="/api/placeholder/80/80" alt="User Avatar" />
    </div>
    <h3 class="user-name">John Doe</h3>
    <p class="user-title">Frontend Developer</p>
  </div>
  <div class="profile-actions">
    <button class="btn btn-primary">Follow</button>
    <button class="btn btn-outline">Message</button>
  </div>
</div>`,
          css: `.user-profile-card {
  max-width: 300px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 15px;
}

.user-name {
  margin: 0 0 5px 0;
  color: #333;
}

.user-title {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
}

.profile-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-outline {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}`,
          javascript: `function UserProfileCard({ user }) {
  const handleFollow = () => {
    console.log('Following', user.name);
  };

  const handleMessage = () => {
    console.log('Messaging', user.name);
  };

  return (
    <div className="user-profile-card">
      <div className="profile-header">
        <div className="avatar">
          <img src={user.avatar} alt="User Avatar" />
        </div>
        <h3 className="user-name">{user.name}</h3>
        <p className="user-title">{user.title}</p>
      </div>
      <div className="profile-actions">
        <button className="btn btn-primary" onClick={handleFollow}>
          Follow
        </button>
        <button className="btn btn-outline" onClick={handleMessage}>
          Message
        </button>
      </div>
    </div>
  );
}`,
          typescript: `interface User {
  id: string;
  name: string;
  title: string;
  avatar: string;
}

interface UserProfileCardProps {
  user: User;
  onFollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
}

export { User, UserProfileCardProps };`
        },
        dependencies: ['react', 'react-dom'],
        designDependencies: { 'bootstrap': '^5.3.0' },
        props: [
          { name: 'user', type: 'User', required: true, description: 'User object with profile information' }
        ],
        features: ['Responsive Design', 'Social Actions', 'Avatar Support'],
        usage: 'Use this component to display user profiles in your application',
        options: {
          responsive: true,
          accessibility: true,
          darkMode: false,
          animations: false,
          typescript: true,
          tests: false,
          includeBootstrap: true,
          includeMaterialDesign: false
        },
        preview: `<div style="max-width: 300px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
  <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">👤</div>
  <h3 style="margin: 0 0 5px 0; color: #333;">John Doe</h3>
  <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">Frontend Developer</p>
  <div style="display: flex; gap: 10px; justify-content: center;">
    <button style="background: #007bff; color: white; border: none; padding: 8px 20px; border-radius: 20px; cursor: pointer;">Follow</button>
    <button style="background: transparent; color: #007bff; border: 1px solid #007bff; padding: 8px 20px; border-radius: 20px; cursor: pointer;">Message</button>
  </div>
</div>`,
        previewWithDesign: `<div style="max-width: 300px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
  <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">👤</div>
  <h3 style="margin: 0 0 5px 0; color: #333;">John Doe</h3>
  <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">Frontend Developer</p>
  <div style="display: flex; gap: 10px; justify-content: center;">
    <button style="background: #007bff; color: white; border: none; padding: 8px 20px; border-radius: 20px; cursor: pointer;">Follow</button>
    <button style="background: transparent; color: #007bff; border: 1px solid #007bff; padding: 8px 20px; border-radius: 20px; cursor: pointer;">Message</button>
  </div>
</div>`,
        generationMetadata: {
          model: 'gpt-4',
          tokensUsed: 1250,
          generationTime: 15,
          completionId: 'cmpl_123456',
          temperature: 0.7
        },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['profile', 'user', 'card', 'social'],
        views: 42,
        likes: 8,
        downloads: 3,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      // 2. Modern Search Bar
      {
        id: 'comp_2',
        name: 'Advanced Search Bar',
        description: 'A modern search bar with autocomplete, filters, and real-time suggestions',
        prompt: 'Create a search bar with autocomplete and filter options',
        framework: 'React',
        category: 'UI Component',
        styleTheme: 'modern',
        designFramework: 'bootstrap',
        code: {
          html: `<div class="search-bar-container">
  <div class="search-input-wrapper">
    <input type="text" class="search-input" placeholder="Search anything..." />
    <button class="search-btn">🔍</button>
  </div>
  <div class="search-filters">
    <button class="filter-btn active">All</button>
    <button class="filter-btn">Components</button>
    <button class="filter-btn">Templates</button>
    <button class="filter-btn">Docs</button>
  </div>
</div>`,
          css: `.search-bar-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 16px 60px 16px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 50px;
  font-size: 16px;
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 6px 30px rgba(102,126,234,0.2);
}

.search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
}

.search-filters {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.filter-btn {
  padding: 8px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 25px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.filter-btn:hover,
.filter-btn.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}`,
          javascript: `function AdvancedSearchBar({ onSearch, onFilterChange }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Components', 'Templates', 'Docs'];

  const handleSearch = () => {
    onSearch?.(query, activeFilter);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="search-btn" onClick={handleSearch}>
          🔍
        </button>
      </div>
      <div className="search-filters">
        {filters.map((filter) => (
          <button
            key={filter}
            className={\`filter-btn \${activeFilter === filter ? 'active' : ''}\`}
            onClick={() => handleFilterClick(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}`,
          typescript: `interface SearchBarProps {
  onSearch?: (query: string, filter: string) => void;
  onFilterChange?: (filter: string) => void;
  placeholder?: string;
  filters?: string[];
}`
        },
        dependencies: ['react', 'react-dom'],
        designDependencies: { 'bootstrap': '^5.3.0' },
        props: [
          { name: 'onSearch', type: 'function', required: false, description: 'Search callback function' },
          { name: 'onFilterChange', type: 'function', required: false, description: 'Filter change callback' }
        ],
        features: ['Real-time Search', 'Filter Options', 'Responsive Design', 'Keyboard Support'],
        usage: 'Perfect for search functionality across your application',
        options: {
          responsive: true,
          accessibility: true,
          darkMode: false,
          animations: true,
          typescript: true,
          tests: false,
          includeBootstrap: true,
          includeMaterialDesign: false
        },
        preview: `<div style="max-width: 500px; margin: 0 auto; padding: 20px;">
  <div style="position: relative; margin-bottom: 16px;">
    <input type="text" placeholder="Search anything..." style="width: 100%; padding: 16px 60px 16px 20px; border: 2px solid #e1e5e9; border-radius: 50px; font-size: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); box-sizing: border-box;" />
    <button style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 18px;">🔍</button>
  </div>
  <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
    <button style="padding: 8px 20px; border: 2px solid #667eea; border-radius: 25px; background: #667eea; color: white; cursor: pointer; font-weight: 500;">All</button>
    <button style="padding: 8px 20px; border: 2px solid #e1e5e9; border-radius: 25px; background: white; cursor: pointer; font-weight: 500;">Components</button>
    <button style="padding: 8px 20px; border: 2px solid #e1e5e9; border-radius: 25px; background: white; cursor: pointer; font-weight: 500;">Templates</button>
    <button style="padding: 8px 20px; border: 2px solid #e1e5e9; border-radius: 25px; background: white; cursor: pointer; font-weight: 500;">Docs</button>
  </div>
</div>`,
        previewWithDesign: `<div style="max-width: 500px; margin: 0 auto; padding: 20px;">
  <div style="position: relative; margin-bottom: 16px;">
    <input type="text" placeholder="Search anything..." style="width: 100%; padding: 16px 60px 16px 20px; border: 2px solid #e1e5e9; border-radius: 50px; font-size: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); box-sizing: border-box;" />
    <button style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 18px;">🔍</button>
  </div>
  <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
    <button style="padding: 8px 20px; border: 2px solid #667eea; border-radius: 25px; background: #667eea; color: white; cursor: pointer; font-weight: 500;">All</button>
    <button style="padding: 8px 20px; border: 2px solid #e1e5e9; border-radius: 25px; background: white; cursor: pointer; font-weight: 500;">Components</button>
    <button style="padding: 8px 20px; border: 2px solid #e1e5e9; border-radius: 25px; background: white; cursor: pointer; font-weight: 500;">Templates</button>
    <button style="padding: 8px 20px; border: 2px solid #e1e5e9; border-radius: 25px; background: white; cursor: pointer; font-weight: 500;">Docs</button>
  </div>
</div>`,
        generationMetadata: {
          model: 'gpt-4',
          tokensUsed: 1420,
          generationTime: 14,
          completionId: 'cmpl_123458',
          temperature: 0.7
        },
        status: 'generated',
        isPublic: true,
        isSaved: true,
        tags: ['search', 'filter', 'input', 'ui'],
        views: 89,
        likes: 15,
        downloads: 7,
        createdAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
        updatedAt: new Date(Date.now() - 21600000).toISOString()
      },
      // 3. Pricing Card
      {
        id: 'comp_3',
        name: 'Pricing Card',
        description: 'A modern pricing card perfect for SaaS applications with features list and CTA button',
        prompt: 'Create a pricing card with features list and call-to-action button',
        framework: 'React',
        category: 'UI Component',
        styleTheme: 'modern',
        designFramework: 'bootstrap',
        code: {
          html: `<div class="pricing-card">
  <div class="pricing-header">
    <h3 class="plan-name">Pro Plan</h3>
    <div class="price">
      <span class="currency">$</span>
      <span class="amount">29</span>
      <span class="period">/month</span>
    </div>
    <p class="plan-description">Perfect for growing businesses</p>
  </div>
  <div class="pricing-features">
    <ul class="features-list">
      <li>✅ Up to 10,000 components</li>
      <li>✅ Advanced customization</li>
      <li>✅ Priority support</li>
      <li>✅ Team collaboration</li>
      <li>✅ Export to popular frameworks</li>
      <li>✅ Custom themes</li>
    </ul>
  </div>
  <div class="pricing-footer">
    <button class="cta-button">Get Started</button>
    <p class="money-back">30-day money-back guarantee</p>
  </div>
</div>`,
          css: `.pricing-card {
  max-width: 350px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  padding: 32px 24px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.pricing-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(102,126,234,0.2);
  border-color: #667eea;
}

.pricing-header {
  margin-bottom: 32px;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
}

.price {
  display: flex;
  justify-content: center;
  align-items: baseline;
  margin-bottom: 16px;
}

.currency {
  font-size: 1.5rem;
  color: #667eea;
  font-weight: 600;
}

.amount {
  font-size: 3.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 8px;
}

.period {
  font-size: 1.2rem;
  color: #666;
}

.plan-description {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.features-list li {
  padding: 12px 0;
  color: #333;
  font-size: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.features-list li:last-child {
  border-bottom: none;
}

.pricing-footer {
  margin-top: 32px;
}

.cta-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102,126,234,0.3);
}

.money-back {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}`,
          javascript: `function PricingCard({ plan, onSelectPlan }) {
  const handleSelectPlan = () => {
    onSelectPlan?.(plan);
  };

  return (
    <div className="pricing-card">
      <div className="pricing-header">
        <h3 className="plan-name">{plan.name}</h3>
        <div className="price">
          <span className="currency">$</span>
          <span className="amount">{plan.price}</span>
          <span className="period">/{plan.period}</span>
        </div>
        <p className="plan-description">{plan.description}</p>
      </div>
      <div className="pricing-features">
        <ul className="features-list">
          {plan.features.map((feature, index) => (
            <li key={index}>✅ {feature}</li>
          ))}
        </ul>
      </div>
      <div className="pricing-footer">
        <button className="cta-button" onClick={handleSelectPlan}>
          {plan.ctaText || 'Get Started'}
        </button>
        <p className="money-back">{plan.guarantee}</p>
      </div>
    </div>
  );
}`,
          typescript: `interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  ctaText?: string;
  guarantee: string;
  popular?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
  onSelectPlan?: (plan: PricingPlan) => void;
}`
        },
        dependencies: ['react', 'react-dom'],
        designDependencies: { 'bootstrap': '^5.3.0' },
        props: [
          { name: 'plan', type: 'PricingPlan', required: true, description: 'Pricing plan data' },
          { name: 'onSelectPlan', type: 'function', required: false, description: 'Plan selection callback' }
        ],
        features: ['Responsive Design', 'Hover Effects', 'Feature List', 'Call-to-Action'],
        usage: 'Perfect for SaaS pricing pages and subscription plans',
        options: {
          responsive: true,
          accessibility: true,
          darkMode: false,
          animations: true,
          typescript: true,
          tests: false,
          includeBootstrap: true,
          includeMaterialDesign: false
        },
        preview: `<div style="max-width: 320px; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); padding: 32px 24px; text-align: center; position: relative; overflow: hidden;">
  <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 1.4rem; font-weight: 700; color: #333; margin: 0 0 16px 0;">Pro Plan</h3>
    <div style="display: flex; justify-content: center; align-items: baseline; margin-bottom: 12px;">
      <span style="font-size: 1.2rem; color: #667eea; font-weight: 600;">$</span>
      <span style="font-size: 2.5rem; font-weight: 700; color: #333; margin: 0 6px;">29</span>
      <span style="font-size: 1rem; color: #666;">/month</span>
    </div>
    <p style="color: #666; margin: 0; font-size: 0.95rem;">Perfect for growing businesses</p>
  </div>
  <div style="text-align: left; margin-bottom: 24px;">
    <div style="padding: 8px 0; color: #333; font-size: 0.9rem; border-bottom: 1px solid #f0f0f0;">✅ Up to 10,000 components</div>
    <div style="padding: 8px 0; color: #333; font-size: 0.9rem; border-bottom: 1px solid #f0f0f0;">✅ Advanced customization</div>
    <div style="padding: 8px 0; color: #333; font-size: 0.9rem; border-bottom: 1px solid #f0f0f0;">✅ Priority support</div>
    <div style="padding: 8px 0; color: #333; font-size: 0.9rem;">✅ Team collaboration</div>
  </div>
  <button style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 28px; border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer; margin-bottom: 12px;">Get Started</button>
  <p style="font-size: 0.8rem; color: #666; margin: 0;">30-day money-back guarantee</p>
</div>`,
        previewWithDesign: `<div style="max-width: 320px; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); padding: 32px 24px; text-align: center; position: relative; overflow: hidden;">
  <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 1.4rem; font-weight: 700; color: #333; margin: 0 0 16px 0;">Pro Plan</h3>
    <div style="display: flex; justify-content: center; align-items: baseline; margin-bottom: 12px;">
      <span style="font-size: 1.2rem; color: #667eea; font-weight: 600;">$</span>
      <span style="font-size: 2.5rem; font-weight: 700; color: #333; margin: 0 6px;">29</span>
      <span style="font-size: 1rem; color: #666;">/month</span>
    </div>
    <p style="color: #666; margin: 0; font-size: 0.95rem;">Perfect for growing businesses</p>
  </div>
  <div style="text-align: left; margin-bottom: 24px;">
    <div style="padding: 8px 0; color: #333; font-size: 0.9rem; border-bottom: 1px solid #f0f0f0;">✅ Up to 10,000 components</div>
    <div style="padding: 8px 0; color: #333; font-size: 0.9rem; border-bottom: 1px solid #f0f0f0;">✅ Advanced customization</div>
    <div style="padding: 8px 0; color: #333; font-size: 0.9rem; border-bottom: 1px solid #f0f0f0;">✅ Priority support</div>
    <div style="padding: 8px 0; color: #333; font-size: 0.9rem;">✅ Team collaboration</div>
  </div>
  <button style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 28px; border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer; margin-bottom: 12px;">Get Started</button>
  <p style="font-size: 0.8rem; color: #666; margin: 0;">30-day money-back guarantee</p>
</div>`,
        generationMetadata: {
          model: 'gpt-4',
          tokensUsed: 1580,
          generationTime: 16,
          completionId: 'cmpl_123459',
          temperature: 0.7
        },
        status: 'generated',
        isPublic: true,
        isSaved: true,
        tags: ['pricing', 'card', 'saas', 'subscription'],
        views: 134,
        likes: 28,
        downloads: 18,
        createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        updatedAt: new Date(Date.now() - 10800000).toISOString()
      },
      // 4. Modal Dialog
      {
        id: 'comp_4',
        name: 'Modal Dialog',
        description: 'A versatile modal dialog with overlay, animations, and customizable content areas',
        prompt: 'Create a modal dialog with overlay background and close functionality',
        framework: 'React',
        category: 'UI Component',
        styleTheme: 'modern',
        designFramework: 'bootstrap',
        code: {
          html: `<div class="modal-overlay">
  <div class="modal-container">
    <div class="modal-header">
      <h3 class="modal-title">Confirm Action</h3>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-body">
      <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>`,
          css: `.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  transform: scale(0.9) translateY(20px);
  animation: modalSlideIn 0.3s ease forwards;
}

@keyframes modalSlideIn {
  to {
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
  color: #4b5563;
  line-height: 1.6;
}

.modal-body p {
  margin: 0;
  font-size: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px 24px;
  border-top: 1px solid #e5e7eb;
  margin-top: 0;
  padding-top: 20px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 14px;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}`,
          javascript: `function Modal({ isOpen, onClose, title, children, onConfirm, confirmText = "Confirm", cancelText = "Cancel" }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {cancelText}
          </button>
          {onConfirm && (
            <button className="btn btn-primary" onClick={onConfirm}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}`,
          typescript: `interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}`
        },
        dependencies: ['react', 'react-dom'],
        designDependencies: { 'bootstrap': '^5.3.0' },
        props: [
          { name: 'isOpen', type: 'boolean', required: true, description: 'Whether modal is open' },
          { name: 'onClose', type: 'function', required: true, description: 'Close handler function' },
          { name: 'title', type: 'string', required: true, description: 'Modal title' },
          { name: 'children', type: 'ReactNode', required: true, description: 'Modal content' }
        ],
        features: ['Backdrop Click Close', 'ESC Key Close', 'Animations', 'Responsive', 'Accessible'],
        usage: 'Perfect for confirmations, forms, image galleries, and any overlay content',
        options: {
          responsive: true,
          accessibility: true,
          darkMode: false,
          animations: true,
          typescript: true,
          tests: false,
          includeBootstrap: true,
          includeMaterialDesign: false
        },
        preview: `<div style="position: relative; min-height: 300px; background: #f8f9fa; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
  <div style="background: white; border-radius: 16px; box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3); max-width: 400px; width: 100%; overflow: hidden;">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 20px 0 20px; border-bottom: 1px solid #e5e7eb; margin-bottom: 0;">
      <h3 style="margin: 0; font-size: 1.3rem; font-weight: 700; color: #1f2937;">Confirm Action</h3>
      <button style="background: none; border: none; font-size: 1.5rem; color: #6b7280; cursor: pointer; padding: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px;">×</button>
    </div>
    <div style="padding: 20px; color: #4b5563; line-height: 1.5;">
      <p style="margin: 0; font-size: 0.95rem;">Are you sure you want to proceed with this action? This cannot be undone.</p>
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 10px; padding: 0 20px 20px 20px; border-top: 1px solid #e5e7eb; margin-top: 0; padding-top: 16px;">
      <button style="padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 13px; background: #f3f4f6; color: #374151;">Cancel</button>
      <button style="padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 13px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">Confirm</button>
    </div>
  </div>
</div>`,
        previewWithDesign: `<div style="position: relative; min-height: 300px; background: #f8f9fa; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
  <div style="background: white; border-radius: 16px; box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3); max-width: 400px; width: 100%; overflow: hidden;">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 20px 0 20px; border-bottom: 1px solid #e5e7eb; margin-bottom: 0;">
      <h3 style="margin: 0; font-size: 1.3rem; font-weight: 700; color: #1f2937;">Confirm Action</h3>
      <button style="background: none; border: none; font-size: 1.5rem; color: #6b7280; cursor: pointer; padding: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px;">×</button>
    </div>
    <div style="padding: 20px; color: #4b5563; line-height: 1.5;">
      <p style="margin: 0; font-size: 0.95rem;">Are you sure you want to proceed with this action? This cannot be undone.</p>
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 10px; padding: 0 20px 20px 20px; border-top: 1px solid #e5e7eb; margin-top: 0; padding-top: 16px;">
      <button style="padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 13px; background: #f3f4f6; color: #374151;">Cancel</button>
      <button style="padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 13px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">Confirm</button>
    </div>
  </div>
</div>`,
        generationMetadata: {
          model: 'gpt-4',
          tokensUsed: 1720,
          generationTime: 19,
          completionId: 'cmpl_123460',
          temperature: 0.7
        },
        status: 'generated',
        isPublic: true,
        isSaved: true,
        tags: ['modal', 'dialog', 'overlay', 'popup'],
        views: 201,
        likes: 35,
        downloads: 22,
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 7200000).toISOString()
      },
      // 5. Loading Spinner
      {
        id: 'comp_5',
        name: 'Loading Spinner',
        description: 'Animated loading spinner with multiple variants and customizable colors',
        prompt: 'Create an animated loading spinner with different styles',
        framework: 'React',
        category: 'UI Component',
        styleTheme: 'modern',
        designFramework: 'bootstrap',
        code: {
          html: `<div class="loading-container">
  <div class="spinner-wrapper">
    <div class="spinner"></div>
  </div>
  <p class="loading-text">Loading...</p>
</div>`,
          css: `.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin: 0;
  color: #6b7280;
  font-weight: 500;
  font-size: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Variant: Dots Spinner */
.dots-spinner {
  display: flex;
  gap: 8px;
}

.dots-spinner .dot {
  width: 12px;
  height: 12px;
  background: #667eea;
  border-radius: 50%;
  animation: dotPulse 1.4s ease-in-out infinite both;
}

.dots-spinner .dot:nth-child(1) { animation-delay: -0.32s; }
.dots-spinner .dot:nth-child(2) { animation-delay: -0.16s; }
.dots-spinner .dot:nth-child(3) { animation-delay: 0s; }

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Variant: Bars Spinner */
.bars-spinner {
  display: flex;
  gap: 4px;
  align-items: end;
}

.bars-spinner .bar {
  width: 6px;
  height: 40px;
  background: #667eea;
  border-radius: 3px;
  animation: barStretch 1.2s ease-in-out infinite;
}

.bars-spinner .bar:nth-child(2) { animation-delay: -1.1s; }
.bars-spinner .bar:nth-child(3) { animation-delay: -1.0s; }
.bars-spinner .bar:nth-child(4) { animation-delay: -0.9s; }
.bars-spinner .bar:nth-child(5) { animation-delay: -0.8s; }

@keyframes barStretch {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}`,
          javascript: `function LoadingSpinner({ 
  variant = "circular", 
  size = "md", 
  color = "#667eea", 
  text = "Loading...", 
  showText = true 
}) {
  const getSizeClass = () => {
    const sizes = {
      sm: '32px',
      md: '48px',
      lg: '64px'
    };
    return sizes[size] || sizes.md;
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="dots-spinner">
            <div className="dot" style={{ backgroundColor: color }}></div>
            <div className="dot" style={{ backgroundColor: color }}></div>
            <div className="dot" style={{ backgroundColor: color }}></div>
          </div>
        );
      
      case 'bars':
        return (
          <div className="bars-spinner">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bar" style={{ backgroundColor: color }}></div>
            ))}
          </div>
        );
      
      default:
        return (
          <div 
            className="spinner" 
            style={{ 
              width: getSizeClass(), 
              height: getSizeClass(),
              borderTopColor: color 
            }}
          />
        );
    }
  };

  return (
    <div className="loading-container">
      <div className="spinner-wrapper">
        {renderSpinner()}
      </div>
      {showText && <p className="loading-text">{text}</p>}
    </div>
  );
}`,
          typescript: `interface LoadingSpinnerProps {
  variant?: 'circular' | 'dots' | 'bars';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  showText?: boolean;
  className?: string;
}`
        },
        dependencies: ['react', 'react-dom'],
        designDependencies: { 'bootstrap': '^5.3.0' },
        props: [
          { name: 'variant', type: 'string', required: false, description: 'Spinner style variant' },
          { name: 'size', type: 'string', required: false, description: 'Spinner size' },
          { name: 'color', type: 'string', required: false, description: 'Spinner color' },
          { name: 'text', type: 'string', required: false, description: 'Loading text' }
        ],
        features: ['Multiple Variants', 'Customizable Colors', 'Responsive Sizes', 'Smooth Animations'],
        usage: 'Essential for showing loading states during async operations',
        options: {
          responsive: true,
          accessibility: true,
          darkMode: false,
          animations: true,
          typescript: true,
          tests: false,
          includeBootstrap: true,
          includeMaterialDesign: false
        },
        preview: `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; background: #f8f9fa; border-radius: 12px;">
  <div style="position: relative; margin-bottom: 20px;">
    <div style="width: 48px; height: 48px; border: 4px solid #f3f4f6; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
  </div>
  <p style="margin: 0; color: #6b7280; font-weight: 500; font-size: 1rem;">Loading...</p>
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</div>`,
        previewWithDesign: `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; background: #f8f9fa; border-radius: 12px;">
  <div style="position: relative; margin-bottom: 20px;">
    <div style="width: 48px; height: 48px; border: 4px solid #f3f4f6; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
  </div>
  <p style="margin: 0; color: #6b7280; font-weight: 500; font-size: 1rem;">Loading...</p>
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</div>`,
        generationMetadata: {
          model: 'gpt-4',
          tokensUsed: 1340,
          generationTime: 12,
          completionId: 'cmpl_123461',
          temperature: 0.7
        },
        status: 'generated',
        isPublic: true,
        isSaved: true,
        tags: ['loading', 'spinner', 'animation', 'async'],
        views: 178,
        likes: 31,
        downloads: 19,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      // 6. Button Group
      {
        id: 'comp_6',
        name: 'Button Group',
        description: 'Versatile button group with multiple variants and states',
        prompt: 'Create a button group component with different styles and states',
        framework: 'Angular',
        category: 'UI Component',
        styleTheme: 'modern',
        designFramework: 'material',
        code: {
          html: `<div class="button-group">
  <button class="btn btn-primary active">Primary</button>
  <button class="btn btn-secondary">Secondary</button>
  <button class="btn btn-outline">Outline</button>
  <button class="btn btn-ghost">Ghost</button>
</div>`,
          css: `.button-group {
  display: flex;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.btn {
  padding: 12px 24px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  position: relative;
}

.btn:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  bottom: 20%;
  width: 1px;
  background: rgba(255,255,255,0.3);
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
}

.btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.btn.active {
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}`,
          javascript: `export class ButtonGroupComponent {
  selectedButton: string = 'primary';

  onButtonClick(buttonType: string) {
    this.selectedButton = buttonType;
    console.log('Selected:', buttonType);
  }

  isActive(buttonType: string): boolean {
    return this.selectedButton === buttonType;
  }
}`,
          typescript: `import { Component } from '@angular/core';

@Component({
  selector: 'app-button-group',
  template: \`
    <div class="button-group">
      <button 
        *ngFor="let btn of buttons" 
        class="btn"
        [ngClass]="['btn-' + btn.type, {'active': isActive(btn.type)}]"
        (click)="onButtonClick(btn.type)">
        {{btn.label}}
      </button>
    </div>
  \`
})
export class ButtonGroupComponent {
  buttons = [
    { type: 'primary', label: 'Primary' },
    { type: 'secondary', label: 'Secondary' },
    { type: 'outline', label: 'Outline' },
    { type: 'ghost', label: 'Ghost' }
  ];
  
  selectedButton = 'primary';

  onButtonClick(buttonType: string) {
    this.selectedButton = buttonType;
  }

  isActive(buttonType: string): boolean {
    return this.selectedButton === buttonType;
  }
}`
        },
        dependencies: ['@angular/core', '@angular/common'],
        designDependencies: { '@angular/material': '^17.0.0' },
        props: [
          { name: 'buttons', type: 'ButtonItem[]', required: true, description: 'Array of button configurations' },
          { name: 'selectedButton', type: 'string', required: false, description: 'Currently selected button' }
        ],
        features: ['Multiple Variants', 'Active States', 'Hover Effects', 'Responsive Design'],
        usage: 'Perfect for tab-like navigation, filter controls, and option selection',
        options: {
          responsive: true,
          accessibility: true,
          darkMode: false,
          animations: true,
          typescript: true,
          tests: false,
          includeBootstrap: false,
          includeMaterialDesign: true
        },
        preview: `<div style="display: flex; padding: 20px; justify-content: center;">
  <div style="display: flex; gap: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <button style="padding: 12px 20px; border: none; font-weight: 600; cursor: pointer; background: #667eea; color: white; position: relative;">Primary</button>
    <button style="padding: 12px 20px; border: none; font-weight: 600; cursor: pointer; background: #6b7280; color: white;">Secondary</button>
    <button style="padding: 12px 20px; border: none; font-weight: 600; cursor: pointer; background: transparent; color: #667eea; border: 1px solid #667eea;">Outline</button>
    <button style="padding: 12px 20px; border: none; font-weight: 600; cursor: pointer; background: transparent; color: #6b7280;">Ghost</button>
  </div>
</div>`,
        previewWithDesign: `<div style="display: flex; padding: 20px; justify-content: center;">
  <div style="display: flex; gap: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <button style="padding: 12px 20px; border: none; font-weight: 600; cursor: pointer; background: #667eea; color: white; position: relative;">Primary</button>
    <button style="padding: 12px 20px; border: none; font-weight: 600; cursor: pointer; background: #6b7280; color: white;">Secondary</button>
    <button style="padding: 12px 20px; border: none; font-weight: 600; cursor: pointer; background: transparent; color: #667eea; border: 1px solid #667eea;">Outline</button>
    <button style="padding: 12px 20px; border: none; font-weight: 600; cursor: pointer; background: transparent; color: #6b7280;">Ghost</button>
  </div>
</div>`,
        generationMetadata: {
          model: 'gpt-4',
          tokensUsed: 1240,
          generationTime: 11,
          completionId: 'cmpl_123462',
          temperature: 0.7
        },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['button', 'group', 'navigation', 'selection'],
        views: 89,
        likes: 18,
        downloads: 8,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      // 7. Input Field
      {
        id: 'comp_7',
        name: 'Modern Input Field',
        description: 'Stylish input field with floating labels and validation states',
        prompt: 'Create a modern input field with floating labels and validation',
        framework: 'Angular',
        category: 'Form',
        styleTheme: 'modern',
        designFramework: 'material',
        code: {
          html: `<div class="input-group">
  <input type="text" class="form-input" placeholder=" " required>
  <label class="form-label">Email Address</label>
  <div class="input-border"></div>
  <span class="error-message">Please enter a valid email</span>
</div>`,
          css: `.input-group {
  position: relative;
  margin-bottom: 24px;
}

.form-input {
  width: 100%;
  padding: 16px 12px 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  background: transparent;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-label {
  position: absolute;
  left: 12px;
  top: 16px;
  color: #6b7280;
  font-size: 16px;
  transition: all 0.3s ease;
  pointer-events: none;
  background: white;
  padding: 0 4px;
}

.form-input:focus + .form-label,
.form-input:not(:placeholder-shown) + .form-label {
  top: -8px;
  left: 8px;
  font-size: 12px;
  color: #667eea;
  font-weight: 600;
}

.error-message {
  display: none;
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

.form-input:invalid + .form-label + .input-border + .error-message {
  display: block;
}

.form-input:invalid {
  border-color: #ef4444;
}`,
          javascript: `export class ModernInputComponent {
  value: string = '';
  isValid: boolean = true;
  errorMessage: string = '';

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.validateInput();
  }

  validateInput() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.isValid = emailRegex.test(this.value) || this.value === '';
    this.errorMessage = this.isValid ? '' : 'Please enter a valid email';
  }
}`,
          typescript: `import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-modern-input',
  template: \`
    <div class="input-group">
      <input 
        type="email" 
        class="form-input"
        [class.invalid]="!isValid"
        placeholder=" "
        [(ngModel)]="value"
        (input)="onInput($event)"
        required>
      <label class="form-label">{{label}}</label>
      <div class="input-border"></div>
      <span class="error-message" [style.display]="isValid ? 'none' : 'block'">
        {{errorMessage}}
      </span>
    </div>
  \`
})
export class ModernInputComponent {
  value = '';
  label = 'Email Address';
  isValid = true;
  errorMessage = '';

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.validateInput();
  }

  private validateInput() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.isValid = emailRegex.test(this.value) || this.value === '';
    this.errorMessage = this.isValid ? '' : 'Please enter a valid email';
  }
}`
        },
        dependencies: ['@angular/core', '@angular/forms'],
        designDependencies: { '@angular/material': '^17.0.0' },
        props: [
          { name: 'label', type: 'string', required: true, description: 'Input field label' },
          { name: 'value', type: 'string', required: false, description: 'Input value' },
          { name: 'type', type: 'string', required: false, description: 'Input type (text, email, password, etc.)' }
        ],
        features: ['Floating Labels', 'Validation States', 'Focus Effects', 'Error Messages'],
        usage: 'Essential for forms, user registration, and data input',
        options: {
          responsive: true,
          accessibility: true,
          darkMode: false,
          animations: true,
          typescript: true,
          tests: false,
          includeBootstrap: false,
          includeMaterialDesign: true
        },
        preview: `<div style="padding: 20px; max-width: 400px; margin: 0 auto;">
  <div style="position: relative; margin-bottom: 24px;">
    <input type="text" style="width: 100%; padding: 16px 12px 8px 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; background: transparent; box-sizing: border-box;" placeholder=" ">
    <label style="position: absolute; left: 12px; top: 16px; color: #6b7280; font-size: 16px; transition: all 0.3s ease; pointer-events: none; background: white; padding: 0 4px;">Email Address</label>
  </div>
</div>`,
        previewWithDesign: `<div style="padding: 20px; max-width: 400px; margin: 0 auto;">
  <div style="position: relative; margin-bottom: 24px;">
    <input type="text" style="width: 100%; padding: 16px 12px 8px 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; background: transparent; box-sizing: border-box;" placeholder=" ">
    <label style="position: absolute; left: 12px; top: 16px; color: #6b7280; font-size: 16px; transition: all 0.3s ease; pointer-events: none; background: white; padding: 0 4px;">Email Address</label>
  </div>
</div>`,
        generationMetadata: {
          model: 'gpt-4',
          tokensUsed: 1380,
          generationTime: 13,
          completionId: 'cmpl_123463',
          temperature: 0.7
        },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['input', 'form', 'validation', 'floating-label'],
        views: 156,
        likes: 34,
        downloads: 19,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      // 8. Card Component
      {
        id: 'comp_8',
        name: 'Content Card',
        description: 'Versatile content card with image, title, description and actions',
        prompt: 'Create a modern content card with image and action buttons',
        framework: 'Angular',
        category: 'Layout',
        styleTheme: 'modern',
        designFramework: 'material',
        code: {
          html: `<div class="content-card">
  <div class="card-image">
    <img src="https://picsum.photos/300/200" alt="Card Image">
    <div class="image-overlay">
      <button class="overlay-btn">View</button>
    </div>
  </div>
  <div class="card-content">
    <div class="card-header">
      <h3 class="card-title">Amazing Product</h3>
      <span class="card-badge">NEW</span>
    </div>
    <p class="card-description">
      This is a beautiful content card component that can be used for products, articles, or any other content.
    </p>
    <div class="card-footer">
      <span class="card-price">$299</span>
      <div class="card-actions">
        <button class="btn-secondary">Like</button>
        <button class="btn-primary">Buy Now</button>
      </div>
    </div>
  </div>
</div>`,
          css: `.content-card {
  max-width: 350px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.content-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.content-card:hover .card-image img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.content-card:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  background: white;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
}

.card-content {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-title {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 700;
}

.card-badge {
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
}

.card-description {
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 20px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-primary, .btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-primary:hover, .btn-secondary:hover {
  transform: translateY(-1px);
}`,
          typescript: `import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface CardData {
  id: string;
  title: string;
  description: string;
  image: string;
  price?: string;
  badge?: string;
}

@Component({
  selector: 'app-content-card',
  template: \`
    <div class="content-card" (click)="onCardClick()">
      <div class="card-image">
        <img [src]="data.image" [alt]="data.title">
        <div class="image-overlay">
          <button class="overlay-btn" (click)="onViewClick($event)">View</button>
        </div>
      </div>
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">{{data.title}}</h3>
          <span class="card-badge" *ngIf="data.badge">{{data.badge}}</span>
        </div>
        <p class="card-description">{{data.description}}</p>
        <div class="card-footer">
          <span class="card-price" *ngIf="data.price">{{data.price}}</span>
          <div class="card-actions">
            <button class="btn-secondary" (click)="onLike($event)">Like</button>
            <button class="btn-primary" (click)="onPrimaryAction($event)">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  \`
})
export class ContentCardComponent {
  @Input() data!: CardData;
  @Output() cardClick = new EventEmitter<CardData>();
  @Output() viewClick = new EventEmitter<CardData>();
  @Output() likeClick = new EventEmitter<CardData>();
  @Output() primaryAction = new EventEmitter<CardData>();

  onCardClick() {
    this.cardClick.emit(this.data);
  }

  onViewClick(event: Event) {
    event.stopPropagation();
    this.viewClick.emit(this.data);
  }

  onLike(event: Event) {
    event.stopPropagation();  
    this.likeClick.emit(this.data);
  }

  onPrimaryAction(event: Event) {
    event.stopPropagation();
    this.primaryAction.emit(this.data);
  }
}`,
          javascript: `class ContentCardComponent {
  constructor(data) {
    this.data = data;
  }
  
  onCardClick() {
    console.log('Card clicked:', this.data);
  }
  
  onViewClick(event) {
    event.stopPropagation();
    console.log('View clicked:', this.data);
  }
  
  onLike(event) {
    event.stopPropagation();
    console.log('Like clicked:', this.data);
  }
  
  onPrimaryAction(event) {
    event.stopPropagation();
    console.log('Primary action:', this.data);
  }
}`
        },
        dependencies: ['@angular/core', '@angular/common'],
        designDependencies: { '@angular/material': '^17.0.0' },
        props: [
          { name: 'data', type: 'CardData', required: true, description: 'Card content data' },
          { name: 'cardClick', type: 'EventEmitter', required: false, description: 'Card click event' }
        ],
        features: ['Hover Effects', 'Image Overlay', 'Badge Support', 'Action Buttons'],
        usage: 'Perfect for product listings, blog posts, portfolio items',
        options: {
          responsive: true,
          accessibility: true,
          darkMode: false,
          animations: true,
          typescript: true,
          tests: false,
          includeBootstrap: false,
          includeMaterialDesign: true
        },
        preview: `<div style="max-width: 320px; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
  <div style="height: 160px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">🎨</div>
  <div style="padding: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <h3 style="margin: 0; color: #1f2937; font-size: 1.1rem; font-weight: 700;">Amazing Product</h3>
      <span style="background: #ef4444; color: white; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 12px;">NEW</span>
    </div>
    <p style="color: #6b7280; line-height: 1.4; margin-bottom: 16px; font-size: 14px;">Beautiful content card component for products and articles.</p>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 1.3rem; font-weight: 700; color: #059669;">$299</span>
      <div style="display: flex; gap: 8px;">
        <button style="padding: 6px 12px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; background: #f3f4f6; color: #374151; font-size: 12px;">Like</button>
        <button style="padding: 6px 12px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; background: #667eea; color: white; font-size: 12px;">Buy Now</button>
      </div>
    </div>
  </div>
</div>`,
        previewWithDesign: `<div style="max-width: 320px; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
  <div style="height: 160px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">🎨</div>
  <div style="padding: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <h3 style="margin: 0; color: #1f2937; font-size: 1.1rem; font-weight: 700;">Amazing Product</h3>
      <span style="background: #ef4444; color: white; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 12px;">NEW</span>
    </div>
    <p style="color: #6b7280; line-height: 1.4; margin-bottom: 16px; font-size: 14px;">Beautiful content card component for products and articles.</p>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 1.3rem; font-weight: 700; color: #059669;">$299</span>
      <div style="display: flex; gap: 8px;">
        <button style="padding: 6px 12px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; background: #f3f4f6; color: #374151; font-size: 12px;">Like</button>
        <button style="padding: 6px 12px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; background: #667eea; color: white; font-size: 12px;">Buy Now</button>
      </div>
    </div>
  </div>
</div>`,
        generationMetadata: {
          model: 'gpt-4',
          tokensUsed: 1520,
          generationTime: 15,
          completionId: 'cmpl_123464',
          temperature: 0.7
        },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['card', 'content', 'product', 'image'],
        views: 145,
        likes: 29,
        downloads: 15,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      // 9. Alert Notification
      {
        id: 'comp_9',
        name: 'Alert Notification',
        description: 'Customizable alert component with different types and dismiss functionality',
        prompt: 'Create alert notifications with success, warning, error, and info states',
        framework: 'Angular',
        category: 'Feedback',
        styleTheme: 'modern',
        designFramework: 'material',
        code: {
          html: `<div class="alert alert-success" role="alert">
  <div class="alert-icon">✓</div>
  <div class="alert-content">
    <div class="alert-title">Success!</div>
    <div class="alert-message">Your changes have been saved successfully.</div>
  </div>
  <button class="alert-close">&times;</button>
</div>`,
          css: `.alert {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  border-left: 4px solid;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.alert-success {
  background: #f0fdf4;
  border-left-color: #22c55e;
  color: #166534;
}

.alert-warning {
  background: #fffbeb;
  border-left-color: #f59e0b;
  color: #92400e;
}

.alert-error {
  background: #fef2f2;
  border-left-color: #ef4444;
  color: #991b1b;
}

.alert-info {
  background: #eff6ff;
  border-left-color: #3b82f6;
  color: #1e40af;
}

.alert-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  margin-right: 12px;
}

.alert-content {
  flex-grow: 1;
}

.alert-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.alert-message {
  font-size: 14px;
  opacity: 0.8;
}

.alert-close {
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.5;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.alert-close:hover {
  opacity: 1;
  background: rgba(0,0,0,0.1);
}`,
          typescript: `import { Component, Input, Output, EventEmitter } from '@angular/core';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

export interface AlertData {
  id?: string;
  type: AlertType;
  title: string;
  message: string;
  dismissible?: boolean;
  autoClose?: number;
}

@Component({
  selector: 'app-alert',
  template: \`
    <div 
      class="alert"
      [ngClass]="'alert-' + alert.type"
      [@slideIn]
      role="alert">
      <div class="alert-icon">{{ getIcon() }}</div>
      <div class="alert-content">
        <div class="alert-title">{{ alert.title }}</div>
        <div class="alert-message">{{ alert.message }}</div>
      </div>
      <button 
        *ngIf="alert.dismissible !== false"
        class="alert-close"
        (click)="onDismiss()"
        aria-label="Close">&times;</button>
    </div>
  \`,
  animations: [
    // Add animation definitions here
  ]
})
export class AlertComponent {
  @Input() alert!: AlertData;
  @Output() dismiss = new EventEmitter<string>();

  ngOnInit() {
    if (this.alert.autoClose && this.alert.autoClose > 0) {
      setTimeout(() => {
        this.onDismiss();
      }, this.alert.autoClose);
    }
  }

  getIcon(): string {
    const icons = {
      success: '✓',
      warning: '⚠',
      error: '✕',
      info: 'ℹ'
    };
    return icons[this.alert.type] || 'ℹ';
  }

  onDismiss() {
    this.dismiss.emit(this.alert.id);
  }
}`,
          javascript: `class AlertComponent {
  constructor(alert) {
    this.alert = alert;
    this.autoCloseTimer = null;
    
    if (this.alert.autoClose && this.alert.autoClose > 0) {
      this.autoCloseTimer = setTimeout(() => {
        this.onDismiss();
      }, this.alert.autoClose);
    }
  }
  
  getIcon() {
    const icons = {
      success: '✓',
      warning: '⚠',
      error: '✕',
      info: 'ℹ'
    };
    return icons[this.alert.type] || 'ℹ';
  }
  
  onDismiss() {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
    console.log('Alert dismissed:', this.alert.id);
  }
}`
        },
        dependencies: ['@angular/core', '@angular/common', '@angular/animations'],
        designDependencies: { '@angular/material': '^17.0.0' },
        props: [
          { name: 'alert', type: 'AlertData', required: true, description: 'Alert configuration object' },
          { name: 'dismiss', type: 'EventEmitter', required: false, description: 'Dismiss event emitter' }
        ],
        features: ['Multiple Types', 'Auto Dismiss', 'Custom Icons', 'Smooth Animations'],
        usage: 'Essential for user feedback, form validation, and system notifications',
        options: {
          responsive: true,
          accessibility: true,
          darkMode: false,
          animations: true,
          typescript: true,
          tests: false,
          includeBootstrap: false,
          includeMaterialDesign: true
        },
        preview: `<div style="padding: 20px; max-width: 500px; margin: 0 auto;">
  <div style="display: flex; align-items: flex-start; padding: 16px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #22c55e; background: #f0fdf4; color: #166534;">
    <div style="flex-shrink: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; margin-right: 12px;">✓</div>
    <div style="flex-grow: 1;">
      <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">Success!</div>
      <div style="font-size: 14px; opacity: 0.8;">Your changes have been saved successfully.</div>
    </div>
    <button style="flex-shrink: 0; background: none; border: none; font-size: 20px; cursor: pointer; opacity: 0.5; padding: 0; width: 24px; height: 24px;">&times;</button>
  </div>
  <div style="display: flex; align-items: flex-start; padding: 16px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #f59e0b; background: #fffbeb; color: #92400e;">
    <div style="flex-shrink: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; margin-right: 12px;">⚠</div>
    <div style="flex-grow: 1;">
      <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">Warning!</div>
      <div style="font-size: 14px; opacity: 0.8;">Please check your input data.</div>
    </div>
  </div>
</div>`,
        previewWithDesign: `<div style="padding: 20px; max-width: 500px; margin: 0 auto;">
  <div style="display: flex; align-items: flex-start; padding: 16px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #22c55e; background: #f0fdf4; color: #166534;">
    <div style="flex-shrink: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; margin-right: 12px;">✓</div>
    <div style="flex-grow: 1;">
      <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">Success!</div>
      <div style="font-size: 14px; opacity: 0.8;">Your changes have been saved successfully.</div>
    </div>
    <button style="flex-shrink: 0; background: none; border: none; font-size: 20px; cursor: pointer; opacity: 0.5; padding: 0; width: 24px; height: 24px;">&times;</button>
  </div>
  <div style="display: flex; align-items: flex-start; padding: 16px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #f59e0b; background: #fffbeb; color: #92400e;">
    <div style="flex-shrink: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; margin-right: 12px;">⚠</div>
    <div style="flex-grow: 1;">
      <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">Warning!</div>
      <div style="font-size: 14px; opacity: 0.8;">Please check your input data.</div>
    </div>
  </div>
</div>`,
        generationMetadata: {
          model: 'gpt-4',
          tokensUsed: 1420,
          generationTime: 14,
          completionId: 'cmpl_123465',
          temperature: 0.7
        },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['alert', 'notification', 'feedback', 'toast'],
        views: 198,
        likes: 42,
        downloads: 28,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      // 10. Tab Navigation
      {
        id: 'comp_10',
        name: 'Tab Navigation',
        description: 'Interactive tab component with smooth transitions and dynamic content',
        prompt: 'Create a tab navigation component with content switching',
        framework: 'Angular',
        category: 'Navigation',
        styleTheme: 'modern',
        designFramework: 'material',
        code: {
          html: `<div class="tab-container">
  <div class="tab-nav">
    <button class="tab-button active">Overview</button>
    <button class="tab-button">Features</button>
    <button class="tab-button">Pricing</button>
  </div>
  <div class="tab-content">
    <div class="tab-panel active">
      <h3>Overview</h3>
      <p>Welcome to our amazing product overview.</p>
    </div>
  </div>
</div>`,
          css: `.tab-container { max-width: 600px; margin: 0 auto; }
.tab-nav { display: flex; border-bottom: 2px solid #e5e7eb; margin-bottom: 24px; }
.tab-button { background: none; border: none; padding: 12px 24px; cursor: pointer; font-weight: 600; color: #6b7280; border-bottom: 3px solid transparent; transition: all 0.3s ease; }
.tab-button:hover { color: #374151; background: #f9fafb; }
.tab-button.active { color: #667eea; border-bottom-color: #667eea; }
.tab-content { min-height: 200px; }
.tab-panel { display: none; animation: fadeIn 0.3s ease; }
.tab-panel.active { display: block; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`,
          typescript: `@Component({
  selector: 'app-tabs',
  template: \`<div class="tab-container">
    <div class="tab-nav">
      <button *ngFor="let tab of tabs" class="tab-button" [class.active]="tab.id === activeTab" (click)="selectTab(tab.id)">{{tab.label}}</button>
    </div>
    <div class="tab-content">
      <div class="tab-panel active" [innerHTML]="getActiveContent()"></div>
    </div>
  </div>\`
})
export class TabsComponent {
  tabs = [
    { id: 'overview', label: 'Overview', content: '<h3>Overview</h3><p>Product overview.</p>' },
    { id: 'features', label: 'Features', content: '<h3>Features</h3><p>Amazing features.</p>' }
  ];
  activeTab = 'overview';
  selectTab(tabId: string) { this.activeTab = tabId; }
  getActiveContent(): string { return this.tabs.find(t => t.id === this.activeTab)?.content || ''; }
}`,
          javascript: `class TabsComponent {
  constructor() {
    this.tabs = [
      { id: 'overview', label: 'Overview', content: '<h3>Overview</h3><p>Product overview.</p>' },
      { id: 'features', label: 'Features', content: '<h3>Features</h3><p>Amazing features.</p>' }
    ];
    this.activeTab = 'overview';
  }
  
  selectTab(tabId) {
    this.activeTab = tabId;
    this.updateActiveTab();
  }
  
  updateActiveTab() {
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach((btn, index) => {
      btn.classList.toggle('active', this.tabs[index]?.id === this.activeTab);
    });
    
    const content = document.querySelector('.tab-panel');
    if (content) {
      content.innerHTML = this.getActiveContent();
    }
  }
  
  getActiveContent() {
    const activeTab = this.tabs.find(t => t.id === this.activeTab);
    return activeTab ? activeTab.content : '';
  }
}`
        },
        dependencies: ['@angular/core', '@angular/common'],
        designDependencies: { '@angular/material': '^17.0.0' },
        props: [
          { name: 'tabs', type: 'TabItem[]', required: true, description: 'Array of tab items' }
        ],
        features: ['Smooth Transitions', 'Dynamic Content', 'Keyboard Navigation'],
        usage: 'Perfect for organizing content into sections and dashboards',
        options: {
          responsive: true,
          accessibility: true,
          darkMode: false,
          animations: true,
          typescript: true,
          tests: false,
          includeBootstrap: false,
          includeMaterialDesign: true
        },
        preview: `<div style="max-width: 500px; margin: 0 auto; padding: 20px;">
  <div style="display: flex; border-bottom: 2px solid #e5e7eb; margin-bottom: 20px;">
    <button style="background: none; border: none; padding: 12px 20px; cursor: pointer; font-weight: 600; color: #667eea; border-bottom: 3px solid #667eea;">Overview</button>
    <button style="background: none; border: none; padding: 12px 20px; cursor: pointer; font-weight: 600; color: #6b7280;">Features</button>
    <button style="background: none; border: none; padding: 12px 20px; cursor: pointer; font-weight: 600; color: #6b7280;">Pricing</button>
  </div>
  <div style="min-height: 120px; padding: 16px; background: #f9fafb; border-radius: 8px;">
    <h4 style="margin: 0 0 8px 0; color: #1f2937;">Overview</h4>
    <p style="margin: 0; color: #6b7280; line-height: 1.5;">Welcome to our amazing product overview section.</p>
  </div>
</div>`,
        previewWithDesign: `<div style="max-width: 500px; margin: 0 auto; padding: 20px;">
  <div style="display: flex; border-bottom: 2px solid #e5e7eb; margin-bottom: 20px;">
    <button style="background: none; border: none; padding: 12px 20px; cursor: pointer; font-weight: 600; color: #667eea; border-bottom: 3px solid #667eea;">Overview</button>
    <button style="background: none; border: none; padding: 12px 20px; cursor: pointer; font-weight: 600; color: #6b7280;">Features</button>
    <button style="background: none; border: none; padding: 12px 20px; cursor: pointer; font-weight: 600; color: #6b7280;">Pricing</button>
  </div>
  <div style="min-height: 120px; padding: 16px; background: #f9fafb; border-radius: 8px;">
    <h4 style="margin: 0 0 8px 0; color: #1f2937;">Overview</h4>
    <p style="margin: 0; color: #6b7280; line-height: 1.5;">Welcome to our amazing product overview section.</p>
  </div>
</div>`,
        generationMetadata: {
          model: 'gpt-4',
          tokensUsed: 1180,
          generationTime: 12,
          completionId: 'cmpl_123466',
          temperature: 0.7
        },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['tabs', 'navigation', 'content'],
        views: 167,
        likes: 31,
        downloads: 17,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      // 11-25: Additional Popular Components
      ...this.generateAdditionalComponents()
    ];

    this._components.set(mockComponents);
  }

  private generateAdditionalComponents(): GeneratedComponent[] {
    return [
      // 11. Progress Bar
      {
        id: 'comp_11',
        name: 'Progress Bar',
        description: 'Animated progress bar with percentage display',
        prompt: 'Create an animated progress bar component',
        framework: 'Angular',
        category: 'Feedback',
        styleTheme: 'modern',
        designFramework: 'material',
        code: {
          html: `<div class="progress-container">
  <div class="progress-bar">
    <div class="progress-fill" style="width: 75%"></div>
  </div>
  <span class="progress-text">75%</span>
</div>`,
          css: `.progress-container { display: flex; align-items: center; gap: 12px; }
.progress-bar { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); transition: width 0.3s ease; }
.progress-text { font-weight: 600; color: #667eea; min-width: 40px; text-align: right; }`,
          javascript: `class ProgressBarComponent {
  constructor() {
    this.value = 0;
  }
  
  setValue(newValue) {
    this.value = Math.max(0, Math.min(100, newValue));
    this.updateDisplay();
  }
  
  updateDisplay() {
    const fill = document.querySelector('.progress-fill');
    const text = document.querySelector('.progress-text');
    if (fill && text) {
      fill.style.width = this.value + '%';
      text.textContent = this.value + '%';
    }
  }
}`,
          typescript: `@Component({
  selector: 'app-progress-bar',
  template: \`<div class="progress-container">
    <div class="progress-bar">
      <div class="progress-fill" [style.width.%]="value"></div>
    </div>
    <span class="progress-text">{{value}}%</span>
  </div>\`
})
export class ProgressBarComponent {
  @Input() value: number = 0;
}`
        },
        dependencies: ['@angular/core'],
        designDependencies: { '@angular/material': '^17.0.0' },
        props: [{ name: 'value', type: 'number', required: true, description: 'Progress percentage' }],
        features: ['Smooth Animation', 'Percentage Display'],
        usage: 'Perfect for loading states and progress tracking',
        options: { 
          responsive: true, 
          accessibility: true, 
          darkMode: false,
          animations: true, 
          typescript: true,
          tests: false,
          includeBootstrap: false,
          includeMaterialDesign: true
        },
        preview: `<div style="display: flex; align-items: center; gap: 12px; padding: 20px; max-width: 300px;">
  <div style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
    <div style="height: 100%; width: 75%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);"></div>
  </div>
  <span style="font-weight: 600; color: #667eea; min-width: 40px;">75%</span>
</div>`,
        previewWithDesign: `<div style="display: flex; align-items: center; gap: 12px; padding: 20px; max-width: 300px;">
  <div style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
    <div style="height: 100%; width: 75%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);"></div>
  </div>
  <span style="font-weight: 600; color: #667eea; min-width: 40px;">75%</span>
</div>`,
        generationMetadata: { model: 'gpt-4', tokensUsed: 980, generationTime: 9, completionId: 'cmpl_123467', temperature: 0.7 },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['progress', 'loading', 'animation'],
        views: 134,
        likes: 26,
        downloads: 14,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      // 12. Badge Component
      {
        id: 'comp_12',
        name: 'Badge Component',
        description: 'Versatile badge with multiple variants',
        prompt: 'Create a badge component with different styles',
        framework: 'Angular',
        category: 'UI Component',
        styleTheme: 'modern',
        designFramework: 'material',
        code: {
          html: `<span class="badge badge-primary">Primary</span>`,
          css: `.badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.badge-primary { background: #667eea; color: white; }
.badge-success { background: #10b981; color: white; }
.badge-warning { background: #f59e0b; color: white; }`,
          javascript: `class BadgeComponent {
  constructor(variant = 'primary') {
    this.variant = variant;
  }
  
  setVariant(newVariant) {
    this.variant = newVariant;
    this.updateClasses();
  }
  
  updateClasses() {
    const badge = document.querySelector('.badge');
    if (badge) {
      badge.className = 'badge badge-' + this.variant;
    }
  }
}`,
          typescript: `@Component({
  selector: 'app-badge',
  template: \`<span class="badge" [ngClass]="'badge-' + variant"><ng-content></ng-content></span>\`
})
export class BadgeComponent {
  @Input() variant: 'primary' | 'success' | 'warning' = 'primary';
}`
        },
        dependencies: ['@angular/core'],
        designDependencies: { '@angular/material': '^17.0.0' },
        props: [{ name: 'variant', type: 'string', required: false, description: 'Badge color variant' }],
        features: ['Multiple Variants', 'Size Options'],
        usage: 'Perfect for status indicators and labels',
        options: { 
          responsive: true, 
          accessibility: true, 
          darkMode: false,
          animations: false,
          typescript: true,
          tests: false,
          includeBootstrap: false,
          includeMaterialDesign: true
        },
        preview: `<div style="display: flex; gap: 8px; padding: 20px;">
  <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #667eea; color: white;">Primary</span>
  <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #10b981; color: white;">Success</span>
  <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #f59e0b; color: white;">Warning</span>
</div>`,
        previewWithDesign: `<div style="display: flex; gap: 8px; padding: 20px;">
  <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #667eea; color: white;">Primary</span>
  <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #10b981; color: white;">Success</span>
  <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #f59e0b; color: white;">Warning</span>
</div>`,
        generationMetadata: { model: 'gpt-4', tokensUsed: 820, generationTime: 8, completionId: 'cmpl_123468', temperature: 0.7 },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['badge', 'label', 'status'],
        views: 98,
        likes: 19,
        downloads: 9,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      // 13-30: More Popular Components
      ...this.generateMorePopularComponents()
    ];
  }

  private generateMorePopularComponents(): GeneratedComponent[] {
    return [
      // 13. Accordion
      {
        id: 'comp_13',
        name: 'Accordion',
        description: 'Collapsible content panels with smooth animations',
        prompt: 'Create an accordion component with expandable sections',
        framework: 'Angular',
        category: 'Layout',
        styleTheme: 'modern',
        designFramework: 'material',
        code: {
          html: `<div class="accordion">
  <div class="accordion-item">
    <div class="accordion-header">
      <button class="accordion-toggle">Section 1</button>
      <span class="accordion-icon">▼</span>
    </div>
    <div class="accordion-content">
      <p>This is the content for section 1.</p>
    </div>
  </div>
</div>`,
          css: `.accordion { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.accordion-item { border-bottom: 1px solid #e5e7eb; }
.accordion-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f9fafb; cursor: pointer; }
.accordion-toggle { background: none; border: none; font-weight: 600; text-align: left; flex: 1; }
.accordion-content { padding: 16px; display: none; }
.accordion-item.open .accordion-content { display: block; }
.accordion-item.open .accordion-icon { transform: rotate(180deg); }`,
          javascript: `class AccordionComponent {
  constructor() {
    this.items = [];
  }
  
  toggle(index) {
    const item = document.querySelectorAll('.accordion-item')[index];
    item.classList.toggle('open');
  }
}`,
          typescript: `@Component({
  selector: 'app-accordion',
  template: \`
    <div class="accordion">
      <div class="accordion-item" *ngFor="let item of items; let i = index" [class.open]="item.isOpen">
        <div class="accordion-header" (click)="toggle(i)">
          <button class="accordion-toggle">{{item.title}}</button>
          <span class="accordion-icon">▼</span>
        </div>
        <div class="accordion-content">
          <p>{{item.content}}</p>
        </div>
      </div>
    </div>
  \`
})
export class AccordionComponent {
  @Input() items: AccordionItem[] = [];
  
  toggle(index: number) {
    this.items[index].isOpen = !this.items[index].isOpen;
  }
}`
        },
        dependencies: ['@angular/core', '@angular/common'],
        designDependencies: { '@angular/material': '^17.0.0' },
        props: [{ name: 'items', type: 'AccordionItem[]', required: true, description: 'Array of accordion items' }],
        features: ['Smooth Animations', 'Multiple Sections', 'Keyboard Support'],
        usage: 'Perfect for FAQs, documentation, and content organization',
        options: { responsive: true, accessibility: true, darkMode: false, animations: true, typescript: true, tests: false, includeBootstrap: false, includeMaterialDesign: true },
        preview: `<div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; max-width: 400px; margin: 0 auto;">
  <div style="border-bottom: 1px solid #e5e7eb;">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f9fafb;">
      <span style="font-weight: 600;">Getting Started</span>
      <span>▼</span>
    </div>
    <div style="padding: 16px; background: white;">
      <p style="margin: 0; color: #6b7280;">Learn the basics of our platform with this comprehensive guide.</p>
    </div>
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f9fafb;">
    <span style="font-weight: 600;">Advanced Features</span>
    <span>▼</span>
  </div>
</div>`,
        previewWithDesign: `<div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; max-width: 400px; margin: 0 auto;">
  <div style="border-bottom: 1px solid #e5e7eb;">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f9fafb;">
      <span style="font-weight: 600;">Getting Started</span>
      <span>▼</span>
    </div>
    <div style="padding: 16px; background: white;">
      <p style="margin: 0; color: #6b7280;">Learn the basics of our platform with this comprehensive guide.</p>
    </div>
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f9fafb;">
    <span style="font-weight: 600;">Advanced Features</span>
    <span>▼</span>
  </div>
</div>`,
        generationMetadata: { model: 'gpt-4', tokensUsed: 1150, generationTime: 12, completionId: 'cmpl_123469', temperature: 0.7 },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['accordion', 'collapsible', 'layout', 'faq'],
        views: 145,
        likes: 28,
        downloads: 16,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      // 14. Dropdown Select
      {
        id: 'comp_14',
        name: 'Dropdown Select',
        description: 'Elegant dropdown with search and multi-select support',
        prompt: 'Create a dropdown select component with search functionality',
        framework: 'Angular',
        category: 'Form',
        styleTheme: 'modern',
        designFramework: 'material',
        code: {
          html: `<div class="dropdown-select">
  <button class="dropdown-trigger">Choose an option</button>
  <div class="dropdown-menu">
    <input type="text" class="dropdown-search" placeholder="Search...">
    <div class="dropdown-option">Option 1</div>
    <div class="dropdown-option">Option 2</div>
    <div class="dropdown-option">Option 3</div>
  </div>
</div>`,
          css: `.dropdown-select { position: relative; width: 100%; }
.dropdown-trigger { width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; background: white; text-align: left; cursor: pointer; }
.dropdown-menu { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 2px solid #e5e7eb; border-radius: 8px; margin-top: 4px; z-index: 1000; display: none; }
.dropdown-select.open .dropdown-menu { display: block; }
.dropdown-search { width: 100%; padding: 12px; border: none; border-bottom: 1px solid #e5e7eb; }
.dropdown-option { padding: 12px 16px; cursor: pointer; }
.dropdown-option:hover { background: #f3f4f6; }`,
          javascript: `class DropdownSelectComponent {
  constructor() {
    this.isOpen = false;
    this.selectedValue = '';
    this.options = [];
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    const dropdown = document.querySelector('.dropdown-select');
    dropdown.classList.toggle('open', this.isOpen);
  }
  
  select(option) {
    this.selectedValue = option;
    this.isOpen = false;
    this.updateDisplay();
  }
}`,
          typescript: `@Component({
  selector: 'app-dropdown-select',
  template: \`
    <div class="dropdown-select" [class.open]="isOpen">
      <button class="dropdown-trigger" (click)="toggle()">
        {{selectedValue || placeholder}}
      </button>
      <div class="dropdown-menu" *ngIf="isOpen">
        <input type="text" class="dropdown-search" 
               [(ngModel)]="searchTerm" 
               (input)="filterOptions()" 
               placeholder="Search...">
        <div class="dropdown-option" 
             *ngFor="let option of filteredOptions" 
             (click)="select(option)">
          {{option.label}}
        </div>
      </div>
    </div>
  \`
})
export class DropdownSelectComponent {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select an option';
  @Output() selectionChange = new EventEmitter<SelectOption>();
  
  isOpen = false;
  selectedValue = '';
  searchTerm = '';
  filteredOptions = this.options;
  
  toggle() {
    this.isOpen = !this.isOpen;
  }
  
  select(option: SelectOption) {
    this.selectedValue = option.label;
    this.isOpen = false;
    this.selectionChange.emit(option);
  }
  
  filterOptions() {
    this.filteredOptions = this.options.filter(option =>
      option.label.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}`
        },
        dependencies: ['@angular/core', '@angular/common', '@angular/forms'],
        designDependencies: { '@angular/material': '^17.0.0' },
        props: [
          { name: 'options', type: 'SelectOption[]', required: true, description: 'Array of select options' },
          { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text' }
        ],
        features: ['Search Functionality', 'Keyboard Navigation', 'Multi-select Support', 'Custom Options'],
        usage: 'Essential for forms, filters, and user selections',
        options: { responsive: true, accessibility: true, darkMode: false, animations: true, typescript: true, tests: false, includeBootstrap: false, includeMaterialDesign: true },
        preview: `<div style="position: relative; width: 300px; margin: 20px auto;">
  <button style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; background: white; text-align: left; cursor: pointer;">Choose a framework</button>
  <div style="position: absolute; top: 100%; left: 0; right: 0; background: white; border: 2px solid #e5e7eb; border-radius: 8px; margin-top: 4px; z-index: 1000;">
    <input type="text" style="width: 100%; padding: 12px; border: none; border-bottom: 1px solid #e5e7eb; box-sizing: border-box;" placeholder="Search..." readonly>
    <div style="padding: 12px 16px; cursor: pointer; background: #f3f4f6;">Angular</div>
    <div style="padding: 12px 16px; cursor: pointer;">React</div>
    <div style="padding: 12px 16px; cursor: pointer;">Vue</div>
  </div>
</div>`,
        previewWithDesign: `<div style="position: relative; width: 300px; margin: 20px auto;">
  <button style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; background: white; text-align: left; cursor: pointer;">Choose a framework</button>
  <div style="position: absolute; top: 100%; left: 0; right: 0; background: white; border: 2px solid #e5e7eb; border-radius: 8px; margin-top: 4px; z-index: 1000;">
    <input type="text" style="width: 100%; padding: 12px; border: none; border-bottom: 1px solid #e5e7eb; box-sizing: border-box;" placeholder="Search..." readonly>
    <div style="padding: 12px 16px; cursor: pointer; background: #f3f4f6;">Angular</div>
    <div style="padding: 12px 16px; cursor: pointer;">React</div>
    <div style="padding: 12px 16px; cursor: pointer;">Vue</div>
  </div>
</div>`,
        generationMetadata: { model: 'gpt-4', tokensUsed: 1280, generationTime: 13, completionId: 'cmpl_123470', temperature: 0.7 },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['dropdown', 'select', 'form', 'search'],
        views: 187,
        likes: 35,
        downloads: 22,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      // 15. Avatar Component
      {
        id: 'comp_15',
        name: 'Avatar Component',
        description: 'User avatar with fallback options and status indicators',
        prompt: 'Create an avatar component with image fallback and status',
        framework: 'Angular',
        category: 'UI Component',
        styleTheme: 'modern',
        designFramework: 'material',
        code: {
          html: `<div class="avatar-container">
  <div class="avatar avatar-lg">
    <img src="https://i.pravatar.cc/150" alt="User Avatar">
    <div class="avatar-status online"></div>
  </div>
  <div class="avatar-info">
    <span class="avatar-name">John Doe</span>
    <span class="avatar-role">Developer</span>
  </div>
</div>`,
          css: `.avatar-container { display: flex; align-items: center; gap: 12px; }
.avatar { position: relative; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
.avatar-sm { width: 32px; height: 32px; }
.avatar-md { width: 48px; height: 48px; }
.avatar-lg { width: 64px; height: 64px; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-status { position: absolute; bottom: 0; right: 0; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; }
.avatar-status.online { background: #10b981; }
.avatar-status.offline { background: #6b7280; }
.avatar-status.busy { background: #ef4444; }
.avatar-info { display: flex; flex-direction: column; }
.avatar-name { font-weight: 600; color: #1f2937; }
.avatar-role { font-size: 14px; color: #6b7280; }`,
          javascript: `class AvatarComponent {
  constructor(options = {}) {
    this.src = options.src || '';
    this.name = options.name || '';
    this.size = options.size || 'md';
    this.status = options.status || 'offline';
  }
  
  getInitials() {
    return this.name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  
  onImageError() {
    // Show initials fallback
    const avatar = document.querySelector('.avatar');
    avatar.innerHTML = \`<div class="avatar-initials">\${this.getInitials()}</div>\`;
  }
}`,
          typescript: `@Component({
  selector: 'app-avatar',
  template: \`
    <div class="avatar-container">
      <div class="avatar" [ngClass]="'avatar-' + size">
        <img [src]="src" [alt]="name + ' Avatar'" (error)="showInitials = true" *ngIf="!showInitials">
        <div class="avatar-initials" *ngIf="showInitials">{{getInitials()}}</div>
        <div class="avatar-status" [ngClass]="status" *ngIf="showStatus"></div>
      </div>
      <div class="avatar-info" *ngIf="showInfo">
        <span class="avatar-name">{{name}}</span>
        <span class="avatar-role" *ngIf="role">{{role}}</span>
      </div>
    </div>
  \`
})
export class AvatarComponent {
  @Input() src: string = '';
  @Input() name: string = '';
  @Input() role: string = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() status: 'online' | 'offline' | 'busy' = 'offline';
  @Input() showStatus: boolean = false;
  @Input() showInfo: boolean = false;
  
  showInitials = false;
  
  getInitials(): string {
    return this.name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}`
        },
        dependencies: ['@angular/core', '@angular/common'],
        designDependencies: { '@angular/material': '^17.0.0' },
        props: [
          { name: 'src', type: 'string', required: false, description: 'Avatar image URL' },
          { name: 'name', type: 'string', required: true, description: 'User name' },
          { name: 'size', type: 'string', required: false, description: 'Avatar size (sm, md, lg)' }
        ],
        features: ['Image Fallback', 'Status Indicators', 'Multiple Sizes', 'Initials Support'],
        usage: 'Perfect for user profiles, comments, team displays, and user lists',
        options: { responsive: true, accessibility: true, darkMode: false, animations: false, typescript: true, tests: false, includeBootstrap: false, includeMaterialDesign: true },
        preview: `<div style="display: flex; align-items: center; gap: 12px; padding: 20px;">
  <div style="position: relative; width: 64px; height: 64px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 24px;">JD
    <div style="position: absolute; bottom: 0; right: 0; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; background: #10b981;"></div>
  </div>
  <div style="display: flex; flex-direction: column;">
    <span style="font-weight: 600; color: #1f2937;">John Doe</span>
    <span style="font-size: 14px; color: #6b7280;">Frontend Developer</span>
  </div>
</div>`,
        previewWithDesign: `<div style="display: flex; align-items: center; gap: 12px; padding: 20px;">
  <div style="position: relative; width: 64px; height: 64px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 24px;">JD
    <div style="position: absolute; bottom: 0; right: 0; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; background: #10b981;"></div>
  </div>
  <div style="display: flex; flex-direction: column;">
    <span style="font-weight: 600; color: #1f2937;">John Doe</span>
    <span style="font-size: 14px; color: #6b7280;">Frontend Developer</span>
  </div>
</div>`,
        generationMetadata: { model: 'gpt-4', tokensUsed: 1200, generationTime: 12, completionId: 'cmpl_123471', temperature: 0.7 },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['avatar', 'user', 'profile', 'image'],
        views: 203,
        likes: 41,
        downloads: 25,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      // 16. Toggle Switch  
      {
        id: 'comp_16',
        name: 'Toggle Switch',
        description: 'Modern toggle switch with smooth animations',
        prompt: 'Create a toggle switch component with animations',
        framework: 'Angular',
        category: 'Form',
        styleTheme: 'modern',
        designFramework: 'material',
        code: {
          html: `<div class="toggle-container">
  <label class="toggle-switch">
    <input type="checkbox" class="toggle-input">
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Enable notifications</span>
</div>`,
          css: `.toggle-container { display: flex; align-items: center; gap: 12px; }
.toggle-switch { position: relative; display: inline-block; width: 52px; height: 28px; }
.toggle-input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #ccc; transition: .4s; border-radius: 28px; }
.toggle-slider:before { position: absolute; content: ""; height: 22px; width: 22px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
.toggle-input:checked + .toggle-slider { background: #667eea; }
.toggle-input:checked + .toggle-slider:before { transform: translateX(24px); }`,
          javascript: `class ToggleSwitchComponent {
  constructor() {
    this.checked = false;
  }
  toggle() {
    this.checked = !this.checked;
  }
}`,
          typescript: `@Component({
  selector: 'app-toggle-switch',
  template: \`
    <div class="toggle-container">
      <label class="toggle-switch">
        <input type="checkbox" class="toggle-input" [checked]="checked" (change)="onToggle($event)">
        <span class="toggle-slider"></span>
      </label>
      <span class="toggle-label" *ngIf="label">{{label}}</span>
    </div>
  \`
})
export class ToggleSwitchComponent {
  @Input() checked: boolean = false;
  @Input() label: string = '';
  @Output() toggle = new EventEmitter<boolean>();
  
  onToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.toggle.emit(this.checked);
  }
}`
        },
        dependencies: ['@angular/core', '@angular/common'],
        designDependencies: { '@angular/material': '^17.0.0' },
        props: [
          { name: 'checked', type: 'boolean', required: false, description: 'Toggle state' },
          { name: 'label', type: 'string', required: false, description: 'Toggle label' }
        ],
        features: ['Smooth Animations', 'Keyboard Support', 'Custom Labels'],
        usage: 'Perfect for settings and boolean inputs',
        options: { responsive: true, accessibility: true, darkMode: false, animations: true, typescript: true, tests: false, includeBootstrap: false, includeMaterialDesign: true },
        preview: `<div style="display: flex; align-items: center; gap: 12px; padding: 20px;">
  <label style="position: relative; display: inline-block; width: 52px; height: 28px;">
    <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #667eea; transition: .4s; border-radius: 28px;">
      <span style="position: absolute; height: 22px; width: 22px; left: 27px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; display: block;"></span>
    </span>
  </label>
  <span style="font-weight: 500; color: #374151;">Enable notifications</span>
</div>`,
        previewWithDesign: `<div style="display: flex; align-items: center; gap: 12px; padding: 20px;">
  <label style="position: relative; display: inline-block; width: 52px; height: 28px;">
    <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #667eea; transition: .4s; border-radius: 28px;">
      <span style="position: absolute; height: 22px; width: 22px; left: 27px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; display: block;"></span>
    </span>
  </label>
  <span style="font-weight: 500; color: #374151;">Enable notifications</span>
</div>`,
        generationMetadata: { model: 'gpt-4', tokensUsed: 980, generationTime: 10, completionId: 'cmpl_123472', temperature: 0.7 },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['toggle', 'switch', 'form', 'boolean'],
        views: 164,
        likes: 32,
        downloads: 18,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      // 17. Rating Component
      {
        id: 'comp_17',
        name: 'Star Rating',
        description: 'Interactive star rating with hover effects and half stars',
        prompt: 'Create a star rating component with interactive features',
        framework: 'Angular',
        category: 'UI Component',
        styleTheme: 'modern',
        designFramework: 'material',
        code: {
          html: `<div class="rating-container">
  <div class="rating-stars">
    <span class="star filled">★</span>
    <span class="star filled">★</span>
    <span class="star filled">★</span>
    <span class="star half">★</span>
    <span class="star">★</span>
  </div>
  <span class="rating-text">3.5 out of 5</span>
</div>`,
          css: `.rating-container { display: flex; align-items: center; gap: 8px; }
.rating-stars { display: flex; gap: 2px; }
.star { font-size: 20px; cursor: pointer; transition: color 0.2s ease; color: #d1d5db; }
.star.filled { color: #fbbf24; }
.star.half { background: linear-gradient(90deg, #fbbf24 50%, #d1d5db 50%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.star:hover, .star.hovered { color: #f59e0b; }
.rating-text { font-size: 14px; color: #6b7280; font-weight: 500; }`,
          javascript: `class RatingComponent {
  constructor(rating = 0, maxRating = 5) {
    this.rating = rating;
    this.maxRating = maxRating;
    this.hoveredRating = 0;
  }
  
  setRating(newRating) {
    this.rating = newRating;
    this.updateDisplay();
  }
  
  onStarHover(starIndex) {
    this.hoveredRating = starIndex;
    this.updateHoverDisplay();
  }
  
  onStarClick(starIndex) {
    this.setRating(starIndex);
  }
}`,
          typescript: `@Component({
  selector: 'app-star-rating',
  template: \`
    <div class="rating-container">
      <div class="rating-stars">
        <span *ngFor="let star of stars; let i = index"
              class="star"
              [class.filled]="i < Math.floor(rating)"
              [class.half]="i === Math.floor(rating) && rating % 1 !== 0"
              [class.hovered]="i < hoveredRating"
              (click)="onStarClick(i + 1)"
              (mouseenter)="onStarHover(i + 1)"
              (mouseleave)="onStarLeave()">
          ★
        </span>
      </div>
      <span class="rating-text" *ngIf="showText">
        {{rating}} out of {{maxRating}}
      </span>
    </div>
  \`
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;
  @Input() readonly: boolean = false;
  @Input() showText: boolean = true;
  @Output() ratingChange = new EventEmitter<number>();
  
  hoveredRating = 0;
  
  get stars() {
    return Array(this.maxRating).fill(0);
  }
  
  onStarClick(rating: number) {
    if (!this.readonly) {
      this.rating = rating;
      this.ratingChange.emit(rating);
    }
  }
  
  onStarHover(rating: number) {
    if (!this.readonly) {
      this.hoveredRating = rating;
    }
  }
  
  onStarLeave() {
    this.hoveredRating = 0;
  }
}`
        },
        dependencies: ['@angular/core', '@angular/common'],
        designDependencies: { '@angular/material': '^17.0.0' },
        props: [
          { name: 'rating', type: 'number', required: false, description: 'Current rating value' },
          { name: 'maxRating', type: 'number', required: false, description: 'Maximum rating value' }
        ],
        features: ['Interactive Stars', 'Half Star Support', 'Hover Effects', 'Read-only Mode'],
        usage: 'Perfect for product reviews, feedback forms, and rating displays',
        options: { responsive: true, accessibility: true, darkMode: false, animations: true, typescript: true, tests: false, includeBootstrap: false, includeMaterialDesign: true },
        preview: `<div style="display: flex; align-items: center; gap: 8px; padding: 20px;">
  <div style="display: flex; gap: 2px;">
    <span style="font-size: 20px; color: #fbbf24;">★</span>
    <span style="font-size: 20px; color: #fbbf24;">★</span>
    <span style="font-size: 20px; color: #fbbf24;">★</span>
    <span style="font-size: 20px; color: #fbbf24;">★</span>
    <span style="font-size: 20px; color: #d1d5db;">★</span>
  </div>
  <span style="font-size: 14px; color: #6b7280; font-weight: 500;">4.0 out of 5</span>
</div>`,
        previewWithDesign: `<div style="display: flex; align-items: center; gap: 8px; padding: 20px;">
  <div style="display: flex; gap: 2px;">
    <span style="font-size: 20px; color: #fbbf24;">★</span>
    <span style="font-size: 20px; color: #fbbf24;">★</span>
    <span style="font-size: 20px; color: #fbbf24;">★</span>
    <span style="font-size: 20px; color: #fbbf24;">★</span>
    <span style="font-size: 20px; color: #d1d5db;">★</span>
  </div>
  <span style="font-size: 14px; color: #6b7280; font-weight: 500;">4.0 out of 5</span>
</div>`,
        generationMetadata: { model: 'gpt-4', tokensUsed: 1120, generationTime: 11, completionId: 'cmpl_123475', temperature: 0.7 },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['rating', 'stars', 'review', 'feedback'],
        views: 189,
        likes: 37,
        downloads: 21,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      // 18. Tooltip Component
      {
        id: 'comp_18',
        name: 'Tooltip',
        description: 'Customizable tooltip with multiple positions and triggers',
        prompt: 'Create a tooltip component with position options',
        framework: 'Angular',
        category: 'UI Component',
        styleTheme: 'modern',
        designFramework: 'material',
        code: {
          html: `<div class="tooltip-container">
  <button class="tooltip-trigger">Hover me</button>
  <div class="tooltip tooltip-top">
    <div class="tooltip-content">This is a helpful tooltip!</div>
    <div class="tooltip-arrow"></div>
  </div>
</div>`,
          css: `.tooltip-container { position: relative; display: inline-block; }
.tooltip { position: absolute; z-index: 1000; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
.tooltip-container:hover .tooltip { opacity: 1; visibility: visible; }
.tooltip-content { background: #1f2937; color: white; padding: 8px 12px; border-radius: 6px; font-size: 14px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.tooltip-arrow { position: absolute; width: 0; height: 0; }
.tooltip-top { bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 8px; }
.tooltip-top .tooltip-arrow { top: 100%; left: 50%; transform: translateX(-50%); border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #1f2937; }
.tooltip-bottom { top: 100%; left: 50%; transform: translateX(-50%); margin-top: 8px; }
.tooltip-left { right: 100%; top: 50%; transform: translateY(-50%); margin-right: 8px; }
.tooltip-right { left: 100%; top: 50%; transform: translateY(-50%); margin-left: 8px; }`,
          javascript: `class TooltipComponent {
  constructor(options = {}) {
    this.content = options.content || '';
    this.position = options.position || 'top';
    this.trigger = options.trigger || 'hover';
    this.isVisible = false;
  }
  
  show() {
    this.isVisible = true;
  }
  
  hide() {
    this.isVisible = false;
  }
  
  toggle() {
    this.isVisible = !this.isVisible;
  }
}`,
          typescript: `@Component({
  selector: 'app-tooltip',
  template: \`
    <div class="tooltip-container" 
         (mouseenter)="onMouseEnter()" 
         (mouseleave)="onMouseLeave()"
         (click)="onClick()">
      <ng-content></ng-content>
      <div class="tooltip" 
           [ngClass]="'tooltip-' + position"
           [class.visible]="isVisible">
        <div class="tooltip-content">{{content}}</div>
        <div class="tooltip-arrow"></div>
      </div>
    </div>
  \`
})
export class TooltipComponent {
  @Input() content: string = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() trigger: 'hover' | 'click' | 'focus' = 'hover';
  @Input() disabled: boolean = false;
  
  isVisible = false;
  
  onMouseEnter() {
    if (this.trigger === 'hover' && !this.disabled) {
      this.show();
    }
  }
  
  onMouseLeave() {
    if (this.trigger === 'hover') {
      this.hide();
    }
  }
  
  onClick() {
    if (this.trigger === 'click' && !this.disabled) {
      this.toggle();
    }
  }
  
  show() {
    this.isVisible = true;
  }
  
  hide() {
    this.isVisible = false;
  }
  
  toggle() {
    this.isVisible = !this.isVisible;
  }
}`
        },
        dependencies: ['@angular/core', '@angular/common'],
        designDependencies: { '@angular/material': '^17.0.0' },
        props: [
          { name: 'content', type: 'string', required: true, description: 'Tooltip content text' },
          { name: 'position', type: 'string', required: false, description: 'Tooltip position (top, bottom, left, right)' }
        ],
        features: ['Multiple Positions', 'Hover/Click Triggers', 'Smooth Animations', 'Arrow Indicators'],
        usage: 'Essential for providing contextual help and additional information',
        options: { responsive: true, accessibility: true, darkMode: false, animations: true, typescript: true, tests: false, includeBootstrap: false, includeMaterialDesign: true },
        preview: `<div style="position: relative; display: inline-block; padding: 40px;">
  <button style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">Hover me</button>
  <div style="position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 8px; z-index: 1000;">
    <div style="background: #1f2937; color: white; padding: 8px 12px; border-radius: 6px; font-size: 14px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">This is a helpful tooltip!</div>
    <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #1f2937;"></div>
  </div>
</div>`,
        previewWithDesign: `<div style="position: relative; display: inline-block; padding: 40px;">
  <button style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">Hover me</button>
  <div style="position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 8px; z-index: 1000;">
    <div style="background: #1f2937; color: white; padding: 8px 12px; border-radius: 6px; font-size: 14px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">This is a helpful tooltip!</div>
    <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #1f2937;"></div>
  </div>
</div>`,
        generationMetadata: { model: 'gpt-4', tokensUsed: 1250, generationTime: 12, completionId: 'cmpl_123476', temperature: 0.7 },
        status: 'generated',
        isPublic: true,
        isSaved: false,
        tags: ['tooltip', 'hint', 'popup', 'help'],
        views: 156,
        likes: 29,
        downloads: 17,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }
      // Library now contains 18 popular, production-ready components!
    ];
  }

  private loadMockTemplates(): void {
    const mockTemplates: ComponentTemplate[] = [
      {
        id: 'template_1',
        name: 'Modern Button',
        description: 'A sleek, modern button with hover effects and multiple variants',
        framework: 'React',
        category: 'UI',
        designFramework: 'bootstrap',
        previewHtml: `<div style="display: flex; gap: 10px; align-items: center; justify-content: center; padding: 20px;">
  <button style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: transform 0.2s ease;">Primary</button>
  <button style="background: transparent; color: #667eea; border: 2px solid #667eea; padding: 10px 22px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">Secondary</button>
  <button style="background: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;">Success</button>
</div>`,
        complexity: 'simple',
        tags: ['button', 'ui', 'interactive'],
        popularity: 95,
        createdAt: new Date().toISOString()
      },
      {
        id: 'template_2',
        name: 'Card Component',
        description: 'Versatile card component with header, content, and action areas',
        framework: 'Angular',
        category: 'Layout',
        designFramework: 'material',
        previewHtml: `<div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
  <div style="height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">🎨</div>
  <div style="padding: 20px;">
    <h3 style="margin: 0 0 10px 0; color: #333; font-size: 1.4rem;">Beautiful Card</h3>
    <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">This is a beautiful card component with a gradient header and clean content area.</p>
    <div style="display: flex; gap: 10px;">
      <button style="background: #667eea; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Action</button>
      <button style="background: transparent; color: #667eea; border: 1px solid #667eea; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Learn More</button>
    </div>
  </div>
</div>`,
        complexity: 'medium',
        tags: ['card', 'layout', 'content'],
        popularity: 87,
        createdAt: new Date().toISOString()
      },
      {
        id: 'template_3',
        name: 'Navigation Menu',
        description: 'Responsive navigation menu with dropdown support',
        framework: 'Vue',
        category: 'Navigation',
        designFramework: 'tailwind',
        previewHtml: `<nav style="background: white; border-bottom: 1px solid #e5e7eb; padding: 0 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
  <div style="display: flex; justify-content: space-between; align-items: center; height: 60px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">L</div>
      <span style="font-weight: 700; color: #1f2937; font-size: 1.2rem;">Logo</span>
    </div>
    <div style="display: flex; gap: 30px; align-items: center;">
      <a href="#" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;">Home</a>
      <a href="#" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;">About</a>
      <a href="#" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;">Services</a>
      <a href="#" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;">Contact</a>
    </div>
    <button style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 8px 20px; border-radius: 6px; font-weight: 600; cursor: pointer;">Get Started</button>
  </div>
</nav>`,
        complexity: 'complex',
        tags: ['navigation', 'menu', 'responsive'],
        popularity: 92,
        createdAt: new Date().toISOString()
      }
    ];

    this._templates.set(mockTemplates);
  }
}