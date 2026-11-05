export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  code?: number;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: ApiPagination;
}

export interface ApiErrorPayload {
  message: string;
  statusCode?: number;
  code?: string;
  details?: Record<string, string[]>;
}
