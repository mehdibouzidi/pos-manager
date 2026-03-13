-- =============================================
-- Migration: V2041_remove_product_category_columns.sql
-- Description: Remove sub_category_fk, type_fk, unit_fk columns from business.data_product
-- =============================================

-- Drop foreign key constraints first (if they exist)
ALTER TABLE IF EXISTS business.data_product
    DROP CONSTRAINT IF EXISTS fk_product_sub_category;

ALTER TABLE IF EXISTS business.data_product
    DROP CONSTRAINT IF EXISTS fk_product_type;

ALTER TABLE IF EXISTS business.data_product
    DROP CONSTRAINT IF EXISTS fk_product_unit;

-- Drop any additional constraint names that might exist
ALTER TABLE IF EXISTS business.data_product
    DROP CONSTRAINT IF EXISTS fkb68cppgqvh3o3ye6xsqbhijr2;

ALTER TABLE IF EXISTS business.data_product
    DROP CONSTRAINT IF EXISTS fkhkf16rtxrl7cq7ynh9jf6hj61;

ALTER TABLE IF EXISTS business.data_product
    DROP CONSTRAINT IF EXISTS fkk5rkwsplwobavxsgr5lnb23y3;

-- Drop the columns
ALTER TABLE IF EXISTS business.data_product
    DROP COLUMN IF EXISTS sub_category_fk;

ALTER TABLE IF EXISTS business.data_product
    DROP COLUMN IF EXISTS type_fk;

ALTER TABLE IF EXISTS business.data_product
    DROP COLUMN IF EXISTS unit_fk;
