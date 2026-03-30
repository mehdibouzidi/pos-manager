import { PrivilegePayload } from "./privilegepayload";

export class ProfilPayload {
    id: number;
    code: string;
    name: string;
    privileges: Array<PrivilegePayload>;
    
    constructor(){
        this.id = null;
        this.code = null;
        this.name = '';
    }
}