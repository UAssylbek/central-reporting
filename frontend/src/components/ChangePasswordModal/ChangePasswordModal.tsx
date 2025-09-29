// src/components/ChangePasswordModal/ChangePasswordModal.tsx
import React, { useState, FormEvent } from "react";
import { changePassword } from "../../services/api";
import { ChangePasswordRequest } from "../../types";
import "./ChangePasswordModal.css";

interface ChangePasswordModalProps {
  onSuccess: () => void;
  onClose: () => void;
  isFirstLogin?: boolean;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  onSuccess,
  onClose,
  isFirstLogin = false,
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Для первого входа старый пароль может быть пустым
    if (!isFirstLogin) {
      // Обычная проверка старого пароля для не первого входа
      if (!oldPassword.trim()) {
        setError("Введите текущий пароль");
        setLoading(false);
        return;
      }
    }

    if (!newPassword.trim()) {
      setError("Введите новый пароль");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Новый пароль должен содержать не менее 6 символов");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      setLoading(false);
      return;
    }

    try {
      const data: ChangePasswordRequest = {
        old_password: oldPassword, // Отправляем пустую строку если первый вход
        new_password: newPassword,
        confirm_password: confirmPassword,
      };

      await changePassword(data);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Ошибка при смене пароля");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="modal-overlay" onClick={isFirstLogin ? undefined : onClose}>
      <div
        className="modal-content password-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="modal-icon">🔒</div>
            <div>
              <h2 className="modal-title">
                {isFirstLogin ? "Установка пароля" : "Смена пароля"}
              </h2>
              <p className="modal-subtitle">
                {isFirstLogin
                  ? "Для продолжения работы необходимо установить новый пароль"
                  : "Введите текущий пароль и новый пароль"}
              </p>
            </div>
          </div>
          {!isFirstLogin && (
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
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-content">
            {/* Текущий пароль */}
            <div className="form-group">
              <label htmlFor="oldPassword" className="form-label">
                <span className="label-text">
                  {isFirstLogin
                    ? "Временный пароль (если был)"
                    : "Текущий пароль"}
                </span>
                {!isFirstLogin && <span className="required-mark">*</span>}
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
                  id="oldPassword"
                  type={showPasswords.old ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder={
                    isFirstLogin
                      ? "Оставьте пустым если пароля не было"
                      : "Введите текущий пароль"
                  }
                  disabled={loading}
                  className="form-input"
                  required={!isFirstLogin} // Обязательно только если НЕ первый вход
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("old")}
                  tabIndex={-1}
                >
                  {showPasswords.old ? (
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
              {isFirstLogin && (
                <span className="field-hint">
                  Если при создании аккаунта не был установлен пароль, оставьте
                  это поле пустым
                </span>
              )}
            </div>

            {/* Новый пароль */}
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">
                <span className="label-text">Новый пароль</span>
                <span className="required-mark">*</span>
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
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
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Введите новый пароль"
                  disabled={loading}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("new")}
                  tabIndex={-1}
                >
                  {showPasswords.new ? (
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

            {/* Подтверждение пароля */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <span className="label-text">Повторите новый пароль</span>
                <span className="required-mark">*</span>
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                  disabled={loading}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("confirm")}
                  tabIndex={-1}
                >
                  {showPasswords.confirm ? (
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

          {/* Footer */}
          <div className="form-footer">
            <div className="form-actions">
              {!isFirstLogin && (
                <button
                  type="button"
                  onClick={onClose}
                  className="cancel-button"
                  disabled={loading}
                >
                  Отмена
                </button>
              )}
              <button
                type="submit"
                className="submit-button"
                disabled={
                  loading ||
                  (!isFirstLogin && !oldPassword.trim()) || // Для не первого входа требуем старый пароль
                  !newPassword.trim() ||
                  !confirmPassword.trim()
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
                      {isFirstLogin ? "Установить пароль" : "Изменить пароль"}
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

export default ChangePasswordModal;
