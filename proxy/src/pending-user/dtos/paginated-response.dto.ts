export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
  total: number;
}
