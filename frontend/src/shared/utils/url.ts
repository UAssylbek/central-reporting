// frontend/src/shared/utils/url.ts

/**
 * Получить базовый URL API сервера
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace("/api", "");
  }

  // Для локальной разработки
  if (window.location.hostname === "localhost") {
    return "http://localhost:8080";
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
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${avatarPath}`;
}
