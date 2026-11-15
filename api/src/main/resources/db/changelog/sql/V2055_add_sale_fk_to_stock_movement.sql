-- liquibase formatted sql
-- changeset posadmin:V2055_add_sale_fk_to_stock_movement splitStatements:false

-- Lien mouvement de stock (SALE) → vente, pour retrouver la caisse d'une ligne de vente.
-- Rattrapage des mouvements existants : même POS, reason = 'Vente #<order_number>',
-- créé dans les 30 s suivant la vente (même transaction) ; la vente la plus proche gagne.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'business' AND table_name = 'data_stock_movement' AND column_name = 'sale_fk') THEN
        ALTER TABLE business.data_stock_movement
            ADD COLUMN sale_fk INTEGER,
            ADD CONSTRAINT fk_stock_movement_sale
                FOREIGN KEY (sale_fk) REFERENCES business.data_sale(id);
    END IF;

    CREATE INDEX IF NOT EXISTS ix_stock_movement_sale ON business.data_stock_movement (sale_fk);

    UPDATE business.data_stock_movement m
       SET sale_fk = (SELECT s.id FROM business.data_sale s
                       WHERE s.pos_fk IS NOT DISTINCT FROM m.pos_fk
                         AND m.reason = 'Vente #' || s.order_number
                         AND s.created_at <= m.created_at
                         AND m.created_at - s.created_at < interval '30 seconds'
                       ORDER BY m.created_at - s.created_at
                       LIMIT 1)
     WHERE m.movement_type = 'SALE' AND m.sale_fk IS NULL;
END $$;
