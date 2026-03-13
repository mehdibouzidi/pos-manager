export class PrivilegePayload {
    id: number | null;
    code: string | null;
    name: string;
    
    constructor(){
        this.id = null;
        this.code = null;
        this.name = '';
    }
}