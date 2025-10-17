# Генерация TypeScript типов из Swagger

## Описание

Этот проект использует `openapi-typescript` для автоматической генерации TypeScript типов из Swagger документации backend.

## Использование

### 1. Убедитесь, что backend запущен

```bash
# В корневой директории проекта
cd backend
go run cmd/main.go
```

Backend должен быть доступен на `http://localhost:8080`

### 2. Сгенерируйте типы

```bash
# В директории frontend
npm run generate:types
```

Эта команда:
- Загрузит Swagger документацию с `http://localhost:8080/swagger/doc.json`
- Сгенерирует TypeScript типы в `src/shared/api/generated.ts`

### 3. Используйте сгенерированные типы

```typescript
import type { paths, components } from './shared/api/generated';

// Типы для endpoints
type UsersResponse = paths['/api/users']['get']['responses']['200']['content']['application/json'];

// Типы для schemas/models
type User = components['schemas']['User'];
type LoginRequest = components['schemas']['LoginRequest'];
```

## Рекомендации

### Автоматическая генерация при разработке

Добавьте в `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Generate API Types",
      "type": "npm",
      "script": "generate:types",
      "path": "frontend/",
      "problemMatcher": []
    }
  ]
}
```

### Интеграция в CI/CD

В вашем CI pipeline добавьте шаг:

```yaml
- name: Generate TypeScript types
  run: |
    cd backend && go run cmd/main.go &
    sleep 5  # Ждем запуска backend
    cd ../frontend && npm run generate:types
    kill %1  # Останавливаем backend
```

### Git ignore

Вы можете добавить `generated.ts` в `.gitignore` и генерировать типы локально, или коммитить их для упрощения разработки.

**Рекомендуется коммитить** для:
- Более быстрой работы новых разработчиков
- Offline разработки
- Стабильности типов между backend деплоями

## Примеры использования

### Типизация API функций

```typescript
// До
async function getUsers(): Promise<any> {
  return apiClient.get('/users');
}

// После
import type { paths } from './generated';

async function getUsers(): Promise<
  paths['/api/users']['get']['responses']['200']['content']['application/json']
> {
  return apiClient.get('/users');
}
```

### Типизация request body

```typescript
import type { components } from './generated';

type CreateUserRequest = components['schemas']['CreateUserRequest'];

async function createUser(data: CreateUserRequest) {
  return apiClient.post('/users', data);
}
```

## Troubleshooting

### Backend не отвечает на :8080

Проверьте, что backend запущен и доступен:
```bash
curl http://localhost:8080/swagger/doc.json
```

### Типы не обновляются

Удалите старый файл и сгенерируйте заново:
```bash
rm src/shared/api/generated.ts
npm run generate:types
```

### Ошибки компиляции после генерации

Проверьте версию `openapi-typescript`:
```bash
npm ls openapi-typescript
```

Убедитесь, что используется версия 7.x или новее.
