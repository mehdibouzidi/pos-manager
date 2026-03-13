DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'admin'
          AND table_name = 'admin_users'
          AND column_name = 'active'
    ) THEN
        ALTER TABLE admin.admin_users
        ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
END $$;