import { GlobalDatePayload } from "./GlobalDatePayload";

export class GlobalUserDatePayload extends GlobalDatePayload{
    createdBy: string;
    updatedBy: string;
    
    constructor(){
        super();
        this.createdBy = null;
        this.updatedBy = '';
    }
}