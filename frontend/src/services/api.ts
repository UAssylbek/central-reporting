// src/services/api.ts
import { getToken } from "../utils/auth";
import { User, AuthResponse, LoginCredentials, UserFormData } from "../types";

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

export const createUser = async (data: UserFormData): Promise<User> => {
  const response = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Не удалось создать пользователя");
  }
  return response.json();
};

export const updateUser = async (
  id: number,
  data: UserFormData
): Promise<User> => {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Не удалось обновить пользователя");
  }
  return response.json();
};

export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Не удалось удалить пользователя");
  }
};
