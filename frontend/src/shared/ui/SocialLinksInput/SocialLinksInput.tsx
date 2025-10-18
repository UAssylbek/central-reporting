// frontend/src/shared/ui/SocialLinksInput/SocialLinksInput.tsx
import { useState } from "react";
import type { SocialLinks } from "../../api/auth.api";
import { formatPhoneNumber } from "../../utils/formatPhone";
import { validateSocialLink } from "../../utils/validateSocialLinks";

interface SocialLinksInputProps {
  value: SocialLinks;
  onChange: (value: SocialLinks) => void;
}

const SOCIAL_PLATFORMS = [
  {
    key: "telegram" as const,
    label: "Telegram",
    icon: "📱",
    placeholder: "https://t.me/username или @username",
  },
  {
    key: "whatsapp" as const,
    label: "WhatsApp",
    icon: "📞",
    placeholder: "+7 (___) ___-__-__",
  },
  {
    key: "linkedin" as const,
    label: "LinkedIn",
    icon: "💼",
    placeholder: "https://linkedin.com/in/username",
  },
  {
    key: "facebook" as const,
    label: "Facebook",
    icon: "👥",
    placeholder: "https://facebook.com/username",
  },
  {
    key: "instagram" as const,
    label: "Instagram",
    icon: "📷",
    placeholder: "https://instagram.com/username или @username",
  },
  {
    key: "twitter" as const,
    label: "Twitter/X",
    icon: "🐦",
    placeholder: "https://twitter.com/username или @username",
  },
];

export function SocialLinksInput({ value, onChange }: SocialLinksInputProps) {
  // Состояние для ошибок валидации
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Состояние для валидных полей
  const [validFields, setValidFields] = useState<Record<string, boolean>>({});

  const handleChange = (key: keyof SocialLinks, inputValue: string) => {
    let processedValue = inputValue;

    // ✅ Используем форматирование из formatPhone.ts для WhatsApp
    if (key === "whatsapp") {
      processedValue = formatPhoneNumber(inputValue);
    }

    onChange({
      ...value,
      [key]: processedValue,
    });

    // Валидация при изменении (но не показываем ошибку пока пользователь печатает)
    if (inputValue.trim()) {
      const isValid = validateField(key, processedValue, false);
      // Обновляем состояние валидных полей
      setValidFields({
        ...validFields,
        [key]: isValid,
      });
    } else {
      // Если поле пустое - убираем ошибку и валидность
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);

      const newValidFields = { ...validFields };
      delete newValidFields[key];
      setValidFields(newValidFields);
    }
  };

  // Функция валидации поля
  const validateField = (
    key: keyof SocialLinks,
    inputValue: string,
    showError: boolean = true
  ): boolean => {
    // Используем централизованную функцию валидации
    const isValid = validateSocialLink(key, inputValue);

    // Пустое поле - убираем ошибку и не показываем как валидное
    if (!inputValue || !inputValue.trim()) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
      return false; // Пустое поле = не показываем галочку
    }

    // Показываем ошибку только при потере фокуса
    if (!isValid && showError) {
      setErrors({
        ...errors,
        [key]: "Некорректный формат",
      });
    } else if (isValid) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }

    return isValid;
  };

  // Проверка при потере фокуса
  const handleBlur = (key: keyof SocialLinks) => {
    const isValid = validateField(key, value[key] || "", true);
    // Обновляем состояние валидных полей
    setValidFields({
      ...validFields,
      [key]: isValid,
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
        Социальные сети и мессенджеры
      </label>

      <div className="space-y-3">
        {SOCIAL_PLATFORMS.map((platform) => (
          <div key={platform.key} className="space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-2xl w-8 flex-shrink-0 mt-2">
                {platform.icon}
              </span>
              <div className="flex-1">
                <input
                  type="text"
                  value={value[platform.key] || ""}
                  onChange={(e) => handleChange(platform.key, e.target.value)}
                  onBlur={() => handleBlur(platform.key)}
                  placeholder={platform.placeholder}
                  className={`w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border ${
                    errors[platform.key]
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-zinc-600"
                  } rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                    errors[platform.key]
                      ? "focus:ring-red-500"
                      : "focus:ring-blue-500"
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {platform.label}
                  </p>
                  {/* Показываем ошибку валидации */}
                  {errors[platform.key] && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors[platform.key]}
                    </p>
                  )}
                  {/* Показываем галочку ТОЛЬКО если явно валидно */}
                  {validFields[platform.key] === true && !errors[platform.key] && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✓ Корректно
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
        💡 WhatsApp форматируется автоматически, как телефонные номера
      </p>
    </div>
  );
}
