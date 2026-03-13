--liquibase formatted sql
--changeset dev:V2037-composite-unique-constraints splitStatements:false

-- =====================================================
-- Add composite unique constraints (code, store_fk) to business tables
-- This replaces simple unique constraints on code column
-- to allow same code in different stores
-- =====================================================

DO
$$
DECLARE
    tbl_name TEXT;
    constraint_name TEXT;
    tables_list TEXT[] := ARRAY[
        'data_product',
        'data_supplier_activity'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables_list
    LOOP
        -- Check if table exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'business' AND information_schema.tables.table_name = tbl_name
        ) THEN
            -- Drop existing unique constraint on code if exists (try common naming patterns)
            EXECUTE format('ALTER TABLE business.%I DROP CONSTRAINT IF EXISTS %I_code_key', tbl_name, tbl_name);
            EXECUTE format('ALTER TABLE business.%I DROP CONSTRAINT IF EXISTS uk_%I_code', tbl_name, REPLACE(tbl_name, 'data_', ''));
            
            -- Add composite unique constraint (code + store_fk)
            constraint_name := 'uk_' || REPLACE(tbl_name, 'data_', '') || '_code_store';
            EXECUTE format('ALTER TABLE business.%I ADD CONSTRAINT %I UNIQUE (code, store_fk)', tbl_name, constraint_name);
            
            RAISE NOTICE 'Added composite unique constraint to business.%', tbl_name;
        ELSE
            RAISE NOTICE 'Table business.% does not exist, skipping', tbl_name;
        END IF;
    END LOOP;
END
$$;

--rollback DO $$ BEGIN RAISE NOTICE 'Rollback not implemented'; END $$;
