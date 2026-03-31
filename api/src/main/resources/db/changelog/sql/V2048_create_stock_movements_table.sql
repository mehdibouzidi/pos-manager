-- liquibase formatted sql
-- changeset posadmin:V2048_create_stock_movements_table splitStatements:false

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'business' AND table_name = 'data_stock_movement') THEN
        CREATE TABLE business.data_stock_movement (
            id              SERIAL PRIMARY KEY,
            product_fk      INTEGER NOT NULL,
            pos_fk          INTEGER,
            movement_type   VARCHAR(50) NOT NULL,
            quantity        DOUBLE PRECISION NOT NULL,
            reason          VARCHAR(500),
            movement_date   TIMESTAMP,
            created_at      TIMESTAMP,
            updated_at      TIMESTAMP,
            created_by      INTEGER,
            updated_by      INTEGER,
            CONSTRAINT fk_stock_movement_product    FOREIGN KEY (product_fk)  REFERENCES business.data_product(id),
            CONSTRAINT fk_stock_movement_pos        FOREIGN KEY (pos_fk)      REFERENCES admin.admin_pos(id),
            CONSTRAINT fk_stock_movement_created_by FOREIGN KEY (created_by)  REFERENCES admin.admin_users(id),
            CONSTRAINT fk_stock_movement_updated_by FOREIGN KEY (updated_by)  REFERENCES admin.admin_users(id)
        );
        RAISE NOTICE 'Table business.data_stock_movement created';
    ELSE
        RAISE NOTICE 'Table business.data_stock_movement already exists';
    END IF;
END $$;
