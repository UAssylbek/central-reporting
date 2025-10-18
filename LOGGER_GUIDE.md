# Руководство по системе логирования

## Обзор

В проекте реализована централизованная система логирования с поддержкой уровней и автоматическим управлением в зависимости от окружения (development/production).

## Использование

### Импорт

```typescript
import { logger } from "../shared/utils/logger";
```

### Уровни логирования

#### 1. `logger.debug()` - Детальная отладочная информация

**Показывается:** ТОЛЬКО в development
**Использование:** Для детальной отладки, переменных, состояний

```typescript
logger.debug("User data:", user);
logger.debug("🔄 Updating user", id, "with data:", userData);
logger.debug("📤 Sending API request to:", endpoint);
```

#### 2. `logger.info()` - Общая информация

**Показывается:** ТОЛЬКО в development
**Использование:** Для важных событий в приложении

```typescript
logger.info("✅ Login successful", response);
logger.info("📤 Sending login request...");
logger.info("✅ Upload successful:", result);
```

#### 3. `logger.warn()` - Предупреждения

**Показывается:** ВСЕГДА (dev + production)
**Использование:** Для потенциальных проблем

```typescript
logger.warn("Unexpected API response format:", response);
logger.warn("⚠️ Missing user email");
logger.warn("Deprecated function called");
```

#### 4. `logger.error()` - Ошибки

**Показывается:** ВСЕГДА (dev + production)
**Использование:** Для критических ошибок

```typescript
logger.error("❌ Login failed", err);
logger.error("❌ Upload failed:", errorText);
logger.error("API request failed:", err.message);
```

## Дополнительные методы

### Группировка логов

```typescript
logger.group("User Update Process");
logger.debug("Step 1: Validate data");
logger.debug("Step 2: Send to API");
logger.debug("Step 3: Update UI");
logger.groupEnd();
```

### Таблицы

```typescript
// Выводит массив объектов в виде таблицы
logger.table(users);
```

### Замер времени

```typescript
logger.time("API Request");
await api.getUsers();
logger.timeEnd("API Request"); // → API Request: 234.56ms
```

## Примеры использования

### До (старый код)

```typescript
console.log("🔐 Login form submitted");
console.log("📤 Sending login request...");
console.error("❌ Login failed", err);
```

### После (новый код)

```typescript
logger.debug("🔐 Login form submitted");
logger.info("📤 Sending login request...");
logger.error("❌ Login failed", err);
```

## Преимущества

### 1. Контроль по окружению

- **Development:** Все логи работают (debug, info, warn, error)
- **Production:** Только критичные (warn, error)

### 2. Временные метки

Все логи автоматически получают временную метку:

```
[14:23:45.123] [DEBUG] User data: {...}
[14:23:45.456] [ERROR] ❌ Login failed
```

### 3. Безопасность

Debug логи с конфиденциальной информацией не попадают в production:

```typescript
// ✅ Безопасно - не показывается в production
logger.debug("🔑 Token value:", token);
```

### 4. Производительность

В production не выполняется код debug/info логов:

```typescript
// Эта функция НЕ вызовется в production
logger.debug("Heavy computation:", expensiveCalculation());
```

## Миграция существующего кода

### Что менять

| Старый код | Новый код | Когда показывается |
|------------|-----------|-------------------|
| `console.log()` | `logger.debug()` | Только dev |
| `console.info()` | `logger.info()` | Только dev |
| `console.warn()` | `logger.warn()` | Всегда |
| `console.error()` | `logger.error()` | Всегда |

### Примеры миграции

#### LoginPage.tsx

```diff
- console.log("🔐 Login form submitted");
+ logger.debug("🔐 Login form submitted");

- console.log("📤 Sending login request...");
+ logger.info("📤 Sending login request...");

- console.log("❌ Login failed", err);
+ logger.error("❌ Login failed", err);
```

#### users.api.ts

```diff
- console.log("📤 Uploading avatar for user:", userId);
+ logger.debug("📤 Uploading avatar for user:", userId);

- console.error("❌ Upload failed:", errorText);
+ logger.error("❌ Upload failed:", errorText);

- console.warn('Unexpected API response format:', response);
+ logger.warn('Unexpected API response format:', response);
```

## Проверка работы

### Development mode

Запустите проект в dev режиме:

```bash
npm run dev
```

Откройте консоль браузера (F12) - вы увидите ВСЕ логи с временными метками.

### Production mode

Запустите проект в production режиме:

```bash
npm run build
npm run preview
```

Откройте консоль браузера (F12) - вы увидите ТОЛЬКО warn и error логи.

## Рекомендации

### ✅ Что логировать

- **debug:** Детали работы функций, значения переменных
- **info:** Успешные операции, важные события
- **warn:** Неожиданное поведение, deprecated код
- **error:** Ошибки, исключения, сбои

### ❌ Что НЕ логировать

- Пароли, токены, персональные данные (даже в debug)
- Избыточную информацию в production (используйте debug/info)
- Слишком много логов внутри циклов

### Примеры

```typescript
// ❌ ПЛОХО - утечка токена
logger.debug("Token:", localStorage.getItem("token"));

// ✅ ХОРОШО - проверяем только наличие
logger.debug("🔑 Token exists:", !!localStorage.getItem("token"));

// ❌ ПЛОХО - избыточно в цикле
users.forEach(user => {
  logger.debug("Processing user:", user.id);
  processUser(user);
});

// ✅ ХОРОШО - логируем результат
logger.debug("Processing users count:", users.length);
users.forEach(user => processUser(user));
logger.debug("✅ All users processed");
```

## Интеграция с мониторингом

В будущем можно легко интегрировать с сервисами мониторинга:

```typescript
export const logger = {
  error: (...args: unknown[]): void => {
    console.error(...formatMessage(LogLevel.ERROR, ...args));

    // Отправка в Sentry/LogRocket/etc
    if (import.meta.env.PROD) {
      Sentry.captureException(args[0]);
    }
  },
};
```

## Файлы с изменениями

Система логирования внедрена в следующие файлы:

### Frontend

- [x] `frontend/src/shared/utils/logger.ts` - Основной файл logger
- [x] `frontend/src/pages/LoginPage/LoginPage.tsx`
- [x] `frontend/src/shared/api/users.api.ts`
- [x] `frontend/src/shared/api/client.ts`
- [x] `frontend/src/shared/api/auth.api.ts`
- [x] `frontend/src/app/layouts/MainLayout.tsx`
- [x] `frontend/src/features/reports/UniversalReportModal/UniversalReportModal.tsx`

## Заключение

Централизованная система логирования позволяет:

- ✅ Контролировать логи по окружению
- ✅ Безопасно хранить debug информацию
- ✅ Улучшить производительность в production
- ✅ Легко интегрироваться с мониторингом
- ✅ Поддерживать чистоту кода

Используйте logger во всех новых файлах и постепенно мигрируйте старый код!
