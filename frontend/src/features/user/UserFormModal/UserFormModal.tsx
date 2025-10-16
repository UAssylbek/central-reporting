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
import { getAvatarUrl } from "../../../shared/utils/url";
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
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly user?: User | null;
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
        <Badge variant="success">Да</Badge>
      ) : (
        <Badge variant="gray">Нет</Badge>
      );
    }

    if (type === "badge" && badgeVariant) {
      return <Badge variant={badgeVariant}>{String(value)}</Badge>;
    }

    if (type === "list" && Array.isArray(value)) {
      return value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-gray-400 dark:text-zinc-500">Не указано</span>
      );
    }

    return (
      <span className="text-gray-900 dark:text-white">{String(value)}</span>
    );
  };

  return (
    <div className="space-y-1">
      <span className="block text-sm font-medium text-gray-500 dark:text-zinc-400">
        {label}
      </span>
      {renderValue()}
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

  const isSelfEditing = isEditing && currentUser?.id === user?.id;
  const isModeratorEditingOthers =
    isEditing &&
    currentUser?.role === "moderator" &&
    currentUser.id !== user?.id;
  const isUserEditingOthers =
    isEditing && currentUser?.role === "user" && currentUser.id !== user?.id;

  const isViewOnlyMode = isUserEditingOthers;

  const canUploadAvatar = currentUser?.role === "admin" || isSelfEditing;

  const canEditAvatar = canUploadAvatar && !isModeratorEditingOthers;

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
        require_password_change: user.require_password_change || false,
        disable_password_change: user.disable_password_change || false,
        show_in_selection: user.show_in_selection ?? true,
        available_organizations: user.available_organizations || [],
        accessible_users: user.accessible_users || [],
      });
    } else if (!isEditing && isOpen) {
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
    }

    setError(null);
  }, [user, isOpen, isEditing]);

  const loadOrganizations = async () => {
    setLoadingOrganizations(true);
    try {
      const data = await organizationsApi.getAll();
      const formatted = data.map((org) => ({
        id: org.id,
        name: org.name,
        code: org.code || "",
        description: org.description,
      }));
      setOrganizations(formatted);
    } catch (err) {
      console.error("Failed to load organizations:", err);
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const loadAccessibleUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await usersApi.getAll();
      const formatted = data
        .filter((u) => u.role === "user")
        .map((u) => ({
          id: u.id,
          full_name: u.full_name,
          username: u.username,
          email: u.emails?.[0],
          role: u.role,
        }));
      setAccessibleUsers(formatted);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAvatarUpload = async (file: File): Promise<void> => {
    if (!user) return;

    try {
      const { avatar_url } = await usersApi.uploadAvatar(user.id, file);
      setFormData({ ...formData, avatar_url });
    } catch (err: unknown) {
      console.error("Ошибка при загрузке аватара:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Не удалось загрузить аватар";
      setError(errorMessage);
    }
  };

  const handleAvatarRemove = async (): Promise<void> => {
    setFormData({ ...formData, avatar_url: "" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Модератор редактирует пользователя - только организации
      if (isModeratorEditingOthers && user) {
        const updateData: UpdateUserRequest = {
          available_organizations: formData.available_organizations,
        };
        await usersApi.update(user.id, updateData);
      }
      // User/Moderator редактирует себя - базовые поля БЕЗ organizations
      else if (isSelfEditing && user) {
        const updateData: UpdateUserRequest = {
          full_name: formData.full_name,
          emails: formData.emails.filter((e) => e.trim()),
          phones: formData.phones.filter((p) => p.trim()),
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
          avatar_url: formData.avatar_url || undefined,
        };

        if (formData.avatar_url !== user.avatar_url) {
          updateData.avatar_url = formData.avatar_url || undefined;
        }

        await usersApi.update(user.id, updateData);
      }
      // Admin создает или редактирует - полный доступ
      else {
        const userData: CreateUserRequest | UpdateUserRequest = {
          full_name: formData.full_name,
          username: formData.username,
          password: formData.password || undefined,
          avatar_url: formData.avatar_url || undefined,
          role: formData.role,
          emails: formData.emails.filter((e) => e.trim()),
          phones: formData.phones.filter((p) => p.trim()),
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
        };

        if (isEditing && user) {
          await usersApi.update(user.id, userData as UpdateUserRequest);
        } else {
          await usersApi.create(userData as CreateUserRequest);
        }
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

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      admin: "Администратор",
      moderator: "Модератор",
      user: "Пользователь",
    };
    return labels[role] || "Пользователь";
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, "danger" | "warning" | "info"> = {
      admin: "danger",
      moderator: "warning",
      user: "info",
    };
    return variants[role] || "info";
  };

  const getModalTitle = (): string => {
    if (isViewOnlyMode) return "Просмотр пользователя";
    if (isEditing) return "Редактирование пользователя";
    return "Создание пользователя";
  };

  const canEditRole = currentUser?.role === "admin" && !isSelfEditing;
  const canEditSettings = currentUser?.role === "admin";
  const canEditAccessibleUsers = currentUser?.role === "admin";
  const canEditBasicInfo = !isViewOnlyMode && !isModeratorEditingOthers;

  const showUsernameField = currentUser?.role === "admin" || !isSelfEditing;
  const showPasswordField = !isSelfEditing;
  // Показываем организации только для админа (всегда) или модератора (только при редактировании других)
  const showOrganizationsField =
    currentUser?.role === "admin" || isModeratorEditingOthers;

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

          {isModeratorEditingOthers && user ? (
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-4">
                  {user.avatar_url ? (
                    <img
                      src={getAvatarUrl(user.avatar_url)}
                      alt={user.full_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {user.full_name?.[0] || user.username?.[0] || "?"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      @{user.username}
                    </p>
                    <Badge
                      variant={getRoleBadgeVariant(user.role)}
                      className="mt-2"
                    >
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  Информация о пользователе
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <ViewModeField label="Полное имя" value={user.full_name} />
                  <ViewModeField label="Логин" value={user.username} />
                  <ViewModeField label="Должность" value={user.position} />
                  <ViewModeField label="Отдел" value={user.department} />
                  <ViewModeField
                    label="Email адреса"
                    value={user.emails}
                    type="list"
                  />
                  <ViewModeField
                    label="Телефоны"
                    value={user.phones}
                    type="list"
                  />
                  <ViewModeField label="Город" value={user.city} />
                  <ViewModeField label="Страна" value={user.country} />
                  <ViewModeField label="Адрес" value={user.address} />
                  <ViewModeField
                    label="Почтовый индекс"
                    value={user.postal_code}
                  />
                  <ViewModeField
                    label="Дата рождения"
                    value={user.birth_date}
                  />
                  <ViewModeField label="Часовой пояс" value={user.timezone} />
                  <ViewModeField label="Рабочие часы" value={user.work_hours} />
                  <ViewModeField label="Теги" value={user.tags} type="list" />
                </div>

                {user.comment && (
                  <ViewModeField label="Комментарий" value={user.comment} />
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  Доступные организации
                </h3>

                <div className="space-y-2">
                  <span className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Организации для доступа
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      loadOrganizations();
                      setShowOrganizationsModal(true);
                    }}
                    disabled={loadingOrganizations}
                    className={`w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-left transition-colors flex items-center justify-between ${
                      loadingOrganizations
                        ? "cursor-not-allowed opacity-60"
                        : "hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer"
                    }`}
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

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  fullWidth
                  disabled={loading}
                >
                  Отмена
                </Button>
                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {canEditAvatar && (
                <AvatarUpload
                  currentAvatar={formData.avatar_url}
                  fullName={formData.full_name}
                  onUpload={handleAvatarUpload}
                  onRemove={handleAvatarRemove}
                  disabled={isViewOnlyMode}
                />
              )}

              {/* Если модератор редактирует другого - показываем только текущий аватар без возможности изменения */}
              {isModeratorEditingOthers && formData.avatar_url && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Фото профиля
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={formData.avatar_url}
                      alt={formData.full_name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-zinc-700 shadow-lg"
                    />
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                      Изменение аватара доступно только администратору
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                  Основная информация
                </h3>

                {canEditBasicInfo && (
                  <>
                    <Input
                      label="Полное имя"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      placeholder="Иванов Иван Иванович"
                      required
                    />

                    {showUsernameField && (
                      <Input
                        label="Логин"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        placeholder="ivanov"
                        required
                        disabled={isSelfEditing}
                      />
                    )}

                    {showPasswordField && (
                      <Input
                        label={isEditing ? "Новый пароль" : "Пароль"}
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder={
                          isEditing
                            ? "Оставьте пустым, чтобы не менять"
                            : "Оставьте пустым для входа без пароля"
                        }
                        helperText={
                          isEditing
                            ? "Оставьте поле пустым, если не хотите менять пароль"
                            : "Если пароль не указан, пользователь сможет войти без пароля"
                        }
                      />
                    )}
                  </>
                )}

                {canEditRole && (
                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Роль
                    </span>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as
                            | "admin"
                            | "moderator"
                            | "user",
                        })
                      }
                      className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="user">Пользователь</option>
                      <option value="moderator">Модератор</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </div>
                )}
              </div>

              {canEditBasicInfo && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                      Контактная информация
                    </h3>

                    <MultiInput
                      label="Email адреса"
                      values={formData.emails}
                      onChange={(values) =>
                        setFormData({ ...formData, emails: values })
                      }
                      placeholder="example@email.com"
                      type="email"
                    />

                    <MultiInput
                      label="Телефоны"
                      values={formData.phones}
                      onChange={(values) =>
                        setFormData({ ...formData, phones: values })
                      }
                      placeholder="+7 (___) ___-__-__"
                      type="tel"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                      Рабочая информация
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
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                      Личная информация
                    </h3>

                    <Input
                      label="Дата рождения"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) =>
                        setFormData({ ...formData, birth_date: e.target.value })
                      }
                    />

                    <Input
                      label="Адрес"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Улица, дом, квартира"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Город"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="Москва"
                      />

                      <Input
                        label="Страна"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        placeholder="Россия"
                      />
                    </div>

                    <Input
                      label="Почтовый индекс"
                      value={formData.postal_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          postal_code: e.target.value,
                        })
                      }
                      placeholder="123456"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                      Социальные сети
                    </h3>

                    <SocialLinksInput
                      value={formData.social_links}
                      onChange={(links) =>
                        setFormData({ ...formData, social_links: links })
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                      Дополнительно
                    </h3>

                    <Input
                      label="Часовой пояс"
                      value={formData.timezone}
                      onChange={(e) =>
                        setFormData({ ...formData, timezone: e.target.value })
                      }
                      placeholder="UTC+3"
                    />

                    <Input
                      label="Рабочие часы"
                      value={formData.work_hours}
                      onChange={(e) =>
                        setFormData({ ...formData, work_hours: e.target.value })
                      }
                      placeholder="9:00 - 18:00"
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

                    <TagsInput
                      label="Теги"
                      value={formData.tags}
                      onChange={(tags) => setFormData({ ...formData, tags })}
                    />

                    <CustomFields
                      value={formData.custom_fields}
                      onChange={(fields) =>
                        setFormData({ ...formData, custom_fields: fields })
                      }
                    />
                  </div>
                </>
              )}

              {canEditSettings && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                    Настройки доступа
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
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-zinc-300">
                        Требовать смену пароля при первом входе
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
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-zinc-300">
                        Запретить изменение пароля
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
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-zinc-300">
                        Показывать в списках выбора
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {showOrganizationsField && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                    Доступные организации
                  </h3>

                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Организации для доступа
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        loadOrganizations();
                        setShowOrganizationsModal(true);
                      }}
                      disabled={loadingOrganizations}
                      className={`w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-left transition-colors flex items-center justify-between ${
                        loadingOrganizations
                          ? "cursor-not-allowed opacity-60"
                          : "hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer"
                      }`}
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
              )}

              {canEditAccessibleUsers && formData.role === "moderator" && (
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

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  fullWidth
                  disabled={loading}
                >
                  Отмена
                </Button>
                <Button type="submit" fullWidth disabled={loading}>
                  {loading
                    ? "Сохранение..."
                    : isEditing
                    ? "Сохранить"
                    : "Создать"}
                </Button>
              </div>
            </>
          )}
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
