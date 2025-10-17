// frontend/src/shared/api/types.ts

/**
 * Параметры пагинации для API запросов
 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_desc?: boolean;
}

/**
 * Пагинированный ответ от API
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Облегченная версия пользователя для списков
 * Соответствует UserListItem из backend
 */
export interface UserListItem {
  id: number;
  full_name: string;
  username: string;
  avatar_url?: string;
  emails: string[];
  phones: string[];
  position?: string;
  department?: string;
  role: string;
  is_active: boolean;
  is_online: boolean;
  last_seen?: string;
  created_at: string;
  show_in_selection: boolean;
  require_password_change: boolean;
}

/**
 * Ошибка API
 */
export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

/**
 * Кастомная ошибка приложения
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Utility функция для построения query параметров
 */
export function buildQueryParams(params: Record<string, unknown>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}
