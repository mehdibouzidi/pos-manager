-- liquibase formatted sql
-- changeset posadmin:V2056_add_displayed_in_pos splitStatements:false

-- Affichage dans l'interface caisse : une catégorie masquée masque tous ses produits.
-- Tout reste affiché par défaut.

ALTER TABLE business.data_product_category
    ADD COLUMN IF NOT EXISTS displayed_in_pos BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE business.data_product
    ADD COLUMN IF NOT EXISTS displayed_in_pos BOOLEAN NOT NULL DEFAULT TRUE;
