// frontend/src/features/user/components/OrganizationSelectModal/OrganizationSelectModal.tsx
import { useState, useEffect } from "react";
import { Modal } from "../../../../shared/ui/Modal/Modal";
import { Button } from "../../../../shared/ui/Button/Button";
import { Input } from "../../../../shared/ui/Input/Input";

export interface Organization {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

interface OrganizationSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: Organization[];
  selectedIds: number[];
  onConfirm: (selectedIds: number[]) => void;
  loading?: boolean;
}

export function OrganizationSelectModal({
  isOpen,
  onClose,
  organizations,
  selectedIds,
  onConfirm,
  loading = false,
}: OrganizationSelectModalProps) {
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

  // Фильтрация организаций
  const filteredOrganizations = organizations.filter((org) => {
    const query = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(query) ||
      org.code?.toLowerCase().includes(query) ||
      org.description?.toLowerCase().includes(query)
    );
  });

  // Переключение выбора организации
  const toggleOrganization = (id: number) => {
    setLocalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((orgId) => orgId !== id) : [...prev, id]
    );
  };

  // Выбрать все (из отфильтрованных)
  const selectAll = () => {
    const allFilteredIds = filteredOrganizations.map((org) => org.id);
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
    const allFilteredIds = filteredOrganizations.map((org) => org.id);
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
      title="Выбор организаций"
      size="lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <Input
          placeholder="Поиск по названию, коду или описанию..."
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
            Выбрано: {localSelectedIds.length} из {organizations.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={selectAll}
              disabled={filteredOrganizations.length === 0}
            >
              Выбрать все
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={deselectAll}
              disabled={filteredOrganizations.length === 0}
            >
              Снять все
            </Button>
          </div>
        </div>

        {/* Organizations List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">🏢</div>
              <p className="text-gray-600 dark:text-zinc-400">
                {searchQuery
                  ? "Организации не найдены"
                  : "Нет доступных организаций"}
              </p>
            </div>
          ) : (
            filteredOrganizations.map((org) => {
              const isSelected = localSelectedIds.includes(org.id);
              return (
                <label
                  key={org.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOrganization(org.id)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {org.name}
                    </div>
                    {org.code && (
                      <div className="text-sm text-gray-600 dark:text-zinc-400">
                        Код: {org.code}
                      </div>
                    )}
                    {org.description && (
                      <div className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
                        {org.description}
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
          <Button variant="secondary" onClick={handleCancel} className="cursor-pointer">
            Отмена
          </Button>
          <Button onClick={handleConfirm} className="cursor-pointer">
            Применить ({localSelectedIds.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
}
