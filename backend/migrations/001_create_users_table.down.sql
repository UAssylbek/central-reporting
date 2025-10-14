-- Удаляем триггер и функцию
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Удаляем все индексы
DROP INDEX IF EXISTS idx_users_custom_fields;
DROP INDEX IF EXISTS idx_users_tags;
DROP INDEX IF EXISTS idx_users_phones;
DROP INDEX IF EXISTS idx_users_emails;
DROP INDEX IF EXISTS idx_users_department;
DROP INDEX IF EXISTS idx_users_position;
DROP INDEX IF EXISTS idx_users_is_active;
DROP INDEX IF EXISTS idx_users_last_seen;
DROP INDEX IF EXISTS idx_users_is_online;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_full_name;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_show_in_selection;

-- Удаляем таблицу
DROP TABLE IF EXISTS users;