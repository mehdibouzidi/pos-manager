-- liquibase formatted sql
-- changeset posadmin:V2051_create_caisse_sessions_table splitStatements:false

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'business' AND table_name = 'data_caisse_session') THEN
        CREATE TABLE business.data_caisse_session (
            id                  SERIAL PRIMARY KEY,
            opened_at           TIMESTAMP NOT NULL,
            closed_at           TIMESTAMP,
            opening_balance     NUMERIC(19, 4) NOT NULL,
            closing_balance     NUMERIC(19, 4),
            total_sales_amount  NUMERIC(19, 4),
            total_sales_count   INTEGER,
            first_order_number  INTEGER,
            last_order_number   INTEGER,
            variance            NUMERIC(19, 4),
            status              VARCHAR(20) NOT NULL DEFAULT 'OPEN',
            notes               VARCHAR(500),
            pos_fk              INTEGER,
            created_at          TIMESTAMP,
            updated_at          TIMESTAMP,
            created_by          INTEGER,
            updated_by          INTEGER,
            CONSTRAINT fk_caisse_session_pos        FOREIGN KEY (pos_fk)      REFERENCES admin.admin_pos(id),
            CONSTRAINT fk_caisse_session_created_by FOREIGN KEY (created_by)  REFERENCES admin.admin_users(id),
            CONSTRAINT fk_caisse_session_updated_by FOREIGN KEY (updated_by)  REFERENCES admin.admin_users(id)
        );
        RAISE NOTICE 'Table business.data_caisse_session created';
    ELSE
        RAISE NOTICE 'Table business.data_caisse_session already exists';
    END IF;
END $$;
