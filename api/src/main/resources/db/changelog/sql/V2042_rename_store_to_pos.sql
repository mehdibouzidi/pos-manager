-- =====================================================
-- Rename Store → POS throughout the database
-- V2042: rename admin_stores → admin_pos,
--        rename store_fk → pos_fk in all tables,
--        update privilege codes STORE_* → POS_*
-- =====================================================

-- ── 1. Rename admin_stores table ─────────────────────
DO
$$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'admin' AND table_name = 'admin_stores')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables
                       WHERE table_schema = 'admin' AND table_name = 'admin_pos') THEN

        ALTER TABLE admin.admin_stores RENAME TO admin_pos;

        -- Rename indexes
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'admin' AND indexname = 'idx_admin_stores_code') THEN
            ALTER INDEX admin.idx_admin_stores_code RENAME TO idx_admin_pos_code;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'admin' AND indexname = 'idx_admin_stores_active') THEN
            ALTER INDEX admin.idx_admin_stores_active RENAME TO idx_admin_pos_active;
        END IF;

        RAISE NOTICE 'Table admin.admin_stores renamed to admin.admin_pos';
    ELSE
        RAISE NOTICE 'Rename admin_stores → admin_pos skipped (already done or does not exist)';
    END IF;
END
$$;

-- ── 2. Rename store_fk → pos_fk in admin_users ───────
DO
$$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'admin' AND table_name = 'admin_users' AND column_name = 'store_fk') THEN

        -- Drop old FK constraint
        ALTER TABLE admin.admin_users DROP CONSTRAINT IF EXISTS fk_admin_users_store;

        -- Rename column
        ALTER TABLE admin.admin_users RENAME COLUMN store_fk TO pos_fk;

        -- Re-add FK constraint pointing to renamed table
        ALTER TABLE admin.admin_users
            ADD CONSTRAINT fk_admin_users_pos
            FOREIGN KEY (pos_fk) REFERENCES admin.admin_pos(id);

        -- Rename index
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'admin' AND indexname = 'idx_admin_users_store_fk') THEN
            ALTER INDEX admin.idx_admin_users_store_fk RENAME TO idx_admin_users_pos_fk;
        END IF;

        RAISE NOTICE 'admin_users.store_fk renamed to pos_fk';
    ELSE
        RAISE NOTICE 'admin_users.store_fk already renamed or does not exist';
    END IF;
END
$$;

-- ── 3. Rename store_fk → pos_fk in business tables ───
DO
$$
DECLARE
    tbl_name TEXT;
    tables_list TEXT[] := ARRAY[
        'data_product',
        'data_supplier',
        'data_customer',
        'data_payment_data',
        'data_commercial_product',
        'data_address',
        'op_nomenclature',
        'op_purchase',
        'op_purchase_item',
        'data_supplier_activity'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables_list
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'business'
              AND information_schema.columns.table_name = tbl_name
              AND column_name = 'store_fk'
        ) THEN
            -- Drop old FK + index
            EXECUTE format('ALTER TABLE business.%I DROP CONSTRAINT IF EXISTS fk_%I_store', tbl_name, tbl_name);
            EXECUTE format('DROP INDEX IF EXISTS business.idx_%I_store_fk', tbl_name);

            -- Rename column
            EXECUTE format('ALTER TABLE business.%I RENAME COLUMN store_fk TO pos_fk', tbl_name);

            -- Re-add FK
            EXECUTE format(
                'ALTER TABLE business.%I ADD CONSTRAINT fk_%I_pos FOREIGN KEY (pos_fk) REFERENCES admin.admin_pos(id)',
                tbl_name, tbl_name
            );

            -- New index
            EXECUTE format('CREATE INDEX idx_%I_pos_fk ON business.%I(pos_fk)', tbl_name, tbl_name);

            RAISE NOTICE 'business.%.store_fk renamed to pos_fk', tbl_name;
        ELSE
            RAISE NOTICE 'business.% already renamed or does not exist', tbl_name;
        END IF;
    END LOOP;
END
$$;

-- ── 4. Update privilege codes STORE_* → POS_* ────────
DO
$$
BEGIN
    -- Only run if old codes still exist
    IF EXISTS (SELECT 1 FROM admin.admin_privileges WHERE code = 'STORE_READ') THEN
        UPDATE admin.admin_privileges SET code = 'POS_READ',   name = 'Lecture des points de vente'      WHERE code = 'STORE_READ';
        UPDATE admin.admin_privileges SET code = 'POS_CREATE', name = 'Création des points de vente'     WHERE code = 'STORE_CREATE';
        UPDATE admin.admin_privileges SET code = 'POS_UPDATE', name = 'Modification des points de vente' WHERE code = 'STORE_UPDATE';
        UPDATE admin.admin_privileges SET code = 'POS_DELETE', name = 'Suppression des points de vente'  WHERE code = 'STORE_DELETE';
        RAISE NOTICE 'Privilege codes updated STORE_* → POS_*';
    ELSE
        RAISE NOTICE 'Privilege codes already updated or do not exist';
    END IF;
END
$$;
