import { BaseGlobalDataPayload } from "./base-business-payload";

export class ProductCategoryPayload extends BaseGlobalDataPayload {
    photo: string; // base64 encoded
    /** Shown in the till; a hidden category hides all its products. */
    displayedInPos: boolean;

    constructor() {
        super();
        this.photo = null;
        this.displayedInPos = true;
    }
}
