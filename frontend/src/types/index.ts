// src/types/index.ts
export interface User {
  id: number;
  username: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserFormData {
  username: string;
  password: string;
  role: "admin" | "user";
}
