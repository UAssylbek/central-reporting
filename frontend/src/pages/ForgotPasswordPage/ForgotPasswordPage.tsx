// frontend/src/pages/ForgotPasswordPage/ForgotPasswordPage.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/ui/Button/Button";
import { Input } from "../../shared/ui/Input/Input";
import { Card } from "../../shared/ui/Card/Card";
import { apiClient } from "../../shared/api/client";

export function ForgotPasswordPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiClient.post("/auth/forgot-password", {
        username_or_email: usernameOrEmail,
      }, false); // false = без auth токена

      setSuccess(true);
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
              Проверьте ваш email
            </h2>

            <p className="text-gray-600 dark:text-zinc-400 mb-6">
              Если пользователь с таким логином существует, на email будет
              отправлена ссылка для сброса пароля.
            </p>

            <Link to="/login">
              <Button variant="primary" className="w-full">
                Вернуться к входу
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
              Забыли пароль?
            </h1>
            <p className="text-gray-600 dark:text-zinc-400">
              Введите ваш логин и мы отправим инструкции для сброса пароля
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Логин"
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Введите логин"
              required
              autoFocus
            />

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
              disabled={loading || !usernameOrEmail}
            >
              {loading ? "Отправка..." : "Отправить ссылку"}
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
        </div>
      </Card>
    </div>
  );
}
