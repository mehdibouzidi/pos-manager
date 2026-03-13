import { PrivilegePayload } from "./privilegepayload";

export class ProfilPayload {
    id: number | null;
    code: string | null;
    name: string;
    privileges: Array<PrivilegePayload> | undefined;
    
    constructor(){
        this.id = null;
        this.code = null;
        this.name = '';
    }
}