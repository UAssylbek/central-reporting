// frontend/src/features/auth/components/ChangePasswordModal/ChangePasswordModal.tsx
import { useState, type FormEvent } from "react";
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
export interface ChangePasswordRequest {
  old_password?: string;
  new_password: string;
  confirm_password: string;
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

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

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
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
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

      // Сброс формы
      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });

      // Вызываем onSuccess для редиректа
      onSuccess();
    } catch (err: unknown) {
      const errorMessage =
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
          ? err.response.data.error
          : "Ошибка при смене пароля";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isFirstLogin && !isLoading) {
      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      setError("");
      onClose();
    }
  };

  const EyeIcon = ({ show }: { show: boolean }) => {
    if (show) {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {/* открытый глаз */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {/* закрытый глаз — просто линия или перекрестие */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3L21 21"
          />
        </svg>
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isFirstLogin ? "Установка пароля" : "Смена пароля"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                {isFirstLogin ? "Добро пожаловать!" : "Изменение пароля"}
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {isFirstLogin
                  ? "Для завершения регистрации установите новый пароль"
                  : "Введите текущий и новый пароль для изменения"}
              </p>
            </div>
          </div>
        </div>

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
              type={showPasswords.old ? "text" : "password"}
              required
              value={formData.old_password}
              onChange={(e) =>
                setFormData({ ...formData, old_password: e.target.value })
              }
              placeholder="Введите текущий пароль"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("old")}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <EyeIcon show={showPasswords.old} />
            </button>
          </div>
        )}

        {/* New password */}
        <div className="relative">
          <Input
            label="Новый пароль"
            type={showPasswords.new ? "text" : "password"}
            required
            value={formData.new_password}
            onChange={(e) =>
              setFormData({ ...formData, new_password: e.target.value })
            }
            placeholder="Минимум 6 символов"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("new")}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <EyeIcon show={showPasswords.new} />
          </button>
        </div>

        {/* Confirm password */}
        <div className="relative">
          <Input
            label="Подтверждение пароля"
            type={showPasswords.confirm ? "text" : "password"}
            required
            value={formData.confirm_password}
            onChange={(e) =>
              setFormData({ ...formData, confirm_password: e.target.value })
            }
            placeholder="Повторите новый пароль"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("confirm")}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <EyeIcon show={showPasswords.confirm} />
          </button>
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
            disabled={isLoading}
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
