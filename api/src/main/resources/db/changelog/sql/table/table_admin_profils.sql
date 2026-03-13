DO
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'admin'
                   AND table_name = 'admin_profils') THEN
CREATE TABLE admin.admin_profils (
                               id SERIAL PRIMARY KEY,
                               code VARCHAR(255) NOT NULL UNIQUE,
                               name VARCHAR(50) NOT NULL,
                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               created_by VARCHAR(255),
                               updated_by VARCHAR(255)
);

ALTER TABLE admin.admin_profils
    OWNER to posadmin;
END IF;
END
$$;