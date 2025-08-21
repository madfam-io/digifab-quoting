export type UUID = string;
export type ISO8601 = string;
export type Locale = 'es' | 'en';

export interface Timestamped {
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface TenantScoped {
  tenantId: UUID;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: ISO8601;
    version: string;
  };
}