-- Скрипт для пересоздания базы данных central_reporting
-- Выполните: psql -U postgres -f recreate_database.sql

-- Отключаем все активные соединения
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'central_reporting'
  AND pid <> pg_backend_pid();

-- Удаляем базу данных
DROP DATABASE IF EXISTS central_reporting;

-- Создаём заново
CREATE DATABASE central_reporting;

-- Подключаемся к новой базе
\c central_reporting

-- Даём права пользователю user
GRANT ALL PRIVILEGES ON SCHEMA public TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "user";
