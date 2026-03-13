-- =====================================================
-- Fix admin_stores audit columns (created_by, updated_by)
-- Change from VARCHAR to INTEGER to match admin_users.id
-- =====================================================
DO
$$
BEGIN
    -- Check if created_by is VARCHAR type (needs fix)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'admin'
        AND table_name = 'admin_stores'
        AND column_name = 'created_by'
        AND data_type = 'character varying'
    ) THEN
        -- Drop the columns and recreate with correct type
        ALTER TABLE admin.admin_stores DROP COLUMN IF EXISTS created_by;
        ALTER TABLE admin.admin_stores DROP COLUMN IF EXISTS updated_by;
        
        -- Add columns with correct INTEGER type
        ALTER TABLE admin.admin_stores ADD COLUMN created_by INTEGER;
        ALTER TABLE admin.admin_stores ADD COLUMN updated_by INTEGER;
        
        -- Add foreign key constraints
        ALTER TABLE admin.admin_stores
            ADD CONSTRAINT fk_admin_stores_created_by
            FOREIGN KEY (created_by)
            REFERENCES admin.admin_users(id);
            
        ALTER TABLE admin.admin_stores
            ADD CONSTRAINT fk_admin_stores_updated_by
            FOREIGN KEY (updated_by)
            REFERENCES admin.admin_users(id);
        
        RAISE NOTICE 'Fixed admin_stores audit columns (created_by, updated_by)';
    ELSE
        RAISE NOTICE 'admin_stores audit columns already have correct type';
    END IF;
END
$$;
