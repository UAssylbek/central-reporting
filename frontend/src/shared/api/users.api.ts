import type { User, UserRole, SocialLinks } from "./auth.api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

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
  avatar_url?: string;
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
  async getAll(): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    // Backend возвращает { users: User[] }
    const data = await response.json();
    return data.users || [];
  },

  async getById(id: number): Promise<User> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    // Backend возвращает { user: User }
    const data = await response.json();
    return data.user;
  },

  async create(userData: CreateUserRequest): Promise<{ user: User }> {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create user");
    }

    return response.json();
  },

  async update(
    id: number,
    userData: UpdateUserRequest
  ): Promise<{ user: User }> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update user");
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
  },

  async uploadAvatar(
    userId: number,
    file: File
  ): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${API_URL}/users/${userId}/avatar`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload avatar");
    }

    return response.json();
  },

  async deleteAvatar(userId: number): Promise<void> {
    const response = await fetch(`${API_URL}/users/${userId}/avatar`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to delete avatar");
    }
  },
};
