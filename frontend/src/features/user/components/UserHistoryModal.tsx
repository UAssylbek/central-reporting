import { Modal } from "../../../shared/ui/Modal/Modal";
import type { User } from "../../../shared/api/auth.api";

interface UserHistoryModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly user: User | null;
}

export function UserHistoryModal({
  isOpen,
  onClose,
  user,
}: UserHistoryModalProps) {
  if (!user) return null;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const historyEvents = [
    {
      id: 1,
      type: "created",
      description: "Пользователь создан",
      timestamp: user.created_at,
      actor: "Система",
    },
    {
      id: 2,
      type: "login",
      description: "Вход в систему",
      timestamp: user.last_seen,
      actor: user.username,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`История: ${user.full_name}`}
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <div>
            <span className="text-sm text-gray-600 dark:text-zinc-400">
              Создан
            </span>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(user.created_at)}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-zinc-400">
              Последняя активность
            </span>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(user.last_seen)}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-zinc-400">
              Версия токена
            </span>
            <p className="font-medium text-gray-900 dark:text-white">
              {user.token_version ?? "—"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-zinc-400">
              Первый вход
            </span>
            <p className="font-medium text-gray-900 dark:text-white">
              {user.is_first_login ? "Да" : "Нет"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            События
          </h3>
          <div className="space-y-3">
            {historyEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 border border-gray-200 dark:border-zinc-700 rounded-lg"
              >
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-zinc-400">
                    <span>{formatDate(event.timestamp)}</span>
                    <span>•</span>
                    <span>Инициатор: {event.actor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
