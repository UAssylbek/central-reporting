import React from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const advantages = [
    "Актуальные данные в реальном времени",
    "Автоматизированный сбор сведений",
    "Комплексный анализ работы учреждений",
    "Удобная группировка отчётов",
  ];

  return (
    <div className="Welcome">

      {/* Main Content */}
      <main className="welcome-main">
        <div className="welcome-container">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-badge">✨ Единая система отчётности</div>
            <h1 className="hero-title">
              Добро пожаловать в<br />
              <span className="gradient-text">Централизацию отчётности</span>
            </h1>
            <p className="hero-description">
              Автоматизированная система для сбора, хранения и анализа
              отчётности государственных учреждений Казахстана с актуальными
              данными в режиме реального времени.
            </p>

            {/* Advantages */}
            <div className="advantages-section">
              <h3 className="advantages-title">Ключевые преимущества:</h3>
              <div className="advantages-grid">
                {advantages.map((advantage, index) => (
                  <div key={index} className="advantage-item">
                    <div className="advantage-dot"></div>
                    <span>{advantage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Login Button */}
            <button className="login-button" onClick={() => navigate("/login")}>
              <span>Войти в систему</span>
              <svg
                className="button-arrow"
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
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="welcome-footer">
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

export default Welcome;
