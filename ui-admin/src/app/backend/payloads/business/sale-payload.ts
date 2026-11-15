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
    items: SaleItemPayload[];
    createdByFullName: string;
    createdByUsername: string;
    createdAt: string;
}
