// frontend/src/features/auth/components/ChangePasswordModal/ChangePasswordModal.tsx
import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../../../../shared/ui/Modal/Modal";
import { Button } from "../../../../shared/ui/Button/Button";
import { Input } from "../../../../shared/ui/Input/Input";
import { authApi } from "../../../../shared/api/auth.api";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isFirstLogin?: boolean;
}

interface ChangePasswordData {
  old_password?: string;
  new_password: string;
  confirm_password: string;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
  isFirstLogin = false,
}: ChangePasswordModalProps) {
  const [formData, setFormData] = useState<ChangePasswordData>({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ НОВОЕ: Валидация совпадения паролей в реальном времени
  const [passwordMatchError, setPasswordMatchError] = useState<string>("");

  // ✅ НОВОЕ: Проверяем совпадение паролей при каждом изменении
  useEffect(() => {
    // Проверяем только если оба поля заполнены
    if (formData.new_password && formData.confirm_password) {
      if (formData.new_password !== formData.confirm_password) {
        setPasswordMatchError("Пароли не совпадают");
      } else {
        setPasswordMatchError("");
      }
    } else {
      setPasswordMatchError("");
    }
  }, [formData.new_password, formData.confirm_password]);

  const validateForm = (): string | null => {
    // Для первого входа старый пароль не нужен
    if (!isFirstLogin && !formData.old_password?.trim()) {
      return "Введите текущий пароль";
    }

    if (!formData.new_password.trim()) {
      return "Введите новый пароль";
    }

    if (formData.new_password.length < 6) {
      return "Новый пароль должен содержать не менее 6 символов";
    }

    if (formData.new_password !== formData.confirm_password) {
      return "Пароли не совпадают";
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // ✅ Предотвращаем перезагрузку страницы
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return; // ✅ Останавливаем выполнение БЕЗ перезагрузки
    }

    setIsLoading(true);

    try {
      const requestData: {
        old_password?: string;
        new_password: string;
        confirm_password: string;
      } = {
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      };

      // Отправляем old_password только если он не пустой
      if (formData.old_password && formData.old_password.trim()) {
        requestData.old_password = formData.old_password;
      }

      await authApi.changePassword(requestData);

      // ✅ Сброс формы
      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });

      // ✅ Вызываем onSuccess для редиректа
      onSuccess();
    } catch (err: unknown) {
      // ✅ ИСПРАВЛЕНИЕ: Правильная обработка ошибок БЕЗ перезагрузки
      let errorMessage = "Не удалось изменить пароль";

      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "error" in err.response.data &&
        typeof err.response.data.error === "string"
      ) {
        errorMessage = err.response.data.error;
      }

      setError(errorMessage); // ✅ Показываем ошибку БЕЗ закрытия модалки
    } finally {
      setIsLoading(false); // ✅ Всегда снимаем loading
    }
  };

  const handleClose = () => {
    if (!isFirstLogin) {
      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      setError("");
      setPasswordMatchError("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isFirstLogin ? "Установка пароля" : "Изменение пароля"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Welcome message для первого входа */}
        {isFirstLogin && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Добро пожаловать!
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Для завершения регистрации установите новый пароль
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Old password - только если не первый вход */}
        {!isFirstLogin && (
          <div className="relative">
            <Input
              label="Текущий пароль"
              type="password"
              required
              value={formData.old_password}
              onChange={(e) =>
                setFormData({ ...formData, old_password: e.target.value })
              }
              placeholder="Введите текущий пароль"
            />
          </div>
        )}

        {/* New password */}
        <div className="relative">
          <Input
            label="Новый пароль"
            type="password"
            required
            value={formData.new_password}
            onChange={(e) =>
              setFormData({ ...formData, new_password: e.target.value })
            }
            placeholder="Минимум 6 символов"
            helperText={
              formData.new_password && formData.new_password.length < 6
                ? "Пароль слишком короткий"
                : undefined
            }
          />
        </div>

        {/* Confirm password - с валидацией в реальном времени */}
        <div className="relative">
          <Input
            label="Подтверждение пароля"
            type="password"
            required
            value={formData.confirm_password}
            onChange={(e) =>
              setFormData({ ...formData, confirm_password: e.target.value })
            }
            placeholder="Повторите новый пароль"
            error={passwordMatchError} // ✅ Показываем ошибку в реальном времени
            helperText={
              !passwordMatchError && formData.confirm_password
                ? "Пароли совпадают ✓"
                : undefined
            }
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-zinc-700">
          {!isFirstLogin && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Отмена
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || !!passwordMatchError} // ✅ Блокируем кнопку если пароли не совпадают
            fullWidth={isFirstLogin}
            className="cursor-pointer"
          >
            {isLoading
              ? "Сохранение..."
              : isFirstLogin
              ? "Установить пароль"
              : "Изменить пароль"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
