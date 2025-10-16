// frontend/src/shared/utils/validation.ts

/**
 * Валидация email адреса
 * @param email - email адрес для проверки
 * @returns true если email валиден
 */
export const validateEmail = (email: string): boolean => {
  if (!email || !email.trim()) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

/**
 * Валидация URL социальных сетей
 * @param url - URL для проверки
 * @param platform - платформа (telegram, whatsapp, linkedin, и т.д.)
 * @returns true если URL валиден для указанной платформы
 */
export const validateSocialUrl = (url: string, platform: string): boolean => {
  if (!url || !url.trim()) return true; // Пустое поле допустимо

  const trimmedUrl = url.trim();

  const patterns: Record<string, RegExp> = {
    telegram: /^(https?:\/\/)?(t\.me|telegram\.me)\/[\w\d_]+\/?$/,
    whatsapp: /^\+?\d{10,15}$/,
    linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[\w-]+\/?$/,
    facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/[\w.-]+\/?$/,
    instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/[\w.]+\/?$/,
    twitter: /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/[\w]+\/?$/,
  };

  const pattern = patterns[platform.toLowerCase()];
  if (!pattern) return true; // Если нет паттерна, считаем валидным

  return pattern.test(trimmedUrl);
};

/**
 * Валидация телефонного номера
 * @param phone - телефонный номер для проверки
 * @returns true если номер валиден
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || !phone.trim()) return false;
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Форматирование телефонного номера
 * Формат: +7 (___) ___-__-__
 * @param value - введенное значение
 * @returns отформатированный номер
 */
export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 0) return "";
  if (cleaned.length <= 1) return `+${cleaned}`;
  if (cleaned.length <= 4)
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1)}`;
  if (cleaned.length <= 7) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(
      4
    )}`;
  }
  if (cleaned.length <= 9) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(
      4,
      7
    )}-${cleaned.slice(7)}`;
  }
  return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(
    4,
    7
  )}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
};

/**
 * Получить читаемое сообщение об ошибке валидации
 * @param field - название поля
 * @param type - тип валидации
 * @returns сообщение об ошибке
 */
export const getValidationErrorMessage = (
  field: string,
  type: "email" | "phone" | "social"
): string => {
  const messages: Record<string, string> = {
    email: `Некорректный формат email адреса`,
    phone: `Некорректный формат телефона`,
    social: `Некорректный формат ссылки`,
  };

  return messages[type] || "Некорректное значение";
};

/**
 * Список часовых поясов для выбора
 */
export const TIMEZONES = [
  { value: "", label: "Не выбрано" },
  { value: "UTC-12:00", label: "UTC-12:00 (Линия перемены дат)" },
  { value: "UTC-11:00", label: "UTC-11:00 (Самоа)" },
  { value: "UTC-10:00", label: "UTC-10:00 (Гавайи)" },
  { value: "UTC-9:00", label: "UTC-9:00 (Аляска)" },
  { value: "UTC-8:00", label: "UTC-8:00 (Тихоокеанское время)" },
  { value: "UTC-7:00", label: "UTC-7:00 (Горное время)" },
  { value: "UTC-6:00", label: "UTC-6:00 (Центральное время)" },
  { value: "UTC-5:00", label: "UTC-5:00 (Восточное время)" },
  { value: "UTC-4:00", label: "UTC-4:00 (Атлантическое время)" },
  { value: "UTC-3:00", label: "UTC-3:00 (Бразилия)" },
  { value: "UTC-2:00", label: "UTC-2:00 (Среднеатлантическое время)" },
  { value: "UTC-1:00", label: "UTC-1:00 (Азорские острова)" },
  { value: "UTC+0:00", label: "UTC+0:00 (Лондон, Дублин)" },
  { value: "UTC+1:00", label: "UTC+1:00 (Берлин, Париж)" },
  { value: "UTC+2:00", label: "UTC+2:00 (Киев, Хельсинки)" },
  { value: "UTC+3:00", label: "UTC+3:00 (Москва, Стамбул)" },
  { value: "UTC+4:00", label: "UTC+4:00 (Дубай, Баку)" },
  { value: "UTC+5:00", label: "UTC+5:00 (Пакистан)" },
  { value: "UTC+5:30", label: "UTC+5:30 (Индия, Шри-Ланка)" },
  { value: "UTC+6:00", label: "UTC+6:00 (Казахстан, Бангладеш)" },
  { value: "UTC+7:00", label: "UTC+7:00 (Бангкок, Ханой)" },
  { value: "UTC+8:00", label: "UTC+8:00 (Пекин, Сингапур)" },
  { value: "UTC+9:00", label: "UTC+9:00 (Токио, Сеул)" },
  { value: "UTC+10:00", label: "UTC+10:00 (Сидней, Мельбурн)" },
  { value: "UTC+11:00", label: "UTC+11:00 (Соломоновы острова)" },
  { value: "UTC+12:00", label: "UTC+12:00 (Фиджи, Новая Зеландия)" },
];

/**
 * Генерация списка часов для рабочего времени
 */
export const generateHoursList = (): string[] => {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });
};
