// frontend/src/shared/utils/formatPhone.ts

/**
 * Форматирует телефонный номер в красивый вид
 *
 * Примеры:
 * - "77771234567" → "+7 (777) 123-45-67"
 * - "87771234567" → "8 (777) 123-45-67"
 * - "+77771234567" → "+7 (777) 123-45-67"
 * - "1234567" → "123 45-67"
 *
 * @param value - Исходное значение (может содержать любые символы)
 * @returns Отформатированный номер телефона
 */
export const formatPhoneNumber = (value: string): string => {
  // Убираем все символы кроме цифр и "+"
  const cleaned = value.replace(/[^\d+]/g, "");

  if (!cleaned) return "";

  let formatted = "";

  // Обработка номеров начинающихся с "+7"
  if (cleaned.startsWith("+7")) {
    const digits = cleaned.substring(2);

    if (digits.length === 0) {
      formatted = "+7";
    } else if (digits.length <= 3) {
      formatted = `+7 (${digits}`;
    } else if (digits.length <= 6) {
      formatted = `+7 (${digits.substring(0, 3)}) ${digits.substring(3)}`;
    } else if (digits.length <= 8) {
      formatted = `+7 (${digits.substring(0, 3)}) ${digits.substring(
        3,
        6
      )}-${digits.substring(6)}`;
    } else {
      // Полный формат: +7 (777) 123-45-67
      formatted = `+7 (${digits.substring(0, 3)}) ${digits.substring(
        3,
        6
      )}-${digits.substring(6, 8)}-${digits.substring(8, 10)}`;
    }
  }
  // Обработка номеров начинающихся с "8"
  else if (cleaned.startsWith("8")) {
    const digits = cleaned.substring(1);

    if (digits.length === 0) {
      formatted = "8";
    } else if (digits.length <= 3) {
      formatted = `8 (${digits}`;
    } else if (digits.length <= 6) {
      formatted = `8 (${digits.substring(0, 3)}) ${digits.substring(3)}`;
    } else if (digits.length <= 8) {
      formatted = `8 (${digits.substring(0, 3)}) ${digits.substring(
        3,
        6
      )}-${digits.substring(6)}`;
    } else {
      // Полный формат: 8 (777) 123-45-67
      formatted = `8 (${digits.substring(0, 3)}) ${digits.substring(
        3,
        6
      )}-${digits.substring(6, 8)}-${digits.substring(8, 10)}`;
    }
  }
  // Обработка номеров начинающихся с "7" (конвертируем в +7)
  else if (cleaned.startsWith("7")) {
    const digits = cleaned.substring(1);

    if (digits.length === 0) {
      formatted = "+7";
    } else if (digits.length <= 3) {
      formatted = `+7 (${digits}`;
    } else if (digits.length <= 6) {
      formatted = `+7 (${digits.substring(0, 3)}) ${digits.substring(3)}`;
    } else if (digits.length <= 8) {
      formatted = `+7 (${digits.substring(0, 3)}) ${digits.substring(
        3,
        6
      )}-${digits.substring(6)}`;
    } else {
      // Полный формат: +7 (777) 123-45-67
      formatted = `+7 (${digits.substring(0, 3)}) ${digits.substring(
        3,
        6
      )}-${digits.substring(6, 8)}-${digits.substring(8, 10)}`;
    }
  }
  // Обработка остальных форматов (без кода страны)
  else {
    if (cleaned.length <= 3) {
      formatted = cleaned;
    } else if (cleaned.length <= 6) {
      formatted = `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
    } else if (cleaned.length <= 8) {
      formatted = `${cleaned.substring(0, 3)} ${cleaned.substring(
        3,
        6
      )}-${cleaned.substring(6)}`;
    } else {
      // Формат: 777 123-45-67
      formatted = `${cleaned.substring(0, 3)} ${cleaned.substring(
        3,
        6
      )}-${cleaned.substring(6, 8)}-${cleaned.substring(8, 10)}`;
    }
  }

  return formatted;
};

/**
 * Извлекает чистые цифры из отформатированного номера
 *
 * @param formattedPhone - Отформатированный номер
 * @returns Только цифры (и + если есть)
 */
export const cleanPhoneNumber = (formattedPhone: string): string => {
  return formattedPhone.replace(/[^\d+]/g, "");
};

/**
 * Проверяет валидность телефонного номера
 *
 * @param phone - Номер телефона
 * @returns true если номер валидный (10 цифр после кода страны)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = cleanPhoneNumber(phone);

  // Проверяем российские номера: должно быть 11 цифр (с 7/8) или +7 и 10 цифр
  if (cleaned.startsWith("+7")) {
    return cleaned.length === 12; // +7 и 10 цифр
  } else if (cleaned.startsWith("7") || cleaned.startsWith("8")) {
    return cleaned.length === 11; // 7/8 и 10 цифр
  }

  // Для других номеров минимум 10 цифр
  return cleaned.length >= 10;
};
