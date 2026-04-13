-- liquibase formatted sql
-- changeset posadmin:V2053_add_caisse_session_fk_to_sale splitStatements:false

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'business'
          AND table_name   = 'data_sale'
          AND column_name  = 'caisse_session_fk'
    ) THEN
        ALTER TABLE business.data_sale
            ADD COLUMN caisse_session_fk INTEGER,
            ADD CONSTRAINT fk_sale_caisse_session
                FOREIGN KEY (caisse_session_fk)
                REFERENCES business.data_caisse_session(id);
        RAISE NOTICE 'Column caisse_session_fk added to business.data_sale';
    ELSE
        RAISE NOTICE 'Column caisse_session_fk already exists on business.data_sale';
    END IF;
END $$;
