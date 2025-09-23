// src/pages/Login/Login.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
import { setToken, setUser } from '../../utils/auth';
import './Login.css';

const Login: React.FC = () => {
  const [loginStr, setLoginStr] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await login({ login: loginStr, password });
      setToken(token);
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Login:
          <input type="text" value={loginStr} onChange={(e) => setLoginStr(e.target.value)} disabled={loading} />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
      </form>
    </div>
  );
};

export default Login;