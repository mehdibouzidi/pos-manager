-- liquibase formatted sql
-- changeset posadmin:V2052_insert_caisse_session_privileges splitStatements:false

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin.admin_privileges WHERE code = 'CAISSE_SESSION_READ') THEN
        INSERT INTO admin.admin_privileges (code, name) VALUES ('CAISSE_SESSION_READ', 'Lecture des sessions de caisse');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM admin.admin_privileges WHERE code = 'CAISSE_SESSION_CREATE') THEN
        INSERT INTO admin.admin_privileges (code, name) VALUES ('CAISSE_SESSION_CREATE', 'Ouverture de caisse');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM admin.admin_privileges WHERE code = 'CAISSE_SESSION_CLOSE') THEN
        INSERT INTO admin.admin_privileges (code, name) VALUES ('CAISSE_SESSION_CLOSE', 'Clôture de caisse');
    END IF;
END $$;
