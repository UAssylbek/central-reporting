// src/types/index.ts
export interface User {
  id: number;
  full_name: string;
  username: string;
  require_password_change: boolean;
  disable_password_change: boolean;
  show_in_selection: boolean;
  available_organizations: number[];
  accessible_users: number[];
  email: string;
  phone: string;
  additional_email: string;
  comment: string;
  role: "admin" | "moderator" | "user";
  is_first_login: boolean;
  created_at: string;
  updated_at: string;
  is_online: boolean;
  last_seen: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  require_password_change: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserFormData {
  full_name: string;
  username: string;
  password?: string;
  reset_password?: boolean;
  require_password_change?: boolean;
  disable_password_change?: boolean;
  show_in_selection?: boolean;
  available_organizations?: number[];
  accessible_users?: number[];
  email?: string;
  phone?: string;
  additional_email?: string;
  comment?: string;
  role: "admin" | "moderator" | "user";
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface Organization {
  id: number;
  name: string;
}
