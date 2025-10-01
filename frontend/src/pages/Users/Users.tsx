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
import { getUser, logout } from "../../utils/auth";

const Users: React.FC = () => {
  const currentUser = getUser();
  const isAdmin = currentUser?.role === "admin";
  const isModerator = currentUser?.role === "moderator";
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<
    "all" | "admin" | "moderator" | "user"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "pending"
  >("all");
  const [filterOnline, setFilterOnline] = useState<
    "all" | "online" | "offline"
  >("all");
  const [sortField, setSortField] = useState<keyof User>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Функция для получения числового значения статуса для сортировки
  const getStatusValue = (user: User): number => {
    if (!user.show_in_selection) {
      return 0; // Скрыт
    }
    if (user.is_first_login && user.require_password_change) {
      return 1; // Ожидает пароль
    }
    return 2; // Активен
  };

  const formatLastSeen = (lastSeen: string): string => {
    if (!lastSeen) return "Давно";

    const lastSeenDate = new Date(lastSeen);

    // Проверка на невалидную дату
    if (isNaN(lastSeenDate.getTime()) || lastSeenDate.getFullYear() < 2000) {
      return "Давно";
    }

    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Только что";
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;

    return lastSeenDate.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: diffDays > 365 ? "numeric" : undefined,
    });
  };

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
    await updateUser(editingUser.id, data);
    fetchUsers();
  };

  // Добавьте новое состояние в компонент
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    user: User | null;
  }>({ show: false, user: null });

  // Замените функцию handleDelete
  const handleDelete = async (id: number) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setDeleteConfirmation({ show: true, user });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.user) return;

    try {
      await deleteUser(deleteConfirmation.user.id);
      fetchUsers();
      setDeleteConfirmation({ show: false, user: null });
    } catch (err) {
      setError("Не удалось удалить пользователя");
      setDeleteConfirmation({ show: false, user: null });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, user: null });
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
          className="users-page-sort-icon users-page-sort-neutral"
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
        className="users-page-sort-icon users-page-sort-asc"
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
        className="users-page-sort-icon users-page-sort-desc"
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
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" &&
        user.show_in_selection &&
        !(user.is_first_login && user.require_password_change)) ||
      (filterStatus === "inactive" && !user.show_in_selection) ||
      (filterStatus === "pending" &&
        user.is_first_login &&
        user.require_password_change);

    const matchesOnline =
      filterOnline === "all" ||
      (filterOnline === "online" && user.is_online) ||
      (filterOnline === "offline" && !user.is_online);

    return matchesSearch && matchesRole && matchesStatus && matchesOnline;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === "show_in_selection") {
      aVal = getStatusValue(a);
      bVal = getStatusValue(b);
    } else if (sortField === "created_at" || sortField === "updated_at") {
      aVal = new Date(aVal as string).getTime();
      bVal = new Date(bVal as string).getTime();
    } else if (typeof aVal === "boolean") {
      // Обработка boolean полей (is_online)
      aVal = aVal ? 1 : 0;
      bVal = (bVal as boolean) ? 1 : 0;
    } else if (typeof aVal === "string") {
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

  const getStatusBadge = (user: User) => {
    if (!user.show_in_selection) {
      return (
        <span className="users-page-status-badge users-page-status-inactive">
          Скрыт
        </span>
      );
    }
    if (user.is_first_login && user.require_password_change) {
      return (
        <span className="users-page-status-badge users-page-status-pending">
          Ожидает пароль
        </span>
      );
    }
    return (
      <span className="users-page-status-badge users-page-status-active">
        Активен
      </span>
    );
  };

  const getOrganizationsText = (organizations: number[]) => {
    if (!organizations || organizations.length === 0) {
      return "Нет доступа";
    }
    if (organizations.length === 1) {
      return "1 организация";
    }
    return `${organizations.length} организаций`;
  };

  const getAccessibleUsersText = (accessibleUsers: number[]) => {
    if (!accessibleUsers || accessibleUsers.length === 0) {
      return "Нет доступа";
    }
    if (accessibleUsers.length === 1) {
      return "1 пользователь";
    }
    if (accessibleUsers.length < 5) {
      return `${accessibleUsers.length} пользователя`;
    }
    return `${accessibleUsers.length} пользователей`;
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="users-page-loading-container">
          <div className="users-page-loading-spinner users-page-large-spinner"></div>
          <p>Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-page">
        <div className="users-page-error-container">
          <div className="users-page-error-icon">⚠️</div>
          <h2>Ошибка загрузки</h2>
          <p className="users-page-error-message">{error}</p>
          <button onClick={fetchUsers} className="users-page-retry-button">
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
      <div className="users-page-header">
        <div className="users-page-header-content">
          <div className="users-page-title-section">
            <h1 className="users-page-title">
              <span className="users-page-title-icon">👥</span>
              Управление пользователями
            </h1>
            <p className="users-page-subtitle">
              {isAdmin
                ? "Создание, редактирование и управление доступом пользователей системы"
                : "Управление доступом пользователей к организациям"}
            </p>
          </div>
          {/* ТОЛЬКО для админа */}
          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="users-page-create-button"
            >
              <svg
                className="users-page-button-icon"
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
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="users-page-controls-section">
        <div className="users-page-controls-container">
          <div className="users-page-search-controls">
            <div className="users-page-search-wrapper">
              <svg
                className="users-page-search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Поиск по имени, логину или email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="users-page-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="users-page-clear-search"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            <div className="users-page-filter-wrapper">
              <label htmlFor="roleFilter" className="users-page-filter-label">
                Роль:
              </label>
              <select
                id="roleFilter"
                value={filterRole}
                onChange={(e) =>
                  setFilterRole(
                    e.target.value as "all" | "admin" | "moderator" | "user"
                  )
                }
                className="users-page-filter-select"
              >
                <option value="all">Все роли</option>
                <option value="admin">Администраторы</option>
                <option value="moderator">Модераторы</option>
                <option value="user">Пользователи</option>
              </select>
            </div>

            <div className="users-page-filter-wrapper">
              <label htmlFor="statusFilter" className="users-page-filter-label">
                Статус:
              </label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "all" | "active" | "inactive" | "pending"
                  )
                }
                className="users-page-filter-select"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Скрытые</option>
                <option value="pending">Ожидает пароль</option>
              </select>
            </div>

            <div className="users-page-filter-wrapper">
              <label htmlFor="onlineFilter" className="users-page-filter-label">
                Активность:
              </label>
              <select
                id="onlineFilter"
                value={filterOnline}
                onChange={(e) =>
                  setFilterOnline(
                    e.target.value as "all" | "online" | "offline"
                  )
                }
                className="users-page-filter-select"
              >
                <option value="all">Все</option>
                <option value="online">Онлайн</option>
                <option value="offline">Офлайн</option>
              </select>
            </div>
          </div>

          <div className="users-page-stats-info">
            <span className="users-page-stats-text">
              Показано: {paginatedUsers.length} из {filteredUsers.length}
              {filteredUsers.length !== users.length &&
                ` (всего: ${users.length})`}
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-page-table-section">
        {filteredUsers.length === 0 ? (
          <div className="users-page-empty-state">
            <div className="users-page-empty-icon">🔍</div>
            <h3>Пользователи не найдены</h3>
            <p>
              {searchQuery || filterRole !== "all" || filterStatus !== "all"
                ? "Попробуйте изменить параметры поиска или фильтрации"
                : "В системе пока нет пользователей. Создайте первого пользователя."}
            </p>
            {!searchQuery && filterRole === "all" && filterStatus === "all" && (
              <button
                onClick={openCreateModal}
                className="users-page-empty-action-button"
              >
                Создать первого пользователя
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="users-page-table-container">
              <table className="users-page-table">
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort("id")}
                      className="users-page-th-sortable"
                    >
                      <div className="users-page-th-content">
                        <span>ID</span>
                        {getSortIcon("id")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("full_name")}
                      className="users-page-th-sortable"
                    >
                      <div className="users-page-th-content">
                        <span>Пользователь</span>
                        {getSortIcon("full_name")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("is_online")}
                      className="users-page-th-sortable"
                    >
                      <div className="users-page-th-content">
                        <span>Статус активности</span>
                        {getSortIcon("is_online")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("role")}
                      className="users-page-th-sortable"
                    >
                      <div className="users-page-th-content">
                        <span>Роль</span>
                        {getSortIcon("role")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("email")}
                      className="users-page-th-sortable"
                    >
                      <div className="users-page-th-content">
                        <span>Контакты</span>
                        {getSortIcon("email")}
                      </div>
                    </th>
                    <th className="users-page-th-non-sortable">
                      <div className="users-page-th-content">
                        <span>Организации</span>
                      </div>
                    </th>
                    <th className="users-page-th-non-sortable">
                      <div className="users-page-th-content">
                        <span>Управляет</span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("show_in_selection")}
                      className="users-page-th-sortable"
                    >
                      <div className="users-page-th-content">
                        <span>Статус</span>
                        {getSortIcon("show_in_selection")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("created_at")}
                      className="users-page-th-sortable"
                    >
                      <div className="users-page-th-content">
                        <span>Создан</span>
                        {getSortIcon("created_at")}
                      </div>
                    </th>
                    <th className="users-page-th-non-sortable">
                      <div className="users-page-th-content">
                        <span>Действия</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="users-page-table-row">
                      <td className="users-page-id-cell">#{user.id}</td>

                      <td className="users-page-user-cell">
                        <div className="users-page-user-info">
                          <div className="users-page-user-avatar-wrapper">
                            <div className="users-page-user-avatar">
                              {user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div
                              className={`users-page-avatar-badge ${
                                user.is_online
                                  ? "users-page-badge-online"
                                  : "users-page-badge-offline"
                              }`}
                            ></div>
                          </div>
                          <div className="users-page-user-details">
                            <div className="users-page-user-full-name">
                              {user.full_name}
                            </div>
                            <div className="users-page-user-username">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="users-page-online-status-cell">
                        <div className="users-page-online-status">
                          <div
                            className={`users-page-online-indicator ${
                              user.is_online
                                ? "users-page-status-online"
                                : "users-page-status-offline"
                            }`}
                          ></div>
                          <span
                            className={`users-page-online-text ${
                              user.is_online ? "users-page-text-online" : ""
                            }`}
                          >
                            {user.is_online ? "Онлайн" : "Не в сети"}
                          </span>
                        </div>
                        {!user.is_online && user.last_seen && (
                          <div className="users-page-last-seen">
                            {formatLastSeen(user.last_seen)}
                          </div>
                        )}
                      </td>

                      <td className="users-page-role-cell">
                        <span
                          className={`users-page-role-badge users-page-role-${user.role}`}
                        >
                          {user.role === "admin" ? (
                            <>
                              <span className="users-page-role-icon">⚡</span>
                              Администратор
                            </>
                          ) : user.role === "moderator" ? (
                            <>
                              <span className="users-page-role-icon">⚙️</span>
                              Модератор
                            </>
                          ) : (
                            <>
                              <span className="users-page-role-icon">👤</span>
                              Пользователь
                            </>
                          )}
                        </span>
                      </td>

                      <td className="users-page-contacts-cell">
                        <div className="users-page-contact-info">
                          {user.email && (
                            <div className="users-page-contact-item users-page-contact-email">
                              <svg
                                className="users-page-contact-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span title={user.email}>{user.email}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="users-page-contact-item users-page-contact-phone">
                              <svg
                                className="users-page-contact-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {!user.email && !user.phone && (
                            <span className="users-page-no-contacts">
                              Не указаны
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="users-page-organizations-cell">
                        <div className="users-page-organizations-info">
                          <svg
                            className="users-page-org-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span>
                            {getOrganizationsText(user.available_organizations)}
                          </span>
                        </div>
                      </td>

                      <td className="users-page-accessible-users-cell">
                        {user.role === "moderator" ? (
                          <div className="users-page-accessible-users-info">
                            <svg
                              className="users-page-accessible-icon"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                            <span>
                              {getAccessibleUsersText(user.accessible_users)}
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{ fontSize: "0.75rem", color: "#9ca3af" }}
                          >
                            —
                          </span>
                        )}
                      </td>

                      <td className="users-page-status-cell">
                        {getStatusBadge(user)}
                      </td>

                      <td className="users-page-date-cell">
                        {new Date(user.created_at).toLocaleString("ru-RU", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="users-page-actions-cell">
                        <div className="users-page-action-buttons">
                          <button
                            onClick={() => openEditModal(user)}
                            className="users-page-edit-button"
                            data-title="Редактировать пользователя"
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
                          {/* ТОЛЬКО для админа */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="users-page-delete-button"
                              data-title="Удалить пользователя"
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
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="users-page-pagination-section">
                <div className="users-page-pagination-info">
                  <span>
                    Показано {startIndex + 1}-
                    {Math.min(startIndex + itemsPerPage, filteredUsers.length)}{" "}
                    из {filteredUsers.length}
                  </span>
                </div>

                <div className="users-page-pagination-controls">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="users-page-pagination-button users-page-pagination-first"
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
                    className="users-page-pagination-button users-page-pagination-prev"
                    title="Предыдущая страница"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  </button>

                  <div className="users-page-page-numbers">
                    {generatePageNumbers().map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`users-page-page-number ${
                          currentPage === page ? "users-page-page-active" : ""
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="users-page-pagination-button users-page-pagination-next"
                    title="Следующая страница"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </button>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="users-page-pagination-button users-page-pagination-last"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && deleteConfirmation.user && (
        <div className="users-page-modal-overlay">
          <div className="users-page-delete-modal">
            <div className="users-page-delete-modal-header">
              <div className="users-page-delete-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3>Подтвердите удаление</h3>
            </div>

            <div className="users-page-delete-modal-body">
              <p>
                Вы действительно хотите удалить пользователя{" "}
                <strong>"{deleteConfirmation.user.full_name}"</strong> (
                {deleteConfirmation.user.username})?
              </p>
              <p className="users-page-delete-warning">
                Это действие нельзя отменить. Все данные пользователя будут
                удалены навсегда.
              </p>
            </div>

            <div className="users-page-delete-modal-actions">
              <button
                onClick={cancelDelete}
                className="users-page-cancel-delete-button"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                className="users-page-confirm-delete-button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                </svg>
                Удалить пользователя
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
