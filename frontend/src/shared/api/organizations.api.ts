// frontend/src/shared/api/organizations.api.ts
import { apiClient } from "./client";

export interface Organization {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

/**
 * API для работы с организациями
 */
export const organizationsApi = {
  /**
   * Получить список всех организаций
   */
  async getAll(): Promise<Organization[]> {
    return await apiClient.get<Organization[]>("/organizations");
  },

  /**
   * Получить организацию по ID
   */
  async getById(id: number): Promise<Organization> {
    return await apiClient.get<Organization>(`/organizations/${id}`);
  },
};
