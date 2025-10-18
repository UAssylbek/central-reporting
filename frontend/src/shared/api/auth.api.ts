// frontend/src/shared/api/auth.api.ts
import { apiClient } from "./client";
import { logger } from "../utils/logger";

// Обновите только типы User в файле auth.api.ts

export type UserRole = "admin" | "moderator" | "user";

export interface SocialLinks {
  telegram?: string;
  whatsapp?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface User {
  id: number;
  full_name: string;
  username: string;

  // Аватарка
  avatar_url?: string;

  // Настройки доступа
  require_password_change: boolean;
  disable_password_change: boolean;
  show_in_selection: boolean;
  available_organizations: number[];
  accessible_users: number[];

  // Контактная информация (массивы)
  emails: string[];
  phones: string[];

  // Личная информация
  position?: string;
  department?: string;
  birth_date?: string;

  // Адрес
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;

  // Социальные сети
  social_links: SocialLinks;

  // Рабочие настройки
  timezone?: string;
  work_hours?: string;

  // Дополнительные поля
  comment?: string;
  custom_fields: Record<string, unknown>;
  tags: string[];

  // Статус
  is_active: boolean;
  blocked_reason?: string;
  blocked_at?: string;
  blocked_by?: number;

  // Системные поля
  role: UserRole;
  is_first_login: boolean;
  is_online: boolean;
  last_seen?: string;

  // История изменений
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  require_password_change: boolean;
}

export interface ChangePasswordRequest {
  old_password?: string;
  new_password: string;
  confirm_password: string;
}

// Остальной код authApi остается без изменений...

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  require_password_change: boolean;
}


export const authApi = {
  /**
   * Вход в систему
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse, LoginRequest>(
      "/auth/login",
      credentials,
      false // Не включаем Authorization для login
    );

    // Сохраняем токен и пользователя
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));

    return response;
  },

  /**
   * Получение информации о текущем пользователе
   */
  async me(): Promise<User> {
    const response = await apiClient.get<{ user: User }>("/auth/me");

    // Обновляем данные пользователя в localStorage
    localStorage.setItem("user", JSON.stringify(response.user));

    return response.user;
  },

  /**
   * Смена пароля
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post<void, ChangePasswordRequest>(
      "/auth/change-password",
      data
    );

    // После успешной смены пароля обновляем данные пользователя
    const user = await this.me();
    localStorage.setItem("user", JSON.stringify(user));
  },

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      logger.error("Logout error:", error);
    } finally {
      // Всегда очищаем локальное хранилище
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  /**
   * Проверка авторизации
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  /**
   * Получение текущего пользователя из localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Получение токена
   */
  getToken(): string | null {
    return localStorage.getItem("token");
  },
};
