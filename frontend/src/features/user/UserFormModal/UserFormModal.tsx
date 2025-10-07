// frontend/src/features/user/UserFormModal/UserFormModal.tsx
import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../../../shared/ui/Modal/Modal";
import { Button } from "../../../shared/ui/Button/Button";
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

interface UserFormModalProps {
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
      // Используем моковые данные при ошибке
      setOrganizations([
        { id: 1, name: "Организация 1", code: "ORG001" },
        { id: 2, name: "Организация 2", code: "ORG002" },
        { id: 3, name: "Организация 3", code: "ORG003" },
      ]);
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await usersApi.getUsers();
      // Фильтруем только обычных пользователей
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

    // Пароль обязателен только если НЕ стоит галочка "Требовать смену пароля" и это новый пользователь
    if (
      !isEditing &&
      !formData.require_password_change &&
      formData.password.length < 6
    ) {
      return "Пароль должен содержать не менее 6 символов или включите 'Требовать смену пароля'";
    }

    // При редактировании: если пароль введен, он должен быть >= 6 символов
    if (isEditing && formData.password && formData.password.length < 6) {
      return "Пароль должен содержать не менее 6 символов";
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Некорректный email адрес";
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Если модератор - может менять только организации
    if (isModerator) {
      setIsLoading(true);
      try {
        await usersApi.updateUser(user!.id, {
          available_organizations: formData.available_organizations,
        });
        onSuccess();
        onClose();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Ошибка при сохранении";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Валидация для админа
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing) {
        // При редактировании
        const updatePayload: UpdateUserRequest = {
          full_name: formData.full_name,
          role: formData.role,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          require_password_change: formData.require_password_change,
          disable_password_change: formData.disable_password_change,
          show_in_selection: formData.show_in_selection,
          available_organizations: formData.available_organizations,
        };

        // Добавляем пароль только если он введен
        if (formData.password) {
          updatePayload.password = formData.password;
        }

        // Добавляем accessible_users только для модераторов
        if (formData.role === "moderator") {
          updatePayload.accessible_users = formData.accessible_users;
        }

        await usersApi.updateUser(user!.id, updatePayload);
      } else {
        // При создании
        const createPayload: CreateUserRequest = {
          full_name: formData.full_name,
          username: formData.username,
          role: formData.role,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          require_password_change: formData.require_password_change,
          disable_password_change: formData.disable_password_change,
          show_in_selection: formData.show_in_selection,
          available_organizations: formData.available_organizations,
        };

        // Пароль опционален если стоит require_password_change
        if (formData.password) {
          createPayload.password = formData.password;
        }

        // Добавляем accessible_users только для модераторов
        if (formData.role === "moderator") {
          createPayload.accessible_users = formData.accessible_users;
        }

        await usersApi.createUser(createPayload);
      }

      onSuccess();
      onClose();
    } catch (err) {
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

  // Модератор видит только ограниченную форму
  if (isModerator) {
    return (
      <>
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="Редактировать пользователя"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* User Info (read-only) */}
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                    {user?.full_name[0] || "U"}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {user?.full_name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-zinc-400">
                    @{user?.username} •{" "}
                    {user?.role === "admin"
                      ? "Администратор"
                      : user?.role === "moderator"
                      ? "Модератор"
                      : "Пользователь"}
                  </div>
                </div>
              </div>
            </div>

            {/* Organizations */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Доступные организации
              </label>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowOrganizationsModal(true)}
                className="w-full justify-between cursor-pointer"
              >
                <span>
                  {loadingOrganizations
                    ? "Загрузка..."
                    : getSelectedOrganizationsText()}
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
              <Button type="submit" disabled={isLoading} className="cursor-pointer">
                {isLoading ? "Сохранение..." : "Сохранить"}
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
      </>
    );
  }

  // Full admin form
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
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                // ✅ Применяем форматирование на лету
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
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowOrganizationsModal(true)}
                className="w-full justify-between cursor-pointer"
              >
                <span>
                  {loadingOrganizations
                    ? "Загрузка..."
                    : getSelectedOrganizationsText()}
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
            <Button type="submit" disabled={isLoading} className="cursor-pointer">
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
