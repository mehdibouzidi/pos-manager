-- Script pour supprimer les changesets Liquibase échoués
-- À exécuter manuellement dans la base de données avant de relancer l'application

-- 1. Supprimer toutes les entrées du changeset qui ont échoué
DELETE FROM public.databasechangelog 
WHERE filename = 'db/changelog/V2025_11_21__commercial_item_type_migration.xml';

-- 2. Supprimer la colonne 'type' qui a été ajoutée par le premier changeset
ALTER TABLE business.op_customer_delivery_note_item DROP COLUMN IF EXISTS type;
ALTER TABLE business.op_customer_attachment_item DROP COLUMN IF EXISTS type;
ALTER TABLE business.op_customer_invoice_item DROP COLUMN IF EXISTS type;

-- 3. Vérifier que les entrées ont été supprimées
SELECT * FROM public.databasechangelog 
WHERE filename = 'db/changelog/V2025_11_21__commercial_item_type_migration.xml';

-- Le résultat devrait être vide (0 rows)
