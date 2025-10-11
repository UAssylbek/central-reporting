// frontend/src/pages/ProfilePage/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import { authApi, type User } from "../../shared/api/auth.api";
import { Spinner } from "../../shared/ui/Spinner";
import { Button } from "../../shared/ui/Button/Button";
import { Badge } from "../../shared/ui/Badge/Badge";
import { Toast } from "../../shared/ui/Toast/Toast";
import { ChangePasswordModal } from "../../features/auth/components/ChangePasswordModal";
import { useToast } from "../../shared/hooks/useToast";

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(authApi.getCurrentUser());
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "security" | "activity">(
    "info"
  );

  const { toasts, hideToast, success } = useToast();

  useEffect(() => {
    if (!user) {
      authApi
        .me()
        .then(setUser)
        .catch(() => setError("Не удалось загрузить данные пользователя"))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handlePasswordChangeSuccess = () => {
    setIsPasswordModalOpen(false);
    success("Пароль успешно изменён");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-6">{error}</div>;
  }

  if (!user) {
    return (
      <div className="text-gray-600 dark:text-gray-300 text-center p-6">
        Нет данных пользователя
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: "Администратор",
      moderator: "Модератор",
      user: "Пользователь",
    };
    return labels[role as keyof typeof labels] || "Пользователь";
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "danger" as const,
      moderator: "warning" as const,
      user: "info" as const,
    };
    return variants[role as keyof typeof variants] || "info";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Toast уведомления */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>

      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Личный кабинет
        </h1>
      </div>

      {/* Профиль карточка */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Аватар */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-xl bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {getInitials(user.full_name || user.username)}
            </div>
            {user.is_online && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Онлайн
              </div>
            )}
          </div>

          {/* Основная информация */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {user.full_name || user.username}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                @{user.username}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={getRoleBadge(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {user.email && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Email:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.email}
                  </p>
                </div>
              )}
              {user.phone && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Телефон:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Действия */}
          <div className="flex md:flex-col gap-2">
            <Button
              onClick={() => setIsPasswordModalOpen(true)}
              variant="secondary"
              className="cursor-pointer"
            >
              Сменить пароль
            </Button>
          </div>
        </div>
      </div>

      {/* Табы */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow">
        {/* Tab Headers */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {[
              { id: "info" as const, label: "Информация" },
              { id: "security" as const, label: "Безопасность" },
              { id: "activity" as const, label: "Активность" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Полное имя
                  </span>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    {user.full_name || "—"}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Логин
                  </span>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    {user.username}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Email
                  </span>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    {user.email || "—"}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Телефон
                  </span>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    {user.phone || "—"}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Роль
                  </span>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    {getRoleLabel(user.role)}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Последняя активность
                  </span>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    {user.last_seen
                      ? new Date(user.last_seen).toLocaleString("ru-RU")
                      : "Нет данных"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Пароль
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Регулярно меняйте пароль для безопасности вашего аккаунта
                </p>
                <Button
                  onClick={() => setIsPasswordModalOpen(true)}
                  variant="primary"
                  className="cursor-pointer"
                >
                  Изменить пароль
                </Button>
              </div>

              {!user.disable_password_change && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✓ Изменение пароля разрешено
                  </p>
                </div>
              )}

              {user.disable_password_change && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    ⚠ Изменение пароля запрещено администратором
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Вход в систему
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.last_seen
                        ? new Date(user.last_seen).toLocaleString("ru-RU")
                        : "Нет данных"}
                    </p>
                  </div>
                  {user.is_online && <Badge variant="success">Активен</Badge>}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  История активности будет доступна в следующих версиях
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно смены пароля */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordChangeSuccess}
        isFirstLogin={false}
      />
    </div>
  );
};
