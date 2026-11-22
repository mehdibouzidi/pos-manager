export class GlobalPayload<T> {
    elements: T[];
    totalNumberOfElements: number;
    totalNumberOfPages: number;
    /** Sum over all the elements matching the filters (sales only). */
    totalAmount?: number;
}