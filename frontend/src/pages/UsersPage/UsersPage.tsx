// frontend/src/pages/UsersPage/UsersPage.tsx
import { useState, useEffect } from "react";
import { Card } from "../../shared/ui/Card/Card";
import { Button } from "../../shared/ui/Button/Button";
import { Input } from "../../shared/ui/Input/Input";
import { Badge } from "../../shared/ui/Badge/Badge";
import { Spinner } from "../../shared/ui/Spinner/Spinner";
import { usersApi } from "../../shared/api/users.api";
import { authApi } from "../../shared/api/auth.api";
import type { User } from "../../shared/api/auth.api";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const currentUser = authApi.getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  // Загрузка пользователей
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getUsers();
      setUsers(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация пользователей
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Удаление пользователя
  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      return;
    }

    try {
      await usersApi.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления");
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "danger" as const,
      moderator: "warning" as const,
      user: "gray" as const,
    };
    const labels = {
      admin: "Администратор",
      moderator: "Модератор",
      user: "Пользователь",
    };
    return (
      <Badge variant={variants[role as keyof typeof variants]}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner text="Загрузка пользователей..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Управление пользователями
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-400">
            Всего пользователей: {users.length}
          </p>
        </div>

        {isAdmin && (
          <Button variant="primary">
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Создать пользователя
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Поиск по имени или логину..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
              fullWidth
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все роли</option>
            <option value="admin">Администратор</option>
            <option value="moderator">Модератор</option>
            <option value="user">Пользователь</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                  Пользователь
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                  Логин
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                  Роль
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                  Статус
                </th>
                {isAdmin && (
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                    Действия
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.full_name}
                      </p>
                      {user.email && (
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-zinc-300">
                    {user.username}
                  </td>
                  <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                  <td className="py-3 px-4">
                    {user.is_online ? (
                      <Badge variant="success">Онлайн</Badge>
                    ) : (
                      <Badge variant="gray">Офлайн</Badge>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button variant="ghost" size="sm">
                        Изменить
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        disabled={user.id === currentUser?.id}
                      >
                        Удалить
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-zinc-400">
                Пользователи не найдены
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
