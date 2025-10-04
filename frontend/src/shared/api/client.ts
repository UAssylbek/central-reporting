// frontend/src/shared/api/client.ts

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * Базовый API клиент с автоматической обработкой токенов
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Получить токен из localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem("token");
  }

  /**
   * Получить заголовки с авторизацией
   */
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Обработать ответ от API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Если 401 - редирект на login
    if (response.status === 401) {
      const data = await response.json().catch(() => ({}));

      // Проверяем force_logout
      if (data.force_logout) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href =
          "/login?reason=" +
          encodeURIComponent(data.reason || "Session expired");
        throw new Error(data.error || "Unauthorized");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    // Если не OK статус
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    // Если 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * GET запрос
   */
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST запрос
   */
  async post<T, D = unknown>(
    endpoint: string,
    data?: D,
    includeAuth = true
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT запрос
   */
  async put<T, D = unknown>(endpoint: string, data: D): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE запрос
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }
}

// Экспортируем singleton
export const apiClient = new ApiClient(API_BASE_URL);

// Экспортируем также класс для тестов
export { ApiClient };
