-- Revoke privileges from 'public' role
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE  FROM PUBLIC;
CREATE SCHEMA testdbschema;


-- Read-only role
CREATE ROLE testdbr;
GRANT CONNECT ON DATABASE testdb TO testdb_ro_role;
GRANT USAGE ON SCHEMA testdbschema TO testdb_ro_role;
GRANT SELECT ON ALL TABLES IN SCHEMA testdbschema TO testdb_ro_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA testdbschema GRANT SELECT ON TABLES TO testdb_ro_role;

-- Read/write role
CREATE ROLE testdb_rw_role;
GRANT CONNECT ON DATABASE testdb TO testdb_rw_role;
GRANT USAGE, CREATE ON SCHEMA testdbschema TO testdb_rw_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA testdbschema TO testdb_rw_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA testdbschema GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO testdb_rw_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA testdbschema TO testdb_rw_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA testdbschema GRANT USAGE ON SEQUENCES TO testdb_rw_role;

-- Users creation
CREATE USER testapp WITH PASSWORD '#testapp$123';

-- Grant privileges to users
GRANT testdb_rw_role TO testapp;