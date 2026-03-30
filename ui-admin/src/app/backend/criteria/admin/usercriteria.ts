import { CommonCriteria } from "../commoncriteria";

export class UserCriteria extends CommonCriteria{
    id: number;
    firstName: string;
    lastName: string;
    serviceId: number;
    positionId: number;
    positionStatusId: number;

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