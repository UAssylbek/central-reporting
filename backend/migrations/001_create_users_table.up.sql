-- Создаем таблицу пользователей с расширенными полями
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,                    -- Полное имя (обязательное)
    username VARCHAR(255) UNIQUE NOT NULL,              -- Имя для входа (обязательное)
    password TEXT,                                      -- Пароль (может быть NULL)
    require_password_change BOOLEAN DEFAULT FALSE,      -- Требовать смену пароля
    disable_password_change BOOLEAN DEFAULT FALSE,      -- Запретить смену пароля  
    show_in_selection BOOLEAN DEFAULT TRUE,             -- Показывать в списке выбора
    available_organizations JSONB DEFAULT '[]'::jsonb,  -- Доступные организации (массив ID)
    email VARCHAR(255),                                 -- Электронная почта
    phone VARCHAR(50),                                  -- Телефон
    additional_email VARCHAR(255),                      -- Дополнительная почта
    comment TEXT,                                       -- Комментарий
    role VARCHAR(50) NOT NULL DEFAULT 'user',           -- Роль пользователя
    is_first_login BOOLEAN DEFAULT TRUE,                -- Первый вход (для смены пароля)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы для оптимизации поиска
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_full_name ON users(full_name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_show_in_selection ON users(show_in_selection);

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

-- Вставляем администратора по умолчанию (пароль: admin123)
INSERT INTO users (full_name, username, password, role, require_password_change, is_first_login) 
VALUES ('Системный администратор', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', FALSE, FALSE)
ON CONFLICT (username) DO NOTHING;