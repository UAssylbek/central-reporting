// frontend/src/shared/api/auth.api.ts
import { apiClient } from "./client";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  require_password_change: boolean;
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: "admin" | "moderator" | "user";
  email?: string;
  phone?: string;
  is_first_login: boolean;
  require_password_change: boolean;
  disable_password_change: boolean;
  show_in_selection: boolean;
  is_online: boolean;
  last_seen?: string;
  available_organizations?: number[];
  accessible_users?: number[];
}

export interface ChangePasswordRequest {
  old_password?: string;
  new_password: string;
  confirm_password: string;
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
      console.error("Logout error:", error);
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
