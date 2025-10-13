// frontend/src/features/user/UserFormModal/UserFormModal.tsx
import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../../../shared/ui/Modal/Modal";
import { Button } from "../../../shared/ui/Button/Button";
import { Badge } from "../../../shared/ui/Badge/Badge";
import { Input } from "../../../shared/ui/Input/Input";
import { authApi, type User } from "../../../shared/api/auth.api";
import { formatPhoneNumber } from "../../../shared/utils/formatPhone";
import {
  usersApi,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "../../../shared/api/users.api";
import { organizationsApi } from "../../../shared/api/organizations.api";
import {
  OrganizationSelectModal,
  type Organization,
} from "../components/OrganizationSelectModal";
import {
  UserSelectModal,
  type SelectableUser,
} from "../components/UserSelectModal";

interface ExtendedUser extends User {
  created_at?: string;
  updated_at?: string;
}

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
}

interface UserFormData {
  full_name: string;
  username: string;
  password: string;
  role: "admin" | "moderator" | "user";
  email: string;
  phone: string;
  comment: string;
  require_password_change: boolean;
  disable_password_change: boolean;
  show_in_selection: boolean;
  available_organizations: number[];
  accessible_users: number[];
}

// Компонент для отображения поля в режиме просмотра
interface ViewModeFieldProps {
  readonly label: string;
  readonly value: string | number | boolean | undefined | null;
  readonly type?: "text" | "boolean" | "badge";
  readonly badgeVariant?: "success" | "danger" | "warning" | "info" | "gray";
}

function ViewModeField({
  label,
  value,
  type = "text",
  badgeVariant,
}: ViewModeFieldProps) {
  const renderValue = () => {
    if (value === null || value === undefined || value === "") {
      return (
        <span className="text-gray-400 dark:text-zinc-500">Не указано</span>
      );
    }

    if (type === "boolean") {
      return value ? (
        <Badge variant="success">✓ Да</Badge>
      ) : (
        <Badge variant="gray">✗ Нет</Badge>
      );
    }

    if (type === "badge" && typeof value === "string") {
      return <Badge variant={badgeVariant || "info"}>{value}</Badge>;
    }

    return (
      <span className="text-gray-900 dark:text-white">{String(value)}</span>
    );
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-600 dark:text-zinc-400">
        {label}
      </label>
      <div className="px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg">
        {renderValue()}
      </div>
    </div>
  );
}

export function UserFormModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: UserFormModalProps) {
  const currentUser = authApi.getCurrentUser();
  const isEditing = !!user;
  const isModerator = currentUser?.role === "moderator";
  const isAdmin = currentUser?.role === "admin";
  const isViewMode = isModerator && !!user; // Модератор всегда в режиме просмотра

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    full_name: "",
    username: "",
    password: "",
    role: "user",
    email: "",
    phone: "",
    comment: "",
    require_password_change: true,
    disable_password_change: false,
    show_in_selection: true,
    available_organizations: [],
    accessible_users: [],
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Organizations
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [showOrganizationsModal, setShowOrganizationsModal] = useState(false);

  // Users (for moderators)
  const [allUsers, setAllUsers] = useState<SelectableUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  // Load organizations
  useEffect(() => {
    if (isOpen && !isModerator) {
      loadOrganizations();
    }
  }, [isOpen, isModerator]);

  // Load users (only for admin when creating/editing moderator)
  useEffect(() => {
    if (isOpen && isAdmin && formData.role === "moderator") {
      loadUsers();
    }
  }, [isOpen, isAdmin, formData.role]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        username: user.username,
        password: "",
        role: user.role,
        email: user.email || "",
        phone: user.phone || "",
        comment: "",
        require_password_change: user.require_password_change,
        disable_password_change: user.disable_password_change,
        show_in_selection: user.show_in_selection,
        available_organizations: user.available_organizations || [],
        accessible_users: user.accessible_users || [],
      });
    } else {
      // Reset for new user
      setFormData({
        full_name: "",
        username: "",
        password: "",
        role: "user",
        email: "",
        phone: "",
        comment: "",
        require_password_change: true,
        disable_password_change: false,
        show_in_selection: true,
        available_organizations: [],
        accessible_users: [],
      });
    }
    setError("");
    setShowPassword(false);
  }, [user, isOpen]);

  const loadOrganizations = async () => {
    setLoadingOrganizations(true);
    try {
      const orgs = await organizationsApi.getAll();
      setOrganizations(orgs);
    } catch (err) {
      console.error("Failed to load organizations:", err);
      setOrganizations([]);
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await usersApi.getUsers();
      setAllUsers(
        users
          .filter((u: User) => u.role === "user")
          .map((u: User) => ({
            id: u.id,
            username: u.username,
            full_name: u.full_name,
            email: u.email,
            role: u.role,
          }))
      );
    } catch (err) {
      console.error("Failed to load users:", err);
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.full_name.trim()) {
      return "Полное имя обязательно для заполнения";
    }

    if (!isEditing && !formData.username.trim()) {
      return "Имя для входа обязательно для заполнения";
    }

    if (
      !isEditing &&
      !formData.require_password_change &&
      formData.password.length < 6
    ) {
      return "Пароль должен содержать не менее 6 символов или включите 'Требовать смену пароля'";
    }

    if (isEditing && formData.password && formData.password.length < 6) {
      return "Пароль должен содержать не менее 6 символов";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Некорректный email адрес";
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && user) {
        const updateData: UpdateUserRequest = {
          full_name: formData.full_name,
          role: formData.role,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          require_password_change: formData.require_password_change,
          disable_password_change: formData.disable_password_change,
          show_in_selection: formData.show_in_selection,
          available_organizations: formData.available_organizations,
          accessible_users: formData.accessible_users,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        await usersApi.updateUser(user.id, updateData);
      } else {
        const createData: CreateUserRequest = {
          full_name: formData.full_name,
          username: formData.username,
          password: formData.password || undefined,
          role: formData.role,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          require_password_change: formData.require_password_change,
          disable_password_change: formData.disable_password_change,
          show_in_selection: formData.show_in_selection,
          available_organizations: formData.available_organizations,
          accessible_users: formData.accessible_users,
        };

        await usersApi.createUser(createData);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Ошибка при сохранении пользователя";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedOrganizationsText = () => {
    if (formData.available_organizations.length === 0) return "Не выбрано";
    if (formData.available_organizations.length === organizations.length)
      return "Все организации";
    return `Выбрано: ${formData.available_organizations.length}`;
  };

  const getSelectedUsersText = () => {
    if (formData.accessible_users.length === 0) return "Не выбрано";
    if (formData.accessible_users.length === allUsers.length)
      return "Все пользователи";
    return `Выбрано: ${formData.accessible_users.length}`;
  };

  // ===========================================
  // РЕЖИМ ПРОСМОТРА ДЛЯ МОДЕРАТОРА
  // ===========================================
  if (isViewMode) {
    const getRoleLabel = (role: string) => {
      const labels = {
        admin: "Администратор",
        moderator: "Модератор",
        user: "Пользователь",
      };
      return labels[role as keyof typeof labels] || "Пользователь";
    };

    const getRoleBadgeVariant = (
      role: string
    ): "danger" | "warning" | "info" => {
      const variants = {
        admin: "danger" as const,
        moderator: "warning" as const,
        user: "info" as const,
      };
      return variants[role as keyof typeof variants] || "info";
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Просмотр: ${user?.full_name}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Header с аватаром */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {user?.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {user?.full_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                @{user?.username}
              </p>
            </div>
            <div>
              <Badge variant={getRoleBadgeVariant(user?.role || "user")}>
                {getRoleLabel(user?.role || "user")}
              </Badge>
            </div>
          </div>

          {/* Основная информация */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
              📋 Основная информация
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ViewModeField label="Полное имя" value={user?.full_name} />
              <ViewModeField label="Логин" value={user?.username} />
            </div>
          </div>

          {/* Контактная информация */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
              📞 Контактная информация
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ViewModeField label="Email" value={user?.email} />
              <ViewModeField label="Телефон" value={user?.phone} />
            </div>
          </div>

          {/* Статус и настройки */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
              ⚙️ Настройки и статус
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ViewModeField
                label="Статус онлайн"
                value={user?.is_online}
                type="boolean"
              />
              <ViewModeField
                label="Первый вход"
                value={user?.is_first_login}
                type="boolean"
              />
              <ViewModeField
                label="Требуется смена пароля"
                value={user?.require_password_change}
                type="boolean"
              />
              <ViewModeField
                label="Запрет смены пароля"
                value={user?.disable_password_change}
                type="boolean"
              />
              <ViewModeField
                label="Показывать в выборе"
                value={user?.show_in_selection}
                type="boolean"
              />
            </div>
          </div>

          {/* Даты */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
              📅 Временные метки
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ViewModeField
                label="Последняя активность"
                value={
                  user?.last_seen
                    ? new Date(user.last_seen).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : null
                }
              />
              <ViewModeField
                label="Дата создания"
                value={
                  (user as ExtendedUser)?.created_at
                    ? new Date(
                        (user as ExtendedUser).created_at!
                      ).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : null
                }
              />
            </div>
          </div>

          {/* Организации */}
          {user?.available_organizations &&
            user.available_organizations.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  🏢 Доступные организации
                </h4>

                <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-zinc-400">
                    Назначено организаций:{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user.available_organizations.length}
                    </span>
                  </p>
                </div>
              </div>
            )}

          {/* Info alert */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Вы просматриваете информацию пользователя в режиме чтения.
                Редактирование доступно только администраторам.
              </p>
            </div>
          </div>

          {/* Кнопка закрытия */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-zinc-700">
            <Button type="button" onClick={onClose} className="cursor-pointer">
              Закрыть
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // ===========================================
  // ОБЫЧНАЯ ФОРМА ДЛЯ АДМИНИСТРАТОРА
  // ===========================================
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          isEditing ? "Редактировать пользователя" : "Создать пользователя"
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Main Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
              Основная информация
            </h3>

            <Input
              label="Полное имя"
              required
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              placeholder="Иванов Иван Иванович"
            />

            <Input
              label="Логин"
              required={!isEditing}
              disabled={isEditing}
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="ivanov"
            />

            <div className="relative">
              <Input
                label="Пароль"
                type={showPassword ? "text" : "password"}
                required={!isEditing && !formData.require_password_change}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={
                  isEditing
                    ? "Оставьте пустым, чтобы не менять"
                    : formData.require_password_change
                    ? "Не обязательно, если требуется смена"
                    : "Минимум 6 символов"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
              >
                {showPassword ? (
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Роль
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "moderator" | "user",
                  })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="user">Пользователь</option>
                <option value="moderator">Модератор</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
              Контактная информация
            </h3>

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="user@example.com"
            />

            <Input
              label="Телефон"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setFormData({ ...formData, phone: formatted });
              }}
              placeholder="+7 (777) 123-45-67"
              helperText="Формат будет применен автоматически"
            />
          </div>

          {/* Organizations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
              Доступ к организациям
            </h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Доступные организации
              </label>
              <button
                type="button"
                onClick={() => setShowOrganizationsModal(true)}
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span className="text-gray-900 dark:text-white">
                  {loadingOrganizations
                    ? "Загрузка..."
                    : getSelectedOrganizationsText()}
                </span>
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-zinc-400 flex-shrink-0"
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
              </button>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Выберите организации, к которым пользователь будет иметь доступ
              </p>
            </div>
          </div>

          {/* Accessible Users (only for moderators) */}
          {formData.role === "moderator" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                Управляемые пользователи
              </h3>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Доступные пользователи
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowUsersModal(true)}
                  className="w-full justify-between cursor-pointer"
                >
                  <span>
                    {loadingUsers ? "Загрузка..." : getSelectedUsersText()}
                  </span>
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Button>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  Выберите пользователей, которыми сможет управлять модератор
                </p>
              </div>
            </div>
          )}

          {/* Password Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
              Настройки пароля
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.require_password_change}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      require_password_change: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-zinc-300">
                  Требовать смену пароля при следующем входе
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.disable_password_change}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disable_password_change: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-zinc-300">
                  Запретить смену пароля пользователем
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.show_in_selection}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      show_in_selection: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-zinc-300">
                  Показывать в выборе пользователей
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-zinc-700">
            <Button
              type="button"
              variant="secondary"
              className="cursor-pointer"
              onClick={onClose}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer"
            >
              {isLoading
                ? "Сохранение..."
                : isEditing
                ? "Сохранить"
                : "Создать"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Organizations Modal */}
      <OrganizationSelectModal
        isOpen={showOrganizationsModal}
        onClose={() => setShowOrganizationsModal(false)}
        organizations={organizations}
        selectedIds={formData.available_organizations}
        onConfirm={(ids) =>
          setFormData({ ...formData, available_organizations: ids })
        }
        loading={loadingOrganizations}
      />

      {/* Users Modal (for moderators) */}
      {formData.role === "moderator" && (
        <UserSelectModal
          isOpen={showUsersModal}
          onClose={() => setShowUsersModal(false)}
          users={allUsers}
          selectedIds={formData.accessible_users}
          onConfirm={(ids) =>
            setFormData({ ...formData, accessible_users: ids })
          }
          loading={loadingUsers}
        />
      )}
    </>
  );
}
