export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: NotificationPriority;
  category: NotificationCategory;
  actionUrl?: string;
  actionText?: string;
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationCategory {
  SYSTEM = 'system',
  ACCOUNT = 'account',
  GENERATION = 'generation',
  SUBSCRIPTION = 'subscription',
  SECURITY = 'security',
  FEATURE = 'feature',
  MAINTENANCE = 'maintenance'
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    categories: NotificationCategory[];
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  push: {
    enabled: boolean;
    categories: NotificationCategory[];
  };
  inApp: {
    enabled: boolean;
    categories: NotificationCategory[];
  };
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  data?: any;
  actionUrl?: string;
  actionText?: string;
  expiresAt?: Date;
}

export interface NotificationFilter {
  isRead?: boolean;
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byCategory: Record<NotificationCategory, number>;
  byPriority: Record<NotificationPriority, number>;
}