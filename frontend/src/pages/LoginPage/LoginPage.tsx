// frontend/src/pages/LoginPage/LoginPage.tsx
import { useState, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui/Button/Button";
import { Input } from "../../shared/ui/Input/Input";
import { authApi } from "../../shared/api/auth.api";
import { ChangePasswordModal } from "../../features/auth/components/ChangePasswordModal/ChangePasswordModal";

export function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // 🔧 ИСПРАВЛЕНИЕ 1: Состояние ошибки сохраняется между рендерами
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.username.trim()) {
      setError("Введите логин");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login(formData);

      // Проверяем require_password_change из ответа
      if (response.require_password_change) {
        setShowPasswordModal(true);
        // Токен УЖЕ сохранен в authApi.login()
      } else {
        // 🔧 ИСПРАВЛЕНИЕ 2: Правильный редирект на /home
        navigate("/home", { replace: true });
      }
    } catch (err: unknown) {
      // 🔧 ИСПРАВЛЕНИЕ 3: Правильная обработка ошибок с сохранением состояния
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
          : "Неверный логин или пароль";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 ИСПРАВЛЕНИЕ 4: После успешной смены пароля редирект на /home
  const handlePasswordChangeSuccess = () => {
    setShowPasswordModal(false);
    navigate("/home", { replace: true });
  };

  useEffect(() => {
    if (showPasswordModal) {
      // Блокируем кнопку "Назад" при смене пароля
      const handlePopState = () => {
        window.history.pushState(null, "", window.location.href);
      };
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [showPasswordModal]);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Вход в систему
            </h1>
            <p className="text-gray-600 dark:text-zinc-400">
              Введите данные для входа
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 🔧 ИСПРАВЛЕНИЕ 5: Ошибка теперь не исчезает при обновлении */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Логин"
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Введите логин"
                autoComplete="username"
              />

              <Input
                label="Пароль"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Введите пароль (если есть)"
                autoComplete="current-password"
                helperText="Оставьте пустым, если пароль не установлен"
              />

              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading ? "Вход..." : "Войти"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-700 text-center">
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Забыли пароль?{" "}
                <span className="text-gray-400 dark:text-zinc-500">
                  Обратитесь к администратору
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => {}} // Запрещаем закрытие при первом входе
        onSuccess={handlePasswordChangeSuccess}
        isFirstLogin={true}
      />
    </>
  );
}
