export class StorePayload {
    id: number;
    code: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    active: boolean;

    constructor() {
        this.id = null;
        this.code = null;
        this.name = '';
        this.address = null;
        this.phone = null;
        this.email = null;
        this.active = true;
    }
}
