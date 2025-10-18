-- Создание тестового администратора
-- Логин: admin
-- Пароль: Admin123! (хешируется bcrypt)

-- Хеш пароля "Admin123!" с bcrypt cost=10
-- Вы можете изменить пароль после первого входа

INSERT INTO users (
    full_name,
    username,
    password,
    emails,
    phones,
    position,
    department,
    role,
    is_active,
    is_first_login,
    require_password_change,
    show_in_selection
) VALUES (
    'Администратор Системы',
    'admin',
    '$2a$10$YourBcryptHashWillBeHere',  -- Временный, сгенерируем через Go
    '["admin@central-reporting.kz"]'::jsonb,
    '["+77001234567"]'::jsonb,
    'Системный администратор',
    'IT Department',
    'admin',
    true,
    true,
    false,
    true
);

-- Проверяем что пользователь создан
SELECT id, username, full_name, role FROM users WHERE username = 'admin';
