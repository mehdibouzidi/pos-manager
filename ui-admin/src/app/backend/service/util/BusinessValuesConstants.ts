export class BusinessValuesConstants{
    static readonly PRODUCT_IN_TYPE: Array<string> = ["Achat", "Retour en Stock"];
    static readonly PRODUCT_OUT_TYPE: Array<string> = ["Consommation", "Perte"];
    static readonly CUSTOMER_ORDER_STATUS: Array<string> = ["Brouillon", "Confirmé", "Partiellement livré", "Livré", "Annulé"];
    static readonly CUSTOMER_DELIVERY_NOTE_STATUS: Array<string> = ["Brouillon", "Émis", "En cours de livraison", "Livré", "Retourné", "Annulé"];
    static readonly CUSTOMER_ATTACHMENT_STATUS: Array<string> = ["Brouillon", "Clôturé", "Facturé", "Annulé"];
    static readonly CUSTOMER_INVOICE_STATUS: Array<string> = ["Brouillon", "Émise", "Partiellement payée", "Payée", "Annulée"];
    static readonly CUSTOMER_CONTRACT_STATUS: Array<string> = ["Brouillon", "Actif", "Expiré", "Résilié"];
    static readonly EMPLOYEE_CONTRACT_STATUS: Array<string> = ["Brouillon", "Actif", "Expiré", "Résilié"];

    // Types de produit utilisés dans Bons de Livraison, Attachements et Factures
    static readonly PRODUCT_STANDARD_TYPES: Array<string> = ["Repas", "Collation", "Prestation de Service"];


    static readonly COMPANY_NAME: string = "SARL EL AFIA CATERING";
}
