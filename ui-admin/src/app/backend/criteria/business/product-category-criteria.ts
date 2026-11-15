import { CommonCriteria } from "../commoncriteria";

export class ProductCategoryCriteria extends CommonCriteria {
    id: number;
    code: string;
    name: string;
    /** null = all; true/false = shown/hidden in the till. */
    displayedInPos: boolean;

    constructor() {
        super();
        this.id = null;
        this.code = null;
        this.name = null;
        this.displayedInPos = null;
    }
}
