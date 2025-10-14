// frontend/src/shared/utils/url.ts

/**
 * Получить базовый URL API сервера
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace("/api", "");
  }

  // Для локальной разработки используем текущий origin (localhost:3000)
  // Vite proxy перенаправит запросы на backend:8080
  if (window.location.hostname === "localhost") {
    return window.location.origin; // http://localhost:3000
  }

  // Для продакшена - используем текущий origin
  return window.location.origin;
}

/**
 * Преобразовать относительный путь аватара в полный URL
 */
export function getAvatarUrl(avatarPath?: string | null): string | undefined {
  if (!avatarPath) return undefined;

  // Если уже полный URL - возвращаем как есть
  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }

  // Преобразуем относительный путь в полный URL
  // Для локальной разработки это будет http://localhost:3000/uploads/...
  // Vite proxy перенаправит на http://localhost:8080/uploads/...
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${avatarPath}`;
}
