/**
 * Base payload class for business entities with audit and store information
 */
export class BaseBusinessPayload {
    id: number;
    createdAt: string;
    updatedAt: string;
    createdById: number;
    createdByUsername: string;
    createdByFullName: string;
    updatedById: number;
    updatedByUsername: string;
    updatedByFullName: string;
    
    // Store information for multi-tenancy
    storeId: number;
    storeCode: string;
    storeName: string;

    constructor() {
        this.id = null;
        this.createdAt = null;
        this.updatedAt = null;
        this.createdById = null;
        this.createdByUsername = null;
        this.createdByFullName = null;
        this.updatedById = null;
        this.updatedByUsername = null;
        this.updatedByFullName = null;
        this.storeId = null;
        this.storeCode = null;
        this.storeName = null;
    }
}

/**
 * Base payload class for business entities with code and name (GlobalData equivalent)
 */
export class BaseGlobalDataPayload extends BaseBusinessPayload {
    code: string;
    name: string;

    constructor() {
        super();
        this.code = null;
        this.name = null;
    }

    get fullName(): string {
        return `${this.code} - ${this.name}`;
    }
}
