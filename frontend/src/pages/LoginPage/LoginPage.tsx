// frontend/src/pages/LoginPage/LoginPage.tsx
import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../shared/ui/Button/Button";
import { Input } from "../../shared/ui/Input/Input";
import { Card } from "../../shared/ui/Card/Card";
import { authApi } from "../../shared/api/auth.api";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Получаем причину редиректа из URL
  const reason = searchParams.get("reason");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({ username, password });

      // Если требуется смена пароля
      if (response.require_password_change) {
        navigate("/change-password", { state: { firstLogin: true } });
        return;
      }

      // Успешный вход
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4">
            <span className="text-white text-2xl font-bold">Ц</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Вход в систему
          </h1>
          <p className="text-gray-600 dark:text-zinc-400">
            Централизация отчётности
          </p>
        </div>

        {/* Сообщение о причине редиректа */}
        {reason && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-400 text-center">
              {decodeURIComponent(reason)}
            </p>
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Имя пользователя"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите имя пользователя"
              required
              leftIcon={
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              fullWidth
            />

            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
              leftIcon={
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
              fullWidth
            />

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <Button type="submit" fullWidth loading={loading}>
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Нет аккаунта? Обратитесь к администратору
          </p>
        </div>
      </div>
    </div>
  );
}
