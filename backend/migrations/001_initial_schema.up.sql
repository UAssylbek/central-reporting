-- ==============================================
-- Миграция 001: Начальная схема базы данных
-- Включает: users, audit_log, organizations, password_reset_tokens
-- ==============================================

-- ==============================================
-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
-- ==============================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    -- Основная информация
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password TEXT,

    -- Аватарка
    avatar_url TEXT,

    -- Настройки доступа
    require_password_change BOOLEAN DEFAULT FALSE,
    disable_password_change BOOLEAN DEFAULT FALSE,
    show_in_selection BOOLEAN DEFAULT TRUE,
    available_organizations JSONB DEFAULT '[]'::jsonb,
    accessible_users JSONB DEFAULT '[]'::jsonb,

    -- Контактная информация (массивы для множественных значений)
    emails JSONB DEFAULT '[]'::jsonb,
    phones JSONB DEFAULT '[]'::jsonb,

    -- Личная информация
    position VARCHAR(255),
    department VARCHAR(255),
    birth_date DATE,

    -- Адрес
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),

    -- Социальные сети и мессенджеры
    social_links JSONB DEFAULT '{}'::jsonb,

    -- Рабочие настройки
    timezone VARCHAR(100),
    work_hours VARCHAR(50),

    -- Дополнительные поля
    comment TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,

    -- Статус
    is_active BOOLEAN DEFAULT TRUE,
    blocked_reason TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE,
    blocked_by INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Системные поля
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_first_login BOOLEAN DEFAULT TRUE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    token_version INTEGER DEFAULT 0,

    -- История изменений
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Базовые индексы для users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_full_name ON users(full_name);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_show_in_selection ON users(show_in_selection);
CREATE INDEX idx_users_is_online ON users(is_online);
CREATE INDEX idx_users_last_seen ON users(last_seen);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_position ON users(position);
CREATE INDEX idx_users_department ON users(department);

-- Индексы для JSONB полей
CREATE INDEX idx_users_emails ON users USING GIN(emails);
CREATE INDEX idx_users_phones ON users USING GIN(phones);
CREATE INDEX idx_users_tags ON users USING GIN(tags);
CREATE INDEX idx_users_custom_fields ON users USING GIN(custom_fields);
CREATE INDEX idx_users_available_orgs ON users USING GIN(available_organizations);
CREATE INDEX idx_users_accessible_users ON users USING GIN(accessible_users);

-- Композитные индексы для производительности
CREATE INDEX idx_users_active_role ON users(is_active, role);
CREATE INDEX idx_users_online_last_seen ON users(is_online, last_seen DESC);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_updated_at ON users(updated_at DESC);

-- Partial индексы (экономят место, ускоряют запросы)
CREATE INDEX idx_users_active_only ON users(id) WHERE is_active = true;
CREATE INDEX idx_users_online_only ON users(id, last_seen DESC) WHERE is_online = true;
CREATE INDEX idx_users_blocked ON users(blocked_at DESC) WHERE is_active = false;

-- Индекс для token_version (используется при валидации JWT)
CREATE INDEX idx_users_token_version ON users(id, token_version);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Комментарии для users
COMMENT ON TABLE users IS 'Таблица пользователей системы';
COMMENT ON INDEX idx_users_active_role IS 'Композитный индекс для фильтрации активных пользователей по ролям';
COMMENT ON INDEX idx_users_online_last_seen IS 'Композитный индекс для запросов онлайн пользователей';
COMMENT ON INDEX idx_users_created_at IS 'Индекс для сортировки по дате создания';
COMMENT ON INDEX idx_users_updated_at IS 'Индекс для отслеживания последних изменений';
COMMENT ON INDEX idx_users_active_only IS 'Partial index только для активных пользователей';
COMMENT ON INDEX idx_users_online_only IS 'Partial index только для онлайн пользователей';
COMMENT ON INDEX idx_users_blocked IS 'Индекс для поиска заблокированных пользователей';
COMMENT ON INDEX idx_users_token_version IS 'Индекс для быстрой валидации JWT токенов';

-- ==============================================
-- 2. ТАБЛИЦА АУДИТ ЛОГОВ
-- ==============================================

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для audit_log
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_target_user_id ON audit_log(target_user_id);
CREATE INDEX idx_audit_log_user_action ON audit_log(user_id, action, created_at DESC);

-- Комментарии для audit_log
COMMENT ON TABLE audit_log IS 'Журнал всех действий пользователей в системе';
COMMENT ON COLUMN audit_log.action IS 'Тип действия: login, logout, create_user, update_user, delete_user, change_password и т.д.';
COMMENT ON COLUMN audit_log.details IS 'Дополнительная информация о действии в формате JSON';

-- ==============================================
-- 3. ТАБЛИЦА ОРГАНИЗАЦИЙ
-- ==============================================

CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    parent_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для organizations
CREATE INDEX idx_organizations_code ON organizations(code);
CREATE INDEX idx_organizations_parent_id ON organizations(parent_id);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);
CREATE INDEX idx_organizations_name ON organizations(name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Начальные данные для organizations
INSERT INTO organizations (name, code) VALUES
('Министерство образования', 'MOE'),
('Министерство здравоохранения', 'MOH'),
('Министерство финансов', 'MOF'),
('Акимат Алматы', 'ALMATY'),
('Акимат Астаны', 'ASTANA');

-- Комментарии для organizations
COMMENT ON TABLE organizations IS 'Справочник организаций';
COMMENT ON COLUMN organizations.parent_id IS 'Родительская организация для иерархии';

-- ==============================================
-- 4. ТАБЛИЦА ТОКЕНОВ СБРОСА ПАРОЛЯ
-- ==============================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для password_reset_tokens
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_used ON password_reset_tokens(used);

-- Комментарии для password_reset_tokens
COMMENT ON TABLE password_reset_tokens IS 'Токены для сброса пароля';
COMMENT ON COLUMN password_reset_tokens.token IS 'Уникальный токен для сброса пароля';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Время истечения токена (обычно 1 час)';
COMMENT ON COLUMN password_reset_tokens.used IS 'Использован ли токен';
