DO
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'admin'
                   AND table_name = 'profil_privileges') THEN
CREATE TABLE admin.admin_profil_privileges (
                                         profil_id BIGINT NOT NULL,
                                         privilege_id BIGINT NOT NULL,
                                         FOREIGN KEY (profil_id) REFERENCES admin.admin_profils(id),
                                         FOREIGN KEY (privilege_id) REFERENCES admin.admin_privileges(id)
);

ALTER TABLE admin.admin_profil_privileges
    OWNER to posadmin;
END IF;
END
$$;