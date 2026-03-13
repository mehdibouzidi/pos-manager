import { GlobalUserDatePayload } from "./GlobalUserDatePayload";

export class GlobalDataPayload extends GlobalUserDatePayload{
    code: string;
    name: string;
    
    constructor(code: string | null = null, name: string | '' = '' ){
        super();
        this.code = code;
        this.name = name;
    }
}