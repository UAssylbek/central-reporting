// frontend/src/features/user/UserViewModal/UserViewModal.tsx
import { Modal } from "../../../shared/ui/Modal/Modal";
import { Button } from "../../../shared/ui/Button/Button";
import { Badge } from "../../../shared/ui/Badge/Badge";
import type { User } from "../../../shared/api/auth.api";
import { getAvatarUrl } from "../../../shared/utils/url";

interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onEdit: () => void;
  onDelete: () => void;
  currentUserRole: string;
  currentUserId: number;
}

/**
 * Модальное окно просмотра информации о пользователе
 * С кнопками "Редактировать" и "Удалить"
 */
export function UserViewModal({
  isOpen,
  onClose,
  user,
  onEdit,
  onDelete,
  currentUserRole,
  currentUserId,
}: UserViewModalProps) {
  if (!user) return null;

  const isAdmin = currentUserRole === "admin";
  const isModerator = currentUserRole === "moderator";
  const isCurrentUser = user.id === currentUserId;

  // Права на редактирование
  const canEdit =
    isCurrentUser || // Сам себя
    isAdmin || // Админ всех
    (isModerator && user.role === "user"); // Модератор только user'ов

  // Права на удаление
  const canDelete = isAdmin && !isCurrentUser; // Только админ, но не себя

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
      case "moderator":
        return "warning";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Информация о пользователе"
      size="xl"
    >
      <div className="space-y-6">
        {/* Шапка с аватаром */}
        <div className="flex items-start gap-6 pb-6 border-b border-gray-200 dark:border-zinc-700">
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <img
                src={getAvatarUrl(user.avatar_url)}
                alt={user.full_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {user.full_name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              @{user.username}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {user.role === "admin"
                  ? "Администратор"
                  : user.role === "moderator"
                  ? "Модератор"
                  : "Пользователь"}
              </Badge>
              {user.is_online ? (
                <Badge variant="success">🟢 Online</Badge>
              ) : (
                <Badge variant="secondary">⚪ Offline</Badge>
              )}
              {!user.is_active && (
                <Badge variant="error">🚫 Заблокирован</Badge>
              )}
              {user.is_first_login && (
                <Badge variant="warning">⚠️ Первый вход</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Контактная информация */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Контактная информация
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoField
              label="Email"
              value={user.emails?.[0] || "—"}
              icon="📧"
            />
            <InfoField
              label="Телефон"
              value={user.phones?.[0] || "—"}
              icon="📱"
            />
            <InfoField
              label="Должность"
              value={user.position || "—"}
              icon="💼"
            />
            <InfoField
              label="Отдел"
              value={user.department || "—"}
              icon="🏢"
            />
          </div>
        </div>

        {/* Дополнительные контакты */}
        {((user.emails && user.emails.length > 1) ||
          (user.phones && user.phones.length > 1)) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Дополнительные контакты
            </h3>
            <div className="space-y-2">
              {user.emails && user.emails.length > 1 && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Emails:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.emails.slice(1).map((email, idx) => (
                      <Badge key={idx} variant="secondary">
                        {email}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {user.phones && user.phones.length > 1 && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Телефоны:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.phones.slice(1).map((phone, idx) => (
                      <Badge key={idx} variant="secondary">
                        {phone}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Системная информация */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Системная информация
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoField
              label="Создан"
              value={formatDate(user.created_at)}
              icon="📅"
            />
            <InfoField
              label="Обновлен"
              value={formatDate(user.updated_at)}
              icon="🔄"
            />
            <InfoField
              label="Последняя активность"
              value={formatDate(user.last_seen)}
              icon="👁️"
            />
            {user.blocked_at && (
              <InfoField
                label="Заблокирован"
                value={formatDate(user.blocked_at)}
                icon="🚫"
              />
            )}
          </div>
        </div>

        {/* Причина блокировки */}
        {user.blocked_reason && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              Причина блокировки:
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              {user.blocked_reason}
            </p>
          </div>
        )}

        {/* Комментарий */}
        {user.comment && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Комментарий
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {user.comment}
            </p>
          </div>
        )}

        {/* Теги */}
        {user.tags && user.tags.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Теги
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">
                  🏷️ {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-zinc-700">
          <div className="flex gap-3">
            {canEdit && (
              <Button onClick={onEdit} className="cursor-pointer">
                ✏️ Редактировать
              </Button>
            )}
            {canDelete && (
              <Button
                variant="error"
                onClick={onDelete}
                className="cursor-pointer"
              >
                🗑️ Удалить
              </Button>
            )}
          </div>
          <Button
            variant="secondary"
            onClick={onClose}
            className="cursor-pointer"
          >
            Закрыть
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Компонент для отображения одного поля информации
 */
function InfoField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {icon} {label}
      </div>
      <div className="text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}
