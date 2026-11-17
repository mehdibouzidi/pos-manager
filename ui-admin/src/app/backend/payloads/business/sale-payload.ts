export interface SaleItemPayload {
    productId: number;
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

/** A ticket as returned by the API (read-only in the admin). */
export interface SalePayload {
    id: number;
    orderNumber: number;
    localOrderNumber: number;
    saleDate: string;
    totalAmount: number;
    paymentMethod: string;
    /** DINE_IN (à table) or TAKEAWAY (à emporter); null for sales made before the choice existed */
    orderType: string;
    items: SaleItemPayload[];
    posName: string;
    caisseSessionId: number;
    caisseSessionStatus: string;
    caisseSessionOpenedAt: string;
    createdByFullName: string;
    createdByUsername: string;
    createdAt: string;
}
