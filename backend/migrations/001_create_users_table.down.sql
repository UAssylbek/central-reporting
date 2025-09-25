-- Удаляем триггер и функцию
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Удаляем все индексы
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_full_name;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_show_in_selection;

-- Удаляем таблицу
DROP TABLE IF EXISTS users;