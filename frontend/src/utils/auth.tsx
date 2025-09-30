// src/utils/auth.tsx
import { User } from "../types";

export const getToken = (): string | null => localStorage.getItem("token");

export const setToken = (token: string): void =>
  localStorage.setItem("token", token);

export const getUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
};

export const isAuthenticated = (): boolean => !!getToken();

export const logout = async (): Promise<void> => {
  const token = getToken();

  // Если есть токен, вызываем API logout
  if (token) {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Продолжаем выход даже если API запрос упал
    }
  }

  // Очищаем локальное хранилище
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Перенаправляем на главную
  window.location.href = "/";
};
