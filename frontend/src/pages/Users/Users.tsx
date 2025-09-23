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
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: UserFormData) => {
    await createUser(data);
    fetchUsers();
  };

  const handleUpdate = async (data: UserFormData) => {
    if (!editingUser) return;
    await updateUser(editingUser.id, data);
    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (err) {
        setError("Failed to delete user");
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="users">
      <h1>Users Management</h1>
      <button onClick={openCreateModal}>Create User</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Login</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.login}</td>
              <td>{user.role}</td>
              <td>{user.created_at}</td>
              <td>{user.updated_at}</td>
              <td>
                <button onClick={() => openEditModal(user)}>Edit</button>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
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
