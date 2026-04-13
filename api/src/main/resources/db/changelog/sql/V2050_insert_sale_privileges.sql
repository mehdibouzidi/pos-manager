-- liquibase formatted sql
-- changeset posadmin:V2050_insert_sale_privileges splitStatements:false

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin.admin_privileges WHERE code = 'SALE_CREATE') THEN
        INSERT INTO admin.admin_privileges (id, code, name, created_at, updated_at, created_by, updated_by)
        VALUES
            (DEFAULT, 'SALE_CREATE', 'Enregistrement des ventes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
            (DEFAULT, 'SALE_READ',   'Lecture des ventes',        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);
        RAISE NOTICE 'Sale privileges inserted successfully';
    ELSE
        RAISE NOTICE 'Sale privileges already exist';
    END IF;
END $$;
