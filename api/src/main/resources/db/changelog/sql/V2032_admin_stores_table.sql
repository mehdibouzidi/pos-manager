-- =====================================================
-- Create admin_stores table for multi-tenant support
-- =====================================================
DO
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'admin'
                   AND table_name = 'admin_stores') THEN

        CREATE TABLE admin.admin_stores (
            id SERIAL PRIMARY KEY,
            code VARCHAR(50) NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL,
            address VARCHAR(255),
            phone VARCHAR(20),
            email VARCHAR(100),
            active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_by VARCHAR(50),
            updated_by VARCHAR(50)
        );

        ALTER TABLE admin.admin_stores OWNER TO posadmin;

        -- Create index on code for faster lookups
        CREATE INDEX idx_admin_stores_code ON admin.admin_stores(code);
        
        -- Create index on active for filtering
        CREATE INDEX idx_admin_stores_active ON admin.admin_stores(active);

        RAISE NOTICE 'Table admin.admin_stores created successfully';
    ELSE
        RAISE NOTICE 'Table admin.admin_stores already exists';
    END IF;
END
$$;

-- =====================================================
-- Add store_fk column to admin_users table
-- =====================================================
DO
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'admin'
                   AND table_name = 'admin_users'
                   AND column_name = 'store_fk') THEN

        ALTER TABLE admin.admin_users
            ADD COLUMN store_fk INTEGER;

        ALTER TABLE admin.admin_users
            ADD CONSTRAINT fk_admin_users_store
            FOREIGN KEY (store_fk)
            REFERENCES admin.admin_stores(id);

        -- Create index for faster joins
        CREATE INDEX idx_admin_users_store_fk ON admin.admin_users(store_fk);

        RAISE NOTICE 'Column store_fk added to admin.admin_users';
    ELSE
        RAISE NOTICE 'Column store_fk already exists in admin.admin_users';
    END IF;
END
$$;
