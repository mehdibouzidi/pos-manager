INSERT INTO admin.admin_privileges
    (id, code, name, created_at, updated_at, created_by, updated_by) VALUES

-- Privilèges pour category
(DEFAULT, 'CATEGORY_READ', 'Lire la catégorie', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'CATEGORY_CREATE', 'Créer une catégorie', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'CATEGORY_UPDATE', 'Mettre à jour une catégorie', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'CATEGORY_DELETE', 'Supprimer une catégorie', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour cooking_technique
(DEFAULT, 'COOKING_TECHNIQUE_READ', 'Lire la technique de cuisson', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'COOKING_TECHNIQUE_CREATE', 'Créer une technique de cuisson', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'COOKING_TECHNIQUE_UPDATE', 'Mettre à jour une technique de cuisson', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'COOKING_TECHNIQUE_DELETE', 'Supprimer une technique de cuisson', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour instruction
(DEFAULT, 'INSTRUCTION_READ', 'Lire une instruction', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'INSTRUCTION_CREATE', 'Créer une instruction', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'INSTRUCTION_UPDATE', 'Mettre à jour une instruction', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'INSTRUCTION_DELETE', 'Supprimer une instruction', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour allergen
(DEFAULT, 'ALLERGEN_READ', 'Lire un allergène', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'ALLERGEN_CREATE', 'Créer un allergène', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'ALLERGEN_UPDATE', 'Mettre à jour un allergène', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'ALLERGEN_DELETE', 'Supprimer un allergène', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour brand
(DEFAULT, 'BRAND_READ', 'Lire la marque', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'BRAND_CREATE', 'Créer une marque', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'BRAND_UPDATE', 'Mettre à jour une marque', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'BRAND_DELETE', 'Supprimer une marque', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour commercial_prevision
(DEFAULT, 'COMMERCIAL_PREVISION_READ', 'Lire une prévision commerciale', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'COMMERCIAL_PREVISION_CREATE', 'Créer une prévision commerciale', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'COMMERCIAL_PREVISION_UPDATE', 'Mettre à jour une prévision commerciale', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'COMMERCIAL_PREVISION_DELETE', 'Supprimer une prévision commerciale', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour consumer
(DEFAULT, 'CONSUMER_READ', 'Lire un consommateur', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'CONSUMER_CREATE', 'Créer un consommateur', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'CONSUMER_UPDATE', 'Mettre à jour un consommateur', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'CONSUMER_DELETE', 'Supprimer un consommateur', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour kitchen_technique
(DEFAULT, 'KITCHEN_TECHNIQUE_READ', 'Lire une technique de cuisine', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'KITCHEN_TECHNIQUE_CREATE', 'Créer une technique de cuisine', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'KITCHEN_TECHNIQUE_UPDATE', 'Mettre à jour une technique de cuisine', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'KITCHEN_TECHNIQUE_DELETE', 'Supprimer une technique de cuisine', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour menu
(DEFAULT, 'MENU_READ', 'Lire un menu', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'MENU_CREATE', 'Créer un menu', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'MENU_UPDATE', 'Mettre à jour un menu', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'MENU_DELETE', 'Supprimer un menu', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour order_reception
(DEFAULT, 'ORDER_RECEPTION_READ', 'Lire la réception de commande', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'ORDER_RECEPTION_CREATE', 'Créer une réception de commande', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'ORDER_RECEPTION_UPDATE', 'Mettre à jour la réception de commande', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'ORDER_RECEPTION_DELETE', 'Supprimer la réception de commande', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour order
(DEFAULT, 'ORDER_READ', 'Lire une commande', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'ORDER_CREATE', 'Créer une commande', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'ORDER_UPDATE', 'Mettre à jour une commande', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'ORDER_DELETE', 'Supprimer une commande', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour product_gamme
(DEFAULT, 'PRODUCT_GAMME_READ', 'Lire la gamme de produits', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCT_GAMME_CREATE', 'Créer une gamme de produits', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCT_GAMME_UPDATE', 'Mettre à jour une gamme de produits', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCT_GAMME_DELETE', 'Supprimer une gamme de produits', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour SUPPLIER
(DEFAULT, 'SUPPLIER_READ', 'Lire un fournisseur', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_CREATE', 'Créer un fournisseur', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_UPDATE', 'Mettre à jour un fournisseur', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_DELETE', 'Supprimer un fournisseur', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),


-- Privilèges pour SUPPLIER_ORDER
(DEFAULT, 'SUPPLIER_ORDER_READ', 'Lire une commande fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_ORDER_CREATE', 'Créer une commande fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_ORDER_UPDATE', 'Mettre à jour une commande fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_ORDER_DELETE', 'Supprimer une commande fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour SUPPLIER_DELIVERY_NOTE
(DEFAULT, 'SUPPLIER_DELIVERY_NOTE_READ', 'Lire un bon de livraison fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_DELIVERY_NOTE_CREATE', 'Créer un bon de livraison fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_DELIVERY_NOTE_UPDATE', 'Mettre à jour un bon de livraison fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_DELIVERY_NOTE_DELETE', 'Supprimer un bon de livraison fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour SUPPLIER_RECEPTION_NOTE
(DEFAULT, 'SUPPLIER_RECEPTION_NOTE_READ', 'Lire une réception de commande fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_RECEPTION_NOTE_CREATE', 'Créer une réception de commande fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_RECEPTION_NOTE_UPDATE', 'Mettre à jour une réception de commande fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_RECEPTION_NOTE_DELETE', 'Supprimer une réception de commande fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour SERVICE_SUPPLIER_RECEPTION_NOTE
(DEFAULT, 'SERVICE_SUPPLIER_RECEPTION_NOTE_READ', 'Lire une réception de commande fournisseur de service', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SERVICE_SUPPLIER_RECEPTION_NOTE_CREATE', 'Créer une réception de commande fournisseur de service', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SERVICE_SUPPLIER_RECEPTION_NOTE_UPDATE', 'Mettre à jour une réception de commande fournisseur de service', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SERVICE_SUPPLIER_RECEPTION_NOTE_DELETE', 'Supprimer une réception de commande fournisseur de service', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour SERVICE_CUSTOMER_RECEPTION_NOTE
(DEFAULT, 'SERVICE_CUSTOMER_RECEPTION_NOTE_READ', 'Lire une réception de commande client de service', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SERVICE_CUSTOMER_RECEPTION_NOTE_CREATE', 'Créer une réception de commande client de service', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SERVICE_CUSTOMER_RECEPTION_NOTE_UPDATE', 'Mettre à jour une réception de commande client de service', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SERVICE_CUSTOMER_RECEPTION_NOTE_DELETE', 'Supprimer une réception de commande client de service', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour SUPPLIER_INVOICE
(DEFAULT, 'SUPPLIER_INVOICE_READ', 'Lire une facture fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_INVOICE_CREATE', 'Créer une facture fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_INVOICE_UPDATE', 'Mettre à jour une facture fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_INVOICE_DELETE', 'Supprimer une facture fournisseur', '2025-07-31 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),


-- Privilèges pour payment_type
(DEFAULT, 'PAYMENT_TYPE_READ', 'Lire un type de paiement', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PAYMENT_TYPE_CREATE', 'Créer un type de paiement', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PAYMENT_TYPE_UPDATE', 'Mettre à jour un type de paiement', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PAYMENT_TYPE_DELETE', 'Supprimer un type de paiement', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour product_out
(DEFAULT, 'PRODUCT_OUT_READ', 'Lire un produit sortant', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCT_OUT_CREATE', 'Créer un produit sortant', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCT_OUT_UPDATE', 'Mettre à jour un produit sortant', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCT_OUT_DELETE', 'Supprimer un produit sortant', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour payment_data
(DEFAULT, 'PAYMENT_DATA_READ', 'Lire des données de paiement', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PAYMENT_DATA_CREATE', 'Créer des données de paiement', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PAYMENT_DATA_UPDATE', 'Mettre à jour des données de paiement', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PAYMENT_DATA_DELETE', 'Supprimer des données de paiement', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour product_type
(DEFAULT, 'PRODUCT_TYPE_READ', 'Lire le type de produit', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCT_TYPE_CREATE', 'Créer un type de produit', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCT_TYPE_UPDATE', 'Mettre à jour un type de produit', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCT_TYPE_DELETE', 'Supprimer un type de produit', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour product
(DEFAULT, 'PRODUCT_READ', 'Lire un produit', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCT_CREATE', 'Créer un produit', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCT_UPDATE', 'Mettre à jour un produit', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCT_DELETE', 'Supprimer un produit', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour supplier_reception_note_item
(DEFAULT, 'SUPPLIER_RECEPTION_NOTE_ITEM_READ', 'Lire un article de réception fournisseur', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_RECEPTION_NOTE_ITEM_CREATE', 'Créer un article de réception fournisseur', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_RECEPTION_NOTE_ITEM_UPDATE', 'Mettre à jour un article de réception fournisseur', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUPPLIER_RECEPTION_NOTE_ITEM_DELETE', 'Supprimer un article de réception fournisseur','2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour purchase
(DEFAULT, 'PURCHASE_READ', 'Lire un achat', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PURCHASE_CREATE', 'Créer un achat', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PURCHASE_UPDATE', 'Mettre à jour un achat', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PURCHASE_DELETE', 'Supprimer un achat', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour recipe_type
(DEFAULT, 'RECIPE_TYPE_READ', 'Lire un type de recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_TYPE_CREATE', 'Créer un type de recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_TYPE_UPDATE', 'Mettre à jour un type de recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_TYPE_DELETE', 'Supprimer un type de recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour menu_type
(DEFAULT, 'MENU_TYPE_READ', 'Lire un type de menu', '2025-11-16 10:00:00.00000', '2025-11-16 10:00:00.00000', 2, 2),
(DEFAULT, 'MENU_TYPE_CREATE', 'Créer un type de menu', '2025-11-16 10:00:00.00000', '2025-11-16 10:00:00.00000', 2, 2),
(DEFAULT, 'MENU_TYPE_UPDATE', 'Mettre à jour un type de menu', '2025-11-16 10:00:00.00000', '2025-11-16 10:00:00.00000', 2, 2),
(DEFAULT, 'MENU_TYPE_DELETE', 'Supprimer un type de menu', '2025-11-16 10:00:00.00000', '2025-11-16 10:00:00.00000', 2, 2),

-- Privilèges pour purchase_request_menus
(DEFAULT, 'PURCHASE_REQUEST_MENUS_READ', 'Lire les demandes d''achat de menus', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PURCHASE_REQUEST_MENUS_CREATE', 'Créer des demandes d''achat de menus', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PURCHASE_REQUEST_MENUS_UPDATE', 'Mettre à jour les demandes d''achat de menus', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PURCHASE_REQUEST_MENUS_DELETE', 'Supprimer les demandes d''achat de menus', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour recipe_allergens
(DEFAULT, 'RECIPE_ALLERGENS_READ', 'Lire les allergènes d''une recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_ALLERGENS_CREATE', 'Créer des allergènes pour une recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_ALLERGENS_UPDATE', 'Mettre à jour les allergènes d''une recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_ALLERGENS_DELETE', 'Supprimer les allergènes d''une recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour unit
(DEFAULT, 'UNIT_READ', 'Lire une unité de mesure', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'UNIT_CREATE', 'Créer une unité de mesure', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'UNIT_UPDATE', 'Mettre à jour une unité de mesure', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'UNIT_DELETE', 'Supprimer une unité de mesure', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour sub_category
(DEFAULT, 'SUB_CATEGORY_READ', 'Lire une sous-catégorie', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUB_CATEGORY_CREATE', 'Créer une sous-catégorie', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUB_CATEGORY_UPDATE', 'Mettre à jour une sous-catégorie', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'SUB_CATEGORY_DELETE', 'Supprimer une sous-catégorie', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour used_technique
(DEFAULT, 'USED_TECHNIQUE_READ', 'Lire une technique de préparation', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'USED_TECHNIQUE_CREATE', 'Créer une technique de préparation', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'USED_TECHNIQUE_UPDATE', 'Mettre à jour une technique de préparation', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'USED_TECHNIQUE_DELETE', 'Supprimer une technique de préparation', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour production_setup
(DEFAULT, 'PRODUCTION_SETUP_READ', 'Lire la mise en place', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCTION_SETUP_CREATE', 'Créer une mise en place', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCTION_SETUP_UPDATE', 'Mettre à jour une mise en place', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCTION_SETUP_DELETE', 'Supprimer une mise en place', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour cost_calculation
(DEFAULT, 'COST_CALCULATION_READ', 'Lire le calcul de coût', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'COST_CALCULATION_CREATE', 'Créer un calcul de coût', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'COST_CALCULATION_UPDATE', 'Mettre à jour un calcul de coût', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'COST_CALCULATION_DELETE', 'Supprimer un calcul de coût', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour production_need
(DEFAULT, 'PRODUCTION_NEED_READ', 'Lire une expression de besoin', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCTION_NEED_CREATE', 'Créer une expression de besoin', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCTION_NEED_UPDATE', 'Mettre à jour une expression de besoin', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCTION_NEED_DELETE', 'Supprimer une', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PRODUCTION_NEED_VIEW_REPORT', 'Lire le Rapport d''une expression de besoin', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour recipe_category
(DEFAULT, 'RECIPE_CATEGORY_READ', 'Lire une catégorie de recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_CATEGORY_CREATE', 'Créer une catégorie de recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_CATEGORY_UPDATE', 'Mettre à jour une catégorie de recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_CATEGORY_DELETE', 'Supprimer une catégorie de recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour store
(DEFAULT, 'STORE_READ', 'Lire un magasin', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'STORE_CREATE', 'Créer un magasin', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'STORE_UPDATE', 'Mettre à jour un magasin', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'STORE_DELETE', 'Supprimer un magasin', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour purchase_request
(DEFAULT, 'PURCHASE_REQUEST_READ', 'Lire une demande d''achat', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PURCHASE_REQUEST_CREATE', 'Créer une demande d''achat', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PURCHASE_REQUEST_UPDATE', 'Mettre à jour une demande d''achat', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'PURCHASE_REQUEST_DELETE', 'Supprimer une demande d''achat', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour company_service
(DEFAULT, 'COMPANY_SERVICE_READ', 'Lire un service d''entreprise', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'COMPANY_SERVICE_CREATE', 'Créer un service d''entreprise', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'COMPANY_SERVICE_UPDATE', 'Mettre à jour un service d''entreprise', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'COMPANY_SERVICE_DELETE', 'Supprimer un service d''entreprise', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour employee_position
(DEFAULT, 'EMPLOYEE_POSITION_READ', 'Lire un poste d''employé', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'EMPLOYEE_POSITION_CREATE', 'Créer un poste d''employé', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'EMPLOYEE_POSITION_UPDATE', 'Mettre à jour un poste d''employé', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'EMPLOYEE_POSITION_DELETE', 'Supprimer un poste d''employé', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour employee_position_status
(DEFAULT, 'EMPLOYEE_CONTRACT_TYPE_READ', 'Lire un type de contrat d''employé', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'EMPLOYEE_CONTRACT_TYPE_CREATE', 'Créer un type de contrat d''employé', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'EMPLOYEE_CONTRACT_TYPE_UPDATE', 'Mettre à jour un type de contrat d''employé', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'EMPLOYEE_CONTRACT_TYPE_DELETE', 'Supprimer un type de contrat d''employé', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour recipe
(DEFAULT, 'RECIPE_READ', 'Lire une recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_CREATE', 'Créer une recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_UPDATE', 'Mettre à jour une recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_DELETE', 'Supprimer une recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour employee
(DEFAULT, 'EMPLOYEE_READ', 'Lire un employé', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'EMPLOYEE_CREATE', 'Créer un employé', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'EMPLOYEE_UPDATE', 'Mettre à jour un employé', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'EMPLOYEE_DELETE', 'Supprimer un employé', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),

-- Privilèges pour recipe_production_mode
(DEFAULT, 'RECIPE_PRODUCTION_MODE_READ', 'Lire le mode de production d''une recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_PRODUCTION_MODE_CREATE', 'Créer un mode de production de recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_PRODUCTION_MODE_UPDATE', 'Mettre à jour le mode de production d''une recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),
(DEFAULT, 'RECIPE_PRODUCTION_MODE_DELETE', 'Supprimer le mode de production d''une recette', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2),


-- Privilèges pour CUSTOMER
(DEFAULT, 'CUSTOMER_READ', 'Lire le Client', '2025-05-18 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_CREATE', 'Créer un Client', '2025-05-18 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_UPDATE', 'Mettre à jour un Client', '2025-05-18 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_DELETE', 'Supprimer un Client', '2025-05-18 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),

-- Privilèges pour DELIVERY_PLANIFICATION
(DEFAULT, 'DELIVERY_PLANIFICATION_READ', 'Lire le Planning de Livraison', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'DELIVERY_PLANIFICATION_CREATE', 'Créer un Planning de Livraison', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'DELIVERY_PLANIFICATION_UPDATE', 'Mettre à jour un Planning de Livraison', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'DELIVERY_PLANIFICATION_DELETE', 'Supprimer un Planning de Livraison', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),

-- Privilèges pour CUSTOMER_QUOTATION
(DEFAULT, 'CUSTOMER_QUOTATION_READ', 'Lire un devis client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_QUOTATION_CREATE', 'Créer un devis client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_QUOTATION_UPDATE', 'Mettre à jour un devis client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_QUOTATION_DELETE', 'Supprimer un devis client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),

-- Privilèges pour CUSTOMER_PROFORMA_INVOICE
(DEFAULT, 'CUSTOMER_PROFORMA_INVOICE_READ', 'Lire une facture proforma client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_PROFORMA_INVOICE_CREATE', 'Créer une facture proforma client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_PROFORMA_INVOICE_UPDATE', 'Mettre à jour une facture proforma client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_PROFORMA_INVOICE_DELETE', 'Supprimer une facture proforma client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),

-- Privilèges pour CUSTOMER_ORDER
(DEFAULT, 'CUSTOMER_ORDER_READ', 'Lire une commande client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_ORDER_CREATE', 'Créer une commande client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_ORDER_UPDATE', 'Mettre à jour une commande client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_ORDER_DELETE', 'Supprimer une commande client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),

-- Privilèges pour CUSTOMER_DELIVERY_NOTE
(DEFAULT, 'CUSTOMER_DELIVERY_NOTE_READ', 'Lire un bon de livraison client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_DELIVERY_NOTE_CREATE', 'Créer un bon de livraison client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_DELIVERY_NOTE_UPDATE', 'Mettre à jour un bon de livraison client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_DELIVERY_NOTE_DELETE', 'Supprimer un bon de livraison client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),

-- Privilèges pour SERVICE_ISSUE_NOTE
(DEFAULT, 'SERVICE_ISSUE_NOTE_READ', 'Lire un bon d''incident de service', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'SERVICE_ISSUE_NOTE_CREATE', 'Créer un bon d''incident de service', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'SERVICE_ISSUE_NOTE_UPDATE', 'Mettre à jour un bon d''incident de service', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'SERVICE_ISSUE_NOTE_DELETE', 'Supprimer un bon d''incident de service', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),

-- Privilèges pour CUSTOMER_ATTACHMENT
(DEFAULT, 'CUSTOMER_ATTACHMENT_READ', 'Lire un attachement client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_ATTACHMENT_CREATE', 'Créer un attachement client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_ATTACHMENT_UPDATE', 'Mettre à jour un attachement client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_ATTACHMENT_DELETE', 'Supprimer un attachement client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),

-- Privilèges pour CUSTOMER_INVOICE
(DEFAULT, 'CUSTOMER_INVOICE_READ', 'Lire une facture client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_INVOICE_CREATE', 'Créer une facture client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_INVOICE_UPDATE', 'Mettre à jour une facture client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_INVOICE_DELETE', 'Supprimer une facture client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),

-- Privilèges pour CUSTOMER_PAYMENT
(DEFAULT, 'CUSTOMER_PAYMENT_READ', 'Lire un paiement client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_PAYMENT_CREATE', 'Créer un paiement client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_PAYMENT_UPDATE', 'Mettre à jour un paiement client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CUSTOMER_PAYMENT_DELETE', 'Supprimer un paiement client', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),

-- Privilèges pour COMMERCIAL_PRODUCT
(DEFAULT, 'COMMERCIAL_PRODUCT_READ', 'Lire un produit commercial', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'COMMERCIAL_PRODUCT_CREATE', 'Créer un produit commercial', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'COMMERCIAL_PRODUCT_UPDATE', 'Mettre à jour un produit commercial', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'COMMERCIAL_PRODUCT_DELETE', 'Supprimer un produit commercial', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),

-- Privilèges pour CATALOGUE_SERVICE
(DEFAULT, 'CATALOGUE_SERVICE_READ', 'Lire un service catalogue', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CATALOGUE_SERVICE_CREATE', 'Créer un service catalogue', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CATALOGUE_SERVICE_UPDATE', 'Mettre à jour un service catalogue', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),
(DEFAULT, 'CATALOGUE_SERVICE_DELETE', 'Supprimer un service catalogue', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),

-- Dashboards
(DEFAULT, 'DASHBOARD_SUPPLY_READ', 'Afficher le Dashboard Approvisionnement', '2025-05-20 10:00:00.00000', '2025-05-18 10:00:00.00000', 2, 2),

(DEFAULT, 'RESET_PASSWORD', 'Changer Mot de Passe', '2025-04-26 10:00:00.00000', '2025-04-26 10:00:00.00000', 2, 2);
