// src/components/UserForm/UserForm.tsx
import React, { useState, FormEvent, useEffect } from "react";
import { UserFormData, User, Organization } from "../../types";
import { getOrganizations } from "../../services/api";
import "./UserForm.css";

interface UserFormProps {
  onSubmit: (data: Partial<UserFormData>) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<User>;
}

// Функция для форматирования телефонного номера
const formatPhoneNumber = (value: string): string => {
  // Удаляем все символы кроме цифр и +
  const cleaned = value.replace(/[^\d+]/g, "");

  // Если строка пустая, возвращаем пустую строку
  if (!cleaned) return "";

  // Определяем формат в зависимости от первого символа
  let formatted = "";

  if (cleaned.startsWith("+7")) {
    // Формат: +7 (XXX) XXX-XX-XX
    const digits = cleaned.substring(2); // убираем +7
    if (digits.length === 0) {
      formatted = "+7";
    } else if (digits.length <= 3) {
      formatted = `+7 (${digits}`;
    } else if (digits.length <= 6) {
      formatted = `+7 (${digits.substring(0, 3)}) ${digits.substring(3)}`;
    } else if (digits.length <= 8) {
      formatted = `+7 (${digits.substring(0, 3)}) ${digits.substring(
        3,
        6
      )}-${digits.substring(6)}`;
    } else {
      formatted = `+7 (${digits.substring(0, 3)}) ${digits.substring(
        3,
        6
      )}-${digits.substring(6, 8)}-${digits.substring(8, 10)}`;
    }
  } else if (cleaned.startsWith("8")) {
    // Формат: 8 (XXX) XXX-XX-XX
    const digits = cleaned.substring(1); // убираем 8
    if (digits.length === 0) {
      formatted = "8";
    } else if (digits.length <= 3) {
      formatted = `8 (${digits}`;
    } else if (digits.length <= 6) {
      formatted = `8 (${digits.substring(0, 3)}) ${digits.substring(3)}`;
    } else if (digits.length <= 8) {
      formatted = `8 (${digits.substring(0, 3)}) ${digits.substring(
        3,
        6
      )}-${digits.substring(6)}`;
    } else {
      formatted = `8 (${digits.substring(0, 3)}) ${digits.substring(
        3,
        6
      )}-${digits.substring(6, 8)}-${digits.substring(8, 10)}`;
    }
  } else if (cleaned.startsWith("7")) {
    // Если начинается с 7, добавляем +
    const digits = cleaned.substring(1);
    if (digits.length === 0) {
      formatted = "+7";
    } else if (digits.length <= 3) {
      formatted = `+7 (${digits}`;
    } else if (digits.length <= 6) {
      formatted = `+7 (${digits.substring(0, 3)}) ${digits.substring(3)}`;
    } else if (digits.length <= 8) {
      formatted = `+7 (${digits.substring(0, 3)}) ${digits.substring(
        3,
        6
      )}-${digits.substring(6)}`;
    } else {
      formatted = `+7 (${digits.substring(0, 3)}) ${digits.substring(
        3,
        6
      )}-${digits.substring(6, 8)}-${digits.substring(8, 10)}`;
    }
  } else {
    // Если номер начинается с других цифр, форматируем как есть
    if (cleaned.length <= 3) {
      formatted = cleaned;
    } else if (cleaned.length <= 6) {
      formatted = `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
    } else if (cleaned.length <= 8) {
      formatted = `${cleaned.substring(0, 3)} ${cleaned.substring(
        3,
        6
      )}-${cleaned.substring(6)}`;
    } else {
      formatted = `${cleaned.substring(0, 3)} ${cleaned.substring(
        3,
        6
      )}-${cleaned.substring(6, 8)}-${cleaned.substring(8, 10)}`;
    }
  }

  return formatted;
};

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  onClose,
  initialData = {},
}) => {
  // Основные поля
  const [fullName, setFullName] = useState(initialData.full_name ?? "");
  const [username, setUsername] = useState(initialData.username ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">(
    initialData.role ?? "user"
  );

  // Настройки пароля
  const [requirePasswordChange, setRequirePasswordChange] = useState(
    initialData.require_password_change ?? false
  );
  const [disablePasswordChange, setDisablePasswordChange] = useState(
    initialData.disable_password_change ?? false
  );

  // Дополнительные настройки
  const [showInSelection, setShowInSelection] = useState(
    initialData.show_in_selection ?? true
  );

  // Контактная информация
  const [email, setEmail] = useState(initialData.email ?? "");
  const [phone, setPhone] = useState(
    initialData.phone ? formatPhoneNumber(initialData.phone) : ""
  );
  const [additionalEmail, setAdditionalEmail] = useState(
    initialData.additional_email ?? ""
  );
  const [comment, setComment] = useState(initialData.comment ?? "");

  // Организации
  const [availableOrganizations, setAvailableOrganizations] = useState<
    number[]
  >(initialData.available_organizations ?? []);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showOrganizationsModal, setShowOrganizationsModal] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);

  // Состояние формы
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isEditing = Boolean(initialData.id);

  // Загрузка списка организаций
  useEffect(() => {
    const loadOrganizations = async () => {
      setLoadingOrganizations(true);
      try {
        const orgs = await getOrganizations();
        setOrganizations(orgs);
      } catch (err) {
        console.error("Не удалось загрузить организации:", err);
      } finally {
        setLoadingOrganizations(false);
      }
    };

    loadOrganizations();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Валидация обязательных полей
    if (!fullName.trim()) {
      setError("Полное имя обязательно для заполнения");
      setLoading(false);
      return;
    }

    if (!isEditing && !username.trim()) {
      setError("Имя для входа обязательно для заполнения");
      setLoading(false);
      return;
    }

    // ИСПРАВЛЕНИЕ: Добавляем валидацию для требования пароля
    if (!isEditing && requirePasswordChange && !password && !password?.trim()) {
      setError(
        "Если установлен флаг 'Потребовать установить пароль', необходимо указать временный пароль или оставить поле пустым"
      );
      // Это не ошибка - разрешаем создание без пароля
      // setLoading(false);
      // return;
    }

    if (password && password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов");
      setLoading(false);
      return;
    }

    // Валидация email
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Некорректный формат электронной почты");
      setLoading(false);
      return;
    }

    if (
      additionalEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(additionalEmail)
    ) {
      setError("Некорректный формат дополнительной почты");
      setLoading(false);
      return;
    }

    // Собираем данные для отправки
    const formData: Partial<UserFormData> = {};

    // Основные поля
    if (fullName !== (initialData.full_name ?? "")) {
      formData.full_name = fullName;
    }
    if (username !== (initialData.username ?? "")) {
      formData.username = username;
    }
    if (password) {
      formData.password = password;
    }
    if (role !== initialData.role) {
      formData.role = role;
    }

    // Настройки пароля
    if (
      requirePasswordChange !== (initialData.require_password_change ?? false)
    ) {
      formData.require_password_change = requirePasswordChange;
    }
    if (
      disablePasswordChange !== (initialData.disable_password_change ?? false)
    ) {
      formData.disable_password_change = disablePasswordChange;
    }

    // Дополнительные настройки
    if (showInSelection !== (initialData.show_in_selection ?? true)) {
      formData.show_in_selection = showInSelection;
    }

    // Контактная информация
    if (email !== (initialData.email ?? "")) {
      formData.email = email;
    }
    if (phone !== (initialData.phone ?? "")) {
      formData.phone = phone;
    }
    if (additionalEmail !== (initialData.additional_email ?? "")) {
      formData.additional_email = additionalEmail;
    }
    if (comment !== (initialData.comment ?? "")) {
      formData.comment = comment;
    }

    // Организации
    const orgArraysEqual = (a: number[], b: number[]) =>
      a.length === b.length && a.every((val, i) => val === b[i]);

    if (
      !orgArraysEqual(
        availableOrganizations,
        initialData.available_organizations ?? []
      )
    ) {
      formData.available_organizations = availableOrganizations;
    }

    // Проверяем есть ли изменения
    if (isEditing && Object.keys(formData).length === 0) {
      setError("Изменений не обнаружено");
      setLoading(false);
      return;
    }

    // Для создания пользователя всегда включаем обязательные поля
    if (!isEditing) {
      formData.full_name = fullName;
      formData.username = username;
      formData.role = role;
      formData.require_password_change = requirePasswordChange;
      formData.disable_password_change = disablePasswordChange;
      formData.show_in_selection = showInSelection;
      formData.available_organizations = availableOrganizations;
      if (password) formData.password = password;
      if (email) formData.email = email;
      if (phone) formData.phone = phone;
      if (additionalEmail) formData.additional_email = additionalEmail;
      if (comment) formData.comment = comment;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      // ИСПРАВЛЕНИЕ: Показываем детальную ошибку с бэкенда
      console.error("Ошибка при сохранении:", err);
      setError(err.message || err.toString() || "Ошибка при сохранении данных");
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationToggle = (orgId: number) => {
    setAvailableOrganizations((prev) =>
      prev.includes(orgId)
        ? prev.filter((id) => id !== orgId)
        : [...prev, orgId]
    );
  };

  const getSelectedOrganizationsText = () => {
    if (availableOrganizations.length === 0) {
      return "Организации не выбраны";
    }
    if (availableOrganizations.length === organizations.length) {
      return "Все организации";
    }
    if (availableOrganizations.length <= 3) {
      return availableOrganizations
        .map((id) => organizations.find((org) => org.id === id)?.name)
        .filter(Boolean)
        .join(", ");
    }
    return `Выбрано организаций: ${availableOrganizations.length}`;
  };

  return (
    <div className="userform-overlay-container" onClick={onClose}>
      <div
        className="userform-modal-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="userform-header-section">
          <div className="userform-title-group">
            <div className="userform-icon-badge">{isEditing ? "✏️" : "👤"}</div>
            <div>
              <h2 className="userform-main-title">
                {isEditing
                  ? "Редактировать пользователя"
                  : "Создать пользователя"}
              </h2>
              <p className="userform-subtitle-text">
                {isEditing
                  ? "Измените необходимые данные пользователя"
                  : "Заполните данные для нового пользователя"}
              </p>
            </div>
          </div>
          <button
            className="userform-close-btn"
            onClick={onClose}
            type="button"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="userform-main-container">
          <div className="userform-content-area">
            {/* Основная информация */}
            <div className="userform-section-block">
              <h3 className="userform-section-header">Основная информация</h3>

              {/* Полное имя */}
              <div className="userform-field-group">
                <label htmlFor="fullName" className="userform-input-label">
                  <span className="userform-label-content">Полное имя</span>
                  <span className="userform-required-asterisk">*</span>
                </label>
                <div className="userform-input-container">
                  <div className="userform-input-svg">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Введите полное имя пользователя"
                    disabled={loading}
                    className="userform-text-input"
                    required
                  />
                </div>
                <span className="userform-field-hint-text">
                  Полное имя отображается в интерфейсе системы
                </span>
              </div>

              {/* Имя для входа */}
              <div className="userform-field-group">
                <label htmlFor="username" className="userform-input-label">
                  <span className="userform-label-content">Имя для входа</span>
                  {!isEditing && (
                    <span className="userform-required-asterisk">*</span>
                  )}
                </label>
                <div className="userform-input-container">
                  <div className="userform-input-svg">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      isEditing
                        ? "Оставьте пустым, если не изменяется"
                        : "Введите имя для входа в систему"
                    }
                    disabled={loading}
                    className="userform-text-input"
                  />
                </div>
                <span className="userform-field-hint-text">
                  Уникальное имя пользователя для входа в систему
                </span>
              </div>

              {/* Роль */}
              <div className="userform-field-group">
                <label htmlFor="role" className="userform-input-label">
                  <span className="userform-label-content">
                    Роль пользователя
                  </span>
                  <span className="userform-required-asterisk">*</span>
                </label>
                <div className="userform-select-container">
                  <div className="userform-input-svg">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "admin" | "user")
                    }
                    disabled={loading}
                    className="userform-dropdown-select"
                  >
                    <option value="user">Пользователь</option>
                    <option value="admin">Администратор</option>
                  </select>
                  <div className="userform-select-arrow-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <span className="userform-field-hint-text">
                  {role === "admin"
                    ? "Полный доступ ко всем функциям системы"
                    : "Доступ к просмотру и созданию отчётов"}
                </span>
              </div>
            </div>

            {/* Настройки пароля */}
            <div className="userform-section-block">
              <h3 className="userform-section-header">Настройки пароля</h3>

              {/* Пароль */}
              <div className="userform-field-group">
                <label htmlFor="password" className="userform-input-label">
                  <span className="userform-label-content">
                    {isEditing ? "Новый пароль" : "Пароль"}
                  </span>
                </label>
                <div className="userform-input-container">
                  <div className="userform-input-svg">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Оставьте пустым если пароль не нужен"
                    disabled={loading}
                    className="userform-text-input"
                  />
                  <button
                    type="button"
                    className="userform-password-visibility-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
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
                    )}
                  </button>
                </div>
                <span className="userform-field-hint-text">
                  Если пароль не установлен, пользователь может войти без пароля
                </span>
              </div>

              {/* Настройки пароля - чекбоксы */}
              <div className="userform-checkbox-group">
                <label className="userform-checkbox-item-label">
                  <input
                    type="checkbox"
                    checked={requirePasswordChange}
                    onChange={(e) => setRequirePasswordChange(e.target.checked)}
                    disabled={loading}
                    className="userform-native-checkbox"
                  />
                  <div className="userform-custom-checkbox-box">
                    <svg
                      className="userform-checkbox-check-icon"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="userform-checkbox-text-content">
                    Потребовать установить пароль
                    <span className="userform-checkbox-hint-text">
                      Пользователю будет предложено установить пароль при первом
                      входе
                    </span>
                  </span>
                </label>

                <label className="userform-checkbox-item-label">
                  <input
                    type="checkbox"
                    checked={disablePasswordChange}
                    onChange={(e) => setDisablePasswordChange(e.target.checked)}
                    disabled={loading}
                    className="userform-native-checkbox"
                  />
                  <div className="userform-custom-checkbox-box">
                    <svg
                      className="userform-checkbox-check-icon"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="userform-checkbox-text-content">
                    Пользователю запрещено изменять пароль
                    <span className="userform-checkbox-hint-text">
                      Пользователь не сможет самостоятельно изменить пароль
                    </span>
                  </span>
                </label>

                <label className="userform-checkbox-item-label">
                  <input
                    type="checkbox"
                    checked={showInSelection}
                    onChange={(e) => setShowInSelection(e.target.checked)}
                    disabled={loading}
                    className="userform-native-checkbox"
                  />
                  <div className="userform-custom-checkbox-box">
                    <svg
                      className="userform-checkbox-check-icon"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="userform-checkbox-text-content">
                    Показывать в списке выбора
                    <span className="userform-checkbox-hint-text">
                      Пользователь будет отображаться в списках выбора
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Доступные организации */}
            <div className="userform-section-block">
              <h3 className="userform-section-header">Доступные организации</h3>

              <div className="userform-field-group">
                <label className="userform-input-label">
                  <span className="userform-label-content">
                    Выбор организаций
                  </span>
                </label>
                <div className="userform-organizations-selector">
                  <button
                    type="button"
                    className="userform-organizations-trigger-btn"
                    onClick={() => setShowOrganizationsModal(true)}
                    disabled={loading || loadingOrganizations}
                  >
                    <div className="userform-organizations-btn-icon">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <span className="userform-organizations-btn-text">
                      {loadingOrganizations
                        ? "Загрузка..."
                        : getSelectedOrganizationsText()}
                    </span>
                    <div className="userform-organizations-btn-arrow">
                      <svg
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
                    </div>
                  </button>
                </div>
                <span className="userform-field-hint-text">
                  Выберите организации, к которым пользователь будет иметь
                  доступ
                </span>
              </div>
            </div>

            {/* Контактная информация */}
            <div className="userform-section-block">
              <h3 className="userform-section-header">Контактная информация</h3>

              {/* Электронная почта и телефон */}
              <div className="userform-fields-row">
                <div className="userform-field-group">
                  <label htmlFor="email" className="userform-input-label">
                    <span className="userform-label-content">
                      Электронная почта
                    </span>
                  </label>
                  <div className="userform-input-container">
                    <div className="userform-input-svg">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      disabled={loading}
                      className="userform-text-input"
                    />
                  </div>
                </div>

                <div className="userform-field-group">
                  <label htmlFor="phone" className="userform-input-label">
                    <span className="userform-label-content">Телефон</span>
                  </label>
                  <div className="userform-input-container">
                    <div className="userform-input-svg">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setPhone(formatted);
                      }}
                      placeholder="+7 (777) 123-45-67"
                      disabled={loading}
                      className="userform-text-input"
                    />
                  </div>
                </div>
              </div>

              {/* Дополнительная почта */}
              <div className="userform-field-group">
                <label
                  htmlFor="additionalEmail"
                  className="userform-input-label"
                >
                  <span className="userform-label-content">
                    Дополнительная почта
                  </span>
                </label>
                <div className="userform-input-container">
                  <div className="userform-input-svg">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l4 4z"
                      />
                    </svg>
                  </div>
                  <input
                    id="additionalEmail"
                    type="email"
                    value={additionalEmail}
                    onChange={(e) => setAdditionalEmail(e.target.value)}
                    placeholder="additional@example.com"
                    disabled={loading}
                    className="userform-text-input"
                  />
                </div>
                <span className="userform-field-hint-text">
                  Резервный адрес электронной почты
                </span>
              </div>

              {/* Комментарий */}
              <div className="userform-field-group">
                <label htmlFor="comment" className="userform-input-label">
                  <span className="userform-label-content">Комментарий</span>
                </label>
                <div className="userform-textarea-container">
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Дополнительная информация о пользователе..."
                    disabled={loading}
                    className="userform-multiline-textarea"
                    rows={3}
                  />
                </div>
                <span className="userform-field-hint-text">
                  Любая дополнительная информация о пользователе
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="userform-error-notification">
                <div className="userform-error-warning-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Form Footer */}
          <div className="userform-footer-area">
            <div className="userform-security-notice">
              <div className="userform-security-lock-icon">🔒</div>
              <span>Все данные передаются по защищённому соединению</span>
            </div>

            <div className="userform-button-actions">
              <button
                type="button"
                onClick={onClose}
                className="userform-cancel-action-btn"
                disabled={loading}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="userform-submit-action-btn"
                disabled={
                  loading ||
                  !fullName.trim() ||
                  (!isEditing && !username.trim())
                }
              >
                {loading ? (
                  <>
                    <div className="userform-loading-spinner-icon"></div>
                    <span>Сохранение...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isEditing
                        ? "Сохранить изменения"
                        : "Создать пользователя"}
                    </span>
                    <svg
                      className="userform-submit-right-arrow"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Organizations Modal */}
        {showOrganizationsModal && (
          <div
            className="userform-organizations-modal-backdrop"
            onClick={() => setShowOrganizationsModal(false)}
          >
            <div
              className="userform-organizations-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="userform-organizations-modal-top">
                <h3>Выбор доступных организаций</h3>
                <button
                  className="userform-close-btn"
                  onClick={() => setShowOrganizationsModal(false)}
                  type="button"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="userform-organizations-modal-content">
                <div className="userform-organizations-bulk-actions">
                  <button
                    type="button"
                    className="userform-select-all-orgs-btn"
                    onClick={() =>
                      setAvailableOrganizations(
                        organizations.map((org) => org.id)
                      )
                    }
                  >
                    Выбрать все
                  </button>
                  <button
                    type="button"
                    className="userform-clear-all-orgs-btn"
                    onClick={() => setAvailableOrganizations([])}
                  >
                    Очистить все
                  </button>
                </div>

                <div className="userform-organizations-listing">
                  {organizations.map((org) => (
                    <label key={org.id} className="userform-organization-entry">
                      <input
                        type="checkbox"
                        checked={availableOrganizations.includes(org.id)}
                        onChange={() => handleOrganizationToggle(org.id)}
                        className="userform-org-native-checkbox"
                      />
                      <div className="userform-org-custom-checkbox">
                        <svg
                          className="userform-checkbox-check-icon"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="userform-organization-title">
                        {org.name}
                      </span>
                    </label>
                  ))}
                </div>

                {organizations.length === 0 && !loadingOrganizations && (
                  <div className="userform-organizations-empty-state">
                    <div className="userform-empty-state-icon">📋</div>
                    <p>Организации не найдены</p>
                  </div>
                )}
              </div>

              <div className="userform-organizations-modal-bottom">
                <div className="userform-selected-orgs-counter">
                  Выбрано: {availableOrganizations.length} из{" "}
                  {organizations.length}
                </div>
                <button
                  className="userform-organizations-done-btn"
                  onClick={() => setShowOrganizationsModal(false)}
                >
                  Готово
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserForm;
