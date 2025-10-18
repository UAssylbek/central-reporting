/**
 * API клиент для работы с пользователями
 *
 * Описание:
 * - Предоставляет методы для CRUD операций с пользователями
 * - Поддерживает пагинацию, фильтрацию и поиск
 * - Управление аватарами (загрузка/удаление)
 * - Получение списка организаций
 *
 * Основные эндпоинты:
 * - GET /users - список пользователей с пагинацией
 * - GET /users/:id - получить пользователя по ID
 * - POST /users - создать нового пользователя
 * - PUT /users/:id - обновить данные пользователя
 * - DELETE /users/:id - удалить пользователя
 * - POST /users/:id/avatar - загрузить аватар
 * - DELETE /users/:id/avatar - удалить аватар
 * - GET /users/organizations - список организаций
 *
 * Используется в:
 * - UsersPage - отображение и управление пользователями
 * - UserFormModal - создание/редактирование пользователя
 * - ProfilePage - просмотр/редактирование профиля
 * - useUsers hooks - React Query интеграция
 *
 * @module shared/api/users.api
 */

import type { User, UserRole, SocialLinks } from "./auth.api";
import { apiClient } from "./client";
import type {
  PaginationParams,
  PaginatedResponse,
  UserListItem,
} from "./types";
import { buildQueryParams } from "./types";
import { logger } from "../utils/logger";

export interface Organization {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

export interface CreateUserRequest {
  full_name: string;
  username: string;
  password?: string;
  avatar_url?: string;
  require_password_change: boolean;
  disable_password_change: boolean;
  show_in_selection: boolean;
  available_organizations: number[];
  accessible_users: number[];
  emails: string[];
  phones: string[];
  position?: string;
  department?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  social_links: SocialLinks;
  timezone?: string;
  work_hours?: string;
  comment?: string;
  custom_fields: Record<string, unknown>;
  tags: string[];
  role: UserRole;
}

export interface UpdateUserRequest {
  full_name?: string;
  username?: string;
  password?: string;
  avatar_url?: string | null;
  reset_password?: boolean;
  require_password_change?: boolean;
  disable_password_change?: boolean;
  show_in_selection?: boolean;
  available_organizations?: number[];
  accessible_users?: number[];
  emails?: string[];
  phones?: string[];
  position?: string;
  department?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  social_links?: SocialLinks;
  timezone?: string;
  work_hours?: string;
  comment?: string;
  custom_fields?: Record<string, unknown>;
  tags?: string[];
  is_active?: boolean;
  blocked_reason?: string;
  role?: UserRole;
}

export const usersApi = {
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete<void>(`/users/${id}`);
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`/users/${id}`);
  },

  /**
   * Получить пагинированный список пользователей (облегченный)
   * @param params - параметры пагинации и сортировки
   * @returns Пагинированный ответ с UserListItem
   */
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<UserListItem>> {
    const queryString = params ? buildQueryParams(params) : '';
    const response = await apiClient.get<PaginatedResponse<UserListItem>>(`/users${queryString}`);
    return response;
  },

  /**
   * Получить все пользователи (устаревший метод для обратной совместимости)
   * @deprecated Используйте getUsers() с параметрами пагинации
   *
   * Backend возвращает полные объекты User
   */
  async getAll(): Promise<User[]> {
    // Запрашиваем endpoint без параметров
    const response = await apiClient.get<{ users: User[]; total?: number }>('/users');

    // Backend возвращает { users: User[], total?: number, ... }
    if (response.users && Array.isArray(response.users)) {
      return response.users;
    }

    // Fallback - пустой массив
    logger.warn('Unexpected API response format:', response);
    return [];
  },

  async getById(id: number): Promise<User> {
    const response = await apiClient.get<{ user: User }>(`/users/${id}`);
    return response.user;
  },

  async create(userData: CreateUserRequest): Promise<{ user: User }> {
    return await apiClient.post<{ user: User }, CreateUserRequest>(
      "/users",
      userData
    );
  },

  async update(
    id: number,
    userData: UpdateUserRequest
  ): Promise<{ user: User }> {
    logger.debug("🔄 Updating user", id, "with data:", userData);
    return await apiClient.put<{ user: User }, UpdateUserRequest>(
      `/users/${id}`,
      userData
    );
  },

  async deleteAvatar(userId: number): Promise<void> {
    await apiClient.delete<void>(`/users/${userId}/avatar`);
  },

  async uploadAvatar(
    userId: number,
    file: File
  ): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    // КРИТИЧНО: Получаем токен
    const token = localStorage.getItem("token");

    logger.debug("📤 Uploading avatar for user:", userId);
    logger.debug("🔑 Token exists:", !!token);

    if (!token) {
      throw new Error("No authentication token found. Please log in again.");
    }

    // Определяем baseUrl
    const baseUrl = window.location.origin.includes("localhost")
      ? "http://localhost:8080/api"
      : "/api";

    logger.debug("🌐 Upload URL:", `${baseUrl}/users/${userId}/avatar`);

    const response = await fetch(`${baseUrl}/users/${userId}/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    logger.debug("📥 Upload response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("❌ Upload failed:", errorText);

      let errorMessage = "Failed to upload avatar";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    logger.info("✅ Upload successful:", result);
    return result;
  },

  async getOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get<{ organizations: Organization[] }>(
      "/users/organizations"
    );
    return response.organizations || [];
  },
};
