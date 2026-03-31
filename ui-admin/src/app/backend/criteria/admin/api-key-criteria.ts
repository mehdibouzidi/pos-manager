import { CommonCriteria } from '../commoncriteria';

export class ApiKeyCriteria extends CommonCriteria {
    id: number;
    posId: number;
    description: string;
    active: boolean;

    constructor() {
        super();
        this.id = null;
        this.posId = null;
        this.description = null;
        this.active = null;
    }
}
