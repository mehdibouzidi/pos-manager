DO
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'admin'
                   AND table_name = 'admin_users') THEN
CREATE TABLE admin.admin_users (
                             id SERIAL PRIMARY KEY,
                             username VARCHAR(50) NOT NULL UNIQUE,
                             password VARCHAR(100) NOT NULL,
                             first_name VARCHAR(40) NOT NULL,
                             last_name VARCHAR(40) NOT NULL,
                             sex VARCHAR(20),
                             phone_number VARCHAR(15),
                             email VARCHAR(30),
                             picture OID,
                             address_id BIGINT,
                             created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             FOREIGN KEY (address_id) REFERENCES admin.admin_address(id)
);

ALTER TABLE admin.admin_users
    OWNER to posadmin;
END IF;
END
$$;