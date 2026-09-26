-- liquibase formatted sql
-- changeset posadmin:V2054_offline_sync_idempotency splitStatements:false

-- Idempotence de la synchro hors-ligne :
--  * data_sale.local_id / local_order_number : identifiant et n° de ticket générés par la caisse
--  * data_caisse_session.local_id / close_local_id : identifiants des opérations d'ouverture / fermeture
--  * une seule session OPEN par POS

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'business' AND table_name = 'data_sale' AND column_name = 'local_id') THEN
        ALTER TABLE business.data_sale
            ADD COLUMN local_id           VARCHAR(64),
            ADD COLUMN local_order_number INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'business' AND table_name = 'data_caisse_session' AND column_name = 'local_id') THEN
        ALTER TABLE business.data_caisse_session
            ADD COLUMN local_id       VARCHAR(64),
            ADD COLUMN close_local_id VARCHAR(64);
    END IF;

    CREATE UNIQUE INDEX IF NOT EXISTS ux_sale_pos_local_id
        ON business.data_sale (pos_fk, local_id) WHERE local_id IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS ux_caisse_session_pos_local_id
        ON business.data_caisse_session (pos_fk, local_id) WHERE local_id IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS ux_caisse_session_pos_close_local_id
        ON business.data_caisse_session (pos_fk, close_local_id) WHERE close_local_id IS NOT NULL;

    IF EXISTS (SELECT pos_fk FROM business.data_caisse_session
               WHERE status = 'OPEN' GROUP BY pos_fk HAVING COUNT(*) > 1) THEN
        RAISE WARNING 'Plusieurs sessions OPEN pour un même POS : index ux_caisse_session_one_open non créé. Fermez les doublons puis relancez.';
    ELSE
        CREATE UNIQUE INDEX IF NOT EXISTS ux_caisse_session_one_open
            ON business.data_caisse_session (pos_fk) WHERE status = 'OPEN';
    END IF;

    CREATE INDEX IF NOT EXISTS ix_sale_pos_date      ON business.data_sale (pos_fk, sale_date);
    CREATE INDEX IF NOT EXISTS ix_sale_session       ON business.data_sale (caisse_session_fk);
    CREATE INDEX IF NOT EXISTS ix_sale_item_sale     ON business.data_sale_item (sale_fk);
END $$;
