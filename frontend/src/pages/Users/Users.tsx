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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  const [sortField, setSortField] = useState<keyof User>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
      setError("Не удалось загрузить список пользователей");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<UserFormData>) => {
    await createUser(data as UserFormData);
    fetchUsers();
  };

  const handleUpdate = async (data: Partial<UserFormData>) => {
    if (!editingUser) return;

    const payload: UserFormData = {
      username: data.username ?? editingUser.username,
      password: data.password ?? "",
      role: data.role ?? editingUser.role,
    };

    await updateUser(editingUser.id, payload);
    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    const user = users.find((u) => u.id === id);
    const confirmMessage = `Вы действительно хотите удалить пользователя "${user?.username}"?\n\nЭто действие нельзя отменить.`;

    if (window.confirm(confirmMessage)) {
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

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof User) => {
    if (field !== sortField) {
      return (
        <svg
          className="sort-icon neutral"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortDirection === "asc" ? (
      <svg
        className="sort-icon asc"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
        />
      </svg>
    ) : (
      <svg
        className="sort-icon desc"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
        />
      </svg>
    );
  };

  // Фильтрация и сортировка
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === "created_at" || sortField === "updated_at") {
      aVal = new Date(aVal as string).getTime();
      bVal = new Date(bVal as string).getTime();
    }

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (sortDirection === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  // Пагинация
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p>Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Ошибка загрузки</h2>
          <p className="error-message">{error}</p>
          <button onClick={fetchUsers} className="retry-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">
              <span className="title-icon">👥</span>
              Управление пользователями
            </h1>
            <p className="page-subtitle">
              Добавление, редактирование и управление доступом пользователей
              системы
            </p>
          </div>
          <button onClick={openCreateModal} className="create-button">
            <svg
              className="button-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <span>Создать пользователя</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="controls-container">
          <div className="search-controls">
            <div className="search-wrapper">
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Поиск по имени пользователя..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="clear-search"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            <div className="filter-wrapper">
              <label htmlFor="roleFilter" className="filter-label">
                Роль:
              </label>
              <select
                id="roleFilter"
                value={filterRole}
                onChange={(e) =>
                  setFilterRole(e.target.value as "all" | "admin" | "user")
                }
                className="filter-select"
              >
                <option value="all">Все роли</option>
                <option value="admin">Администраторы</option>
                <option value="user">Пользователи</option>
              </select>
            </div>
          </div>

          <div className="stats-info">
            <span className="stats-text">
              Показано: {paginatedUsers.length} из {filteredUsers.length}
              {filteredUsers.length !== users.length &&
                ` (всего: ${users.length})`}
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-section">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Пользователи не найдены</h3>
            <p>
              {searchQuery || filterRole !== "all"
                ? "Попробуйте изменить параметры поиска или фильтрации"
                : "В системе пока нет пользователей. Создайте первого пользователя."}
            </p>
            {!searchQuery && filterRole === "all" && (
              <button onClick={openCreateModal} className="empty-action-button">
                Создать первого пользователя
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("id")} className="sortable">
                      <div className="th-content">
                        <span>ID</span>
                        {getSortIcon("id")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("username")}
                      className="sortable"
                    >
                      <div className="th-content">
                        <span>Имя пользователя</span>
                        {getSortIcon("username")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("role")} className="sortable">
                      <div className="th-content">
                        <span>Роль</span>
                        {getSortIcon("role")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("created_at")}
                      className="sortable"
                    >
                      <div className="th-content">
                        <span>Создан</span>
                        {getSortIcon("created_at")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("updated_at")}
                      className="sortable"
                    >
                      <div className="th-content">
                        <span>Обновлён</span>
                        {getSortIcon("updated_at")}
                      </div>
                    </th>
                    <th className="actions-header">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="user-row">
                      <td className="id-cell">#{user.id}</td>
                      <td className="username-cell">
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.username}</span>
                        </div>
                      </td>
                      <td className="role-cell">
                        <span className={`role-badge ${user.role}`}>
                          {user.role === "admin" ? (
                            <>
                              <span className="role-icon">⚡</span>
                              Администратор
                            </>
                          ) : (
                            <>
                              <span className="role-icon">👤</span>
                              Пользователь
                            </>
                          )}
                        </span>
                      </td>
                      <td className="date-cell">
                        {new Date(user.created_at).toLocaleString("ru-RU", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="date-cell">
                        {new Date(user.updated_at).toLocaleString("ru-RU", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button
                            onClick={() => openEditModal(user)}
                            className="edit-button"
                            title="Редактировать пользователя"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="delete-button"
                            title="Удалить пользователя"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <polyline points="3,6 5,6 21,6"></polyline>
                              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-section">
                <div className="pagination-info">
                  <span>
                    Показано {startIndex + 1}-
                    {Math.min(startIndex + itemsPerPage, filteredUsers.length)}{" "}
                    из {filteredUsers.length}
                  </span>
                </div>

                <div className="pagination-controls">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="pagination-button first"
                    title="Первая страница"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polygon points="19,20 9,12 19,4"></polygon>
                      <line x1="5" y1="19" x2="5" y2="5"></line>
                    </svg>
                  </button>

                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button prev"
                    title="Предыдущая страница"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  </button>

                  <div className="page-numbers">
                    {generatePageNumbers().map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`page-number ${
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-button next"
                    title="Следующая страница"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </button>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="pagination-button last"
                    title="Последняя страница"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polygon points="5,4 15,12 5,20"></polygon>
                      <line x1="19" y1="5" x2="19" y2="19"></line>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Form Modal */}
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
