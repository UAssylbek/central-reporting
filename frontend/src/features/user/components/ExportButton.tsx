import { Button } from "../../../shared/ui/Button/Button";
import type { User } from "../../../shared/api/auth.api";

interface ExportButtonProps {
  readonly users: User[];
  readonly filename?: string;
}

export function ExportButton({ users, filename = "users" }: ExportButtonProps) {
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Полное имя",
      "Логин",
      "Email",
      "Телефон",
      "Роль",
      "Статус",
      "Последняя активность",
      "Дата создания",
    ];

    const rows = users.map((user) => [
      user.id,
      user.full_name,
      user.username,
      user.email || "",
      user.phone || "",
      user.role === "admin"
        ? "Администратор"
        : user.role === "moderator"
        ? "Модератор"
        : "Пользователь",
      user.is_online ? "Онлайн" : "Офлайн",
      user.last_seen || "",
      user.created_at || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="secondary"
      onClick={exportToCSV}
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
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
    >
      Экспорт в CSV
    </Button>
  );
}
