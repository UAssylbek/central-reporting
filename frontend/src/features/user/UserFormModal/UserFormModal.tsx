// frontend/src/features/user/UserFormModal/UserFormModal.tsx
import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../../../shared/ui/Modal/Modal";
import { Button } from "../../../shared/ui/Button/Button";
import { Badge } from "../../../shared/ui/Badge/Badge";
import { Input } from "../../../shared/ui/Input/Input";
import { MultiInput } from "../../../shared/ui/MultiInput/MultiInput";
import { AvatarUpload } from "../../../shared/ui/AvatarUpload/AvatarUpload";
import { SocialLinksInput } from "../../../shared/ui/SocialLinksInput/SocialLinksInput";
import { TagsInput } from "../../../shared/ui/TagsInput/TagsInput";
import { CustomFields } from "../../../shared/ui/CustomFields/CustomFields";
import {
  authApi,
  type User,
  type SocialLinks,
} from "../../../shared/api/auth.api";
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
  avatar_url: string;
  role: "admin" | "moderator" | "user";
  emails: string[];
  phones: string[];
  position: string;
  department: string;
  birth_date: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  social_links: SocialLinks;
  timezone: string;
  work_hours: string;
  comment: string;
  custom_fields: Record<string, unknown>;
  tags: string[];
  require_password_change: boolean;
  disable_password_change: boolean;
  show_in_selection: boolean;
  available_organizations: number[];
  accessible_users: number[];
}

// Компонент для отображения поля в режиме просмотра
interface ViewModeFieldProps {
  readonly label: string;
  readonly value: string | number | boolean | string[] | undefined | null;
  readonly type?: "text" | "boolean" | "badge" | "list";
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

    if (type === "list" && Array.isArray(value)) {
      if (value.length === 0) {
        return (
          <span className="text-gray-400 dark:text-zinc-500">Не указано</span>
        );
      }
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, idx) => (
            <Badge key={`${item}-${idx}`} variant="info">
              {item}
            </Badge>
          ))}
        </div>
      );
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
  const isViewMode =
    isEditing && currentUser?.role === "user" && currentUser.id !== user?.id;

  const [formData, setFormData] = useState<UserFormData>({
    full_name: "",
    username: "",
    password: "",
    avatar_url: "",
    role: "user",
    emails: [""],
    phones: [""],
    position: "",
    department: "",
    birth_date: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
    social_links: {},
    timezone: "",
    work_hours: "",
    comment: "",
    custom_fields: {},
    tags: [],
    require_password_change: false,
    disable_password_change: false,
    show_in_selection: true,
    available_organizations: [],
    accessible_users: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOrganizationsModal, setShowOrganizationsModal] = useState(false);
  const [showAccessibleUsersModal, setShowAccessibleUsersModal] =
    useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [accessibleUsers, setAccessibleUsers] = useState<SelectableUser[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Загрузка данных пользователя при редактировании
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        full_name: user.full_name,
        username: user.username,
        password: "",
        avatar_url: user.avatar_url || "",
        role: user.role,
        emails: user.emails?.length > 0 ? user.emails : [""],
        phones: user.phones?.length > 0 ? user.phones : [""],
        position: user.position || "",
        department: user.department || "",
        birth_date: user.birth_date || "",
        address: user.address || "",
        city: user.city || "",
        country: user.country || "",
        postal_code: user.postal_code || "",
        social_links: user.social_links || {},
        timezone: user.timezone || "",
        work_hours: user.work_hours || "",
        comment: user.comment || "",
        custom_fields: user.custom_fields || {},
        tags: user.tags || [],
        require_password_change: user.require_password_change,
        disable_password_change: user.disable_password_change,
        show_in_selection: user.show_in_selection,
        available_organizations: user.available_organizations || [],
        accessible_users: user.accessible_users || [],
      });
    } else if (!isOpen) {
      setFormData({
        full_name: "",
        username: "",
        password: "",
        avatar_url: "",
        role: "user",
        emails: [""],
        phones: [""],
        position: "",
        department: "",
        birth_date: "",
        address: "",
        city: "",
        country: "",
        postal_code: "",
        social_links: {},
        timezone: "",
        work_hours: "",
        comment: "",
        custom_fields: {},
        tags: [],
        require_password_change: false,
        disable_password_change: false,
        show_in_selection: true,
        available_organizations: [],
        accessible_users: [],
      });
      setError(null);
    }
  }, [user, isOpen]);

  const loadOrganizations = async () => {
    setLoadingOrganizations(true);
    try {
      const orgs = await organizationsApi.getAll();
      setOrganizations(orgs);
    } catch (error) {
      console.error("Failed to load organizations:", error);
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const loadAccessibleUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await usersApi.getAll();
      setAccessibleUsers(
        users.map((u) => ({
          id: u.id,
          full_name: u.full_name,
          username: u.username,
          role: u.role,
        }))
      );
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    try {
      const result = await usersApi.uploadAvatar(user.id, file);
      setFormData({ ...formData, avatar_url: result.avatar_url });
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      throw error;
    }
  };

  const handleAvatarRemove = async () => {
    if (!user) return;
    try {
      await usersApi.deleteAvatar(user.id);
      setFormData({ ...formData, avatar_url: "" });
    } catch (error) {
      console.error("Failed to delete avatar:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const filteredEmails = formData.emails.filter((e) => e.trim() !== "");
      const filteredPhones = formData.phones.filter((p) => p.trim() !== "");

      if (isEditing && user) {
        const updateData: UpdateUserRequest = {
          full_name: formData.full_name,
          username: formData.username,
          emails: filteredEmails,
          phones: filteredPhones,
          position: formData.position,
          department: formData.department,
          birth_date: formData.birth_date,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postal_code: formData.postal_code,
          social_links: formData.social_links,
          timezone: formData.timezone,
          work_hours: formData.work_hours,
          comment: formData.comment,
          custom_fields: formData.custom_fields,
          tags: formData.tags,
          require_password_change: formData.require_password_change,
          disable_password_change: formData.disable_password_change,
          show_in_selection: formData.show_in_selection,
          available_organizations: formData.available_organizations,
          accessible_users: formData.accessible_users,
          role: formData.role,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        await usersApi.update(user.id, updateData);
      } else {
        const createData: CreateUserRequest = {
          full_name: formData.full_name,
          username: formData.username,
          password: formData.password,
          emails: filteredEmails,
          phones: filteredPhones,
          position: formData.position,
          department: formData.department,
          birth_date: formData.birth_date,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postal_code: formData.postal_code,
          social_links: formData.social_links,
          timezone: formData.timezone,
          work_hours: formData.work_hours,
          comment: formData.comment,
          custom_fields: formData.custom_fields,
          tags: formData.tags,
          require_password_change: formData.require_password_change,
          disable_password_change: formData.disable_password_change,
          show_in_selection: formData.show_in_selection,
          available_organizations: formData.available_organizations,
          accessible_users: formData.accessible_users,
          role: formData.role,
        };

        await usersApi.create(createData);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Произошла ошибка";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "danger";
      case "moderator":
        return "warning";
      default:
        return "info";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Администратор";
      case "moderator":
        return "Модератор";
      default:
        return "Пользователь";
    }
  };

  const getModalTitle = () => {
    if (isViewMode) return "Просмотр пользователя";
    if (isEditing) return "Редактирование пользователя";
    return "Создание пользователя";
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={getModalTitle()}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {isViewMode ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-zinc-700 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 border-4 border-white dark:border-zinc-700 shadow-lg">
                    {user?.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {user?.full_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400">
                    @{user?.username}
                  </p>
                </div>
                <Badge variant={getRoleBadgeVariant(user?.role || "user")}>
                  {getRoleLabel(user?.role || "user")}
                </Badge>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  📋 Основная информация
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ViewModeField label="Полное имя" value={user?.full_name} />
                  <ViewModeField label="Логин" value={user?.username} />
                  <ViewModeField label="Должность" value={user?.position} />
                  <ViewModeField label="Отдел" value={user?.department} />
                  <ViewModeField
                    label="Дата рождения"
                    value={user?.birth_date}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  📞 Контактная информация
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ViewModeField
                    label="Email адреса"
                    value={user?.emails}
                    type="list"
                  />
                  <ViewModeField
                    label="Телефоны"
                    value={user?.phones}
                    type="list"
                  />
                </div>
              </div>

              {(user?.address || user?.city || user?.country) && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                    🏠 Адрес
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <ViewModeField label="Адрес" value={user?.address} />
                    </div>
                    <ViewModeField label="Город" value={user?.city} />
                    <ViewModeField label="Страна" value={user?.country} />
                    <ViewModeField label="Индекс" value={user?.postal_code} />
                  </div>
                </div>
              )}

              {(user?.timezone || user?.work_hours) && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                    ⏰ Рабочие настройки
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ViewModeField
                      label="Часовой пояс"
                      value={user?.timezone}
                    />
                    <ViewModeField
                      label="Рабочие часы"
                      value={user?.work_hours}
                    />
                  </div>
                </div>
              )}

              {user?.tags && user.tags.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                    🏷️ Теги
                  </h4>
                  <ViewModeField label="" value={user.tags} type="list" />
                </div>
              )}

              {user?.comment && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                    💬 Комментарий
                  </h4>
                  <ViewModeField label="" value={user.comment} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {isEditing && user && (
                <AvatarUpload
                  currentAvatar={formData.avatar_url}
                  fullName={formData.full_name}
                  onUpload={handleAvatarUpload}
                  onRemove={handleAvatarRemove}
                  disabled={loading}
                />
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  Основная информация
                </h3>

                <Input
                  label="Полное имя"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Иванов Иван Иванович"
                  required
                />

                <Input
                  label="Логин"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="ivanov"
                  required
                />

                <Input
                  label={isEditing ? "Новый пароль" : "Пароль"}
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    isEditing ? "Оставьте пустым, чтобы не менять" : "******"
                  }
                  required={!isEditing}
                />

                <div className="space-y-2">
                  <span className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Роль
                  </span>
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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  Контактная информация
                </h3>

                <MultiInput
                  label="Email адреса"
                  values={formData.emails}
                  onChange={(emails) => setFormData({ ...formData, emails })}
                  placeholder="user@example.com"
                  type="email"
                />

                <MultiInput
                  label="Телефоны"
                  values={formData.phones}
                  onChange={(phones) => setFormData({ ...formData, phones })}
                  placeholder="+7 (777) 123-45-67"
                  type="tel"
                  helperText="Формат будет применен автоматически"
                />

                <SocialLinksInput
                  value={formData.social_links}
                  onChange={(social_links) =>
                    setFormData({ ...formData, social_links })
                  }
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  Личная информация
                </h3>

                <Input
                  label="Должность"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  placeholder="Менеджер"
                />

                <Input
                  label="Отдел"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="Отдел продаж"
                />

                <Input
                  label="Дата рождения"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  Адрес
                </h3>

                <Input
                  label="Адрес"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="ул. Примерная, д. 1"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Город"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Алматы"
                  />

                  <Input
                    label="Страна"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    placeholder="Казахстан"
                  />

                  <Input
                    label="Индекс"
                    value={formData.postal_code}
                    onChange={(e) =>
                      setFormData({ ...formData, postal_code: e.target.value })
                    }
                    placeholder="050000"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  Рабочие настройки
                </h3>

                <Input
                  label="Часовой пояс"
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData({ ...formData, timezone: e.target.value })
                  }
                  placeholder="Asia/Almaty"
                />

                <Input
                  label="Рабочие часы"
                  value={formData.work_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, work_hours: e.target.value })
                  }
                  placeholder="9:00-18:00"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  Дополнительные поля
                </h3>

                <CustomFields
                  value={formData.custom_fields}
                  onChange={(custom_fields) =>
                    setFormData({ ...formData, custom_fields })
                  }
                />

                <TagsInput
                  label="Теги"
                  value={formData.tags}
                  onChange={(tags) => setFormData({ ...formData, tags })}
                  suggestions={["VIP", "Партнер", "Поставщик", "Клиент"]}
                />

                <div className="space-y-2">
                  <span className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Комментарий
                  </span>
                  <textarea
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    placeholder="Дополнительная информация о пользователе"
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  Доступ к организациям
                </h3>

                <div className="space-y-2">
                  <span className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Доступные организации
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      loadOrganizations();
                      setShowOrganizationsModal(true);
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-gray-900 dark:text-white">
                      {loadingOrganizations
                        ? "Загрузка..."
                        : `Выбрано организаций: ${formData.available_organizations.length}`}
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-400"
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
                </div>
              </div>

              {formData.role === "moderator" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                    Доступные пользователи
                  </h3>

                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Пользователи для управления
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        loadAccessibleUsers();
                        setShowAccessibleUsersModal(true);
                      }}
                      className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-gray-900 dark:text-white">
                        {loadingUsers
                          ? "Загрузка..."
                          : `Выбрано пользователей: ${formData.accessible_users.length}`}
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-400"
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
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  Настройки
                </h3>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.require_password_change}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        require_password_change: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-zinc-300">
                    Требовать смену пароля при первом входе
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.disable_password_change}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        disable_password_change: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-zinc-300">
                    Запретить смену пароля
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_in_selection}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        show_in_selection: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-zinc-300">
                    Показывать в выборе
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-700">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {isViewMode ? "Закрыть" : "Отмена"}
            </Button>

            {!isViewMode && (
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Сохранение..."
                  : isEditing
                  ? "Сохранить"
                  : "Создать"}
              </Button>
            )}
          </div>
        </form>
      </Modal>

      <OrganizationSelectModal
        isOpen={showOrganizationsModal}
        onClose={() => setShowOrganizationsModal(false)}
        organizations={organizations}
        selectedIds={formData.available_organizations}
        onConfirm={(ids: number[]) => {
          setFormData({ ...formData, available_organizations: ids });
          setShowOrganizationsModal(false);
        }}
      />

      <UserSelectModal
        isOpen={showAccessibleUsersModal}
        onClose={() => setShowAccessibleUsersModal(false)}
        users={accessibleUsers}
        selectedIds={formData.accessible_users}
        onConfirm={(ids: number[]) => {
          setFormData({ ...formData, accessible_users: ids });
          setShowAccessibleUsersModal(false);
        }}
      />
    </>
  );
}
