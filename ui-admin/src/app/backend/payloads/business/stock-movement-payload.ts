export class StockMovementPayload {
    id: number;
    productId: number;
    productCode: string;
    productName: string;
    categoryId: number;
    categoryName: string;
    posId: number;
    posCode: string;
    posName: string;
    movementType: string;
    quantity: number;
    reason: string;
    movementDate: string;
    createdAt: string;
    updatedAt: string;
    createdByFullName: string;
    updatedByFullName: string;

    constructor() {
        this.id = null;
        this.productId = null;
        this.productCode = null;
        this.productName = null;
        this.categoryId = null;
        this.categoryName = null;
        this.posId = null;
        this.posCode = null;
        this.posName = null;
        this.movementType = null;
        this.quantity = null;
        this.reason = null;
        this.movementDate = null;
        this.createdAt = null;
        this.updatedAt = null;
        this.createdByFullName = null;
        this.updatedByFullName = null;
    }
}
