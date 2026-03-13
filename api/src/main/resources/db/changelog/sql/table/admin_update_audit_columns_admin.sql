-- Loop through all required tables for 'created_by' and 'updated_by' management
DO $$
DECLARE
    tablename TEXT;
BEGIN
    FOREACH tablename IN ARRAY ARRAY[
        'admin_profils','admin_privileges','admin_address'
    ]
    LOOP
        -- created_by column
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'admin'
              AND table_name = tablename
              AND column_name = 'created_by'
        ) THEN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'admin'
                  AND table_name = tablename
                  AND column_name = 'created_by'
                  AND data_type != 'integer'
            ) THEN
                EXECUTE format('ALTER TABLE admin.%I ALTER COLUMN created_by TYPE INT USING created_by::integer;', tablename);
            END IF;
        ELSE
            EXECUTE format('ALTER TABLE admin.%I ADD COLUMN created_by INT;', tablename);
        END IF;

        -- Add foreign key constraint for created_by if it doesn't exist
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints
            WHERE table_schema = 'admin'
              AND table_name = tablename
              AND constraint_name = format('fk_%s_created_by', tablename)
        ) THEN
            EXECUTE format('ALTER TABLE admin.%I ADD CONSTRAINT %I FOREIGN KEY (created_by) REFERENCES admin.admin_users(id) ON DELETE SET NULL;',
                tablename, format('fk_%s_created_by', tablename));
        END IF;

        -- updated_by column
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'admin'
              AND table_name = tablename
              AND column_name = 'updated_by'
        ) THEN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'admin'
                  AND table_name = tablename
                  AND column_name = 'updated_by'
                  AND data_type != 'integer'
            ) THEN
                EXECUTE format('ALTER TABLE admin.%I ALTER COLUMN updated_by TYPE INT USING updated_by::integer;', tablename);
            END IF;
        ELSE
            EXECUTE format('ALTER TABLE admin.%I ADD COLUMN updated_by INT;', tablename);
        END IF;

        -- Add foreign key constraint for updated_by if it doesn't exist
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints
            WHERE table_schema = 'admin'
              AND table_name = tablename
              AND constraint_name = format('fk_%s_updated_by', tablename)
        ) THEN
            EXECUTE format('ALTER TABLE admin.%I ADD CONSTRAINT %I FOREIGN KEY (updated_by) REFERENCES admin.admin_users(id) ON DELETE SET NULL;',
                tablename, format('fk_%s_updated_by', tablename));
        END IF;
    END LOOP;
END $$;
