// frontend/src/pages/ProfilePage/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import { authApi, type User } from "../../shared/api/auth.api";
import { Spinner } from "../../shared/ui/Spinner";
import { Button } from "../../shared/ui/Button/Button";
import { Badge } from "../../shared/ui/Badge/Badge";
import { Toast } from "../../shared/ui/Toast/Toast";
import { ChangePasswordModal } from "../../features/auth/components/ChangePasswordModal";
import { UserFormModal } from "../../features/user/UserFormModal/UserFormModal";
import { useToast } from "../../shared/hooks/useToast";
import { motion, AnimatePresence } from "framer-motion";

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(authApi.getCurrentUser());
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
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

  const handleProfileUpdateSuccess = () => {
    setIsEditModalOpen(false);
    success("Профиль успешно обновлён");
    // Обновляем данные пользователя
    authApi.me().then(setUser);
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
          {/* Аватар с увеличением */}
          <div className="flex-shrink-0 relative">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-24 h-24 rounded-xl object-cover shadow-lg cursor-pointer hover:opacity-90 transition"
                onClick={() => setIsAvatarModalOpen(true)}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg cursor-pointer"
                onClick={() => setIsAvatarModalOpen(true)}
              >
                {getInitials(user.full_name || user.username)}
              </div>
            )}
            {user.is_online && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Онлайн
              </div>
            )}
          </div>

          {/* Модалка увеличенного аватара */}
          <AnimatePresence>
            {isAvatarModalOpen && (
              <motion.div
                key="backdrop"
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAvatarModalOpen(false)}
              >
                <motion.div
                  key="modal"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="relative bg-white dark:bg-zinc-900 rounded-2xl p-2 shadow-2xl max-w-lg w-full"
                  onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                    e.stopPropagation()
                  }
                >
                  <button
                    onClick={() => setIsAvatarModalOpen(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    ✕
                  </button>

                  {user.avatar_url ? (
                    <motion.img
                      key="avatar-img"
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="rounded-xl w-full object-contain max-h-[80vh]"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    />
                  ) : (
                    <motion.div
                      key="avatar-fallback"
                      className="w-full aspect-square bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl font-bold rounded-xl"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      {getInitials(user.full_name || user.username)}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Основная информация */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {user.full_name || user.username}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                @{user.username}
              </p>
              {user.position && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {user.position}
                  {user.department && ` • ${user.department}`}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={getRoleBadge(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
              {user.tags?.map((tag, idx) => (
                <Badge key={idx} variant="info">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {user.emails && user.emails.length > 0 && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Email:
                  </span>
                  <div className="space-y-1">
                    {user.emails.map((email, idx) => (
                      <p
                        key={idx}
                        className="font-medium text-gray-900 dark:text-white"
                      >
                        {email}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {user.phones && user.phones.length > 0 && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Телефон:
                  </span>
                  <div className="space-y-1">
                    {user.phones.map((phone, idx) => (
                      <p
                        key={idx}
                        className="font-medium text-gray-900 dark:text-white"
                      >
                        {phone}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Действия */}
          <div className="flex md:flex-col gap-2">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="primary"
              className="cursor-pointer"
            >
              Редактировать профиль
            </Button>
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
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
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
            <div className="space-y-6">
              {/* Основная информация */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Основная информация
                </h3>
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

                  {user.position && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        Должность
                      </span>
                      <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                        {user.position}
                      </p>
                    </div>
                  )}

                  {user.department && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        Отдел
                      </span>
                      <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                        {user.department}
                      </p>
                    </div>
                  )}

                  {user.birth_date && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        Дата рождения
                      </span>
                      <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                        {new Date(user.birth_date).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Роль
                    </span>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                      {getRoleLabel(user.role)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Адрес */}
              {(user.address || user.city || user.country) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Адрес
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.address && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg md:col-span-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Адрес
                        </span>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                          {user.address}
                        </p>
                      </div>
                    )}
                    {user.city && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Город
                        </span>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                          {user.city}
                        </p>
                      </div>
                    )}
                    {user.country && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Страна
                        </span>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                          {user.country}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Рабочие настройки */}
              {(user.timezone || user.work_hours) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Рабочие настройки
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.timezone && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Часовой пояс
                        </span>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                          {user.timezone}
                        </p>
                      </div>
                    )}
                    {user.work_hours && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Рабочие часы
                        </span>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                          {user.work_hours}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Социальные сети */}
              {user.social_links &&
                Object.keys(user.social_links).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Социальные сети
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.social_links.telegram && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            Telegram
                          </span>
                          <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                            {user.social_links.telegram}
                          </p>
                        </div>
                      )}
                      {user.social_links.whatsapp && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            WhatsApp
                          </span>
                          <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                            {user.social_links.whatsapp}
                          </p>
                        </div>
                      )}
                      {user.social_links.linkedin && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            LinkedIn
                          </span>
                          <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                            {user.social_links.linkedin}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Комментарий */}
              {user.comment && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Комментарий
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {user.comment}
                    </p>
                  </div>
                </div>
              )}
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

      {/* Модальное окно редактирования профиля */}
      <UserFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleProfileUpdateSuccess}
        user={user}
      />
    </div>
  );
};
