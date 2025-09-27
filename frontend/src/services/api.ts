// src/services/api.ts
import { getToken } from "../utils/auth";
import {
  User,
  AuthResponse,
  LoginCredentials,
  UserFormData,
  ChangePasswordRequest,
  Organization,
} from "../types";

const API_BASE = "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    throw new Error("Ошибка входа");
  }
  return response.json();
};

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<void> => {
  const response = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Не удалось изменить пароль");
  }
};

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE}/users`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Не удалось загрузить пользователей");
  }
  const data = await response.json();
  return data.users;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Не удалось загрузить пользователя");
  }
  const data = await response.json();
  return data.user;
};

export const createUser = async (data: UserFormData): Promise<User> => {
  const response = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Не удалось создать пользователя");
  }
  const result = await response.json();
  return result.user;
};

export const updateUser = async (
  id: number,
  data: Partial<UserFormData>
): Promise<User> => {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Не удалось обновить пользователя");
  }
  const result = await response.json();
  return result.user;
};

export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Не удалось удалить пользователя");
  }
};

export const getOrganizations = async (): Promise<Organization[]> => {
  const response = await fetch(`${API_BASE}/users/organizations`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Не удалось загрузить организации");
  }
  const data = await response.json();
  return data.organizations;
};

export const submitReport = async (reportType: string, data: any) => {
  const response = await fetch("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportType, data }),
  });

  if (!response.ok) {
    throw new Error("Ошибка отправки отчета");
  }

  return response.json();
};
