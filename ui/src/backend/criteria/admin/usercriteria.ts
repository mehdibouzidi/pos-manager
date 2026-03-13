import { CommonCriteria } from "../commoncriteria";

export class UserCriteria extends CommonCriteria{
    id: number | null;
    firstName: string | null;
    lastName: string | null;
    serviceId: number | null;
    positionId: number | null;
    positionStatusId: number | null;

    constructor(){
        super();
        this.id = null;
        this.firstName = null;
        this.lastName = null;
        this.serviceId = null;
        this.positionId = null;
        this.positionStatusId = null;
    }
}