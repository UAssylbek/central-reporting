// src/pages/Users/Users.tsx
import React, { useState, useEffect } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/api";
import { User, UserFormData } from "../../types";
import UserForm from "../../components/UserForm/UserForm";
import "./Users.css";

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError("Не удалось загрузить пользователей");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<UserFormData>) => {
    await createUser(data as UserFormData); // при создании всё равно нужны все поля
    fetchUsers();
  };

  const handleUpdate = async (data: Partial<UserFormData>) => {
    if (!editingUser) return;

    // формируем полный объект, подставляя старые значения
    const payload: UserFormData = {
      username: data.username ?? editingUser.username,
      password: data.password ?? "", // пароль можно оставить пустым, если не меняем
      role: data.role ?? editingUser.role,
    };

    await updateUser(editingUser.id, payload);
    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (err) {
        setError("Не удалось удалить пользователя");
      }
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="users">
      <h1>Управление пользователями</h1>
      <button onClick={openCreateModal}>Создать пользователя</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Логин</th>
            <th>Роль</th>
            <th>Создан</th>
            <th>Обновлён</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>
                {user.role === "admin" ? "Администратор" : "Пользователь"}
              </td>
              <td>{new Date(user.created_at).toLocaleString("ru-RU")}</td>
              <td>{new Date(user.updated_at).toLocaleString("ru-RU")}</td>
              <td>
                <button onClick={() => openEditModal(user)}>
                  Редактировать
                </button>
                <button onClick={() => handleDelete(user.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <UserForm
          onSubmit={editingUser ? handleUpdate : handleCreate}
          onClose={closeModal}
          initialData={editingUser || undefined}
        />
      )}
    </div>
  );
};

export default Users;
