import { BaseGlobalDataPayload } from "./base-business-payload";

export class ProductPayload extends BaseGlobalDataPayload {
    maxStock: number;
    minStock: number;
    wholesalePrice: number; // Prix de Gros
    retailPrice: number; // Prix détail de vente
    currentStock: number; // Stock réel = achat - vente
    subCategory: any;
    unit: any;
    type: any;

    constructor(){
        super();
        this.maxStock = 0;
        this.minStock = 0;
        this.wholesalePrice = null;
        this.retailPrice = null;
        this.currentStock = 0;
        this.subCategory = null;
        this.unit = null;
        this.type = null;
    }
}
