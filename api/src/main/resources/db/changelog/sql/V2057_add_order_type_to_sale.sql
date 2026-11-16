-- liquibase formatted sql
-- changeset posadmin:V2057_add_order_type_to_sale splitStatements:false

-- Mention choisie à l'encaissement et imprimée sur le ticket : DINE_IN (à table) ou TAKEAWAY (à emporter).
-- NULL pour les ventes antérieures.

ALTER TABLE business.data_sale
    ADD COLUMN IF NOT EXISTS order_type VARCHAR(20);
