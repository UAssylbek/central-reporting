// frontend/src/features/user/UserFormModal/UserFormModal.tsx
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Modal } from "../../../shared/ui/Modal/Modal";
import { Button } from "../../../shared/ui/Button/Button";
import { Input } from "../../../shared/ui/Input/Input";
import type { User } from "../../../shared/api/auth.api";
import type { CreateUserRequest, UpdateUserRequest, Organization } from "../../../shared/api/users.api";
import { usersApi } from "../../../shared/api/users.api";
import { authApi } from "../../../shared/api/auth.api";

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
}

export function UserFormModal({ isOpen, onClose, onSuccess, user }: UserFormModalProps) {
  const currentUser = authApi.getCurrentUser();
  const isEditing = !!user;
  const isModerator = currentUser?.role === "moderator";

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    password: "",
    role: "user" as "admin" | "moderator" | "user",
    email: "",
    phone: "",
    require_password_change: true,
    disable_password_change: false,
    show_in_selection: true,
  });

  const [availableOrganizations, setAvailableOrganizations] = useState<number[]>([]);
  const [accessibleUsers, setAccessibleUsers] = useState<number[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showOrganizationsModal, setShowOrganizationsModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load organizations and users
  useEffect(() => {
    if (isOpen && !isModerator) {
      loadOrganizations();
      loadUsers();
    }
  }, [isOpen, isModerator]);

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
        require_password_change: user.require_password_change,
        disable_password_change: user.disable_password_change,
        show_in_selection: true,
      });
      setAvailableOrganizations(user.available_organizations || []);
      setAccessibleUsers([]);
    } else {
      resetForm();
    }
  }, [user]);

  const loadOrganizations = async () => {
    try {
      const orgs = await usersApi.getOrganizations();
      setOrganizations(orgs);
    } catch (err) {
      console.error("Failed to load organizations:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await usersApi.getUsers();
      setAllUsers(users.filter((u) => u.id !== user?.id && u.role !== "admin"));
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      username: "",
      password: "",
      role: "user",
      email: "",
      phone: "",
      require_password_change: true,
      disable_password_change: false,
      show_in_selection: true,
    });
    setAvailableOrganizations([]);
    setAccessibleUsers([]);
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isEditing && user) {
        // Update user
        const updateData: UpdateUserRequest = {
          full_name: formData.full_name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          require_password_change: formData.require_password_change,
          disable_password_change: formData.disable_password_change,
          show_in_selection: formData.show_in_selection,
        };

        // Admin can update more fields
        if (!isModerator) {
          updateData.username = formData.username;
          updateData.role = formData.role;
          updateData.available_organizations = availableOrganizations;
          updateData.accessible_users = accessibleUsers;
          
          if (formData.password) {
            updateData.password = formData.password;
          }
        }

        await usersApi.updateUser(user.id, updateData);
      } else {
        // Create user (admin only)
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
          available_organizations: availableOrganizations,
          accessible_users: accessibleUsers,
        };

        await usersApi.createUser(createData);
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrganization = (orgId: number) => {
    setAvailableOrganizations((prev) =>
      prev.includes(orgId) ? prev.filter((id) => id !== orgId) : [...prev, orgId]
    );
  };

  const toggleUser = (userId: number) => {
    setAccessibleUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Moderator view - limited fields
  if (isModerator && isEditing) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Редактировать пользователя">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Read-only info */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Полное имя
              </label>
              <div className="text-gray-900 dark:text-white font-medium">{user?.full_name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Логин
              </label>
              <div className="text-gray-900 dark:text-white font-medium">{user?.username}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Роль
              </label>
              <div className="text-gray-900 dark:text-white font-medium">
                {user?.role === "admin" ? "Администратор" : user?.role === "moderator" ? "Модератор" : "Пользователь"}
              </div>
            </div>
          </div>

          {/* Editable fields for moderator */}
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Телефон"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_password_change}
                onChange={(e) => setFormData({ ...formData, require_password_change: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-zinc-300">
                Требовать смену пароля при следующем входе
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.disable_password_change}
                onChange={(e) => setFormData({ ...formData, disable_password_change: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-zinc-300">
                Запретить смену пароля пользователем
              </span>
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-zinc-700">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  // Full admin form
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Редактировать пользователя" : "Создать пользователя"}>
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
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Иванов Иван Иванович"
            />

            <Input
              label="Логин"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="ivanov"
            />

            <div className="relative">
              <Input
                label="Пароль"
                type={showPassword ? "text" : "password"}
                required={!isEditing}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={isEditing ? "Оставьте пустым, чтобы не менять" : "Введите пароль"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Роль <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ivanov@example.com"
            />

            <Input
              label="Телефон"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (700) 123-45-67"
            />
          </div>

          {/* Organizations */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
              Доступные организации
            </h3>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowOrganizationsModal(true)}
              className="w-full"
            >
              📋 Выбрать организации ({availableOrganizations.length})
            </Button>
          </div>

          {/* Accessible Users */}
          {formData.role === "moderator" && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
                Доступные пользователи
              </h3>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowUsersModal(true)}
                className="w-full"
              >
                👥 Выбрать пользователей ({accessibleUsers.length})
              </Button>
            </div>
          )}

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-2">
              Настройки доступа
            </h3>

            <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={formData.require_password_change}
                onChange={(e) => setFormData({ ...formData, require_password_change: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-zinc-300">
                Требовать смену пароля при следующем входе
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={formData.disable_password_change}
                onChange={(e) => setFormData({ ...formData, disable_password_change: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-zinc-300">
                Запретить смену пароля пользователем
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={formData.show_in_selection}
                onChange={(e) => setFormData({ ...formData, show_in_selection: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-zinc-300">
                Показывать в списке для выбора
              </span>
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-zinc-700">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Сохранение..." : isEditing ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Organizations Modal */}
      <Modal
        isOpen={showOrganizationsModal}
        onClose={() => setShowOrganizationsModal(false)}
        title="Выбор организаций"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {organizations.map((org) => (
            <label
              key={org.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={availableOrganizations.includes(org.id)}
                onChange={() => toggleOrganization(org.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900 dark:text-white">{org.name}</span>
            </label>
          ))}
          {organizations.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
              Организации не найдены
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200 dark:border-zinc-700">
          <span className="text-sm text-gray-600 dark:text-zinc-400">
            Выбрано: {availableOrganizations.length} из {organizations.length}
          </span>
          <Button onClick={() => setShowOrganizationsModal(false)}>Готово</Button>
        </div>
      </Modal>

      {/* Users Modal */}
      <Modal
        isOpen={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        title="Выбор пользователей"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {allUsers.map((u) => (
            <label
              key={u.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={accessibleUsers.includes(u.id)}
                onChange={() => toggleUser(u.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900 dark:text-white">
                {u.full_name} (@{u.username})
              </span>
            </label>
          ))}
          {allUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
              Пользователи не найдены
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200 dark:border-zinc-700">
          <span className="text-sm text-gray-600 dark:text-zinc-400">
            Выбрано: {accessibleUsers.length} из {allUsers.length}
          </span>
          <Button onClick={() => setShowUsersModal(false)}>Готово</Button>
        </div>
      </Modal>
    </>
  );
}