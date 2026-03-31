import { BaseGlobalDataPayload } from "./base-business-payload";

export class ProductCategoryPayload extends BaseGlobalDataPayload {
    photo: string; // base64 encoded

    constructor() {
        super();
        this.photo = null;
    }
}
