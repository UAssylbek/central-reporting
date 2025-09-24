// src/pages/Login/Login.tsx
import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/api";
import { setToken, setUser } from "../../utils/auth";
import "./Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await login({ username, password });
      setToken(token);
      setUser(user);
      navigate("/home");
    } catch (err) {
      setError("Неверные учётные данные");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Вход</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Имя пользователя:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </label>
        <label>
          Пароль:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
};

export default Login;
