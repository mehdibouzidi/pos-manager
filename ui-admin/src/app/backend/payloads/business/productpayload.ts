import { BaseGlobalDataPayload } from "./base-business-payload";

export class ProductPayload extends BaseGlobalDataPayload {
    maxStock: number;
    minStock: number;
    retailPrice: number; // Prix détail de vente
    currentStock: number; // Stock réel = achat - vente
    categoryId: number;
    categoryName: string;
    photo: string; // base64 encoded
    /** Shown in the till. */
    displayedInPos: boolean;
    /** Read-only: false when the category is hidden (the product is then hidden too). */
    categoryDisplayedInPos: boolean;

    constructor(){
        super();
        this.maxStock = 0;
        this.minStock = 0;
        this.retailPrice = null;
        this.currentStock = 0;
        this.categoryId = null;
        this.categoryName = null;
        this.photo = null;
        this.displayedInPos = true;
        this.categoryDisplayedInPos = null;
    }
}
