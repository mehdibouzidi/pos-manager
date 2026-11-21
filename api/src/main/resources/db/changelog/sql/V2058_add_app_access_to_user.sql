-- liquibase formatted sql
-- changeset posadmin:V2058_add_app_access_to_user splitStatements:false

-- Applications auxquelles un utilisateur peut se connecter : caisse (ui) et/ou back-office (ui-admin).
-- Les utilisateurs existants gardent l'accès aux deux.

ALTER TABLE admin.admin_users
    ADD COLUMN IF NOT EXISTS pos_access BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE admin.admin_users
    ADD COLUMN IF NOT EXISTS admin_access BOOLEAN NOT NULL DEFAULT TRUE;
