// frontend/src/shared/ui/MultiInput/MultiInput.tsx
import { useState } from "react";
import { formatPhoneNumber } from "../../utils/formatPhone";
import { validateEmail, validatePhone } from "../../utils/validation";

interface MultiInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  helperText?: string;
}

export function MultiInput({
  label,
  values,
  onChange,
  placeholder = "",
  type = "text",
  helperText,
}: MultiInputProps) {
  // ✅ НОВОЕ: Состояние для ошибок валидации
  const [errors, setErrors] = useState<Record<number, string>>({});

  const handleAdd = () => {
    onChange([...values, ""]);
  };

  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);

    // Удаляем ошибку для этого индекса
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const handleChange = (index: number, value: string) => {
    const newValues = [...values];

    // Автоматическое форматирование телефона при вводе
    if (type === "tel") {
      newValues[index] = formatPhoneNumber(value);
    } else {
      newValues[index] = value;
    }

    onChange(newValues);

    // ✅ НОВОЕ: Валидация при изменении
    validateField(index, newValues[index]);
  };

  // ✅ НОВОЕ: Функция валидации поля
  const validateField = (index: number, value: string) => {
    if (!value || !value.trim()) {
      // Пустое поле - убираем ошибку
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
      return;
    }

    let errorMessage = "";

    if (type === "email" && !validateEmail(value)) {
      errorMessage = "Некорректный формат email";
    } else if (type === "tel" && !validatePhone(value)) {
      errorMessage = "Некорректный формат телефона";
    }

    if (errorMessage) {
      setErrors({ ...errors, [index]: errorMessage });
    } else {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  // ✅ НОВОЕ: Проверка при потере фокуса
  const handleBlur = (index: number) => {
    validateField(index, values[index]);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
        {label}
      </label>

      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="space-y-1">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type={type === "tel" ? "text" : type}
                  value={value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onBlur={() => handleBlur(index)}
                  placeholder={placeholder}
                  className={`w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border ${
                    errors[index]
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-zinc-600"
                  } rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                    errors[index] ? "focus:ring-red-500" : "focus:ring-blue-500"
                  }`}
                />
                {/* ✅ НОВОЕ: Показываем ошибку валидации */}
                {errors[index] && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors[index]}
                  </p>
                )}
              </div>

              {values.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex-shrink-0"
                  title="Удалить"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="w-full px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Добавить еще
      </button>

      {helperText && (
        <p className="text-sm text-gray-500 dark:text-zinc-400">{helperText}</p>
      )}
    </div>
  );
}
