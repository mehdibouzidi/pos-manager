export class ApiKeyPayload {
    id: number;
    posId: number;
    posCode: string;
    posName: string;
    keyValue: string;
    description: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    createdByFullName: string;
    updatedByFullName: string;

    constructor() {
        this.id = null;
        this.posId = null;
        this.posCode = null;
        this.posName = null;
        this.keyValue = null;
        this.description = null;
        this.active = true;
        this.createdAt = null;
        this.updatedAt = null;
        this.createdByFullName = null;
        this.updatedByFullName = null;
    }
}
