// frontend/src/shared/utils/validateSocialLinks.ts
import type { SocialLinks } from "../api/auth.api";
import { isValidPhoneNumber } from "./formatPhone";

/**
 * Валидирует отдельную социальную сеть
 *
 * @param key - Тип социальной сети
 * @param value - Значение для валидации
 * @returns true если значение валидное или пустое, false если заполнено неправильно
 */
export const validateSocialLink = (
  key: keyof SocialLinks,
  value: string
): boolean => {
  // Пустое значение всегда валидно (опциональное поле)
  if (!value || !value.trim()) {
    return true;
  }

  const trimmedValue = value.trim();

  switch (key) {
    case "whatsapp":
      // WhatsApp должен быть валидным телефонным номером
      return isValidPhoneNumber(trimmedValue);

    case "telegram":
      // Telegram: https://t.me/username или @username
      return (
        /^(https?:\/\/)?(t\.me|telegram\.me)\/[\w\d_]{5,}$/i.test(
          trimmedValue
        ) || /^@[\w\d_]{5,}$/.test(trimmedValue)
      );

    case "linkedin":
      // LinkedIn: https://linkedin.com/in/username или https://linkedin.com/company/name
      return /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[\w-]{3,}$/i.test(
        trimmedValue
      );

    case "facebook":
      // Facebook: https://facebook.com/username
      return /^(https?:\/\/)?(www\.)?facebook\.com\/[\w.-]{5,}$/i.test(
        trimmedValue
      );

    case "instagram":
      // Instagram: https://instagram.com/username или @username
      return (
        /^(https?:\/\/)?(www\.)?instagram\.com\/[\w.]{1,30}$/i.test(
          trimmedValue
        ) || /^@[\w.]{1,30}$/.test(trimmedValue)
      );

    case "twitter":
      // Twitter/X: https://twitter.com/username или @username
      return (
        /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/[\w]{1,15}$/i.test(
          trimmedValue
        ) || /^@[\w]{1,15}$/.test(trimmedValue)
      );

    default:
      return true;
  }
};

/**
 * Валидирует все социальные сети
 *
 * @param socialLinks - Объект с социальными сетями
 * @returns Объект с результатами валидации для каждой платформы
 */
export const validateAllSocialLinks = (
  socialLinks: SocialLinks
): Record<keyof SocialLinks, boolean> => {
  return {
    telegram: validateSocialLink("telegram", socialLinks.telegram || ""),
    whatsapp: validateSocialLink("whatsapp", socialLinks.whatsapp || ""),
    linkedin: validateSocialLink("linkedin", socialLinks.linkedin || ""),
    facebook: validateSocialLink("facebook", socialLinks.facebook || ""),
    instagram: validateSocialLink("instagram", socialLinks.instagram || ""),
    twitter: validateSocialLink("twitter", socialLinks.twitter || ""),
  };
};

/**
 * Проверяет, валидны ли все заполненные социальные сети
 *
 * @param socialLinks - Объект с социальными сетями
 * @returns true если все заполненные поля валидны
 */
export const areAllSocialLinksValid = (socialLinks: SocialLinks): boolean => {
  const validationResults = validateAllSocialLinks(socialLinks);
  return Object.values(validationResults).every((isValid) => isValid);
};
