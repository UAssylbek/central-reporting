// frontend/src/pages/UsersPage/UsersPage.tsx
import { useState, useEffect, useMemo } from "react";
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
import { getAvatarUrl } from "../../shared/utils/url";

type SortField =
  | "full_name"
  | "username"
  | "role"
  | "email"
  | "last_seen"
  | "created_at"
  | "is_online";
type SortOrder = "asc" | "desc";
type RoleFilter = "all" | "admin" | "moderator" | "user";
type StatusFilter = "all" | "online" | "offline";

export function UsersPage() {
  const { toasts, hideToast, success, error: showError } = useToast();
  const currentUser = authApi.getCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const isModerator = currentUser?.role === "moderator";

  // Данные
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Поиск и фильтры
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null
  );

  // Сортировка
  const [sortField, setSortField] = useState<SortField>("full_name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Модальные окна
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Массовые действия (только для админа)
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
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
      setRefreshing(false);
    }
  };

  // Применение фильтров и сортировки
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Для модератора показываем только обычных пользователей
    if (isModerator) {
      result = result.filter((user) => user.role === "user");
    }

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          user.emails?.[0]?.toLowerCase().includes(query) ||
          user.phones?.[0]?.toLowerCase().includes(query)
      );
    }

    // Фильтр по роли (только для админа)
    if (isAdmin && roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Фильтр по статусу
    if (statusFilter !== "all") {
      result = result.filter((user) =>
        statusFilter === "online" ? user.is_online : !user.is_online
      );
    }

    // Сортировка
    result.sort((a, b) => {
      // ✅ ИСПРАВЛЕНИЕ: Правильные типы для значений
      let aValue: string | number | boolean | undefined;
      let bValue: string | number | boolean | undefined;

      // Специальная обработка для массивов (emails, phones)
      if (sortField === "email") {
        aValue = a.emails?.[0] || "";
        bValue = b.emails?.[0] || "";
      } else {
        aValue = a[sortField as keyof User] as
          | string
          | number
          | boolean
          | undefined;
        bValue = b[sortField as keyof User] as
          | string
          | number
          | boolean
          | undefined;
      }

      // Обработка null/undefined значений
      aValue = aValue ?? "";
      bValue = bValue ?? "";

      // Сортировка по статусу (онлайн/офлайн)
      if (sortField === "is_online") {
        const aOnline = a.is_online ? 1 : 0;
        const bOnline = b.is_online ? 1 : 0;
        return sortOrder === "asc" ? aOnline - bOnline : bOnline - aOnline;
      }

      // Сравнение для дат
      if (sortField === "last_seen" || sortField === "created_at") {
        const aTime = aValue ? new Date(aValue as string).getTime() : 0;
        const bTime = bValue ? new Date(bValue as string).getTime() : 0;
        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      }

      // Сравнение для строк
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue
          .toLowerCase()
          .localeCompare(bValue.toLowerCase());
        return sortOrder === "asc" ? comparison : -comparison;
      }

      // Сравнение для чисел
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return result;
  }, [
    users,
    searchQuery,
    roleFilter,
    statusFilter,
    sortField,
    sortOrder,
    isAdmin,
    isModerator,
  ]);

  // Пагинация
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredAndSortedUsers.slice(start, start + perPage);
  }, [filteredAndSortedUsers, currentPage, perPage]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / perPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg
          className="w-4 h-4 opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
    return sortOrder === "asc" ? (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
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
      await loadUsers(false);
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
    await loadUsers(false);
  };

  const resetFilters = () => {
    setSearchQuery("");
    if (isAdmin) {
      setRoleFilter("all");
    }
    setStatusFilter("all");
    setActiveQuickFilter(null);
    setSortField("full_name");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    (isAdmin && roleFilter !== "all") ||
    statusFilter !== "all" ||
    activeQuickFilter;

  // Массовые действия (только для админа)
  const toggleSelectAll = () => {
    if (selectedUserIds.length === paginatedUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(paginatedUsers.map((u) => u.id));
    }
  };

  const toggleSelectUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <Spinner fullScreen text="Загрузка пользователей..." />;
  }

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Управление пользователями
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-400">
            {isAdmin
              ? "Полный доступ к управлению пользователями"
              : "Просмотр и редактирование пользователей"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="cursor-pointer"
            onClick={() => loadUsers(false)}
            disabled={refreshing}
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            }
          >
            {refreshing ? "Обновление..." : "Обновить"}
          </Button>
          {isAdmin && (
            <Button onClick={handleCreateUser} className="cursor-pointer">
              <span className="mr-2">➕</span>
              Создать пользователя
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
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
              placeholder="Поиск по имени, логину, email или телефону..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Фильтры:
            </span>

            {/* Role Filter - только для админа */}
            {isAdmin && (
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="all">Все роли</option>
                <option value="admin">Администраторы</option>
                <option value="moderator">Модераторы</option>
                <option value="user">Пользователи</option>
              </select>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">Все статусы</option>
              <option value="online">Онлайн</option>
              <option value="offline">Офлайн</option>
            </select>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
              >
                ✕ Сбросить фильтры
              </button>
            )}

            <div className="ml-auto text-sm text-gray-600 dark:text-zinc-400">
              Показано:{" "}
              <span className="font-semibold">
                {filteredAndSortedUsers.length}
              </span>{" "}
              из <span className="font-semibold">{users.length}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats - разные для админа и модератора */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  Онлайн
                </p>
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
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  Модераторы
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {users.filter((u) => u.role === "moderator").length}
                </p>
              </div>
              <span className="text-3xl">⭐</span>
            </div>
          </Card>
        </div>
      ) : (
        // Статистика для модератора - только обычные пользователи
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  Всего пользователей
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter((u) => u.role === "user").length}
                </p>
              </div>
              <span className="text-3xl">👥</span>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  Онлайн
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {users.filter((u) => u.role === "user" && u.is_online).length}
                </p>
              </div>
              <span className="text-3xl">🟢</span>
            </div>
          </Card>
        </div>
      )}

      {/* Массовые действия - только для админа */}
      {isAdmin && selectedUserIds.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-zinc-300">
              Выбрано:{" "}
              <span className="font-semibold">{selectedUserIds.length}</span>
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedUserIds([])}
                className="cursor-pointer"
              >
                Снять выделение
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        {filteredAndSortedUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Пользователи не найдены
            </h3>
            <p className="text-gray-600 dark:text-zinc-400">
              {hasActiveFilters
                ? "Попробуйте изменить фильтры или поисковый запрос"
                : "Нет пользователей для отображения"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-700">
                    {/* Чекбокс только для админа */}
                    {isAdmin && (
                      <th className="px-4 py-3 w-12">
                        <input
                          type="checkbox"
                          checked={
                            paginatedUsers.length > 0 &&
                            selectedUserIds.length === paginatedUsers.length
                          }
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                        />
                      </th>
                    )}
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => handleSort("full_name")}
                    >
                      <div className="flex items-center gap-2">
                        Пользователь
                        {getSortIcon("full_name")}
                      </div>
                    </th>
                    {/* Колонка Роль только для админа */}
                    {isAdmin && (
                      <th
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => handleSort("role")}
                      >
                        <div className="flex items-center gap-2">
                          Роль
                          {getSortIcon("role")}
                        </div>
                      </th>
                    )}
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => handleSort("is_online")}
                    >
                      <div className="flex items-center gap-2">
                        Статус
                        {getSortIcon("is_online")}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center gap-2">
                        Контакты
                        {getSortIcon("email")}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => handleSort("last_seen")}
                    >
                      <div className="flex items-center gap-2">
                        Последняя активность
                        {getSortIcon("last_seen")}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${
                        isAdmin && selectedUserIds.includes(user.id)
                          ? "bg-blue-50 dark:bg-blue-900/10"
                          : ""
                      }`}
                    >
                      {/* Чекбокс только для админа */}
                      {isAdmin && (
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => toggleSelectUser(user.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={getAvatarUrl(user.avatar_url)}
                              alt={user.full_name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-zinc-700"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {user.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                          )}
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
                      {/* Роль только для админа */}
                      {isAdmin && (
                        <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                      )}
                      <td className="px-4 py-4">
                        {getStatusBadge(user.is_online)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          {/* ✅ ИСПРАВЛЕНО: Используем emails[0] и phones[0] */}
                          <div className="text-gray-900 dark:text-white">
                            {user.emails?.[0] || "—"}
                          </div>
                          {user.phones?.[0] && (
                            <div className="text-gray-500 dark:text-zinc-400">
                              {user.phones[0]}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-600 dark:text-zinc-400">
                          {formatDate(user.last_seen)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                            title={isModerator ? "Просмотр" : "Редактировать"}
                          >
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          {isAdmin && user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                              title="Удалить"
                            >
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 dark:border-zinc-700 px-4 py-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-zinc-300">
                      Показано {(currentPage - 1) * perPage + 1}-
                      {Math.min(
                        currentPage * perPage,
                        filteredAndSortedUsers.length
                      )}{" "}
                      из {filteredAndSortedUsers.length}
                    </span>
                    <select
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-sm cursor-pointer"
                    >
                      <option value={10}>10 на странице</option>
                      <option value={20}>20 на странице</option>
                      <option value={50}>50 на странице</option>
                      <option value={100}>100 на странице</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                    >
                      ««
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                    >
                      ←
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1 border rounded cursor-pointer text-sm ${
                                page === currentPage
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : "border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                    )}

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                    >
                      →
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                    >
                      »»
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modals */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSuccess={handleFormSuccess}
      />

      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить пользователя?"
        message={`Вы уверены, что хотите удалить пользователя "${deletingUser?.full_name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
