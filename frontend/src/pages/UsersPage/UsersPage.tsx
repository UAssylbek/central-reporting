// frontend/src/pages/UsersPage/UsersPage.tsx
import { useState, useEffect } from "react";
import { Button } from "../../shared/ui/Button/Button";
import { Card } from "../../shared/ui/Card/Card";
import { Badge } from "../../shared/ui/Badge/Badge";
import { Spinner } from "../../shared/ui/Spinner/Spinner";
import { Toast } from "../../shared/ui/Toast/Toast";
import { ConfirmModal } from "../../shared/ui/ConfirmModal/ConfirmModal";
import { UserFormModal } from "../../features/user/UserFormModal/UserFormModal";
import { useToast } from "../../shared/hooks/useToast";
import { usersApi } from "../../shared/api/users.api";
import { authApi } from "../../shared/api/auth.api";
import type { User } from "../../shared/api/auth.api";

export function UsersPage() {
  const { toasts, hideToast, success, error: showError } = useToast();
  const currentUser = authApi.getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getUsers();
      setUsers(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Не удалось загрузить пользователей";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    try {
      setIsDeleting(true);
      await usersApi.deleteUser(deletingUser.id);
      success(`Пользователь "${deletingUser.full_name}" успешно удалён`);
      await loadUsers();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Не удалось удалить пользователя";
      showError(errorMessage);
    } finally {
      setIsDeleting(false);
      setDeletingUser(null);
    }
  };

  const handleFormSuccess = async () => {
    success(editingUser ? "Пользователь обновлён" : "Пользователь создан");
    await loadUsers();
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: { variant: "danger" as const, label: "Администратор" },
      moderator: { variant: "warning" as const, label: "Модератор" },
      user: { variant: "info" as const, label: "Пользователь" },
    };
    const config = variants[role as keyof typeof variants] || variants.user;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (isOnline: boolean) => {
    return isOnline ? (
      <Badge variant="success">🟢 Онлайн</Badge>
    ) : (
      <Badge variant="gray">⚪ Офлайн</Badge>
    );
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <Spinner fullScreen text="Загрузка пользователей..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Управление пользователями
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-400">
            {isAdmin
              ? "Полный доступ к управлению пользователями"
              : "Ограниченный доступ"}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleCreateUser} className="cursor-pointer">
            <span className="mr-2">➕</span>
            Создать пользователя
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Поиск по имени, логину или email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Всего пользователей
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.length}
              </p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-zinc-400">Онлайн</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {users.filter((u) => u.is_online).length}
              </p>
            </div>
            <span className="text-3xl">🟢</span>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Администраторы
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
            <span className="text-3xl">👑</span>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Пользователи не найдены
            </h3>
            <p className="text-gray-600 dark:text-zinc-400">
              {searchQuery
                ? "Попробуйте изменить поисковый запрос"
                : "Нет пользователей для отображения"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Пользователь
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Роль
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Статус
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Контакты
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold">
                          {user.full_name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-zinc-400">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-4">
                      {getStatusBadge(user.is_online)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {user.email && (
                          <div className="text-gray-900 dark:text-white">
                            {user.email}
                          </div>
                        )}
                        {user.phone && (
                          <div className="text-gray-500 dark:text-zinc-400">
                            {user.phone}
                          </div>
                        )}
                        {!user.email && !user.phone && (
                          <span className="text-gray-400 dark:text-zinc-500">
                            Не указаны
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        {isAdmin && user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                            title="Удалить"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(null);
        }}
        onSuccess={handleFormSuccess}
        user={editingUser}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить пользователя?"
        message={`Вы действительно хотите удалить пользователя "${deletingUser?.full_name}"? Это действие необратимо.`}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
}
