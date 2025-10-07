// frontend/src/features/user/components/UserSelectModal/UserSelectModal.tsx
import { useState, useEffect } from "react";
import { Modal } from "../../../../shared/ui/Modal/Modal";
import { Button } from "../../../../shared/ui/Button/Button";
import { Input } from "../../../../shared/ui/Input/Input";

export interface SelectableUser {
  id: number;
  username: string;
  full_name: string;
  email?: string;
  role: "user" | "moderator" | "admin";
}

interface UserSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: SelectableUser[];
  selectedIds: number[];
  onConfirm: (selectedIds: number[]) => void;
  loading?: boolean;
}

export function UserSelectModal({
  isOpen,
  onClose,
  users,
  selectedIds,
  onConfirm,
  loading = false,
}: UserSelectModalProps) {
  const [localSelectedIds, setLocalSelectedIds] =
    useState<number[]>(selectedIds);
  const [searchQuery, setSearchQuery] = useState("");

  // Синхронизация с внешним состоянием при открытии
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedIds(selectedIds);
      setSearchQuery("");
    }
  }, [isOpen, selectedIds]);

  // Фильтрация пользователей
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.full_name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  // Переключение выбора пользователя
  const toggleUser = (id: number) => {
    setLocalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  // Выбрать все (из отфильтрованных)
  const selectAll = () => {
    const allFilteredIds = filteredUsers.map((user) => user.id);
    setLocalSelectedIds((prev) => {
      const newIds = [...prev];
      allFilteredIds.forEach((id) => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });
      return newIds;
    });
  };

  // Снять все (из отфильтрованных)
  const deselectAll = () => {
    const allFilteredIds = filteredUsers.map((user) => user.id);
    setLocalSelectedIds((prev) =>
      prev.filter((id) => !allFilteredIds.includes(id))
    );
  };

  const handleConfirm = () => {
    onConfirm(localSelectedIds);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelectedIds(selectedIds); // Сброс к исходному состоянию
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Выбор пользователей"
      size="lg"
    >
      <div className="space-y-4">
        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Выберите пользователей, которыми сможет управлять модератор
          </p>
        </div>

        {/* Search */}
        <Input
          placeholder="Поиск по имени, логину или email..."
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
        />

        {/* Select All / Deselect All */}
        <div className="flex items-center justify-between py-2 border-y border-gray-200 dark:border-zinc-700">
          <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
            Выбрано: {localSelectedIds.length} из {users.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAll}
              disabled={filteredUsers.length === 0}
            >
              Выбрать все
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deselectAll}
              disabled={filteredUsers.length === 0}
            >
              Снять все
            </Button>
          </div>
        </div>

        {/* Users List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-600 dark:text-zinc-400">
                {searchQuery
                  ? "Пользователи не найдены"
                  : "Нет доступных пользователей"}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = localSelectedIds.includes(user.id);
              return (
                <label
                  key={user.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleUser(user.id)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                          {user.full_name[0] || user.username[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-zinc-400 truncate">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                    {user.email && (
                      <div className="text-sm text-gray-500 dark:text-zinc-500 mt-1 truncate">
                        {user.email}
                      </div>
                    )}
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-zinc-700">
          <Button variant="secondary" onClick={handleCancel}>
            Отмена
          </Button>
          <Button onClick={handleConfirm}>
            Применить ({localSelectedIds.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
}
