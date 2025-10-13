import type { User } from "../../../shared/api/auth.api";

interface QuickFiltersProps {
  readonly users: User[];
  readonly onFilterApply: (filter: (users: User[]) => User[]) => void;
  readonly activeFilter: string | null;
  readonly setActiveFilter: (filter: string | null) => void;
}

export function QuickFilters({
  users,
  onFilterApply,
  activeFilter,
  setActiveFilter,
}: QuickFiltersProps) {
  const filters = [
    {
      id: "online",
      label: "🟢 Только онлайн",
      count: users.filter((u) => u.is_online).length,
      filter: (users: User[]) => users.filter((u) => u.is_online),
    },
    {
      id: "new",
      label: "✨ Новые (за неделю)",
      count: users.filter((u) => {
        if (!u.created_at) return false;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(u.created_at) > weekAgo;
      }).length,
      filter: (users: User[]) =>
        users.filter((u) => {
          if (!u.created_at) return false;
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(u.created_at) > weekAgo;
        }),
    },
    {
      id: "inactive",
      label: "😴 Неактивные (30+ дней)",
      count: users.filter((u) => {
        if (!u.last_seen) return false;
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        return new Date(u.last_seen) < monthAgo;
      }).length,
      filter: (users: User[]) =>
        users.filter((u) => {
          if (!u.last_seen) return false;
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          return new Date(u.last_seen) < monthAgo;
        }),
    },
    {
      id: "password_change",
      label: "🔐 Требуют смены пароля",
      count: users.filter((u) => u.require_password_change).length,
      filter: (users: User[]) => users.filter((u) => u.require_password_change),
    },
  ];

  const handleFilterClick = (
    filterId: string,
    filterFn: (users: User[]) => User[]
  ) => {
    if (activeFilter === filterId) {
      setActiveFilter(null);
      onFilterApply(() => users);
    } else {
      setActiveFilter(filterId);
      onFilterApply(filterFn);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => handleFilterClick(filter.id, filter.filter)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
            activeFilter === filter.id
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
          }`}
        >
          {filter.label}
          <span
            className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
              activeFilter === filter.id
                ? "bg-white/20"
                : "bg-gray-200 dark:bg-zinc-700"
            }`}
          >
            {filter.count}
          </span>
        </button>
      ))}
    </div>
  );
}
