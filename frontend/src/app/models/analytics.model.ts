export interface AnalyticsData {
  overview: AnalyticsOverview;
  usage: UsageAnalytics;
  users: UserAnalytics;
  components: ComponentAnalytics;
  performance: PerformanceAnalytics;
  dateRange: DateRange;
}

export interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  totalGenerations: number;
  totalComponents: number;
  averageRating: number;
  conversionRate: number;
  revenue: number;
  growth: GrowthMetrics;
}

export interface GrowthMetrics {
  userGrowth: number; // percentage
  usageGrowth: number; // percentage
  revenueGrowth: number; // percentage
  period: string; // e.g., "30d", "7d", "1y"
}

export interface UsageAnalytics {
  generationsPerDay: TimeSeriesData[];
  topFrameworks: FrameworkUsage[];
  topCategories: CategoryUsage[];
  peakHours: HourlyUsage[];
  averageGenerationsPerUser: number;
  successRate: number;
}

export interface UserAnalytics {
  newUsersPerDay: TimeSeriesData[];
  activeUsersPerDay: TimeSeriesData[];
  userRetention: RetentionData[];
  subscriptionDistribution: SubscriptionDistribution[];
  topCountries: CountryUsage[];
  userEngagement: EngagementMetrics;
}

export interface ComponentAnalytics {
  mostPopularComponents: PopularComponent[];
  componentsByCategory: CategoryDistribution[];
  averageComplexity: ComplexityDistribution[];
  downloadStats: DownloadStats[];
  ratingDistribution: RatingDistribution[];
}

export interface PerformanceAnalytics {
  averageGenerationTime: number;
  apiResponseTimes: TimeSeriesData[];
  errorRates: ErrorRateData[];
  systemLoad: SystemLoadData[];
  uptime: number; // percentage
}

export interface TimeSeriesData {
  date: Date;
  value: number;
  label?: string;
}

export interface FrameworkUsage {
  framework: string;
  count: number;
  percentage: number;
  trend: number; // percentage change
}

export interface CategoryUsage {
  category: string;
  count: number;
  percentage: number;
  averageRating: number;
}

export interface HourlyUsage {
  hour: number; // 0-23
  count: number;
  percentage: number;
}

export interface RetentionData {
  period: string; // "1d", "7d", "30d", etc.
  percentage: number;
  cohort: Date;
}

export interface SubscriptionDistribution {
  plan: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface CountryUsage {
  country: string;
  code: string;
  count: number;
  percentage: number;
}

export interface EngagementMetrics {
  averageSessionDuration: number; // minutes
  pagesPerSession: number;
  bounceRate: number; // percentage
  returnVisitorRate: number; // percentage
}

export interface PopularComponent {
  id: string;
  name: string;
  framework: string;
  category: string;
  downloads: number;
  rating: number;
  createdAt: Date;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface ComplexityDistribution {
  complexity: string;
  count: number;
  percentage: number;
  averageTime: number; // generation time in ms
}

export interface DownloadStats {
  date: Date;
  downloads: number;
  uniqueUsers: number;
}

export interface RatingDistribution {
  rating: number; // 1-5
  count: number;
  percentage: number;
}

export interface ErrorRateData {
  date: Date;
  errorRate: number; // percentage
  totalRequests: number;
  errors: number;
}

export interface SystemLoadData {
  timestamp: Date;
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  diskUsage: number; // percentage
  activeConnections: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface AnalyticsFilter {
  dateRange: DateRange;
  framework?: string;
  category?: string;
  userRole?: string;
  subscription?: string;
  country?: string;
}

// Google Analytics specific models
export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface GAPageView {
  page_title: string;
  page_location: string;
  page_referrer?: string;
  user_id?: string;
  custom_parameters?: Record<string, any>;
}

export interface GATransaction {
  transaction_id: string;
  value: number;
  currency: string;
  items: GATransactionItem[];
}

export interface GATransactionItem {
  item_id: string;
  item_name: string;
  item_category: string;
  quantity: number;
  price: number;
}