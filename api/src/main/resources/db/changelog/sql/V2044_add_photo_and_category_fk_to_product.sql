-- liquibase formatted sql
-- changeset posadmin:V2044_add_photo_and_category_fk_to_product splitStatements:false

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'business' AND table_name = 'data_product' AND column_name = 'photo') THEN
        ALTER TABLE business.data_product ADD COLUMN photo BYTEA;
        RAISE NOTICE 'Column photo added to business.data_product';
    ELSE
        RAISE NOTICE 'Column photo already exists on business.data_product';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'business' AND table_name = 'data_product' AND column_name = 'category_fk') THEN
        ALTER TABLE business.data_product ADD COLUMN category_fk INTEGER;
        ALTER TABLE business.data_product ADD CONSTRAINT fk_product_category
            FOREIGN KEY (category_fk) REFERENCES business.data_product_category(id);
        RAISE NOTICE 'Column category_fk added to business.data_product';
    ELSE
        RAISE NOTICE 'Column category_fk already exists on business.data_product';
    END IF;
END $$;
