export class ProductPayload {
    maxStock: number;
    minStock: number;
    wholesalePrice: number | null;
    retailPrice: number | null;
    currentStock: number;
    categoryId: number | null;
    categoryName: string | null;
    photo: string | null;
    subCategory: any;
    unit: any;
    type: any;

    constructor(){
        this.maxStock = 0;
        this.minStock = 0;
        this.wholesalePrice = null;
        this.retailPrice = null;
        this.currentStock = 0;
        this.categoryId = null;
        this.categoryName = null;
        this.photo = null;
        this.subCategory = null;
        this.unit = null;
        this.type = null;
    }
}
