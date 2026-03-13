DO
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'admin'
                   AND table_name = 'admin_user_profils') THEN
CREATE TABLE admin.admin_user_profils (
                                    user_id BIGINT NOT NULL,
                                    profil_id BIGINT NOT NULL,
                                    FOREIGN KEY (user_id) REFERENCES admin.admin_users(id),
                                    FOREIGN KEY (profil_id) REFERENCES admin.admin_profils(id)
);

ALTER TABLE admin.admin_user_profils
    OWNER to posadmin;
END IF;
END
$$;