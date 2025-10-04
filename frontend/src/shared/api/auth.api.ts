// frontend/src/shared/api/auth.api.ts
import { apiClient } from "./client";

export interface User {
  id: number;
  full_name: string;
  username: string;
  role: "admin" | "moderator" | "user";
  email?: string;
  phone?: string;
  is_online: boolean;
  last_seen?: string;
  require_password_change: boolean;
  disable_password_change: boolean;
  available_organizations?: number[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  require_password_change: boolean;
}

export interface ChangePasswordRequest {
  old_password?: string;
  new_password: string;
}

/**
 * Auth API сервис
 */
export const authApi = {
  /**
   * Вход в систему
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
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
   * Получить текущего пользователя
   */
  me: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>("/auth/me");

    // Обновляем данные пользователя в localStorage
    localStorage.setItem("user", JSON.stringify(response.user));

    return response.user;
  },

  /**
   * Выход из системы
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      // Всегда очищаем локальное хранилище
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  /**
   * Смена пароля
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post("/auth/change-password", data);
  },

  /**
   * Получить текущего пользователя из localStorage
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Проверить авторизацию
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};
