-- =====================================================
-- Add super_admin column to admin_users table
-- =====================================================
DO
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'admin'
                   AND table_name = 'admin_users'
                   AND column_name = 'super_admin') THEN

        ALTER TABLE admin.admin_users ADD COLUMN super_admin BOOLEAN NOT NULL DEFAULT FALSE;

        RAISE NOTICE 'Column super_admin added to admin.admin_users';
    ELSE
        RAISE NOTICE 'Column super_admin already exists in admin.admin_users';
    END IF;
END
$$;

-- =====================================================
-- Set existing admin users as super_admin (optional - adjust as needed)
-- This sets users who have the ADMIN profile as superAdmin
-- =====================================================
DO
$$
BEGIN
    -- Update users who have the ADMIN profile to be superAdmin
    UPDATE admin.admin_users u
    SET super_admin = TRUE
    WHERE EXISTS (
        SELECT 1 FROM admin.admin_user_profils up
        JOIN admin.admin_profils p ON up.profil_id = p.id
        WHERE up.user_id = u.id AND p.code = 'ADMIN'
    );
    
    RAISE NOTICE 'Existing admin users updated to superAdmin';
END
$$;
