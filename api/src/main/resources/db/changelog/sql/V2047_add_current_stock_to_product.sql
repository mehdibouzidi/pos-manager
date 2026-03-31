-- liquibase formatted sql
-- changeset posadmin:V2047_add_current_stock_to_product splitStatements:false

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'business' AND table_name = 'data_product' AND column_name = 'current_stock') THEN
        ALTER TABLE business.data_product ADD COLUMN current_stock DOUBLE PRECISION DEFAULT 0;
        RAISE NOTICE 'Column current_stock added to data_product';
    ELSE
        RAISE NOTICE 'Column current_stock already exists in data_product';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin.admin_privileges WHERE code = 'STOCK_MOVEMENT_READ') THEN
        INSERT INTO admin.admin_privileges (id, code, name, created_at, updated_at, created_by, updated_by)
        VALUES
            (DEFAULT, 'STOCK_MOVEMENT_READ',   'Lecture des mouvements de stock',      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
            (DEFAULT, 'STOCK_MOVEMENT_CREATE', 'Création de mouvements de stock',      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
            (DEFAULT, 'STOCK_MOVEMENT_UPDATE', 'Modification des mouvements de stock', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
            (DEFAULT, 'STOCK_MOVEMENT_DELETE', 'Suppression des mouvements de stock',  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);
        RAISE NOTICE 'Stock Movement privileges inserted';
    ELSE
        RAISE NOTICE 'Stock Movement privileges already exist';
    END IF;
END $$;
