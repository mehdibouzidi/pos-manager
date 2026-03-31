-- liquibase formatted sql
-- changeset posadmin:V2046_create_session_logs_table splitStatements:false

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'admin' AND table_name = 'admin_session_logs') THEN
        CREATE TABLE admin.admin_session_logs (
            id              SERIAL PRIMARY KEY,
            user_fk         INTEGER,
            pos_fk          INTEGER,
            ip_address      VARCHAR(255),
            login_at        TIMESTAMP,
            created_at      TIMESTAMP,
            updated_at      TIMESTAMP,
            CONSTRAINT fk_session_log_user FOREIGN KEY (user_fk) REFERENCES admin.admin_users(id),
            CONSTRAINT fk_session_log_pos  FOREIGN KEY (pos_fk)  REFERENCES admin.admin_pos(id)
        );
        RAISE NOTICE 'Table admin.admin_session_logs created';
    ELSE
        RAISE NOTICE 'Table admin.admin_session_logs already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin.admin_privileges WHERE code = 'SESSION_LOG_READ') THEN
        INSERT INTO admin.admin_privileges (id, code, name, created_at, updated_at, created_by, updated_by)
        VALUES
            (DEFAULT, 'SESSION_LOG_READ', 'Lecture des journaux de sessions', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);
        RAISE NOTICE 'Session Log privileges inserted';
    ELSE
        RAISE NOTICE 'Session Log privileges already exist';
    END IF;
END $$;
