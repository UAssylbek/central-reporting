// src/components/UserForm/UserForm.tsx
import React, { useState, FormEvent } from 'react';
import { UserFormData, User } from '../../types';
import './UserForm.css';

interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<User>;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, onClose, initialData = {} }) => {
  const [login, setLogin] = useState(initialData.login || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>(initialData.role || 'user');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!login || !password) {
      setError('Login and password are required');
      return;
    }
    try {
      await onSubmit({ login, password, role });
      onClose();
    } catch (err) {
      setError('Failed to submit form');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{initialData.id ? 'Edit User' : 'Create User'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Login:
            <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} />
          </label>
          <label>
            Password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label>
            Role:
            <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'user')}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit">Submit</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;