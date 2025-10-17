-- Миграция 002: Добавление индексов для улучшения производительности

-- Композитный индекс для фильтрации активных пользователей по ролям
-- Ускоряет запросы типа: WHERE is_active = true AND role = 'admin'
CREATE INDEX IF NOT EXISTS idx_users_active_role ON users(is_active, role);

-- Композитный индекс для online пользователей
-- Ускоряет запросы типа: WHERE is_online = true AND last_seen > ...
CREATE INDEX IF NOT EXISTS idx_users_online_last_seen ON users(is_online, last_seen DESC);

-- Индекс для поиска по created_at (для сортировки новых пользователей)
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Индекс для поиска по updated_at (для отслеживания изменений)
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at DESC);

-- Partial index для активных пользователей (экономит место, ускоряет запросы)
CREATE INDEX IF NOT EXISTS idx_users_active_only ON users(id) WHERE is_active = true;

-- Partial index для онлайн пользователей
CREATE INDEX IF NOT EXISTS idx_users_online_only ON users(id, last_seen DESC) WHERE is_online = true;

-- Индекс для поиска заблокированных пользователей
CREATE INDEX IF NOT EXISTS idx_users_blocked ON users(blocked_at DESC) WHERE is_active = false;

-- Индекс для token_version (используется при валидации JWT)
CREATE INDEX IF NOT EXISTS idx_users_token_version ON users(id, token_version);

-- GIN индекс для поиска в available_organizations (JSONB)
CREATE INDEX IF NOT EXISTS idx_users_available_orgs ON users USING GIN(available_organizations);

-- GIN индекс для поиска в accessible_users (JSONB)
CREATE INDEX IF NOT EXISTS idx_users_accessible_users ON users USING GIN(accessible_users);

-- Комментарии для документации
COMMENT ON INDEX idx_users_active_role IS 'Композитный индекс для фильтрации активных пользователей по ролям';
COMMENT ON INDEX idx_users_online_last_seen IS 'Композитный индекс для запросов онлайн пользователей';
COMMENT ON INDEX idx_users_created_at IS 'Индекс для сортировки по дате создания';
COMMENT ON INDEX idx_users_updated_at IS 'Индекс для отслеживания последних изменений';
COMMENT ON INDEX idx_users_active_only IS 'Partial index только для активных пользователей';
COMMENT ON INDEX idx_users_online_only IS 'Partial index только для онлайн пользователей';
COMMENT ON INDEX idx_users_blocked IS 'Индекс для поиска заблокированных пользователей';
COMMENT ON INDEX idx_users_token_version IS 'Индекс для быстрой валидации JWT токенов';
