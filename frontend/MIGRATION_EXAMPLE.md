# Пример миграции на новый API

Этот документ показывает, как мигрировать существующие компоненты на новый API с React Query hooks.

## До миграции (старый подход)

```tsx
// frontend/src/pages/UsersPage/UsersPage.tsx - СТАРЫЙ КОД
import { useState, useEffect } from "react";
import { usersApi } from "../../shared/api/users.api";
import type { User } from "../../shared/api/auth.api";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getUsers(); // Получает ALL пользователей
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      {users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}
```

## После миграции (новый подход с React Query)

```tsx
// frontend/src/pages/UsersPage/UsersPage.tsx - НОВЫЙ КОД
import { useState } from "react";
import { useUsers, useDeleteUser } from "../../shared/api/hooks";
import { ErrorMessage } from "../../shared/components/ErrorMessage";
import { Spinner } from "../../shared/ui/Spinner";
import { Pagination } from "../../shared/ui/Pagination";

export function UsersPage() {
  // Состояние пагинации
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<string>("full_name");
  const [sortDesc, setSortDesc] = useState(false);

  // ✅ Используем React Query hook с пагинацией
  const {
    data,
    isLoading,
    error,
    refetch
  } = useUsers({
    page,
    page_size: pageSize,
    sort_by: sortBy,
    sort_desc: sortDesc,
  });

  const deleteUser = useDeleteUser();

  const handleDelete = async (userId: number) => {
    try {
      await deleteUser.mutateAsync(userId);
      // Данные обновятся автоматически благодаря invalidation в hook
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // ✅ Улучшенные состояния загрузки и ошибок
  if (isLoading) return <Spinner fullScreen text="Загрузка пользователей..." />;
  if (error) return <ErrorMessage error={error} retry={refetch} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* ✅ Отображение статистики */}
      <div className="flex justify-between items-center">
        <h1>Пользователи</h1>
        <div className="text-sm text-gray-600">
          Показано {data.items.length} из {data.total}
        </div>
      </div>

      {/* ✅ Таблица с облегченными данными (UserListItem вместо full User) */}
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th onClick={() => {
                if (sortBy === 'full_name') setSortDesc(!sortDesc);
                else { setSortBy('full_name'); setSortDesc(false); }
              }}>
                Имя {sortBy === 'full_name' && (sortDesc ? '↓' : '↑')}
              </th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-2">
                    {user.avatar_url && (
                      <img src={user.avatar_url} className="w-8 h-8 rounded-full" />
                    )}
                    <div>
                      <div>{user.full_name}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td>{user.role}</td>
                <td>
                  {user.is_online ? (
                    <span className="text-green-600">🟢 Online</span>
                  ) : (
                    <span className="text-gray-500">⚪ Offline</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={deleteUser.isPending}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Пагинация */}
      <Pagination
        current={page}
        total={data.total_pages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1); // Сброс на первую страницу при изменении размера
        }}
      />
    </div>
  );
}
```

## Ключевые изменения

### 1. Пагинация на бэкенде вместо фронтенда

**До:**
```tsx
// Загружали ВСЕ данные и делали пагинацию на фронте
const allUsers = await usersApi.getUsers(); // 1000+ пользователей
const page1 = allUsers.slice(0, 20);
```

**После:**
```tsx
// Загружаем только нужную страницу
const { data } = useUsers({ page: 1, page_size: 20 }); // Только 20 пользователей
```

### 2. Автоматическое кэширование

**До:**
```tsx
// Каждый раз заново загружаем данные
useEffect(() => {
  loadUsers();
}, []);
```

**После:**
```tsx
// React Query автоматически кэширует на 3 минуты
const { data } = useUsers({ page: 1 });
// Повторный вызов в течение 3 минут вернет данные из кэша
```

### 3. Optimistic Updates

**До:**
```tsx
const handleDelete = async (id: number) => {
  await usersApi.delete(id);
  await loadUsers(); // Перезагружаем все данные
};
```

**После:**
```tsx
const deleteUser = useDeleteUser();

const handleDelete = async (id: number) => {
  await deleteUser.mutateAsync(id);
  // Кэш автоматически обновляется благодаря invalidation
  // Не нужно вручную перезагружать
};
```

### 4. Облегченные данные для списков

**До:**
```tsx
// API возвращал полные объекты User (30+ полей) для списка
interface User {
  id: number;
  full_name: string;
  username: string;
  avatar_url?: string;
  // ... еще 25+ полей которые НЕ нужны в списке
  social_links: {...};
  custom_fields: {...};
  tags: string[];
  // ...
}
```

**После:**
```tsx
// API возвращает только нужные поля для списка
interface UserListItem {
  id: number;
  full_name: string;
  username: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  is_online: boolean;
  last_seen?: string;
  created_at: string;
}
// Размер ответа уменьшился в ~5 раз!
```

### 5. Обработка ошибок

**До:**
```tsx
try {
  await loadUsers();
} catch (err) {
  const message = err instanceof Error ? err.message : "Unknown error";
  setError(message);
}
```

**После:**
```tsx
const { error } = useUsers();

// error теперь AppError с statusCode и details
if (error) {
  return <ErrorMessage error={error} retry={refetch} />;
}
```

## Преимущества нового подхода

1. **Производительность**
   - Загружается только нужная страница данных
   - Облегченные объекты (UserListItem вместо User)
   - Автоматическое кэширование

2. **UX**
   - Мгновенное отображение из кэша
   - Автоматическое обновление в фоне
   - Встроенные состояния загрузки и ошибок

3. **DX (Developer Experience)**
   - Меньше boilerplate кода
   - Автоматическое управление состоянием
   - TypeScript типы из коробки

4. **Надежность**
   - Автоматические retry при ошибках
   - Дедупликация запросов
   - Синхронизация кэша между компонентами

## Миграция существующего кода

### Шаг 1: Замените useState + useEffect на useUsers

```diff
- const [users, setUsers] = useState<User[]>([]);
- const [loading, setLoading] = useState(true);
- const [error, setError] = useState<string | null>(null);
-
- useEffect(() => {
-   const load = async () => {
-     try {
-       setLoading(true);
-       const data = await usersApi.getUsers();
-       setUsers(data);
-     } catch (err) {
-       setError(err.message);
-     } finally {
-       setLoading(false);
-     }
-   };
-   load();
- }, []);
+ const { data, isLoading, error } = useUsers({ page: 1, page_size: 20 });
```

### Шаг 2: Обновите условия рендеринга

```diff
- if (loading) return <Spinner />;
- if (error) return <div>Ошибка: {error}</div>;
+ if (isLoading) return <Spinner />;
+ if (error) return <ErrorMessage error={error} />;
+ if (!data) return null;
```

### Шаг 3: Используйте data.items вместо users

```diff
- {users.map(user => ...)}
+ {data.items.map(user => ...)}
```

### Шаг 4: Добавьте пагинацию

```tsx
<Pagination
  current={data.page}
  total={data.total_pages}
  onPageChange={(newPage) => setPage(newPage)}
/>
```

## Пример компонента с полным функционалом

См. файл: `frontend/src/examples/UsersListExample.tsx`
