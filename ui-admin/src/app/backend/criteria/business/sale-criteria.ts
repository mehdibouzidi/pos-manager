import { CommonCriteria } from '../commoncriteria';

/** Filters of the ticket list (one row per sale). */
export class SaleCriteria extends CommonCriteria {
    posId: number = null;
    caisseSessionId: number = null;
    /** Tickets containing this product / a product of this category */
    productId: number = null;
    categoryId: number = null;
    /** DINE_IN or TAKEAWAY */
    orderType: string = null;
    /** Server order number or number printed by an offline till */
    orderNumber: number = null;
    /** yyyy-MM-dd, inclusive */
    fromDate: string = null;
    toDate: string = null;

    constructor() {
        super();
        this.sortColumn = 'saleDate';
        this.sort = 'DESC';
    }
}
