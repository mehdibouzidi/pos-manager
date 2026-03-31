export class SessionLogPayload {
    id: number;
    userId: number;
    userUsername: string;
    userFullName: string;
    posId: number;
    posCode: string;
    posName: string;
    ipAddress: string;
    loginAt: string;
    createdAt: string;

    constructor() {
        this.id = null;
        this.userId = null;
        this.userUsername = null;
        this.userFullName = null;
        this.posId = null;
        this.posCode = null;
        this.posName = null;
        this.ipAddress = null;
        this.loginAt = null;
        this.createdAt = null;
    }
}
