import { CommonCriteria } from '../commoncriteria';

export class CaisseSessionCriteria extends CommonCriteria {
    posId: number;
    status: string;
    fromDate: string;
    toDate: string;

    constructor() {
        super();
        this.posId = null;
        this.status = null;
        this.fromDate = null;
        this.toDate = null;
    }
}
