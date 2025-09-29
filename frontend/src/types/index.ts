// src/types/index.ts
export interface User {
  id: number;
  full_name: string; // Полное имя
  username: string; // Имя для входа
  require_password_change: boolean; // Требовать смену пароля
  disable_password_change: boolean; // Запретить смену пароля
  show_in_selection: boolean; // Показывать в списке выбора
  available_organizations: number[]; // Доступные организации
  email: string; // Электронная почта
  phone: string; // Телефон
  additional_email: string; // Дополнительная почта
  comment: string; // Комментарий
  role: "admin" | "user"; // Роль
  is_first_login: boolean; // Первый вход
  created_at: string;
  updated_at: string;
  is_online: boolean;
  last_seen: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  require_password_change: boolean; // Нужно ли менять пароль
}

export interface LoginCredentials {
  username: string;
  password: string; // Теперь может быть пустым
}

export interface UserFormData {
  full_name: string; // Обязательное
  username: string; // Обязательное
  password?: string; // Необязательное
  require_password_change?: boolean;
  disable_password_change?: boolean;
  show_in_selection?: boolean;
  available_organizations?: number[];
  email?: string;
  phone?: string;
  additional_email?: string;
  comment?: string;
  role: "admin" | "user";
}

// Новые типы для смены пароля
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

// Тип для организаций
export interface Organization {
  id: number;
  name: string;
}
