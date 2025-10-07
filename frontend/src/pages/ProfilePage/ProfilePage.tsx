import React, { useEffect, useState } from "react";
import { authApi, type User } from "../../shared/api/auth.api";
import { Spinner } from "../../shared/ui/Spinner";

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(authApi.getCurrentUser());
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Если данных нет в localStorage, запрашиваем с сервера
    if (!user) {
      authApi
        .me()
        .then(setUser)
        .catch(() => setError("Не удалось загрузить данные пользователя"))
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );

  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  if (!user)
    return (
      <div className="text-gray-600 dark:text-gray-300 text-center p-6">
        Нет данных пользователя
      </div>
    );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Личный кабинет</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-3">
        <div>
          <span className="text-gray-500 dark:text-gray-400 text-sm">Имя:</span>
          <p className="text-lg font-medium">
            {user.full_name || user.username}
          </p>
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Email:
          </span>
          <p className="text-lg font-medium">{user.email || "—"}</p>
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Телефон:
          </span>
          <p className="text-lg font-medium">{user.phone || "—"}</p>
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Роль:
          </span>
          <p className="text-lg font-medium capitalize">{user.role}</p>
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Последняя активность:
          </span>
          <p className="text-lg font-medium">
            {user.last_seen
              ? new Date(user.last_seen).toLocaleString()
              : "Нет данных"}
          </p>
        </div>
      </div>
    </div>
  );
};
