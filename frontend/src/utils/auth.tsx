// src/utils/auth.tsx
import { User } from '../types';

export const getToken = (): string | null => localStorage.getItem('token');

export const setToken = (token: string): void => localStorage.setItem('token', token);

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user: User): void => localStorage.setItem('user', JSON.stringify(user));

export const isAuthenticated = (): boolean => !!getToken();

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};