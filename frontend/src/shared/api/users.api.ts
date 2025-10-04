// frontend/src/shared/api/users.api.ts
import { apiClient } from "./client";
import type { User } from "./auth.api";

export interface Organization {
  id: number;
  name: string;
  code?: string;
  type?: string;
}

export interface CreateUserRequest {
  full_name: string;
  username: string;
  password?: string;
  role: "admin" | "moderator" | "user";
  email?: string;
  phone?: string;
  require_password_change?: boolean;
  disable_password_change?: boolean;
  show_in_selection?: boolean;
  available_organizations?: number[];
  accessible_users?: number[];
}

export interface UpdateUserRequest {
  full_name?: string;
  username?: string;
  password?: string;
  role?: "admin" | "moderator" | "user";
  email?: string;
  phone?: string;
  require_password_change?: boolean;
  disable_password_change?: boolean;
  show_in_selection?: boolean;
  available_organizations?: number[];
  accessible_users?: number[];
  reset_password?: boolean;
}

export interface UsersListResponse {
  users: User[];
  total: number;
}

/**
 * Users API сервис
 */
export const usersApi = {
  /**
   * Получить список пользователей
   */
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<UsersListResponse>("/users");
    return response.users;
  },

  /**
   * Получить пользователя по ID
   */
  getUser: async (id: number): Promise<User> => {
    const response = await apiClient.get<{ user: User }>(`/users/${id}`);
    return response.user;
  },

  /**
   * Создать пользователя (только admin)
   */
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<{ user: User }, CreateUserRequest>(
      "/users",
      data
    );
    return response.user;
  },

  /**
   * Обновить пользователя
   */
  updateUser: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<{ user: User }, UpdateUserRequest>(
      `/users/${id}`,
      data
    );
    return response.user;
  },

  /**
   * Удалить пользователя (только admin)
   */
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Получить список организаций
   */
  getOrganizations: async (): Promise<Organization[]> => {
    const response = await apiClient.get<{ organizations: Organization[] }>(
      "/users/organizations"
    );
    return response.organizations;
  },
};
