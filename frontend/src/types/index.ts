// src/types/index.ts
export interface User {
  id: number;
  login: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface UserFormData {
  login: string;
  password: string;
  role: 'admin' | 'user';
}