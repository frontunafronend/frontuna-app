export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
  timestamp: Date;
  path: string;
  suggestion?: string;
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ResponseMeta;
}

export interface UploadResponse {
  success: boolean;
  fileId: string;
  filename: string;
  size: number;
  url: string;
  message?: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  uptime: number;
  version: string;
  services: ServiceStatus[];
  timestamp: Date;
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastCheck: Date;
  message?: string;
}