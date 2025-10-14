// frontend/src/shared/api/users.api.ts
import type { User, UserRole, SocialLinks } from "./auth.api";
import { apiClient } from "./client";

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

  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<{ users: User[] }>("/users");
    return response.users || [];
  },

  // Алиас для обратной совместимости
  async getAll(): Promise<User[]> {
    return this.getUsers();
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

    const token = localStorage.getItem("token");
    const baseUrl = window.location.origin.includes("localhost")
      ? "http://localhost:8080/api"
      : "/api";

    const response = await fetch(`${baseUrl}/users/${userId}/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload avatar");
    }

    return response.json();
  },

  async getOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get<{ organizations: Organization[] }>(
      "/users/organizations"
    );
    return response.organizations || [];
  },
};
