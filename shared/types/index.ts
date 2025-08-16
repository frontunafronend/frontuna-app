// Shared types between frontend and backend

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Component {
  id: string;
  name: string;
  description: string;
  code: string;
  framework: 'react' | 'angular' | 'vue';
  category: string;
  tags: string[];
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationRequest {
  prompt: string;
  framework: 'react' | 'angular' | 'vue';
  componentName?: string;
  styling?: 'css' | 'scss' | 'tailwind' | 'bootstrap';
}

export interface GenerationResponse {
  success: boolean;
  component?: Component;
  code?: string;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
}

export interface UsageStats {
  totalComponents: number;
  componentsThisMonth: number;
  totalUsers: number;
  activeUsers: number;
  popularFrameworks: Record<string, number>;
  popularCategories: Record<string, number>;
}

export interface AdminDashboardData {
  stats: UsageStats;
  recentComponents: Component[];
  recentUsers: User[];
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    storage: 'healthy' | 'warning' | 'error';
  };
}