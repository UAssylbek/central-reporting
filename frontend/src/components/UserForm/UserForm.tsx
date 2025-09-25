// src/components/UserForm/UserForm.tsx
import React, { useState, FormEvent } from "react";
import { UserFormData, User } from "../../types";
import "./UserForm.css";

interface UserFormProps {
  onSubmit: (data: Partial<UserFormData>) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<User>;
}

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  onClose,
  initialData = {},
}) => {
  const [username, setUsername] = useState(initialData.username ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">(
    initialData.role ?? "user"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isEditing = Boolean(initialData.id);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Валидация
    if (!isEditing && !username.trim()) {
      setError("Имя пользователя обязательно для заполнения");
      setLoading(false);
      return;
    }

    if (!isEditing && !password.trim()) {
      setError("Пароль обязателен для нового пользователя");
      setLoading(false);
      return;
    }

    if (password && password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов");
      setLoading(false);
      return;
    }

    // Собираем только измененные данные
    const changes: Partial<UserFormData> = {};
    if (username !== (initialData.username ?? "")) changes.username = username;
    if (password) changes.password = password;
    if (role !== initialData.role) changes.role = role;

    if (isEditing && !Object.keys(changes).length) {
      setError("Изменений не обнаружено");
      setLoading(false);
      return;
    }

    try {
      await onSubmit(changes);
      onClose();
    } catch (err: any) {
      setError(err.message || "Ошибка при сохранении данных");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-form-overlay" onClick={onClose}>
      <div className="user-form-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="form-header">
          <div className="form-title-section">
            <div className="form-icon">{isEditing ? "✏️" : "👤"}</div>
            <div>
              <h2 className="form-title">
                {isEditing
                  ? "Редактировать пользователя"
                  : "Создать пользователя"}
              </h2>
              <p className="form-subtitle">
                {isEditing
                  ? "Измените необходимые данные пользователя"
                  : "Заполните данные для нового пользователя"}
              </p>
            </div>
          </div>
          <button className="close-button" onClick={onClose} type="button">
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
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-content">
            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <span className="label-text">Имя пользователя</span>
                {!isEditing && <span className="required-mark">*</span>}
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
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
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    isEditing
                      ? "Оставьте пустым, если не изменяется"
                      : "Введите имя пользователя"
                  }
                  disabled={loading}
                  className="form-input"
                />
              </div>
              {!isEditing && (
                <span className="field-hint">
                  Уникальное имя пользователя для входа в систему
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <span className="label-text">
                  {isEditing ? "Новый пароль" : "Пароль"}
                </span>
                {!isEditing && <span className="required-mark">*</span>}
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
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
                  placeholder={
                    isEditing ? "Только если хотите изменить" : "Введите пароль"
                  }
                  disabled={loading}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <span className="field-hint">
                Минимум 6 символов для обеспечения безопасности
              </span>
            </div>

            {/* Role Field */}
            <div className="form-group">
              <label htmlFor="role" className="form-label">
                <span className="label-text">Роль пользователя</span>
                <span className="required-mark">*</span>
              </label>
              <div className="select-wrapper">
                <div className="input-icon">
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
                  onChange={(e) => setRole(e.target.value as "admin" | "user")}
                  disabled={loading}
                  className="form-select"
                >
                  <option value="user">Пользователь</option>
                  <option value="admin">Администратор</option>
                </select>
                <div className="select-arrow">
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
              <span className="field-hint">
                {role === "admin"
                  ? "Полный доступ ко всем функциям системы"
                  : "Доступ к просмотру и созданию отчётов"}
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <div className="error-icon">
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
          <div className="form-footer">
            <div className="security-note">
              <div className="security-icon">🔒</div>
              <span>Все данные передаются по защищённому соединению</span>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="cancel-button"
                disabled={loading}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={
                  loading ||
                  (!isEditing && (!username.trim() || !password.trim()))
                }
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
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
                      className="submit-arrow"
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
      </div>
    </div>
  );
};

export default UserForm;
