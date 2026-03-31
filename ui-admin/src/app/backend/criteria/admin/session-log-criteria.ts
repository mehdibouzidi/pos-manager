import { CommonCriteria } from '../commoncriteria';

export class SessionLogCriteria extends CommonCriteria {
    id: number;
    userId: number;
    posId: number;
    ipAddress: string;

    constructor() {
        super();
        this.id = null;
        this.userId = null;
        this.posId = null;
        this.ipAddress = null;
    }
}
