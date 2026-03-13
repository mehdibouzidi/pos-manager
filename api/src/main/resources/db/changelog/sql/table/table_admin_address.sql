DO
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'admin'
                   AND table_name = 'admin_address') THEN
CREATE TABLE admin.admin_address (
                                    id SERIAL PRIMARY KEY,
                                    created_by INT4 NULL,
                                    latitude FLOAT8 NOT NULL,
                                    longitude FLOAT8 NOT NULL,
                                    updated_by INT4 NULL,
                                    created_at TIMESTAMPTZ(6) NULL,
                                    updated_at TIMESTAMPTZ(6) NULL,
                                    address VARCHAR(255) NULL,
                                    city VARCHAR(255) NULL,
                                    country VARCHAR(255) NULL,
                                    postal_code VARCHAR(255) NULL,
                                    town VARCHAR(255) NULL
);

ALTER TABLE admin.admin_address
    OWNER TO posadmin;
END IF;
END
$$;