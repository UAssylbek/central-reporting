import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/api";
import { setToken, setUser } from "../../utils/auth";
import ChangePasswordModal from "../../components/ChangePasswordModal/ChangePasswordModal";
import "./Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login({ username, password });
      setToken(response.token);
      setUser(response.user);

      // Проверяем нужно ли менять пароль
      if (response.require_password_change) {
        setShowChangePasswordModal(true);
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError("Неверные учётные данные");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSuccess = () => {
    setShowChangePasswordModal(false);
    navigate("/home");
  };

  const handlePasswordChangeClose = () => {
    // При первом входе нельзя закрыть модальное окно смены пароля
    // Пользователь должен либо сменить пароль, либо выйти из системы
    setShowChangePasswordModal(false);
    setToken("");
    setUser(null);
    setError("Необходимо установить пароль для продолжения работы");
  };

  return (
    <div className="login-page">
      {/* Main Content */}
      <main className="login-main">
        <div className="login-container">
          <div className="login-form-section">
            <div className="form-container">
              <div className="form-header">
                <h1>Вход в систему</h1>
              </div>
              <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                  <label htmlFor="username">Имя пользователя</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
                      disabled={loading}
                      placeholder="Введите имя пользователя"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="password">Пароль</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
                      disabled={loading}
                      placeholder="Введите пароль (или оставьте пустым)"
                    />
                    <button
                      type="button"
                      className="password-toggle"
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
                  <span className="field-hint">
                    Для некоторых пользователей пароль может быть необязательным
                  </span>
                </div>

                {error && (
                  <div className="error-message">
                    <div className="error-icon">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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

                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="submit-button"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Выполняется вход...</span>
                    </>
                  ) : (
                    <>
                      <span>Войти в систему</span>
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
              </form>

              <div className="form-footer">
                <div className="security-note">
                  <div className="security-icon">🔒</div>
                  <span>
                    Ваши данные защищены и передаются по зашифрованному
                    соединению
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          onSuccess={handlePasswordChangeSuccess}
          onClose={handlePasswordChangeClose}
          isFirstLogin={true}
        />
      )}

      {/* Footer */}
      <footer className="login-footer">
        <div className="footer-content">
          <div className="footer-info">
            <span>© 2025 Централизация отчётности</span>
            <span className="footer-separator">•</span>
            <span>Государственные учреждения Казахстана</span>
          </div>
          <div className="system-status">
            <div className="status-indicator"></div>
            <span>Система активна</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
