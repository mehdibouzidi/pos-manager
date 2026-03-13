import { CommonCriteria } from "../commoncriteria";

export class StoreCriteria extends CommonCriteria {
    id: number;
    code: string;
    name: string;
    active: boolean;

    constructor() {
        super();
        this.id = null;
        this.code = null;
        this.name = null;
        this.active = null;
    }
}
