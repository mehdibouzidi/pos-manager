import { CommonCriteria } from '../commoncriteria';

export class StockMovementCriteria extends CommonCriteria {
    id: number;
    productId: number;
    categoryId: number;
    posId: number;
    movementType: string;
    reason: string;

    constructor() {
        super();
        this.id = null;
        this.productId = null;
        this.categoryId = null;
        this.posId = null;
        this.movementType = null;
        this.reason = null;
    }
}
