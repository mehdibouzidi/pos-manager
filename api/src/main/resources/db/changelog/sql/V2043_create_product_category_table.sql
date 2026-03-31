-- liquibase formatted sql
-- changeset posadmin:V2043_create_product_category_table splitStatements:false

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'business' AND table_name = 'data_product_category') THEN
        CREATE TABLE business.data_product_category (
            id              SERIAL PRIMARY KEY,
            code            VARCHAR(255) NOT NULL,
            name            VARCHAR(255),
            photo           BYTEA,
            pos_fk          INTEGER,
            active          BOOLEAN DEFAULT TRUE,
            created_at      TIMESTAMP,
            updated_at      TIMESTAMP,
            created_by      INTEGER,
            updated_by      INTEGER,
            CONSTRAINT uq_product_category_code_pos UNIQUE (code, pos_fk),
            CONSTRAINT fk_product_category_pos FOREIGN KEY (pos_fk) REFERENCES admin.admin_pos(id),
            CONSTRAINT fk_product_category_created_by FOREIGN KEY (created_by) REFERENCES admin.admin_users(id),
            CONSTRAINT fk_product_category_updated_by FOREIGN KEY (updated_by) REFERENCES admin.admin_users(id)
        );
        RAISE NOTICE 'Table business.data_product_category created';
    ELSE
        RAISE NOTICE 'Table business.data_product_category already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin.admin_privileges WHERE code = 'PRODUCT_CATEGORY_READ') THEN
        INSERT INTO admin.admin_privileges (code, name) VALUES
            ('PRODUCT_CATEGORY_READ',   'Lecture des catégories produits'),
            ('PRODUCT_CATEGORY_CREATE', 'Création des catégories produits'),
            ('PRODUCT_CATEGORY_UPDATE', 'Modification des catégories produits'),
            ('PRODUCT_CATEGORY_DELETE', 'Suppression des catégories produits');
        RAISE NOTICE 'ProductCategory privileges inserted';
    ELSE
        RAISE NOTICE 'ProductCategory privileges already exist';
    END IF;
END $$;
