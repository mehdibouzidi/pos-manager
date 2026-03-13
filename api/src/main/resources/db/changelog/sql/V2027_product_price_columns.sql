--liquibase formatted sql

--changeset mystore:V2027_product_price_columns_01
--comment: Add wholesale_price and retail_price columns to product table
ALTER TABLE business.data_product ADD COLUMN wholesale_price NUMERIC(19,4);
ALTER TABLE business.data_product ADD COLUMN retail_price NUMERIC(19,4);

COMMENT ON COLUMN business.data_product.wholesale_price IS 'Prix de Gros';
COMMENT ON COLUMN business.data_product.retail_price IS 'Prix détail de vente';

--rollback ALTER TABLE business.data_product DROP COLUMN IF EXISTS wholesale_price;
--rollback ALTER TABLE business.data_product DROP COLUMN IF EXISTS retail_price;

--changeset mystore:V2027_product_price_columns_02
--comment: Drop lifeDuration and vat columns from product table
ALTER TABLE business.data_product DROP COLUMN IF EXISTS life_duration;
ALTER TABLE business.data_product DROP COLUMN IF EXISTS vat;

--rollback ALTER TABLE business.data_product ADD COLUMN life_duration INTEGER;
--rollback ALTER TABLE business.data_product ADD COLUMN vat DOUBLE PRECISION;
