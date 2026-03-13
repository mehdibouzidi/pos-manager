-- =====================================================
-- Insert Store privileges
-- =====================================================
DO
$$
BEGIN
    -- Check if privileges don't already exist
    IF NOT EXISTS (SELECT 1 FROM admin.admin_privileges WHERE code = 'STORE_READ') THEN
        INSERT INTO admin.admin_privileges (id, code, name, created_at, updated_at, created_by, updated_by)
        VALUES 
            (DEFAULT, 'STORE_READ', 'Lecture des magasins', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
            (DEFAULT, 'STORE_CREATE', 'Création de magasins', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
            (DEFAULT, 'STORE_UPDATE', 'Modification des magasins', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
            (DEFAULT, 'STORE_DELETE', 'Suppression de magasins', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);
        
        RAISE NOTICE 'Store privileges inserted successfully';
    ELSE
        RAISE NOTICE 'Store privileges already exist';
    END IF;
END
$$;
