-- Откат миграции 002: Удаление индексов для производительности

DROP INDEX IF EXISTS idx_users_active_role;
DROP INDEX IF EXISTS idx_users_online_last_seen;
DROP INDEX IF EXISTS idx_users_created_at;
DROP INDEX IF EXISTS idx_users_updated_at;
DROP INDEX IF EXISTS idx_users_active_only;
DROP INDEX IF EXISTS idx_users_online_only;
DROP INDEX IF EXISTS idx_users_blocked;
DROP INDEX IF EXISTS idx_users_token_version;
DROP INDEX IF EXISTS idx_users_available_orgs;
DROP INDEX IF EXISTS idx_users_accessible_users;
