// frontend/src/pages/ResetPasswordPage/ResetPasswordPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "../../shared/ui/Button/Button";
import { Input } from "../../shared/ui/Input/Input";
import { Card } from "../../shared/ui/Card/Card";
import { apiClient } from "../../shared/api/client";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Токен не найден");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (newPassword.length < 8) {
      setError("Пароль должен содержать минимум 8 символов");
      return;
    }

    setLoading(true);

    try {
      await apiClient.post("/auth/reset-password", {
        token,
        new_password: newPassword,
      }, false); // false = без auth токена

      setSuccess(true);

      // Перенаправляем на страницу входа через 3 секунды
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Произошла ошибка";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
        <Card className="w-full max-w-md">
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Пароль успешно изменен!
            </h2>

            <p className="text-gray-600 dark:text-zinc-400 mb-6">
              Вы будете перенаправлены на страницу входа...
            </p>

            <Link to="/login">
              <Button variant="primary" className="w-full">
                Перейти ко входу
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Установить новый пароль
            </h1>
            <p className="text-gray-600 dark:text-zinc-400">
              Введите новый пароль для вашего аккаунта
            </p>
          </div>

          {!token ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
              <p className="text-sm text-red-600 dark:text-red-400">
                Неверная ссылка для сброса пароля
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Новый пароль"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Минимум 8 символов"
                required
                autoFocus
              />

              <Input
                label="Подтвердите пароль"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите пароль"
                required
              />

              <div className="text-xs text-gray-600 dark:text-zinc-400">
                Пароль должен содержать:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Минимум 8 символов</li>
                  <li>Заглавную букву</li>
                  <li>Строчную букву</li>
                  <li>Цифру</li>
                  <li>Специальный символ (!@#$%^&*)</li>
                </ul>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? "Сохранение..." : "Сохранить пароль"}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Вернуться к входу
                </Link>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
