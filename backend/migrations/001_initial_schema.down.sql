-- ==============================================
-- Откат миграции 001: Удаление всех таблиц
-- ==============================================

-- Удаляем таблицы в обратном порядке (из-за foreign keys)
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Удаляем функцию триггера
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
