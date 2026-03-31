-- liquibase formatted sql
-- changeset posadmin:V2045_create_api_keys_table splitStatements:false

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'admin' AND table_name = 'admin_api_keys') THEN
        CREATE TABLE admin.admin_api_keys (
            id              SERIAL PRIMARY KEY,
            pos_fk          INTEGER,
            key_value       VARCHAR(255) NOT NULL UNIQUE,
            description     VARCHAR(500),
            active          BOOLEAN DEFAULT TRUE NOT NULL,
            created_at      TIMESTAMP,
            updated_at      TIMESTAMP,
            created_by      INTEGER,
            updated_by      INTEGER,
            CONSTRAINT fk_api_key_pos FOREIGN KEY (pos_fk) REFERENCES admin.admin_pos(id),
            CONSTRAINT fk_api_key_created_by FOREIGN KEY (created_by) REFERENCES admin.admin_users(id),
            CONSTRAINT fk_api_key_updated_by FOREIGN KEY (updated_by) REFERENCES admin.admin_users(id)
        );
        RAISE NOTICE 'Table admin.admin_api_keys created';
    ELSE
        RAISE NOTICE 'Table admin.admin_api_keys already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin.admin_privileges WHERE code = 'API_KEY_READ') THEN
        INSERT INTO admin.admin_privileges (id, code, name, created_at, updated_at, created_by, updated_by)
        VALUES
            (DEFAULT, 'API_KEY_READ',   'Lecture des clés API',           CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
            (DEFAULT, 'API_KEY_CREATE', 'Création de clés API',           CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
            (DEFAULT, 'API_KEY_UPDATE', 'Modification des clés API',      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
            (DEFAULT, 'API_KEY_DELETE', 'Suppression de clés API',        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);
        RAISE NOTICE 'API Key privileges inserted';
    ELSE
        RAISE NOTICE 'API Key privileges already exist';
    END IF;
END $$;
