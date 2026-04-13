-- liquibase formatted sql
-- changeset posadmin:V2049_create_sale_tables splitStatements:false

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'business' AND table_name = 'data_sale') THEN
        CREATE TABLE business.data_sale (
            id              SERIAL PRIMARY KEY,
            order_number    INTEGER NOT NULL,
            sale_date       TIMESTAMP,
            total_amount    DOUBLE PRECISION,
            payment_method  VARCHAR(50),
            pos_fk          INTEGER,
            created_at      TIMESTAMP,
            updated_at      TIMESTAMP,
            created_by      INTEGER,
            updated_by      INTEGER,
            CONSTRAINT fk_sale_pos        FOREIGN KEY (pos_fk)      REFERENCES admin.admin_pos(id),
            CONSTRAINT fk_sale_created_by FOREIGN KEY (created_by)  REFERENCES admin.admin_users(id),
            CONSTRAINT fk_sale_updated_by FOREIGN KEY (updated_by)  REFERENCES admin.admin_users(id)
        );
        RAISE NOTICE 'Table business.data_sale created';
    ELSE
        RAISE NOTICE 'Table business.data_sale already exists';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'business' AND table_name = 'data_sale_item') THEN
        CREATE TABLE business.data_sale_item (
            id          SERIAL PRIMARY KEY,
            sale_fk     INTEGER NOT NULL,
            product_fk  INTEGER NOT NULL,
            quantity    DOUBLE PRECISION NOT NULL,
            unit_price  DOUBLE PRECISION NOT NULL,
            CONSTRAINT fk_sale_item_sale    FOREIGN KEY (sale_fk)    REFERENCES business.data_sale(id),
            CONSTRAINT fk_sale_item_product FOREIGN KEY (product_fk) REFERENCES business.data_product(id)
        );
        RAISE NOTICE 'Table business.data_sale_item created';
    ELSE
        RAISE NOTICE 'Table business.data_sale_item already exists';
    END IF;
END $$;
