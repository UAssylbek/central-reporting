// frontend/src/shared/utils/logger.ts

/**
 * Система логирования с поддержкой уровней
 *
 * В development режиме показывает все логи
 * В production режиме показывает только warn и error
 */

// Проверяем режим разработки
const isDevelopment = import.meta.env.DEV;

/**
 * Уровни логирования
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Утилита для форматирования времени
 */
const getTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
};

/**
 * Форматирует сообщение лога
 */
const formatMessage = (level: LogLevel, ...args: unknown[]): unknown[] => {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${level}]`;
  return [prefix, ...args];
};

/**
 * Основной объект logger
 */
export const logger = {
  /**
   * Debug - детальная информация для отладки
   * Показывается ТОЛЬКО в development
   *
   * @example
   * logger.debug("User data:", user);
   * logger.debug("🔄 Updating user", id);
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...formatMessage(LogLevel.DEBUG, ...args));
    }
  },

  /**
   * Info - общая информация о работе приложения
   * Показывается ТОЛЬКО в development
   *
   * @example
   * logger.info("✅ User logged in successfully");
   * logger.info("📤 Sending request to API");
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info(...formatMessage(LogLevel.INFO, ...args));
    }
  },

  /**
   * Warn - предупреждения о потенциальных проблемах
   * Показывается ВСЕГДА (и в dev, и в production)
   *
   * @example
   * logger.warn("Unexpected response format:", response);
   * logger.warn("⚠️ Missing user email");
   */
  warn: (...args: unknown[]): void => {
    console.warn(...formatMessage(LogLevel.WARN, ...args));
  },

  /**
   * Error - ошибки требующие внимания
   * Показывается ВСЕГДА (и в dev, и в production)
   *
   * @example
   * logger.error("❌ Failed to upload avatar:", error);
   * logger.error("API request failed:", err.message);
   */
  error: (...args: unknown[]): void => {
    console.error(...formatMessage(LogLevel.ERROR, ...args));
  },

  /**
   * Group - группирует связанные логи
   * Работает ТОЛЬКО в development
   *
   * @example
   * logger.group("User Update Process");
   * logger.debug("Step 1: Validate data");
   * logger.debug("Step 2: Send to API");
   * logger.groupEnd();
   */
  group: (label: string): void => {
    if (isDevelopment) {
      console.group(`[${getTimestamp()}] ${label}`);
    }
  },

  groupCollapsed: (label: string): void => {
    if (isDevelopment) {
      console.groupCollapsed(`[${getTimestamp()}] ${label}`);
    }
  },

  groupEnd: (): void => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  /**
   * Table - выводит данные в виде таблицы
   * Работает ТОЛЬКО в development
   *
   * @example
   * logger.table(users);
   */
  table: (data: unknown): void => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  /**
   * Time - замеряет время выполнения кода
   * Работает ТОЛЬКО в development
   *
   * @example
   * logger.time("API Request");
   * await api.getUsers();
   * logger.timeEnd("API Request"); // API Request: 234.56ms
   */
  time: (label: string): void => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  timeEnd: (label: string): void => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  },
};

/**
 * Экспортируем также isDevelopment для использования в других местах
 */
export { isDevelopment };
