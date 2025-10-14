-- Создаем таблицу пользователей с расширенными полями
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

-- Создаем индексы для оптимизации поиска
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_full_name ON users(full_name);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_show_in_selection ON users(show_in_selection);
CREATE INDEX idx_users_is_online ON users(is_online);
CREATE INDEX idx_users_last_seen ON users(last_seen);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_position ON users(position);
CREATE INDEX idx_users_department ON users(department);

-- Индексы для JSONB полей (для быстрого поиска)
CREATE INDEX idx_users_emails ON users USING GIN(emails);
CREATE INDEX idx_users_phones ON users USING GIN(phones);
CREATE INDEX idx_users_tags ON users USING GIN(tags);
CREATE INDEX idx_users_custom_fields ON users USING GIN(custom_fields);

-- Создаем триггер для автоматического обновления updated_at
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