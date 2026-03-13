-- =====================================================
-- Add store_fk column to business tables for multi-tenancy
-- This allows filtering data by store
-- =====================================================

-- List of business tables that need store_fk column
-- NOTE: Configuration data tables (like data_payment_type) are EXCLUDED
-- because they are global and managed by SuperAdmin only
-- Excluded: data_payment_type (configuration data)

DO
$$
DECLARE
    tbl_name TEXT;
    tables_list TEXT[] := ARRAY[
        'data_product',
        'data_supplier', 
        'data_customer',
        -- 'data_payment_type' is EXCLUDED - it's configuration data (global, no store)
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
        -- Check if table exists and store_fk column doesn't exist
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'business' AND information_schema.tables.table_name = tbl_name
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'business' 
            AND information_schema.columns.table_name = tbl_name 
            AND column_name = 'store_fk'
        ) THEN
            -- Add store_fk column
            EXECUTE format('ALTER TABLE business.%I ADD COLUMN store_fk INTEGER', tbl_name);
            
            -- Add foreign key constraint
            EXECUTE format('ALTER TABLE business.%I ADD CONSTRAINT fk_%I_store FOREIGN KEY (store_fk) REFERENCES admin.admin_stores(id)', tbl_name, tbl_name);
            
            -- Create index for faster queries
            EXECUTE format('CREATE INDEX idx_%I_store_fk ON business.%I(store_fk)', tbl_name, tbl_name);
            
            RAISE NOTICE 'Added store_fk to business.%', tbl_name;
        ELSE
            RAISE NOTICE 'Table business.% does not exist or already has store_fk', tbl_name;
        END IF;
    END LOOP;
END
$$;
