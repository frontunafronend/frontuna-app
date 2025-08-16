export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  subscription: UserSubscription;
  usage: UserUsage;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  isTrialActive: boolean;
  trialEndDate?: Date;
}

export interface UserUsage {
  generationsUsed: number;
  generationsLimit: number;
  storageUsed: number; // in MB
  storageLimit: number; // in MB
  lastResetDate: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    updates: boolean;
    marketing: boolean;
  };
  ui: {
    enableAnimations: boolean;
    enableTooltips: boolean;
    compactMode: boolean;
  };
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  TRIAL = 'trial'
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  agreeToTerms: boolean;
  subscribeToNewsletter?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  company?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface TokenPayload {
  sub: string; // user ID
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}