export class CaisseSessionPayload {
    id: number;
    openedAt: string;
    closedAt: string;
    openingBalance: number;
    closingBalance: number;
    totalSalesAmount: number;
    totalSalesCount: number;
    firstOrderNumber: number;
    lastOrderNumber: number;
    variance: number;
    status: string;
    notes: string;
    posId: number;
    posCode: string;
    posName: string;
    createdByFullName: string;
    createdAt: string;
    updatedAt: string;

    constructor() {
        this.id = null;
        this.openedAt = null;
        this.closedAt = null;
        this.openingBalance = null;
        this.closingBalance = null;
        this.totalSalesAmount = null;
        this.totalSalesCount = null;
        this.firstOrderNumber = null;
        this.lastOrderNumber = null;
        this.variance = null;
        this.status = null;
        this.notes = null;
        this.posId = null;
        this.posCode = null;
        this.posName = null;
        this.createdByFullName = null;
        this.createdAt = null;
        this.updatedAt = null;
    }
}
