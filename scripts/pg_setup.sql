-- CipherSQL Studio — PostgreSQL Sandbox Setup
-- 1. Create the sandbox database (run as superuser / postgres)
CREATE DATABASE ciphersqlstudio_sandbox;

-- 2. Connect to the new database:
--    \c ciphersqlstudio_sandbox

-- 3. Create a restricted app user
--    The app user can create/drop schemas (needed per-assignment sandbox)
--    but cannot access system catalogs harmfully.

CREATE USER ciphersql_app WITH PASSWORD 'change_me_in_production';

-- Grant connect
GRANT CONNECT ON DATABASE ciphersqlstudio_sandbox TO ciphersql_app;

-- Grant ability to create schemas (required for per-assignment sandboxes)
GRANT CREATE ON DATABASE ciphersqlstudio_sandbox TO ciphersql_app;

-- Lock down public schema — app should only use its own ws_* schemas
REVOKE ALL ON SCHEMA public FROM ciphersql_app;