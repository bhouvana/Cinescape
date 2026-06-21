// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  timestamp: string
}

export interface PaginatedApiResponse<T> {
  success: boolean
  data: {
    items: T[]
    page: number
    totalPages: number
    totalResults: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  timestamp: string
}

export interface ApiRequestParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}
