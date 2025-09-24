// src/components/UserForm/UserForm.tsx
import React, { useState, FormEvent } from "react";
import { UserFormData, User } from "../../types";
import "./UserForm.css";

interface UserFormProps {
  onSubmit: (data: Partial<UserFormData>) => Promise<void>; // ← мягкий тип
  onClose: () => void;
  initialData?: Partial<User>; // ← тоже мягкий
}

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  onClose,
  initialData = {},
}) => {
  // если поля не пришли – ставим пустую строку
  const [username, setUsername] = useState(initialData.username ?? "");
  const [password, setPassword] = useState(""); // пароль НЕ показываем
  const [role, setRole] = useState<"admin" | "user">(
    initialData.role ?? "user"
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // собираем ТОЛЬКО то, что поменялось
    const changes: Partial<UserFormData> = {};
    if (username !== (initialData.username ?? "")) changes.username = username;
    if (password) changes.password = password; // новый пароль
    if (role !== initialData.role) changes.role = role;

    if (!Object.keys(changes).length) {
      setError("Изменений нет");
      return;
    }

    try {
      await onSubmit(changes); // отправляем только дельту
      onClose();
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения");
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>
          {initialData.id
            ? "Редактировать пользователя"
            : "Создать пользователя"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label>
            Имя пользователя
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Оставьте пустым, если не меняем"
            />
          </label>

          <label>
            Новый пароль
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Только если хотите сменить"
            />
          </label>

          <label>
            Роль
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "user")}
            >
              <option value="user">Пользователь</option>
              <option value="admin">Администратор</option>
            </select>
          </label>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Отмена
            </button>
            <button type="submit">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
