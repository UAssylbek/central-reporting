// frontend/src/features/reports/steps/EmailStep.tsx
import { useState } from "react";
import { Input } from "../../../shared/ui/Input/Input";

export interface EmailStepProps {
  emailNotification: boolean;
  recipients: string[];
  onChange: (
    field: "emailNotification" | "recipients",
    value: boolean | string[]
  ) => void;
}

export function EmailStep({
  emailNotification,
  recipients,
  onChange,
}: EmailStepProps) {
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const addEmail = () => {
    const trimmedEmail = newEmail.trim();

    if (!trimmedEmail) {
      setEmailError("Введите email адрес");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError("Некорректный email адрес");
      return;
    }

    if (recipients.includes(trimmedEmail)) {
      setEmailError("Этот email уже добавлен");
      return;
    }

    onChange("recipients", [...recipients, trimmedEmail]);
    setNewEmail("");
    setEmailError("");
  };

  const removeEmail = (email: string) => {
    onChange(
      "recipients",
      recipients.filter((e) => e !== email)
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Email уведомления
        </h3>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
          Настройте отправку уведомления о готовности отчёта
        </p>
      </div>

      {/* Enable notification toggle */}
      <label className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors">
        <input
          type="checkbox"
          checked={emailNotification}
          onChange={(e) => onChange("emailNotification", e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Отправить уведомление на email
          </span>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Получите уведомление когда отчёт будет готов
          </p>
        </div>
      </label>

      {/* Email recipients */}
      {emailNotification && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              Получатели
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setEmailError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="email@example.com"
                error={emailError}
              />
              <button
                onClick={addEmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                Добавить
              </button>
            </div>
          </div>

          {/* Recipients list */}
          {recipients.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                Список получателей ({recipients.length}):
              </p>
              <div className="space-y-2">
                {recipients.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg"
                  >
                    <span className="text-sm text-gray-900 dark:text-white">
                      {email}
                    </span>
                    <button
                      onClick={() => removeEmail(email)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {recipients.length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              ⚠️ Добавьте хотя бы один email адрес
            </p>
          )}
        </div>
      )}
    </div>
  );
}
