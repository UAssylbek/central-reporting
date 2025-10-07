// frontend/src/features/reports/steps/OrganizationStep.tsx
import { useState, useEffect } from "react";
import { usersApi } from "../../../shared/api/users.api";
import type { Organization } from "../../../shared/api/users.api";
import { Spinner } from "../../../shared/ui/Spinner/Spinner";

export interface OrganizationStepProps {
  selectedOrganizations: number[];
  onChange: (organizations: number[]) => void;
}

export function OrganizationStep({
  selectedOrganizations,
  onChange,
}: OrganizationStepProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getOrganizations();
      setOrganizations(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Не удалось загрузить организации";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrganization = (orgId: number) => {
    const newSelection = selectedOrganizations.includes(orgId)
      ? selectedOrganizations.filter((id) => id !== orgId)
      : [...selectedOrganizations, orgId];
    onChange(newSelection);
  };

  const selectAll = () => {
    onChange(filteredOrganizations.map((org) => org.id));
  };

  const deselectAll = () => {
    onChange([]);
  };

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-12">
        <Spinner text="Загрузка организаций..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">{error}</p>
        <button
          onClick={loadOrganizations}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline cursor-pointer"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Выберите организации
          </h3>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            Выбрано: {selectedOrganizations.length} из {organizations.length}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Выбрать все
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={deselectAll}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Снять все
          </button>
        </div>
      </div>

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
          placeholder="Поиск организации..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
        />
      </div>

      {/* Organizations list */}
      <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
        {filteredOrganizations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
            {searchQuery
              ? "Организации не найдены"
              : "Нет доступных организаций"}
          </div>
        ) : (
          filteredOrganizations.map((org) => (
            <label
              key={org.id}
              className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedOrganizations.includes(org.id)}
                onChange={() => toggleOrganization(org.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-900 dark:text-white flex-1">
                {org.name}
              </span>
            </label>
          ))
        )}
      </div>

      {selectedOrganizations.length === 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
          ⚠️ Выберите хотя бы одну организацию для продолжения
        </p>
      )}
    </div>
  );
}
