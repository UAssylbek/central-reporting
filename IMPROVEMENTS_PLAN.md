# План улучшений Central Reporting

Этот документ содержит подробный план всех улучшений, которые нужно внести в проект.

## ✅ ЗАВЕРШЕНО

### 1. WhatsApp валидация - ИСПРАВЛЕНО ✅
**Файл:** `frontend/src/shared/ui/SocialLinksInput/SocialLinksInput.tsx`

**Что было сделано:**
- Добавлено состояние `validFields` для отслеживания валидных полей
- Функция `validateField` теперь возвращает `boolean`
- Галочка "✓ Корректно" показывается ТОЛЬКО когда `validFields[key] === true`
- Исправлена преждевременная валидация

### 2. ESLint ошибки - ИСПРАВЛЕНО ✅
**Файл:** `frontend/src/pages/UsersPage/UsersPage.tsx`

**Что было сделано:**
- Закомментирован неиспользуемый import `UserViewModal`
- Закомментированы неиспользуемые переменные: `isViewOpen`, `isDeletingBulk`, `viewingUser`
- Закомментированы неиспользуемые функции: `handleViewUser`, `handleEditFromView`, `handleDeleteFromView`, `handleBulkDelete`
- Добавлены комментарии `// TODO:` для будущей реализации

**Файл:** `frontend/src/shared/api/users.api.ts`

- Заменен `any` на конкретный тип: `{ users: User[]; total?: number }`

### 3. SQL Injection уязвимость - ИСПРАВЛЕНО ✅
**Файл:** `backend/internal/repositories/user.go`

**Что было сделано:**
- Добавлен whitelist допустимых полей для сортировки:
```go
var allowedSortFields = map[string]bool{
    "id": true, "full_name": true, "username": true,
    "role": true, "position": true, "department": true,
    "is_active": true, "is_online": true, "last_seen": true,
    "created_at": true, "updated_at": true,
}
```
- Добавлена проверка в `GetAllPaginated()` и `GetAllPaginatedLight()`:
```go
if !allowedSortFields[params.SortBy] {
    log.Printf("WARNING: Attempted to sort by invalid field: %s", params.SortBy)
    params.SortBy = "created_at"
}
```

### 4. Пароль в .env.example - ИСПРАВЛЕНО ✅
**Файл:** `backend/.env.example`

**Что было сделано:**
- Заменен `Qwerty123` на `password`
- JWT_SECRET увеличен до 32+ символов
- Добавлен `ALLOWED_ORIGINS`

### 5. .gitignore для backend - СОЗДАНО ✅
**Файл:** `backend/.gitignore`

**Что было сделано:**
- Создан полный .gitignore с исключением .env, uploads/, build/ и др.

---

## 🔴 КРИТИЧНО - СРОЧНО

### 6. Rate Limiting на все protected endpoints

**Проблема:**
Сейчас rate limiting есть только на:
- `/api/auth/login` - 5/мин
- `/api/users (POST)` - 10/мин
- `/api/auth/change-password` - 3/мин

НЕ защищены:
- `/api/users (GET)` - можно заспамить
- `/api/users/:id (GET)` - перебор ID
- `/api/auth/me` - DDoS

**Решение:**

Файл: `backend/cmd/main.go`

```go
// Создать общий rate limiter для protected routes
generalLimiter := middleware.NewRateLimiter(100, time.Minute) // 100 req/min

// Protected routes
protected := r.Group("/api")
protected.Use(auth.JWTMiddleware(cfg.JWTSecret, userRepo))
protected.Use(auth.ActivityMiddleware(userRepo))
protected.Use(generalLimiter.Middleware()) // ← Добавить сюда
{
    // ...
}
```

---

## 🟡 ВАЖНО - СЛЕДУЮЩИЙ СПРИНТ

### 7. Добавить таблицу audit_log

**Зачем:** Логирование всех действий пользователей для безопасности

**Файл:** `backend/migrations/003_create_audit_log.up.sql`

```sql
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_target_user_id ON audit_log(target_user_id);
```

**Файл:** `backend/migrations/003_create_audit_log.down.sql`

```sql
DROP TABLE IF EXISTS audit_log;
```

**Использование:**

```go
// backend/internal/repositories/audit_log.go
func (r *AuditLogRepository) Log(userID int, action string, details map[string]interface{}) error {
    query := `INSERT INTO audit_log (user_id, action, details, ip_address)
              VALUES ($1, $2, $3, $4)`
    // ...
}

// В handlers/users.go
auditLog.Log(currentUserID, "create_user", gin.H{
    "target_user_id": user.ID,
    "username": user.Username,
})
```

---

### 8. Добавить таблицу organizations

**Зачем:** Убрать хардкод организаций из кода

**Файл:** `backend/migrations/004_create_organizations.up.sql`

```sql
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    parent_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_organizations_code ON organizations(code);
CREATE INDEX idx_organizations_parent_id ON organizations(parent_id);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- Вставить начальные данные
INSERT INTO organizations (name, code) VALUES
('Министерство образования', 'MOE'),
('Министерство здравоохранения', 'MOH'),
('Министерство финансов', 'MOF'),
('Акимат Алматы', 'ALMATY'),
('Акимат Астаны', 'ASTANA');
```

**Изменить:**
- `backend/internal/handlers/users.go` - заменить хардкод на запрос к БД
- `backend/internal/repositories/organization.go` - создать новый репозиторий

---

### 9. Реализовать восстановление пароля

**Компоненты:**

1. **Таблица для токенов сброса**

```sql
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
```

2. **Backend endpoints**

```go
// POST /api/auth/forgot-password
{
    "username_or_email": "admin"
}

// POST /api/auth/reset-password
{
    "token": "abc123...",
    "new_password": "NewPass123!"
}
```

3. **Frontend страницы**
- `/forgot-password` - форма запроса сброса
- `/reset-password?token=...` - форма установки нового пароля

---

### 10. Добавить email уведомления

**Библиотека:** `go-mail/mail` или SMTP

```go
// backend/internal/services/email_service.go
type EmailService struct {
    smtpHost     string
    smtpPort     int
    smtpUsername string
    smtpPassword string
}

func (s *EmailService) SendPasswordResetEmail(user User, token string) error {
    resetLink := fmt.Sprintf("https://central-reporting.kz/reset-password?token=%s", token)

    body := fmt.Sprintf(`
        Здравствуйте, %s!

        Для сброса пароля перейдите по ссылке:
        %s

        Ссылка действительна 1 час.
    `, user.FullName, resetLink)

    return s.sendEmail(user.Email, "Сброс пароля", body)
}
```

**Когда отправлять:**
- Создание пользователя
- Сброс пароля
- Блокировка аккаунта
- Изменение важных данных

---

### 11. Написать frontend тесты

**Установка:**

```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Конфиг:** `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
    },
  },
})
```

**Примеры тестов:**

```typescript
// frontend/src/shared/utils/formatPhone.test.ts
import { describe, it, expect } from 'vitest';
import { formatPhoneNumber, isValidPhoneNumber } from './formatPhone';

describe('formatPhoneNumber', () => {
  it('должен форматировать номер +7', () => {
    expect(formatPhoneNumber('79991234567')).toBe('+7 (999) 123-45-67');
  });

  it('должен валидировать полный номер', () => {
    expect(isValidPhoneNumber('+7 (999) 123-45-67')).toBe(true);
    expect(isValidPhoneNumber('+7 (9')).toBe(false);
  });
});
```

**Запуск:**
```bash
npm run test
npm run test:coverage
```

---

### 12. Добавить фильтрацию и поиск пользователей

**Backend:** Расширить GET /api/users

```go
// query parameters:
// ?search=john           - поиск по имени/username
// ?role=admin           - фильтр по роли
// ?is_active=true       - фильтр по статусу
// ?organization=1       - фильтр по организации

func (h *UserHandler) GetUsers(c *gin.Context) {
    search := c.Query("search")
    role := c.Query("role")
    isActiveStr := c.Query("is_active")

    // Построить SQL с WHERE условиями
    // ...
}
```

**Frontend:** Добавить фильтры на UsersPage

```tsx
<div className="filters">
  <SearchInput value={search} onChange={setSearch} />
  <Select value={roleFilter} onChange={setRoleFilter}>
    <option value="all">Все роли</option>
    <option value="admin">Админ</option>
    <option value="moderator">Модератор</option>
    <option value="user">Пользователь</option>
  </Select>
</div>
```

---

### 13. Graceful Shutdown для backend

**Файл:** `backend/cmd/main.go`

```go
import (
    "context"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
)

func main() {
    // ... существующий код ...

    srv := &http.Server{
        Addr:    ":" + cfg.Port,
        Handler: r,
    }

    // Запускаем сервер в горутине
    go func() {
        log.Printf("Server starting on port %s", cfg.Port)
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Server error: %v", err)
        }
    }()

    // Ждем сигнала завершения
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Shutting down server...")

    // Даем 5 секунд на завершение активных запросов
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal("Server forced to shutdown:", err)
    }

    log.Println("Server exited")
}
```

---

## 🟢 ЖЕЛАТЕЛЬНО - БУДУЩИЕ ВЕРСИИ

### Docker Compose

Создать: `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: central-reporting
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://user:password@postgres:5432/central-reporting?sslmode=disable
      JWT_SECRET: your-super-secret-key-minimum-32-chars-CHANGE-IN-PRODUCTION
      PORT: 8080
      ALLOWED_ORIGINS: http://localhost:3000
    volumes:
      - ./backend/uploads:/app/uploads
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

Создать: `backend/Dockerfile`

```dockerfile
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o server cmd/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
COPY --from=builder /app/migrations ./migrations
EXPOSE 8080
CMD ["./server"]
```

Создать: `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Запуск:**
```bash
docker-compose up -d
```

---

### CI/CD Pipeline

Создать: `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v4
        with:
          go-version: '1.24'
      - name: Run golangci-lint
        uses: golangci/golangci-lint-action@v3
        with:
          working-directory: backend

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v4
        with:
          go-version: '1.24'
      - name: Run tests
        run: |
          cd backend
          go test ./... -v -coverprofile=coverage.out
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install deps
        run: |
          cd frontend
          npm ci
      - name: Lint
        run: |
          cd frontend
          npm run lint

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install and test
        run: |
          cd frontend
          npm ci
          npm run test:coverage

  build:
    needs: [backend-tests, frontend-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: docker-compose build
```

---

## ИТОГО

**Выполнено:** 5/13 задач (38%)

**Следующие шаги:**
1. Rate limiting - 30 мин
2. Audit log - 2 часа
3. Organizations table - 1 час
4. Password recovery - 4 часа
5. Email notifications - 3 часа
6. Frontend tests - 4 часа
7. Filtering/search - 2 часа
8. Graceful shutdown - 30 мин

**Общее время:** ~17 часов работы

**Приоритет:**
1. Rate limiting (безопасность)
2. Graceful shutdown (стабильность)
3. Audit log (безопасность)
4. Password recovery (функциональность)
5. Остальное по желанию
